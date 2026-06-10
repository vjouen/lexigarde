/**
 * Bloc "Mentions obligatoires" : mentions légales, politique de
 * confidentialité, politique cookies, contact DPO.
 *
 * Fondements :
 * - Mentions légales : LCEN (loi 2004-575) art. 6-III — obligation pour
 *   tout éditeur de site.
 * - Politique de confidentialité : RGPD art. 13 et 14 (information des
 *   personnes).
 * - DPO : RGPD art. 37 (obligatoire dans certains cas seulement).
 */

import * as cheerio from "cheerio";
import type { BlockResult, Finding, RawScanData } from "../types";
import { scoreFromFindings } from "../score";

interface LinkInfo {
  text: string;
  href: string;
}

function collectLinks(html: string): LinkInfo[] {
  const $ = cheerio.load(html);
  const links: LinkInfo[] = [];
  $("a[href]").each((_, el) => {
    links.push({
      text: $(el).text().trim().toLowerCase(),
      href: ($(el).attr("href") ?? "").toLowerCase(),
    });
  });
  return links;
}

function findLink(links: LinkInfo[], pattern: RegExp): LinkInfo | undefined {
  return links.find((l) => pattern.test(l.text) || pattern.test(l.href));
}

export function checkMentions(raw: RawScanData): BlockResult {
  const findings: Finding[] = [];
  const links = collectLinks(raw.html);
  const bodyText = raw.html.toLowerCase();

  // --- Mentions légales ---
  const legalLink = findLink(links, /mentions?.{0,3}l[eé]gales?|legal.?(notice|mentions)|imprint/i);
  if (legalLink) {
    findings.push({
      id: "mentions.legal-ok",
      severity: "pass",
      title: "Lien vers les mentions légales trouvé",
      explanation: "Le site comporte un lien vers ses mentions légales, comme l'exige la LCEN.",
      recommendation: "",
      evidence: legalLink.href,
    });
  } else {
    findings.push({
      id: "mentions.legal-missing",
      severity: "critical",
      title: "Aucun lien vers des mentions légales détecté",
      explanation:
        "La loi pour la confiance dans l'économie numérique (LCEN, art. 6-III) impose à tout éditeur de site d'afficher son identité (raison sociale, adresse, directeur de publication, hébergeur). L'absence de mentions légales est punissable jusqu'à 75 000 € d'amende pour une personne physique.",
      recommendation:
        'Créer une page "Mentions légales" accessible depuis toutes les pages (footer) avec l\'identité complète de l\'éditeur et de l\'hébergeur.',
    });
  }

  // --- Politique de confidentialité ---
  const privacyLink = findLink(
    links,
    /confidentialit[eé]|privacy|donn[eé]es.{0,3}personnelles|protection.{0,3}des.{0,3}donn[eé]es|vie.{0,3}priv[eé]e|rgpd/i,
  );
  if (privacyLink) {
    findings.push({
      id: "mentions.privacy-ok",
      severity: "pass",
      title: "Lien vers une politique de confidentialité trouvé",
      explanation: "Le site informe ses visiteurs sur le traitement de leurs données personnelles.",
      recommendation: "",
      evidence: privacyLink.href,
    });
  } else if (legalLink) {
    // Des mentions légales existent : l'information RGPD s'y trouve peut-être.
    // Sans suivre le lien (v2), on ne peut pas trancher : warning, pas critical.
    findings.push({
      id: "mentions.privacy-maybe-in-legal",
      severity: "warning",
      title: "Aucun lien distinct vers une politique de confidentialité",
      explanation:
        "Le site a des mentions légales mais aucun lien dédié à la protection des données n'a été trouvé sur cette page. L'information RGPD (art. 13 et 14 : finalités, base légale, durées de conservation, droits) se trouve peut-être dans les mentions légales, mais la CNIL recommande une page dédiée, clairement identifiable.",
      recommendation:
        "Vérifier que l'information RGPD complète existe (dans les mentions légales ou ailleurs) et la rendre accessible via un lien explicite type « Données personnelles » ou « Politique de confidentialité » dans le footer.",
    });
  } else {
    findings.push({
      id: "mentions.privacy-missing",
      severity: "critical",
      title: "Aucune politique de confidentialité détectée",
      explanation:
        "Le RGPD (art. 13 et 14) impose d'informer les personnes sur les traitements de leurs données : finalités, base légale, durées de conservation, droits. Si le site collecte la moindre donnée (formulaire, cookies, logs), cette information est obligatoire.",
      recommendation:
        'Publier une page "Politique de confidentialité" listant chaque traitement, sa finalité, sa base légale, la durée de conservation et les modalités d\'exercice des droits.',
    });
  }

  // --- Politique cookies ---
  const cookiesLink = findLink(links, /cookies?|traceurs?/i);
  if (cookiesLink) {
    findings.push({
      id: "mentions.cookies-ok",
      severity: "pass",
      title: "Lien vers une politique cookies trouvé",
      explanation: "Le site documente sa politique en matière de cookies et traceurs.",
      recommendation: "",
      evidence: cookiesLink.href,
    });
  } else {
    findings.push({
      id: "mentions.cookies-missing",
      severity: "warning",
      title: "Aucune page dédiée aux cookies détectée",
      explanation:
        "Les lignes directrices CNIL (délibération 2020-091) demandent une information complète sur les cookies : qui dépose quoi, pour quelle finalité, pour combien de temps. Cette information peut être intégrée à la politique de confidentialité, mais doit être facilement accessible.",
      recommendation:
        "Ajouter une page ou section cookies détaillant chaque traceur utilisé, accessible depuis le bandeau de consentement et le footer.",
    });
  }

  // --- Contact DPO ---
  const dpoMentioned =
    /\bdpo\b|d[eé]l[eé]gu[eé].{0,5}(a|à).{0,5}la.{0,5}protection.{0,5}des.{0,5}donn[eé]es/i.test(bodyText);
  if (dpoMentioned) {
    findings.push({
      id: "mentions.dpo-ok",
      severity: "pass",
      title: "Référence à un DPO trouvée sur la page",
      explanation: "Le site mentionne un délégué à la protection des données.",
      recommendation: "",
    });
  } else {
    findings.push({
      id: "mentions.dpo-info",
      severity: "info",
      title: "Aucune référence à un DPO sur la page d'accueil",
      explanation:
        "Le DPO n'est obligatoire que dans certains cas (RGPD art. 37 : organisme public, suivi régulier à grande échelle, données sensibles). S'il existe, ses coordonnées doivent être publiées et communiquées à la CNIL. Ce constat est informatif : le DPO peut être mentionné dans la politique de confidentialité.",
      recommendation:
        "Vérifier si l'organisme est soumis à l'obligation de désigner un DPO et, le cas échéant, publier un moyen de le contacter.",
    });
  }

  return {
    id: "mentions",
    label: "Mentions obligatoires",
    score: scoreFromFindings(findings),
    findings,
  };
}
