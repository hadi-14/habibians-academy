import type { MetadataRoute } from "next";

// Facebook page: https://facebook.com/HabibiansAcademy
// Open Graph and Twitter meta handled in layout.tsx

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/student-portal/login"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_URL}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_URL,
  };
}
