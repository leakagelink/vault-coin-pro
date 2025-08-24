
import { supabase } from '@/integrations/supabase/client';

export type PositionStatus = 'open' | 'closed';
export type PositionType = 'long' | 'short';

export interface OpenPositionInput {
  symbol: string;
  coin_name: string;
  amount: number;        // quantity of coin
  buy_price: number;     // price at which position is opened
  position_type?: PositionType;
}

export interface ClosePositionInput {
  id: string;            // position id
  current_price?: number; // optional: update current price at close time
}

export const getPositions = async () => {
  console.log('[Positions] Fetching positions for current user');
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Using any to avoid strict Database types (generated types are not present)
  const { data, error } = await (supabase as any)
    .from('portfolio_positions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Positions] Error fetching positions:', error);
    throw error;
  }
  return data as any[];
};

export const openPosition = async (input: OpenPositionInput) => {
  console.log('[Positions] Opening position', input);
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const payload = {
    user_id: userId,
    symbol: input.symbol,
    coin_name: input.coin_name,
    amount: input.amount,
    buy_price: input.buy_price,
    current_price: input.buy_price,
    position_type: input.position_type ?? 'long',
    status: 'open' as PositionStatus,
  };

  const { data, error } = await (supabase as any)
    .from('portfolio_positions')
    .insert(payload)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[Positions] Error opening position:', error);
    throw error;
  }
  console.log('[Positions] Opened', data);
  return data;
};

export const closePosition = async ({ id, current_price }: ClosePositionInput) => {
  console.log('[Positions] Closing position', id, 'at price', current_price);
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const update: Record<string, any> = { status: 'closed' as PositionStatus };
  if (typeof current_price === 'number') {
    update.current_price = current_price;
  }

  const { data, error } = await (supabase as any)
    .from('portfolio_positions')
    .update(update)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[Positions] Error closing position:', error);
    throw error;
  }
  console.log('[Positions] Closed', data);
  return data;
};
