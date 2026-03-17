"use client"

import { useState, useEffect } from 'react'
import { DollarSign, Search, TrendingUp, Calendar, User, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Donation {
  id: string
  user_id: string | null
  donor_name: string
  email: string | null
  amount: number
  currency: string
  type: string
  payment_method: string | null
  transaction_id: string | null
  notes: string | null
  is_anonymous: boolean
  created_at: string
  profiles?: {
    full_name: string
  }
}

export default function DonationsManagementPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchDonations()

    // Subscribe to real-time updates with debouncing
    let updateTimeout: NodeJS.Timeout
    const debouncedFetch = () => {
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        fetchDonations()
      }, 500)
    }

    const subscription = supabase
      .channel('donations_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, debouncedFetch)
      .subscribe()

    return () => {
      clearTimeout(updateTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchDonations() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load donations', variant: 'destructive' })
    } else {
      setDonations(data || [])
    }
    setIsLoading(false)
  }

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || donation.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  const thisMonthDonations = donations.filter(d => {
    const donationDate = new Date(d.created_at)
    const now = new Date()
    return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0)

  const stats = {
    totalAmount,
    thisMonth: thisMonthTotal,
    donationsCount: donations.length,
    averageDonation: donations.length > 0 ? totalAmount / donations.length : 0,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  const donationTypes = [...new Set(donations.map(d => d.type).filter(Boolean))]

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
          <h1 className="text-3xl font-bold text-foreground">Donations</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage church donations
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--church-gold)]/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[var(--church-gold)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-sm text-muted-foreground">Total Received</p>
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
                  <p className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.donationsCount}</p>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--church-gold)]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--church-gold)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.averageDonation)}</p>
                  <p className="text-sm text-muted-foreground">Average</p>
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
                  placeholder="Search by donor name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {donationTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Donations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Records ({filteredDonations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDonations.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No donations found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' ? 'Try adjusting your filters' : 'Donations will appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {donation.is_anonymous ? 'Anonymous' : (donation.donor_name || donation.profiles?.full_name || 'Unknown')}
                            </p>
                            {!donation.is_anonymous && donation.email && (
                              <p className="text-sm text-muted-foreground">
                                {donation.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[var(--church-gold)]">
                            {formatCurrency(donation.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {donation.type || 'general'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {donation.payment_method || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(donation.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {donation.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  )
}
