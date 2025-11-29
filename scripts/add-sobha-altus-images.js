/**
 * Script to add images for Sobha Altus project to the database
 * 
 * Usage:
 * 1. Place your images in a folder (e.g., ./sobha-altus-images/)
 * 2. Update the IMAGE_FILES array below with your image filenames
 * 3. Update the PROJECT_SLUG if needed
 * 4. Run: node scripts/add-sobha-altus-images.js
 * 
 * Requirements:
 * - Node.js environment
 * - Environment variables set (.env.local)
 * - Images must be uploaded to Supabase Storage first OR provide direct URLs
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configuration
const PROJECT_SLUG = 'sobha-altus' // Update if different
const IMAGE_FILES = [
  // Option 1: If you have local image files, list them here
  // Example: 'sobha-altus-1.jpg', 'sobha-altus-2.jpg', etc.
  
  // Option 2: If you have direct image URLs, use ADD_SOBHA_ALTUS_IMAGES.sql instead
]

// Option 3: Direct image URLs (if images are already hosted)
const IMAGE_URLS = [
  // Add your image URLs here, for example:
  // 'https://example.com/sobha-altus-1.jpg',
  // 'https://example.com/sobha-altus-2.jpg',
]

/**
 * Get project ID by slug
 */
async function getProjectId(slug) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    throw new Error(`Project with slug "${slug}" not found: ${error.message}`)
  }

  return { id: data.id, name: data.name }
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImageToStorage(filePath, projectName) {
  const fileName = path.basename(filePath)
  const sanitizedProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  const storagePath = `properties/${sanitizedProjectName}/${fileName}-${Date.now()}`

  const fileBuffer = fs.readFileSync(filePath)
  const fileExt = path.extname(fileName).toLowerCase()
  const contentType = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  }[fileExt] || 'image/jpeg'

  const { data, error } = await supabase.storage
    .from('project-images')
    .upload(storagePath, fileBuffer, {
      contentType,
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error(`Error uploading ${fileName}:`, error)
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('project-images')
    .getPublicUrl(storagePath)

  return publicUrl
}

/**
 * Add images to project_images table
 */
async function addImagesToDatabase(projectId, imageUrls) {
  const imagesToInsert = imageUrls.map((url, index) => ({
    project_id: projectId,
    image_url: url,
    display_order: index + 1
  }))

  const { data, error } = await supabase
    .from('project_images')
    .insert(imagesToInsert)
    .select()

  if (error) {
    console.error('Error inserting images:', error)
    throw error
  }

  return data
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting image upload process for Sobha Altus...\n')

    // Get project details
    console.log(`📋 Looking up project: ${PROJECT_SLUG}...`)
    const project = await getProjectId(PROJECT_SLUG)
    console.log(`✅ Found project: ${project.name} (ID: ${project.id})\n`)

    let imageUrls = []

    // Option 1: Upload local files
    if (IMAGE_FILES.length > 0) {
      console.log(`📤 Uploading ${IMAGE_FILES.length} local image(s)...\n`)
      const imagesDir = path.join(__dirname, '../sobha-altus-images')
      
      if (!fs.existsSync(imagesDir)) {
        console.error(`❌ Error: Images directory not found: ${imagesDir}`)
        console.error('   Please create the directory and add your images there.')
        process.exit(1)
      }

      for (let i = 0; i < IMAGE_FILES.length; i++) {
        const fileName = IMAGE_FILES[i]
        const filePath = path.join(imagesDir, fileName)
        
        if (!fs.existsSync(filePath)) {
          console.warn(`⚠️  Warning: File not found: ${filePath}`)
          continue
        }

        console.log(`   Uploading ${i + 1}/${IMAGE_FILES.length}: ${fileName}...`)
        try {
          const url = await uploadImageToStorage(filePath, project.name)
          imageUrls.push(url)
          console.log(`   ✅ Uploaded: ${url}\n`)
        } catch (error) {
          console.error(`   ❌ Failed to upload ${fileName}:`, error.message)
        }
      }
    }
    // Option 2: Use direct URLs
    else if (IMAGE_URLS.length > 0) {
      console.log(`📋 Using ${IMAGE_URLS.length} direct image URL(s)...\n`)
      imageUrls = IMAGE_URLS
    }
    else {
      console.error('❌ Error: No images specified!')
      console.error('\nPlease either:')
      console.error('  1. Add image filenames to IMAGE_FILES array and place files in ./sobha-altus-images/')
      console.error('  2. Add image URLs to IMAGE_URLS array')
      console.error('  3. Use the SQL script: ADD_SOBHA_ALTUS_IMAGES.sql')
      process.exit(1)
    }

    if (imageUrls.length === 0) {
      console.error('❌ No images to add!')
      process.exit(1)
    }

    // Add images to database
    console.log(`💾 Adding ${imageUrls.length} image(s) to database...\n`)
    const insertedImages = await addImagesToDatabase(project.id, imageUrls)
    
    console.log('✅ Successfully added images to database!')
    console.log(`\n📊 Summary:`)
    console.log(`   Project: ${project.name}`)
    console.log(`   Images added: ${insertedImages.length}`)
    console.log(`\n🎉 Done! Check your project details page to see the images.`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the script
main()

