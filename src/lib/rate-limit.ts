/**
 * Limitation de débit par adresse IP, en mémoire.
 *
 * Protège le budget API (la synthèse IA coûte ~0,05 $ par appel) contre les
 * scans en masse. Limite v1 assumée : en environnement serverless (Vercel),
 * chaque instance a sa propre mémoire — la limite est donc par instance et se
 * réinitialise au recyclage. Suffisant contre l'abus naïf ; un store partagé
 * (Upstash Redis) prendra le relais en v2 si le trafic le justifie.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const DAY_MS = 24 * 60 * 60 * 1000;

/** Limites quotidiennes par IP. Surchargeables via env pour les tests. */
export const LIMITS = {
  scan: Number(process.env.RATE_LIMIT_SCAN_PER_DAY ?? 30),
  report: Number(process.env.RATE_LIMIT_REPORT_PER_DAY ?? 5),
};

export interface RateLimitResult {
  allowed: boolean;
  /** Minutes avant réinitialisation, si refusé. */
  retryAfterMinutes?: number;
}

export function checkRateLimit(scope: "scan" | "report", ip: string): RateLimitResult {
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + DAY_MS });
    return { allowed: true };
  }

  if (bucket.count >= LIMITS[scope]) {
    return {
      allowed: false,
      retryAfterMinutes: Math.ceil((bucket.resetAt - now) / 60_000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Extrait l'IP cliente (Vercel et la plupart des proxies remplissent x-forwarded-for). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "inconnue";
}
