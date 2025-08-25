
-- Ensure required extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the bank_accounts table if it does not exist
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_holder_name text NOT NULL,
  account_number text NOT NULL,
  ifsc_code text NOT NULL,
  bank_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('savings', 'current')),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts (user_id);

-- Allow only one primary account per user
CREATE UNIQUE INDEX IF NOT EXISTS uniq_bank_accounts_primary_per_user
  ON public.bank_accounts (user_id)
  WHERE is_primary;

-- Enable Row Level Security
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Replace policies with the correct ones
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bank_accounts'
      AND policyname = 'Users can select own bank accounts'
  ) THEN
    DROP POLICY "Users can select own bank accounts" ON public.bank_accounts;
  END IF;
END$$;

CREATE POLICY "Users can select own bank accounts"
  ON public.bank_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bank_accounts'
      AND policyname = 'Users can insert own bank accounts'
  ) THEN
    DROP POLICY "Users can insert own bank accounts" ON public.bank_accounts;
  END IF;
END$$;

CREATE POLICY "Users can insert own bank accounts"
  ON public.bank_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bank_accounts'
      AND policyname = 'Users can update own bank accounts'
  ) THEN
    DROP POLICY "Users can update own bank accounts" ON public.bank_accounts;
  END IF;
END$$;

CREATE POLICY "Users can update own bank accounts"
  ON public.bank_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bank_accounts'
      AND policyname = 'Users can delete own bank accounts'
  ) THEN
    DROP POLICY "Users can delete own bank accounts" ON public.bank_accounts;
  END IF;
END$$;

CREATE POLICY "Users can delete own bank accounts"
  ON public.bank_accounts
  FOR DELETE
  USING (auth.uid() = user_id);
