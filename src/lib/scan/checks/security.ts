/**
 * Bloc "Sécurité technique" : HTTPS, headers de sécurité, flags cookies.
 *
 * Fondement : RGPD art. 32 (sécurité du traitement) impose des mesures
 * techniques appropriées. Les recommandations de headers viennent du
 * guide ANSSI "Recommandations pour la sécurisation des sites web" et
 * des bonnes pratiques OWASP Secure Headers.
 */

import type { BlockResult, Finding, RawScanData } from "../types";
import { scoreFromFindings } from "../score";

export function checkSecurity(raw: RawScanData): BlockResult {
  const findings: Finding[] = [];
  const h = raw.headers;

  // --- HTTPS ---
  if (raw.finalUrl.startsWith("http://")) {
    findings.push({
      id: "security.no-https",
      severity: "critical",
      title: "Le site est servi en HTTP non chiffré",
      explanation:
        "Toutes les données échangées (y compris les données personnelles saisies dans les formulaires) circulent en clair et peuvent être interceptées. Le RGPD (art. 32) impose le chiffrement des données en transit dès lors que des données personnelles sont traitées.",
      recommendation:
        "Installer un certificat TLS (gratuit via Let's Encrypt) et servir tout le site en HTTPS.",
    });
  } else if (raw.httpRedirectsToHttps === false) {
    findings.push({
      id: "security.http-no-redirect",
      severity: "critical",
      title: "La version HTTP du site ne redirige pas vers HTTPS",
      explanation:
        "Le site répond en HTTP sans rediriger vers la version chiffrée. Un visiteur arrivant par un lien http:// navigue en clair : ses données (cookies, formulaires) sont interceptables. RGPD art. 32.",
      recommendation:
        "Configurer une redirection 301 systématique de http:// vers https:// au niveau du serveur web.",
    });
  } else if (raw.httpRedirectsToHttps === true) {
    findings.push({
      id: "security.https-ok",
      severity: "pass",
      title: "HTTPS forcé (redirection HTTP → HTTPS active)",
      explanation: "Le site chiffre les échanges et redirige les visiteurs HTTP vers HTTPS.",
      recommendation: "",
    });
  }

  // --- Headers de sécurité ---
  const hsts = h["strict-transport-security"];
  if (!hsts) {
    findings.push({
      id: "security.hsts-missing",
      severity: "warning",
      title: "Header HSTS absent",
      explanation:
        "Sans Strict-Transport-Security, le navigateur peut être forcé de repasser en HTTP lors d'une première visite (attaque SSL stripping). Recommandé par l'ANSSI et l'OWASP.",
      recommendation:
        'Ajouter le header "Strict-Transport-Security: max-age=31536000; includeSubDomains" sur toutes les réponses HTTPS.',
    });
  } else {
    findings.push({
      id: "security.hsts-ok",
      severity: "pass",
      title: "Header HSTS présent",
      explanation: "Le navigateur mémorise que ce site doit toujours être visité en HTTPS.",
      recommendation: "",
      evidence: hsts,
    });
  }

  if (!h["content-security-policy"]) {
    findings.push({
      id: "security.csp-missing",
      severity: "warning",
      title: "Header Content-Security-Policy absent",
      explanation:
        "Sans CSP, une faille XSS permet d'injecter n'importe quel script, y compris pour exfiltrer des données personnelles des visiteurs. La CSP limite drastiquement ce risque et donne aussi la maîtrise des scripts tiers chargés (lien direct avec la conformité cookies).",
      recommendation:
        "Définir une Content-Security-Policy listant explicitement les sources de scripts autorisées. Commencer en mode Report-Only pour ne rien casser.",
    });
  }

  if (!h["x-frame-options"] && !/frame-ancestors/i.test(h["content-security-policy"] ?? "")) {
    findings.push({
      id: "security.frame-missing",
      severity: "info",
      title: "Protection contre le clickjacking absente",
      explanation:
        "Sans X-Frame-Options ni directive frame-ancestors, le site peut être affiché dans une iframe invisible sur un site malveillant pour détourner les clics des visiteurs.",
      recommendation: 'Ajouter "X-Frame-Options: DENY" ou la directive CSP "frame-ancestors \'none\'".',
    });
  }

  if (!h["x-content-type-options"]) {
    findings.push({
      id: "security.nosniff-missing",
      severity: "info",
      title: "Header X-Content-Type-Options absent",
      explanation:
        "Sans ce header, certains navigateurs peuvent interpréter un fichier comme un type différent de celui annoncé (MIME sniffing), ce qui facilite certaines attaques XSS.",
      recommendation: 'Ajouter "X-Content-Type-Options: nosniff".',
    });
  }

  if (!h["referrer-policy"]) {
    findings.push({
      id: "security.referrer-missing",
      severity: "info",
      title: "Header Referrer-Policy absent",
      explanation:
        "Sans Referrer-Policy, l'URL complète des pages visitées (qui peut contenir des identifiants ou des informations personnelles) est transmise aux sites tiers vers lesquels pointent les liens.",
      recommendation: 'Ajouter "Referrer-Policy: strict-origin-when-cross-origin".',
    });
  }

  if (!h["permissions-policy"]) {
    findings.push({
      id: "security.permissions-missing",
      severity: "info",
      title: "Header Permissions-Policy absent",
      explanation:
        "Ce header désactive les API sensibles du navigateur (géolocalisation, caméra, micro) pour le site et ses iframes tierces, limitant la collecte de données non désirée.",
      recommendation: 'Ajouter "Permissions-Policy: geolocation=(), camera=(), microphone=()".',
    });
  }

  // --- Fuite d'information serveur ---
  const server = h["server"] ?? "";
  const powered = h["x-powered-by"] ?? "";
  const versionLeak = [server, powered].find((v) => /\d+\.\d+/.test(v));
  if (versionLeak) {
    findings.push({
      id: "security.version-leak",
      severity: "info",
      title: "Le serveur révèle sa version logicielle",
      explanation:
        "Annoncer la version exacte du serveur facilite la recherche de vulnérabilités connues correspondantes par un attaquant.",
      recommendation: "Masquer ou genericiser les headers Server et X-Powered-By.",
      evidence: versionLeak,
    });
  }

  // --- Flags des cookies ---
  const insecureCookies = raw.setCookies.filter((c) => !/;\s*secure/i.test(c));
  if (insecureCookies.length > 0 && raw.finalUrl.startsWith("https://")) {
    findings.push({
      id: "security.cookie-no-secure",
      severity: "warning",
      title: `${insecureCookies.length} cookie(s) sans attribut Secure`,
      explanation:
        "Un cookie sans attribut Secure peut être transmis en HTTP non chiffré et donc intercepté. S'il s'agit d'un cookie de session, cela permet de voler la session d'un utilisateur. RGPD art. 32.",
      recommendation: "Ajouter l'attribut Secure à tous les cookies.",
      evidence: insecureCookies.map((c) => c.split("=")[0]).join(", "),
    });
  }

  const noHttpOnly = raw.setCookies.filter((c) => !/;\s*httponly/i.test(c));
  if (noHttpOnly.length > 0) {
    findings.push({
      id: "security.cookie-no-httponly",
      severity: "info",
      title: `${noHttpOnly.length} cookie(s) sans attribut HttpOnly`,
      explanation:
        "Un cookie accessible en JavaScript peut être volé via une faille XSS. L'attribut HttpOnly protège les cookies qui n'ont pas besoin d'être lus côté client (sessions notamment).",
      recommendation: "Ajouter HttpOnly aux cookies qui n'ont pas besoin d'être lus par JavaScript.",
      evidence: noHttpOnly.map((c) => c.split("=")[0]).join(", "),
    });
  }

  return {
    id: "security",
    label: "Sécurité technique",
    score: scoreFromFindings(findings),
    findings,
  };
}
