'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMapStore } from '@/lib/stores/mapStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { MindMapCanvas } from '@/components/canvas/MindMapCanvas'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Button, Loading, Modal, Input, Card, CardContent } from '@/components/ui'
import {
  Brain,
  Home,
  Save,
  Download,
  Share2,
  Zap,
  MessageCircle,
  Grid3X3,
  FileText,
  Camera,
  Settings,
  Plus
} from 'lucide-react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { getRandomColor } from '@/lib/utils'

export default function MapPage() {
  const params = useParams()
  const router = useRouter()
  const mapId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isExpanding, setIsExpanding] = useState(false)
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualNodeData, setManualNodeData] = useState({
    parentId: '',
    title: '',
    description: '',
    type: 'idea' as 'idea' | 'task' | 'note'
  })

  const {
    currentMap,
    nodes,
    selectedNodeId,
    viewMode,
    isChatOpen,
    chatNodeId,
    expandNode,
    taskifyNode,
    openChat,
    closeChat,
    addNode,
    updateNode,
    deleteNode,
    setViewMode,
    saveToLocalStorage,
    loadFromLocalStorage,
  } = useMapStore()

  const { user, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
    loadFromLocalStorage()
    setIsLoading(false)
  }, [initialize, loadFromLocalStorage])

  // Save periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage()
    }, 30000) // Save every 30 seconds

    return () => clearInterval(interval)
  }, [saveToLocalStorage])

  const handleExpandNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node || isExpanding) return

    setIsExpanding(true)

    try {
      const response = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeTitle: node.title,
          nodeDescription: node.description,
        }),
      })

      const data = await response.json()

      if (data.success && data.nodes) {
        expandNode(nodeId, data.nodes.map((nodeData: any) => ({
          ...nodeData,
          metadata: {
            color: getRandomColor(),
            size: 'medium',
            expanded: false,
            aiGenerated: true,
          }
        })))
      } else {
        console.error('Failed to expand node:', data.error)
      }
    } catch (error) {
      console.error('Error expanding node:', error)
    } finally {
      setIsExpanding(false)
    }
  }

  const handleChatWithNode = (nodeId: string) => {
    openChat(nodeId)
  }

  const handleTaskifyNode = (nodeId: string) => {
    taskifyNode(nodeId)
  }

  const handleEditNode = (nodeId: string) => {
    // TODO: Implement edit modal
    console.log('Edit node:', nodeId)
  }

  const handleDeleteNode = (nodeId: string) => {
    deleteNode(nodeId)
  }

  const handleAddManualNode = (parentId: string) => {
    setManualNodeData({
      parentId,
      title: '',
      description: '',
      type: 'idea'
    })
    setShowManualAdd(true)
  }

  const handleCreateManualNode = () => {
    if (!manualNodeData.title.trim()) return

    const parentNode = nodes.find(n => n.id === manualNodeData.parentId)
    if (!parentNode) return

    const parentPos = parentNode.position as any
    const childrenCount = nodes.filter(n => n.parent_id === manualNodeData.parentId).length

    addNode({
      map_id: currentMap?.id || mapId,
      parent_id: manualNodeData.parentId,
      type: manualNodeData.type,
      title: manualNodeData.title.trim(),
      description: manualNodeData.description.trim() || null,
      metadata: {
        color: getRandomColor(),
        size: 'medium',
        expanded: false,
        aiGenerated: false,
      },
      position: {
        x: parentPos.x + (childrenCount - 1) * 200,
        y: parentPos.y + 150
      }
    })

    setShowManualAdd(false)
    setManualNodeData({ parentId: '', title: '', description: '', type: 'idea' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading your mind map..." />
      </div>
    )
  }

  if (!currentMap && nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Map not found</h2>
            <p className="text-muted-foreground mb-4">
              This mind map doesn&apos;t exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/')}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="claymorphic mx-4 mt-4 rounded-3xl z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
              >
                <Home className="w-5 h-5" />
              </Button>

              <div>
                <h1 className="font-semibold text-lg">
                  {currentMap?.title || 'Untitled Map'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {nodes.length} nodes • {nodes.filter(n => n.type === 'task').length} tasks
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex claymorphic rounded-2xl p-1">
                {[
                  { mode: 'map', icon: Brain, label: 'Map' },
                  { mode: 'board', icon: Grid3X3, label: 'Board' },
                  { mode: 'notes', icon: FileText, label: 'Notes' },
                ].map(({ mode, icon: Icon, label }) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode as any)}
                    className="relative"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">{label}</span>
                  </Button>
                ))}
              </div>

              <Button variant="ghost" size="icon">
                <Save className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon">
                <Download className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 relative">
        {viewMode === 'map' && (
          <MindMapCanvas
            onExpandNode={handleExpandNode}
            onChatWithNode={handleChatWithNode}
            onTaskifyNode={handleTaskifyNode}
            onEditNode={handleEditNode}
            onDeleteNode={handleDeleteNode}
            onAddManualNode={handleAddManualNode}
          />
        )}

        {viewMode === 'board' && (
          <div className="h-full flex items-center justify-center">
            <Card>
              <CardContent className="p-8 text-center">
                <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Kanban Board</h3>
                <p className="text-muted-foreground">
                  Task board view coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'notes' && (
          <div className="h-full flex items-center justify-center">
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Notes View</h3>
                <p className="text-muted-foreground">
                  Structured notes view coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        nodeId={chatNodeId}
        onClose={closeChat}
      />

      {/* Loading Overlay */}
      {isExpanding && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Card>
            <CardContent className="p-8 text-center">
              <Loading size="lg" text="AI is expanding your idea..." />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Node Creation Modal */}
      <Modal
        isOpen={showManualAdd}
        onClose={() => setShowManualAdd(false)}
        title="Add New Node"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              placeholder="Enter node title..."
              value={manualNodeData.title}
              onChange={(e) => setManualNodeData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <Input
              placeholder="Enter description..."
              value={manualNodeData.description}
              onChange={(e) => setManualNodeData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <div className="flex space-x-2">
              {[
                { value: 'idea', label: '💡 Idea' },
                { value: 'task', label: '✅ Task' },
                { value: 'note', label: '📝 Note' },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={manualNodeData.type === value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setManualNodeData(prev => ({ ...prev, type: value as any }))}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowManualAdd(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateManualNode}
              disabled={!manualNodeData.title.trim()}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Node
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}