'use client'

import { useState, useEffect } from 'react'
import { Status, Priority, TeamMember } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StatusPicker } from './status-picker'
import { PriorityPicker } from './priority-picker'
import { AssigneePicker } from './assignee-picker'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: TeamMember[]
  onCreateTask: (task: {
    title: string
    description: string
    status: Status
    priority: Priority
    assignee_id: string | null
  }) => Promise<void>
  defaultStatus?: Status
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  teamMembers,
  onCreateTask,
  defaultStatus = 'todo',
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>(defaultStatus)
  const [priority, setPriority] = useState<Priority>('none')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync status when dialog opens with new defaultStatus
  useEffect(() => {
    if (open) {
      setStatus(defaultStatus)
    }
  }, [open, defaultStatus])

  const assignee = teamMembers.find(m => m.id === assigneeId) || null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onCreateTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee_id: assigneeId,
      })
      // Reset form
      setTitle('')
      setDescription('')
      setStatus(defaultStatus)
      setPriority('none')
      setAssigneeId(null)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            data-testid="task-title-input"
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            data-testid="task-description-input"
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <StatusPicker value={status} onChange={setStatus} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Priority:</span>
              <PriorityPicker value={priority} onChange={setPriority} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Assignee:</span>
              <AssigneePicker
                value={assignee}
                teamMembers={teamMembers}
                onChange={setAssigneeId}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              data-testid="create-task-submit"
            >
              {isSubmitting ? 'Creating...' : 'Create task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
