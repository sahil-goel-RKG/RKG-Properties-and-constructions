import { createServerSupabaseClient } from '@/lib/supabase/server'
import { developerNameToSlug } from '@/lib/developerUtils'

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || 'https://rkgproperties.in'

export default async function sitemap() {
  const supabase = createServerSupabaseClient()

  const [projectsRes, builderFloorsRes, developersRes] = await Promise.all([
    supabase.from('projects').select('slug, updated_at').eq('type', 'apartment'),
    supabase.from('builder_floors').select('slug, updated_at'),
    supabase.from('projects').select('developer').eq('type', 'apartment').not('developer', 'is', null),
  ])

  const projectSlugs = (projectsRes.data || []).map((p) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const builderFloorSlugs = (builderFloorsRes.data || []).map((p) => ({
    url: `${BASE_URL}/builder-floor/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const developerNames = [...new Set((developersRes.data || []).map((d) => d.developer).filter(Boolean))]
  const developerUrls = developerNames.map((name) => ({
    url: `${BASE_URL}/developers/${developerNameToSlug(name)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const staticRoutes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/apartments`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/builder-floor`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [...staticRoutes, ...projectSlugs, ...builderFloorSlugs, ...developerUrls]
}
