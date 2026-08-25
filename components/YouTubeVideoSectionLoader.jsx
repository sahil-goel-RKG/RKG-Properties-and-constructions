import { connection } from 'next/server'
import { Suspense } from 'react'
import { getChannelVideos, YOUTUBE_CHANNEL_URL } from '@/lib/youtubeChannelServer'
import YouTubeVideoSection from '@/components/YouTubeVideoSection'
import { resolveSectionClass } from '@/lib/resolveSectionClass'

async function YouTubeVideoSectionAsync({ bgColor }) {
  await connection()
  const videos = await getChannelVideos(6)
  return (
    <YouTubeVideoSection videos={videos} channelUrl={YOUTUBE_CHANNEL_URL} bgColor={bgColor} />
  )
}

export default function YouTubeVideoSectionLoader({ bgColor = 'section-mid' }) {
  return (
    <Suspense fallback={<div className={`min-h-[120px] ${resolveSectionClass(bgColor)}`} aria-hidden />}>
      <YouTubeVideoSectionAsync bgColor={bgColor} />
    </Suspense>
  )
}
