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
      alembic_version: {
        Row: {
          version_num: string
        }
        Insert: {
          version_num: string
        }
        Update: {
          version_num?: string
        }
        Relationships: []
      }
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
      events: {
        Row: {
          created_at: string
          creator_id: number
          description: string | null
          event_date: string
          id: number
          location: string
          organizer_xp_reward: number | null
          semester: string | null
          title: string
          xp_reward: number | null
        }
        Insert: {
          created_at: string
          creator_id: number
          description?: string | null
          event_date: string
          id?: number
          location: string
          organizer_xp_reward?: number | null
          semester?: string | null
          title: string
          xp_reward?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: number
          description?: string | null
          event_date?: string
          id?: number
          location?: string
          organizer_xp_reward?: number | null
          semester?: string | null
          title?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
      levels: {
        Row: {
          description: string | null
          id: number
          level_number: number
          perks: string | null
          tier: number
          title: string
          total_xp: number
        }
        Insert: {
          description?: string | null
          id?: number
          level_number: number
          perks?: string | null
          tier: number
          title: string
          total_xp: number
        }
        Update: {
          description?: string | null
          id?: number
          level_number?: number
          perks?: string | null
          tier?: number
          title?: string
          total_xp?: number
        }
        Relationships: []
      }
      loot_box_drop_rates: {
        Row: {
          id: number
          level_max: number
          level_min: number
          tier_1_rate: number | null
          tier_2_rate: number | null
          tier_3_rate: number | null
          tier_4_rate: number | null
        }
        Insert: {
          id?: number
          level_max: number
          level_min: number
          tier_1_rate?: number | null
          tier_2_rate?: number | null
          tier_3_rate?: number | null
          tier_4_rate?: number | null
        }
        Update: {
          id?: number
          level_max?: number
          level_min?: number
          tier_1_rate?: number | null
          tier_2_rate?: number | null
          tier_3_rate?: number | null
          tier_4_rate?: number | null
        }
        Relationships: []
      }
      loot_box_level_ranges: {
        Row: {
          id: number
          level_max: number
          level_min: number
        }
        Insert: {
          id?: number
          level_max: number
          level_min: number
        }
        Update: {
          id?: number
          level_max?: number
          level_min?: number
        }
        Relationships: []
      }
      loot_box_tier_rates: {
        Row: {
          id: number
          level_range_id: number
          rate: number | null
          tier: number
        }
        Insert: {
          id?: number
          level_range_id: number
          rate?: number | null
          tier: number
        }
        Update: {
          id?: number
          level_range_id?: number
          rate?: number | null
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "loot_box_tier_rates_level_range_id_fkey"
            columns: ["level_range_id"]
            isOneToOne: false
            referencedRelation: "loot_box_level_ranges"
            referencedColumns: ["id"]
          },
        ]
      }
      loot_box_types: {
        Row: {
          description: string | null
          icon_url: string | null
          id: number
          name: string
          tier: number | null
        }
        Insert: {
          description?: string | null
          icon_url?: string | null
          id?: number
          name: string
          tier?: number | null
        }
        Update: {
          description?: string | null
          icon_url?: string | null
          id?: number
          name?: string
          tier?: number | null
        }
        Relationships: []
      }
      loot_boxes: {
        Row: {
          awarded_at: string | null
          awarded_for: string | null
          id: number
          is_opened: boolean | null
          opened_at: string | null
          type_id: number
          user_id: number
        }
        Insert: {
          awarded_at?: string | null
          awarded_for?: string | null
          id?: number
          is_opened?: boolean | null
          opened_at?: string | null
          type_id: number
          user_id: number
        }
        Update: {
          awarded_at?: string | null
          awarded_for?: string | null
          id?: number
          is_opened?: boolean | null
          opened_at?: string | null
          type_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "loot_boxes_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "loot_box_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loot_boxes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          attendance_status: string | null
          event_id: number
          id: number
          joined_at: string
          user_id: number
          xp_earned: number | null
        }
        Insert: {
          attendance_status?: string | null
          event_id: number
          id?: number
          joined_at: string
          user_id: number
          xp_earned?: number | null
        }
        Update: {
          attendance_status?: string | null
          event_id?: number
          id?: number
          joined_at?: string
          user_id?: number
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_box_tiers: {
        Row: {
          id: number
          loot_box_tier: number
        }
        Insert: {
          id?: number
          loot_box_tier: number
        }
        Update: {
          id?: number
          loot_box_tier?: number
        }
        Relationships: []
      }
      reward_drop_rates: {
        Row: {
          id: number
          loot_box_tier: number
          tier_1_rate: number | null
          tier_2_rate: number | null
          tier_3_rate: number | null
          tier_4_rate: number | null
        }
        Insert: {
          id?: number
          loot_box_tier: number
          tier_1_rate?: number | null
          tier_2_rate?: number | null
          tier_3_rate?: number | null
          tier_4_rate?: number | null
        }
        Update: {
          id?: number
          loot_box_tier?: number
          tier_1_rate?: number | null
          tier_2_rate?: number | null
          tier_3_rate?: number | null
          tier_4_rate?: number | null
        }
        Relationships: []
      }
      reward_tier_rates: {
        Row: {
          box_tier_id: number
          id: number
          rate: number | null
          tier: number
        }
        Insert: {
          box_tier_id: number
          id?: number
          rate?: number | null
          tier: number
        }
        Update: {
          box_tier_id?: number
          id?: number
          rate?: number | null
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_tier_rates_box_tier_id_fkey"
            columns: ["box_tier_id"]
            isOneToOne: false
            referencedRelation: "reward_box_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_types: {
        Row: {
          category: string | null
          description: string | null
          id: number
          image_url: string
          is_rare: boolean | null
          name: string
          theme: string | null
          tier: number | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: number
          image_url: string
          is_rare?: boolean | null
          name: string
          theme?: string | null
          tier?: number | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: number
          image_url?: string
          is_rare?: boolean | null
          name?: string
          theme?: string | null
          tier?: number | null
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
      semesters: {
        Row: {
          end_date: string
          id: number
          is_active: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          end_date: string
          id?: number
          is_active?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          end_date?: string
          id?: number
          is_active?: boolean | null
          name?: string
          start_date?: string
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
      user_activities: {
        Row: {
          activity_type: string
          description: string | null
          id: number
          related_event_id: number | null
          timestamp: string | null
          user_id: number
          xp_earned: number
        }
        Insert: {
          activity_type: string
          description?: string | null
          id?: number
          related_event_id?: number | null
          timestamp?: string | null
          user_id: number
          xp_earned: number
        }
        Update: {
          activity_type?: string
          description?: string | null
          id?: number
          related_event_id?: number | null
          timestamp?: string | null
          user_id?: number
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          event_id: number
          id: number
          interaction_date: string | null
          other_user_id: number
          semester: string | null
          user_id: number
        }
        Insert: {
          event_id: number
          id?: number
          interaction_date?: string | null
          other_user_id: number
          semester?: string | null
          user_id: number
        }
        Update: {
          event_id?: number
          id?: number
          interaction_date?: string | null
          other_user_id?: number
          semester?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interactions_other_user_id_fkey"
            columns: ["other_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
          acquired_at: string | null
          id: number
          is_equipped: boolean | null
          loot_box_id: number | null
          reward_type_id: number
          user_id: number
        }
        Insert: {
          acquired_at?: string | null
          id?: number
          is_equipped?: boolean | null
          loot_box_id?: number | null
          reward_type_id: number
          user_id: number
        }
        Update: {
          acquired_at?: string | null
          id?: number
          is_equipped?: boolean | null
          loot_box_id?: number | null
          reward_type_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_loot_box_id_fkey"
            columns: ["loot_box_id"]
            isOneToOne: false
            referencedRelation: "loot_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_reward_type_id_fkey"
            columns: ["reward_type_id"]
            isOneToOne: false
            referencedRelation: "reward_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active_weeks_streak: number | null
          current_level: number | null
          current_semester: string | null
          current_xp: number | null
          email: string
          id: number
          join_date: string | null
          last_event_date: string | null
          password_hash: string | null
          profile_picture: string | null
          total_xp_earned: number | null
          username: string
        }
        Insert: {
          active_weeks_streak?: number | null
          current_level?: number | null
          current_semester?: string | null
          current_xp?: number | null
          email: string
          id?: number
          join_date?: string | null
          last_event_date?: string | null
          password_hash?: string | null
          profile_picture?: string | null
          total_xp_earned?: number | null
          username: string
        }
        Update: {
          active_weeks_streak?: number | null
          current_level?: number | null
          current_semester?: string | null
          current_xp?: number | null
          email?: string
          id?: number
          join_date?: string | null
          last_event_date?: string | null
          password_hash?: string | null
          profile_picture?: string | null
          total_xp_earned?: number | null
          username?: string
        }
        Relationships: []
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
