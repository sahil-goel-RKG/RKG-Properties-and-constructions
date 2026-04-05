import Link from 'next/link'
import { YOUTUBE_CHANNEL_URL } from '@/lib/youtubeChannelServer'

export default function YouTubeVideoSection({ videos = [] }) {
  if (!videos.length) return null

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
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {videos.map((v) => (
            <article
              key={v.videoId}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
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
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
                  {v.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center mt-8 sm:mt-10">
          <Link
            href={YOUTUBE_CHANNEL_URL}
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
