/**
 * Robots.txt dinâmico do MAPI
 *
 * Define regras de crawl para mecanismos de busca.
 */

export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapi.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/health", "/dashboard/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
