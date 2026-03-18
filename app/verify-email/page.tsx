"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { SiteLayout } from '@/components/layout/site-layout'

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const { resendVerificationEmail } = useAuth()

  const handleResendEmail = async () => {
    setIsResending(true)
    setMessage('')

    const result = await resendVerificationEmail()

    if (result.success) {
      setMessage('Verification email sent! Check your inbox.')
    } else {
      setMessage(result.error || 'Failed to resend email')
    }

    setIsResending(false)
  }

  return (
    <SiteLayout>
      <main className="min-h-screen bg-[var(--church-light-blue)] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-[var(--church-primary)]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Verify Your Email</CardTitle>
                  <CardDescription className="mt-2">
                    We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {message && (
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm text-center">
                    {message}
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Tip:</strong> Check your spam or promotional folder if you don't see the email in your inbox.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Didn't receive the email?
                  </p>
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full text-center text-sm text-[var(--church-primary)] hover:text-[var(--church-primary-deep)] font-medium transition-colors"
                >
                  Already verified? Go to login
                </Link>
              </CardFooter>
            </Card>

            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="p-4 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">What's next?</p>
                  <p>Once you verify your email, you'll have full access to your member account and all church resources.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </SiteLayout>
  )
}
