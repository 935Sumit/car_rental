import { createClient } from '@supabase/supabase-js'
import { mockRentals } from '../data/mockData.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function uploadData() {
  console.log('Starting data upload to Supabase...')
  
  // 1. Process data to remove 'id' (let Supabase generate UUID) and add defaults
  const dataToUpload = mockRentals.map(({ id, ...car }) => ({
    ...car,
    availability: car.availability !== undefined ? car.availability : true,
    status: car.status || 'available',
    chauffeurAvailable: car.chauffeurAvailable !== undefined ? car.chauffeurAvailable : false,
    created_at: new Date().toISOString()
  }))

  // 2. Insert into database
  console.log(`Uploading ${dataToUpload.length} cars to 'rentals' table...`)
  const { data, error } = await supabase
    .from('rentals')
    .insert(dataToUpload)
    .select()

  if (error) {
    console.error('Failed to upload data:', error.message, error.details)
    return
  }

  console.log('✅ Successfully uploaded data to database.')
  console.log('NOTE: Images are currently linked via URLs in the database to the local /gadi photos/ folder. They will load correctly in your local development environment.')
  console.log('To make images work in production, you would need to upload the actual image files to a Supabase Storage bucket and update the URL references.')
}

uploadData()
