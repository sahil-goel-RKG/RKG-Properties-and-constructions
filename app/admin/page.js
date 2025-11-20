'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [contactSubmissions, setContactSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/admin/login')
      return
    }

    if (user) {
      fetchContactSubmissions()
    }
  }, [user, isLoaded, router])

  const fetchContactSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/contact-submissions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact submissions')
      }

      const result = await response.json()
      setContactSubmissions(result.submissions || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c99700] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Admin'}!</h1>
            <span className="px-3 py-1 bg-[#fff5d6] text-[#a67800] rounded-full text-sm font-medium">Admin Dashboard</span>
          </div>
          <UserButton appearance={{ elements: { avatarBox: 'h-10 w-10' } }} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="golden-text hover:text-[#a67800] hover:underline"
          >
            ← Back to Website
          </Link>
          <div className="flex gap-3">
            <Link
              href="/admin/sync-developers"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              🔄 Sync Developers
            </Link>
            <Link
              href="/admin/edit-property"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              ✏️ Edit Property
            </Link>
            <Link
              href="/admin/add-listing"
              className="inline-flex items-center px-4 py-2 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
            >
              Add New Listing
            </Link>
          </div>
        </div>

        {/* Contact Submissions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Contact Form Submissions ({contactSubmissions.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c99700] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          ) : contactSubmissions.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No contact submissions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contactSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`mailto:${submission.email}`}
                          className="golden-text hover:text-[#a67800] hover:underline"
                        >
                          {submission.email}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`tel:${submission.phone}`}
                          className="golden-text hover:text-[#a67800] hover:underline"
                        >
                          {submission.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                        <details className="cursor-pointer">
                          <summary className="truncate hover:text-gray-700">
                            {submission.message.length > 50 
                              ? `${submission.message.substring(0, 50)}...` 
                              : submission.message}
                          </summary>
                          <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                            {submission.message}
                          </p>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
