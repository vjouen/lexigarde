/**
 * Bloc "Formulaires" : collecte de données personnelles, consentement,
 * information sur la finalité.
 *
 * Fondements : RGPD art. 13 (information au moment de la collecte),
 * art. 5-1-c (minimisation), art. 6 et 7 (base légale et consentement).
 * Nuance importante : une case de consentement n'est pas toujours
 * requise (la base légale peut être le contrat ou l'intérêt légitime),
 * mais l'information sur la finalité l'est toujours.
 */

import * as cheerio from "cheerio";
import type { BlockResult, Finding, RawScanData } from "../types";
import { scoreFromFindings } from "../score";

/** Détecte si un input collecte vraisemblablement une donnée personnelle. */
const PERSONAL_FIELD_PATTERN =
  /e?-?mail|courriel|t[eé]l[eé]phone|^tel$|phone|mobile|\bnom\b|prenom|pr[eé]nom|last.?name|first.?name|adresse|address|naissance|birth/i;

const PURPOSE_PATTERN =
  /finalit[eé]|vos donn[eé]es|donn[eé]es (personnelles|collect[eé]es)|politique de confidentialit[eé]|trait(ement|[eé]es?)|utilis[eé]e?s? (pour|afin|uniquement)|conform[eé]ment au rgpd|exercer vos droits/i;

interface FormAnalysis {
  index: number;
  personalFields: string[];
  hasCheckbox: boolean;
  hasPurposeText: boolean;
  hasPrivacyLink: boolean;
}

export function checkForms(raw: RawScanData): BlockResult {
  const findings: Finding[] = [];
  const $ = cheerio.load(raw.html);

  const analyses: FormAnalysis[] = [];

  $("form").each((index, formEl) => {
    const $form = $(formEl);
    const personalFields: string[] = [];

    $form.find("input, textarea").each((_, el) => {
      const $el = $(el);
      const type = ($el.attr("type") ?? "text").toLowerCase();
      if (["hidden", "submit", "button", "checkbox", "radio", "password"].includes(type)) return;

      const descriptor = [
        type,
        $el.attr("name") ?? "",
        $el.attr("id") ?? "",
        $el.attr("placeholder") ?? "",
        $el.attr("aria-label") ?? "",
      ].join(" ");

      if (type === "email" || type === "tel" || PERSONAL_FIELD_PATTERN.test(descriptor)) {
        personalFields.push($el.attr("name") ?? $el.attr("id") ?? type);
      }
    });

    if (personalFields.length === 0) return; // formulaire sans donnée perso (recherche, etc.)

    const formText = $form.text();
    analyses.push({
      index,
      personalFields,
      hasCheckbox: $form.find('input[type="checkbox"]').length > 0,
      hasPurposeText: PURPOSE_PATTERN.test(formText),
      hasPrivacyLink:
        $form.find('a[href*="confidentialit"], a[href*="privacy"], a[href*="donnees"]').length > 0,
    });
  });

  if (analyses.length === 0) {
    findings.push({
      id: "forms.none",
      severity: "pass",
      title: "Aucun formulaire collectant des données personnelles détecté sur cette page",
      explanation:
        "La page analysée ne contient pas de formulaire collectant des données personnelles identifiables. Réserve : les formulaires injectés en JavaScript ou présents sur d'autres pages ne sont pas visibles par ce scan.",
      recommendation: "",
    });
  } else {
    const total = analyses.length;
    const withoutInfo = analyses.filter((a) => !a.hasPurposeText && !a.hasPrivacyLink);
    const withoutConsent = analyses.filter((a) => !a.hasCheckbox);

    findings.push({
      id: "forms.detected",
      severity: "pass",
      title: `${total} formulaire(s) collectant des données personnelles détecté(s)`,
      explanation: `Champs identifiés : ${analyses.map((a) => a.personalFields.join(", ")).join(" | ")}`,
      recommendation: "",
    });

    if (withoutInfo.length > 0) {
      findings.push({
        id: "forms.no-purpose-info",
        severity: "critical",
        title: `${withoutInfo.length} formulaire(s) sans information sur l'usage des données`,
        explanation:
          "Aucune mention de finalité ni lien vers la politique de confidentialité n'a été trouvé à proximité de ces formulaires. Le RGPD (art. 13) impose d'informer la personne au moment même de la collecte : qui traite, pour quoi, combien de temps, avec quels droits.",
        recommendation:
          "Ajouter sous chaque formulaire une mention d'information courte (finalité, destinataire, droits) avec un lien vers la politique de confidentialité complète.",
        evidence: withoutInfo.map((a) => `formulaire #${a.index + 1} (${a.personalFields.join(", ")})`).join(" ; "),
      });
    }

    if (withoutConsent.length > 0) {
      findings.push({
        id: "forms.no-consent-checkbox",
        severity: "info",
        title: `${withoutConsent.length} formulaire(s) sans case à cocher de consentement`,
        explanation:
          "L'absence de case n'est pas forcément une non-conformité : si le traitement repose sur l'exécution d'un contrat ou une demande de la personne (ex : formulaire de contact), le consentement n'est pas la base légale requise. En revanche, une case décochée par défaut est obligatoire pour tout usage secondaire (newsletter, prospection).",
        recommendation:
          "Identifier la base légale de chaque formulaire. Ajouter une case de consentement explicite et décochée par défaut pour tout envoi commercial ou usage non strictement lié à la demande.",
        evidence: withoutConsent.map((a) => `formulaire #${a.index + 1}`).join(" ; "),
      });
    }
  }

  return {
    id: "forms",
    label: "Formulaires",
    score: scoreFromFindings(findings),
    findings,
  };
}
