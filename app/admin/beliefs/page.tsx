"use client"

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Belief {
  id: string
  item_number: number
  statement: string
  display_order: number
}

interface BeliefForm {
  item_number: number
  statement: string
  display_order: number
}

const emptyForm: BeliefForm = { item_number: 0, statement: '', display_order: 0 }

export default function StatementOfBeliefPage() {
  const [beliefs, setBeliefs] = useState<Belief[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<BeliefForm>(emptyForm)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<BeliefForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchBeliefs()
  }, [])

  async function fetchBeliefs() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('statement_of_belief')
      .select('id, item_number, statement, display_order')
      .order('display_order', { ascending: true })

    if (!error && data) setBeliefs(data)
    setIsLoading(false)
  }

  function startEdit(belief: Belief) {
    setEditingId(belief.id)
    setEditForm({ item_number: belief.item_number, statement: belief.statement, display_order: belief.display_order })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  async function saveEdit(id: string) {
    if (!editForm.statement.trim()) {
      toast({ title: 'Error', description: 'Statement is required', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    const { error } = await supabase
      .from('statement_of_belief')
      .update({
        item_number: editForm.item_number,
        statement: editForm.statement.trim(),
        display_order: editForm.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to update belief', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Belief updated' })
      setEditingId(null)
      fetchBeliefs()
    }
    setIsSaving(false)
  }

  async function deleteBelief(id: string) {
    const { error } = await supabase.from('statement_of_belief').delete().eq('id', id)
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete belief', variant: 'destructive' })
    } else {
      toast({ title: 'Deleted', description: 'Belief removed' })
      setBeliefs((prev) => prev.filter((b) => b.id !== id))
    }
  }

  async function addBelief() {
    if (!addForm.statement.trim()) {
      toast({ title: 'Error', description: 'Statement is required', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    const nextOrder = beliefs.length > 0 ? Math.max(...beliefs.map((b) => b.display_order)) + 1 : 1
    const nextNumber = beliefs.length > 0 ? Math.max(...beliefs.map((b) => b.item_number)) + 1 : 1
    const { error } = await supabase.from('statement_of_belief').insert({
      item_number: addForm.item_number || nextNumber,
      statement: addForm.statement.trim(),
      display_order: addForm.display_order || nextOrder,
    })

    if (error) {
      toast({ title: 'Error', description: 'Failed to add belief', variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Belief added' })
      setAddForm(emptyForm)
      setShowAddForm(false)
      fetchBeliefs()
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
            <h1 className="text-3xl font-bold text-foreground">Statement of Belief</h1>
            <p className="text-muted-foreground mt-1">
              Manage the church&apos;s fundamental beliefs — {beliefs.length} items
            </p>
          </div>
          <Button
            onClick={() => { setShowAddForm(true); setAddForm(emptyForm) }}
            className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Belief
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-6 border-2 border-[var(--church-primary)]/30">
            <CardHeader>
              <CardTitle className="text-lg">New Belief Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Item Number</Label>
                  <Input
                    type="number"
                    value={addForm.item_number || ''}
                    onChange={(e) => setAddForm({ ...addForm, item_number: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 15 (auto if blank)"
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
                <Label>Statement</Label>
                <Textarea
                  rows={2}
                  value={addForm.statement}
                  onChange={(e) => setAddForm({ ...addForm, statement: e.target.value })}
                  placeholder="We believe in..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addBelief}
                  disabled={isSaving}
                  className="bg-[var(--church-primary)] hover:bg-[var(--church-primary-deep)] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Belief
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Beliefs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Fundamental Beliefs
            </CardTitle>
            <CardDescription>
              These are displayed as numbered items on the About page under &quot;Statement of Fundamentals of Truth and Faith&quot;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {beliefs.map((belief) => (
              <div key={belief.id} className="border rounded-lg p-4 bg-background">
                {editingId === belief.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Item Number</Label>
                        <Input
                          type="number"
                          value={editForm.item_number}
                          onChange={(e) => setEditForm({ ...editForm, item_number: parseInt(e.target.value) || 0 })}
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
                      <Label>Statement</Label>
                      <Textarea
                        rows={2}
                        value={editForm.statement}
                        onChange={(e) => setEditForm({ ...editForm, statement: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(belief.id)}
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
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--church-primary)] text-white text-sm font-bold rounded-full">
                        {belief.item_number}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed pt-1">{belief.statement}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(belief)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBelief(belief.id)}
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
