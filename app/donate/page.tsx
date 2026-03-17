'use client'

import { useEffect, useState } from 'react'
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HandCoins, Heart, Copy, CheckCircle, DollarSign, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Donation {
  id: string
  donor_name: string | null
  amount: number
  currency: string
  type: string
  created_at: string
}

export default function DonatePage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState('50')
  const [donationType, setDonationType] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const donationTypes = [
    { value: 'general', label: 'General Fund' },
    { value: 'missions', label: 'Missions' },
    { value: 'building', label: 'Building Fund' },
    { value: 'community', label: 'Community Outreach' },
    { value: 'youth', label: 'Youth Ministry' },
  ]

  const presetAmounts = [20, 50, 100, 250, 500]

  useEffect(() => {
    fetchDonations()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('donations_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        (payload) => {
          console.log('[v0] Donations updated:', payload)
          fetchDonations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchDonations() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching donations:', error)
    } else {
      setDonations(data || [])
    }
    setIsLoading(false)
  }

  const handleDonate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('donations').insert({
        donor_name: 'Anonymous Donor',
        amount: parseFloat(donationAmount),
        currency: 'USD',
        type: 'general',
        is_anonymous: true,
      })

      if (error) throw error

      toast({
        title: 'Thank You!',
        description: `Your donation of $${donationAmount} has been received. God bless you!`,
      })

      setDonationAmount('50')
      fetchDonations()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process donation. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)
  const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0

  return (
    <SiteLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--church-primary)] to-[var(--church-secondary)] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Support Our Church</h1>
          </div>
          <p className="text-lg text-white/90">
            Your generous giving helps us continue our mission of spreading God's love
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Donations</p>
                      <p className="text-2xl font-bold">${totalDonations.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-[var(--church-gold)]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Donors</p>
                      <p className="text-2xl font-bold">{donations.length}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Avg Donation</p>
                      <p className="text-2xl font-bold">${avgDonation.toFixed(0)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donation Form */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
                <CardDescription>Choose a cause and amount that matters to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDonate} className="space-y-6">
                  {/* Donation Type */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Where should your donation go?</Label>
                    <RadioGroup value={donationType} onValueChange={setDonationType}>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {donationTypes.map((type) => (
                          <div key={type.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                            <RadioGroupItem value={type.value} id={type.value} />
                            <Label htmlFor={type.value} className="flex-1 cursor-pointer font-semibold">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Amount */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Donation Amount</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={donationAmount === amount.toString() ? 'default' : 'outline'}
                          onClick={() => setDonationAmount(amount.toString())}
                          className={donationAmount === amount.toString() ? 'bg-[var(--church-primary)]' : ''}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        min="1"
                        step="0.01"
                        className="pl-7"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white h-12 text-lg"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Processing...' : `Donate $${donationAmount}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recent Donations */}
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Donations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : donations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No donations yet</p>
                ) : (
                  donations.map((donation) => (
                    <div key={donation.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{donation.donor_name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{donation.type}</p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--church-gold)]">
                        ${donation.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
