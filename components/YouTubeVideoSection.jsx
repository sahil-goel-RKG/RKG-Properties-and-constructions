'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'

const DESKTOP_MQ = '(min-width: 768px)'

function subscribeDesktopMq(callback) {
  const mq = window.matchMedia(DESKTOP_MQ)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getDesktopMqSnapshot() {
  return window.matchMedia(DESKTOP_MQ).matches
}

/** SSR / first server pass: assume mobile so markup matches narrow viewports; desktop corrects after hydrate. */
function getDesktopMqServerSnapshot() {
  return false
}

function useIsDesktopLayout() {
  return useSyncExternalStore(
    subscribeDesktopMq,
    getDesktopMqSnapshot,
    getDesktopMqServerSnapshot
  )
}

function YoutubeVideoCard({ v }) {
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden min-w-0">
      <div className="relative aspect-video bg-gray-900">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${v.videoId}`}
          title={v.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="p-2 sm:p-4">
        <h3 className="text-xs sm:text-base font-semibold text-gray-900 line-clamp-2">
          {v.title}
        </h3>
      </div>
    </article>
  )
}

function chunkVideosBySix(videos) {
  const pages = []
  for (let i = 0; i < videos.length; i += 6) {
    pages.push(videos.slice(i, i + 6))
  }
  return pages
}

export default function YouTubeVideoSection({ videos = [], channelUrl }) {
  if (!videos.length) return null

  const mobilePages = chunkVideosBySix(videos)
  const isDesktop = useIsDesktopLayout()
  const href = channelUrl || 'https://www.youtube.com/channel/UCv_BbICqcxwpchi_hImuiXg'

  const mobileGallery = (
    <div
      className="flex min-w-0 flex-row flex-nowrap gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] -mx-4 px-4 snap-x snap-mandatory touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {mobilePages.map((page, pageIdx) => (
        <div
          key={pageIdx}
          className="flex w-[720px] shrink-0 snap-center flex-col gap-3"
        >
          <div
            className="grid w-full gap-3"
            style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
          >
            {page.slice(0, 3).map((v) => (
              <YoutubeVideoCard key={v.videoId} v={v} />
            ))}
          </div>
          {page.length > 3 ? (
            <div
              className="grid w-full gap-3"
              style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
            >
              {page.slice(3, 6).map((v) => (
                <YoutubeVideoCard key={v.videoId} v={v} />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )

  const desktopGallery = (
    <div className="min-w-0 w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-8">
        {videos.map((v) => (
          <YoutubeVideoCard key={v.videoId} v={v} />
        ))}
      </div>
    </div>
  )

  return (
    <section className="py-8 sm:py-16 bg-gray-100" aria-labelledby="youtube-heading">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-12 max-w-3xl mx-auto">
          <h2
            id="youtube-heading"
            className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4"
          >
            Latest Videos
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Walkthroughs, market updates, and project highlights from RKG.
          </p>
        </div>

        {isDesktop ? desktopGallery : mobileGallery}

        <div className="text-center mt-8 sm:mt-10">
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#22c55e] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#16a34a] transition text-sm sm:text-base touch-manipulation min-h-[44px] flex items-center justify-center mx-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#22c55e] focus-visible:outline-offset-2"
          >
            View channel on YouTube
          </Link>
        </div>
      </div>
    </section>
  )
}
