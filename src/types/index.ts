import { Database } from './database'

export type User = Database['public']['Tables']['users']['Row']
export type Map = Database['public']['Tables']['maps']['Row']
export type Node = Database['public']['Tables']['nodes']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Snapshot = Database['public']['Tables']['snapshots']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertMap = Database['public']['Tables']['maps']['Insert']
export type InsertNode = Database['public']['Tables']['nodes']['Insert']
export type InsertTask = Database['public']['Tables']['tasks']['Insert']
export type InsertSnapshot = Database['public']['Tables']['snapshots']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateMap = Database['public']['Tables']['maps']['Update']
export type UpdateNode = Database['public']['Tables']['nodes']['Update']
export type UpdateTask = Database['public']['Tables']['tasks']['Update']
export type UpdateSnapshot = Database['public']['Tables']['snapshots']['Update']

export interface Position {
  x: number
  y: number
}

export interface NodeMetadata {
  color?: string
  size?: 'small' | 'medium' | 'large'
  icon?: string
  expanded?: boolean
  aiGenerated?: boolean
  chatHistory?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface NodeWithRelations extends Node {
  children?: NodeWithRelations[]
  task?: Task
}

export interface MapWithNodes extends Map {
  nodes: NodeWithRelations[]
}

export type ViewMode = 'map' | 'board' | 'notes' | 'snapshot'

export type NodeType = 'idea' | 'task' | 'note'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface GeminiResponse {
  nodes: {
    title: string
    description: string
    type: NodeType
    category?: string
  }[]
}

export interface ExportFormat {
  type: 'png' | 'markdown' | 'json'
  data: string | Blob
  filename: string
}