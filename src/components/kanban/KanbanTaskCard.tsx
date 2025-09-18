'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui'
import { NodeWithRelations } from '@/types'
import { getNodeIcon } from '@/lib/utils'
import { Clock, Tag, AlertCircle } from 'lucide-react'

interface KanbanTaskCardProps {
  task: NodeWithRelations
  isDragging?: boolean
  onClick: () => void
}

export function KanbanTaskCard({ task, isDragging = false, onClick }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const metadata = task.metadata as any
  const taskData = task.task

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const isOverdue = date < now

    return {
      text: date.toLocaleDateString(),
      isOverdue,
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        cursor-grab active:cursor-grabbing
        ${isSortableDragging || isDragging ? 'opacity-50' : ''}
      `}
    >
      <Card
        className="claymorphic hover:shadow-clay-hover transition-all duration-200 cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header with icon and priority */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getNodeIcon(task.type)}</span>
              {taskData?.priority && (
                <AlertCircle className={`w-4 h-4 ${getPriorityColor(taskData.priority)}`} />
              )}
            </div>

            {taskData?.deadline && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className={formatDeadline(taskData.deadline).isOverdue ? 'text-red-500' : ''}>
                  {formatDeadline(taskData.deadline).text}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm mb-2 line-clamp-2">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {taskData?.tags && taskData.tags.length > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              <Tag className="w-3 h-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {taskData.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-secondary rounded-full px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
                {taskData.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{taskData.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Priority badge */}
          {taskData?.priority && (
            <div className="flex justify-end">
              <span className={`text-xs font-medium capitalize ${getPriorityColor(taskData.priority)}`}>
                {taskData.priority}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}