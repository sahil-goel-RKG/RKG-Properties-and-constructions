'use client'

import { useEffect, useRef, useState } from 'react'

export default function CountUpStats() {
  const sectionRef = useRef(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [counts, setCounts] = useState({
    residential: 0,
    commercial: 0,
    visitors: 0,
  })

  useEffect(() => {
    const animateCounts = () => {
      const duration = 2000 // 2 seconds
      const steps = 60
      const stepDuration = duration / steps

      const targets = {
        residential: 10,
        commercial: 1000,
        visitors: 500,
      }

      let currentStep = 0

      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        // Use easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)

        setCounts({
          residential: Math.floor(targets.residential * easeOutQuart),
          commercial: Math.floor(targets.commercial * easeOutQuart),
          visitors: Math.floor(targets.visitors * easeOutQuart),
        })

        if (currentStep >= steps) {
          clearInterval(timer)
          // Ensure final values are exact
          setCounts(targets)
        }
      }, stepDuration)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            animateCounts()
          }
        })
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
      }
    )

    const currentRef = sectionRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasAnimated])

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8" ref={sectionRef}>
      <div className="group text-center p-6 rounded-lg border-2 border-[#c99700] transition hover:border-[#e7c778] hover:shadow-[0_12px_30px_rgba(201,151,0,0.3)]">
        <p className="text-4xl font-bold golden-text mb-2 transition group-hover:translate-y-[-2px]">
          {counts.residential}+
        </p>
        <p className="text-gray-800 font-medium transition group-hover:text-[#c99700]">Residential Projects</p>
      </div>
      <div className="group text-center p-6 rounded-lg border-2 border-[#c99700] transition hover:border-[#e7c778] hover:shadow-[0_12px_30px_rgba(201,151,0,0.3)]">
        <p className="text-4xl font-bold golden-text mb-2 transition group-hover:translate-y-[-2px]">
          {counts.commercial.toLocaleString()}+
        </p>
        <p className="text-gray-800 font-medium transition group-hover:text-[#c99700]">Commercial Projects</p>
      </div>
      <div className="group text-center p-6 rounded-lg border-2 border-[#c99700] transition hover:border-[#e7c778] hover:shadow-[0_12px_30px_rgba(201,151,0,0.3)]">
        <p className="text-4xl font-bold golden-text mb-2 transition group-hover:translate-y-[-2px]">
          {counts.visitors.toLocaleString()}+
        </p>
        <p className="text-gray-800 font-medium transition group-hover:text-[#c99700]">Monthly Visitors</p>
      </div>
    </div>
  )
}
