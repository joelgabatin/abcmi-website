"use client"

import { useState, useEffect } from 'react'
import { BarChart3, Users, Heart, Calendar, DollarSign, TrendingUp, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Stats {
  totalMembers: number
  newMembersThisMonth: number
  totalPrayerRequests: number
  pendingPrayerRequests: number
  answeredPrayers: number
  totalEvents: number
  upcomingEvents: number
  totalDonations: number
  donationsThisMonth: number
  counselingRequests: number
  pendingCounseling: number
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  async function fetchStats() {
    setIsLoading(true)
    
    try {
      // Fetch all data in parallel
      const [
        { count: totalMembers },
        { data: newMembers },
        { count: totalPrayerRequests },
        { count: pendingPrayers },
        { count: answeredPrayers },
        { count: totalEvents },
        { count: upcomingEvents },
        { data: donations },
        { data: monthDonations },
        { count: totalCounseling },
        { count: pendingCounseling },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('updated_at').gte('updated_at', getStartDate()),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('status', 'answered'),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString().split('T')[0]),
        supabase.from('donations').select('amount'),
        supabase.from('donations').select('amount').gte('created_at', getStartDate()),
        supabase.from('counseling_requests').select('*', { count: 'exact', head: true }),
        supabase.from('counseling_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      const totalDonationsAmount = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const monthDonationsAmount = monthDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

      setStats({
        totalMembers: totalMembers || 0,
        newMembersThisMonth: newMembers?.length || 0,
        totalPrayerRequests: totalPrayerRequests || 0,
        pendingPrayerRequests: pendingPrayers || 0,
        answeredPrayers: answeredPrayers || 0,
        totalEvents: totalEvents || 0,
        upcomingEvents: upcomingEvents || 0,
        totalDonations: totalDonationsAmount,
        donationsThisMonth: monthDonationsAmount,
        counselingRequests: totalCounseling || 0,
        pendingCounseling: pendingCounseling || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' })
    }
    
    setIsLoading(false)
  }

  function getStartDate() {
    const now = new Date()
    switch (timeRange) {
      case 'week':
        now.setDate(now.getDate() - 7)
        break
      case 'month':
        now.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        now.setMonth(now.getMonth() - 3)
        break
      case 'year':
        now.setFullYear(now.getFullYear() - 1)
        break
    }
    return now.toISOString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <DashboardLayout variant="admin">
        <main className="min-h-screen bg-[var(--church-light-blue)] p-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[var(--church-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout variant="admin">
      <main className="min-h-screen bg-[var(--church-light-blue)] p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Overview of church activities and metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Membership Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--church-primary)]" />
            Membership
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold mt-1">{stats?.totalMembers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--church-primary)]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[var(--church-primary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Members</p>
                    <p className="text-3xl font-bold mt-1">{stats?.newMembersThisMonth}</p>
                    <p className="text-xs text-muted-foreground mt-1">in selected period</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats?.totalMembers ? ((stats.newMembersThisMonth / stats.totalMembers) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--church-gold)]/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-[var(--church-gold)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prayer Requests Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Prayer Requests
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-3xl font-bold mt-1">{stats?.totalPrayerRequests}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold mt-1">{stats?.pendingPrayerRequests}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Answered</p>
                    <p className="text-3xl font-bold mt-1">{stats?.answeredPrayers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Events & Donations */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Events Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--church-primary)]" />
              Events
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="text-2xl font-bold">{stats?.totalEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Upcoming Events</span>
                  <span className="text-2xl font-bold text-[var(--church-primary)]">{stats?.upcomingEvents}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donations Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[var(--church-gold)]" />
              Donations
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Received</span>
                  <span className="text-2xl font-bold text-[var(--church-gold)]">{formatCurrency(stats?.totalDonations || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">This Period</span>
                  <span className="text-2xl font-bold">{formatCurrency(stats?.donationsThisMonth || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Counseling Stats */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--church-primary)]" />
            Counseling
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-3xl font-bold mt-1">{stats?.counselingRequests}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--church-primary)]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[var(--church-primary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold mt-1">{stats?.pendingCounseling}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
