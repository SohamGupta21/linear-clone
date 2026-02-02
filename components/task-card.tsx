'use client'

import { Task, TeamMember, Status, Priority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/types'
import { StatusPicker } from './status-picker'
import { PriorityPicker } from './priority-picker'
import { AssigneePicker } from './assignee-picker'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  teamMembers: TeamMember[]
  onStatusChange: (taskId: string, status: Status) => void
  onPriorityChange: (taskId: string, priority: Priority) => void
  onAssigneeChange: (taskId: string, assigneeId: string | null) => void
  onClick?: () => void
  className?: string
}

export function TaskCard({
  task,
  teamMembers,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onClick,
  className,
}: TaskCardProps) {
  const assignee = task.assignee || teamMembers.find(m => m.id === task.assignee_id)
  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const createdDate = new Date(task.created_at)
  const dateStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className={cn(
        'task-card group px-3 py-2 cursor-pointer border-b border-border/50 hover:bg-accent/30',
        className
      )}
      onClick={onClick}
      data-testid={`task-card-${task.task_id}`}
    >
      <div className="flex items-center gap-3">
        {/* Priority */}
        <div onClick={(e) => e.stopPropagation()}>
          <PriorityPicker
            value={task.priority}
            onChange={(p) => onPriorityChange(task.id, p)}
          />
        </div>

        {/* Task ID */}
        <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
          {task.task_id}
        </span>

        {/* Status */}
        <div onClick={(e) => e.stopPropagation()}>
          <span style={{ color: statusConfig.color }} className="text-sm">
            {statusConfig.icon}
          </span>
        </div>

        {/* Title */}
        <span className="flex-1 text-sm truncate">{task.title}</span>

        {/* Assignee */}
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <AssigneePicker
            value={assignee || null}
            teamMembers={teamMembers}
            onChange={(id) => onAssigneeChange(task.id, id)}
          />
        </div>

        {/* Date */}
        <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
          {dateStr}
        </span>
      </div>
    </div>
  )
}
