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

interface SiteSettings {
  id: string
  church_name: string
  tagline: string
  description: string
  email: string
  phone: string
  address: string
  service_times: string
  facebook_url: string
  youtube_url: string
  instagram_url: string
  twitter_url: string
  hero_title: string
  hero_subtitle: string
  hero_description: string
  about_short: string
  mission_statement: string
  vision_statement: string
  core_values: string
  founding_year: string
  logo_url: string
  hero_image_url: string
}

export default function ContentManagementPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
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
      .select('*')
      .order('updated_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (error) {
      // Silently handle errors
      setSettings(null)
    } else {
      setSettings(data)
    }
    setIsLoading(false)
  }

  async function handleSave() {
    if (!settings) return
    
    setIsSaving(true)
    const { error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', settings.id)
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Settings saved successfully' })
    }
    setIsSaving(false)
  }

  const updateSettings = (field: keyof SiteSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value })
    }
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-background">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Information
                </CardTitle>
                <CardDescription>Basic information about your church</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="church_name">Church Name</Label>
                    <Input
                      id="church_name"
                      value={settings?.church_name || ''}
                      onChange={(e) => updateSettings('church_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={settings?.tagline || ''}
                      onChange={(e) => updateSettings('tagline', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={settings?.description || ''}
                    onChange={(e) => updateSettings('description', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="founding_year">Founding Year</Label>
                    <Input
                      id="founding_year"
                      value={settings?.founding_year || ''}
                      onChange={(e) => updateSettings('founding_year', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={settings?.logo_url || ''}
                      onChange={(e) => updateSettings('logo_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    value={settings?.hero_title || ''}
                    onChange={(e) => updateSettings('hero_title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Input
                    id="hero_subtitle"
                    value={settings?.hero_subtitle || ''}
                    onChange={(e) => updateSettings('hero_subtitle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_description">Hero Description</Label>
                  <Textarea
                    id="hero_description"
                    rows={3}
                    value={settings?.hero_description || ''}
                    onChange={(e) => updateSettings('hero_description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_image_url">Hero Background Image URL</Label>
                  <Input
                    id="hero_image_url"
                    value={settings?.hero_image_url || ''}
                    onChange={(e) => updateSettings('hero_image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Mission, vision, and values content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about_short">Short About (Homepage)</Label>
                  <Textarea
                    id="about_short"
                    rows={3}
                    value={settings?.about_short || ''}
                    onChange={(e) => updateSettings('about_short', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission_statement">Mission Statement</Label>
                  <Textarea
                    id="mission_statement"
                    rows={3}
                    value={settings?.mission_statement || ''}
                    onChange={(e) => updateSettings('mission_statement', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vision_statement">Vision Statement</Label>
                  <Textarea
                    id="vision_statement"
                    rows={3}
                    value={settings?.vision_statement || ''}
                    onChange={(e) => updateSettings('vision_statement', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="core_values">Core Values</Label>
                  <Textarea
                    id="core_values"
                    rows={3}
                    value={settings?.core_values || ''}
                    onChange={(e) => updateSettings('core_values', e.target.value)}
                    placeholder="Faith, Love, Integrity, Service"
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
                        value={settings?.email || ''}
                        onChange={(e) => updateSettings('email', e.target.value)}
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
                        value={settings?.phone || ''}
                        onChange={(e) => updateSettings('phone', e.target.value)}
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
                      value={settings?.address || ''}
                      onChange={(e) => updateSettings('address', e.target.value)}
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
                      value={settings?.service_times || ''}
                      onChange={(e) => updateSettings('service_times', e.target.value)}
                      placeholder="Sunday Worship: 9:00 AM - 12:00 PM&#10;Wednesday Prayer: 7:00 PM"
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
                  <Facebook className="w-5 h-5" />
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
                      value={settings?.facebook_url || ''}
                      onChange={(e) => updateSettings('facebook_url', e.target.value)}
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
                      value={settings?.youtube_url || ''}
                      onChange={(e) => updateSettings('youtube_url', e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={settings?.instagram_url || ''}
                    onChange={(e) => updateSettings('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter/X</Label>
                  <Input
                    id="twitter_url"
                    value={settings?.twitter_url || ''}
                    onChange={(e) => updateSettings('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/..."
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
