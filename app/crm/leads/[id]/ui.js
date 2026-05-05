'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const INPUT =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]'
const SELECT =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]'

export default function CrmLeadEditor({ lead }) {
  const [location, setLocation] = useState(lead.location || '')
  const [initialAssessment, setInitialAssessment] = useState(
    lead.initial_assessment || ''
  )
  const [projectsInterested, setProjectsInterested] = useState(
    lead.projects_interested || ''
  )
  const [ucRtm, setUcRtm] = useState(lead.uc_rtm || '')
  const [agreedWalkIn, setAgreedWalkIn] = useState(lead.agreed_walk_in || '')
  const [endUseInvestment, setEndUseInvestment] = useState(
    lead.end_use_investment || ''
  )
  const [followUpDate, setFollowUpDate] = useState(lead.follow_up_date || '')
  const [remarks, setRemarks] = useState(lead.remarks || '')
  const [assignedToName, setAssignedToName] = useState(lead.assigned_to_name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const dirty = useMemo(() => {
    return (
      (lead.location || '') !== location ||
      (lead.initial_assessment || '') !== initialAssessment ||
      (lead.projects_interested || '') !== projectsInterested ||
      (lead.uc_rtm || '') !== ucRtm ||
      (lead.agreed_walk_in || '') !== agreedWalkIn ||
      (lead.end_use_investment || '') !== endUseInvestment ||
      (lead.follow_up_date || '') !== followUpDate ||
      (lead.remarks || '') !== remarks ||
      (lead.assigned_to_name || '') !== assignedToName
    )
  }, [
    agreedWalkIn,
    assignedToName,
    endUseInvestment,
    followUpDate,
    initialAssessment,
    lead,
    location,
    projectsInterested,
    remarks,
    ucRtm,
  ])

  const save = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          initial_assessment: initialAssessment,
          projects_interested: projectsInterested,
          uc_rtm: ucRtm,
          agreed_walk_in: agreedWalkIn,
          end_use_investment: endUseInvestment,
          follow_up_date: followUpDate,
          remarks,
          assigned_to_name: assignedToName,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Save failed')
        return
      }
      setMessage('Saved')
    } catch (e) {
      setError(e?.message || 'Save failed')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 2000)
    }
  }

  return (
    <div className="min-w-0 w-full max-w-6xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Lead
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {lead.customer_name}
          </h2>
          <div className="mt-1 text-sm text-gray-600">
            <span className="font-semibold">Source:</span> {lead.source || '-'}{' '}
            <span className="mx-2">•</span>
            <span className="font-semibold">Phone:</span>{' '}
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="text-[#a67800] font-semibold hover:underline"
              >
                {lead.phone}
              </a>
            ) : (
              '-'
            )}
            <span className="mx-2">•</span>
            <span className="font-semibold">Excel Name:</span>{' '}
            {lead.excel_name || '-'}
          </div>
        </div>

        <Link
          href="/crm"
          className="text-sm font-semibold text-[#a67800] hover:underline whitespace-nowrap"
        >
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Customer name
          </label>
          <input
            value={lead.customer_name || ''}
            readOnly
            className={`${INPUT} bg-gray-50`}
            style={{ color: '#111827' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Phone</label>
          <input
            value={lead.phone || ''}
            readOnly
            className={`${INPUT} bg-gray-50`}
            style={{ color: '#111827' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={INPUT}
            placeholder="e.g. Gurgaon"
            style={{ color: '#111827' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Assigned to</label>
          <input
            value={assignedToName}
            onChange={(e) => setAssignedToName(e.target.value)}
            className={INPUT}
            placeholder="e.g. Sahil / Mohit"
            style={{ color: '#111827' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Initial Assesment
          </label>
          <select
            value={initialAssessment}
            onChange={(e) => setInitialAssessment(e.target.value)}
            className={SELECT}
            style={{ color: '#111827' }}
          >
            <option value="">Select</option>
            <option value="hot">hot</option>
            <option value="warm">warm</option>
            <option value="cold">cold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">UC/ RTM</label>
          <select
            value={ucRtm}
            onChange={(e) => setUcRtm(e.target.value)}
            className={SELECT}
            style={{ color: '#111827' }}
          >
            <option value="">Select</option>
            <option value="UC">UC</option>
            <option value="RTM">RTM</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Walk-in agreed?
          </label>
          <select
            value={agreedWalkIn}
            onChange={(e) => setAgreedWalkIn(e.target.value)}
            className={SELECT}
            style={{ color: '#111827' }}
          >
            <option value="">Select</option>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            End Use/ Investment
          </label>
          <select
            value={endUseInvestment}
            onChange={(e) => setEndUseInvestment(e.target.value)}
            className={SELECT}
            style={{ color: '#111827' }}
          >
            <option value="">Select</option>
            <option value="End Use">End Use</option>
            <option value="Investment">Investment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Follow up
          </label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className={SELECT}
            style={{ color: '#111827' }}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Projects Interested
          </label>
          <input
            value={projectsInterested}
            onChange={(e) => setProjectsInterested(e.target.value)}
            className={INPUT}
            placeholder="e.g. The Camellias, Elan The Statement"
            style={{ color: '#111827' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className={`${INPUT} resize-y`}
            placeholder="Add notes / remarks..."
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 p-3 bg-gray-50 text-xs text-gray-700 space-y-1">
            <div>
              <span className="font-semibold">Created:</span>{' '}
              {new Date(lead.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Updated:</span>{' '}
              {new Date(lead.updated_at).toLocaleString()}
            </div>
          </div>

          {error ? (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3">
              {message}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!dirty || saving}
            onClick={save}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm text-white bg-[#c99700] hover:bg-[#a67800] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>
    </div>
  )
}

