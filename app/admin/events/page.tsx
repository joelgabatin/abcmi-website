"use client"

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Calendar, Clock, MapPin, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  end_time: string | null
  location: string
  type: string
  is_recurring: boolean
  recurring_pattern: string | null
  image_url: string | null
  is_featured: boolean
  created_at: string
}

const eventTypes = ['worship', 'study', 'fellowship', 'outreach', 'special', 'meeting']

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    type: 'worship',
    is_recurring: false,
    recurring_pattern: '',
    image_url: '',
    is_featured: false,
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()

    // Subscribe to real-time updates with debouncing
    let updateTimeout: NodeJS.Timeout
    const debouncedFetch = () => {
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        fetchEvents()
      }, 500)
    }

    const subscription = supabase
      .channel('events_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, debouncedFetch)
      .subscribe()

    return () => {
      clearTimeout(updateTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchEvents() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' })
    } else {
      setEvents(data || [])
    }
    setIsLoading(false)
  }

  function openCreateDialog() {
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      end_time: '',
      location: '',
      type: 'worship',
      is_recurring: false,
      recurring_pattern: '',
      image_url: '',
      is_featured: false,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(event: Event) {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      end_time: event.end_time || '',
      location: event.location,
      type: event.type,
      is_recurring: event.is_recurring,
      recurring_pattern: event.recurring_pattern || '',
      image_url: event.image_url || '',
      is_featured: event.is_featured,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
      return
    }

    const eventData = {
      title: formData.title,
      description: formData.description || null,
      date: formData.date,
      time: formData.time,
      end_time: formData.end_time || null,
      location: formData.location,
      type: formData.type,
      is_recurring: formData.is_recurring,
      recurring_pattern: formData.is_recurring ? formData.recurring_pattern : null,
      image_url: formData.image_url || null,
      is_featured: formData.is_featured,
    }

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id)

      if (error) {
        toast({ title: 'Error', description: 'Failed to update event', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Event updated successfully' })
        setIsDialogOpen(false)
        fetchEvents()
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([eventData])

      if (error) {
        toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Event created successfully' })
        setIsDialogOpen(false)
        fetchEvents()
      }
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Event deleted successfully' })
      fetchEvents()
    }
    setDeleteId(null)
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold text-foreground">Events Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage church events
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateDialog}
                className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update the event details below' : 'Fill in the details for the new event'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Sunday Worship Service"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event description..."
                    rows={3}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="time">Start Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Main Sanctuary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_recurring"
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                    />
                    <Label htmlFor="is_recurring">Recurring Event</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                </div>
                {formData.is_recurring && (
                  <div className="grid gap-2">
                    <Label htmlFor="recurring_pattern">Recurrence Pattern</Label>
                    <Select
                      value={formData.recurring_pattern}
                      onValueChange={(value) => setFormData({ ...formData, recurring_pattern: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search' : 'Create your first event to get started'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                        {event.is_featured && (
                          <Badge 
                            variant="default"
                            className="bg-[var(--church-gold)]"
                          >
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {event.type}
                        </Badge>
                        {event.is_recurring && (
                          <Badge variant="outline" className="border-[var(--church-gold)] text-[var(--church-gold)]">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                          {event.end_time && ` - ${event.end_time}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(event)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
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
