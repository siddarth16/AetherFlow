'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { NodeWithRelations, Position } from '@/types'
import { getNodeIcon, calculateNodeSize } from '@/lib/utils'
import { Card } from '@/components/ui'
import {
  Zap,
  MessageCircle,
  Plus,
  CheckSquare,
  MoreHorizontal,
  Edit3,
  Trash2
} from 'lucide-react'

interface MindMapNodeProps {
  node: NodeWithRelations
  isSelected: boolean
  isDragging: boolean
  onSelect: (id: string) => void
  onExpand: (id: string) => void
  onChat: (id: string) => void
  onTaskify: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onManualAdd: (id: string) => void
  style?: React.CSSProperties
}

export function MindMapNode({
  node,
  isSelected,
  isDragging,
  onSelect,
  onExpand,
  onChat,
  onTaskify,
  onEdit,
  onDelete,
  onManualAdd,
  style,
}: MindMapNodeProps) {
  const [showActions, setShowActions] = useState(false)
  const metadata = node.metadata as any

  const nodeColor = metadata?.color || '#8B5CF6'
  const nodeSize = metadata?.size || 'medium'
  const isExpanded = metadata?.expanded || false
  const hasTask = node.type === 'task' || !!node.task

  // Calculate dynamic size based on content
  const dynamicSize = calculateNodeSize(node.title, node.description || undefined)

  const sizeClasses: Record<string, string> = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(node.id)
  }

  return (
    <motion.div
      style={style}
      className="absolute cursor-pointer select-none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isDragging ? 1.1 : 1,
        opacity: 1,
        rotate: isDragging ? 2 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{ scale: 1.05 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleClick}
    >
      <Card
        className={`
          mind-map-node
          ${sizeClasses[nodeSize]}
          ${isSelected ? 'selected ring-2 ring-primary ring-opacity-60' : ''}
          ${hasTask ? 'border-l-4 border-l-green-500' : ''}
          transition-all duration-300
        `}
        style={{
          background: `linear-gradient(135deg, ${nodeColor}20, ${nodeColor}10)`,
          borderColor: `${nodeColor}40`,
          width: `${dynamicSize.width}px`,
          height: `${dynamicSize.height}px`,
          minWidth: '200px',
          minHeight: '120px',
        }}
      >
        {/* Node Icon & Status */}
        <div className="absolute -top-2 -left-2 w-8 h-8 claymorphic rounded-full flex items-center justify-center text-lg">
          {getNodeIcon(node.type)}
        </div>

        {/* Expansion Indicator */}
        {isExpanded && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}

        {/* Content */}
        <div className="h-full flex flex-col justify-between p-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <h3 className="font-medium mb-2 break-words">
              {node.title}
            </h3>
            {node.description && (
              <p className="text-xs text-muted-foreground break-words leading-relaxed">
                {node.description}
              </p>
            )}
          </div>

          {/* Task Info */}
          {hasTask && node.task && (
            <div className="flex items-center space-x-1 text-xs">
              <CheckSquare className="w-3 h-3" />
              <span className="capitalize">{node.task.status}</span>
              <span className="text-muted-foreground">•</span>
              <span className="capitalize">{node.task.priority}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: showActions ? 1 : 0,
            scale: showActions ? 1 : 0.8
          }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20"
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onExpand(node.id)
            }}
            className="w-8 h-8 claymorphic rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            title="AI Expand"
          >
            <Zap className="w-4 h-4 text-purple-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onChat(node.id)
            }}
            className="w-8 h-8 claymorphic rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            title="Chat with AI"
          >
            <MessageCircle className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onManualAdd(node.id)
            }}
            className="w-8 h-8 claymorphic rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            title="Add Child Manually"
          >
            <Plus className="w-4 h-4 text-green-600" />
          </button>

          {!hasTask && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTaskify(node.id)
              }}
              className="w-8 h-8 claymorphic rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              title="Convert to Task"
            >
              <CheckSquare className="w-4 h-4 text-orange-600" />
            </button>
          )}

          {/* More Actions */}
          <div className="relative">
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 claymorphic rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              title="More Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  )
}