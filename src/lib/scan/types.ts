/**
 * Types partagés du moteur de scan Lexigarde.
 */

/** Données brutes récupérées lors du fetch de la page cible. */
export interface RawScanData {
  /** URL demandée par l'utilisateur (normalisée). */
  requestedUrl: string;
  /** URL finale après redirections. */
  finalUrl: string;
  /** Code HTTP de la réponse finale. */
  status: number;
  /** Headers de la réponse finale (clés en minuscules). */
  headers: Record<string, string>;
  /** Valeurs brutes des headers Set-Cookie. */
  setCookies: string[];
  /** HTML complet de la page. */
  html: string;
  /** La version HTTP du site redirige-t-elle vers HTTPS ? null si non testable. */
  httpRedirectsToHttps: boolean | null;
  /** Horodatage ISO du scan. */
  fetchedAt: string;
}

/** Sévérité d'un constat. */
export type Severity = "critical" | "warning" | "info" | "pass";

/** Un constat individuel produit par un bloc de checks. */
export interface Finding {
  /** Identifiant stable du check, ex: "security.hsts-missing". */
  id: string;
  severity: Severity;
  /** Titre court lisible, ex: "Header HSTS absent". */
  title: string;
  /** Explication pédagogique : risque concret + référence (article RGPD, reco CNIL/ANSSI). */
  explanation: string;
  /** Action corrective concrète. */
  recommendation: string;
  /** Élément de preuve (header observé, extrait HTML...), optionnel. */
  evidence?: string;
}

/** Résultat d'un bloc de checks (mentions, sécurité, cookies, formulaires). */
export interface BlockResult {
  /** Identifiant du bloc, ex: "security". */
  id: "mentions" | "security" | "cookies" | "forms";
  /** Nom affichable du bloc. */
  label: string;
  /** Score du bloc de 0 à 100. */
  score: number;
  findings: Finding[];
}

/** Résultat complet d'un scan. */
export interface ScanResult {
  requestedUrl: string;
  finalUrl: string;
  scannedAt: string;
  /** Score global de 0 à 100 (moyenne pondérée des blocs). */
  globalScore: number;
  blocks: BlockResult[];
}
