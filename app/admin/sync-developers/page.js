'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function SyncDevelopersPage() {
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const syncDevelopers = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/developers/sync-from-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Unknown error occurred')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const syncStats = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/developers/sync-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({ message: data.message || 'Statistics synced successfully' })
      } else {
        setError(data.error || 'Unknown error occurred')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
          <Link
            href="/admin/login"
            className="inline-block bg-[#c99700] text-white px-6 py-2 rounded-lg hover:bg-[#a67800] transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-4">
          <Link
            href="/admin"
            className="golden-text hover:text-[#a67800] hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔄 Sync Developers from Projects
          </h1>
          <p className="text-gray-600 mb-8">
            This will extract all unique developers from your projects table and add them to the developers table.
            Statistics will be automatically synced.
          </p>

          <div className="flex gap-4 mb-8">
            <button
              onClick={syncDevelopers}
              disabled={loading}
              className="bg-[#c99700] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a67800] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Syncing...' : '🔄 Sync Developers'}
            </button>
            <button
              onClick={syncStats}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Syncing...' : '📊 Sync Statistics Only'}
            </button>
          </div>

          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-800 font-semibold mb-2">✅ Success!</h3>
              <p className="text-green-700">{result.message}</p>
              {result.count && (
                <p className="text-green-700 mt-2">
                  <strong>Developers synced:</strong> {result.count}
                </p>
              )}
              {result.developers && result.developers.length > 0 && (
                <details className="mt-4">
                  <summary className="text-green-700 cursor-pointer font-medium">
                    View {result.developers.length} Developers
                  </summary>
                  <div className="mt-2 bg-white p-4 rounded border">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(result.developers, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Alternative Methods:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Using curl:</strong></p>
              <code className="block bg-white p-2 rounded border">
                curl -X POST https://your-domain.com/api/developers/sync-from-projects
              </code>
              <p className="mt-2 text-xs text-gray-500">Note: For localhost development, use http://localhost:3000</p>
              <p className="mt-4"><strong>Using PowerShell:</strong></p>
              <code className="block bg-white p-2 rounded border">
                Invoke-WebRequest -Uri "https://your-domain.com/api/developers/sync-from-projects" -Method POST
              </code>
              <p className="mt-2 text-xs text-gray-500">Note: For localhost development, use http://localhost:3000</p>
              <p className="mt-4"><strong>Or use SQL directly in Supabase:</strong></p>
              <code className="block bg-white p-2 rounded border text-xs">
                INSERT INTO developers (name, slug, is_featured, display_order, is_active)<br/>
                SELECT DISTINCT TRIM(developer) as name,<br/>
                LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(developer), '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')) as slug,<br/>
                false as is_featured,<br/>
                ROW_NUMBER() OVER (ORDER BY TRIM(developer)) as display_order,<br/>
                true as is_active<br/>
                FROM projects<br/>
                WHERE developer IS NOT NULL AND TRIM(developer) != ''<br/>
                ON CONFLICT (name) DO NOTHING;
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

