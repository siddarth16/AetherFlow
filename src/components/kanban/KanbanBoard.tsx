'use client'

import { useMapStore } from '@/lib/stores/mapStore'
import { TaskStatus, NodeWithRelations } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanTaskCard } from './KanbanTaskCard'

const COLUMN_CONFIG = [
  { id: 'todo', title: 'To Do', status: 'todo' as TaskStatus },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' as TaskStatus },
  { id: 'done', title: 'Done', status: 'done' as TaskStatus },
]

export function KanbanBoard() {
  const { nodes, updateNode } = useMapStore()
  const [activeTask, setActiveTask] = useState<NodeWithRelations | null>(null)

  // Get all task nodes
  const taskNodes = nodes.filter(node => node.type === 'task' || node.task)

  // Group tasks by status
  const tasksByStatus = COLUMN_CONFIG.reduce((acc, column) => {
    acc[column.status] = taskNodes.filter(node => {
      const status = node.task?.status || 'todo'
      return status === column.status
    })
    return acc
  }, {} as Record<TaskStatus, NodeWithRelations[]>)

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = taskNodes.find(node => node.id === taskId)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Update task status
    const task = taskNodes.find(node => node.id === taskId)
    if (task && task.task) {
      updateNode(taskId, {
        task: {
          ...task.task,
          status: newStatus,
          updated_at: new Date().toISOString()
        }
      })
    }
  }

  if (taskNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
            <p className="text-muted-foreground">
              Convert some nodes to tasks in the mind map to see them here.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full p-6">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6 h-full">
          {COLUMN_CONFIG.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.status}
              title={column.title}
              tasks={tasksByStatus[column.status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="transform rotate-5">
              <KanbanTaskCard
                task={activeTask}
                isDragging={true}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}