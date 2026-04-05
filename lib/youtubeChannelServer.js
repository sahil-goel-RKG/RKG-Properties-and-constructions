import { cache } from 'react'

/** RKG Properties and Constructions — https://www.youtube.com/channel/UCv_BbICqcxwpchi_hImuiXg */
export const YOUTUBE_CHANNEL_ID = 'UCv_BbICqcxwpchi_hImuiXg'
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`

const API_BASE = 'https://www.googleapis.com/youtube/v3'

/**
 * Latest uploads from the channel (includes regular videos and Shorts in upload order).
 * Requires YOUTUBE_API_KEY. Optional YOUTUBE_CHANNEL_ID overrides the default channel.
 */
export const getChannelVideos = cache(async (maxResults = 6) => {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return []

  const channelId = process.env.YOUTUBE_CHANNEL_ID || YOUTUBE_CHANNEL_ID
  const revalidate = 600

  try {
    const chRes = await fetch(
      `${API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      { next: { revalidate } }
    )
    if (!chRes.ok) {
      console.error('YouTube channels.list failed:', chRes.status)
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
      console.error('YouTube playlistItems.list failed:', plRes.status)
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
