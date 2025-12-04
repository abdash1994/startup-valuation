-- Supabase SQL Schema for Startup Value Navigator
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create valuations table
CREATE TABLE IF NOT EXISTS valuations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  startup_name TEXT NOT NULL,
  stage TEXT NOT NULL,
  arr DECIMAL NOT NULL,
  monthly_growth DECIMAL NOT NULL,
  tam DECIMAL NOT NULL,
  gross_margin DECIMAL NOT NULL,
  net_retention DECIMAL NOT NULL,
  burn_multiple DECIMAL NOT NULL,
  team_strength DECIMAL NOT NULL,
  differentiation DECIMAL NOT NULL,
  bear_valuation DECIMAL NOT NULL,
  base_valuation DECIMAL NOT NULL,
  bull_valuation DECIMAL NOT NULL,
  revenue_multiple DECIMAL NOT NULL,
  confidence DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_valuations_user_id ON valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_valuations_created_at ON valuations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own valuations
CREATE POLICY "Users can view own valuations"
  ON valuations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own valuations
CREATE POLICY "Users can insert own valuations"
  ON valuations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own valuations
CREATE POLICY "Users can update own valuations"
  ON valuations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own valuations
CREATE POLICY "Users can delete own valuations"
  ON valuations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_valuations_updated_at
  BEFORE UPDATE ON valuations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

