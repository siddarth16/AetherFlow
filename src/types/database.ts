export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      maps: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          is_public: boolean
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          is_public?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          is_public?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      nodes: {
        Row: {
          id: string
          map_id: string
          parent_id: string | null
          type: 'idea' | 'task' | 'note'
          title: string
          description: string | null
          metadata: Json
          position: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          map_id: string
          parent_id?: string | null
          type: 'idea' | 'task' | 'note'
          title: string
          description?: string | null
          metadata?: Json
          position?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          map_id?: string
          parent_id?: string | null
          type?: 'idea' | 'task' | 'note'
          title?: string
          description?: string | null
          metadata?: Json
          position?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          node_id: string
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          tags: string[]
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          node_id: string
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          tags?: string[]
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          node_id?: string
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          tags?: string[]
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      snapshots: {
        Row: {
          id: string
          map_id: string
          title: string
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          map_id: string
          title: string
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          map_id?: string
          title?: string
          data?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}