"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { SiteLayout } from '@/components/layout/site-layout'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.')
      }

      setIsCheckingToken(false)
    }

    checkRecoverySession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('An error occurred while resetting your password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <SiteLayout>
        <main className="min-h-screen bg-[var(--church-light-blue)] py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <p>Loading...</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SiteLayout>
    )
  }

  if (isSuccess) {
    return (
      <SiteLayout>
        <main className="min-h-screen bg-[var(--church-light-blue)] py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg border-0">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">Password Reset</CardTitle>
                    <CardDescription className="mt-2">
                      Your password has been successfully reset. Redirecting to login...
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button asChild className="w-full bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white">
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <main className="min-h-screen bg-[var(--church-light-blue)] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-[var(--church-primary)] rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Create New Password</CardTitle>
                <CardDescription>
                  Enter your new password below
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Password must be at least 6 characters
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Remember your password?{' '}
                    <Link
                      href="/login"
                      className="text-[var(--church-primary)] hover:text-[var(--church-primary-deep)] font-medium transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </SiteLayout>
  )
}
