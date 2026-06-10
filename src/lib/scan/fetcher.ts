/**
 * Récupération de la page cible : HTML, headers, cookies, redirection HTTPS.
 */

import type { RawScanData } from "./types";

const USER_AGENT = "LexigardeBot/0.1 (audit RGPD; +https://lexigarde.fr)";
const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 3_000_000; // 3 Mo : au-delà on tronque, inutile pour l'analyse

/** Erreur réseau montrable à l'utilisateur. */
export class FetchTargetError extends Error {}

async function fetchWithTimeout(url: string, redirect: RequestRedirect): Promise<Response> {
  return fetch(url, {
    redirect,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

/**
 * Teste si la version HTTP du site redirige vers HTTPS.
 * Retourne null si le test n'a pas pu être effectué (port 80 fermé, timeout...).
 */
async function checkHttpToHttpsRedirect(url: URL): Promise<boolean | null> {
  const httpUrl = new URL(url.href);
  httpUrl.protocol = "http:";
  httpUrl.port = "";
  try {
    const res = await fetchWithTimeout(httpUrl.href, "manual");
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location") ?? "";
      return location.startsWith("https://") || location.startsWith("//");
    }
    // Le site répond en HTTP sans rediriger : c'est un échec du check.
    return false;
  } catch {
    return null;
  }
}

/**
 * Fetche la page cible (URL déjà validée par url-guard) et retourne
 * les données brutes nécessaires aux blocs de checks.
 *
 * @throws FetchTargetError si la cible est injoignable.
 */
export async function fetchTarget(url: URL): Promise<RawScanData> {
  let response: Response;
  try {
    response = await fetchWithTimeout(url.href, "follow");
  } catch (err) {
    const cause = err instanceof Error ? err.name : "";
    if (cause === "TimeoutError") {
      throw new FetchTargetError("Le site n'a pas répondu dans les 15 secondes.");
    }
    throw new FetchTargetError("Impossible de joindre ce site. Vérifiez l'URL.");
  }

  if (response.status >= 400) {
    if (response.status === 403 || response.status === 429) {
      throw new FetchTargetError(
        `Ce site bloque les robots (HTTP ${response.status}). Le scan automatique n'est pas possible sur ce site.`,
      );
    }
    throw new FetchTargetError(
      `Le site a répondu avec une erreur HTTP ${response.status}. Impossible d'analyser la page.`,
    );
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const setCookies = response.headers.getSetCookie?.() ?? [];

  let html = await response.text();
  if (html.length > MAX_HTML_BYTES) {
    html = html.slice(0, MAX_HTML_BYTES);
  }

  const httpRedirectsToHttps =
    url.protocol === "https:" ? await checkHttpToHttpsRedirect(url) : false;

  return {
    requestedUrl: url.href,
    finalUrl: response.url || url.href,
    status: response.status,
    headers,
    setCookies,
    html,
    httpRedirectsToHttps,
    fetchedAt: new Date().toISOString(),
  };
}
