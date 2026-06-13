import type { MetadataRoute } from "next";

const SITE_URL = "https://lexigarde.fr";

/** Indication aux moteurs : tout est indexable, sauf les routes d'API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
