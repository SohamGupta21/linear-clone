'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import type { CommandResponse } from '@/lib/types'

interface CommandBarProps {
  onCommandExecuted?: () => void
}

export function CommandBar({ onCommandExecuted }: CommandBarProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CommandResponse | null>(null)

  // CMD+J / Ctrl+J keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setInput('')
      setResult(null)
    }
  }, [open])

  const executeCommand = useCallback(async () => {
    if (!input.trim() || loading) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/parse-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: input }),
      })

      const data: CommandResponse = await res.json()
      setResult(data)

      if (data.success) {
        onCommandExecuted?.()
        // Auto-close after success
        setTimeout(() => {
          setOpen(false)
        }, 1500)
      }
    } catch {
      setResult({ success: false, action: 'unknown', message: 'Request failed' })
    } finally {
      setLoading(false)
    }
  }, [input, loading, onCommandExecuted])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Try: create task fix login bug..."
        value={input}
        onValueChange={setInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            executeCommand()
          }
        }}
        data-testid="command-input"
      />
      <CommandList>
        {loading && (
          <CommandEmpty>
            <span className="animate-pulse">Processing...</span>
          </CommandEmpty>
        )}

        {result && (
          <CommandGroup heading={result.success ? 'Success' : 'Error'}>
            <CommandItem
              className={result.success ? 'text-green-500' : 'text-red-500'}
              data-testid="command-result"
            >
              {result.message}
            </CommandItem>
            {result.task && (
              <CommandItem className="text-muted-foreground text-xs">
                {result.task.task_id}: {result.task.title}
              </CommandItem>
            )}
            {result.tasks && result.tasks.length > 0 && (
              <>
                {result.tasks.map((task) => (
                  <CommandItem key={task.id} className="text-muted-foreground text-xs">
                    {task.task_id}: {task.title}
                  </CommandItem>
                ))}
              </>
            )}
          </CommandGroup>
        )}

        {!loading && !result && (
          <CommandGroup heading="Commands">
            <CommandItem disabled>create task [title]</CommandItem>
            <CommandItem disabled>mark TASK-N done/in_progress/todo</CommandItem>
            <CommandItem disabled>set TASK-N priority high/medium/low</CommandItem>
            <CommandItem disabled>assign TASK-N to [name]</CommandItem>
            <CommandItem disabled>search [keyword]</CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
