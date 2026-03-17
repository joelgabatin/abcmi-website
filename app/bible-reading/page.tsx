'use client'

import { useEffect, useState } from 'react'
import { SiteLayout } from '@/components/layout/site-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Calendar, MapPin, Clock, Share2, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface DailyVerse {
  id: string
  date: string
  verse_text: string
  reference: string
  interpretation: string | null
  created_at: string
}

export default function BibleReadingPage() {
  const [verses, setVerses] = useState<DailyVerse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchVerses()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('daily_verses_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_verses' },
        (payload) => {
          console.log('[v0] Daily verses updated:', payload)
          fetchVerses()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchVerses() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('daily_verses')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Error fetching verses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load daily verses',
        variant: 'destructive'
      })
    } else {
      setVerses(data || [])
    }
    setIsLoading(false)
  }

  const handleShare = (verse: DailyVerse) => {
    const text = `${verse.reference}\n\n"${verse.verse_text}"\n\nFrom our church's daily Bible reading`
    if (navigator.share) {
      navigator.share({
        title: 'Daily Verse',
        text: text
      })
    } else {
      navigator.clipboard.writeText(text)
      toast({
        title: 'Copied',
        description: 'Verse copied to clipboard'
      })
    }
  }

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--church-primary)] to-[var(--church-secondary)] text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Daily Bible Reading</h1>
            </div>
            <p className="text-lg text-white/90">
              Meditate on God's word daily for spiritual growth and transformation
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Tabs defaultValue="verses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="verses">Daily Verses</TabsTrigger>
              <TabsTrigger value="guides">Reading Guide</TabsTrigger>
            </TabsList>

            {/* Verses Tab */}
            <TabsContent value="verses" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading daily verses...</p>
                </div>
              ) : verses.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No daily verses available yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {verses.map((verse) => (
                    <Card key={verse.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="secondary" className="mb-2">
                              {new Date(verse.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Badge>
                            <CardTitle className="text-2xl">{verse.reference}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare(verse)}
                            className="hover:bg-muted"
                          >
                            <Share2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <blockquote className="border-l-4 border-[var(--church-primary)] pl-4 italic text-lg">
                          "{verse.verse_text}"
                        </blockquote>

                        {verse.interpretation && (
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Interpretation & Reflection</h4>
                            <p className="text-muted-foreground">{verse.interpretation}</p>
                          </div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Heart className="w-4 h-4" />
                            Save Verse
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            Read Full Chapter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reading Guide Tab */}
            <TabsContent value="guides" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How to Use Daily Bible Reading</CardTitle>
                  <CardDescription>
                    Get the most out of your spiritual journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="bg-[var(--church-primary)] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Read the Verse</h4>
                        <p className="text-muted-foreground">
                          Start by reading the daily Bible verse carefully and thoughtfully
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-[var(--church-primary)] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Meditate</h4>
                        <p className="text-muted-foreground">
                          Take time to meditate and reflect on what the verse means to you
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-[var(--church-primary)] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Apply</h4>
                        <p className="text-muted-foreground">
                          Consider how you can apply this verse's message to your daily life
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-[var(--church-primary)] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Share</h4>
                        <p className="text-muted-foreground">
                          Share the verse with friends and family to spread God's word
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips for Effective Bible Reading</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--church-primary)] mt-2 flex-shrink-0" />
                    <p>Read in a quiet, distraction-free environment for better focus</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--church-primary)] mt-2 flex-shrink-0" />
                    <p>Keep a journal to write down insights and reflections</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--church-primary)] mt-2 flex-shrink-0" />
                    <p>Pray before and after reading to connect with God</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--church-primary)] mt-2 flex-shrink-0" />
                    <p>Read the same verse multiple times to gain deeper understanding</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  )
}
