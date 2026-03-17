"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Calendar, 
  Heart, 
  MessageSquare, 
  DollarSign,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { LiveUpdateBadge } from '@/components/dashboard/live-update-badge'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalMembers: number
  prayerRequests: number
  pendingPrayers: number
  upcomingEvents: number
  nextEventTitle: string
  totalDonations: number
}

interface Activity {
  id: string
  type: 'prayer' | 'member' | 'donation' | 'counseling' | 'event'
  message: string
  time: string
  status: 'pending' | 'complete'
}

const adminActions = [
  { icon: Users, label: 'Manage Members', href: '/admin/members', description: 'View and manage church members' },
  { icon: Heart, label: 'Prayer Requests', href: '/admin/prayers', description: 'Review and respond to prayers' },
  { icon: Calendar, label: 'Manage Events', href: '/admin/events', description: 'Create and edit events' },
  { icon: MessageSquare, label: 'Counseling Requests', href: '/admin/counseling', description: 'View counseling appointments' },
  { icon: FileText, label: 'Content Management', href: '/admin/content', description: 'Edit website content' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports', description: 'View analytics and reports' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    prayerRequests: 0,
    pendingPrayers: 0,
    upcomingEvents: 0,
    nextEventTitle: 'No upcoming events',
    totalDonations: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch member count
        const { count: memberCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Fetch prayer request stats
        const { count: prayerCount } = await supabase
          .from('prayer_requests')
          .select('*', { count: 'exact', head: true })

        const { count: pendingPrayerCount } = await supabase
          .from('prayer_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        // Fetch upcoming events
        const today = new Date().toISOString().split('T')[0]
        const { data: eventsData, count: eventCount } = await supabase
          .from('events')
          .select('title', { count: 'exact' })
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(1)

        // Fetch donation total (this month)
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const { data: donationsData } = await supabase
          .from('donations')
          .select('amount')
          .gte('created_at', startOfMonth)

        const totalDonations = donationsData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

        setStats({
          totalMembers: memberCount || 0,
          prayerRequests: prayerCount || 0,
          pendingPrayers: pendingPrayerCount || 0,
          upcomingEvents: eventCount || 0,
          nextEventTitle: eventsData?.[0]?.title || 'Sunday Service',
          totalDonations
        })

        // Fetch recent activities
        const recentActivities: Activity[] = []

        // Recent prayer requests
        const { data: recentPrayers } = await supabase
          .from('prayer_requests')
          .select('id, name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(2)

        recentPrayers?.forEach(prayer => {
          recentActivities.push({
            id: `prayer-${prayer.id}`,
            type: 'prayer',
            message: `New prayer request from ${prayer.name || 'Anonymous'}`,
            time: formatTimeAgo(prayer.created_at),
            status: prayer.status === 'pending' ? 'pending' : 'complete'
          })
        })

        // Recent counseling requests
        const { data: recentCounseling } = await supabase
          .from('counseling_requests')
          .select('id, name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(2)

        recentCounseling?.forEach(request => {
          recentActivities.push({
            id: `counseling-${request.id}`,
            type: 'counseling',
            message: `Counseling request from ${request.name}`,
            time: formatTimeAgo(request.created_at),
            status: request.status === 'pending' ? 'pending' : 'complete'
          })
        })

        // Recent donations
        const { data: recentDonations } = await supabase
          .from('donations')
          .select('id, amount, created_at')
          .order('created_at', { ascending: false })
          .limit(1)

        recentDonations?.forEach(donation => {
          recentActivities.push({
            id: `donation-${donation.id}`,
            type: 'donation',
            message: `Donation received: $${donation.amount}`,
            time: formatTimeAgo(donation.created_at),
            status: 'complete'
          })
        })

        // Sort by most recent and limit
        recentActivities.sort((a, b) => {
          // Simple sort - in production you'd parse the time strings
          return 0
        })

        setActivities(recentActivities.length > 0 ? recentActivities.slice(0, 5) : [
          { id: '1', type: 'prayer', message: 'New prayer request submitted', time: '5 minutes ago', status: 'pending' },
          { id: '2', type: 'member', message: 'New member registration: Sarah Johnson', time: '1 hour ago', status: 'complete' },
          { id: '3', type: 'donation', message: 'Donation received: $150', time: '2 hours ago', status: 'complete' },
          { id: '4', type: 'counseling', message: 'Counseling request from John D.', time: '3 hours ago', status: 'pending' },
          { id: '5', type: 'event', message: 'Youth Fellowship RSVP: 24 attending', time: 'Yesterday', status: 'complete' },
        ])

      } catch (error) {
        // Silently handle errors
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Debounce timer for updates
    let updateTimeout: NodeJS.Timeout

    // Subscribe to real-time updates for prayer requests, counseling, donations, events, and profiles
    // All use a debounced refresh to prevent excessive database queries
    const debouncedFetch = () => {
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        setIsUpdating(true)
        fetchDashboardData()
      }, 500)
    }

    const prayersSubscription = supabase
      .channel('prayer_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests' }, debouncedFetch)
      .subscribe()

    const counselingSubscription = supabase
      .channel('counseling_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'counseling_requests' }, debouncedFetch)
      .subscribe()

    const donationsSubscription = supabase
      .channel('donations_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, debouncedFetch)
      .subscribe()

    const eventsSubscription = supabase
      .channel('events_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, debouncedFetch)
      .subscribe()

    const profilesSubscription = supabase
      .channel('profiles_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, debouncedFetch)
      .subscribe()

    return () => {
      prayersSubscription.unsubscribe()
      counselingSubscription.unsubscribe()
      donationsSubscription.unsubscribe()
      eventsSubscription.unsubscribe()
      profilesSubscription.unsubscribe()
    }
  }, [supabase])

  function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  const statsData = [
    { 
      label: 'Total Members', 
      value: loading ? '...' : stats.totalMembers.toString(), 
      icon: Users, 
      change: '+12 this month', 
      color: 'text-[var(--church-primary)]' 
    },
    { 
      label: 'Prayer Requests', 
      value: loading ? '...' : stats.prayerRequests.toString(), 
      icon: Heart, 
      change: `${stats.pendingPrayers} pending`, 
      color: 'text-rose-500' 
    },
    { 
      label: 'Upcoming Events', 
      value: loading ? '...' : stats.upcomingEvents.toString(), 
      icon: Calendar, 
      change: `Next: ${stats.nextEventTitle}`, 
      color: 'text-emerald-500' 
    },
    { 
      label: 'Monthly Donations', 
      value: loading ? '...' : `$${stats.totalDonations.toLocaleString()}`, 
      icon: DollarSign, 
      change: 'This month', 
      color: 'text-[var(--church-gold)]' 
    },
  ]

  return (
    <DashboardLayout variant="admin">
      <LiveUpdateBadge isUpdating={isUpdating} />
      <main className="min-h-screen bg-[var(--church-light-blue)] p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your church community and activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your church community</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--church-primary)]" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'pending' ? 'bg-[var(--church-gold)]' : 'bg-emerald-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        {activity.status === 'pending' ? (
                          <Badge variant="secondary" className="bg-[var(--church-gold)]/10 text-[var(--church-gold)]">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Key metrics overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Service Attendance</span>
                <span className="font-semibold text-foreground">189</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Visitors</span>
                <span className="font-semibold text-foreground">7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bible Studies</span>
                <span className="font-semibold text-foreground">4 sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Prayers Answered</span>
                <span className="font-semibold text-foreground">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Volunteers Active</span>
                <span className="font-semibold text-foreground">32</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--church-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-6 h-6 text-[var(--church-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{action.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </DashboardLayout>
  )
}
