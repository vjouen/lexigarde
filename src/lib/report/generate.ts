/**
 * Génération de la synthèse pédagogique du rapport via l'API Claude.
 *
 * Le moteur de scan produit des constats techniques structurés ; ce module
 * les transforme en synthèse lisible par un dirigeant non technique :
 * verdict, risques prioritaires avec impact concret, plan d'action.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ScanResult } from "@/lib/scan/types";

/** Erreur de configuration montrable à l'utilisateur. */
export class ReportConfigError extends Error {}

const SYSTEM_PROMPT = `Tu es un consultant senior en conformité RGPD et cybersécurité.
On te fournit le résultat JSON d'un scan automatique de conformité d'un site web
(outil Verdiq) : un score global, et des constats par bloc (mentions obligatoires,
sécurité technique, cookies et traceurs, formulaires), chacun avec sa sévérité.

Rédige une synthèse en français pour le dirigeant de l'entreprise, qui n'est pas
technique. Contraintes :

- Texte brut uniquement, pas de Markdown, pas de listes à puces avec des symboles.
  Structure le texte en paragraphes séparés par des lignes vides.
- Structure exactement en 3 parties, chacune introduite par son titre sur une
  ligne seule : "VERDICT", "RISQUES PRIORITAIRES", "PLAN D'ACTION".
- VERDICT : 2-3 phrases. Situe le niveau global du site, sans jargon.
- RISQUES PRIORITAIRES : les 2 ou 3 constats les plus graves uniquement,
  chacun en un paragraphe : le problème en langage simple, puis le risque
  concret pour l'entreprise (sanction, perte de client, image).
- PLAN D'ACTION : 3 à 5 actions concrètes, ordonnées par priorité, chacune en
  une phrase commençant par un verbe, avec une indication d'effort
  (rapide / quelques jours / chantier).
- Reste factuel et mesuré : ne dramatise pas un site bien noté, ne minimise pas
  un site en infraction. Ne mentionne jamais d'article de loi sans expliquer en
  une phrase ce qu'il impose.
- 250 mots maximum.`;

function buildUserMessage(result: ScanResult): string {
  // On retire les champs inutiles au LLM (evidence parfois volumineuse tronquée).
  const compact = {
    url: result.finalUrl,
    globalScore: result.globalScore,
    blocks: result.blocks.map((b) => ({
      label: b.label,
      score: b.score,
      findings: b.findings.map((f) => ({
        severity: f.severity,
        title: f.title,
        explanation: f.explanation,
        recommendation: f.recommendation,
        evidence: f.evidence?.slice(0, 200),
      })),
    })),
  };
  return JSON.stringify(compact);
}

export async function generateReport(result: ScanResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    throw new ReportConfigError(
      "Clé API Anthropic absente ou invalide. Renseignez ANTHROPIC_API_KEY dans .env.local.",
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // Le system prompt est identique à chaque scan : on le met en cache.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(result) }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Le modèle n'a renvoyé aucun texte.");
  }
  return text;
}
