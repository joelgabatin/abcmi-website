import { createClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return Response.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create new user with member role by default
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'member',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Registration error:', error)
      return Response.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Registration error:', error)
    return Response.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
