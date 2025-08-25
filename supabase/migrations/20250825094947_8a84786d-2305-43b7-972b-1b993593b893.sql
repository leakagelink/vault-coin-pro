
-- Create admin roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role NOT NULL DEFAULT 'user';

-- Create deposit_requests table
CREATE TABLE public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on new tables
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Deposit requests policies
CREATE POLICY "Users can view own deposit requests" ON public.deposit_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deposit requests" ON public.deposit_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposit requests" ON public.deposit_requests
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update deposit requests" ON public.deposit_requests
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Withdrawal requests policies
CREATE POLICY "Users can view own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update withdrawal requests" ON public.withdrawal_requests
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Update profiles policies to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Allow admins to view all positions
CREATE POLICY "Admins can view all positions" ON public.portfolio_positions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Allow admins to view all wallets
CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Allow admins to update wallets for deposit/withdrawal processing
CREATE POLICY "Admins can update wallets" ON public.wallets
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Create function to handle deposit approval
CREATE OR REPLACE FUNCTION public.approve_deposit_request(
  request_id UUID,
  admin_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;
  
  -- Get the deposit request
  SELECT * INTO request_record 
  FROM public.deposit_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit request not found or already processed';
  END IF;
  
  -- Update deposit request status
  UPDATE public.deposit_requests 
  SET 
    status = 'approved',
    approved_by = admin_id,
    admin_notes = notes,
    updated_at = now()
  WHERE id = request_id;
  
  -- Add amount to user's wallet
  UPDATE public.wallets 
  SET 
    balance = balance + request_record.amount,
    updated_at = now()
  WHERE user_id = request_record.user_id;
  
  -- Create transaction record
  INSERT INTO public.transactions (
    user_id, 
    transaction_type, 
    amount, 
    total_value,
    status
  ) VALUES (
    request_record.user_id,
    'deposit',
    request_record.amount,
    request_record.amount,
    'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle withdrawal approval
CREATE OR REPLACE FUNCTION public.approve_withdrawal_request(
  request_id UUID,
  admin_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
  user_balance NUMERIC;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;
  
  -- Get the withdrawal request
  SELECT * INTO request_record 
  FROM public.withdrawal_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found or already processed';
  END IF;
  
  -- Check user balance
  SELECT balance INTO user_balance 
  FROM public.wallets 
  WHERE user_id = request_record.user_id;
  
  IF user_balance < request_record.amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Update withdrawal request status
  UPDATE public.withdrawal_requests 
  SET 
    status = 'approved',
    approved_by = admin_id,
    admin_notes = notes,
    updated_at = now()
  WHERE id = request_id;
  
  -- Deduct amount from user's wallet
  UPDATE public.wallets 
  SET 
    balance = balance - request_record.amount,
    updated_at = now()
  WHERE user_id = request_record.user_id;
  
  -- Create transaction record
  INSERT INTO public.transactions (
    user_id, 
    transaction_type, 
    amount, 
    total_value,
    status
  ) VALUES (
    request_record.user_id,
    'withdrawal',
    request_record.amount,
    request_record.amount,
    'completed'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject deposit/withdrawal requests
CREATE OR REPLACE FUNCTION public.reject_request(
  request_id UUID,
  request_type TEXT,
  admin_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;
  
  IF request_type = 'deposit' THEN
    UPDATE public.deposit_requests 
    SET 
      status = 'rejected',
      approved_by = admin_id,
      admin_notes = notes,
      updated_at = now()
    WHERE id = request_id AND status = 'pending';
  ELSIF request_type = 'withdrawal' THEN
    UPDATE public.withdrawal_requests 
    SET 
      status = 'rejected',
      approved_by = admin_id,
      admin_notes = notes,
      updated_at = now()
    WHERE id = request_id AND status = 'pending';
  ELSE
    RAISE EXCEPTION 'Invalid request type';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
