'use client'

import { Priority, PRIORITY_CONFIG } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low', 'none']

interface PriorityPickerProps {
  value: Priority
  onChange: (priority: Priority) => void
  className?: string
}

export function PriorityPicker({ value, onChange, className }: PriorityPickerProps) {
  const config = PRIORITY_CONFIG[value]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-1.5 text-sm hover:bg-accent px-2 py-1 rounded transition-colors',
          className
        )}
        data-testid="priority-picker"
      >
        <span style={{ color: config.color }} className="font-mono text-xs">
          {config.icon}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        {PRIORITY_ORDER.map((priority) => {
          const priorityConfig = PRIORITY_CONFIG[priority]
          return (
            <DropdownMenuItem
              key={priority}
              onClick={() => onChange(priority)}
              className="flex items-center gap-2 cursor-pointer"
              data-testid={`priority-option-${priority}`}
            >
              <span style={{ color: priorityConfig.color }} className="font-mono text-xs w-6">
                {priorityConfig.icon}
              </span>
              <span>{priorityConfig.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
