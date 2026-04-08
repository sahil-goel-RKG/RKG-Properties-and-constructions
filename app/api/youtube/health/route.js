import { NextResponse } from 'next/server'
import { getChannelVideos, YOUTUBE_CHANNEL_ID } from '@/lib/youtubeChannelServer'

export const runtime = 'nodejs'

export async function GET() {
  const hasKey = Boolean(process.env.YOUTUBE_API_KEY)
  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID

  try {
    const videos = await getChannelVideos(1)
    return NextResponse.json({
      ok: videos.length > 0,
      hasKey,
      channelId,
      count: videos.length,
      sample: videos[0] || null,
    })
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        hasKey,
        channelId,
        error: e?.message || String(e),
      },
      { status: 500 }
    )
  }
}

