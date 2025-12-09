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
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/admin/login')
        return
      }
      // User is authenticated, fetch data
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

  const handleEdit = (submission) => {
    setEditingId(submission.id)
    setEditData({
      status: submission.status || 'new',
      priority: submission.priority || 'medium',
      admin_notes: submission.admin_notes || '',
      follow_up_date: submission.follow_up_date || '',
      response_sent: submission.response_sent || false,
      assigned_to: submission.assigned_to || user?.firstName || ''
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleSave = async (id) => {
    setSaving(true)
    setSuccess('')
    
    try {
      const response = await fetch('/api/admin/contact-submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...editData,
          // Convert empty strings to null for date
          follow_up_date: editData.follow_up_date || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update submission')
      }

      const result = await response.json()
      
      // Update the local state
      setContactSubmissions(prev => 
        prev.map(sub => sub.id === id ? result.submission : sub)
      )
      
      setSuccess('Submission updated successfully!')
      setEditingId(null)
      setEditData({})
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating submission:', error)
      alert(error.message || 'Failed to update submission')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Contact Form Submissions ({contactSubmissions.length})
              </h2>
              {success && (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}
            </div>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Notes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow-up
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Sent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contactSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`mailto:${submission.email}`}
                          className="golden-text hover:text-[#a67800] hover:underline"
                        >
                          {submission.email}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`tel:${submission.phone}`}
                          className="golden-text hover:text-[#a67800] hover:underline"
                        >
                          {submission.phone}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                        <details className="cursor-pointer">
                          <summary className="truncate hover:text-gray-700">
                            {submission.message.length > 30 
                              ? `${submission.message.substring(0, 30)}...` 
                              : submission.message}
                          </summary>
                          <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                            {submission.message}
                          </p>
                        </details>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === submission.id ? (
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                          >
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status || 'new')}`}>
                            {(submission.status || 'new').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === submission.id ? (
                          <select
                            value={editData.priority}
                            onChange={(e) => setEditData({...editData, priority: e.target.value})}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(submission.priority || 'medium')}`}>
                            {(submission.priority || 'medium').charAt(0).toUpperCase() + (submission.priority || 'medium').slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                        {editingId === submission.id ? (
                          <textarea
                            value={editData.admin_notes}
                            onChange={(e) => setEditData({...editData, admin_notes: e.target.value})}
                            rows={2}
                            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                            placeholder="Add admin notes..."
                          />
                        ) : (
                          <span className="text-xs">
                            {submission.admin_notes || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === submission.id ? (
                          <input
                            type="date"
                            value={editData.follow_up_date}
                            onChange={(e) => setEditData({...editData, follow_up_date: e.target.value})}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                          />
                        ) : (
                          <span className="text-xs">
                            {submission.follow_up_date 
                              ? new Date(submission.follow_up_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === submission.id ? (
                          <input
                            type="checkbox"
                            checked={editData.response_sent}
                            onChange={(e) => setEditData({...editData, response_sent: e.target.checked})}
                            className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                          />
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full ${submission.response_sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {submission.response_sent ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === submission.id ? (
                          <input
                            type="text"
                            value={editData.assigned_to}
                            onChange={(e) => setEditData({...editData, assigned_to: e.target.value})}
                            placeholder="Admin name"
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] w-24"
                          />
                        ) : (
                          <span className="text-xs">
                            {submission.assigned_to || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {editingId === submission.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(submission.id)}
                              disabled={saving}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancel}
                              disabled={saving}
                              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(submission)}
                            className="px-3 py-1 bg-[#c99700] text-white text-xs rounded hover:bg-[#a67800]"
                          >
                            Edit
                          </button>
                        )}
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
