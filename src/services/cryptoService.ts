
import { supabase } from '@/integrations/supabase/client';

export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
      volume_24h: number;
    };
  };
}

// Fetch live crypto prices via Supabase Edge Function "cmc-proxy"
// Requires a Supabase secret named CMC_API_KEY configured in the project
export const fetchCryptoPrices = async (): Promise<CryptoData[]> => {
  console.log('[Crypto] Fetching live prices via edge function cmc-proxy');
  const { data, error } = await supabase.functions.invoke('cmc-proxy', {
    body: { limit: 20, convert: 'USD' },
  });

  if (error) {
    console.error('[Crypto] cmc-proxy error:', error);
    throw error;
  }

  const list = (data as any)?.data;
  if (!Array.isArray(list)) {
    console.error('[Crypto] Unexpected response shape from cmc-proxy:', data);
    return [];
  }
  return list as CryptoData[];
};

export const formatPrice = (price: number): string => {
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return `$${marketCap.toLocaleString()}`;
};
