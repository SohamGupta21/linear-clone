import { supabase } from './supabase'
import type { CommandAction, CommandResponse, TaskStatus, TaskPriority } from './types'

export async function executeCommand(action: CommandAction): Promise<CommandResponse> {
  switch (action.type) {
    case 'create_task':
      return createTask(action.title, action.priority, action.assignee_name)
    case 'update_status':
      return updateStatus(action.task_id, action.status)
    case 'update_priority':
      return updatePriority(action.task_id, action.priority)
    case 'assign_task':
      return assignTask(action.task_id, action.assignee_name)
    case 'search_tasks':
      return searchTasks(action.query)
    default:
      return { success: false, action: 'unknown', message: 'Unknown command' }
  }
}

async function createTask(
  title: string,
  priority?: TaskPriority,
  assigneeName?: string
): Promise<CommandResponse> {
  // Get next task ID from counter
  const { data: counter, error: counterError } = await supabase.rpc('increment_task_counter')

  if (counterError) {
    return { success: false, action: 'create_task', message: 'Failed to generate task ID' }
  }

  const taskId = `TASK-${counter}`

  // Resolve assignee if provided
  let assigneeId: string | null = null
  if (assigneeName) {
    const { data: members } = await supabase
      .from('team_members')
      .select('id, name')
      .ilike('name', `%${assigneeName}%`)
      .limit(1)

    assigneeId = members?.[0]?.id ?? null
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      task_id: taskId,
      title,
      status: 'todo' as TaskStatus,
      priority: priority ?? 'none',
      assignee_id: assigneeId,
    })
    .select()
    .single()

  if (error) {
    return { success: false, action: 'create_task', message: error.message }
  }

  return {
    success: true,
    action: 'create_task',
    task,
    message: `Created ${taskId}: ${title}`,
  }
}

async function updateStatus(taskId: string, status: TaskStatus): Promise<CommandResponse> {
  const { data: task, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .select()
    .single()

  if (error) {
    return { success: false, action: 'update_status', message: `Task ${taskId} not found` }
  }

  return {
    success: true,
    action: 'update_status',
    task,
    message: `${taskId} → ${status}`,
  }
}

async function updatePriority(taskId: string, priority: TaskPriority): Promise<CommandResponse> {
  const { data: task, error } = await supabase
    .from('tasks')
    .update({ priority, updated_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .select()
    .single()

  if (error) {
    return { success: false, action: 'update_priority', message: `Task ${taskId} not found` }
  }

  return {
    success: true,
    action: 'update_priority',
    task,
    message: `${taskId} priority → ${priority}`,
  }
}

async function assignTask(taskId: string, assigneeName: string): Promise<CommandResponse> {
  // Find team member by fuzzy name match
  const { data: members } = await supabase
    .from('team_members')
    .select('id, name')
    .ilike('name', `%${assigneeName}%`)
    .limit(1)

  if (!members?.length) {
    return { success: false, action: 'assign_task', message: `No team member matching "${assigneeName}"` }
  }

  const member = members[0]

  const { data: task, error } = await supabase
    .from('tasks')
    .update({ assignee_id: member.id, updated_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .select()
    .single()

  if (error) {
    return { success: false, action: 'assign_task', message: `Task ${taskId} not found` }
  }

  return {
    success: true,
    action: 'assign_task',
    task,
    message: `${taskId} → ${member.name}`,
  }
}

async function searchTasks(query: string): Promise<CommandResponse> {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10)

  if (error) {
    return { success: false, action: 'search_tasks', message: error.message }
  }

  return {
    success: true,
    action: 'search_tasks',
    tasks: tasks ?? [],
    message: `Found ${tasks?.length ?? 0} tasks`,
  }
}
