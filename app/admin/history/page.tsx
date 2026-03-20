"use client"

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface HistoryEntry {
  id: string
  year: string
  event: string
  display_order: number
}

interface EntryForm {
  year: string
  event: string
  display_order: number
}

const emptyForm: EntryForm = { year: '', event: '', display_order: 0 }

export default function ChurchHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EntryForm>(emptyForm)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<EntryForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('church_history')
      .select('id, year, event, display_order')
      .order('display_order', { ascending: true })

    if (!error && data) setEntries(data)
    setIsLoading(false)
  }

  function startEdit(entry: HistoryEntry) {
    setEditingId(entry.id)
    setEditForm({ year: entry.year, event: entry.event, display_order: entry.display_order })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  async function saveEdit(id: string) {
    if (!editForm.year.trim() || !editForm.event.trim()) {
      toast({ title: 'Error', description: 'Year and event are required', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    const { error } = await supabase
      .from('church_history')
      .update({ year: editForm.year.trim(), event: editForm.event.trim(), display_order: editForm.display_order, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update entry', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'History entry updated' })
      setEditingId(null)
      fetchEntries()
    }
    setIsSaving(false)
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('church_history').delete().eq('id', id)
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' })
    } else {
      toast({ title: 'Deleted', description: 'History entry removed' })
      setEntries((prev) => prev.filter((e) => e.id !== id))
    }
  }

  async function addEntry() {
    if (!addForm.year.trim() || !addForm.event.trim()) {
      toast({ title: 'Error', description: 'Year and event are required', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    const nextOrder = entries.length > 0 ? Math.max(...entries.map((e) => e.display_order)) + 1 : 1
    const { error } = await supabase.from('church_history').insert({
      year: addForm.year.trim(),
      event: addForm.event.trim(),
      display_order: addForm.display_order || nextOrder,
    })

    if (error) {
      toast({ title: 'Error', description: 'Failed to add entry', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'History entry added' })
      setAddForm(emptyForm)
      setShowAddForm(false)
      fetchEntries()
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
            <h1 className="text-3xl font-bold text-foreground">Church History</h1>
            <p className="text-muted-foreground mt-1">
              Manage the church timeline — {entries.length} entries
            </p>
          </div>
          <Button
            onClick={() => { setShowAddForm(true); setAddForm(emptyForm) }}
            className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-6 border-2 border-[var(--church-primary)]/30">
            <CardHeader>
              <CardTitle className="text-lg">New History Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={addForm.year}
                    onChange={(e) => setAddForm({ ...addForm, year: e.target.value })}
                    placeholder="e.g. 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={addForm.display_order || ''}
                    onChange={(e) => setAddForm({ ...addForm, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="Leave blank for last"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Event Description</Label>
                <Textarea
                  rows={3}
                  value={addForm.event}
                  onChange={(e) => setAddForm({ ...addForm, event: e.target.value })}
                  placeholder="Describe what happened..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addEntry}
                  disabled={isSaving}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline Entries
            </CardTitle>
            <CardDescription>Ordered by display order — shown as timeline on the About page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 bg-background">
                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Year</Label>
                        <Input
                          value={editForm.year}
                          onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={editForm.display_order}
                          onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Event Description</Label>
                      <Textarea
                        rows={3}
                        value={editForm.event}
                        onChange={(e) => setEditForm({ ...editForm, event: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(entry.id)}
                        disabled={isSaving}
                        className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="shrink-0 px-3 py-1 bg-[var(--church-primary)] text-white text-sm font-bold rounded-full">
                        {entry.year}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{entry.event}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEntry(entry.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  )
}
