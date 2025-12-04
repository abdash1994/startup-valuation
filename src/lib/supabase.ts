import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffsdhidorwxsoeqrrlvr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc2RoaWRvcnd4c29lcXJybHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODU3ODgsImV4cCI6MjA4MDM2MTc4OH0.8_G4bOHv_VeqvwVLbsWXpk0Q389MO6CH_iXiYMH9tkQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type ValuationRecord = {
  id?: string
  user_id: string
  startup_name: string
  stage: string
  arr: number
  monthly_growth: number
  tam: number
  gross_margin: number
  net_retention: number
  burn_multiple: number
  team_strength: number
  differentiation: number
  bear_valuation: number
  base_valuation: number
  bull_valuation: number
  revenue_multiple: number
  confidence: number
  created_at?: string
  updated_at?: string
}

export type UserProfile = {
  id: string
  email: string
  full_name?: string
  company?: string
  created_at?: string
}

