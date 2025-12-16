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
  const [imageUploadSuccess, setImageUploadSuccess] = useState('')
  
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
    type: '',
    developer: '',
    developerOther: '',
    amenities: [], // Changed to array
    price: '',
    project_status: '',
    possession_date: '',
    is_featured: false,
    tower_bhk_config: [{ // Array of tower configurations
      tower_number: 1,
      bhk: '',
      area_sqft: '',
      flats_per_floor: '',
      floors_in_tower: '',
      lifts: '',
      penthouse: false,
      parking_per_floor: ''
    }],
    total_towers: '',
    total_units: '',
    facing: '',
    club_house: false,
    club_house_area: '',
    project_highlights: '',
    nearby_landmarks: '',
    connectivity: '',
    payment_plan: '',
    short_description: '',
    full_description: '',
    // Builder floor specific
    plot_number: '',
    plot_size: '',
    total_land_parcel: '',
    status: '',
    building_config: [{ // Array of building configurations
      building_number: 1,
      plot_size: '',
      facing: '',
      floors_count: '',
      roof_rights: '',
      condition: '',
      status: '',
      category: '',
      possession_date: '',
      owner_name: '',
      comments: '',
      brochure_url: '',
      price_top: '',
      price_mid1: '',
      price_mid2: '',
      price_ug: '',
      has_basement: false,
      is_triplex: false,
      is_gated: false,
    }]
  })

  // Image state
  const [coverImage, setCoverImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  
  // Brochure state
  const [brochureFile, setBrochureFile] = useState(null)
  const [imagePreviews, setImagePreviews] = useState({
    cover: null,
    additional: []
  })

  // Form step state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5 // Type, Basic Info, Additional Details, Images, Review


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
        // Fetch unique locations from both projects and builder_floors tables
        const [projectsResult, builderFloorsResult] = await Promise.all([
          supabase
            .from('projects')
            .select('location')
            .not('location', 'is', null)
            .neq('location', ''),
          supabase
            .from('builder_floors')
            .select('location')
            .not('location', 'is', null)
            .neq('location', '')
        ])

        // Combine locations from both tables
        const allLocations = []
        if (!projectsResult.error && projectsResult.data) {
          allLocations.push(...projectsResult.data.map(item => item.location).filter(Boolean))
        }
        if (!builderFloorsResult.error && builderFloorsResult.data) {
          allLocations.push(...builderFloorsResult.data.map(item => item.location).filter(Boolean))
        }

        // Get unique locations and sort
        const uniqueLocations = [...new Set(allLocations)]
        setLocations(uniqueLocations.sort())

        // Fetch unique developers from both projects and builder_floors tables
        const [projectsDevResult, builderFloorsDevResult] = await Promise.all([
          supabase
            .from('projects')
            .select('developer')
            .not('developer', 'is', null)
            .neq('developer', ''),
          supabase
            .from('builder_floors')
            .select('developer')
            .not('developer', 'is', null)
            .neq('developer', '')
        ])

        // Combine developers from both tables
        const allDevelopers = []
        if (!projectsDevResult.error && projectsDevResult.data) {
          allDevelopers.push(...projectsDevResult.data.map(item => item.developer).filter(Boolean))
        }
        if (!builderFloorsDevResult.error && builderFloorsDevResult.data) {
          allDevelopers.push(...builderFloorsDevResult.data.map(item => item.developer).filter(Boolean))
        }

        // Get unique developers and sort
        const uniqueDevelopers = [...new Set(allDevelopers)]
        setDevelopers(uniqueDevelopers.sort())
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

  // Handle brochure file
  const handleBrochureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate PDF
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file for the brochure')
        return
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Brochure file size should be less than 10MB')
        return
      }
      setBrochureFile(file)
      setError('')
    }
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
    // Don't clear imageUploadSuccess - let it persist to show image upload status

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

      // Determine final location value
      const finalLocation = formData.location === 'other' ? formData.locationOther.trim() : formData.location
      
      // Determine final developer value
      const finalDeveloper = formData.developer === 'other' ? formData.developerOther.trim() : (formData.developer || null)

      // Determine final area value (now a single value, not a range)
      const finalArea = formData.area && formData.area.trim() !== '' ? formData.area.trim() : null

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

      // Upload brochure PDF
      let brochureUrl = null
      if (brochureFile) {
        try {
          console.log('Uploading brochure file:', brochureFile.name, brochureFile.size, 'bytes', 'Type:', brochureFile.type)
          const brochurePath = `properties/${formData.slug}/brochure-${Date.now()}.pdf`
          brochureUrl = await uploadImage(brochureFile, brochurePath)
          console.log('Brochure uploaded successfully, URL:', brochureUrl)
          if (!brochureUrl) {
            console.error('Brochure upload returned null/undefined URL')
            throw new Error('Brochure upload failed: No URL returned')
          }
        } catch (brochureError) {
          console.error('Error uploading brochure:', brochureError)
          setError(`Failed to upload brochure: ${brochureError.message}`)
          setLoading(false)
          return
        }
      } else {
        console.log('No brochure file to upload')
      }

      // Prepare tower_bhk_config JSON
      let towerBhkConfigJson = null
      if (formData.tower_bhk_config && Array.isArray(formData.tower_bhk_config) && formData.tower_bhk_config.length > 0) {
        try {
          towerBhkConfigJson = JSON.stringify(formData.tower_bhk_config)
        } catch (jsonError) {
          console.error('Error stringifying tower_bhk_config:', jsonError, formData.tower_bhk_config)
          // Continue without tower_bhk_config if JSON stringify fails
        }
      }

      // Prepare bhk_config array
      const bhkConfigArray = formData.tower_bhk_config && Array.isArray(formData.tower_bhk_config) && formData.tower_bhk_config.length > 0
        ? formData.tower_bhk_config.map(t => t && t.bhk ? t.bhk : null).filter(Boolean)
        : []

      console.log('Submitting project with data:', {
        name: formData.name,
        slug: formData.slug,
        tower_bhk_config: towerBhkConfigJson,
        bhk_config: bhkConfigArray,
        brochure_url: brochureUrl
      })

      // Branch by property type
      if (formData.type === 'builder-floor') {
        // Process building_config - convert string numbers to numbers and handle brochure files
        const processedBuildingConfig = await Promise.all(
          formData.building_config.map(async (building) => {
            let buildingBrochureUrl = building.brochure_url || null

            // Upload brochure file if present
            if (building.brochure_file) {
              try {
                const brochureFormData = new FormData()
                brochureFormData.append('file', building.brochure_file)
                brochureFormData.append('folder', 'builder-floors/brochures')

                const uploadResponse = await fetch('/api/upload', {
                  method: 'POST',
                  body: brochureFormData,
                })

                if (uploadResponse.ok) {
                  const uploadResult = await uploadResponse.json()
                  buildingBrochureUrl = uploadResult.url
                } else {
                  console.error('Failed to upload building brochure:', await uploadResponse.text())
                }
              } catch (uploadError) {
                console.error('Error uploading building brochure:', uploadError)
              }
            }

            return {
              ...building,
              building_number: building.building_number || 1,
              floors_count: building.floors_count !== '' ? Number(building.floors_count) : null,
              price_top: building.price_top !== '' ? Number(building.price_top) : null,
              price_mid1: building.price_mid1 !== '' ? Number(building.price_mid1) : null,
              price_mid2: building.price_mid2 !== '' ? Number(building.price_mid2) : null,
              price_ug: building.price_ug !== '' ? Number(building.price_ug) : null,
              has_basement: !!building.has_basement,
              is_triplex: !!building.is_triplex,
              is_gated: !!building.is_gated,
              brochure_url: buildingBrochureUrl,
            }
          })
        )

        // Create builder floor via admin API
        const createResponse = await fetch('/api/builder-floors/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            location: finalLocation,
            developer: finalDeveloper,
            total_land_parcel: formData.total_land_parcel || null,
            status: formData.status || null,
            plot_number: formData.plot_number || null,
            building_config: processedBuildingConfig.length > 0 ? processedBuildingConfig : null,
            short_description: formData.short_description || null,
            full_description: formData.full_description || null,
            image_url: coverImageUrl,
            brochure_url: brochureUrl
          })
        })

        const contentType = createResponse.headers.get('content-type') || ''
        let createResult = null
        try {
          if (contentType.includes('application/json')) {
            createResult = await createResponse.json()
          } else {
            const text = await createResponse.text()
            throw new Error(`Unexpected response (status ${createResponse.status}): ${text?.slice(0, 200) || 'No body'}`)
          }
        } catch (parseErr) {
          console.error('Create builder floor response parse error:', parseErr)
          throw new Error('Failed to parse server response while creating builder floor. Please retry.')
        }

        if (!createResponse.ok) {
          console.error('Create builder floor API error:', createResult)
          throw new Error(createResult?.error || 'Failed to create builder floor')
        }

        const { builderFloor } = createResult || {}

        // Insert additional images
        if (additionalImageUrls.length > 0 && builderFloor?.id) {
          const imagesToInsert = additionalImageUrls.map((url, index) => ({
            image_url: url,
            display_order: index + 1
          }))

          const imagesResponse = await fetch('/api/builder-floors/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              builderFloorId: builderFloor.id,
              images: imagesToInsert
            })
          })

          if (!imagesResponse.ok) {
            const errorData = await imagesResponse.json()
            console.error('Failed to insert builder floor images:', errorData)
            throw new Error(errorData.error || 'Failed to insert builder floor images')
          }
        }

        setSuccess('Builder floor added successfully!')
        setTimeout(() => {
          router.push(`/admin`)
        }, 1500)
        return
      }

      // Insert project via admin API (bypasses RLS)
      const createResponse = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          location: finalLocation,
          area: finalArea,
          price: formData.price ? Number(formData.price) : null,
          type: formData.type,
          developer: finalDeveloper,
          short_description: formData.short_description || null,
          full_description: formData.full_description || null,
          image_url: coverImageUrl,
          amenities: formData.amenities && Array.isArray(formData.amenities) && formData.amenities.length > 0 ? formData.amenities : null,
          project_status: formData.project_status && formData.project_status.trim() !== '' ? formData.project_status.trim() : null,
          possession_date: formData.possession_date && formData.possession_date.trim() !== '' ? formData.possession_date.trim() : null,
          is_featured: formData.is_featured || false,
          bhk_config: bhkConfigArray,
          tower_bhk_config: towerBhkConfigJson,
          project_highlights: formData.project_highlights ? formData.project_highlights.split(',').map(s => s.trim()).filter(Boolean) : [],
          nearby_landmarks: formData.nearby_landmarks ? formData.nearby_landmarks.split(',').map(s => s.trim()).filter(Boolean) : [],
          connectivity: formData.connectivity || null,
          payment_plan: formData.payment_plan || null,
          total_towers: formData.total_towers ? Number(formData.total_towers) : null,
          total_units: formData.total_units ? Number(formData.total_units) : null,
          facing: formData.type === 'builder-floor' ? (formData.facing || null) : null,
          club_house: formData.club_house || false,
          club_house_area: formData.club_house && formData.club_house_area ? formData.club_house_area : null,
          brochure_url: brochureUrl
        })
      })

      // Parse response safely (avoid HTML/redirect parsing errors)
      const contentType = createResponse.headers.get('content-type') || ''
      let createResult = null
      try {
        if (contentType.includes('application/json')) {
          createResult = await createResponse.json()
        } else {
          const text = await createResponse.text()
          throw new Error(`Unexpected response (status ${createResponse.status}): ${text?.slice(0, 200) || 'No body'}`)
        }
      } catch (parseErr) {
        console.error('Create project response parse error:', parseErr)
        throw new Error('Failed to parse server response while creating project. Please retry.')
      }

      if (!createResponse.ok) {
        console.error('Create project API error:', createResult)
        throw new Error(createResult?.error || 'Failed to create project')
      }

      const { project } = createResult || {}

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

      // Insert additional images into project_images table via API route
      if (additionalImageUrls.length > 0) {
        const imagesToInsert = additionalImageUrls.map((url, index) => ({
          image_url: url,
          display_order: index + 1
        }))

        const imagesResponse = await fetch('/api/projects/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            projectId: project.id,
            images: imagesToInsert
          })
        })

        if (!imagesResponse.ok) {
          const errorData = await imagesResponse.json()
          console.error('Failed to insert project images:', errorData)
          throw new Error(errorData.error || 'Failed to insert project images')
        }

        const imagesResult = await imagesResponse.json()
        console.log('✅ Project images inserted successfully:', imagesResult)
        setImageUploadSuccess(`✅ ${additionalImageUrls.length} image(s) added successfully!`)
        // Clear the success message after 5 seconds
        setTimeout(() => setImageUploadSuccess(''), 5000)
      }

      setSuccess('Property added successfully!')
      setTimeout(() => {
        router.push(`/admin`)
      }, 2000)
    } catch (err) {
      console.error('Error adding listing:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        cause: err.cause
      })
      setError(err.message || 'Failed to add listing. Please try again.')
      setLoading(false)
    }
  }

  // Production-ready auth check
  useEffect(() => {
    if (!isLoaded) return; // ⬅️ wait for Clerk
    if (!user) {
      router.push('/admin/login')
    }
  }, [isLoaded, user, router])

  if (!isLoaded) return null; // ⬅️ wait for Clerk before rendering

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
      // Step 1: must choose property type
      return !!formData.type
    }
    if (step === 2) {
      // Step 2: basic info – keep it simple
      return !!formData.name && !!formData.location
    }
    if (step === 4) {
      // Step 4: images – require cover image
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
            {[1, 2, 3, 4, 5].map((step) => (
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
                    {step === 1 && 'Property Type'}
                    {step === 2 && 'Basic Info'}
                    {step === 3 && 'Details'}
                    {step === 4 && 'Images & Payment'}
                    {step === 5 && 'Review'}
                  </span>
                </div>
                {step < 5 && (
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

        {imageUploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {imageUploadSuccess}
          </div>
        )}

        {loadingOptions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            Loading location and developer options...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">

        {/* Step 1: Property Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Property Type</h2>
            <p className="text-sm text-gray-600">
              Choose whether you are adding a residential apartment project or a builder floor.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'apartment' })}
                className={`w-full px-4 py-3 border rounded-lg text-left transition ${
                  formData.type === 'apartment'
                    ? 'border-[#c99700] bg-[#fff5d6]'
                    : 'border-gray-300 bg-white hover:border-[#c99700]'
                }`}
              >
                <div className="font-semibold text-gray-900">Residential Apartment</div>
                <div className="text-xs text-gray-600 mt-1">
                  Multi-tower residential projects with amenities and BHK configuration.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'builder-floor' })}
                className={`w-full px-4 py-3 border rounded-lg text-left transition ${
                  formData.type === 'builder-floor'
                    ? 'border-[#c99700] bg-[#fff5d6]'
                    : 'border-gray-300 bg-white hover:border-[#c99700]'
                }`}
              >
                <div className="font-semibold text-gray-900">Builder Floor</div>
                <div className="text-xs text-gray-600 mt-1">
                  Individual builder floors on plotted developments.
                </div>
              </button>
            </div>

            {formData.type && (
              <p className="text-sm text-gray-700 mt-4">
                Selected type:{' '}
                <span className="font-semibold capitalize">
                  {formData.type === 'apartment' ? 'Residential Apartment' : 'Builder Floor'}
                </span>
              </p>
            )}
          </div>
        )}


          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
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

              {formData.type !== 'builder-floor' ? (
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Parcel area (acres)
                  </label>
                  <input
                    type="text"
                    id="area"
                    value={formData.area || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow empty, or positive numbers (including decimals)
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        const numValue = parseFloat(value)
                        if (value === '' || (numValue >= 0 && !isNaN(numValue))) {
                          setFormData({ ...formData, area: value })
                        }
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., 2.5"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="total_land_parcel" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Land Parcel (Optional)
                    </label>
                    <input
                      type="text"
                      id="total_land_parcel"
                      value={formData.total_land_parcel || ''}
                      onChange={(e) => setFormData({ ...formData, total_land_parcel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="e.g., 5 acres or 2.5 hectares"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    >
                      <option value="">Select Status</option>
                      <option value="ready-to-move">Ready to Move</option>
                      <option value="under-construction">Under Construction</option>
                    </select>
                  </div>
                </>
              )}

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

            {/* Amenities - residential only */}
            {formData.type !== 'builder-floor' && (
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
            )}
          </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Details</h2>
            
            {formData.type !== 'builder-floor' ? (
              <div className="space-y-6">
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
                    <label htmlFor="possession_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Possession (Year)
                    </label>
                    <input
                      type="number"
                      id="possession_date"
                      min="2020"
                      max="2050"
                      value={formData.possession_date || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || (Number(value) >= 2020 && Number(value) <= 2050)) {
                          setFormData({ ...formData, possession_date: value })
                        }
                      }}
                      placeholder="e.g., 2025"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* BHK Configuration Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      BHK Configuration
                    </label>
                  </div>
                  <div className="space-y-6">
                    {formData.tower_bhk_config.map((tower, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Tower {tower.tower_number}</h3>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newTowers = formData.tower_bhk_config.filter((_, i) => i !== index)
                                setFormData({ ...formData, tower_bhk_config: newTowers })
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove Tower
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              BHK
                            </label>
                            <input
                              type="text"
                              value={tower.bhk || ''}
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const processedValue = inputValue
                                  .split(/[, ]+/)
                                  .map(item => {
                                    const trimmed = item.trim()
                                    if (/^\d+$/.test(trimmed)) {
                                      return trimmed + 'BHK'
                                    }
                                    if (trimmed.toLowerCase().includes('bhk')) {
                                      return trimmed
                                    }
                                    return trimmed
                                  })
                                  .join(', ')
                                
                                const newTowers = [...formData.tower_bhk_config]
                                newTowers[index].bhk = processedValue
                                setFormData({ ...formData, tower_bhk_config: newTowers })
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                              placeholder="e.g., 2, 3 (auto becomes 2BHK, 3BHK)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Area (sqft)
                            </label>
                            <input
                              type="text"
                              value={tower.area_sqft || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || /^\d*\.?\d*\s*-\s*\d*\.?\d*$/.test(value) || /^\d*\.?\d*$/.test(value)) {
                                  const newTowers = [...formData.tower_bhk_config]
                                  newTowers[index].area_sqft = value
                                  setFormData({ ...formData, tower_bhk_config: newTowers })
                                }
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                              placeholder="e.g., 1000-1500 sqft"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Flats/Floor
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tower.flats_per_floor || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || Number(value) >= 0) {
                                  const newTowers = [...formData.tower_bhk_config]
                                  newTowers[index].flats_per_floor = value
                                  setFormData({ ...formData, tower_bhk_config: newTowers })
                                }
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                              placeholder="e.g., 4"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Floors in Tower
                            </label>
                            <input
                              type="text"
                              value={tower.floors_in_tower || ''}
                              onChange={(e) => {
                                const newTowers = [...formData.tower_bhk_config]
                                newTowers[index].floors_in_tower = e.target.value
                                setFormData({ ...formData, tower_bhk_config: newTowers })
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                              placeholder="e.g., G+14"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              No. of Lifts
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tower.lifts || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || Number(value) >= 0) {
                                  const newTowers = [...formData.tower_bhk_config]
                                  newTowers[index].lifts = value
                                  setFormData({ ...formData, tower_bhk_config: newTowers })
                                }
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                              placeholder="e.g., 2"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`penthouse-${index}`}
                              checked={tower.penthouse || false}
                              onChange={(e) => {
                                const newTowers = [...formData.tower_bhk_config]
                                newTowers[index].penthouse = e.target.checked
                                setFormData({ ...formData, tower_bhk_config: newTowers })
                              }}
                              className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b] focus:ring-2"
                            />
                            <label htmlFor={`penthouse-${index}`} className="ml-2 text-sm font-medium text-gray-700">
                              Penthouse
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Parking/Floor
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={tower.parking_per_floor || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || (Number(value) >= 0)) {
                                  const newTowers = [...formData.tower_bhk_config]
                                  newTowers[index].parking_per_floor = value
                                  setFormData({ ...formData, tower_bhk_config: newTowers })
                                }
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                              placeholder="e.g., 4"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextTowerNumber = formData.tower_bhk_config.length + 1
                        setFormData({
                          ...formData,
                          tower_bhk_config: [
                            ...formData.tower_bhk_config,
                            {
                              tower_number: nextTowerNumber,
                              bhk: '',
                              area_sqft: '',
                              flats_per_floor: '',
                              floors_in_tower: '',
                              lifts: '',
                              penthouse: false,
                              parking_per_floor: ''
                            }
                          ]
                        })
                      }}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-[#c99700] hover:text-[#c99700] transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Another Tower
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="total_towers" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Towers
                    </label>
                    <input
                      type="number"
                      id="total_towers"
                      min="0"
                      value={formData.total_towers || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || Number(value) >= 0) {
                          setFormData({ ...formData, total_towers: value })
                        }
                      }}
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
                      min="0"
                      value={formData.total_units || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || Number(value) >= 0) {
                          setFormData({ ...formData, total_units: value })
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Building Configuration - Details
                </h2>

                <div className="space-y-6">
                  {formData.building_config.map((building, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Building {building.building_number || index + 1}
                        </h3>
                        {formData.building_config.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newConfig = formData.building_config.filter((_, i) => i !== index)
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove Building
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plot Size (sqyd)
                          </label>
                          <input
                            type="text"
                            value={building.plot_size || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].plot_size = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                            placeholder="e.g., 263 sqyd"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facing (Optional)
                          </label>
                          <select
                            value={building.facing || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].facing = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Floors
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={building.floors_count || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].floors_count = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                            placeholder="e.g., 4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roof Rights
                          </label>
                          <select
                            value={building.roof_rights || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].roof_rights = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          >
                            <option value="">Select</option>
                            <option value="full">Full</option>
                            <option value="half">Half</option>
                            <option value="1/3">1/3</option>
                            <option value="1/4">1/4</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Condition
                          </label>
                          <select
                            value={building.condition || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].condition = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          >
                            <option value="">Select</option>
                            <option value="new">New</option>
                            <option value="old">Old</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={building.status || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].status = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          >
                            <option value="">Select</option>
                            <option value="ready-to-move">Ready to Move</option>
                            <option value="under-construction">Under Construction</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={building.category || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].category = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          >
                            <option value="">Select</option>
                            <option value="deendayal">Deendayal</option>
                            <option value="regular">Regular</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Possession Date
                          </label>
                          <input
                            type="text"
                            value={building.possession_date || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].possession_date = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            placeholder="e.g., 2025 or Jan 2026"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Owner Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={building.owner_name || ''}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].owner_name = e.target.value
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comments / Additional Notes
                        </label>
                        <textarea
                          rows={3}
                          value={building.comments || ''}
                          onChange={(e) => {
                            const newConfig = [...formData.building_config]
                            newConfig[index].comments = e.target.value
                            setFormData({
                              ...formData,
                              building_config: newConfig,
                            })
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          placeholder="Additional notes or comments for this building"
                        />
                      </div>

                      <div className="md:col-span-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brochure (PDF)
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const newConfig = [...formData.building_config]
                              newConfig[index].brochure_file = e.target.files[0]
                              setFormData({
                                ...formData,
                                building_config: newConfig,
                              })
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                        />
                      </div>

                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Pricing</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Top Floor Price
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={building.price_top || ''}
                              onChange={(e) => {
                                const newConfig = [...formData.building_config]
                                newConfig[index].price_top = e.target.value
                                setFormData({
                                  ...formData,
                                  building_config: newConfig,
                                })
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                              placeholder="Price in ₹"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mid Floor Price 1
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={building.price_mid1 || ''}
                              onChange={(e) => {
                                const newConfig = [...formData.building_config]
                                newConfig[index].price_mid1 = e.target.value
                                setFormData({
                                  ...formData,
                                  building_config: newConfig,
                                })
                              }}
                              disabled={building.floors_count && Number(building.floors_count) === 2}
                              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] ${
                                building.floors_count && Number(building.floors_count) === 2
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-white text-gray-900'
                              }`}
                              placeholder="Price in ₹"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mid Floor Price 2
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={building.price_mid2 || ''}
                              onChange={(e) => {
                                const newConfig = [...formData.building_config]
                                newConfig[index].price_mid2 = e.target.value
                                setFormData({
                                  ...formData,
                                  building_config: newConfig,
                                })
                              }}
                              disabled={
                                (building.floors_count && Number(building.floors_count) === 2) ||
                                (building.floors_count && Number(building.floors_count) === 3)
                              }
                              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] ${
                                (building.floors_count && Number(building.floors_count) === 2) ||
                                (building.floors_count && Number(building.floors_count) === 3)
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-white text-gray-900'
                              }`}
                              placeholder="Price in ₹"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              UG Floor Price
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={building.price_ug || ''}
                              onChange={(e) => {
                                const newConfig = [...formData.building_config]
                                newConfig[index].price_ug = e.target.value
                                setFormData({
                                  ...formData,
                                  building_config: newConfig,
                                })
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                              placeholder="Price in ₹"
                            />
                          </div>

                          <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={building.has_basement || false}
                                onChange={(e) => {
                                  const newConfig = [...formData.building_config]
                                  newConfig[index].has_basement = e.target.checked
                                  setFormData({
                                    ...formData,
                                    building_config: newConfig,
                                  })
                                }}
                                className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                              />
                              <span className="ml-2 text-sm text-gray-700">Basement</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={building.is_triplex || false}
                                onChange={(e) => {
                                  const newConfig = [...formData.building_config]
                                  newConfig[index].is_triplex = e.target.checked
                                  setFormData({
                                    ...formData,
                                    building_config: newConfig,
                                  })
                                }}
                                className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                              />
                              <span className="ml-2 text-sm text-gray-700">Triplex</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={building.is_gated || false}
                                onChange={(e) => {
                                  const newConfig = [...formData.building_config]
                                  newConfig[index].is_gated = e.target.checked
                                  setFormData({
                                    ...formData,
                                    building_config: newConfig,
                                  })
                                }}
                                className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                              />
                              <span className="ml-2 text-sm text-gray-700">Gated</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const nextBuildingNumber = formData.building_config.length + 1
                      setFormData({
                        ...formData,
                        building_config: [
                          ...formData.building_config,
                          {
                            building_number: nextBuildingNumber,
                            plot_size: '',
                            facing: '',
                            floors_count: '',
                            roof_rights: '',
                            condition: '',
                            status: '',
                            category: '',
                            possession_date: '',
                            owner_name: '',
                            comments: '',
                            brochure_url: '',
                            price_top: '',
                            price_mid1: '',
                            price_mid2: '',
                            price_ug: '',
                            has_basement: false,
                            is_triplex: false,
                            is_gated: false,
                          },
                        ],
                      })
                    }}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-[#c99700] hover:text-[#c99700] transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another Building
                  </button>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plot Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.plot_number || ''}
                        onChange={(e) => setFormData({ ...formData, plot_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                        placeholder="e.g., Plot 123"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="club_house"
                    checked={formData.club_house}
                    onChange={(e) => setFormData({ ...formData, club_house: e.target.checked, club_house_area: e.target.checked ? formData.club_house_area : '' })}
                    className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b] focus:ring-2"
                  />
                  <label htmlFor="club_house" className="ml-2 text-sm font-medium text-gray-700">
                    Club House
                  </label>
                </div>
                {formData.club_house && (
                  <input
                    type="text"
                    id="club_house_area"
                    value={formData.club_house_area || ''}
                    onChange={(e) => setFormData({ ...formData, club_house_area: e.target.value })}
                    placeholder="Enter club house area (e.g., 5000 sqft)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400 mt-2"
                  />
                )}
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
            </div>
        
          )}

          {/* Step 4: Images Section */}
          {currentStep === 4 && (
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
              {imageUploadSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {imageUploadSuccess}
                </div>
              )}
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

            {/* Property Brochure */}
            <div className="mt-6">
              <label htmlFor="brochure" className="block text-sm font-medium text-gray-700 mb-2">
                Property Brochure (PDF)
              </label>
              <input
                type="file"
                id="brochure"
                accept="application/pdf"
                onChange={handleBrochureChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
              />
              {brochureFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {brochureFile.name} ({(brochureFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Upload a PDF brochure for this property (max 10MB)</p>
            </div>
          </div>
          )}

          {/* Step 5: Review Page */}
          {currentStep === 5 && (
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
                    <span className="font-medium text-gray-700">Total Parcel area:</span>
                    <span className="ml-2 text-gray-900">{formData.area ? `${formData.area} acres` : '-'}</span>
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
              {(formData.price || formData.project_status || formData.short_description || formData.full_description || formData.bhk_config || formData.total_towers) && (
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {formData.price && (
                      <div>
                        <span className="font-medium text-gray-700">Price:</span>
                        <span className="ml-2 text-gray-900">₹{Number(formData.price).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {formData.project_status && (
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-gray-900 capitalize">{formData.project_status.replace('-', ' ')}</span>
                      </div>
                    )}
                    {formData.tower_bhk_config.length > 0 && formData.tower_bhk_config.some(t => t.bhk) && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">BHK Configuration:</span>
                        <div className="mt-2 space-y-2">
                          {formData.tower_bhk_config.map((tower, idx) => (
                            tower.bhk && (
                              <div key={idx} className="pl-4 border-l-2 border-gray-300">
                                <p className="font-semibold text-gray-800">Tower {tower.tower_number}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mt-1">
                                  {tower.bhk && <span>BHK: {tower.bhk}</span>}
                                  {tower.area_sqft && <span>Area: {tower.area_sqft} sqft</span>}
                                  {tower.flats_per_floor && <span>Flats/Floor: {tower.flats_per_floor}</span>}
                                  {tower.floors_in_tower && <span>Floors: {tower.floors_in_tower}</span>}
                                  {tower.lifts && <span>Lifts: {tower.lifts}</span>}
                                  {tower.penthouse && <span className="text-[#c99700]">Penthouse: Yes</span>}
                                  {tower.parking_per_floor && <span>Parking/Floor: {tower.parking_per_floor}</span>}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.possession_date && (
                      <div>
                        <span className="font-medium text-gray-700">Possession:</span>
                        <span className="ml-2 text-gray-900">{formData.possession_date}</span>
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
                    {formData.type === 'builder-floor' && formData.facing && (
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

            {/* Payment Plan */}
            <div className="mb-6">
              <label htmlFor="payment_plan" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Plan
              </label>
              <textarea
                id="payment_plan"
                rows={4}
                value={formData.payment_plan || ''}
                onChange={(e) => setFormData({ ...formData, payment_plan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="Payment plan details..."
              />
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
              className="px-6 py-2 bg-[#AB090A] text-white rounded-lg font-semibold hover:bg-[#8a0708] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
