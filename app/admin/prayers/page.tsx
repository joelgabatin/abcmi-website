"use client"

import { useState, useEffect } from 'react'
import { Heart, Search, CheckCircle, Clock, Eye, MessageSquare, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

interface PrayerRequest {
  id: string
  user_id: string | null
  name: string
  email: string | null
  request: string
  is_anonymous: boolean
  is_public: boolean
  status: string
  admin_notes: string | null
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

export default function PrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()

    // Subscribe to real-time updates with debouncing
    let updateTimeout: NodeJS.Timeout
    const debouncedFetch = () => {
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        fetchRequests()
      }, 500)
    }

    const subscription = supabase
      .channel('prayer_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests' }, debouncedFetch)
      .subscribe()

    return () => {
      clearTimeout(updateTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchRequests() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('prayer_requests')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load prayer requests', variant: 'destructive' })
    } else {
      setRequests(data || [])
    }
    setIsLoading(false)
  }

  function openViewDialog(request: PrayerRequest) {
    setSelectedRequest(request)
    setAdminNotes(request.admin_notes || '')
    setNewStatus(request.status)
  }

  async function handleUpdateRequest() {
    if (!selectedRequest) return

    const { error } = await supabase
      .from('prayer_requests')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
      })
      .eq('id', selectedRequest.id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update prayer request', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Prayer request updated' })
      setSelectedRequest(null)
      fetchRequests()
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('prayer_requests')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Status updated' })
      fetchRequests()
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    praying: requests.filter(r => r.status === 'praying').length,
    answered: requests.filter(r => r.status === 'answered').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'praying':
        return <Badge variant="secondary" className="bg-[var(--church-primary)]/10 text-[var(--church-primary)]"><Heart className="w-3 h-3 mr-1" />Praying</Badge>
      case 'answered':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Answered</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Prayer Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage prayer requests from the community
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--church-primary)]/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[var(--church-primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--church-primary)]/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[var(--church-primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.praying}</p>
                  <p className="text-sm text-muted-foreground">Praying</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.answered}</p>
                  <p className="text-sm text-muted-foreground">Answered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prayer requests..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="praying">Praying</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="grid gap-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No prayer requests found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Prayer requests will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {request.is_anonymous ? 'Anonymous' : request.name}
                        </span>
                        {getStatusBadge(request.status)}
                        {request.is_public && (
                          <Badge variant="outline">Public</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {request.request}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {new Date(request.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!request.is_anonymous && request.email && (
                          <span>{request.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewDialog(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {request.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(request.id, 'praying')}
                          className="text-[var(--church-primary)] border-[var(--church-primary)]"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          Praying
                        </Button>
                      )}
                      {request.status === 'praying' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(request.id, 'answered')}
                          className="text-emerald-600 border-emerald-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Answered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View/Edit Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Prayer Request Details</DialogTitle>
              <DialogDescription>
                View and manage this prayer request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Submitted By</Label>
                    <p className="font-medium">
                      {selectedRequest.is_anonymous ? 'Anonymous' : selectedRequest.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">
                      {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {!selectedRequest.is_anonymous && selectedRequest.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Prayer Request</Label>
                  <div className="mt-1 p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedRequest.request}</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="praying">Praying</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin_notes">Admin Notes (Internal)</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any internal notes about this request..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateRequest}
                className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  )
}
