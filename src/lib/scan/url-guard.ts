/**
 * Validation et garde anti-SSRF des URLs cibles.
 *
 * Un scanner qui fetche des URLs arbitraires côté serveur est une cible
 * classique de Server-Side Request Forgery : sans garde, un utilisateur
 * pourrait faire scanner http://localhost:3000, un service interne du
 * cloud (169.254.169.254) ou une IP privée. On bloque tout ça en amont.
 */

import { isIP } from "node:net";
import { promises as dns } from "node:dns";

/** Erreur de validation d'URL, avec message montrable à l'utilisateur. */
export class InvalidTargetError extends Error {}

const BLOCKED_HOSTNAMES = new Set(["localhost", "broadcasthost"]);

const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost", ".lan", ".home", ".corp"];

/** Plages IPv4 privées, loopback, link-local et réservées. */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local (dont métadonnées cloud)
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast + réservé
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  return (
    lower === "::1" ||
    lower === "::" ||
    lower.startsWith("fe80:") || // link-local
    lower.startsWith("fc") || // unique local fc00::/7
    lower.startsWith("fd") ||
    lower.startsWith("::ffff:") // IPv4 mappée, re-vérifiée côté v4
  );
}

function isPrivateIP(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) {
    if (ip.toLowerCase().startsWith("::ffff:")) {
      return isPrivateIPv4(ip.slice(7));
    }
    return isPrivateIPv6(ip);
  }
  return true; // pas une IP : ne devrait pas arriver ici
}

/**
 * Normalise l'entrée utilisateur en URL http(s) et rejette les cibles
 * locales/privées. Résout aussi le DNS pour bloquer les hostnames publics
 * pointant vers des IPs privées (DNS rebinding basique).
 *
 * @throws InvalidTargetError si la cible est invalide ou interdite.
 */
export async function validateTargetUrl(input: string): Promise<URL> {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new InvalidTargetError("URL invalide. Exemple attendu : https://exemple.fr");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidTargetError("Seuls les protocoles http et https sont acceptés.");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOST_SUFFIXES.some((s) => hostname.endsWith(s))) {
    throw new InvalidTargetError("Les adresses locales ou internes ne peuvent pas être scannées.");
  }

  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new InvalidTargetError("Les adresses IP privées ou réservées ne peuvent pas être scannées.");
    }
    return url;
  }

  if (!hostname.includes(".")) {
    throw new InvalidTargetError("Nom de domaine invalide.");
  }

  let addresses: { address: string }[];
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new InvalidTargetError("Ce domaine ne résout pas. Vérifiez l'orthographe de l'URL.");
  }

  if (addresses.some((a) => isPrivateIP(a.address))) {
    throw new InvalidTargetError("Ce domaine pointe vers une adresse interne et ne peut pas être scanné.");
  }

  return url;
}
