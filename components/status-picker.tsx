'use client'

import { Status, STATUS_CONFIG, STATUS_ORDER } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface StatusPickerProps {
  value: Status
  onChange: (status: Status) => void
  className?: string
}

export function StatusPicker({ value, onChange, className }: StatusPickerProps) {
  const config = STATUS_CONFIG[value]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-1.5 text-sm hover:bg-accent px-2 py-1 rounded transition-colors',
          className
        )}
        data-testid="status-picker"
      >
        <span style={{ color: config.color }}>{config.icon}</span>
        <span className="text-muted-foreground">{config.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {STATUS_ORDER.map((status) => {
          const statusConfig = STATUS_CONFIG[status]
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => onChange(status)}
              className="flex items-center gap-2 cursor-pointer"
              data-testid={`status-option-${status}`}
            >
              <span style={{ color: statusConfig.color }}>{statusConfig.icon}</span>
              <span>{statusConfig.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
