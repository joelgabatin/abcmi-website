"use client"

import { useState, useEffect } from 'react'
import { Save, Globe, Mail, Phone, MapPin, Facebook, Youtube, Clock, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface HeroSettings {
  title: string
  subtitle: string
  description: string
}

interface AboutSettings {
  mission: string
  vision: string
  values: string
  history: string
}

interface ContactSettings {
  address: string
  phone: string
  email: string
  service_times: string
  facebook_url: string
  youtube_url: string
  instagram_url: string
}

export default function ContentManagementPage() {
  const [hero, setHero] = useState<HeroSettings>({ title: '', subtitle: '', description: '' })
  const [about, setAbout] = useState<AboutSettings>({ mission: '', vision: '', values: '', history: '' })
  const [contact, setContact] = useState<ContactSettings>({ address: '', phone: '', email: '', service_times: '', facebook_url: '', youtube_url: '', instagram_url: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (!error && data) {
      for (const row of data) {
        if (row.key === 'hero') setHero(row.value as HeroSettings)
        if (row.key === 'about') setAbout(row.value as AboutSettings)
        if (row.key === 'contact') setContact(row.value as ContactSettings)
      }
    }
    setIsLoading(false)
  }

  async function saveSection(key: string, value: object) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) {
      toast({ title: 'Error', description: `Failed to save ${key} settings`, variant: 'destructive' })
      return false
    }
    return true
  }

  async function handleSave() {
    setIsSaving(true)
    const results = await Promise.all([
      saveSection('hero', hero),
      saveSection('about', about),
      saveSection('contact', contact),
    ])

    if (results.every(Boolean)) {
      toast({ title: 'Success', description: 'All settings saved successfully' })
    }
    setIsSaving(false)
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your website content and settings
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="bg-background">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Hero Section
                </CardTitle>
                <CardDescription>Customize your homepage hero section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_title">Church Name / Title</Label>
                  <Input
                    id="hero_title"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="Arise and Build For Christ Ministries Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Subtitle</Label>
                  <Input
                    id="hero_subtitle"
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    placeholder="Welcome to Our Church Family"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_description">Description</Label>
                  <Textarea
                    id="hero_description"
                    rows={3}
                    value={hero.description}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                    placeholder="A short description of your church..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Mission, vision, values, and history content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mission">Mission Statement</Label>
                  <Textarea
                    id="mission"
                    rows={3}
                    value={about.mission}
                    onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                    placeholder="To spread the Gospel..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vision">Vision Statement</Label>
                  <Textarea
                    id="vision"
                    rows={3}
                    value={about.vision}
                    onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                    placeholder="To see transformed lives..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="values">Core Values</Label>
                  <Textarea
                    id="values"
                    rows={2}
                    value={about.values}
                    onChange={(e) => setAbout({ ...about, values: e.target.value })}
                    placeholder="Faith, Love, Integrity, Service"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="history">Church History</Label>
                  <Textarea
                    id="history"
                    rows={4}
                    value={about.history}
                    onChange={(e) => setAbout({ ...about, history: e.target.value })}
                    placeholder="Since 1986..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Contact details and service times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        placeholder="info@abcmi.org"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-9"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        placeholder="+63 74 123 4567"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-9"
                      rows={2}
                      value={contact.address}
                      onChange={(e) => setContact({ ...contact, address: e.target.value })}
                      placeholder="Quirino Hill, Baguio City, Philippines"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_times">Service Times</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="service_times"
                      className="pl-9"
                      rows={3}
                      value={contact.service_times}
                      onChange={(e) => setContact({ ...contact, service_times: e.target.value })}
                      placeholder="Sunday Worship: 9:00 AM - 12:00 PM"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social Media Links
                </CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="facebook_url"
                      className="pl-9"
                      value={contact.facebook_url}
                      onChange={(e) => setContact({ ...contact, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube</Label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="youtube_url"
                      className="pl-9"
                      value={contact.youtube_url}
                      onChange={(e) => setContact({ ...contact, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={contact.instagram_url}
                    onChange={(e) => setContact({ ...contact, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  )
}
