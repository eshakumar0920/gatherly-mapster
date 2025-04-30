
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
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          avatar_url: string | null
          tags: string[] | null
          points: number | null
          level: number | null
          selected_sticker: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email?: string | null
          avatar_url?: string | null
          tags?: string[] | null
          points?: number | null
          level?: number | null
          selected_sticker?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          avatar_url?: string | null
          tags?: string[] | null
          points?: number | null
          level?: number | null
          selected_sticker?: number | null
          created_at?: string
          updated_at?: string
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
