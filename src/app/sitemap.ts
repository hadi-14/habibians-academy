import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.NEXT_PUBLIC_URL}/`,
      lastModified: new Date(),
      priority: 1
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/about`,
      priority: 0.9
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/courses`,
      priority: 0.8
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/enroll`,
      priority: 0.7
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/student-portal`,
      priority: 0.3
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/student-portal/login`,
      priority: 0.2
    },
  ]
}