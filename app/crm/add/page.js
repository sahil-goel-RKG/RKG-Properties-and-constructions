'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLeadsReturnFromStorage } from '@/lib/crm/leadsReturn'

const INPUT =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]'
const SELECT =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]'

export default function CrmAddLeadPage() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)

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

  const [checkingAccess, setCheckingAccess] = useState(true)
  useEffect(() => {
    let cancelled = false
    fetch('/api/crm/whoami')
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        if (!j?.isAdmin) {
          router.replace('/crm')
          return
        }
        setCheckingAccess(false)
      })
      .catch(() => {
        if (cancelled) return
        router.replace('/crm')
      })
    return () => {
      cancelled = true
    }
  }, [router])

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('')
  const [location, setLocation] = useState('')
  const [initialAssessment, setInitialAssessment] = useState('')
  const [projectsInterested, setProjectsInterested] = useState('')
  const [ucRtm, setUcRtm] = useState('')
  const [agreedWalkIn, setAgreedWalkIn] = useState('')
  const [endUseInvestment, setEndUseInvestment] = useState('')
  const [bhkInterestedIn, setBhkInterestedIn] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpTime, setFollowUpTime] = useState('')
  const [assignedToEmployeeId, setAssignedToEmployeeId] = useState('')
  const [remarks, setRemarks] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSave = useMemo(() => {
    return !!customerName.trim() && !!phone.trim() && !saving
  }, [customerName, phone, saving])

  const reset = () => {
    setCustomerName('')
    setPhone('')
    setSource('')
    setLocation('')
    setInitialAssessment('')
    setProjectsInterested('')
    setUcRtm('')
    setAgreedWalkIn('')
    setEndUseInvestment('')
    setBhkInterestedIn('')
    setFollowUpDate('')
    setFollowUpTime('')
    setAssignedToEmployeeId('')
    setRemarks('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!customerName.trim()) {
      setError('Customer name is required.')
      return
    }
    if (!phone.trim()) {
      setError('Phone is required.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone,
          source,
          location,
          initial_assessment: initialAssessment,
          projects_interested: projectsInterested,
          uc_rtm: ucRtm,
          agreed_walk_in: agreedWalkIn,
          end_use_investment: endUseInvestment,
          bhk_interested_in: bhkInterestedIn,
          follow_up_date: followUpDate,
          follow_up_time: followUpTime,
          assigned_to_employee_id: assignedToEmployeeId,
          remarks,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Failed to add lead')
        return
      }

      // After a successful save, return to the same leads list page/filters.
      window.location.replace(getLeadsReturnFromStorage())
      return
    } catch (err) {
      setError(err?.message || 'Failed to add lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0 w-full max-w-6xl">
      {checkingAccess ? (
        <div className="text-sm text-gray-600 mb-3">Checking access…</div>
      ) : null}
      <h2 className="text-xl font-bold text-gray-900 mb-1">Add Lead</h2>
      <p className="text-sm text-gray-600 mb-3">
        Add a lead manually. If phone already exists, it will update the existing lead.
      </p>

      {error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Customer name <span className="text-red-600">*</span>
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={INPUT}
              placeholder="Prospect name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Phone <span className="text-red-600">*</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={INPUT}
              placeholder="10-digit mobile"
              inputMode="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Source</label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={INPUT}
              placeholder="e.g. RKG / Website / Referral"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={INPUT}
              placeholder="e.g. Gurgaon / Delhi"
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
            >
              <option value="">Select</option>
              <option value="running">running</option>
              <option value="warm">warm</option>
              <option value="cold">cold</option>
              <option value="closed">closed</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Projects Interested
            </label>
            <input
              value={projectsInterested}
              onChange={(e) => setProjectsInterested(e.target.value)}
              className={INPUT}
              placeholder="e.g. Elan The Statement"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">UC/ RTM</label>
            <select
              value={ucRtm}
              onChange={(e) => setUcRtm(e.target.value)}
              className={SELECT}
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
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Follow up time
            </label>
            <input
              type="time"
              value={followUpTime}
              onChange={(e) => setFollowUpTime(e.target.value)}
              className={SELECT}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Assigned to
            </label>
            <select
              value={assignedToEmployeeId}
              onChange={(e) => setAssignedToEmployeeId(e.target.value)}
              className={SELECT}
            >
              <option value="">Select</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.employee_id}_{emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className={`${INPUT} resize-y`}
            placeholder="Notes / comments..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!canSave}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm text-white bg-[#c99700] hover:bg-[#a67800] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save lead'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm text-gray-900 bg-white border border-gray-200 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}

