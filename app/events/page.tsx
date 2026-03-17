"use client"

import { useState, useEffect } from "react"
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, ArrowRight, Bell, CheckCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  end_time: string | null
  location: string
  type: string
  is_featured: boolean
  is_recurring: boolean
  recurring_pattern: string | null
  image_url: string | null
}

interface Announcement {
  id: string
  title: string
  content: string
  excerpt: string | null
  published_at: string
  is_featured: boolean
  image_url: string | null
}

export default function EventsPage() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch upcoming events
    const { data: upcomingData } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
    
    // Fetch past events
    const { data: pastData } = await supabase
      .from('events')
      .select('*')
      .lt('date', today)
      .order('date', { ascending: false })
      .limit(6)
    
    // Fetch announcements/news
    const { data: newsData } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(10)

    if (upcomingData) setEvents(upcomingData)
    if (pastData) setPastEvents(pastData)
    if (newsData) setAnnouncements(newsData)
    setLoading(false)
  }

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubscribed(true)
  }

  const formatDate = (event: Event) => {
    if (event.is_recurring && event.recurring_pattern) {
      const patterns: Record<string, string> = {
        'weekly': `Every ${new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}`,
        'monthly': 'Monthly',
        'daily': 'Daily'
      }
      return patterns[event.recurring_pattern] || formatSimpleDate(event.date)
    }
    return formatSimpleDate(event.date)
  }

  const formatSimpleDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (event: Event) => {
    if (event.end_time) {
      return `${event.time} - ${event.end_time}`
    }
    return event.time
  }

  // Fallback data
  const fallbackUpcomingEvents = [
    {
      id: '1',
      title: "Youth Camp 2026",
      date: "2026-04-15",
      time: "8:00 AM",
      end_time: null,
      location: "Camp John Hay, Baguio City",
      description: "A three-day camp for the youth to grow in faith and fellowship. Open to all young people ages 13-25.",
      is_featured: true,
      is_recurring: false,
      recurring_pattern: null,
      type: "camp",
      image_url: null
    },
    {
      id: '2',
      title: "Women's Conference",
      date: "2026-03-28",
      time: "9:00 AM",
      end_time: "4:00 PM",
      location: "ABCMI Main Church",
      description: "An empowering conference for women of all ages. Theme: 'Arise, Shine!'",
      is_featured: false,
      is_recurring: false,
      recurring_pattern: null,
      type: "conference",
      image_url: null
    },
    {
      id: '3',
      title: "Easter Sunday Service",
      date: "2026-04-20",
      time: "6:00 AM",
      end_time: "9:00 AM",
      location: "ABCMI Main Church",
      description: "Celebrate the resurrection of our Lord with sunrise and regular services.",
      is_featured: false,
      is_recurring: false,
      recurring_pattern: null,
      type: "worship",
      image_url: null
    },
  ]

  const fallbackPastEvents = [
    {
      id: 'p1',
      title: "Christmas Outreach 2025",
      date: "2025-12-20",
      time: "9:00 AM",
      end_time: null,
      description: "Distributed gifts and shared the Gospel to 500+ children in remote communities.",
      location: "Various locations",
      is_featured: false,
      is_recurring: false,
      recurring_pattern: null,
      type: "outreach",
      image_url: null
    },
    {
      id: 'p2',
      title: "Family Day 2025",
      date: "2025-11-15",
      time: "8:00 AM",
      end_time: null,
      description: "A fun-filled day of games, fellowship, and worship for all church families.",
      location: "ABCMI Grounds",
      is_featured: false,
      is_recurring: false,
      recurring_pattern: null,
      type: "fellowship",
      image_url: null
    },
    {
      id: 'p3',
      title: "VBS 2025",
      date: "2025-06-15",
      time: "8:00 AM",
      end_time: null,
      description: "Over 200 children attended our Vacation Bible School. Many gave their lives to Christ!",
      location: "ABCMI Main Church",
      is_featured: false,
      is_recurring: false,
      recurring_pattern: null,
      type: "children",
      image_url: null
    },
  ]

  const fallbackNews = [
    {
      id: 'n1',
      title: "New Church Building Project Update",
      published_at: "2026-03-10",
      content: "We are excited to announce that the construction of our new fellowship hall is progressing well. Thank you for your continued prayers and support!",
      excerpt: null,
      is_featured: false,
      image_url: null
    },
    {
      id: 'n2',
      title: "Missions Team Returns from Laos",
      published_at: "2026-03-05",
      content: "Our missions team has returned from their trip to Vientiane, Laos. They report that the church plant is growing with 30+ regular attendees.",
      excerpt: null,
      is_featured: false,
      image_url: null
    },
  ]

  const displayEvents = events.length > 0 ? events : fallbackUpcomingEvents
  const displayPastEvents = pastEvents.length > 0 ? pastEvents : fallbackPastEvents
  const displayNews = announcements.length > 0 ? announcements : fallbackNews

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-16 bg-gradient-to-br from-[var(--church-primary)] to-[var(--church-primary-deep)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Events & News</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Stay updated with our church activities, events, and announcements.
            </p>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="py-12 lg:py-16 bg-[var(--church-light-blue)]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-[var(--church-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-background">
                  <TabsTrigger value="upcoming" className="data-[state=active]:bg-[var(--church-primary)] data-[state=active]:text-white">
                    Upcoming Events
                  </TabsTrigger>
                  <TabsTrigger value="past" className="data-[state=active]:bg-[var(--church-primary)] data-[state=active]:text-white">
                    Past Activities
                  </TabsTrigger>
                  <TabsTrigger value="news" className="data-[state=active]:bg-[var(--church-primary)] data-[state=active]:text-white">
                    News & Blog
                  </TabsTrigger>
                </TabsList>

                {/* Upcoming Events */}
                <TabsContent value="upcoming">
                  <div className="space-y-6">
                    {/* Featured Event */}
                    {displayEvents.filter(e => e.is_featured).map((event) => (
                      <Card key={event.id} className="bg-gradient-to-br from-[var(--church-primary)] to-[var(--church-primary-deep)] text-white border-none shadow-xl overflow-hidden">
                        <CardContent className="p-8">
                          <span className="inline-block px-3 py-1 bg-[var(--church-gold)] text-[var(--church-dark-text)] rounded-full text-sm font-semibold mb-4">
                            Featured Event
                          </span>
                          <h3 className="text-2xl lg:text-3xl font-bold mb-4">{event.title}</h3>
                          <p className="text-white/90 mb-6">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[var(--church-gold)]" />
                              {formatDate(event)}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[var(--church-gold)]" />
                              {formatTime(event)}
                            </span>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[var(--church-gold)]" />
                              {event.location}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Other Events */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {displayEvents.filter(e => !e.is_featured).map((event) => (
                        <Card key={event.id} className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow">
                          <CardContent className="p-6">
                            <h3 className="font-bold text-lg text-foreground mb-2">{event.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4 text-[var(--church-primary)]" />
                                {formatDate(event)}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4 text-[var(--church-primary)]" />
                                {formatTime(event)}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4 text-[var(--church-primary)]" />
                                {event.location}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {displayEvents.length === 0 && (
                      <Card className="bg-background">
                        <CardContent className="p-8 text-center">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold text-foreground mb-2">No Upcoming Events</h3>
                          <p className="text-muted-foreground">Check back soon for new events!</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Past Activities */}
                <TabsContent value="past">
                  <div className="grid md:grid-cols-3 gap-6">
                    {displayPastEvents.map((event) => (
                      <Card key={event.id} className="bg-background border-none shadow-lg overflow-hidden">
                        <div className="h-40 bg-[var(--church-soft-gray)] flex items-center justify-center">
                          {event.image_url ? (
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                          )}
                        </div>
                        <CardContent className="p-5">
                          <p className="text-sm text-[var(--church-primary)] font-medium mb-1">{formatSimpleDate(event.date)}</p>
                          <h3 className="font-bold text-foreground mb-2">{event.title}</h3>
                          <p className="text-muted-foreground text-sm">{event.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* News & Blog */}
                <TabsContent value="news">
                  <div className="space-y-6">
                    {displayNews.map((news) => (
                      <Card key={news.id} className="bg-background border-none shadow-lg">
                        <CardContent className="p-6">
                          <p className="text-sm text-[var(--church-primary)] font-medium mb-2">
                            {formatSimpleDate(news.published_at)}
                          </p>
                          <h3 className="font-bold text-xl text-foreground mb-3">{news.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {news.excerpt || news.content}
                          </p>
                          <Button variant="link" className="p-0 h-auto mt-3 text-[var(--church-primary)]">
                            Read More <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}

                    {displayNews.length === 0 && (
                      <Card className="bg-background">
                        <CardContent className="p-8 text-center">
                          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold text-foreground mb-2">No Announcements</h3>
                          <p className="text-muted-foreground">Check back soon for news and updates!</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Subscribe */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <Card className="bg-[var(--church-soft-gray)] border-none">
              <CardContent className="p-8 text-center">
                {isSubscribed ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">You{`'`}re Subscribed!</h3>
                    <p className="text-muted-foreground">
                      You{`'`}ll receive our newsletter with updates on events and news. Thank you!
                    </p>
                  </>
                ) : (
                  <>
                    <Bell className="w-12 h-12 text-[var(--church-primary)] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Stay Updated</h3>
                    <p className="text-muted-foreground mb-6">
                      Subscribe to our newsletter and never miss an event or announcement.
                    </p>
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Label htmlFor="email" className="sr-only">Email</Label>
                        <Input 
                          id="email"
                          type="email" 
                          placeholder="Your email address" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? "Subscribing..." : "Subscribe"}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
