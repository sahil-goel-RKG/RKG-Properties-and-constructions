import { connection } from 'next/server'
import { Suspense } from 'react'
import { getChannelVideos, YOUTUBE_CHANNEL_URL } from '@/lib/youtubeChannelServer'
import YouTubeVideoSection from '@/components/YouTubeVideoSection'

async function YouTubeVideoSectionAsync() {
  await connection()
  const videos = await getChannelVideos(6)
  return (
    <YouTubeVideoSection videos={videos} channelUrl={YOUTUBE_CHANNEL_URL} />
  )
}

export default function YouTubeVideoSectionLoader() {
  return (
    <Suspense fallback={<div className="min-h-[120px] bg-gray-100" aria-hidden />}>
      <YouTubeVideoSectionAsync />
    </Suspense>
  )
}
