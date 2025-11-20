/**
 * Script to sync developers from projects table
 * This ensures all developers mentioned in projects are in the developers table
 * 
 * Run this script using: node scripts/sync-developers-from-projects.js
 * Or use it as a reference for creating an API endpoint
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function developerNameToSlug(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function syncDevelopersFromProjects() {
  try {
    console.log('Fetching unique developers from projects table...')
    
    // Get all unique developers from projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('developer')
      .not('developer', 'is', null)

    if (projectsError) {
      throw new Error(`Error fetching projects: ${projectsError.message}`)
    }

    // Get unique developer names
    const uniqueDevelopers = [...new Set(
      projects
        .map(p => p.developer?.trim())
        .filter(Boolean)
    )]

    console.log(`Found ${uniqueDevelopers.length} unique developers`)

    // Prepare developers data
    const developersToInsert = uniqueDevelopers.map((name, index) => ({
      name: name.trim(),
      slug: developerNameToSlug(name),
      is_featured: false,
      display_order: index + 1,
      is_active: true
    }))

    // Upsert developers
    console.log('Inserting/updating developers...')
    const { data: insertedDevelopers, error: insertError } = await supabase
      .from('developers')
      .upsert(developersToInsert, {
        onConflict: 'name',
        ignoreDuplicates: false
      })
      .select()

    if (insertError) {
      throw new Error(`Error inserting developers: ${insertError.message}`)
    }

    console.log(`Successfully synced ${insertedDevelopers.length} developers`)

    // Sync statistics
    console.log('Syncing developer statistics...')
    const { error: statsError } = await supabase.rpc('sync_developer_stats')

    if (statsError) {
      console.warn(`Warning: Could not sync stats: ${statsError.message}`)
    } else {
      console.log('Statistics synced successfully')
    }

    console.log('\n✅ Sync completed successfully!')
    return insertedDevelopers
  } catch (error) {
    console.error('❌ Error syncing developers:', error)
    throw error
  }
}

// Run the sync
if (require.main === module) {
  syncDevelopersFromProjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { syncDevelopersFromProjects }

