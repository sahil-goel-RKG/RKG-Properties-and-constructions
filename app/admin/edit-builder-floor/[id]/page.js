'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function EditBuilderFloorPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const builderFloorId = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Locations and developers state for autocomplete suggestions
  const [locations, setLocations] = useState([])
  const [developers, setDevelopers] = useState([])

  // images / brochure
  const [coverImage, setCoverImage] = useState(null)
  const [coverImageUrl, setCoverImageUrl] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  // Building brochure files and URLs (indexed by building index)
  const [buildingBrochureFiles, setBuildingBrochureFiles] = useState({}) // { 0: File, 1: File, ... }
  const [buildingBrochureUrls, setBuildingBrochureUrls] = useState({}) // { 0: 'url', 1: 'url', ... }


const [existingImages, setExistingImages] = useState([])      // URLs already stored in DB
const [additionalImages, setAdditionalImages] = useState([])  // new files to upload
const [additionalPreviews, setAdditionalPreviews] = useState([]) // base64 previews

  // steps
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // form data specific to builder_floors table
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    location: '',
    developer: '',
    total_land_parcel: '',
    status: '',
    plot_number: '',
    plot_size: '',
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
    }],
    short_description: '',
    full_description: '',
  })

  // ------------- AUTH / FETCH -------------

  // Production-ready auth check
  useEffect(() => {
    if (!isLoaded) return; // ⬅️ wait for Clerk
    if (!user) {
      router.push('/admin/login')
      return
    }
    // User is authenticated, fetch builder floor data
    if (builderFloorId) {
      fetchBuilderFloor()
    }
  }, [isLoaded, user, router, builderFloorId])

  // Fetch location and developer suggestions from both projects and builder_floors tables
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [projectsLocResult, builderFloorsLocResult, projectsDevResult, builderFloorsDevResult] = await Promise.all([
          supabase
            .from('projects')
            .select('location')
            .not('location', 'is', null)
            .neq('location', ''),
          supabase
            .from('builder_floors')
            .select('location')
            .not('location', 'is', null)
            .neq('location', ''),
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

        // Combine locations from both tables
        const allLocations = []
        if (!projectsLocResult.error && projectsLocResult.data) {
          allLocations.push(...projectsLocResult.data.map(item => item.location).filter(Boolean))
        }
        if (!builderFloorsLocResult.error && builderFloorsLocResult.data) {
          allLocations.push(...builderFloorsLocResult.data.map(item => item.location).filter(Boolean))
        }

        // Get unique locations and sort
        const uniqueLocations = [...new Set(allLocations)]
        setLocations(uniqueLocations.sort())

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
      }
    }

    if (user) {
      fetchOptions()
    }
  }, [user])

  const fetchBuilderFloor = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('builder_floors')
        .select('*')
        .eq('id', builderFloorId)
        .single()

      if (error) throw error
      if (!data) {
        setError('Builder floor not found')
        setLoading(false)
        return
      }

      // Handle building_config - if exists use it, otherwise migrate from old fields
      let buildingConfig = []
      if (data.building_config) {
        try {
          buildingConfig = typeof data.building_config === 'string' 
            ? JSON.parse(data.building_config) 
            : data.building_config
          if (!Array.isArray(buildingConfig)) {
            buildingConfig = []
          }
        } catch (e) {
          console.error('Error parsing building_config:', e)
          buildingConfig = []
        }
      }
      
      // If no building_config exists, create one from existing fields (migration)
      if (buildingConfig.length === 0) {
        buildingConfig = [{
          building_number: 1,
        plot_size: data.plot_size || '',
        facing: data.facing || '',
        floors_count: data.floors_count?.toString() || '',
          roof_rights: data.roof_rights || '',
          condition: data.condition || '',
          status: data.status || '',
          category: data.category || '',
          possession_date: data.possession_date || '',
          owner_name: data.owner_name || '',
          comments: data.comments || '',
          brochure_url: data.brochure_url || '',
        price_top: data.price_top?.toString() || '',
        price_mid1: data.price_mid1?.toString() || '',
        price_mid2: data.price_mid2?.toString() || '',
        price_ug: data.price_ug?.toString() || '',
        has_basement: data.has_basement || false,
        is_triplex: data.is_triplex || false,
        is_gated: data.is_gated || false,
        }]
        // Set brochure URL for migrated building
        if (data.brochure_url) {
          setBuildingBrochureUrls({ 0: data.brochure_url })
        }
      }

      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        location: data.location || '',
        developer: data.developer || '',
        total_land_parcel: data.total_land_parcel || '',
        status: data.status || '',
        plot_number: data.plot_number || '',
        plot_size: data.plot_size || '',
        building_config: buildingConfig,
        short_description: data.short_description || '',
        full_description: data.full_description || '',
      })

      if (data.image_url) {
        setCoverImageUrl(data.image_url)
        setCoverPreview(data.image_url)
      }

      // Set building brochure URLs from building_config
      const brochureUrls = {}
      buildingConfig.forEach((building, index) => {
        if (building.brochure_url && building.brochure_url.trim() !== '') {
          brochureUrls[index] = building.brochure_url
        }
      })
      setBuildingBrochureUrls(brochureUrls)
      
      // Debug: Log loaded brochure URLs
      console.log('Loaded building brochure URLs:', brochureUrls)
      
      if (Array.isArray(data.gallery_images)) {
        setExistingImages(data.gallery_images)
      } else {
        setExistingImages([])
      }
      
    } catch (err) {
      console.error('Error fetching builder floor:', err)
      setError(err.message || 'Failed to fetch builder floor')
    } finally {
      setLoading(false)
    }
  }


  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
  
    setAdditionalImages((prev) => [...prev, ...files])
  
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAdditionalPreviews((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }
  
  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index))
  }
  
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }
  


  // ------------- HELPERS -------------

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    }))
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImage(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleBuildingBrochureChange = (buildingIndex, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file for brochure')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Brochure must be less than 10MB')
      return
    }

    setError('')
    setBuildingBrochureFiles((prev) => ({
      ...prev,
      [buildingIndex]: file,
    }))
  }

  const uploadFile = async (file, path) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('path', path)

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: fd,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'File upload failed')
    }

    const data = await res.json()
    return data.url
  }

  // ------------- SUBMIT -------------

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
        e.preventDefault()
      }
    // Authentication is already checked in useEffect, but double-check for safety
    if (!user) {
      setError('You must be logged in to update.')
      router.push('/admin/login')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // upload cover image if changed
      let image_url = coverImageUrl
      if (coverImage) {
        const ext = coverImage.name.split('.').pop()
        image_url = await uploadFile(
          coverImage,
          `builder-floors/${formData.slug}/cover-${Date.now()}.${ext}`,
        )
      }

      // 🔽 upload additional gallery images (if any)
let newGalleryUrls = []
if (additionalImages.length > 0) {
  for (let i = 0; i < additionalImages.length; i++) {
    const file = additionalImages[i]
    const ext = file.name.split('.').pop()
    const url = await uploadFile(
      file,
      `builder-floors/${formData.slug}/image-${Date.now()}-${i}.${ext}`,
    )
    newGalleryUrls.push(url)
  }
}

// existingImages already reflects any removals done in UI
const finalGalleryImages = [...existingImages, ...newGalleryUrls]

      // Process building_config - upload brochures and convert string numbers to numbers
      const processedBuildingConfig = await Promise.all(
        formData.building_config.map(async (building, index) => {
          // Upload brochure for this building if a new file was selected
          let brochure_url = null
          
          // Priority: new file > existing in building config > existing in state
          if (buildingBrochureFiles[index]) {
            // Upload new brochure file
            brochure_url = await uploadFile(
              buildingBrochureFiles[index],
              `builder-floors/${formData.slug}/building-${building.building_number || index + 1}-brochure-${Date.now()}.pdf`,
            )
          } else if (building.brochure_url && building.brochure_url.trim() !== '') {
            // Keep existing brochure URL from building config
            brochure_url = building.brochure_url
          } else if (buildingBrochureUrls[index]) {
            // Fallback to existing brochure URL from state
            brochure_url = buildingBrochureUrls[index]
          }

          // Build the building object, ensuring brochure_url is explicitly set
          const buildingData = {
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
          }
          
          // Explicitly set brochure_url (don't let empty string from spread overwrite it)
          if (brochure_url) {
            buildingData.brochure_url = brochure_url
          } else {
            buildingData.brochure_url = null
          }
          
          return buildingData
        })
      )

      const updatePayload = {
        name: formData.name || null,
        slug: formData.slug || null,
        location: formData.location || null,
        developer: formData.developer || null,
        total_land_parcel: formData.total_land_parcel || null,
        status: formData.status || null,
        plot_number: formData.plot_number || null,
        building_config: processedBuildingConfig.length > 0 ? processedBuildingConfig : null,
        short_description: formData.short_description || null,
        full_description: formData.full_description || null,
        image_url,
        gallery_images: finalGalleryImages.length > 0 ? finalGalleryImages : null,
        updated_at: new Date().toISOString(),
      }

      // Debug: Log building_config to verify brochure_urls are included
      console.log('Building config being saved:', JSON.stringify(processedBuildingConfig, null, 2))

      const res = await fetch('/api/builder-floors/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: builderFloorId,
          ...updatePayload,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update builder floor')
      }

      setSuccess('Builder floor updated successfully!')
      setTimeout(() => {
        router.push('/admin/edit-property')
      }, 1500)
    } catch (err) {
      console.error('Error updating builder floor:', err)
      setError(err.message || 'Failed to update builder floor')
    } finally {
      setSaving(false)
    }
  }

  const validateStep = (step) => {
    if (step === 1) {
      return formData.name && formData.location
    }
    if (step === 2) {
      return true // Details form - all fields optional
    }
    if (step === 3) {
      return true // Pricing - all fields optional
    }
    if (step === 4) {
      return true // Images - optional
    }
    return true
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      setError('Please fill required fields on this step.')
      return
    }
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  // ------------- RENDER -------------

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c99700] mx-auto" />
          <p className="mt-4 text-gray-600">Loading builder floor...</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) return null; // ⬅️ wait for Clerk before rendering

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/admin/edit-property"
            className="golden-text hover:text-[#a67800] font-medium mb-4 inline-block"
          >
            ← Back to Properties List
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Edit Builder Floor
        </h1>

        {/* Steps indicator – same style as apartment edit */}
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
                    {step === 1 && 'List Form'}
                    {step === 2 && 'Details Form'}
                    {step === 3 && 'Pricing'}
                    {step === 4 && 'Images'}
                    {step === 5 && 'Review'}
                  </span>
                </div>
                {step < totalSteps && (
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

        <form
        onSubmit={(e) => {
            // never auto-submit; we handle saving manually
            e.preventDefault()
        }}
        onKeyDown={(e) => {
            // block Enter key anywhere in the form
            if (e.key === 'Enter') {
            e.preventDefault()
            }
        }}
        className="bg-white rounded-lg shadow-md p-8 space-y-6"
        >
          {/* STEP 1 – LIST FORM */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                List Form
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    placeholder="e.g., 4 BHK Builder Floor in Sector 57"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] text-gray-900"
                    placeholder="auto-generated-from-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    list="location-suggestions"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    placeholder="e.g., Sector 57, Gurgaon"
                    required
                  />
                  <datalist id="location-suggestions">
                    {locations.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Developer (Optional)
                  </label>
                  <input
                    type="text"
                    list="developer-suggestions"
                    value={formData.developer}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        developer: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    placeholder="e.g., ABC Developers"
                  />
                  <datalist id="developer-suggestions">
                    {developers.map((dev) => (
                      <option key={dev} value={dev} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Land Parcel (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.total_land_parcel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_land_parcel: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    placeholder="e.g., 5 acres or 2.5 hectares"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                  >
                    <option value="">Select Status</option>
                    <option value="ready-to-move">Ready to Move</option>
                    <option value="under-construction">Under Construction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.plot_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        plot_number: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                    placeholder="e.g., Plot 123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 – DETAILS FORM */}
          {currentStep === 2 && (
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
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                            }))
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
                          Facing (Optional)
                  </label>
                        <select
                          value={building.facing || ''}
                          onChange={(e) => {
                            const newConfig = [...formData.building_config]
                            newConfig[index].facing = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                      }))
                          }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="ready-to-move">Ready to Move</option>
                    <option value="under-construction">
                      Under Construction
                    </option>
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
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                              building_config: newConfig,
                      }))
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
                            setFormData((prev) => ({
                              ...prev,
                              building_config: newConfig,
                            }))
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                        />
                      </div>

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
                            setFormData((prev) => ({
                              ...prev,
                              building_config: newConfig,
                            }))
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          placeholder="e.g., 263 sqyd"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments / Additional Notes
                      </label>
                      <textarea
                        rows={3}
                        value={building.comments || ''}
                        onChange={(e) => {
                          const newConfig = [...formData.building_config]
                          newConfig[index].comments = e.target.value
                          setFormData((prev) => ({
                            ...prev,
                            building_config: newConfig,
                          }))
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                        placeholder="Additional notes or comments for this building"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brochure (PDF)
                      </label>
                      {buildingBrochureUrls[index] && !buildingBrochureFiles[index] && (
                        <div className="mb-2 text-sm">
                          <span className="text-gray-700 mr-2">Current:</span>
                          <a
                            href={buildingBrochureUrls[index]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#c99700] hover:text-[#a67800] underline"
                          >
                            View brochure
                          </a>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleBuildingBrochureChange(index, e)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                      />
                      {buildingBrochureFiles[index] && (
                        <p className="mt-1 text-xs text-gray-600">
                          Selected: {buildingBrochureFiles[index].name} (
                          {(buildingBrochureFiles[index].size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const nextBuildingNumber = formData.building_config.length + 1
                    setFormData((prev) => ({
                      ...prev,
                      building_config: [
                        ...prev.building_config,
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
                    }))
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
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.short_description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                          short_description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                      placeholder="Brief one-line description for listings"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description / Project Description
                  </label>
                  <textarea
                      rows={6}
                      value={formData.full_description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                          full_description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                      placeholder="Comprehensive project description"
                  />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 – PRICING */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Building Configuration - Pricing
              </h2>

              <div className="space-y-6">
                {formData.building_config.map((building, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Building {building.building_number || index + 1}
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Price per floor */}
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
                            setFormData((prev) => ({
                              ...prev,
                              building_config: newConfig,
                            }))
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
                            setFormData((prev) => ({
                              ...prev,
                              building_config: newConfig,
                            }))
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
                            setFormData((prev) => ({
                              ...prev,
                              building_config: newConfig,
                            }))
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
                            setFormData((prev) => ({
                              ...prev,
                              building_config: newConfig,
                            }))
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          placeholder="Price in ₹"
                        />
                      </div>

                      {/* checkboxes */}
                      <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={building.has_basement || false}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].has_basement = e.target.checked
                              setFormData((prev) => ({
                                ...prev,
                                building_config: newConfig,
                              }))
                            }}
                            className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Basement
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={building.is_triplex || false}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].is_triplex = e.target.checked
                              setFormData((prev) => ({
                                ...prev,
                                building_config: newConfig,
                              }))
                            }}
                            className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Triplex
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={building.is_gated || false}
                            onChange={(e) => {
                              const newConfig = [...formData.building_config]
                              newConfig[index].is_gated = e.target.checked
                              setFormData((prev) => ({
                                ...prev,
                                building_config: newConfig,
                              }))
                            }}
                            className="w-4 h-4 text-[#c99700] border-gray-300 rounded focus:ring-[#ffd86b]"
                          />
                          <span className="ml-2 text-sm text-gray-700">Gated</span>
                        </label>
                      </div>

                      {/* Comments field */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comments / Additional Notes
                        </label>
                        <textarea
                          rows={3}
                          value={building.comments || ''}
                          onChange={(e) => {
                            const newConfig = [...formData.building_config]
                            newConfig[index].comments = e.target.value
                            setFormData((prev) => ({
                              ...prev,
                              building_config: newConfig,
                            }))
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                          placeholder="Additional notes or comments"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 – IMAGES */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Images
              </h2>

              {/* Cover image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                />
                {coverPreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Images</h3>
                <p className="text-sm">
                    <span className="font-medium text-gray-700">Cover image:</span>{' '}
                    <span className="text-gray-900">
                    {coverPreview || coverImageUrl ? 'Set' : 'Not set'}
                    </span>
                </p>
                <p className="text-sm">
                    <span className="font-medium text-gray-700">Additional images:</span>{' '}
                    <span className="text-gray-900">
                    {(existingImages?.length || 0) + (additionalImages?.length || 0)} total
                    </span>
                </p>
              </div>

              {/* Additional Images (gallery) */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images (Gallery)
                </label>

                {/* Existing images from DB */}
                {existingImages.length > 0 && (
                    <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((url, index) => (
                        <div key={url + index} className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                            >
                            ×
                            </button>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* New uploads */}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
                />

                {additionalPreviews.length > 0 && (
                    <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">New Images to Upload:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {additionalPreviews.map((src, index) => (
                        <div key={index} className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                            src={src}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                            >
                            ×
                            </button>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                </div>


            </div>
          )}

          {/* STEP 5 – REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Review
              </h2>

              {/* Full review summary */}
                <div className="mt-6 border-t border-gray-200 pt-4 space-y-6 text-sm text-gray-800">
                {/* Basic Info */}
                <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                    <p>
                        <span className="font-medium text-gray-700">Name:</span>{' '}
                        <span className="text-gray-900">{formData.name || '-'}</span>
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Slug:</span>{' '}
                        <span className="text-gray-900">{formData.slug || '-'}</span>
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Location:</span>{' '}
                        <span className="text-gray-900">{formData.location || '-'}</span>
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Developer:</span>{' '}
                        <span className="text-gray-900">{formData.developer || '-'}</span>
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Total Land Parcel:</span>{' '}
                        <span className="text-gray-900">{formData.total_land_parcel || '-'}</span>
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Status:</span>{' '}
                        <span className="text-gray-900">
                            {formData.status 
                                ? formData.status === 'ready-to-move' 
                                    ? 'Ready to Move' 
                                    : formData.status === 'under-construction' 
                                        ? 'Under Construction' 
                                        : formData.status
                                : '-'}
                        </span>
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Plot Number:</span>{' '}
                        <span className="text-gray-900">{formData.plot_number || '-'}</span>
                    </p>
                    </div>
                </div>

                {/* Building Configurations */}
                {formData.building_config && formData.building_config.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Building Configurations</h3>
                    <div className="space-y-4">
                        {formData.building_config.map((building, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <p className="font-semibold text-gray-800 mb-3">Building {building.building_number || idx + 1}</p>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                            {building.facing && (
                                <p>
                                <span className="font-medium text-gray-700">Facing:</span>{' '}
                                <span className="text-gray-900">{building.facing}</span>
                                </p>
                            )}
                            {building.floors_count && (
                                <p>
                                <span className="font-medium text-gray-700">Number of Floors:</span>{' '}
                                <span className="text-gray-900">{building.floors_count}</span>
                                </p>
                            )}
                            {building.roof_rights && (
                                <p>
                                <span className="font-medium text-gray-700">Roof Rights:</span>{' '}
                                <span className="text-gray-900">{building.roof_rights}</span>
                                </p>
                            )}
                            {building.condition && (
                                <p>
                                <span className="font-medium text-gray-700">Condition:</span>{' '}
                        <span className="text-gray-900">
                                    {building.condition === 'new' ? 'New' : building.condition === 'old' ? 'Old' : building.condition}
                        </span>
                    </p>
                            )}
                            {building.status && (
                    <p>
                                <span className="font-medium text-gray-700">Status:</span>{' '}
                        <span className="text-gray-900">
                                    {building.status === 'ready-to-move' ? 'Ready to Move' : building.status === 'under-construction' ? 'Under Construction' : building.status}
                        </span>
                    </p>
                            )}
                            {building.category && (
                    <p>
                                <span className="font-medium text-gray-700">Category:</span>{' '}
                        <span className="text-gray-900">
                                    {building.category === 'deendayal' ? 'Deendayal' : building.category === 'regular' ? 'Regular' : building.category}
                        </span>
                    </p>
                            )}
                            {building.possession_date && (
                                <p>
                                <span className="font-medium text-gray-700">Possession:</span>{' '}
                                <span className="text-gray-900">{building.possession_date}</span>
                                </p>
                            )}
                            {building.owner_name && (
                                <p>
                                <span className="font-medium text-gray-700">Owner Name:</span>{' '}
                                <span className="text-gray-900">{building.owner_name}</span>
                                </p>
                            )}
                            {building.plot_size && (
                                <p>
                                <span className="font-medium text-gray-700">Plot Size:</span>{' '}
                                <span className="text-gray-900">{building.plot_size}</span>
                                </p>
                            )}
                            {building.comments && (
                                <p className="md:col-span-2">
                                <span className="font-medium text-gray-700">Comments:</span>{' '}
                                <span className="text-gray-900">{building.comments}</span>
                                </p>
                            )}
                            {(building.brochure_url || buildingBrochureUrls[idx] || buildingBrochureFiles[idx]) && (
                                <p className="md:col-span-2">
                                <span className="font-medium text-gray-700">Brochure:</span>{' '}
                                <span className="text-gray-900">
                                    {buildingBrochureFiles[idx] 
                                        ? `New file selected: ${buildingBrochureFiles[idx].name}`
                                        : (building.brochure_url || buildingBrochureUrls[idx])
                                            ? 'Uploaded'
                                            : '-'}
                                </span>
                                </p>
                            )}
                            {building.price_top && (
                                <p>
                                <span className="font-medium text-gray-700">Top Floor Price:</span>{' '}
                                <span className="text-gray-900">
                                    ₹{Number(building.price_top).toLocaleString('en-IN')}
                                </span>
                                </p>
                            )}
                            {building.price_mid1 && (
                                <p>
                                <span className="font-medium text-gray-700">Mid Floor Price 1:</span>{' '}
                        <span className="text-gray-900">
                                    ₹{Number(building.price_mid1).toLocaleString('en-IN')}
                        </span>
                    </p>
                            )}
                            {building.price_mid2 && (
                    <p>
                                <span className="font-medium text-gray-700">Mid Floor Price 2:</span>{' '}
                        <span className="text-gray-900">
                                    ₹{Number(building.price_mid2).toLocaleString('en-IN')}
                        </span>
                    </p>
                            )}
                            {building.price_ug && (
                    <p>
                                <span className="font-medium text-gray-700">UG Floor Price:</span>{' '}
                        <span className="text-gray-900">
                                    ₹{Number(building.price_ug).toLocaleString('en-IN')}
                        </span>
                    </p>
                            )}
                    <p>
                                <span className="font-medium text-gray-700">Basement:</span>{' '}
                                <span className="text-gray-900">{building.has_basement ? 'Yes' : 'No'}</span>
                    </p>
                    <p>
                                <span className="font-medium text-gray-700">Triplex:</span>{' '}
                                <span className="text-gray-900">{building.is_triplex ? 'Yes' : 'No'}</span>
                            </p>
                            <p>
                                <span className="font-medium text-gray-700">Gated:</span>{' '}
                                <span className="text-gray-900">{building.is_gated ? 'Yes' : 'No'}</span>
                            </p>
                            {building.comments && (
                                <p className="md:col-span-2">
                                <span className="font-medium text-gray-700">Comments:</span>{' '}
                                <span className="text-gray-900">{building.comments}</span>
                                </p>
                            )}
                    </div>
                </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Short Description */}
                {formData.short_description && (
                    <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Short Description</h3>
                    <p className="text-gray-800 whitespace-pre-line">
                        {formData.short_description}
                    </p>
                    </div>
                )}

                {/* Full Description */}
                {formData.full_description && (
                    <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Full Description / Project Description</h3>
                    <p className="text-gray-800 whitespace-pre-line">
                        {formData.full_description}
                    </p>
                    </div>
                )}

                {/* Comments / Additional Notes */}
                {formData.comments && (
                    <div>
                    <h3 className="font-semibold mb-2 text-gray-900">Comments / Additional Notes</h3>
                    <p className="text-gray-800 whitespace-pre-line">
                        {formData.comments}
                    </p>
                    </div>
                )}
                </div>
            </div>
          )}

          {/* NAV BUTTONS */}
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
                  href="/admin/edit-property"
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
                  onClick={nextStep}
                  className="px-6 py-2 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
                >
                  Next →
                </button>
              ) : (
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-2 bg-[#AB090A] text-white rounded-lg font-semibold hover:bg-[#8a0708] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
