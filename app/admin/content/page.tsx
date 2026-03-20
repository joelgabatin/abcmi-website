"use client"

import { useState, useEffect } from 'react'
import { Save, Globe, Mail, Phone, MapPin, Clock, Image as ImageIcon, Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
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
}

interface SocialSettings {
  facebook_url: string
  youtube_url: string
  instagram_url: string
}

interface HistoryEntry {
  id: string
  year: string
  month: string
  event: string
}

const DEFAULT_HISTORY: HistoryEntry[] = [
  { id: '1', year: '1984', month: '', event: 'Beginning of Revival at Quirino Hill Barangay or Village' },
  { id: '2', year: '1986', month: '', event: 'Founded by Rev. Marino S. Coyoy and Elizabeth L. Coyoy. Started as a house church.' },
  { id: '3', year: '1990', month: '', event: 'New location and a wider space of worship was provided' },
  { id: '4', year: '1991', month: '', event: 'A daughter church was started by Ptr. Ernesto Paleyan in Patiacan, Quirino, Ilocos Sur' },
  { id: '5', year: '1992', month: '', event: 'Another wider space was provided to accommodate more people' },
  { id: '6', year: '1994', month: '', event: 'A parcel of land was donated by Col. Hover S. Coyoy which became a permanent place of worship for the believers. Additional members of the Pastoral team were added like Ptr. Julio S. Coyoy, Ptr. Elmo Salingbay, Ptr. Jose Banasan, and Ptr. Efren Carlos.' },
  { id: '7', year: '1995', month: '', event: 'Church planting started at Camp 8, Baguio City' },
  { id: '8', year: '1997', month: '', event: 'Arise and Build For Christ Ministries Inc. became the registered name under the SEC' },
  { id: '9', year: '2000', month: '', event: 'Church Planting at Nangobongan, San Juan, Abra with the leadership of Ptr. Vergie W. and with the help of Ptr. Efren and Ptr. Elmo Salingbay' },
  { id: '10', year: '2004', month: '', event: 'Church Planting at Manabo, Abra through the leadership of Ptr. Elmo Salingbay' },
  { id: '11', year: '2007', month: '', event: 'Ptr. Ysrael L. Coyoy became the resident Pastor of ABCMI Quirino Hill' },
  { id: '12', year: '2009', month: '', event: 'Church planting at Maria Aurora, Aurora by a joint effort of Ptr. Calixto Ngateb and Ptr. Nancy Ngateb, and family together with Ptr. Marvin and Ptr. Mirriam Anno' },
  { id: '13', year: '2012', month: '', event: 'Church Planting at Lower Decoliat, Alfonso Castaneda, Nueva Vizcaya' },
  { id: '14', year: '2014', month: '', event: 'House Church started with Bible study with the Bayanos family started at San Carlos, Baguio City' },
  { id: '15', year: '2015', month: 'March', event: 'House Church started in the month of March at Idogan, San Carlos, Baguio City' },
  { id: '16', year: '2015', month: 'Sept.', event: "House Church started at Kias, Baguio City. A kid's ministry was envisioned by Ptr. Ysrael and this challenge was posted to the owner of the house, Ptr. Julio Coyoy. In August Kids Outreach started and a divine service was held the following month of September." },
  { id: '17', year: '2016', month: '', event: 'Church Planting at Dalic, Bontoc, Mt. Province' },
  { id: '18', year: '2017', month: '', event: 'Church Planting at Ansagan, Tuba, Benguet' },
  { id: '19', year: '2019', month: '', event: 'VBS, Crusade and Church Planting at Abas, Sallapadan, Abra' },
  { id: '20', year: '2023', month: 'Nov', event: 'Adopted a Church Planting at Tuding, Itogon, Benguet' },
  { id: '21', year: '2023', month: 'Nov', event: 'Adopted a Church Planting in Vientiane, Laos' },
  { id: '22', year: '2024', month: 'March', event: 'Church Planting at Palina, Tuba, Benguet' },
]

export default function ContentManagementPage() {
  const [heroId, setHeroId] = useState<string | null>(null)
  const [aboutId, setAboutId] = useState<string | null>(null)
  const [contactId, setContactId] = useState<string | null>(null)

  const [hero, setHero] = useState<HeroSettings>({ title: '', subtitle: '', description: '' })
  const [about, setAbout] = useState<AboutSettings>({ mission: '', vision: '', values: '', history: '' })
<<<<<<< Updated upstream
  const [contact, setContact] = useState<ContactSettings>({ address: '', phone: '', email: '', service_times: '' })
  const [social, setSocial] = useState<SocialSettings>({ facebook_url: '', youtube_url: '', instagram_url: '' })

=======
  const [contact, setContact] = useState<ContactSettings>({
    address: '', phone: '', email: '', service_times: '',
    facebook_url: '', youtube_url: '', instagram_url: ''
  })
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
>>>>>>> Stashed changes
  const [isLoading, setIsLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [isHistorySaving, setIsHistorySaving] = useState(false)

  // History dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [entryForm, setEntryForm] = useState({ year: '', month: '', event: '' })

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setIsLoading(true)

<<<<<<< Updated upstream
    const [heroRes, aboutRes, contactRes] = await Promise.all([
      supabase.from('hero_section').select('*').limit(1).maybeSingle(),
      supabase.from('about_section').select('*').limit(1).maybeSingle(),
      supabase.from('contact_info').select('*').limit(1).maybeSingle(),
    ])

    if (heroRes.data) {
      setHeroId(heroRes.data.id)
      setHero({
        title: heroRes.data.title,
        subtitle: heroRes.data.subtitle,
        description: heroRes.data.description,
      })
    }

    if (aboutRes.data) {
      setAboutId(aboutRes.data.id)
      setAbout({
        mission: aboutRes.data.mission,
        vision: aboutRes.data.vision,
        values: aboutRes.data.values,
        history: aboutRes.data.history,
      })
    }

    if (contactRes.data) {
      setContactId(contactRes.data.id)
      setContact({
        address: contactRes.data.address,
        phone: contactRes.data.phone,
        email: contactRes.data.email,
        service_times: contactRes.data.service_times,
      })

      const { data: socialData } = await supabase
        .from('social_links')
        .select('platform, url')
        .eq('contact_info_id', contactRes.data.id)

      if (socialData) {
        const newSocial: SocialSettings = { facebook_url: '', youtube_url: '', instagram_url: '' }
        for (const link of socialData) {
          if (link.platform === 'facebook') newSocial.facebook_url = link.url
          if (link.platform === 'youtube') newSocial.youtube_url = link.url
          if (link.platform === 'instagram') newSocial.instagram_url = link.url
        }
        setSocial(newSocial)
=======
    if (!error && data) {
      for (const row of data) {
        if (row.key === 'hero') setHero(row.value as HeroSettings)
        if (row.key === 'about') setAbout(row.value as AboutSettings)
        if (row.key === 'contact') setContact(row.value as ContactSettings)
        if (row.key === 'church_history') setHistoryEntries(row.value as HistoryEntry[])
      }
      const hasHistory = data.some(row => row.key === 'church_history')
      if (!hasHistory) {
        setHistoryEntries(DEFAULT_HISTORY)
>>>>>>> Stashed changes
      }
    }

    setIsLoading(false)
  }

  async function saveHero(): Promise<boolean> {
    if (heroId) {
      const { error } = await supabase
        .from('hero_section')
        .update({ ...hero, updated_at: new Date().toISOString() })
        .eq('id', heroId)
      return !error
    } else {
      const { data, error } = await supabase
        .from('hero_section')
        .insert({ ...hero })
        .select('id')
        .single()
      if (!error && data) setHeroId(data.id)
      return !error
    }
  }

  async function saveAbout(): Promise<boolean> {
    if (aboutId) {
      const { error } = await supabase
        .from('about_section')
        .update({ ...about, updated_at: new Date().toISOString() })
        .eq('id', aboutId)
      return !error
    } else {
      const { data, error } = await supabase
        .from('about_section')
        .insert({ ...about })
        .select('id')
        .single()
      if (!error && data) setAboutId(data.id)
      return !error
    }
  }

  async function saveContact(): Promise<boolean> {
    let cId = contactId

    if (cId) {
      const { error } = await supabase
        .from('contact_info')
        .update({ ...contact, updated_at: new Date().toISOString() })
        .eq('id', cId)
      if (error) return false
    } else {
      const { data, error } = await supabase
        .from('contact_info')
        .insert({ ...contact })
        .select('id')
        .single()
      if (error) return false
      if (data) {
        cId = data.id
        setContactId(data.id)
      }
    }

    if (!cId) return false

    // Upsert each social link as its own row using (contact_info_id, platform) uniqueness
    const platforms: { platform: string; url: string }[] = [
      { platform: 'facebook', url: social.facebook_url },
      { platform: 'youtube', url: social.youtube_url },
      { platform: 'instagram', url: social.instagram_url },
    ]

    for (const { platform, url } of platforms) {
      const { error } = await supabase.from('social_links').upsert(
        { contact_info_id: cId, platform, url, updated_at: new Date().toISOString() },
        { onConflict: 'contact_info_id,platform' }
      )
      if (error) return false
    }

    return true
  }

<<<<<<< Updated upstream
  async function handleSave() {
    setIsSaving(true)
    const results = await Promise.all([saveHero(), saveAbout(), saveContact()])

    if (results.every(Boolean)) {
      toast({ title: 'Success', description: 'All settings saved successfully' })
    } else {
      toast({ title: 'Error', description: 'Some settings failed to save', variant: 'destructive' })
=======
  async function handleSaveTab(tab: 'hero' | 'about' | 'contact') {
    setSavingSection(tab)
    const valueMap = { hero, about, contact }
    const success = await saveSection(tab, valueMap[tab])
    if (success) {
      toast({ title: 'Success', description: 'Settings saved successfully' })
>>>>>>> Stashed changes
    }
    setSavingSection(null)
  }

  async function handleSaveSocial() {
    setSavingSection('social')
    const success = await saveSection('contact', contact)
    if (success) {
      toast({ title: 'Success', description: 'Social media links saved successfully' })
    }
    setSavingSection(null)
  }

  async function saveHistory(entries: HistoryEntry[]) {
    setIsHistorySaving(true)
    const success = await saveSection('church_history', entries as unknown as object)
    if (success) {
      toast({ title: 'Success', description: 'Church history updated successfully' })
    }
    setIsHistorySaving(false)
    return success
  }

  function openAddDialog() {
    setEditingEntry(null)
    setEntryForm({ year: '', month: '', event: '' })
    setHistoryDialogOpen(true)
  }

  function openEditDialog(entry: HistoryEntry) {
    setEditingEntry(entry)
    setEntryForm({ year: entry.year, month: entry.month, event: entry.event })
    setHistoryDialogOpen(true)
  }

  async function handleSaveEntry() {
    if (!entryForm.year.trim() || !entryForm.event.trim()) {
      toast({ title: 'Validation Error', description: 'Year and event description are required', variant: 'destructive' })
      return
    }

    let updated: HistoryEntry[]
    if (editingEntry) {
      updated = historyEntries.map(e =>
        e.id === editingEntry.id
          ? { ...e, year: entryForm.year.trim(), month: entryForm.month.trim(), event: entryForm.event.trim() }
          : e
      )
    } else {
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        year: entryForm.year.trim(),
        month: entryForm.month.trim(),
        event: entryForm.event.trim(),
      }
      updated = [...historyEntries, newEntry].sort((a, b) => {
        const yearDiff = parseInt(a.year) - parseInt(b.year)
        if (yearDiff !== 0) return yearDiff
        return (a.month || '').localeCompare(b.month || '')
      })
    }

    setHistoryEntries(updated)
    const success = await saveHistory(updated)
    if (success) setHistoryDialogOpen(false)
  }

  function confirmDelete(id: string) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!deletingId) return
    const updated = historyEntries.filter(e => e.id !== deletingId)
    setHistoryEntries(updated)
    await saveHistory(updated)
    setDeleteDialogOpen(false)
    setDeletingId(null)
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your website content and settings
          </p>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="bg-background">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="history">Church History</TabsTrigger>
          </TabsList>

          {/* Hero Tab */}
          <TabsContent value="hero">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Hero Section
                  </CardTitle>
                  <CardDescription>Customize your homepage hero section</CardDescription>
                </div>
                <Button
                  onClick={() => handleSaveTab('hero')}
                  disabled={savingSection === 'hero'}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white shrink-0"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingSection === 'hero' ? 'Saving...' : 'Save'}
                </Button>
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

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>About Section</CardTitle>
                  <CardDescription>Mission, vision, values, and history content</CardDescription>
                </div>
                <Button
                  onClick={() => handleSaveTab('about')}
                  disabled={savingSection === 'about'}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white shrink-0"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingSection === 'about' ? 'Saving...' : 'Save'}
                </Button>
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
                  <Label htmlFor="history">Church History (Summary)</Label>
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

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Contact details and service times</CardDescription>
                </div>
                <Button
                  onClick={() => handleSaveTab('contact')}
                  disabled={savingSection === 'contact'}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white shrink-0"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingSection === 'contact' ? 'Saving...' : 'Save'}
                </Button>
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

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Media Links
                  </CardTitle>
                  <CardDescription>Connect your social media accounts</CardDescription>
                </div>
                <Button
                  onClick={handleSaveSocial}
                  disabled={savingSection === 'social'}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white shrink-0"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingSection === 'social' ? 'Saving...' : 'Save'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="facebook_url"
                      className="pl-9"
                      value={social.facebook_url}
                      onChange={(e) => setSocial({ ...social, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="youtube_url"
                      className="pl-9"
                      value={social.youtube_url}
                      onChange={(e) => setSocial({ ...social, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={social.instagram_url}
                    onChange={(e) => setSocial({ ...social, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Church History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Church History Timeline
                  </CardTitle>
                  <CardDescription>
                    {historyEntries.length} entries — changes save automatically when you add, edit, or delete
                  </CardDescription>
                </div>
                <Button
                  onClick={openAddDialog}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </CardHeader>
              <CardContent>
                {historyEntries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No history entries yet. Click &quot;Add Entry&quot; to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {historyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors group"
                      >
                        <div className="shrink-0 w-28 text-sm font-semibold text-[var(--church-primary)] pt-0.5">
                          {entry.year}{entry.month ? ` ${entry.month}` : ''}
                        </div>
                        <div className="flex-1 text-sm text-foreground leading-relaxed">
                          {entry.event}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditDialog(entry)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => confirmDelete(entry.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add / Edit History Entry Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit History Entry' : 'Add History Entry'}</DialogTitle>
              <DialogDescription>
                {editingEntry
                  ? 'Update this history entry. Changes will be saved to the database.'
                  : 'Add a new entry to the church history timeline.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry_year">
                    Year <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="entry_year"
                    value={entryForm.year}
                    onChange={(e) => setEntryForm({ ...entryForm, year: e.target.value })}
                    placeholder="e.g. 1984"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry_month">Month (optional)</Label>
                  <Input
                    id="entry_month"
                    value={entryForm.month}
                    onChange={(e) => setEntryForm({ ...entryForm, month: e.target.value })}
                    placeholder="e.g. March, Nov"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry_event">
                  Event Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="entry_event"
                  rows={4}
                  value={entryForm.event}
                  onChange={(e) => setEntryForm({ ...entryForm, event: e.target.value })}
                  placeholder="Describe what happened this year..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEntry}
                disabled={isHistorySaving}
                className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
              >
                {isHistorySaving ? 'Saving...' : editingEntry ? 'Save Changes' : 'Add Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete History Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this history entry? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </DashboardLayout>
  )
}
