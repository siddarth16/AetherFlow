'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { useMapStore } from '@/lib/stores/mapStore'
import { MindMapNode } from './MindMapNode'
import { NodeConnections } from './NodeConnections'
import { Position, NodeWithRelations } from '@/types'
import { throttle } from '@/lib/utils'

interface MindMapCanvasProps {
  onExpandNode: (nodeId: string) => void
  onChatWithNode: (nodeId: string) => void
  onTaskifyNode: (nodeId: string) => void
  onEditNode: (nodeId: string) => void
  onDeleteNode: (nodeId: string) => void
  onAddManualNode: (parentId: string) => void
}

export function MindMapCanvas({
  onExpandNode,
  onChatWithNode,
  onTaskifyNode,
  onEditNode,
  onDeleteNode,
  onAddManualNode,
}: MindMapCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })

  const {
    nodes,
    selectedNodeId,
    zoomLevel,
    panOffset,
    setSelectedNode,
    updateNode,
    setZoom,
    setPanOffset,
  } = useMapStore()

  // Handle zoom with mouse wheel
  const handleWheel = useCallback(
    throttle((e: WheelEvent) => {
      e.preventDefault()
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom(zoomLevel + zoomDelta)
    }, 16),
    [zoomLevel, setZoom]
  )

  // Handle canvas panning
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null)
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }

    if (isDragging && draggedNodeId) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const newPosition = {
          x: (e.clientX - rect.left - panOffset.x) / zoomLevel - dragOffset.x,
          y: (e.clientY - rect.top - panOffset.y) / zoomLevel - dragOffset.y,
        }
        updateNode(draggedNodeId, { position: newPosition })
      }
    }
  }

  const handleCanvasMouseUp = () => {
    setIsPanning(false)
    setIsDragging(false)
    setDraggedNodeId(null)
  }

  // Node dragging handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    setSelectedNode(nodeId)
    setIsDragging(true)
    setDraggedNodeId(nodeId)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const nodePos = node.position as unknown as Position
      setDragOffset({
        x: (e.clientX - rect.left - panOffset.x) / zoomLevel - nodePos.x,
        y: (e.clientY - rect.top - panOffset.y) / zoomLevel - nodePos.y,
      })
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Get node style for positioning
  const getNodeStyle = (node: NodeWithRelations): React.CSSProperties => {
    const position = node.position as unknown as Position
    return {
      transform: `translate(${position.x}px, ${position.y}px)`,
      zIndex: selectedNodeId === node.id ? 10 : 1,
    }
  }

  // Build node hierarchy for connections
  const nodeHierarchy = nodes.reduce((acc, node) => {
    if (!acc[node.id]) acc[node.id] = []
    if (node.parent_id) {
      if (!acc[node.parent_id]) acc[node.parent_id] = []
      acc[node.parent_id].push(node.id)
    }
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 cursor-grab"
      style={{
        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        transformOrigin: '0 0',
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #8B5CF6 1px, transparent 0)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Node Connections */}
      <NodeConnections
        nodes={nodes}
        nodeHierarchy={nodeHierarchy}
        zoomLevel={zoomLevel}
      />

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          style={getNodeStyle(node)}
        >
          <MindMapNode
            node={node}
            isSelected={selectedNodeId === node.id}
            isDragging={isDragging && draggedNodeId === node.id}
            onSelect={setSelectedNode}
            onExpand={onExpandNode}
            onChat={onChatWithNode}
            onTaskify={onTaskifyNode}
            onEdit={onEditNode}
            onDelete={onDeleteNode}
            onManualAdd={onAddManualNode}
          />
        </div>
      ))}

      {/* Canvas Info */}
      <div className="absolute top-4 left-4 claymorphic rounded-2xl p-3 text-sm">
        <div className="space-y-1">
          <div>Zoom: {Math.round(zoomLevel * 100)}%</div>
          <div>Nodes: {nodes.length}</div>
          <div className="text-xs text-muted-foreground">
            Scroll to zoom • Drag to pan
          </div>
        </div>
      </div>
    </div>
  )
}