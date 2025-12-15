'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function EditPropertyDetailPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageUploadSuccess, setImageUploadSuccess] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')
  
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
    type: 'apartment',
    developer: '',
    developerOther: '',
    short_description: '',
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
      parking_per_floor: '',
      no_of_basements: ''
    }],
    amenities: [], // Changed to array
    full_description: '',
    project_highlights: '',
    nearby_landmarks: '',
    connectivity: '',
    payment_plan: '',
    total_towers: '',
    total_floors: '',
    total_units: '',
    facing: '',
    club_house: false,
    club_house_area: '',
  })

  // Image state
  const [coverImage, setCoverImage] = useState(null)
  const [coverImageUrl, setCoverImageUrl] = useState(null) // Existing cover image URL
  const [coverImageRemoved, setCoverImageRemoved] = useState(false) // Track if cover image was removed
  const [additionalImages, setAdditionalImages] = useState([]) // New files to upload
  const [existingImages, setExistingImages] = useState([]) // Existing images from DB
  const [imagesToDelete, setImagesToDelete] = useState([]) // Image IDs to delete
  
  // Brochure state
  const [brochureFile, setBrochureFile] = useState(null)
  const [existingBrochureUrl, setExistingBrochureUrl] = useState(null)
  const [imagePreviews, setImagePreviews] = useState({
    cover: null,
    additional: []
  })

  // Form step state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4 // Basic Info, Additional Details, Images, Review

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

  // Fetch project data
  useEffect(() => {
    if (isLoaded && !user) {
      const pushResult = router.push('/admin/login')
      if (pushResult && typeof pushResult.catch === 'function') {
        pushResult.catch(err => {
          console.error('Navigation error:', err)
        })
      }
      return
    }

    if (user && projectId) {
      fetchProject().catch(err => {
        console.error('Error fetching project:', err)
        setError('Failed to load project data')
        setLoading(false)
      })
    }
  }, [user, isLoaded, router, projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('type', 'apartment')   // 👈 only apartments
        .maybeSingle()             // 👈 safer than .single()


      if (projectError) {
        console.error('Project fetch error:', projectError)
        throw projectError
      }
      
      if (!project) {
        setError('Apartment not found for this ID')
        setLoading(false)
        return
      }

      // Store original slug
      setOriginalSlug(project.slug || '')
      
      // Set form data
      setFormData({
        name: project.name || '',
        slug: project.slug || '',
        location: project.location || '',
        locationOther: '',
        area: project.area || '',
        type: project.type || 'apartment',
        developer: project.developer || '',
        developerOther: '',
        short_description: project.short_description || '',
        price: project.price ? (project.price.toString().includes('Cr') ? project.price.toString() : project.price.toString() + ' Cr') : '',
        project_status: project.project_status || '',
        possession_date: project.possession_date 
          ? (project.possession_date.includes('-') 
              ? new Date(project.possession_date).getFullYear().toString() 
              : project.possession_date.toString())
          : '',
        is_featured: project.is_featured || false,
        bhk_config: Array.isArray(project.bhk_config) ? project.bhk_config.join(', ') : project.bhk_config || '',
        tower_bhk_config: project.tower_bhk_config 
          ? (typeof project.tower_bhk_config === 'string' 
              ? JSON.parse(project.tower_bhk_config) 
              : project.tower_bhk_config)
          : (project.bhk_config && Array.isArray(project.bhk_config) && project.bhk_config.length > 0
              ? [{ tower_number: 1, bhk: project.bhk_config.join(', '), area_sqft: '', flats_per_floor: '', floors_in_tower: '', lifts: '', penthouse: false, parking_per_floor: '', no_of_basements: '' }]
              : [{ tower_number: 1, bhk: '', area_sqft: '', flats_per_floor: '', floors_in_tower: '', lifts: '', penthouse: false, parking_per_floor: '', no_of_basements: '' }]),
        amenities: Array.isArray(project.amenities) ? project.amenities : [],
        full_description: project.full_description || '',
        project_highlights: Array.isArray(project.project_highlights) ? project.project_highlights.join(', ') : project.project_highlights || '',
        nearby_landmarks: Array.isArray(project.nearby_landmarks) ? project.nearby_landmarks.join(', ') : project.nearby_landmarks || '',
        connectivity: project.connectivity || '',
        payment_plan: project.payment_plan || '',
        total_towers: project.total_towers || '',
        total_floors: project.total_floors || '',
        total_units: project.total_units || '',
        facing: project.facing || '',
        club_house: project.club_house || false,
        club_house_area: project.club_house_area || '',
        brochure_url: project.brochure_url || null
      })

      // Set cover image
      if (project.image_url) {
        setCoverImageUrl(project.image_url)
        setImagePreviews(prev => ({ ...prev, cover: project.image_url }))
      }
      setExistingBrochureUrl(project.brochure_url || null)
      
      // Fetch existing additional images
      const { data: images, error: imagesError } = await supabase
        .from('project_images')
        .select('id, image_url, display_order')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true })

      if (imagesError) {
        console.error('Error fetching project images:', imagesError)
        // If table doesn't exist, just set empty array (don't throw error)
        if (imagesError.code === 'PGRST205' || imagesError.code === 'PGRST116' || imagesError.message?.includes('does not exist') || imagesError.message?.includes('Could not find the table')) {
          console.warn('project_images table does not exist. Please run PROJECT_IMAGES_TABLE.sql in Supabase SQL Editor')
          setExistingImages([])
        } else {
          // For other errors, log but don't throw - allow page to load
          console.warn('Could not fetch project images:', imagesError.message)
          setExistingImages([])
        }
      } else if (images) {
        setExistingImages(images)
      } else {
        setExistingImages([])
      }
    } catch (err) {
      console.error('Error fetching project:', err)
      // Don't show error if it's just about missing project_images table
      if (err.code === 'PGRST205' && err.message?.includes('project_images')) {
        console.warn('project_images table does not exist. The page will still load, but additional images cannot be displayed.')
        setError('')
      } else {
        setError(err.message || 'Failed to fetch project')
      }
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  // Generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })
  }

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

  // Remove additional image (new upload)
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
    console.log('Brochure file selected:', file ? { name: file.name, size: file.size, type: file.type } : 'No file')
    if (file) {
      // Validate PDF
      if (file.type !== 'application/pdf') {
        console.error('Invalid file type:', file.type)
        setError('Please upload a PDF file for the brochure')
        setBrochureFile(null)
        return
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large:', file.size)
        setError('Brochure file size should be less than 10MB')
        setBrochureFile(null)
        return
      }
      setBrochureFile(file)
      setError('')
      console.log('✅ Brochure file validated and set:', file.name)
    } else {
      setBrochureFile(null)
      console.log('Brochure file cleared')
    }
  }

  // Remove existing image
  const removeExistingImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId])
    setExistingImages(existingImages.filter(img => img.id !== imageId))
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

  // Prevent form submission on Enter key press (especially on review page)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Enter key from submitting form on review page (step 4)
      if (currentStep === 4 && e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    if (currentStep === 4) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [currentStep])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent auto-submission - only allow explicit button click
    if (currentStep !== 4) {
      return
    }
    
    // Check authentication before submitting
    if (!user) {
      setError('You must be logged in to update properties. Please sign in and try again.')
      router.push('/admin/login')
      return
    }
    
    setSaving(true)
    setError('')
    setSuccess('')
    // Don't clear imageUploadSuccess - let it persist to show image upload status

    try {
      // Determine final location value
      const finalLocation = formData.location === 'other' ? formData.locationOther.trim() : formData.location
      
      // Determine final developer value
      const finalDeveloper = formData.developer === 'other' ? formData.developerOther.trim() : (formData.developer || null)

      // Determine final area value (now a single value, not a range)
      const finalArea = formData.area && formData.area.trim() !== '' ? formData.area.trim() : null

      // Upload new cover image if provided
      let newCoverImageUrl = coverImageUrl
      if (coverImage) {
        const coverPath = `properties/${formData.slug}/cover-${Date.now()}.${coverImage.name.split('.').pop()}`
        newCoverImageUrl = await uploadImage(coverImage, coverPath)
      }

      // Upload new additional images
      const newAdditionalImageUrls = []
      for (let i = 0; i < additionalImages.length; i++) {
        const file = additionalImages[i]
        const imagePath = `properties/${formData.slug}/image-${Date.now()}-${i}.${file.name.split('.').pop()}`
        const imageUrl = await uploadImage(file, imagePath)
        newAdditionalImageUrls.push(imageUrl)
      }

      // Upload brochure PDF if provided
      let newBrochureUrl = existingBrochureUrl
      if (brochureFile) {
        try {
          console.log('Uploading brochure file:', brochureFile.name, brochureFile.size, 'bytes', 'Type:', brochureFile.type)
          const brochurePath = `properties/${formData.slug}/brochure-${Date.now()}.pdf`
          newBrochureUrl = await uploadImage(brochureFile, brochurePath)
          console.log('Brochure uploaded successfully, URL:', newBrochureUrl)
          if (!newBrochureUrl) {
            console.error('Brochure upload returned null/undefined URL')
            throw new Error('Brochure upload failed: No URL returned')
          }
        } catch (brochureError) {
          console.error('Error uploading brochure:', brochureError)
          setError(`Failed to upload brochure: ${brochureError.message}`)
          setSaving(false)
          return
        }
      } else {
        console.log('No new brochure file selected')
        console.log('Existing brochure URL:', existingBrochureUrl)
        console.log('Brochure file state:', brochureFile ? 'File selected' : 'No file selected')
      }

      // Prepare update data
      // Handle project_status - explicitly handle empty string, null, and valid values
      let statusValue = null
      if (formData.project_status) {
        const trimmedStatus = formData.project_status.toString().trim()
        if (trimmedStatus !== '' && trimmedStatus !== 'Select Status') {
          statusValue = trimmedStatus
        }
      }
      
      console.log('Status from form:', formData.project_status, 'Type:', typeof formData.project_status)
      console.log('Status value to save:', statusValue)
      
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        location: finalLocation,
        area: finalArea,
        type: formData.type,
        developer: finalDeveloper,
        short_description: formData.short_description && formData.short_description.trim() !== '' ? formData.short_description.trim() : null,
        full_description: formData.full_description && formData.full_description.trim() !== '' ? formData.full_description.trim() : null,
        price: formData.price && formData.price.toString().trim() !== '' 
          ? (() => {
              // Remove "Cr" suffix if present before converting to number
              const priceStr = formData.price.toString().replace(/\s*(Cr|cr|Crore|crore)\s*/gi, '').trim()
              return priceStr ? Number(priceStr) : null
            })()
          : null,
        project_status: statusValue, // Always include, even if null
        possession_date: formData.possession_date && formData.possession_date.toString().trim() !== '' ? formData.possession_date.toString().trim() : null,
        is_featured: formData.is_featured || false,
        bhk_config: formData.tower_bhk_config && Array.isArray(formData.tower_bhk_config) && formData.tower_bhk_config.length > 0
          ? formData.tower_bhk_config.map(t => t && t.bhk ? t.bhk : null).filter(Boolean)
          : [],
        tower_bhk_config: (() => {
          if (formData.tower_bhk_config && Array.isArray(formData.tower_bhk_config) && formData.tower_bhk_config.length > 0) {
            try {
              return JSON.stringify(formData.tower_bhk_config)
            } catch (jsonError) {
              console.error('Error stringifying tower_bhk_config:', jsonError, formData.tower_bhk_config)
              return null
            }
          }
          return null
        })(),
        amenities: Array.isArray(formData.amenities) ? formData.amenities : (formData.amenities ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean) : []),
        project_highlights: formData.project_highlights && formData.project_highlights.trim() !== '' ? formData.project_highlights.split(',').map(s => s.trim()).filter(Boolean) : [],
        nearby_landmarks: formData.nearby_landmarks && formData.nearby_landmarks.trim() !== '' ? formData.nearby_landmarks.split(',').map(s => s.trim()).filter(Boolean) : [],
        connectivity: formData.connectivity && formData.connectivity.trim() !== '' ? formData.connectivity.trim() : null,
        payment_plan: formData.payment_plan && formData.payment_plan.trim() !== '' ? formData.payment_plan.trim() : null,
        total_towers: formData.total_towers && formData.total_towers.toString().trim() !== '' ? Number(formData.total_towers) : null,
        total_floors: formData.total_floors && formData.total_floors.toString().trim() !== '' ? Number(formData.total_floors) : null,
        total_units: formData.total_units && formData.total_units.toString().trim() !== '' ? Number(formData.total_units) : null,
        facing: formData.type === 'builder-floor' ? (formData.facing && formData.facing.trim() !== '' ? formData.facing.trim() : null) : null,
        club_house: formData.club_house || false,
        club_house_area: formData.club_house && formData.club_house_area && formData.club_house_area.trim() !== '' ? formData.club_house_area.trim() : null,
        updated_at: new Date().toISOString()
      }
      
      // Update cover image URL (include null to clear if removed)
      if (coverImage) {
        // New image uploaded
        updateData.image_url = newCoverImageUrl
      } else if (coverImageRemoved) {
        // Cover image was explicitly removed by user
        updateData.image_url = null
        console.log('Cover image will be cleared from database')
      } else if (coverImageUrl) {
        // Keep existing cover image
        updateData.image_url = coverImageUrl
      }

      // Update brochure URL - always include it explicitly
      // If a file was selected, newBrochureUrl should have a value after upload
      if (brochureFile) {
        // A file was selected, so we should have a URL after upload
        if (newBrochureUrl) {
          updateData.brochure_url = newBrochureUrl
          console.log('✅ Brochure file was uploaded, including brochure_url in update:', newBrochureUrl)
        } else {
          console.error('❌ ERROR: Brochure file was selected but upload returned no URL!')
          setError('Failed to upload brochure. Please try again.')
          setSaving(false)
          return
        }
      } else if (existingBrochureUrl) {
        // No new file, but keep existing brochure
        updateData.brochure_url = existingBrochureUrl
        console.log('ℹ️ No new brochure file, keeping existing:', existingBrochureUrl)
      } else {
        // No brochure at all - explicitly set to null to clear if needed
        // But only if we're intentionally clearing it (not on first load)
        console.log('ℹ️ No brochure file selected and no existing brochure')
      }
      
      console.log('Full update data:', JSON.stringify(updateData, null, 2))

      // Update project via API route (uses admin client to bypass RLS)
      console.log('Updating project ID:', projectId)
      console.log('User authenticated:', !!user, 'User ID:', user?.id)
      console.log('Update data being sent:', JSON.stringify(updateData, null, 2))
      console.log('Status value in updateData:', updateData.project_status)
      
      const updateResponse = await fetch('/api/projects/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          id: projectId,
          ...updateData
        })
      })
      
      console.log('Update response status:', updateResponse.status, updateResponse.statusText)

      const responseText = await updateResponse.text()
      let updateResult = null
      
      if (responseText) {
        try {
          updateResult = JSON.parse(responseText)
        } catch (jsonError) {
          console.error('Failed to parse response as JSON:', jsonError)
          console.error('Response text:', responseText)
          if (!updateResponse.ok) {
            throw new Error(`Server error: ${updateResponse.status} ${updateResponse.statusText}. Response: ${responseText.substring(0, 200)}`)
          }
        }
      }

      if (!updateResponse.ok) {
        const errorDetails = updateResult ? updateResult : { rawResponse: responseText }
        console.error('Update error:', errorDetails)
        const errorMessage = (updateResult && (updateResult.error || updateResult.message)) || `Failed to update project (${updateResponse.status})`
        throw new Error(errorMessage)
      }

      const updatedProject = updateResult.data
      console.log('Update successful! Updated project:', updatedProject)
      
      if (updatedProject) {
        console.log('Updated project_status from DB:', updatedProject.project_status)
        console.log('Expected project_status:', statusValue)
        
        // Verify the status was actually updated
        if (updatedProject.project_status !== statusValue) {
          console.warn('WARNING: Status mismatch! Expected:', statusValue, 'Got:', updatedProject.project_status)
          throw new Error(`Status update failed. Expected "${statusValue}" but got "${updatedProject.project_status}"`)
        } else {
          console.log('✓ Status update verified successfully!')
        }
      }

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
          // Don't throw error if sync fails - it's not critical for project update
        } catch (syncError) {
          console.warn('Could not sync developer automatically:', syncError)
          // Continue anyway - project is already updated
        }
      }

      // Delete removed images via API route
      if (imagesToDelete.length > 0) {
        const deleteResponse = await fetch('/api/projects/images', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            imageIds: imagesToDelete
          })
        })

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json()
          // If table doesn't exist, just log warning
          if (errorData.error?.includes('table does not exist')) {
            console.warn('project_images table does not exist. Skipping image deletion.')
          } else {
            throw new Error(errorData.error || 'Failed to delete project images')
          }
        }
      }

      // Insert new additional images via API route
      if (newAdditionalImageUrls.length > 0) {
        const maxOrder = existingImages.length > 0 
          ? Math.max(...existingImages.map(img => img.display_order || 0))
          : 0

        const imagesToInsert = newAdditionalImageUrls.map((url, index) => ({
          image_url: url,
          display_order: maxOrder + index + 1
        }))

        const imagesResponse = await fetch('/api/projects/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            projectId: projectId,
            images: imagesToInsert
          })
        })

        if (!imagesResponse.ok) {
          const errorData = await imagesResponse.json()
          console.error('Failed to insert project images:', errorData)
          // If table doesn't exist, show warning but don't fail the update
          if (errorData.error?.includes('table does not exist')) {
            console.warn('project_images table does not exist. Additional images were not saved. Please run PROJECT_IMAGES_TABLE.sql')
            setError('Warning: Additional images could not be saved because project_images table does not exist. Please create the table first.')
          } else {
            throw new Error(errorData.error || 'Failed to insert project images')
          }
        } else {
          const imagesResult = await imagesResponse.json()
          console.log('✅ Project images inserted successfully:', imagesResult)
          setImageUploadSuccess(`✅ ${newAdditionalImageUrls.length} image(s) added successfully!`)
          // Clear the success message after 5 seconds
          setTimeout(() => setImageUploadSuccess(''), 5000)
        }
      }

      setSuccess('Property updated successfully!')
      setTimeout(() => {
        const pushResult = router.push('/admin/edit-property')
        if (pushResult && typeof pushResult.catch === 'function') {
          pushResult.catch(err => {
            console.error('Navigation error:', err)
          })
        }
      }, 2000)
    } catch (err) {
      console.error('Error updating project:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        cause: err.cause
      })
      setError(err.message || 'Failed to update project. Please try again.')
      setSaving(false)
    }
  }

  // Show loading state
  if (!isLoaded || loading) {
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
    const pushResult = router.push('/admin/login')
    if (pushResult && typeof pushResult.catch === 'function') {
      pushResult.catch(err => {
        console.error('Navigation error:', err)
      })
    }
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
            href="/admin/edit-property"
            className="golden-text hover:text-[#a67800] font-medium mb-4 inline-block"
          >
            ← Back to Properties List
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Edit Property</h1>

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

        <form 
          onSubmit={(e) => {
            // Only allow submission on step 4 (review page)
            if (currentStep === 4) {
              handleSubmit(e)
            } else {
              e.preventDefault()
            }
          }} 
          className="bg-white rounded-lg shadow-md p-8 space-y-6"
          onKeyDown={(e) => {
            // Prevent Enter key from submitting form except on review page
            if (e.key === 'Enter' && currentStep !== 4) {
              e.preventDefault()
            }
          }}
        >
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

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value
                    setFormData({ 
                      ...formData, 
                      type: newType,
                      // Clear facing when changing from builder-floor to apartment
                      facing: newType === 'apartment' ? '' : formData.facing
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900"
                >
                  <option value="apartment">Apartments</option>
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

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="text"
                  id="price"
                  value={formData.price}
                  onChange={(e) => {
                    const inputValue = e.target.value
                    // Auto-append Cr to numbers
                    let processedValue = inputValue
                    
                    // Remove existing "Cr" or "cr" for processing
                    const cleanedValue = inputValue.replace(/\s*(Cr|cr)\s*/gi, '').trim()
                    
                    // Check if it's a valid number (including decimals)
                    if (cleanedValue === '' || /^\d*\.?\d*$/.test(cleanedValue)) {
                      // If it's a number and not empty, append Cr
                      if (cleanedValue !== '' && cleanedValue !== '.') {
                        processedValue = cleanedValue + ' Cr'
                      } else {
                        processedValue = cleanedValue
                      }
                    } else {
                      // If it contains non-numeric characters (except Cr), keep as is
                      processedValue = inputValue
                    }
                    
                    setFormData({ ...formData, price: processedValue })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 5.5 (auto becomes 5.5 Cr)"
                />
              </div>

              <div>
                <label htmlFor="project_status" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Status
                </label>
                <select
                  id="project_status"
                  value={formData.project_status}
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
            </div>

            <div className="mt-6">
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                id="short_description"
                rows={2}
                value={formData.short_description}
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
                value={formData.full_description}
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
                <label htmlFor="possession_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Possession (Year)
                </label>
                <input
                  type="number"
                  id="possession_date"
                  min="2020"
                  max="2050"
                  value={formData.possession_date}
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
                              // Auto-append BHK to numbers (handles comma and space separated)
                              const processedValue = inputValue
                                .split(/[, ]+/)
                                .map(item => {
                                  const trimmed = item.trim()
                                  // If it's just a number or number with spaces, add BHK
                                  if (/^\d+$/.test(trimmed)) {
                                    return trimmed + 'BHK'
                                  }
                                  // If it already has BHK, keep it
                                  if (trimmed.toLowerCase().includes('bhk')) {
                                    return trimmed
                                  }
                                  // Otherwise return as is
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
                              // Allow range format: "10-25" or single number "10"
                              // Also allow empty
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
                              // Prevent negative values
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            No. of Basements
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={tower.no_of_basements || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              // Prevent negative values
                              if (value === '' || (Number(value) >= 0)) {
                                const newTowers = [...formData.tower_bhk_config]
                                newTowers[index].no_of_basements = value
                                setFormData({ ...formData, tower_bhk_config: newTowers })
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                            placeholder="e.g., 2"
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
                            parking_per_floor: '',
                            no_of_basements: ''
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

              <div>
                <label htmlFor="total_towers" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Towers
                </label>
                <input
                  type="number"
                  id="total_towers"
                  min="0"
                  value={formData.total_towers}
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
                  value={formData.total_units}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || Number(value) >= 0) {
                      setFormData({ ...formData, total_units: value })
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {formData.type === 'builder-floor' && (
              <div>
                <label htmlFor="facing" className="block text-sm font-medium text-gray-700 mb-2">
                  Facing
                </label>
                <select
                  id="facing"
                  value={formData.facing}
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
                    checked={formData.is_featured}
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
                  value={formData.project_highlights}
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
                  value={formData.nearby_landmarks}
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
                  value={formData.connectivity}
                  onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="Connectivity details..."
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
              {coverImageUrl && !imagePreviews.cover?.startsWith('data:') && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Current Cover Image:</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageUrl(null)
                        setCoverImage(null)
                        setCoverImageRemoved(true)
                        setImagePreviews(prev => ({ ...prev, cover: null }))
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove Cover Image
                    </button>
                  </div>
                  <div className="relative w-full max-w-md h-64">
                    <Image
                      src={coverImageUrl}
                      alt="Current cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 512px"
                      className="object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
              />
              {imagePreviews.cover && imagePreviews.cover.startsWith('data:') && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">New Cover Image Preview:</p>
                  <img
                    src={imagePreviews.cover}
                    alt="Cover preview"
                    className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Existing Additional Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Additional Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative">
                        <div className="relative w-full h-32">
                          <Image
                            src={img.image_url}
                            alt={`Image ${img.display_order}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* New Additional Images */}
            <div>
              <label htmlFor="additionalImages" className="block text-sm font-medium text-gray-700 mb-2">
                Add More Images (Multiple images can be selected)
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
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">New Images Preview:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </div>
              )}
            </div>

            {/* Property Brochure */}
            <div className="mb-6">
              <label htmlFor="brochure" className="block text-sm font-medium text-gray-700 mb-2">
                Property Brochure (PDF)
              </label>
              {existingBrochureUrl && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Current Brochure:</p>
                  <a 
                    href={existingBrochureUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#c99700] hover:text-[#a67800] underline text-sm"
                  >
                    View Current Brochure
                  </a>
                </div>
              )}
              <input
                type="file"
                id="brochure"
                accept="application/pdf"
                onChange={handleBrochureChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b]"
              />
              {brochureFile && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✅ New file selected: {brochureFile.name}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Size: {(brochureFile.size / 1024 / 1024).toFixed(2)} MB | Type: {brochureFile.type}
                  </p>
                </div>
              )}
              {existingBrochureUrl && !brochureFile && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    📄 Current brochure available
                  </p>
                  <a 
                    href={existingBrochureUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                  >
                    View current brochure →
                  </a>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Upload a PDF brochure for this property (max 10MB). This will replace the existing brochure if one exists.</p>
            </div>

            {/* Payment Plan */}
            <div className="mb-6">
              <label htmlFor="payment_plan" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Plan
              </label>
              <textarea
                id="payment_plan"
                rows={4}
                value={formData.payment_plan}
                onChange={(e) => setFormData({ ...formData, payment_plan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd86b] focus:border-[#ffd86b] bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="Payment plan details..."
              />
            </div>
          </div>
          )}

          {/* Step 4: Review Page */}
          {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Review Your Changes</h2>
            
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
                                  {tower.no_of_basements && <span>Basements: {tower.no_of_basements}</span>}
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
                  {(coverImageUrl || imagePreviews.cover) && (
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Cover Image:</span>
                      <div className="mt-2">
                        <img
                          src={imagePreviews.cover?.startsWith('data:') ? imagePreviews.cover : (coverImageUrl || imagePreviews.cover)}
                          alt="Cover preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  )}
                  {existingImages.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Existing Images ({existingImages.length}):</span>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative">
                            <div className="relative w-full h-32">
                              <Image
                                src={img.image_url}
                                alt={`Image ${img.display_order}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {imagePreviews.additional.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 text-sm">New Images to Add ({imagePreviews.additional.length}):</span>
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
                  {imagesToDelete.length > 0 && (
                    <div>
                      <span className="font-medium text-red-700 text-sm">Images to Delete ({imagesToDelete.length})</span>
                    </div>
                  )}
                  {!coverImageUrl && !imagePreviews.cover && existingImages.length === 0 && imagePreviews.additional.length === 0 && (
                    <p className="text-gray-500 text-sm">No images</p>
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
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#c99700] text-white rounded-lg font-semibold hover:bg-[#a67800] transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSubmit(e)
                  }}
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

