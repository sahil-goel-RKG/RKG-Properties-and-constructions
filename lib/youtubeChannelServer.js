import { cache } from 'react'

/** RKG Properties and Constructions — https://www.youtube.com/channel/UCv_BbICqcxwpchi_hImuiXg */
export const YOUTUBE_CHANNEL_ID = 'UCv_BbICqcxwpchi_hImuiXg'
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`

const API_BASE = 'https://www.googleapis.com/youtube/v3'

async function logYoutubeError(res, label) {
  const text = await res.text()
  let message = text.slice(0, 500)
  try {
    const j = JSON.parse(text)
    message = j?.error?.message || message
  } catch {
    /* keep raw */
  }
  console.error(`YouTube ${label} failed:`, res.status, message)
}

/**
 * Latest uploads from the channel (includes regular videos and Shorts in upload order).
 * Requires YOUTUBE_API_KEY. Optional YOUTUBE_CHANNEL_ID overrides the default channel.
 * Call from a Server Component that uses `connection()` so this runs at request time on Vercel
 * (build-time prerender has no access to misconfigured keys / referrer-blocked API keys).
 */
export const getChannelVideos = cache(async (maxResults = 6) => {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('YouTube: YOUTUBE_API_KEY is missing (check Vercel env name and Production/Preview scope)')
    return []
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID
  const revalidate = 600

  try {
    const chRes = await fetch(
      `${API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      { next: { revalidate } }
    )
    if (!chRes.ok) {
      await logYoutubeError(chRes, 'channels.list')
      return []
    }
    const chJson = await chRes.json()
    const uploadsPlaylistId =
      chJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) return []

    const plRes = await fetch(
      `${API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${Math.min(maxResults, 50)}&key=${apiKey}`,
      { next: { revalidate } }
    )
    if (!plRes.ok) {
      await logYoutubeError(plRes, 'playlistItems.list')
      return []
    }
    const plJson = await plRes.json()
    const items = plJson.items || []

    return items
      .map((item) => {
        const snip = item.snippet
        const videoId = snip?.resourceId?.videoId
        if (!videoId) return null
        return {
          videoId,
          title: snip.title || 'Video',
          thumbnailUrl:
            snip.thumbnails?.high?.url ||
            snip.thumbnails?.medium?.url ||
            snip.thumbnails?.default?.url ||
            null,
          publishedAt: snip.publishedAt || null,
        }
      })
      .filter(Boolean)
  } catch (e) {
    console.error('YouTube API error:', e)
    return []
  }
})
