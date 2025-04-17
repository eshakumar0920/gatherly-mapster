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
        Relationships: [
          {
            foreignKeyName: "event_metadata_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
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
            foreignKeyName: "event_tags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "meetup_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          creator_id: number
          description: string | null
          event_id: number
          event_time: string
          image: string | null
          lat: number | null
          lng: number | null
          location: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          creator_id: number
          description?: string | null
          event_id?: number
          event_time: string
          image?: string | null
          lat?: number | null
          lng?: number | null
          location: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          creator_id?: number
          description?: string | null
          event_id?: number
          event_time?: string
          image?: string | null
          lat?: number | null
          lng?: number | null
          location?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "events_box_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      levels: {
        Row: {
          description: string | null
          level_number: number
          title: string | null
          xp_threshold: number
        }
        Insert: {
          description?: string | null
          level_number: number
          title?: string | null
          xp_threshold: number
        }
        Update: {
          description?: string | null
          level_number?: number
          title?: string | null
          xp_threshold?: number
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
        Relationships: [
          {
            foreignKeyName: "rewards_level_required_fkey"
            columns: ["level_required"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["level_number"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
      user_activities: {
        Row: {
          activity_id: number
          activity_type: string
          description: string | null
          timestamp: string | null
          user_id: number | null
          xp_awarded: number
        }
        Insert: {
          activity_id?: number
          activity_type: string
          description?: string | null
          timestamp?: string | null
          user_id?: number | null
          xp_awarded: number
        }
        Update: {
          activity_id?: number
          activity_type?: string
          description?: string | null
          timestamp?: string | null
          user_id?: number | null
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
      user_rewards: {
        Row: {
          claimed_at: string | null
          reward_id: number
          user_id: number
        }
        Insert: {
          claimed_at?: string | null
          reward_id: number
          user_id: number
        }
        Update: {
          claimed_at?: string | null
          reward_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["reward_id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          current_level: number | null
          current_xp: number | null
          email: string
          name: string
          password_hash: string
          user_id: number
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          email: string
          name: string
          password_hash: string
          user_id?: number
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          email?: string
          name?: string
          password_hash?: string
          user_id?: number
        }
        Relationships: []
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
