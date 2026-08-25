'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resolveSectionClass, resolveSectionStyle } from '@/lib/resolveSectionClass'
import './youtube-section.css'

function VideoEmbed({ videoId, title }) {
  return (
    <iframe
      key={videoId}
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}

function PlaylistItem({ video, isActive, onSelect }) {
  const thumb =
    video.thumbnailUrl || `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`

  return (
    <button
      type="button"
      className={`youtube-playlist-item${isActive ? ' is-active' : ''}`}
      onClick={onSelect}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="youtube-playlist-thumb">
        <img src={thumb} alt="" loading="lazy" />
      </div>
      <p className="youtube-playlist-item-title">{video.title}</p>
    </button>
  )
}

export default function YouTubeVideoSection({ videos = [], channelUrl, bgColor = 'section-mid' }) {
  const sectionClass = resolveSectionClass(bgColor)
  const sectionStyle = resolveSectionStyle(bgColor)
  const href =
    channelUrl || 'https://www.youtube.com/channel/UCv_BbICqcxwpchi_hImuiXg'

  const [activeIndex, setActiveIndex] = useState(0)
  const activeVideo = videos[activeIndex] || videos[0]

  if (!videos.length) {
    return (
      <section
        className={`py-8 sm:py-16 ${sectionClass}`}
        style={sectionStyle}
        aria-labelledby="youtube-heading"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-10 max-w-3xl mx-auto">
            <h2
              id="youtube-heading"
              className="text-xl sm:text-3xl font-bold font-serif-display text-[#f5f5f5] mb-2 sm:mb-4"
            >
              Latest Videos
            </h2>
            <p className="text-sm sm:text-base text-[#a3a3a3]">
              Videos are temporarily unavailable. Please check again in a few minutes.
            </p>
          </div>
          <div className="text-center">
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mx-auto"
            >
              View channel on YouTube
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`py-8 sm:py-16 ${sectionClass}`}
      style={sectionStyle}
      aria-labelledby="youtube-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-10 max-w-3xl mx-auto">
          <h2
            id="youtube-heading"
            className="text-xl sm:text-3xl font-bold font-serif-display text-[#f5f5f5] mb-2 sm:mb-4"
          >
            Latest Videos
          </h2>
          <p className="text-sm sm:text-base text-[#a3a3a3]">
            Walkthroughs, market updates, and project highlights from RKG.
          </p>
        </div>

        <div className="youtube-playlist">
          <div className="youtube-player-wrap">
            <article className="card-luxury rounded-xl overflow-hidden">
              <div className="youtube-player-frame">
                <VideoEmbed
                  videoId={activeVideo.videoId}
                  title={activeVideo.title}
                />
              </div>
            </article>
            <h3 className="youtube-player-title">{activeVideo.title}</h3>
          </div>

          <div className="min-w-0">
            <p className="youtube-playlist-label">Select a video</p>
            <div className="youtube-playlist-list slider-scroll-elegant" role="list">
              {videos.map((video, index) => (
                <PlaylistItem
                  key={video.videoId}
                  video={video}
                  isActive={index === activeIndex}
                  onSelect={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mx-auto"
          >
            View channel on YouTube
          </Link>
        </div>
      </div>
    </section>
  )
}
