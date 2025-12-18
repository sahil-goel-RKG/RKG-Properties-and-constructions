'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import BrochureDownloadModal from './BrochureDownloadModal'

export default function BrochureDownloadButton({ 
  downloadUrl, 
  projectName, 
  className = "inline-flex items-center px-6 py-3 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition",
  iconClassName = "w-5 h-5 mr-2",
  text = "Download Brochure"
}) {
  const { user, isLoaded } = useUser()
  const [showModal, setShowModal] = useState(false)

  const handleClick = (e) => {
    // If user is loaded and is authenticated (admin), download directly
    if (isLoaded && user) {
      // Allow default link behavior (direct download)
      return
    }
    
    // For non-authenticated users, show modal
    e.preventDefault()
    setShowModal(true)
  }

  const handleDownload = () => {
    // Trigger download
    window.open(downloadUrl, '_blank')
  }

  return (
    <>
      <a
        href={downloadUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        {text}
      </a>
      
      {showModal && (
        <BrochureDownloadModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onDownload={handleDownload}
          projectName={projectName}
        />
      )}
    </>
  )
}

