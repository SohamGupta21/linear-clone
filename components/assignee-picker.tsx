'use client'

import { TeamMember } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AssigneePickerProps {
  value: TeamMember | null
  teamMembers: TeamMember[]
  onChange: (assigneeId: string | null) => void
  className?: string
}

export function AssigneePicker({ value, teamMembers, onChange, className }: AssigneePickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-1.5 hover:bg-accent px-2 py-1 rounded transition-colors',
          className
        )}
        data-testid="assignee-picker"
      >
        {value ? (
          <Avatar className="h-5 w-5">
            <AvatarImage src={value.avatar_url || undefined} alt={value.name} />
            <AvatarFallback className="text-[10px]">
              {value.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">+</span>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className="flex items-center gap-2 cursor-pointer"
          data-testid="assignee-option-none"
        >
          <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/50" />
          <span className="text-muted-foreground">Unassigned</span>
        </DropdownMenuItem>
        {teamMembers.map((member) => (
          <DropdownMenuItem
            key={member.id}
            onClick={() => onChange(member.id)}
            className="flex items-center gap-2 cursor-pointer"
            data-testid={`assignee-option-${member.name.toLowerCase().replace(' ', '-')}`}
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
              <AvatarFallback className="text-[10px]">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span>{member.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
