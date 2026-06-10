/**
 * Bloc "Cookies et traceurs" : cookies déposés au chargement, scripts
 * tiers de tracking, présence d'un bandeau de consentement (CMP).
 *
 * Fondements : art. 82 de la loi Informatique et Libertés (transposition
 * ePrivacy), lignes directrices et recommandation CNIL cookies
 * (délibérations 2020-091 et 2020-092). Le consentement préalable est
 * requis pour tout traceur non strictement nécessaire.
 *
 * Limite v1 assumée : sans navigateur headless, on ne voit que les
 * cookies posés par le serveur (Set-Cookie) et les scripts présents dans
 * le HTML initial, pas les cookies déposés dynamiquement en JavaScript.
 */

import type { BlockResult, Finding, RawScanData } from "../types";
import { scoreFromFindings } from "../score";

/** Préfixes/noms de cookies de tracking connus (analytics, ads). */
const TRACKER_COOKIE_PATTERNS: RegExp[] = [
  /^_ga/, // Google Analytics
  /^_gid$/,
  /^_gat/,
  /^_gcl_/, // Google Ads
  /^_fbp$/, // Meta Pixel
  /^_fbc$/,
  /^_hj/, // Hotjar
  /^_pk_(id|ses)/, // Matomo (config non exemptée)
  /^_clck$/, // Microsoft Clarity
  /^_clsk$/,
  /^_uet(sid|vid)$/, // Microsoft Ads
  /^ajs_/, // Segment
  /^_ttp$/, // TikTok
  /^IDE$/, // DoubleClick
];

/** Cookies techniques généralement exemptés de consentement. */
const TECHNICAL_COOKIE_PATTERNS: RegExp[] = [
  /sess/i,
  /csrf|xsrf/i,
  /^__?cf/i, // Cloudflare
  /^AWSALB/i,
  /^JSESSIONID$/i,
  /^PHPSESSID$/i,
  /^wordpress_/i,
  /^wp-/i,
  /consent|cookie_?(notice|banner|law)/i, // le cookie qui mémorise le choix
  /^incap_|^visid_incap/i, // Imperva
];

/** Domaines de scripts tiers de tracking, avec nom lisible. */
const THIRD_PARTY_TRACKERS: { pattern: RegExp; name: string }[] = [
  { pattern: /googletagmanager\.com|google-analytics\.com/i, name: "Google Analytics / Tag Manager" },
  { pattern: /connect\.facebook\.net/i, name: "Meta Pixel" },
  { pattern: /analytics\.tiktok\.com/i, name: "TikTok Pixel" },
  { pattern: /static\.hotjar\.com|script\.hotjar\.com/i, name: "Hotjar" },
  { pattern: /snap\.licdn\.com/i, name: "LinkedIn Insight Tag" },
  { pattern: /clarity\.ms/i, name: "Microsoft Clarity" },
  { pattern: /doubleclick\.net|googlesyndication\.com/i, name: "Google Ads / DoubleClick" },
  { pattern: /criteo\.(com|net)/i, name: "Criteo" },
  { pattern: /bat\.bing\.com/i, name: "Microsoft Ads" },
  { pattern: /cdn\.segment\.com/i, name: "Segment" },
];

/** Plateformes de gestion du consentement (CMP) connues. */
const CMP_SIGNATURES: { pattern: RegExp; name: string }[] = [
  { pattern: /tarteaucitron/i, name: "tarteaucitron.js" },
  { pattern: /axeptio/i, name: "Axeptio" },
  { pattern: /cookiebot/i, name: "Cookiebot" },
  { pattern: /onetrust|optanon/i, name: "OneTrust" },
  { pattern: /didomi/i, name: "Didomi" },
  { pattern: /usercentrics/i, name: "Usercentrics" },
  { pattern: /complianz/i, name: "Complianz" },
  { pattern: /cookieyes/i, name: "CookieYes" },
  { pattern: /quantcast|__tcfapi/i, name: "Quantcast / TCF" },
  { pattern: /sirdata/i, name: "Sirdata" },
  { pattern: /orejime/i, name: "Orejime" },
];

/** Heuristique générique de bandeau cookies maison. */
const GENERIC_BANNER_PATTERN =
  /(id|class)\s*=\s*["'][^"']*(cookie[-_]?(banner|consent|notice|bar|popup)|consent[-_]?banner|cc[-_]?banner|gdpr)/i;

function cookieName(setCookie: string): string {
  return setCookie.split("=")[0].trim();
}

export function checkCookies(raw: RawScanData): BlockResult {
  const findings: Finding[] = [];
  const html = raw.html;

  // --- Détection CMP / bandeau ---
  const cmp = CMP_SIGNATURES.find((c) => c.pattern.test(html));
  const hasBanner = Boolean(cmp) || GENERIC_BANNER_PATTERN.test(html);

  // --- Scripts tiers de tracking ---
  const detectedTrackers = THIRD_PARTY_TRACKERS.filter((t) => t.pattern.test(html));

  // --- Cookies posés par le serveur dès le chargement ---
  const names = raw.setCookies.map(cookieName);
  const trackerCookies = names.filter((n) => TRACKER_COOKIE_PATTERNS.some((p) => p.test(n)));
  const unknownCookies = names.filter(
    (n) =>
      !TRACKER_COOKIE_PATTERNS.some((p) => p.test(n)) &&
      !TECHNICAL_COOKIE_PATTERNS.some((p) => p.test(n)),
  );

  if (trackerCookies.length > 0) {
    findings.push({
      id: "cookies.tracker-before-consent",
      severity: "critical",
      title: `${trackerCookies.length} cookie(s) de tracking déposé(s) dès le chargement, avant tout consentement`,
      explanation:
        "Ces cookies de mesure d'audience ou publicitaires sont posés par le serveur au premier chargement de la page, donc avant que le visiteur ait pu consentir. C'est une violation directe de l'art. 82 de la loi Informatique et Libertés, premier motif de sanction CNIL (amendes jusqu'à 150 M€ prononcées contre Google et Meta sur ce fondement).",
      recommendation:
        "Conditionner le dépôt de ces cookies au consentement explicite recueilli par le bandeau. Aucun traceur non essentiel ne doit être actif avant le clic sur « Accepter ».",
      evidence: trackerCookies.join(", "),
    });
  }

  if (unknownCookies.length > 0) {
    findings.push({
      id: "cookies.unknown-at-load",
      severity: "info",
      title: `${unknownCookies.length} cookie(s) non identifié(s) déposé(s) au chargement`,
      explanation:
        "Ces cookies sont posés avant consentement. S'ils sont strictement nécessaires au service (session, panier, sécurité), ils sont exemptés de consentement (CNIL, délibération 2020-091). Sinon, ils doivent attendre le consentement.",
      recommendation:
        "Vérifier la finalité de chacun de ces cookies et documenter leur exemption éventuelle dans la politique cookies.",
      evidence: unknownCookies.join(", "),
    });
  }

  if (detectedTrackers.length > 0) {
    if (hasBanner) {
      findings.push({
        id: "cookies.trackers-with-cmp",
        severity: "warning",
        title: `${detectedTrackers.length} traceur(s) tiers détecté(s), bandeau de consentement présent`,
        explanation:
          `Scripts détectés : ${detectedTrackers.map((t) => t.name).join(", ")}. Un bandeau est présent${cmp ? ` (${cmp.name})` : ""}, mais ce scan sans navigateur ne peut pas vérifier que les scripts attendent réellement le consentement avant de s'exécuter. C'est le point que la CNIL contrôle en priorité.`,
        recommendation:
          "Vérifier manuellement (onglet Réseau du navigateur, en navigation privée) qu'aucune requête vers ces domaines ne part avant le clic sur « Accepter », et qu'un refus est aussi simple qu'une acceptation.",
        evidence: detectedTrackers.map((t) => t.name).join(", "),
      });
    } else {
      findings.push({
        id: "cookies.trackers-no-cmp",
        severity: "critical",
        title: `${detectedTrackers.length} traceur(s) tiers détecté(s) sans aucun bandeau de consentement`,
        explanation:
          `Scripts détectés : ${detectedTrackers.map((t) => t.name).join(", ")}. Aucune plateforme de gestion du consentement ni bandeau cookies n'a été détecté dans la page. Si ces traceurs s'exécutent au chargement, les données des visiteurs sont collectées sans base légale (art. 82 loi Informatique et Libertés, RGPD art. 6).`,
        recommendation:
          "Mettre en place une CMP (tarteaucitron.js et Orejime sont gratuits et open source) et conditionner tous les scripts de tracking au consentement.",
        evidence: detectedTrackers.map((t) => t.name).join(", "),
      });
    }
  }

  if (detectedTrackers.length === 0 && trackerCookies.length === 0) {
    findings.push({
      id: "cookies.no-trackers",
      severity: "pass",
      title: "Aucun traceur tiers connu détecté dans le HTML initial",
      explanation:
        "Aucun script de tracking connu ni cookie publicitaire n'a été détecté au chargement. Réserve : les traceurs chargés dynamiquement en JavaScript ne sont pas visibles par ce scan.",
      recommendation: "",
    });
  }

  if (hasBanner) {
    findings.push({
      id: "cookies.banner-found",
      severity: "pass",
      title: cmp ? `Plateforme de consentement détectée : ${cmp.name}` : "Bandeau cookies détecté",
      explanation: "Le site dispose d'un mécanisme de recueil du consentement.",
      recommendation: "",
    });
  } else if (detectedTrackers.length === 0) {
    findings.push({
      id: "cookies.no-banner-no-trackers",
      severity: "info",
      title: "Pas de bandeau cookies détecté (mais pas de traceur non plus)",
      explanation:
        "Si le site n'utilise réellement aucun traceur soumis à consentement, le bandeau n'est pas obligatoire. Beaucoup de sites l'affichent par excès de prudence alors qu'une simple mention dans la politique de confidentialité suffit.",
      recommendation:
        "Confirmer qu'aucun traceur soumis à consentement n'est chargé dynamiquement (vérification manuelle avec l'onglet Réseau du navigateur).",
    });
  }

  return {
    id: "cookies",
    label: "Cookies et traceurs",
    score: scoreFromFindings(findings),
    findings,
  };
}
