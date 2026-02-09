# Performance improvements (TTFB & LCP)

## What was causing high TTFB

- **Home (`/`)**: `revalidate = 0` forced **full SSR on every request**. The server waited for 5 Supabase calls (projects, builder floors, hero images, locations, developers) before sending HTML, so TTFB was ~1s.
- **Detail pages (`/projects/[slug]`, `/builder-floor/[slug]`)**: Same — `revalidate = 0` meant every visit hit Supabase and waited for the response before sending HTML.
- **Builder floor list (`/builder-floor`)**: Already had `revalidate = 1800`; first request (or new filter combos) still did full data fetch. List page was not the main bottleneck; detail and home were.
- **No static pre-render**: No `generateStaticParams`, so even with ISR, the first request for each slug was always server-rendered.

No `getServerSideProps` is used (this is App Router). The equivalent was **no revalidate** (dynamic) and **no generateStaticParams**, so every request was effectively “server-rendered on demand.”

---

## Code changes applied

### 1. ISR (revalidate) — reduce TTFB

**Before (home):**
```js
// export const revalidate = 1800
export const revalidate = 0  // Revalidate every 0 minutes
```

**After:**
```js
export const revalidate = 300  // 5 min cache
```

**Before (detail pages):**
```js
export const revalidate = 0  // or 1800 in production
```

**After (both `/projects/[slug]` and `/builder-floor/[slug]`):**
```js
export const revalidate = 3600  // 1 hour
```

Effect: First request builds the page; subsequent requests within the revalidate window are served from cache, so TTFB drops (often to CDN-level).

---

### 2. generateStaticParams — pre-render known slugs

**Before:** Not present; every slug was on-demand SSR.

**After (e.g. `app/projects/[slug]/page.js`):**
```js
export async function generateStaticParams() {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.from('projects').select('slug').not('slug', 'is', null)
    if (!data?.length) return []
    return data.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}
```

Same pattern added in `app/builder-floor/[slug]/page.js` for `builder_floors`.

Effect: At build time, all known slugs are pre-rendered. First visit to those URLs can be served as static/ISR with low TTFB. New slugs added later are still generated on demand and then cached (ISR).

---

### 3. Image optimization (LCP)

**HeroCarousel — add `sizes` for LCP hero:**
```jsx
<Image
  src={imgUrl}
  alt={`Hero image ${index + 1}`}
  fill
  priority={index === 0}
  sizes="100vw"
  className="object-cover"
/>
```

**ProjectImageGallery — main image:**
```jsx
<Image
  ...
  sizes="(max-width: 1024px) 100vw, 1024px"
  priority={selectedImage === 0}
/>
```

**ProjectCard — card thumbnails:**
```jsx
<Image
  ...
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
/>
```

Effect: Correct `sizes` and `priority` on LCP candidates help Next serve the right image size and prioritize the hero/main image, improving LCP.

---

### 4. Dynamic imports — smaller initial JS

**Layout (client-only overlays):**
```js
const InactivityTimer = dynamic(
  () => import("@/components/features/InactivityTimer"),
  { ssr: false }
);
const ContactPopup = dynamic(
  () => import("@/components/features/ContactPopup"),
  { ssr: false }
);
```

**Home — below-fold sections:**
```js
const LocationsSlider = dynamic(() => import('@/components/LocationsSlider'), { ssr: true })
const DevelopersSlider = dynamic(() => import('@/components/DevelopersSlider'), { ssr: true })
const CountUpStats = dynamic(() => import('@/components/CountUpStats'), { ssr: true })
```

Effect: Less JS in the initial bundle; sliders and stats load in separate chunks; popup and timer don’t block first paint.

---

### 5. CDN cache headers

**next.config.js:**
```js
{
  source: '/_next/static/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
  ],
},
```

Effect: Static JS/CSS/assets are cached at the edge for 1 year; repeat visits load them from CDN.

---

## Verification checklist

- [ ] **Deploy** to Vercel and run a production build (`next build`).
- [ ] **Home:** Open `/` twice. Second request (within 5 min) should have much lower TTFB in Network tab (cached response).
- [ ] **Detail pages:** Open a known project/builder-floor URL. First load can be from pre-render (if built) or ISR; refresh within 1 hour should hit cache and show lower TTFB.
- [ ] **Speed Insights:** In Vercel dashboard, check RES score for `/`, `/builder-floor`, `/projects/*` after 24–48 hours. Target: >90 where possible; TTFB and LCP should improve.
- [ ] **LCP:** In Chrome DevTools → Lighthouse (Performance), confirm LCP element is the hero or main image and that LCP time improved.
- [ ] **JS:** In DevTools → Network, filter by JS; confirm multiple smaller chunks and that ContactPopup/InactivityTimer load after main bundle.
- [ ] **New slugs:** Add a new project or builder floor in admin; visit its URL. It should still render (on-demand ISR) and then be cached for the revalidate period.

---

## Optional follow-ups

- **Builder floor list:** It uses `searchParams`; first request per filter combo is still dynamic. If needed, consider `unstable_cache` around the list data fetchers to cache at the data layer.
- **Supabase:** Supabase client doesn’t use `fetch()` cache. For more aggressive data caching, you could wrap key reads in `unstable_cache(..., { revalidate: 300 })` in the server functions.
- **Vercel:** Ensure the project uses the default Vercel edge caching for ISR (no custom `dynamic = 'force-dynamic'` on these pages).
