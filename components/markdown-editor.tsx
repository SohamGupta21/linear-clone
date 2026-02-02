'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Edit2, Eye, Check, Square, CheckSquare } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Add a description...',
  className,
  readOnly = false,
}: MarkdownEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleEdit = () => {
    setDraft(value)
    setIsEditing(true)
  }

  const handleSave = () => {
    onChange(draft)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(value)
    setIsEditing(false)
  }

  // Toggle checkbox in markdown
  const toggleCheckbox = useCallback(
    (lineIndex: number) => {
      const lines = value.split('\n')
      const line = lines[lineIndex]
      if (line.includes('- [ ]')) {
        lines[lineIndex] = line.replace('- [ ]', '- [x]')
      } else if (line.includes('- [x]')) {
        lines[lineIndex] = line.replace('- [x]', '- [ ]')
      }
      onChange(lines.join('\n'))
    },
    [value, onChange]
  )

  if (isEditing && !readOnly) {
    return (
      <div className={cn('space-y-2', className)}>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] font-mono text-sm resize-y"
          autoFocus
          data-testid="markdown-textarea"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} data-testid="save-description">
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative rounded-md',
        !readOnly && 'cursor-pointer hover:bg-accent/30',
        className
      )}
      onClick={readOnly ? undefined : handleEdit}
      data-testid="markdown-preview"
    >
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            handleEdit()
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
      <div className="p-3 min-h-[80px]">
        {value ? (
          <MarkdownPreview content={value} onToggleCheckbox={toggleCheckbox} />
        ) : (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}
      </div>
    </div>
  )
}

interface MarkdownPreviewProps {
  content: string
  onToggleCheckbox?: (lineIndex: number) => void
}

function MarkdownPreview({ content, onToggleCheckbox }: MarkdownPreviewProps) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1 text-sm" data-testid="markdown-content">
      {lines.map((line, index) => (
        <MarkdownLine
          key={index}
          line={line}
          lineIndex={index}
          onToggleCheckbox={onToggleCheckbox}
        />
      ))}
    </div>
  )
}

interface MarkdownLineProps {
  line: string
  lineIndex: number
  onToggleCheckbox?: (lineIndex: number) => void
}

function MarkdownLine({ line, lineIndex, onToggleCheckbox }: MarkdownLineProps) {
  // Checkbox: - [ ] or - [x]
  const uncheckedMatch = line.match(/^(\s*)- \[ \] (.*)$/)
  const checkedMatch = line.match(/^(\s*)- \[x\] (.*)$/i)

  if (uncheckedMatch) {
    const [, indent, text] = uncheckedMatch
    return (
      <div
        className="flex items-start gap-2 cursor-pointer hover:bg-accent/20 rounded px-1 -mx-1"
        style={{ paddingLeft: `${indent.length * 8}px` }}
        onClick={(e) => {
          e.stopPropagation()
          onToggleCheckbox?.(lineIndex)
        }}
        data-testid={`checkbox-unchecked-${lineIndex}`}
      >
        <Square className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <span>{renderInlineMarkdown(text)}</span>
      </div>
    )
  }

  if (checkedMatch) {
    const [, indent, text] = checkedMatch
    return (
      <div
        className="flex items-start gap-2 cursor-pointer hover:bg-accent/20 rounded px-1 -mx-1"
        style={{ paddingLeft: `${indent.length * 8}px` }}
        onClick={(e) => {
          e.stopPropagation()
          onToggleCheckbox?.(lineIndex)
        }}
        data-testid={`checkbox-checked-${lineIndex}`}
      >
        <CheckSquare className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
        <span className="line-through text-muted-foreground">
          {renderInlineMarkdown(text)}
        </span>
      </div>
    )
  }

  // Regular bullet: - text
  const bulletMatch = line.match(/^(\s*)- (.*)$/)
  if (bulletMatch) {
    const [, indent, text] = bulletMatch
    return (
      <div
        className="flex items-start gap-2"
        style={{ paddingLeft: `${indent.length * 8}px` }}
      >
        <span className="text-muted-foreground">•</span>
        <span>{renderInlineMarkdown(text)}</span>
      </div>
    )
  }

  // Headers
  if (line.startsWith('### ')) {
    return <h3 className="font-semibold text-base mt-3">{line.slice(4)}</h3>
  }
  if (line.startsWith('## ')) {
    return <h2 className="font-semibold text-lg mt-4">{line.slice(3)}</h2>
  }
  if (line.startsWith('# ')) {
    return <h1 className="font-bold text-xl mt-4">{line.slice(2)}</h1>
  }

  // Empty line
  if (!line.trim()) {
    return <div className="h-2" />
  }

  // Regular paragraph
  return <p>{renderInlineMarkdown(line)}</p>
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-accent px-1 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}
