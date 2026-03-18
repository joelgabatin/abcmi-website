"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Mail, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { SiteLayout } from '@/components/layout/site-layout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)

    const result = await resetPassword(email)

    if (result.success) {
      setMessageType('success')
      setMessage('Password reset email sent! Check your inbox for instructions.')
      setEmail('')
    } else {
      setMessageType('error')
      setMessage(result.error || 'Failed to send reset email')
    }

    setIsLoading(false)
  }

  return (
    <SiteLayout>
      <main className="min-h-screen bg-[var(--church-light-blue)] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-[var(--church-primary)] rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {message && (
                    <div className={`p-3 rounded-lg text-sm text-center ${
                      messageType === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      We'll send you an email with a link to reset your password. The link will expire in 24 hours.
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
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
