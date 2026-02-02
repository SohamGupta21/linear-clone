'use client'

import { Task, TeamMember, Status, Priority, STATUS_CONFIG, STATUS_ORDER } from '@/lib/types'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ListViewProps {
  tasks: Task[]
  teamMembers: TeamMember[]
  onStatusChange: (taskId: string, status: Status) => void
  onPriorityChange: (taskId: string, priority: Priority) => void
  onAssigneeChange: (taskId: string, assigneeId: string | null) => void
  onTaskClick?: (task: Task) => void
  onCreateTask?: (status: Status) => void
}

export function ListView({
  tasks,
  teamMembers,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onTaskClick,
  onCreateTask,
}: ListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<Status>>(new Set())

  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status)
    return acc
  }, {} as Record<Status, Task[]>)

  const toggleGroup = (status: Status) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col h-full" data-testid="list-view">
      {STATUS_ORDER.map((status) => {
        const config = STATUS_CONFIG[status]
        const columnTasks = tasksByStatus[status]
        const isCollapsed = collapsedGroups.has(status)

        return (
          <div key={status} className="border-b border-border">
            {/* Group header */}
            <button
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-accent/50 transition-colors"
              onClick={() => toggleGroup(status)}
              data-testid={`list-group-${status}`}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <span style={{ color: config.color }}>{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
              <span className="text-xs text-muted-foreground">
                {columnTasks.length}
              </span>
              {onCreateTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 px-2 text-muted-foreground opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateTask(status)
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </button>

            {/* Tasks */}
            {!isCollapsed && (
              <div className="pl-6">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    teamMembers={teamMembers}
                    onStatusChange={onStatusChange}
                    onPriorityChange={onPriorityChange}
                    onAssigneeChange={onAssigneeChange}
                    onClick={() => onTaskClick?.(task)}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
