export const dynamic = "force-dynamic";

export default function robots() {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  return `
User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /

Sitemap: ${siteUrl.replace(/\/$/, "")}/sitemap.xml
`.trim();
}