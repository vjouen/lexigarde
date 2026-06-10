/**
 * POST /api/scan
 * Corps attendu : { "url": "https://exemple.fr" }
 * Retourne un ScanResult : score global + 4 blocs de constats.
 */

import { NextResponse } from "next/server";
import { validateTargetUrl, InvalidTargetError } from "@/lib/scan/url-guard";
import { fetchTarget, FetchTargetError } from "@/lib/scan/fetcher";
import { runChecks } from "@/lib/scan/run";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = checkRateLimit("scan", clientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Limite de scans quotidienne atteinte pour votre adresse. Réessayez dans ${Math.ceil((limit.retryAfterMinutes ?? 0) / 60)} h.`,
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

  const input = (body as { url?: unknown })?.url;
  if (typeof input !== "string" || input.trim() === "") {
    return NextResponse.json(
      { error: 'Le champ "url" est requis. Exemple : { "url": "https://exemple.fr" }' },
      { status: 400 },
    );
  }

  try {
    const url = await validateTargetUrl(input);
    const raw = await fetchTarget(url);
    return NextResponse.json(runChecks(raw));
  } catch (err) {
    if (err instanceof InvalidTargetError || err instanceof FetchTargetError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Erreur inattendue pendant le scan :", err);
    return NextResponse.json({ error: "Erreur interne pendant le scan." }, { status: 500 });
  }
}
