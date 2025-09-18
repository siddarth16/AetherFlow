import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Map,
  NodeWithRelations,
  ViewMode,
  Position,
  ChatMessage,
  NodeType,
  TaskStatus,
  TaskPriority
} from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface MapState {
  // Current map and nodes
  currentMap: Map | null
  nodes: NodeWithRelations[]
  selectedNodeId: string | null

  // View state
  viewMode: ViewMode
  zoomLevel: number
  panOffset: Position

  // UI state
  isLoading: boolean
  isChatOpen: boolean
  chatNodeId: string | null

  // Actions
  setCurrentMap: (map: Map) => void
  setNodes: (nodes: NodeWithRelations[]) => void
  addNode: (node: Omit<NodeWithRelations, 'id' | 'created_at' | 'updated_at'>) => void
  updateNode: (id: string, updates: Partial<NodeWithRelations>) => void
  deleteNode: (id: string) => void

  setSelectedNode: (id: string | null) => void
  setViewMode: (mode: ViewMode) => void
  setZoom: (level: number) => void
  setPanOffset: (offset: Position) => void

  // Node operations
  expandNode: (id: string, childNodes: Omit<NodeWithRelations, 'id' | 'created_at' | 'updated_at'>[]) => void
  taskifyNode: (id: string, taskData?: { status?: TaskStatus; priority?: TaskPriority; tags?: string[]; deadline?: string }) => void

  // Chat operations
  openChat: (nodeId: string) => void
  closeChat: () => void
  addChatMessage: (nodeId: string, message: ChatMessage) => void

  // Local storage helpers
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void

  // Reset state
  reset: () => void
}

const initialState = {
  currentMap: null,
  nodes: [],
  selectedNodeId: null,
  viewMode: 'map' as ViewMode,
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
  isLoading: false,
  isChatOpen: false,
  chatNodeId: null,
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentMap: (map) => set({ currentMap: map }),

      setNodes: (nodes) => set({ nodes }),

      addNode: (nodeData) => {
        const newNode: NodeWithRelations = {
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          children: [],
          ...nodeData,
        }

        set((state) => ({
          nodes: [...state.nodes, newNode]
        }))
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === id
              ? { ...node, ...updates, updated_at: new Date().toISOString() }
              : node
          )
        }))
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter(node => node.id !== id && node.parent_id !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
        }))
      },

      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setZoom: (level) => set({ zoomLevel: Math.max(0.1, Math.min(3, level)) }),
      setPanOffset: (offset) => set({ panOffset: offset }),

      expandNode: (id, childNodes) => {
        const parentNode = get().nodes.find(n => n.id === id)
        if (!parentNode) return

        const parentPosition = parentNode.position as unknown as Position
        const newNodes = childNodes.map((nodeData, index) => ({
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          children: [],
          ...nodeData,
          parent_id: id,
          map_id: parentNode.map_id,
          position: {
            x: parentPosition.x + (index - childNodes.length / 2) * 200,
            y: parentPosition.y + 150
          },
        }))

        set((state) => ({
          nodes: [...state.nodes, ...newNodes]
        }))

        // Update parent metadata to mark as expanded
        get().updateNode(id, {
          metadata: {
            ...(parentNode.metadata as any),
            expanded: true
          }
        })
      },

      taskifyNode: (id, taskData = {}) => {
        const node = get().nodes.find(n => n.id === id)
        if (!node) return

        const task = {
          id: uuidv4(),
          node_id: id,
          status: 'todo' as TaskStatus,
          priority: 'medium' as TaskPriority,
          tags: [],
          deadline: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...taskData,
        }

        get().updateNode(id, {
          type: 'task',
          task
        })
      },

      openChat: (nodeId) => set({ isChatOpen: true, chatNodeId: nodeId }),
      closeChat: () => set({ isChatOpen: false, chatNodeId: null }),

      addChatMessage: (nodeId, message) => {
        const node = get().nodes.find(n => n.id === nodeId)
        if (!node) return

        const metadata = node.metadata as any
        const chatHistory = metadata.chatHistory || []

        get().updateNode(nodeId, {
          metadata: {
            ...metadata,
            chatHistory: [...chatHistory, message]
          }
        })
      },

      saveToLocalStorage: () => {
        const state = get()
        const dataToSave = {
          currentMap: state.currentMap,
          nodes: state.nodes,
          viewMode: state.viewMode,
          zoomLevel: state.zoomLevel,
          panOffset: state.panOffset,
        }
        localStorage.setItem('aetherflow-map-data', JSON.stringify(dataToSave))
      },

      loadFromLocalStorage: () => {
        try {
          const saved = localStorage.getItem('aetherflow-map-data')
          if (saved) {
            const data = JSON.parse(saved)
            set({
              currentMap: data.currentMap,
              nodes: data.nodes || [],
              viewMode: data.viewMode || 'map',
              zoomLevel: data.zoomLevel || 1,
              panOffset: data.panOffset || { x: 0, y: 0 },
            })
          }
        } catch (error) {
          console.error('Failed to load from localStorage:', error)
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'aetherflow-map-storage',
      partialize: (state) => ({
        currentMap: state.currentMap,
        nodes: state.nodes,
        viewMode: state.viewMode,
        zoomLevel: state.zoomLevel,
        panOffset: state.panOffset,
      }),
    }
  )
)