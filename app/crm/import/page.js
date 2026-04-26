'use client'

import { useMemo, useState } from 'react'

export default function CrmImportPage() {
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState('')

  const canSubmit = useMemo(() => !!file && !submitting, [file, submitting])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setErrorDetails('')

    if (!file) {
      setError('Please choose a CSV file first.')
      return
    }

    const fd = new FormData()
    fd.append('file', file)

    setSubmitting(true)
    try {
      const res = await fetch('/api/crm/import', { method: 'POST', body: fd })
      const text = await res.text()
      const json = (() => {
        try {
          return text ? JSON.parse(text) : {}
        } catch {
          return { error: 'Non-JSON response from server', details: text }
        }
      })()

      if (!res.ok) {
        setError(json?.error || 'Import failed')
        setErrorDetails(
          typeof json?.details === 'string'
            ? json.details
            : json?.details
              ? JSON.stringify(json.details, null, 2)
              : text
        )
        return
      }

      setResult(json)
    } catch (err) {
      setError(err?.message || 'Import failed')
      setErrorDetails('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-w-0">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Import CSV</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV file and we’ll import leads into Supabase. Duplicate phone
        numbers will be updated (based on normalized phone).
      </p>

      <form onSubmit={onSubmit} className="space-y-3 max-w-2xl">
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            CSV file
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-gray-900 hover:file:bg-gray-100"
          />
          <div className="mt-2 text-xs text-gray-600">
            Expected columns (any of these names work): <br />
            <span className="font-semibold">SM Name</span>,{' '}
            <span className="font-semibold">Customer Name</span>,{' '}
            <span className="font-semibold">Contact/Phone</span>,{' '}
            <span className="font-semibold">Status/Remarks</span>
          </div>
        </div>

        {error ? (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="font-semibold">{error}</div>
            {errorDetails ? (
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">
                  Technical details
                </summary>
                <pre className="mt-2 p-2 bg-white border border-red-100 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                  {errorDetails}
                </pre>
              </details>
            ) : null}
          </div>
        ) : null}

        {result ? (
          <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
            <div className="font-semibold">Import completed</div>
            <div>
              Batch: <span className="font-mono">{result.batchId}</span>
            </div>
            <div>
              Rows: {result.totalRows} | Imported: {result.imported} | Skipped:{' '}
              {result.skipped}
            </div>
            {Array.isArray(result.errors) && result.errors.length ? (
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">
                  Row errors ({result.errors.length})
                </summary>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {result.errors.map((e, idx) => (
                    <li key={idx}>
                      Row {e.row}: {e.error}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm text-white bg-[#c99700] hover:bg-[#a67800] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Importing…' : 'Import'}
        </button>
      </form>
    </div>
  )
}

