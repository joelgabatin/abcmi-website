"use client"

import { useState, useEffect } from 'react'
import { MessageSquare, Search, Calendar, Clock, User, CheckCircle, XCircle, Eye, Filter } from 'lucide-react'
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

interface CounselingRequest {
  id: string
  user_id: string | null
  name: string
  email: string | null
  phone: string | null
  preferred_date: string | null
  preferred_time: string | null
  topic: string | null
  message: string | null
  status: string
  admin_notes: string | null
  created_at: string
}

const concernTypes = ['spiritual', 'marriage', 'family', 'personal', 'grief', 'addiction', 'other']

export default function CounselingManagementPage() {
  const [requests, setRequests] = useState<CounselingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<CounselingRequest | null>(null)
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
      .channel('counseling_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'counseling_requests' }, debouncedFetch)
      .subscribe()

    return () => {
      clearTimeout(updateTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchRequests() {
    setIsLoading(true)
    // Fetch counseling requests without joining profiles to avoid ambiguous FK relationship
    const { data, error } = await supabase
      .from('counseling_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      // Silently handle errors to avoid console spam
      setRequests([])
    } else {
      setRequests(data || [])
    }
    setIsLoading(false)
  }

  function openViewDialog(request: CounselingRequest) {
    setSelectedRequest(request)
    setAdminNotes(request.admin_notes || '')
    setNewStatus(request.status)
  }

  async function handleUpdateRequest() {
    if (!selectedRequest) return

    const { error } = await supabase
      .from('counseling_requests')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
      })
      .eq('id', selectedRequest.id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Counseling request updated' })
      setSelectedRequest(null)
      fetchRequests()
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('counseling_requests')
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
      request.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.topic?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    scheduled: requests.filter(r => r.status === 'scheduled').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Pending</Badge>
      case 'scheduled':
        return <Badge variant="secondary" className="bg-[var(--church-primary)]/10 text-[var(--church-primary)]">Scheduled</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Completed</Badge>
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600">Cancelled</Badge>
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
          <h1 className="text-3xl font-bold text-foreground">Counseling Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage counseling appointments and requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--church-primary)]/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[var(--church-primary)]" />
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
                  <Calendar className="w-5 h-5 text-[var(--church-primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.scheduled}</p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
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
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
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
                  placeholder="Search counseling requests..."
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No counseling requests found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Counseling requests will appear here'}
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
                        <span className="font-semibold">{request.name}</span>
                        {getStatusBadge(request.status)}
                        {request.topic && (
                          <Badge variant="outline" className="capitalize">
                            {request.topic}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {request.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {request.email}
                        </span>
                        {request.preferred_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(request.preferred_date).toLocaleDateString()}
                          </span>
                        )}
                        {request.preferred_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {request.preferred_time}
                          </span>
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
                          onClick={() => updateStatus(request.id, 'scheduled')}
                          className="text-[var(--church-primary)] border-[var(--church-primary)]"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                      )}
                      {request.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(request.id, 'completed')}
                          className="text-emerald-600 border-emerald-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
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
              <DialogTitle>Counseling Request Details</DialogTitle>
              <DialogDescription>
                View and manage this counseling request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Topic</Label>
                    <p className="font-medium capitalize">{selectedRequest.topic || 'Not specified'}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedRequest.phone || 'Not provided'}</p>
                  </div>
                </div>
                {(selectedRequest.preferred_date || selectedRequest.preferred_time) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Preferred Date</Label>
                      <p className="font-medium">
                        {selectedRequest.preferred_date 
                          ? new Date(selectedRequest.preferred_date).toLocaleDateString()
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Preferred Time</Label>
                      <p className="font-medium">{selectedRequest.preferred_time || 'Not specified'}</p>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <div className="mt-1 p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedRequest.message}</p>
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin_notes">Admin Notes (Internal)</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any internal notes..."
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
