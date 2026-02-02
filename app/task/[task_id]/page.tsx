'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Task, TeamMember, Comment, Status, Priority, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/types'
import { StatusPicker } from '@/components/status-picker'
import { PriorityPicker } from '@/components/priority-picker'
import { AssigneePicker } from '@/components/assignee-picker'
import { MarkdownEditor } from '@/components/markdown-editor'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Users,
  Send,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.task_id as string

  const [task, setTask] = useState<Task | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState<TeamMember | null>(null)

  // Fetch task data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [taskRes, membersRes] = await Promise.all([
        fetch(`/api/tasks/${taskId}`),
        fetch('/api/team-members'),
      ])

      if (!taskRes.ok) {
        setError('Task not found')
        return
      }

      const [taskData, membersData] = await Promise.all([
        taskRes.json(),
        membersRes.json(),
      ])

      setTask(taskData)
      setTeamMembers(membersData)
      setTitleDraft(taskData.title)

      // Set default comment author
      if (membersData.length > 0 && !commentAuthor) {
        setCommentAuthor(membersData[0])
      }

      // Fetch comments
      const commentsRes = await fetch(`/api/comments?task_id=${taskData.id}`)
      const commentsData = await commentsRes.json()
      setComments(commentsData)
    } catch (err) {
      setError('Failed to load task')
    } finally {
      setIsLoading(false)
    }
  }, [taskId, commentAuthor])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Update task handler
  const updateTask = useCallback(
    async (updates: Partial<Task>) => {
      if (!task) return
      // Optimistic update
      setTask((prev) => (prev ? { ...prev, ...updates } : prev))

      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    },
    [task, taskId]
  )

  // Title editing
  const handleTitleSave = () => {
    if (titleDraft.trim() && titleDraft !== task?.title) {
      updateTask({ title: titleDraft.trim() })
    }
    setIsEditingTitle(false)
  }

  // Description update
  const handleDescriptionChange = (description: string) => {
    updateTask({ description })
  }

  // Status, Priority, Assignee changes
  const handleStatusChange = (status: Status) => {
    updateTask({ status })
  }

  const handlePriorityChange = (priority: Priority) => {
    updateTask({ priority })
  }

  const handleAssigneeChange = (assigneeId: string | null) => {
    const assignee = teamMembers.find((m) => m.id === assigneeId) || null
    setTask((prev) =>
      prev ? { ...prev, assignee_id: assigneeId, assignee } : prev
    )
    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee_id: assigneeId }),
    })
  }

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !commentAuthor || !task) return

    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      task_id: task.id,
      author: commentAuthor.name,
      content: newComment,
      created_at: new Date().toISOString(),
    }

    // Optimistic add
    setComments((prev) => [...prev, tempComment])
    setNewComment('')

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: task.id,
        author: commentAuthor.name,
        content: newComment,
      }),
    })

    const savedComment = await res.json()
    setComments((prev) =>
      prev.map((c) => (c.id === tempComment.id ? savedComment : c))
    )
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#6B6B6B]">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B6B6B] mb-4">{error || 'Task not found'}</p>
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to issues
          </Button>
        </div>
      </div>
    )
  }

  const assignee = task.assignee || teamMembers.find((m) => m.id === task.assignee_id)
  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  return (
    <div className="h-screen bg-[#0D0D0D] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-[#2A2A2A] flex items-center px-4 gap-3 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-[#6B6B6B] hover:text-white hover:bg-[#1A1A1A] -ml-2"
          onClick={() => router.push('/')}
          data-testid="back-button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1A1A1A]">
            <div className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">L</span>
            </div>
            <span className="text-xs text-[#8B8B8B]">Linear Clone</span>
          </div>
          <span className="text-[#3A3A3A]">›</span>
          <span className="font-mono text-sm text-[#8B8B8B]" data-testid="task-id">
            {task.task_id}
          </span>
        </div>

        <div className="flex-1" />

        <Button variant="ghost" size="sm" className="text-[#6B6B6B] hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            {/* Title */}
            <div className="mb-6">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave()
                    if (e.key === 'Escape') {
                      setTitleDraft(task.title)
                      setIsEditingTitle(false)
                    }
                  }}
                  className="w-full text-2xl font-semibold bg-transparent border-none outline-none text-white placeholder-[#4A4A4A]"
                  autoFocus
                  data-testid="title-input"
                />
              ) : (
                <h1
                  className="text-2xl font-semibold text-white cursor-text hover:bg-[#1A1A1A] rounded px-2 py-1 -mx-2 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                  data-testid="task-title"
                >
                  {task.title}
                </h1>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <MarkdownEditor
                value={task.description || ''}
                onChange={handleDescriptionChange}
                placeholder="Add a description..."
                className="border border-transparent hover:border-[#2A2A2A] rounded-lg transition-colors"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[#2A2A2A] my-8" />

            {/* Activity Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#6B6B6B]" />
                  Activity
                </h2>
                <span className="text-xs text-[#6B6B6B]">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </span>
              </div>

              {/* Activity timeline */}
              <div className="space-y-4">
                {/* Task created activity */}
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-3 w-3 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <span className="text-[#8B8B8B]">
                      Issue created
                    </span>
                    <span className="text-[#4A4A4A] ml-2">
                      {formatRelativeTime(task.created_at)}
                    </span>
                  </div>
                </div>

                {/* Comments */}
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-3"
                    data-testid={`comment-${comment.id}`}
                  >
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[10px] bg-[#2A2A2A] text-[#8B8B8B]">
                        {comment.author
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {comment.author}
                        </span>
                        <span className="text-xs text-[#4A4A4A]">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-[#B0B0B0] whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              <div className="mt-6 flex gap-3" data-testid="comment-input-area">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="shrink-0">
                      <Avatar className="h-6 w-6 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-shadow">
                        {commentAuthor?.avatar_url ? (
                          <AvatarImage src={commentAuthor.avatar_url} />
                        ) : null}
                        <AvatarFallback className="text-[10px] bg-[#2A2A2A] text-[#8B8B8B]">
                          {commentAuthor?.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {teamMembers.map((member) => (
                      <DropdownMenuItem
                        key={member.id}
                        onClick={() => setCommentAuthor(member)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Avatar className="h-5 w-5">
                          {member.avatar_url ? (
                            <AvatarImage src={member.avatar_url} />
                          ) : null}
                          <AvatarFallback className="text-[10px]">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-1 relative">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment..."
                    className="min-h-[80px] bg-[#1A1A1A] border-[#2A2A2A] text-sm resize-none pr-12 focus:border-purple-500/50 focus:ring-purple-500/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey) {
                        handleAddComment()
                      }
                    }}
                    data-testid="comment-textarea"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 h-7 w-7 p-0 bg-purple-600 hover:bg-purple-500"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || !commentAuthor}
                    data-testid="submit-comment"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-64 border-l border-[#2A2A2A] p-4 overflow-y-auto shrink-0">
          <h3 className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-4">
            Properties
          </h3>

          <div className="space-y-4">
            {/* Status */}
            <div className="group">
              <label className="text-xs text-[#4A4A4A] mb-1.5 block">Status</label>
              <StatusPicker
                value={task.status}
                onChange={handleStatusChange}
                className="w-full justify-start bg-[#1A1A1A] hover:bg-[#252525] rounded-md"
              />
            </div>

            {/* Priority */}
            <div className="group">
              <label className="text-xs text-[#4A4A4A] mb-1.5 block">Priority</label>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] rounded-md transition-colors">
                <PriorityPicker
                  value={task.priority}
                  onChange={handlePriorityChange}
                  className="flex-1"
                />
                <span className="text-sm text-[#8B8B8B]">{priorityConfig.label}</span>
              </div>
            </div>

            {/* Assignee */}
            <div className="group">
              <label className="text-xs text-[#4A4A4A] mb-1.5 block">Assignee</label>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] rounded-md transition-colors">
                <AssigneePicker
                  value={assignee || null}
                  teamMembers={teamMembers}
                  onChange={handleAssigneeChange}
                />
                <span className="text-sm text-[#8B8B8B] flex-1 truncate">
                  {assignee ? assignee.name : 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="pt-4 border-t border-[#2A2A2A]">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Created</span>
                  <span className="text-[#6B6B6B]">
                    {new Date(task.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Updated</span>
                  <span className="text-[#6B6B6B]">
                    {formatRelativeTime(task.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
