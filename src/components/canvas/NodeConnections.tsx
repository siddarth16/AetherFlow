'use client'

import { NodeWithRelations, Position } from '@/types'

interface NodeConnectionsProps {
  nodes: NodeWithRelations[]
  nodeHierarchy: Record<string, string[]>
  zoomLevel: number
}

export function NodeConnections({ nodes, nodeHierarchy, zoomLevel }: NodeConnectionsProps) {
  const getNodeCenter = (node: NodeWithRelations): Position => {
    const position = node.position as unknown as Position
    // Approximate node center based on size
    const metadata = node.metadata as any
    const size = metadata?.size || 'medium'

    const sizes: Record<string, { width: number; height: number }> = {
      small: { width: 128, height: 80 },
      medium: { width: 192, height: 112 },
      large: { width: 256, height: 144 },
    }

    const nodeSize = sizes[size]
    return {
      x: position.x + nodeSize.width / 2,
      y: position.y + nodeSize.height / 2,
    }
  }

  const createPath = (start: Position, end: Position): string => {
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    // Create a curved connection
    const controlPoint1 = { x: midX, y: start.y }
    const controlPoint2 = { x: midX, y: end.y }

    return `M ${start.x} ${start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${end.x} ${end.y}`
  }

  const connections: Array<{ path: string; isActive: boolean }> = []

  // Generate connections for each parent-child relationship
  Object.entries(nodeHierarchy).forEach(([parentId, childIds]) => {
    const parentNode = nodes.find(n => n.id === parentId)
    if (!parentNode || !childIds.length) return

    const parentCenter = getNodeCenter(parentNode)

    childIds.forEach(childId => {
      const childNode = nodes.find(n => n.id === childId)
      if (!childNode) return

      const childCenter = getNodeCenter(childNode)
      const path = createPath(parentCenter, childCenter)

      connections.push({
        path,
        isActive: false, // Could add logic for highlighting active connections
      })
    })
  })

  if (connections.length === 0) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Gradient for connections */}
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.6" />
        </linearGradient>

        {/* Arrow marker */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="url(#connectionGradient)"
            opacity="0.8"
          />
        </marker>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {connections.map((connection, index) => (
        <g key={index}>
          {/* Glow effect */}
          <path
            d={connection.path}
            stroke="url(#connectionGradient)"
            strokeWidth={3 / zoomLevel}
            fill="none"
            opacity="0.3"
            filter="url(#glow)"
          />

          {/* Main connection line */}
          <path
            d={connection.path}
            stroke="url(#connectionGradient)"
            strokeWidth={2 / zoomLevel}
            fill="none"
            opacity="0.8"
            markerEnd="url(#arrowhead)"
            className="transition-opacity duration-300"
          />
        </g>
      ))}
    </svg>
  )
}