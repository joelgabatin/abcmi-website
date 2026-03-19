"use client"

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SiteLayout } from '@/components/layout/site-layout'

export default function AuthErrorPage() {
  return (
    <SiteLayout>
      <main className="min-h-screen bg-[var(--church-light-blue)] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Link Expired</CardTitle>
                  <CardDescription className="mt-2">
                    This verification link is invalid or has expired. Please request a new one.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild className="w-full bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white">
                  <Link href="/verify-email">Resend Verification Email</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
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
