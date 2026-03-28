import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  flowly_preferences: {
    id: string
    user_id: string
    topics: string[]
    created_at: string
    updated_at: string
  }
  flowly_saved: {
    id: string
    user_id: string
    article_url: string
    article_title: string | null
    article_source: string | null
    article_topic: string | null
    saved_at: string
  }
}
