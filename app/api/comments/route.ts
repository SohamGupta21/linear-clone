import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/comments?task_id=uuid - Get comments for a task
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('task_id')

  if (!taskId) {
    return NextResponse.json({ error: 'task_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/comments - Add a comment
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { task_id, author, content } = body

  if (!task_id || !author || !content) {
    return NextResponse.json(
      { error: 'task_id, author, and content are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ task_id, author, content })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/comments?id=uuid - Delete a comment
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
  }

  const { error } = await supabase.from('comments').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
