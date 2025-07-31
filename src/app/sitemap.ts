import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL;
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: now,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/enroll`,
      lastModified: now,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/student-portal`,
      lastModified: now,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/student-portal/login`,
      lastModified: now,
      priority: 0.2,
    },
  ];
}
