import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/tasks/[task_id] - Get single task by task_id (e.g., TASK-1)
export async function GET(
  req: NextRequest,
  { params }: { params: { task_id: string } }
) {
  const { task_id } = params

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:team_members(id, name, avatar_url, email)
    `)
    .eq('task_id', task_id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH /api/tasks/[task_id] - Update task by task_id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { task_id: string } }
) {
  const { task_id } = params
  const updates = await req.json()

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('task_id', task_id)
    .select(`
      *,
      assignee:team_members(id, name, avatar_url, email)
    `)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
