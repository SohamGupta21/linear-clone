# Linear Clone - CLAUDE.md

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (database via MCP)
- shadcn/ui (components via MCP)
- Playwright (testing via MCP)

## Database Schema (Supabase)
```sql
tasks: id (uuid), task_id (text, TASK-1), title, description (markdown), status (todo|in_progress|in_review|done), priority (urgent|high|medium|low|none), assignee_id, created_at, updated_at
comments: id, task_id (fk), author, content, created_at
team_members: id, name, avatar_url, email
task_counter: id, counter (int) -- for auto-increment
```

## Features

### 1. Task CRUD
- Auto-increment: TASK-1, TASK-2 via task_counter table
- Fields: title, description (markdown), status, priority, assignee
- Inline editing on cards, full edit on detail page

### 2. Task Detail Page `/task/[task_id]`
- Markdown editor with checkbox support `- [ ]` and formatting
- Sidebar: status, priority, assignee dropdowns
- Comments/activity feed below description

### 3. Team Members
- Predefined list, no auth
- Assignee picker with avatar + name
- Filter tasks by assignee

### 4. Command Bar (CMD+J)
- Natural language parsing:
  - "create task fix login bug" → new task
  - "mark TASK-5 done" → status update
  - "assign TASK-3 to Sarah" → assignee update
  - "set TASK-2 priority high" → priority update
- Fuzzy search existing tasks

### 5. Views Toggle
- **Board**: Kanban columns by status (drag-drop between)
- **List**: Table view, sortable columns
- Persist view preference in localStorage

### 6. Dark/Light Mode
- Default: dark
- Toggle in header, persist in localStorage

### 7. Comments/Activity
- Add comment with author name (dropdown from team)
- Show activity: "Sarah changed status to Done"

## Visual Specs (Match Linear)

### Colors
- Dark bg: `#0D0D0D`, card bg: `#1A1A1A`, border: `#2A2A2A`
- Light bg: `#FFFFFF`, card bg: `#FAFAFA`, border: `#E5E5E5`

### Status Icons
- ○ Todo (gray `#6B6B6B`)
- ◐ In Progress (yellow `#F5A623`)
- ◉ In Review (green `#5CB85C`)
- ● Done (purple `#8B5CF6`)

### Priority Icons
- !!! Urgent (red `#EF4444`)
- !! High (orange `#F97316`)
- ! Medium (yellow `#EAB308`)
- ↓ Low (blue `#3B82F6`)
- — None (gray `#6B6B6B`)

### Task Card Layout
```
┌─────────────────────────────┐
│ TASK-42  Fix login timeout  │
│ !! ○ ───────────── 👤 Jan 5 │
└─────────────────────────────┘
```
ID left, title, priority icon, status icon, assignee avatar, date right

### Typography
- Font: Inter or system-ui
- Task title: 14px medium
- Task ID: 12px mono, muted
- Minimal padding, tight spacing

## File Structure
```
app/
  page.tsx              # Main view (board/list)
  task/[task_id]/page.tsx
  api/tasks/route.ts
  api/comments/route.ts
components/
  command-bar.tsx
  task-card.tsx
  task-detail.tsx
  board-view.tsx
  list-view.tsx
  markdown-editor.tsx
  status-picker.tsx
  priority-picker.tsx
  assignee-picker.tsx
lib/
  supabase.ts
  parse-command.ts      # NL command parsing
  types.ts
```

## Commands
- `npm run dev` - development
- `npx playwright test` - e2e tests

## Notes
- No auth - all users see all tasks
- No Projects/Initiatives - just flat task list
- Optimistic UI updates
- Use shadcn: dialog, dropdown-menu, command, avatar, button, input, textarea
