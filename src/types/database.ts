/**
 * Auto-generated Supabase database types
 * Run: npx supabase gen types typescript --project-id=YOUR_PROJECT_ID > src/types/database.ts
 * Reference: https://supabase.com/docs/guides/api/rest/generating-types
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: number
          username: string
          first_name: string
          last_name: string | null
          avatar_url: string | null
          email: string | null
          language: 'en' | 'ar' | 'fr'
          points_balance: number
          usd_equivalent: number
          level: number
          referral_code: string
          referred_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          telegram_id: number
          username: string
          first_name: string
          last_name?: string | null
          avatar_url?: string | null
          email?: string | null
          language?: 'en' | 'ar' | 'fr'
          points_balance?: number
          usd_equivalent?: number
          level?: number
          referral_code: string
          referred_by?: string | null
          is_active?: boolean
        }
        Update: {
          username?: string
          first_name?: string
          last_name?: string | null
          avatar_url?: string | null
          email?: string | null
          language?: 'en' | 'ar' | 'fr'
          usd_equivalent?: number
          level?: number
          referred_by?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'earn' | 'spend' | 'bonus' | 'referral' | 'withdrawal'
          description: string
          source: string | null
          created_at: string
          metadata: Record<string, any> | null
        }
        Insert: {
          user_id: string
          amount: number
          type: 'earn' | 'spend' | 'bonus' | 'referral' | 'withdrawal'
          description: string
          source?: string | null
          metadata?: Record<string, any> | null
        }
        Update: {
          description?: string
          metadata?: Record<string, any> | null
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          category: 'watch' | 'click' | 'survey' | 'game'
          reward_points: number
          is_active: boolean
          max_completions_per_user: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          category: 'watch' | 'click' | 'survey' | 'game'
          reward_points: number
          is_active?: boolean
          max_completions_per_user?: number | null
        }
        Update: {
          title?: string
          description?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      task_completions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          completed_at: string
          points_awarded: number
        }
        Insert: {
          user_id: string
          task_id: string
          points_awarded: number
        }
        Update: {
          points_awarded?: number
        }
      }
      rewards: {
        Row: {
          id: string
          title: string
          description: string
          reward_type: 'daily' | 'streak' | 'welcome' | 'gift' | 'achievement'
          points_reward: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          reward_type: 'daily' | 'streak' | 'welcome' | 'gift' | 'achievement'
          points_reward?: number | null
          is_active?: boolean
        }
        Update: {
          title?: string
          description?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      reward_claims: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          claimed_at: string
          points_claimed: number | null
        }
        Insert: {
          user_id: string
          reward_id: string
          points_claimed?: number | null
        }
        Update: never
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_user_id: string
          referral_code: string
          commission_rate: number
          total_commission: number
          created_at: string
        }
        Insert: {
          referrer_id: string
          referred_user_id: string
          referral_code: string
          commission_rate?: number
          total_commission?: number
        }
        Update: {
          total_commission?: number
        }
      }
      wheel_spins: {
        Row: {
          id: string
          user_id: string
          reward_type: string
          points_won: number
          spun_at: string
        }
        Insert: {
          user_id: string
          reward_type: string
          points_won: number
        }
        Update: never
      }
      app_config: {
        Row: {
          id: string
          key: string
          value: string | Record<string, any>
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: string | Record<string, any>
          description?: string | null
        }
        Update: {
          value?: string | Record<string, any>
          description?: string | null
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
