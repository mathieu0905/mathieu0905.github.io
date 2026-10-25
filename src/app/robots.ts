import type { MetadataRoute } from "next";

const SITE_URL = "https://mathieu0905.github.io";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The editor writes to the repository through the GitHub API and has no
        // value to search engines.
        disallow: ["/admin", "/prep"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
