/**
 * Quick Diagnostic Script for Supabase Migration
 * Run this to test your Supabase connection and data
 * 
 * Usage: node test-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Supabase Connection Diagnostic\n')
console.log('=' .repeat(50))

// Check environment variables
console.log('\n1. Checking Environment Variables...')
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing!')
  process.exit(1)
}
if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
  process.exit(1)
}
if (!supabaseServiceKey) {
  console.error('⚠️  SUPABASE_SERVICE_ROLE_KEY is missing (needed for admin operations)')
}

console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...')
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...')
console.log(supabaseServiceKey ? '✅ SUPABASE_SERVICE_ROLE_KEY: Set' : '⚠️  SUPABASE_SERVICE_ROLE_KEY: Not set')

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
async function runDiagnostics() {
  console.log('\n2. Testing Database Connection...')
  
  try {
    // Test 1: Check if projects table exists and has data
    console.log('\n   Testing: Fetch projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, type')
      .limit(5)
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError.message)
      console.error('   Code:', projectsError.code)
      console.error('   Details:', projectsError.details)
      console.error('   Hint:', projectsError.hint)
      
      if (projectsError.code === 'PGRST116') {
        console.error('\n   💡 Solution: Table "projects" does not exist. Run COMPLETE_DATABASE_MIGRATION.sql')
      }
      if (projectsError.code === '42501') {
        console.error('\n   💡 Solution: RLS policy violation. Run ADMIN_RLS_SETUP.sql')
      }
    } else {
      console.log(`✅ Success! Found ${projects?.length || 0} projects`)
      if (projects && projects.length > 0) {
        console.log('   Sample projects:')
        projects.forEach(p => console.log(`   - ${p.name} (${p.type})`))
      } else {
        console.log('   ⚠️  No projects found in database')
        console.log('   💡 Solution: Import data from old database')
      }
    }
    
    // Test 2: Check project count by type
    console.log('\n   Testing: Count projects by type...')
    const { data: apartmentCount, error: aptError } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'apartment')
    
    const { data: builderCount, error: bfError } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'builder-floor')
    
    if (!aptError && !bfError) {
      console.log(`✅ Apartments: ${apartmentCount?.length || 0}`)
      console.log(`✅ Builder Floors: ${builderCount?.length || 0}`)
    }
    
    // Test 3: Check project_images table
    console.log('\n   Testing: Check project_images table...')
    const { data: images, error: imagesError } = await supabase
      .from('project_images')
      .select('id, project_id')
      .limit(5)
    
    if (imagesError) {
      if (imagesError.code === 'PGRST116') {
        console.log('⚠️  project_images table does not exist')
        console.log('   💡 Solution: Run PROJECT_IMAGES_TABLE.sql')
      } else {
        console.error('❌ Error:', imagesError.message)
      }
    } else {
      console.log(`✅ Found ${images?.length || 0} project images`)
    }
    
    // Test 4: Check developers table
    console.log('\n   Testing: Check developers table...')
    const { data: developers, error: devError } = await supabase
      .from('developers')
      .select('id, name')
      .limit(5)
    
    if (devError) {
      if (devError.code === 'PGRST116') {
        console.log('⚠️  developers table does not exist')
        console.log('   💡 Solution: Run DEVELOPERS_TABLE_SETUP.sql')
      } else {
        console.error('❌ Error:', devError.message)
      }
    } else {
      console.log(`✅ Found ${developers?.length || 0} developers`)
    }
    
    // Test 5: Check if images have valid URLs
    console.log('\n   Testing: Check project image URLs...')
    const { data: projectsWithImages, error: imgUrlError } = await supabase
      .from('projects')
      .select('id, name, image_url')
      .not('image_url', 'is', null)
      .limit(3)
    
    if (!imgUrlError && projectsWithImages) {
      console.log(`✅ Found ${projectsWithImages.length} projects with images`)
      projectsWithImages.forEach(p => {
        const isOldUrl = p.image_url?.includes('old-project') || p.image_url?.includes('bgombdxqcuuhuujmvbze')
        if (isOldUrl) {
          console.log(`   ⚠️  ${p.name}: Has old Supabase URL`)
        } else {
          console.log(`   ✅ ${p.name}: Image URL looks correct`)
        }
      })
    }
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('\n📊 Diagnostic Summary:')
    console.log('='.repeat(50))
    
    if (projectsError) {
      console.log('\n❌ MAIN ISSUE: Cannot fetch projects')
      console.log('   Check the error message above for solution')
    } else if (!projects || projects.length === 0) {
      console.log('\n⚠️  ISSUE: No projects in database')
      console.log('   Solution: Import data from old database')
    } else {
      console.log('\n✅ Database connection is working!')
      console.log(`   Found ${projects.length} projects`)
    }
    
    console.log('\n💡 Next Steps:')
    console.log('   1. If projects not loading: Check browser console for errors')
    console.log('   2. If RLS errors: Run ADMIN_RLS_SETUP.sql')
    console.log('   3. If images not showing: Upload files to storage and update URLs')
    console.log('   4. Restart dev server: npm run dev')
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
  }
}

runDiagnostics().catch(console.error)

