'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AddListingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Locations and developers state
  const [locations, setLocations] = useState([])
  const [developers, setDevelopers] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Common amenities list
  const commonAmenities = [
    'Swimming Pool',
    'Clubhouse',
    'Gymnasium',
    'Landscaped Gardens',
    '24/7 Security',
    'Power Backup',
    'Parking',
    'Children Play Area',
    'Lift',
    'Water Supply',
    'Rain Water Harvesting',
    'Sewage Treatment Plant',
    'Intercom Facility',
    'Fire Safety',
    'Shopping Mall',
    'Hospital',
    'School',
    'Metro Connectivity',
    'Wi-Fi',
    'CCTV Surveillance',
    'Jogging Track',
    'Tennis Court',
    'Basketball Court',
    'Badminton Court',
    'Squash Court',
    'Yoga/Meditation Area',
    'Party Hall',
    'Guest Rooms',
    'Library',
    'Business Center',
    'Concierge Service',
    'Pet Park',
    'Amphitheater',
    'Rooftop Garden',
    'Barbeque Area'
  ]

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    location: '',
    locationOther: '',
    area: '',
    areaOther: '',
    type: 'residential',
    developer: '',
    developerOther: '',
    amenities: [], // Changed to array
    price: '',
    price_min: '',
    price_max: '',
    carpet_area_min: '',
    carpet_area_max: '',
    project_status: '',
    rera_number: '',
    possession_date: '',
    is_featured: false,
    bhk_config: '',
    total_towers: '',
    total_units: '',
    parking: '',
    facing: '',
    project_highlights: '',
    nearby_landmarks: '',
    connectivity: '',
    payment_plan: '',
    short_description: '',
    full_description: ''
  })

  // Image state
  const [coverImage, setCoverImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState({
    cover: null,
    additional: []
  })

  // Form step state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4 // Basic Info, Additional Details, Images, Review

  // Generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })
  }

  // Fetch existing locations and developers
  useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch unique locations
        const { data: locationData, error: locationError } = await supabase
          .from('projects')
          .select('location')
          .not('location', 'is', null)
          .neq('location', '')

        if (!locationError && locationData) {
          const uniqueLocations = [...new Set(locationData.map(item => item.location).filter(Boolean))]
          setLocations(uniqueLocations.sort())
        }

        // Fetch unique developers
        const { data: developerData, error: developerError } = await supabase
          .from('projects')
          .select('developer')
          .not('developer', 'is', null)
          .neq('developer', '')

        if (!developerError && developerData) {
          const uniqueDevelopers = [...new Set(developerData.map(item => item.developer).filter(Boolean))]
          setDevelopers(uniqueDevelopers.sort())
        }
      } catch (err) {
        console.error('Error fetching options:', err)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Handle cover image
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews({ ...imagePreviews, cover: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle additional images
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    setAdditionalImages([...additionalImages, ...files])
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews({
          ...imagePreviews,
          additional: [...imagePreviews.additional, reader.result]
        })
      }
      reader.readAsDataURL(file)
    })
  }

  // Remove additional image
  const removeAdditionalImage = (index) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
    setImagePreviews({
      ...imagePreviews,
      additional: imagePreviews.additional.filter((_, i) => i !== index)
    })
  }

  // Upload image to Supabase Storage via API route
  const uploadImage = async (file, path) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload image')
    }

    const data = await response.json()
    return data.url
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate "other" fields
      if (formData.location === 'other' && !formData.locationOther.trim()) {
        setError('Please enter a location name when selecting "Other"')
        setLoading(false)
        return
      }

      if (formData.developer === 'other' && !formData.developerOther.trim()) {
        setError('Please enter a developer name when selecting "Other"')
        setLoading(false)
        return
      }

      if (formData.area === 'other' && !formData.areaOther.trim()) {
        setError('Please enter an area range when selecting "Other"')
        setLoading(false)
        return
      }

      // Determine final location value
      const finalLocation = formData.location === 'other' ? formData.locationOther.trim() : formData.location
      
      // Determine final developer value
      const finalDeveloper = formData.developer === 'other' ? formData.developerOther.trim() : (formData.developer || null)

      // Determine final area value
      const finalArea = formData.area === 'other' ? formData.areaOther.trim() : (formData.area || null)

      // Upload cover image
      let coverImageUrl = null
      if (coverImage) {
        const coverPath = `properties/${formData.slug}/cover-${Date.now()}.${coverImage.name.split('.').pop()}`
        coverImageUrl = await uploadImage(coverImage, coverPath)
      }

      // Upload additional images
      const additionalImageUrls = []
      for (let i = 0; i < additionalImages.length; i++) {
        const file = additionalImages[i]
        const imagePath = `properties/${formData.slug}/image-${Date.now()}-${i}.${file.name.split('.').pop()}`
        const imageUrl = await uploadImage(file, imagePath)
        additionalImageUrls.push(imageUrl)
      }

      // Insert project into database
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          slug: formData.slug,
          location: finalLocation,
          area: finalArea,
          price: formData.price ? Number(formData.price) : null,
          price_min: formData.price_min ? Number(formData.price_min) : null,
          price_max: formData.price_max ? Number(formData.price_max) : null,
          type: formData.type,
          developer: finalDeveloper,
          short_description: formData.short_description || null,
          full_description: formData.full_description || null,
          image_url: coverImageUrl,
          amenities: formData.amenities.length > 0 ? formData.amenities : null,
          carpet_area_min: formData.carpet_area_min ? Number(formData.carpet_area_min) : null,
          carpet_area_max: formData.carpet_area_max ? Number(formData.carpet_area_max) : null,
          project_status: formData.project_status && formData.project_status.trim() !== '' ? formData.project_status.trim() : null,
          rera_number: formData.rera_number || null,
          possession_date: formData.possession_date || null,
          is_featured: formData.is_featured || false,
          bhk_config: formData.bhk_config ? formData.bhk_config.split(',').map(s => s.trim()).filter(Boolean) : [],
          project_highlights: formData.project_highlights ? formData.project_highlights.split(',').map(s => s.trim()).filter(Boolean) : [],
          nearby_landmarks: formData.nearby_landmarks ? formData.nearby_landmarks.split(',').map(s => s.trim()).filter(Boolean) : [],
          connectivity: formData.connectivity || null,
          payment_plan: formData.payment_plan || null,
          total_towers: formData.total_towers ? Number(formData.total_towers) : null,
          total_units: formData.total_units ? Number(formData.total_units) : null,
          parking: formData.parking ? Number(formData.parking) : null,
          facing: formData.facing || null
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Automatically sync developer if a developer is specified
      if (finalDeveloper && finalDeveloper.trim()) {
        try {
          await fetch('/api/developers/sync-single', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              developerName: finalDeveloper
            })
          })
          // Don't throw error if sync fails - it's not critical for project creation
        } catch (syncError) {
          console.warn('Could not sync developer automatically:', syncError)
          // Continue anyway - project is already created
        }
      }

      // Insert additional images into project_images table
      if (additionalImageUrls.length > 0) {
        const imagesToInsert = additionalImageUrls.map((url) => ({
          project_id: project.id,
          image_url: url
        }))

        const { error: imagesError } = await supabase
          .from('project_images')
          .insert(imagesToInsert)

        if (imagesError) throw imagesError
      }

      setSuccess('Property added successfully!')
      setTimeout(() => {
        router.push(`/admin`)
      }, 2000)
    } catch (err) {
      console.error('Error adding listing:', err)
      setError(err.message || 'Failed to add listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
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

  // Redirect if not authenticated
  if (!user) {
    router.push('/admin/login')
    return null
  }

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Step validation
  const validateStep = (step) => {
    if (step === 1) {
      return formData.name && formData.location && formData.type
    }
    if (step === 3) {
      return coverImage !== null
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep()
    } else {
      setError('Please fill in all required fields')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/admin"
            className="golden-text hover:text-[#a67800] font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Add New Property Listing</h1>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? 'bg-[#c99700] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  <span className="mt-2 text-xs text-gray-600 text-center">
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Details'}
                    {step === 3 && 'Images'}
                    {step === 4 && 'Review'}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step ? 'bg-[#c99700]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#fff5d6] border border-[#f2cd6d] rounded-lg text-[#a67800]">
            {success}
          </div>
        )}

        {loadingOptions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            Loading location and developer options...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., Godrej Sora"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] text-gray-900 placeholder:text-gray-400"
                  placeholder="godrej-sora"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value, locationOther: '' })}
                  disabled={loadingOptions}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{loadingOptions ? 'Loading locations...' : 'Select Location'}</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="other">Other (Add New)</option>
                </select>
                {formData.location === 'other' && (
                  <input
                    type="text"
                    value={formData.locationOther}
                    onChange={(e) => setFormData({ ...formData, locationOther: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] mt-2 bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter new location name"
                    required
                  />
                )}
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <select
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value, areaOther: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                >
                  <option value="">Select Area Range (Optional)</option>
                  <option value="500-1000 sqft">500-1000 sqft</option>
                  <option value="1000-1500 sqft">1000-1500 sqft</option>
                  <option value="1500-2000 sqft">1500-2000 sqft</option>
                  <option value="2000-2500 sqft">2000-2500 sqft</option>
                  <option value="2500-3000 sqft">2500-3000 sqft</option>
                  <option value="3000-3500 sqft">3000-3500 sqft</option>
                  <option value="3500-4000 sqft">3500-4000 sqft</option>
                  <option value="4000-5000 sqft">4000-5000 sqft</option>
                  <option value="5000-7000 sqft">5000-7000 sqft</option>
                  <option value="7000-10000 sqft">7000-10000 sqft</option>
                  <option value="10000+ sqft">10000+ sqft</option>
                  <option value="other">Other (Custom Range)</option>
                </select>
                {formData.area === 'other' && (
                  <input
                    type="text"
                    value={formData.areaOther}
                    onChange={(e) => setFormData({ ...formData, areaOther: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] mt-2 bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., 1500-1800 sqft or 2500 sqft"
                    required
                  />
                )}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                >
                  <option value="residential">Residential</option>
                  <option value="builder-floor">Builder Floor</option>
                </select>
              </div>

              <div>
                <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-2">
                  Developer
                </label>
                <select
                  id="developer"
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value, developerOther: '' })}
                  disabled={loadingOptions}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{loadingOptions ? 'Loading developers...' : 'Select Developer (Optional)'}</option>
                  {developers.map((dev) => (
                    <option key={dev} value={dev}>
                      {dev}
                    </option>
                  ))}
                  <option value="other">Other (Add New)</option>
                </select>
                {formData.developer === 'other' && (
                  <input
                    type="text"
                    value={formData.developerOther}
                    onChange={(e) => setFormData({ ...formData, developerOther: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] mt-2 bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter new developer name"
                    required
                  />
                )}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                id="short_description"
                rows={2}
                value={formData.short_description || ''}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="Brief one-line description"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                id="full_description"
                rows={4}
                value={formData.full_description || ''}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="Comprehensive project description"
              />
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {commonAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            amenities: [...formData.amenities, amenity]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            amenities: formData.amenities.filter(a => a !== amenity)
                          })
                        }
                      }}
                      className="mr-2 w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
          </div>
            </div>
          </div>
          )}

          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="text"
                  id="price"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 5000000"
                />
              </div>

              <div>
                <label htmlFor="project_status" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Status
                </label>
                <select
                  id="project_status"
                  value={formData.project_status || ''}
                  onChange={(e) => setFormData({ ...formData, project_status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                >
                  <option value="">Select Status</option>
                  <option value="under-construction">Under Construction</option>
                  <option value="ready-to-move">Ready to Move</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>


              <div>
                <label htmlFor="carpet_area_min" className="block text-sm font-medium text-gray-700 mb-2">
                  Carpet Area Min (sqft)
                </label>
                <input
                  type="number"
                  id="carpet_area_min"
                  value={formData.carpet_area_min || ''}
                  onChange={(e) => setFormData({ ...formData, carpet_area_min: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="carpet_area_max" className="block text-sm font-medium text-gray-700 mb-2">
                  Carpet Area Max (sqft)
                </label>
                <input
                  type="number"
                  id="carpet_area_max"
                  value={formData.carpet_area_max || ''}
                  onChange={(e) => setFormData({ ...formData, carpet_area_max: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="price_min" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Min (₹)
                </label>
                <input
                  type="number"
                  id="price_min"
                  value={formData.price_min || ''}
                  onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="price_max" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Max (₹)
                </label>
                <input
                  type="number"
                  id="price_max"
                  value={formData.price_max || ''}
                  onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="rera_number" className="block text-sm font-medium text-gray-700 mb-2">
                  RERA Number
                </label>
                <input
                  type="text"
                  id="rera_number"
                  value={formData.rera_number || ''}
                  onChange={(e) => setFormData({ ...formData, rera_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="possession_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Possession Date
                </label>
                <input
                  type="date"
                  id="possession_date"
                  value={formData.possession_date || ''}
                  onChange={(e) => setFormData({ ...formData, possession_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="bhk_config" className="block text-sm font-medium text-gray-700 mb-2">
                  BHK Config (comma separated)
                </label>
                <input
                  type="text"
                  id="bhk_config"
                  value={formData.bhk_config || ''}
                  onChange={(e) => setFormData({ ...formData, bhk_config: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="2BHK, 3BHK, 4BHK"
                />
              </div>

              <div>
                <label htmlFor="total_towers" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Towers
                </label>
                <input
                  type="number"
                  id="total_towers"
                  value={formData.total_towers || ''}
                  onChange={(e) => setFormData({ ...formData, total_towers: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="total_units" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Units
                </label>
                <input
                  type="number"
                  id="total_units"
                  value={formData.total_units || ''}
                  onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="parking" className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  id="parking"
                  value={formData.parking || ''}
                  onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="facing" className="block text-sm font-medium text-gray-700 mb-2">
                  Facing
                </label>
                <select
                  id="facing"
                  value={formData.facing || ''}
                  onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                >
                  <option value="">Select Facing</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured || false}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Project</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="project_highlights" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Highlights (comma separated)
                </label>
                <input
                  type="text"
                  id="project_highlights"
                  value={formData.project_highlights || ''}
                  onChange={(e) => setFormData({ ...formData, project_highlights: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="Premium Location, Modern Amenities"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="nearby_landmarks" className="block text-sm font-medium text-gray-700 mb-2">
                  Nearby Landmarks (comma separated)
                </label>
                <input
                  type="text"
                  id="nearby_landmarks"
                  value={formData.nearby_landmarks || ''}
                  onChange={(e) => setFormData({ ...formData, nearby_landmarks: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="Metro Station, Shopping Mall, School"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="connectivity" className="block text-sm font-medium text-gray-700 mb-2">
                  Connectivity
                </label>
                <textarea
                  id="connectivity"
                  rows={3}
                  value={formData.connectivity || ''}
                  onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="Connectivity details..."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="payment_plan" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Plan
                </label>
                <textarea
                  id="payment_plan"
                  rows={3}
                  value={formData.payment_plan || ''}
                  onChange={(e) => setFormData({ ...formData, payment_plan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="Payment plan details..."
                />
              </div>
            </div>
          </div>
          )}

          {/* Step 3: Images Section */}
          {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Images</h2>

            {/* Cover Image */}
            <div className="mb-6">
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image * (This will be the main image)
              </label>
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                required
              />
              {imagePreviews.cover && (
                <div className="mt-4">
                  <img
                    src={imagePreviews.cover}
                    alt="Cover preview"
                    className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <label htmlFor="additionalImages" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Images (Multiple images can be selected)
              </label>
              <input
                type="file"
                id="additionalImages"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
              />
              
              {imagePreviews.additional.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.additional.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Step 4: Review Page */}
          {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Review Your Listing</h2>
            
            <div className="space-y-6">
              {/* Basic Information Review */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Property Name:</span>
                    <span className="ml-2 text-gray-900">{formData.name || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Slug:</span>
                    <span className="ml-2 text-gray-900">{formData.slug || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-900">{formData.location === 'other' ? formData.locationOther : formData.location || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Area:</span>
                    <span className="ml-2 text-gray-900">{formData.area === 'other' ? formData.areaOther : formData.area || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-900 capitalize">{formData.type || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Developer:</span>
                    <span className="ml-2 text-gray-900">{formData.developer === 'other' ? formData.developerOther : formData.developer || '-'}</span>
                  </div>
                  {formData.short_description && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Short Description:</span>
                      <p className="mt-1 text-gray-900">{formData.short_description}</p>
                    </div>
                  )}
                  {formData.full_description && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Full Description:</span>
                      <p className="mt-1 text-gray-900">{formData.full_description}</p>
                    </div>
                  )}
                  {formData.amenities.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Amenities:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details Review */}
              {(formData.price || formData.project_status || formData.short_description || formData.full_description || formData.carpet_area_min || formData.price_min || formData.rera_number || formData.bhk_config || formData.total_towers) && (
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {formData.price && (
                      <div>
                        <span className="font-medium text-gray-700">Price:</span>
                        <span className="ml-2 text-gray-900">₹{Number(formData.price).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {formData.price_min && formData.price_max && (
                      <div>
                        <span className="font-medium text-gray-700">Price Range:</span>
                        <span className="ml-2 text-gray-900">₹{Number(formData.price_min).toLocaleString('en-IN')} - ₹{Number(formData.price_max).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {formData.project_status && (
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-gray-900 capitalize">{formData.project_status.replace('-', ' ')}</span>
                      </div>
                    )}
                    {formData.carpet_area_min && formData.carpet_area_max && (
                      <div>
                        <span className="font-medium text-gray-700">Carpet Area:</span>
                        <span className="ml-2 text-gray-900">{formData.carpet_area_min} - {formData.carpet_area_max} sqft</span>
                      </div>
                    )}
                    {formData.bhk_config && (
                      <div>
                        <span className="font-medium text-gray-700">BHK Config:</span>
                        <span className="ml-2 text-gray-900">{formData.bhk_config}</span>
                      </div>
                    )}
                    {formData.rera_number && (
                      <div>
                        <span className="font-medium text-gray-700">RERA Number:</span>
                        <span className="ml-2 text-gray-900">{formData.rera_number}</span>
                      </div>
                    )}
                    {formData.possession_date && (
                      <div>
                        <span className="font-medium text-gray-700">Possession Date:</span>
                        <span className="ml-2 text-gray-900">{formData.possession_date ? new Date(formData.possession_date + 'T00:00:00').toLocaleDateString() : '-'}</span>
                      </div>
                    )}
                    {formData.total_towers && (
                      <div>
                        <span className="font-medium text-gray-700">Total Towers:</span>
                        <span className="ml-2 text-gray-900">{formData.total_towers}</span>
                      </div>
                    )}
                    {formData.total_units && (
                      <div>
                        <span className="font-medium text-gray-700">Total Units:</span>
                        <span className="ml-2 text-gray-900">{formData.total_units}</span>
                      </div>
                    )}
                    {formData.parking && (
                      <div>
                        <span className="font-medium text-gray-700">Parking:</span>
                        <span className="ml-2 text-gray-900">{formData.parking} spaces</span>
                      </div>
                    )}
                    {formData.facing && (
                      <div>
                        <span className="font-medium text-gray-700">Facing:</span>
                        <span className="ml-2 text-gray-900">{formData.facing}</span>
                      </div>
                    )}
                    {formData.is_featured && (
                      <div>
                        <span className="font-medium text-gray-700">Featured:</span>
                        <span className="ml-2 text-gray-900">Yes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Images Review */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                <div className="space-y-4">
                  {imagePreviews.cover && (
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Cover Image:</span>
                      <div className="mt-2">
                        <img
                          src={imagePreviews.cover}
                          alt="Cover preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  )}
                  {imagePreviews.additional.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Additional Images ({imagePreviews.additional.length}):</span>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.additional.map((preview, index) => (
                          <img
                            key={index}
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {!imagePreviews.cover && imagePreviews.additional.length === 0 && (
                    <p className="text-gray-500 text-sm">No images selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Previous
                </button>
              )}
              {currentStep === 1 && (
            <Link
              href="/admin"
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition inline-block"
            >
              Cancel
            </Link>
              )}
            </div>
            <div>
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
                >
                  Next →
                </button>
              ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                  {loading ? 'Adding...' : 'Submit Listing'}
            </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
