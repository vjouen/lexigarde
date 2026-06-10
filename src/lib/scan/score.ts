/**
 * Calcul des scores à partir des constats.
 */

import type { BlockResult, Finding } from "./types";

const PENALTY: Record<Exclude<Finding["severity"], "pass">, number> = {
  critical: 25,
  warning: 10,
  info: 3,
};

/** Score d'un bloc : 100 moins les pénalités, plancher à 0. */
export function scoreFromFindings(findings: Finding[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.severity !== "pass") {
      score -= PENALTY[f.severity];
    }
  }
  return Math.max(0, score);
}

/**
 * Score global : moyenne pondérée des blocs.
 * Cookies pèse plus lourd : c'est le premier motif de sanction CNIL.
 */
const BLOCK_WEIGHTS: Record<BlockResult["id"], number> = {
  mentions: 0.25,
  security: 0.25,
  cookies: 0.3,
  forms: 0.2,
};

export function globalScore(blocks: BlockResult[]): number {
  let total = 0;
  let weightSum = 0;
  for (const block of blocks) {
    const weight = BLOCK_WEIGHTS[block.id];
    total += block.score * weight;
    weightSum += weight;
  }
  return weightSum === 0 ? 0 : Math.round(total / weightSum);
}
