"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  BookOpen, 
  Heart, 
  MessageSquare, 
  Clock,
  TrendingUp,
  Star,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { LiveUpdateBadge } from '@/components/dashboard/live-update-badge'
import { createClient } from '@/lib/supabase/client'

const quickActions = [
  { icon: Heart, label: 'Submit Prayer Request', href: '/prayer-request', color: 'bg-rose-500' },
  { icon: Calendar, label: 'View Events', href: '/events', color: 'bg-[var(--church-primary)]' },
  { icon: BookOpen, label: "Today's Bible Reading", href: '/bible-reading', color: 'bg-emerald-500' },
  { icon: MessageSquare, label: 'Contact Pastor', href: '/counseling', color: 'bg-[var(--church-gold)]' },
]

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: string
}

interface PrayerRequest {
  id: string
  name: string
  request: string
  is_anonymous: boolean
  created_at: string
}

interface DailyVerse {
  verse_text: string
  reference: string
}

export default function MemberDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch upcoming events
        const today = new Date().toISOString().split('T')[0]
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, date, time, type')
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(3)

        if (eventsData) setEvents(eventsData)

        // Fetch public prayer requests for the prayer wall
        const { data: prayersData } = await supabase
          .from('prayer_requests')
          .select('id, name, request, is_anonymous, created_at')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(2)

        if (prayersData) setPrayerRequests(prayersData)

        // Fetch today's verse
        const { data: verseData } = await supabase
          .from('daily_verses')
          .select('verse_text, reference')
          .eq('date', today)
          .single()

        if (verseData) {
          setDailyVerse(verseData)
        } else {
          // Fallback verse
          setDailyVerse({
            verse_text: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
            reference: 'Jeremiah 29:11 (NIV)'
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Debounce timer for updates
    let updateTimeout: NodeJS.Timeout

    // Subscribe to real-time updates with debouncing to prevent excessive queries
    const debouncedFetch = () => {
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        setIsUpdating(true)
        fetchData()
      }, 500)
    }

    const eventsSubscription = supabase
      .channel('events_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, debouncedFetch)
      .subscribe()

    const prayersSubscription = supabase
      .channel('prayer_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests' }, debouncedFetch)
      .subscribe()

    const versesSubscription = supabase
      .channel('daily_verses_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_verses' }, debouncedFetch)
      .subscribe()

    return () => {
      clearTimeout(updateTimeout)
      eventsSubscription.unsubscribe()
      prayersSubscription.unsubscribe()
      versesSubscription.unsubscribe()
    }
  }, [supabase])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 7) return `This ${dayNames[date.getDay()]}`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTimeAgo = (dateStr: string) => {
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

  // Fallback events for when database is empty
  const fallbackEvents = [
    { id: '1', title: 'Sunday Worship Service', date: 'This Sunday', time: '10:00 AM', type: 'worship' },
    { id: '2', title: 'Midweek Bible Study', date: 'Wednesday', time: '7:00 PM', type: 'study' },
    { id: '3', title: 'Youth Fellowship', date: 'Friday', time: '6:00 PM', type: 'fellowship' },
  ]

  const displayEvents = events.length > 0 ? events : fallbackEvents

  const spiritualGrowth = [
    { label: 'Bible Reading Streak', value: '7 days', icon: Star },
    { label: 'Services Attended', value: '12 this month', icon: TrendingUp },
    { label: 'Prayer Requests', value: '3 answered', icon: Heart },
  ]

  return (
    <DashboardLayout variant="member">
      <LiveUpdateBadge isUpdating={isUpdating} />
      <main className="min-h-screen bg-[var(--church-light-blue)] p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Here's what's happening in your spiritual journey"}
          </p>
        </div>

        {/* Daily Verse Card */}
        <Card className="mb-8 bg-gradient-to-r from-[var(--church-primary)] to-[var(--church-primary-deep)] text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm font-medium opacity-90 mb-2">Verse of the Day</p>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                <blockquote className="text-lg md:text-xl font-serif italic leading-relaxed">
                  {dailyVerse?.verse_text}
                </blockquote>
                <p className="mt-3 text-sm font-medium">- {dailyVerse?.reference}</p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{action.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Spiritual Growth */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Your Growth</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                {spiritualGrowth.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-[var(--church-gold)]" />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Events</h2>
            <Link href="/events">
              <Button variant="ghost" className="text-[var(--church-primary)]">
                View All
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--church-primary)]" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {displayEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={
                          event.type === 'worship' ? 'bg-[var(--church-primary)]/10 text-[var(--church-primary)]' :
                          event.type === 'study' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-[var(--church-gold)]/10 text-[var(--church-gold)]'
                        }
                      >
                        {event.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {typeof event.date === 'string' && event.date.includes('-') 
                          ? formatDate(event.date) 
                          : event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Prayer Wall Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Community Prayer Wall
            </CardTitle>
            <CardDescription>
              Pray for our church family and share your requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--church-primary)]" />
              </div>
            ) : (
              <div className="space-y-3">
                {prayerRequests.length > 0 ? (
                  prayerRequests.map((prayer) => (
                    <div key={prayer.id} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-foreground line-clamp-2">{prayer.request}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {prayer.is_anonymous ? 'Anonymous' : prayer.name} - {formatTimeAgo(prayer.created_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-foreground">Please pray for healing for my mother...</p>
                      <p className="text-xs text-muted-foreground mt-1">Anonymous - 2 hours ago</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-foreground">Thankful for answered prayer! Got the job...</p>
                      <p className="text-xs text-muted-foreground mt-1">Sarah M. - Yesterday</p>
                    </div>
                  </>
                )}
              </div>
            )}
            <Link href="/prayer-request">
              <Button className="w-full mt-4 bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white">
                Submit Prayer Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  )
}
