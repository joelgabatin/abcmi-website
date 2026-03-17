import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

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
}

export async function EventsPreview() {
  const supabase = await createClient()
  
  // Fetch events from database
  const today = new Date().toISOString().split('T')[0]
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(5)
  
  // Get featured event (first featured or first event)
  const featuredEvent = events?.find(e => e.is_featured) || events?.[0]
  const otherEvents = events?.filter(e => e.id !== featuredEvent?.id).slice(0, 4) || []

  // Fallback events if database is empty
  const fallbackEvents = [
    {
      id: '1',
      title: "Sunday Worship Service",
      date: "Every Sunday",
      time: "9:00 AM",
      end_time: "12:00 PM",
      location: "Main Sanctuary, Quirino Hill",
      is_featured: true,
      is_recurring: true,
      recurring_pattern: "weekly",
      type: "worship",
      description: "Join us every Sunday for a time of worship, prayer, and the Word of God."
    },
    {
      id: '2',
      title: "Wednesday Prayer Meeting",
      date: "Every Wednesday",
      time: "7:00 PM",
      end_time: "8:30 PM",
      location: "Prayer Room",
      is_featured: false,
      is_recurring: true,
      recurring_pattern: "weekly",
      type: "prayer",
      description: "A time of corporate prayer for the church and community."
    },
    {
      id: '3',
      title: "Youth Fellowship Night",
      date: "Every Friday",
      time: "6:00 PM",
      end_time: "9:00 PM",
      location: "Fellowship Hall",
      is_featured: false,
      is_recurring: true,
      recurring_pattern: "weekly",
      type: "fellowship",
      description: "Fellowship and fun for young people."
    },
  ]

  const displayEvents = events && events.length > 0 ? events : fallbackEvents
  const displayFeatured = featuredEvent || fallbackEvents[0]
  const displayOthers = events && events.length > 0 ? otherEvents : fallbackEvents.slice(1)

  const formatDate = (event: Event) => {
    if (event.is_recurring && event.recurring_pattern) {
      const patterns: Record<string, string> = {
        'weekly': `Every ${new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}`,
        'monthly': 'Monthly',
        'daily': 'Daily'
      }
      return patterns[event.recurring_pattern] || event.date
    }
    return new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { 
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

  return (
    <section className="py-16 lg:py-24 bg-[var(--church-soft-gray)]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Featured Event */}
            <div>
              <span className="text-[var(--church-primary)] font-semibold text-sm uppercase tracking-wider">Join Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-6">
                Upcoming Events
              </h2>
              
              <Card className="bg-gradient-to-br from-[var(--church-primary)] to-[var(--church-primary-deep)] text-white border-none shadow-xl overflow-hidden">
                <CardContent className="p-8">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                    Featured Event
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                    {displayFeatured.title}
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    {displayFeatured.description || 
                      "Join us for this special event. Experience the presence of God with our church family."}
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[var(--church-gold)]" />
                      <span>{formatDate(displayFeatured as Event)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[var(--church-gold)]" />
                      <span>{formatTime(displayFeatured as Event)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[var(--church-gold)]" />
                      <span>{displayFeatured.location}</span>
                    </div>
                  </div>
                  <Link href="/services">
                    <Button className="bg-[var(--church-gold)] hover:bg-[#d4a934] text-[var(--church-dark-text)] font-semibold">
                      View All Schedules
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Event List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground mb-4">
                {displayEvents.some(e => (e as Event).is_recurring) ? 'Weekly Schedule' : 'Coming Up'}
              </h3>
              {displayOthers.map((event) => (
                <Card key={event.id} className="bg-background border border-border hover:border-[var(--church-primary)] transition-colors">
                  <CardContent className="p-5 flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[var(--church-light-blue)] flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6 text-[var(--church-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1 truncate">{event.title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(event as Event)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Link href="/events" className="block pt-2">
                <Button variant="ghost" className="text-[var(--church-primary)] hover:bg-[var(--church-light-blue)] w-full">
                  View Full Calendar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
