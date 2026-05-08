'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'

const INPUT =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]'
const SELECT =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]'

export default function CrmLeadEditor({ lead, isAdmin: isAdminProp }) {
  const router = useRouter()
  const { user } = useUser()
  const isAdmin = typeof isAdminProp === 'boolean' ? isAdminProp : user?.publicMetadata?.role === 'admin'
  const [location, setLocation] = useState(lead.location || '')

  const [employees, setEmployees] = useState([])
  useEffect(() => {
    let cancelled = false
    fetch('/api/crm/employees')
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        setEmployees(Array.isArray(j?.employees) ? j.employees : [])
      })
      .catch(() => {
        if (cancelled) return
        setEmployees([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const initialAssessmentFromLead = (() => {
    const raw = typeof lead.initial_assessment === 'string' ? lead.initial_assessment : ''
    const v = raw.trim().toLowerCase()
    if (!v) return ''
    if (v === 'hot') return 'running'
    if (v === 'running' || v === 'warm' || v === 'cold' || v === 'closed') return v
    return ''
  })()

  const [initialAssessment, setInitialAssessment] = useState(initialAssessmentFromLead)
  const [projectsInterested, setProjectsInterested] = useState(
    lead.projects_interested || ''
  )
  const [ucRtm, setUcRtm] = useState(lead.uc_rtm || '')
  const [agreedWalkIn, setAgreedWalkIn] = useState(lead.agreed_walk_in || '')
  const [endUseInvestment, setEndUseInvestment] = useState(
    lead.end_use_investment || ''
  )
  const [bhkInterestedIn, setBhkInterestedIn] = useState(
    lead.bhk_interested_in || ''
  )
  const [followUpDate, setFollowUpDate] = useState(lead.follow_up_date || '')
  const [remarks, setRemarks] = useState(lead.remarks || '')
  const [assignedToEmployeeId, setAssignedToEmployeeId] = useState(
    lead.assigned_to_employee_id || ''
  )
  const assignmentLocked = !isAdmin && !!(lead.assigned_to_employee_id || '').trim()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const assessmentOptions = ['running', 'warm', 'cold', 'closed']

  const dirty = useMemo(() => {
    return (
      (lead.location || '') !== location ||
      initialAssessmentFromLead !== initialAssessment ||
      (lead.projects_interested || '') !== projectsInterested ||
      (lead.uc_rtm || '') !== ucRtm ||
      (lead.agreed_walk_in || '') !== agreedWalkIn ||
      (lead.end_use_investment || '') !== endUseInvestment ||
      (lead.bhk_interested_in || '') !== bhkInterestedIn ||
      (lead.follow_up_date || '') !== followUpDate ||
      (lead.remarks || '') !== remarks ||
      (lead.assigned_to_employee_id || '') !== assignedToEmployeeId
    )
  }, [
    agreedWalkIn,
    assignedToEmployeeId,
    bhkInterestedIn,
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
    let navigated = false
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
          bhk_interested_in: bhkInterestedIn,
          follow_up_date: followUpDate,
          remarks,
          assigned_to_employee_id: assignedToEmployeeId,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Save failed')
        return
      }

      // Redirect back to leads immediately after a successful save.
      // Use hard navigation to be 100% reliable across environments.
      navigated = true
      router.replace('/crm')
      window.location.replace('/crm')
      return
    } catch (e) {
      setError(e?.message || 'Save failed')
    } finally {
      if (navigated) return
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
          <select
            value={assignedToEmployeeId}
            onChange={(e) => setAssignedToEmployeeId(e.target.value)}
            className={SELECT}
            style={{ color: '#111827' }}
            disabled={assignmentLocked}
          >
            <option value="">Select</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_id}_{emp.name}
              </option>
            ))}
          </select>
          {assignmentLocked ? (
            <div className="mt-1 text-[11px] text-gray-500">
              Only admin can change assignment.
            </div>
          ) : null}
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
            {assessmentOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
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
            BHK Interested In
          </label>
          <select
            value={bhkInterestedIn}
            onChange={(e) => setBhkInterestedIn(e.target.value)}
            className={SELECT}
            style={{ color: '#111827' }}
          >
            <option value="">Select</option>
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="4 BHK">4 BHK</option>
            <option value="5 BHK">5 BHK</option>
            <option value="6 BHK">6 BHK</option>
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

