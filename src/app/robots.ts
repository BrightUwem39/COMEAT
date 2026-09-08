import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://comeat-drab.vercel.app";
  const siteUrl = (configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`).replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/profile",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
