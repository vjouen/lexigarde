/**
 * Orchestrateur : exécute les 4 blocs de checks et assemble le ScanResult.
 */

import type { RawScanData, ScanResult } from "./types";
import { checkMentions } from "./checks/mentions";
import { checkSecurity } from "./checks/security";
import { checkCookies } from "./checks/cookies";
import { checkForms } from "./checks/forms";
import { globalScore } from "./score";

export function runChecks(raw: RawScanData): ScanResult {
  const blocks = [checkMentions(raw), checkSecurity(raw), checkCookies(raw), checkForms(raw)];

  return {
    requestedUrl: raw.requestedUrl,
    finalUrl: raw.finalUrl,
    scannedAt: raw.fetchedAt,
    globalScore: globalScore(blocks),
    blocks,
  };
}
