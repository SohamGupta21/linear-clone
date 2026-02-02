import { NextRequest, NextResponse } from 'next/server'
import { parseCommand } from '@/lib/openai'
import { executeCommand } from '@/lib/execute-command'
import type { CommandResponse } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<CommandResponse>> {
  try {
    const body = await request.json()
    const { command } = body

    if (!command?.trim()) {
      return NextResponse.json(
        { success: false, action: 'unknown', message: 'Command is required' },
        { status: 400 }
      )
    }

    // Parse natural language command with OpenAI
    const parsedAction = await parseCommand(command)

    if (!parsedAction) {
      return NextResponse.json(
        { success: false, action: 'unknown', message: 'Could not understand command' },
        { status: 400 }
      )
    }

    // Execute the parsed command against Supabase
    const result = await executeCommand(parsedAction)

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    console.error('Command error:', error)
    return NextResponse.json(
      { success: false, action: 'unknown', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
