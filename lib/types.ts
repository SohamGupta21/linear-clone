export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

// Aliases for command bar compatibility
export type TaskStatus = Status
export type TaskPriority = Priority

export interface TeamMember {
  id: string
  name: string
  avatar_url: string | null
  email: string
}

export interface Task {
  id: string
  task_id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  assignee_id: string | null
  assignee?: TeamMember | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  task_id: string
  author: string
  content: string
  created_at: string
}

export const STATUS_CONFIG: Record<Status, { label: string; icon: string; color: string }> = {
  todo: { label: 'Todo', icon: '○', color: '#6B6B6B' },
  in_progress: { label: 'In Progress', icon: '◐', color: '#F5A623' },
  in_review: { label: 'In Review', icon: '◉', color: '#5CB85C' },
  done: { label: 'Done', icon: '●', color: '#8B5CF6' },
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; icon: string; color: string }> = {
  urgent: { label: 'Urgent', icon: '!!!', color: '#EF4444' },
  high: { label: 'High', icon: '!!', color: '#F97316' },
  medium: { label: 'Medium', icon: '!', color: '#EAB308' },
  low: { label: 'Low', icon: '↓', color: '#3B82F6' },
  none: { label: 'None', icon: '—', color: '#6B6B6B' },
}

export const STATUS_ORDER: Status[] = ['todo', 'in_progress', 'in_review', 'done']

export type CommandAction =
  | { type: 'create_task'; title: string; priority?: Priority; assignee_name?: string }
  | { type: 'update_status'; task_id: string; status: Status }
  | { type: 'update_priority'; task_id: string; priority: Priority }
  | { type: 'assign_task'; task_id: string; assignee_name: string }
  | { type: 'search_tasks'; query: string }

export interface CommandResponse {
  success: boolean
  action: string
  task?: Task
  tasks?: Task[]
  message: string
  error?: string
}
