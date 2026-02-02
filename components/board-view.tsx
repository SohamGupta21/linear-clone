'use client'

import { Task, TeamMember, Status, Priority, STATUS_CONFIG, STATUS_ORDER } from '@/lib/types'
import { TaskCard } from './task-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface BoardViewProps {
  tasks: Task[]
  teamMembers: TeamMember[]
  onStatusChange: (taskId: string, status: Status) => void
  onPriorityChange: (taskId: string, priority: Priority) => void
  onAssigneeChange: (taskId: string, assigneeId: string | null) => void
  onTaskClick?: (task: Task) => void
  onCreateTask?: (status: Status) => void
}

export function BoardView({
  tasks,
  teamMembers,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onTaskClick,
  onCreateTask,
}: BoardViewProps) {
  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status)
    return acc
  }, {} as Record<Status, Task[]>)

  return (
    <div className="flex gap-4 h-full p-4 overflow-x-auto" data-testid="board-view">
      {STATUS_ORDER.map((status) => {
        const config = STATUS_CONFIG[status]
        const columnTasks = tasksByStatus[status]

        return (
          <div
            key={status}
            className="flex flex-col min-w-[300px] w-[300px] shrink-0"
            data-testid={`board-column-${status}`}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <span style={{ color: config.color }}>{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    teamMembers={teamMembers}
                    onStatusChange={onStatusChange}
                    onPriorityChange={onPriorityChange}
                    onAssigneeChange={onAssigneeChange}
                    onClick={() => onTaskClick?.(task)}
                    className="bg-card rounded border border-border"
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Add task button */}
            {onCreateTask && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 justify-start text-muted-foreground"
                onClick={() => onCreateTask(status)}
                data-testid={`add-task-${status}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add task
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
