import OpenAI from 'openai'
import type { CommandAction } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You parse natural language commands for a task management app.

Available team members: Sarah Chen, Alex Kim, Jordan Lee, Taylor Swift

Status values: todo, in_progress, in_review, done
Priority values: urgent, high, medium, low, none

Command patterns:
- "create task <title>" → create_task
- "mark TASK-X done/in progress/review/todo" → update_status
- "set TASK-X priority high/urgent/medium/low" → update_priority
- "assign TASK-X to <name>" → assign_task
- "find/search <keyword>" → search_tasks

Status aliases:
- "done", "complete", "finished" → done
- "in progress", "working", "started" → in_progress
- "review", "in review" → in_review
- "todo", "backlog", "open" → todo

Match assignee names fuzzy (Sarah = Sarah Chen).
Extract task IDs in exact format TASK-N.`

const functions: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low', 'none'] },
          assignee_name: { type: 'string', description: 'Team member name to assign' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_status',
      description: 'Change task status (mark done, in progress, etc)',
      parameters: {
        type: 'object',
        properties: {
          task_id: { type: 'string', description: 'Task ID like TASK-5' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'in_review', 'done'] },
        },
        required: ['task_id', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_priority',
      description: 'Change task priority',
      parameters: {
        type: 'object',
        properties: {
          task_id: { type: 'string', description: 'Task ID like TASK-5' },
          priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low', 'none'] },
        },
        required: ['task_id', 'priority'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assign_task',
      description: 'Assign task to a team member',
      parameters: {
        type: 'object',
        properties: {
          task_id: { type: 'string', description: 'Task ID like TASK-5' },
          assignee_name: { type: 'string', description: 'Team member name' },
        },
        required: ['task_id', 'assignee_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_tasks',
      description: 'Search for tasks by keyword',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term' },
        },
        required: ['query'],
      },
    },
  },
]

export async function parseCommand(command: string): Promise<CommandAction | null> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: command },
    ],
    tools: functions,
    tool_choice: 'auto',
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== 'function') return null

  const args = JSON.parse(toolCall.function.arguments)

  return {
    type: toolCall.function.name as CommandAction['type'],
    ...args,
  } as CommandAction
}
