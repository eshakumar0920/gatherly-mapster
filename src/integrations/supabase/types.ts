export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_metadata: {
        Row: {
          created_at: string | null
          event_id: number | null
          id: number
          meta_key: string
          meta_value: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: number | null
          id?: number
          meta_key: string
          meta_value?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: number | null
          id?: number
          meta_key?: string
          meta_value?: string | null
        }
        Relationships: []
      }
      event_tags: {
        Row: {
          event_id: number
          tag_id: number
        }
        Insert: {
          event_id: number
          tag_id: number
        }
        Update: {
          event_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "meetup_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      events_box: {
        Row: {
          box_data: Json | null
          created_at: string | null
          event_id: number | null
          id: number
        }
        Insert: {
          box_data?: Json | null
          created_at?: string | null
          event_id?: number | null
          id?: number
        }
        Update: {
          box_data?: Json | null
          created_at?: string | null
          event_id?: number | null
          id?: number
        }
        Relationships: []
      }
      rewards: {
        Row: {
          is_claimed: boolean | null
          level_required: number | null
          reward_description: string | null
          reward_id: number
          reward_name: string
        }
        Insert: {
          is_claimed?: boolean | null
          level_required?: number | null
          reward_description?: string | null
          reward_id?: number
          reward_name: string
        }
        Update: {
          is_claimed?: boolean | null
          level_required?: number | null
          reward_description?: string | null
          reward_id?: number
          reward_name?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          event_id: number
          responded_at: string | null
          rsvp_id: number
          status: string | null
          user_id: number
        }
        Insert: {
          event_id: number
          responded_at?: string | null
          rsvp_id?: number
          status?: string | null
          user_id: number
        }
        Update: {
          event_id?: number
          responded_at?: string | null
          rsvp_id?: number
          status?: string | null
          user_id?: number
        }
        Relationships: []
      }
      tags: {
        Row: {
          name: string
          tag_id: number
        }
        Insert: {
          name: string
          tag_id?: number
        }
        Update: {
          name?: string
          tag_id?: number
        }
        Relationships: []
      }
      theme_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: number
          notifications_enabled: boolean | null
          theme: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          notifications_enabled?: boolean | null
          theme?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          notifications_enabled?: boolean | null
          theme?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_theme_fkey"
            columns: ["theme"]
            isOneToOne: false
            referencedRelation: "theme_types"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_exists: {
        Args: { table_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
