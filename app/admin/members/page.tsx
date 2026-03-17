"use client"

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Mail, Phone, Shield, User, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  role: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export default function MembersManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    role: 'member',
    is_active: true,
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchProfiles()

    // Subscribe to real-time updates with debouncing
    let updateTimeout: NodeJS.Timeout
    const debouncedFetch = () => {
      clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        fetchProfiles()
      }, 500)
    }

    const subscription = supabase
      .channel('profiles_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, debouncedFetch)
      .subscribe()

    return () => {
      clearTimeout(updateTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfiles() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load members', variant: 'destructive' })
    } else {
      setProfiles(data || [])
    }
    setIsLoading(false)
  }

  function openEditDialog(profile: Profile) {
    setEditingProfile(profile)
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      role: profile.role,
      is_active: profile.is_active,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!editingProfile) return

    const profileData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone || null,
      address: formData.address || null,
      role: formData.role,
      is_active: formData.is_active,
    }

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', editingProfile.id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update member', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Member updated successfully' })
      setIsDialogOpen(false)
      fetchProfiles()
    }
  }

  async function toggleRole(profile: Profile) {
    const newRole = profile.role === 'admin' ? 'member' : 'admin'
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: `Member is now ${newRole === 'admin' ? 'an admin' : 'a member'}` })
      fetchProfiles()
    }
  }

  async function toggleActive(profile: Profile) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !profile.is_active })
      .eq('id', profile.id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: `Member ${profile.is_active ? 'deactivated' : 'activated'}` })
      fetchProfiles()
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete member', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Member deleted successfully' })
      fetchProfiles()
    }
    setDeleteId(null)
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'
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
          <h1 className="text-3xl font-bold text-foreground">Members Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage church members
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Members ({filteredProfiles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No members found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== 'all' ? 'Try adjusting your filters' : 'Members will appear here when they sign up'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="bg-[var(--church-primary)] text-white">
                                {getInitials(profile.first_name, profile.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {profile.first_name} {profile.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {profile.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {profile.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{profile.email}</span>
                              </div>
                            )}
                            {profile.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {profile.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={profile.role === 'admin' ? 'default' : 'secondary'}
                            className={profile.role === 'admin' ? 'bg-[var(--church-primary)]' : ''}
                          >
                            {profile.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={profile.is_active ? 'outline' : 'secondary'}>
                            {profile.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(profile)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleRole(profile)}>
                                <Shield className="w-4 h-4 mr-2" />
                                {profile.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleActive(profile)}>
                                <User className="w-4 h-4 mr-2" />
                                {profile.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteId(profile.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update member information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this member? This action cannot be undone.
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
