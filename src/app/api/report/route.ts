/**
 * POST /api/report
 * Corps attendu : un ScanResult (tel que renvoyé par /api/scan).
 * Retourne : { summary: string } — la synthèse pédagogique générée par Claude.
 */

import { NextResponse } from "next/server";
import type { ScanResult } from "@/lib/scan/types";
import { generateReport, ReportConfigError } from "@/lib/report/generate";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export const maxDuration = 60; // la génération peut prendre 10-20 s

function looksLikeScanResult(body: unknown): body is ScanResult {
  const r = body as ScanResult;
  return (
    typeof r === "object" &&
    r !== null &&
    typeof r.globalScore === "number" &&
    Array.isArray(r.blocks) &&
    r.blocks.length > 0
  );
}

export async function POST(request: Request) {
  // La synthèse IA est l'appel coûteux : limite plus stricte que le scan.
  const limit = checkRateLimit("report", clientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Limite de synthèses IA quotidienne atteinte pour votre adresse. Réessayez dans ${Math.ceil((limit.retryAfterMinutes ?? 0) / 60)} h. Les constats détaillés du scan restent disponibles sans limite stricte.`,
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (!looksLikeScanResult(body)) {
    return NextResponse.json(
      { error: "Le corps doit être un résultat de scan Verdiq (ScanResult)." },
      { status: 400 },
    );
  }

  try {
    const summary = await generateReport(body);
    return NextResponse.json({ summary });
  } catch (err) {
    if (err instanceof ReportConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("Erreur de génération du rapport :", err);
    return NextResponse.json(
      { error: "La génération de la synthèse a échoué. Réessayez." },
      { status: 502 },
    );
  }
}
