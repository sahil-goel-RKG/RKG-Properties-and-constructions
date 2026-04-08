import { NextResponse } from 'next/server'
import { YOUTUBE_CHANNEL_ID } from '@/lib/youtubeChannelServer'

export const runtime = 'nodejs'

const API_BASE = 'https://www.googleapis.com/youtube/v3'

async function readYoutubeError(res) {
  const text = await res.text()
  try {
    const j = JSON.parse(text)
    return j?.error?.message || text
  } catch {
    return text
  }
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY
  const hasKey = Boolean(apiKey)
  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID

  try {
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, hasKey, channelId, error: 'Missing YOUTUBE_API_KEY' },
        { status: 500 }
      )
    }

    const chRes = await fetch(
      `${API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      { cache: 'no-store' }
    )
    if (!chRes.ok) {
      const message = await readYoutubeError(chRes)
      return NextResponse.json(
        { ok: false, hasKey, channelId, step: 'channels.list', status: chRes.status, message },
        { status: 200 }
      )
    }

    const chJson = await chRes.json()
    const uploadsPlaylistId =
      chJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) {
      return NextResponse.json(
        { ok: false, hasKey, channelId, step: 'channels.list', status: 200, message: 'No uploads playlist found', raw: chJson },
        { status: 200 }
      )
    }

    const plRes = await fetch(
      `${API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${apiKey}`,
      { cache: 'no-store' }
    )
    if (!plRes.ok) {
      const message = await readYoutubeError(plRes)
      return NextResponse.json(
        { ok: false, hasKey, channelId, uploadsPlaylistId, step: 'playlistItems.list', status: plRes.status, message },
        { status: 200 }
      )
    }

    const plJson = await plRes.json()
    const item = plJson.items?.[0]
    const videoId = item?.snippet?.resourceId?.videoId || null
    const title = item?.snippet?.title || null

    return NextResponse.json({
      ok: Boolean(videoId),
      hasKey,
      channelId,
      uploadsPlaylistId,
      count: plJson.items?.length || 0,
      sample: videoId ? { videoId, title } : null,
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

