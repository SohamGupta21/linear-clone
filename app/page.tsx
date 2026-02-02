'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Task, TeamMember, Status, Priority } from '@/lib/types'
import { BoardView } from '@/components/board-view'
import { ListView } from '@/components/list-view'
import { CreateTaskDialog } from '@/components/create-task-dialog'
import { CommandBar } from '@/components/command-bar'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Inbox,
  LayoutGrid,
  List,
  Moon,
  Sun,
  Plus,
  Search,
  Settings,
  Users,
  FolderKanban,
  Layers,
  CircleDot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'board' | 'list'

export default function Home() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo')
  const { theme, toggleTheme } = useTheme()

  const handleTaskClick = (task: Task) => {
    router.push(`/task/${task.task_id}`)
  }

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/team-members'),
      ])
      const [tasksData, membersData] = await Promise.all([
        tasksRes.json(),
        membersRes.json(),
      ])
      setTasks(tasksData)
      setTeamMembers(membersData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Load view preference
    const savedView = localStorage.getItem('viewMode') as ViewMode
    if (savedView) setViewMode(savedView)
  }, [fetchData])

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  const handleCreateTask = async (taskData: {
    title: string
    description: string
    status: Status
    priority: Priority
    assignee_id: string | null
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
    const newTask = await res.json()
    setTasks(prev => [newTask, ...prev])
  }

  const handleStatusChange = async (taskId: string, status: Status) => {
    // Optimistic update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status } : t))
    )
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status }),
    })
  }

  const handlePriorityChange = async (taskId: string, priority: Priority) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, priority } : t))
    )
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, priority }),
    })
  }

  const handleAssigneeChange = async (taskId: string, assigneeId: string | null) => {
    const assignee = teamMembers.find(m => m.id === assigneeId) || null
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, assignee_id: assigneeId, assignee } : t
      )
    )
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, assignee_id: assigneeId }),
    })
  }

  const openCreateDialog = (status: Status = 'todo') => {
    setDefaultStatus(status)
    setShowCreateDialog(true)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border flex flex-col">
        {/* Workspace header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="font-medium text-sm">Linear Clone</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          <SidebarItem icon={<Search className="h-4 w-4" />} label="Search" />
          <SidebarItem icon={<Inbox className="h-4 w-4" />} label="Inbox" />
          <SidebarItem icon={<CircleDot className="h-4 w-4" />} label="My Issues" active />

          <div className="pt-4 pb-2">
            <span className="px-3 text-xs text-muted-foreground font-medium">Workspace</span>
          </div>
          <SidebarItem icon={<FolderKanban className="h-4 w-4" />} label="Projects" />
          <SidebarItem icon={<Layers className="h-4 w-4" />} label="Views" />
          <SidebarItem icon={<Users className="h-4 w-4" />} label="Teams" />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <SidebarItem icon={<Settings className="h-4 w-4" />} label="Settings" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 border-b border-border flex items-center px-4 gap-4">
          <h1 className="font-medium">Issues</h1>

          <div className="flex items-center gap-1 ml-4">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('list')}
              data-testid="view-list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('board')}
              data-testid="view-board"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1" />

          <span className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘J</kbd> for commands
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => openCreateDialog()}
            data-testid="create-task-btn"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Issue
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : viewMode === 'board' ? (
            <BoardView
              tasks={tasks}
              teamMembers={teamMembers}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onAssigneeChange={handleAssigneeChange}
              onTaskClick={handleTaskClick}
              onCreateTask={openCreateDialog}
            />
          ) : (
            <ListView
              tasks={tasks}
              teamMembers={teamMembers}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onAssigneeChange={handleAssigneeChange}
              onTaskClick={handleTaskClick}
              onCreateTask={openCreateDialog}
            />
          )}
        </div>
      </main>

      {/* Create task dialog */}
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        teamMembers={teamMembers}
        onCreateTask={handleCreateTask}
        defaultStatus={defaultStatus}
      />

      {/* Command bar */}
      <CommandBar onCommandExecuted={fetchData} />
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 w-full px-3 py-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
