'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { NodeWithRelations, TaskStatus } from '@/types'
import { KanbanTaskCard } from './KanbanTaskCard'
import { useMapStore } from '@/lib/stores/mapStore'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: NodeWithRelations[]
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setSelectedNode } = useMapStore()
  const { setNodeRef, isOver } = useDroppable({ id })

  const handleTaskClick = (taskId: string) => {
    setSelectedNode(taskId)
    // TODO: Navigate to node in mind map view
  }

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'from-gray-500/20 to-gray-600/20'
      case 'in_progress':
        return 'from-blue-500/20 to-blue-600/20'
      case 'done':
        return 'from-green-500/20 to-green-600/20'
      default:
        return 'from-gray-500/20 to-gray-600/20'
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground bg-secondary rounded-full px-2 py-1">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div
          ref={setNodeRef}
          className={`
            h-full rounded-2xl p-4 transition-all duration-200
            bg-gradient-to-br ${getColumnColor(id)}
            ${isOver ? 'ring-2 ring-primary ring-opacity-50 scale-105' : ''}
          `}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 h-full overflow-y-auto">
              {tasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}

              {tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📭</div>
                    <p className="text-sm">Drop tasks here</p>
                  </div>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  )
}