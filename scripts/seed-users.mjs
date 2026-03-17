import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function seedUsers() {
  console.log('Starting to seed users...')

  // Hash demo passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const memberPasswordHash = await bcrypt.hash('member123', 10)

  const users = [
    {
      email: 'admin@abcmi.com',
      password_hash: adminPasswordHash,
      name: 'Admin User',
      role: 'admin',
    },
    {
      email: 'member@abcmi.com',
      password_hash: memberPasswordHash,
      name: 'Member User',
      role: 'member',
    },
  ]

  for (const user of users) {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (existingUser) {
      console.log(`User ${user.email} already exists, skipping...`)
      continue
    }

    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()

    if (error) {
      console.error(`Error inserting user ${user.email}:`, error)
    } else {
      console.log(`Successfully created user: ${user.email}`)
    }
  }

  console.log('Seeding complete!')
}

seedUsers().catch(error => {
  console.error('Seed failed:', error)
  process.exit(1)
})
