
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type CmcQuote = {
  price: number;
  percent_change_24h: number;
};

type CmcItem = {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: CmcQuote;
  };
};

const LiveTicker: React.FC = () => {
  const [data, setData] = useState<CmcItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('cmc-proxy', {
        body: { limit: 15, convert: 'USD' },
      });

      if (error) {
        console.error('[LiveTicker] Error fetching CMC data', error);
        setData([]);
      } else {
        setData((data as any)?.data || []);
      }
      setLoading(false);
    };

    load();

    // Refresh every 60s
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-hidden border-b border-border bg-card/60">
        <div className="animate-pulse h-10" />
      </div>
    );
  }

  if (!data?.length) return null;

  return (
    <div className="w-full overflow-hidden border-b border-border bg-card/60">
      <div className="flex gap-6 whitespace-nowrap py-2 px-4 animate-[ticker_30s_linear_infinite]">
        {data.map((coin) => {
          const q = coin.quote.USD;
          const up = q.percent_change_24h >= 0;
          return (
            <div key={coin.id} className="flex items-center gap-2 text-sm text-foreground/90">
              <span className="font-semibold">{coin.symbol}</span>
              <span className="text-foreground/70">
                ${q.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className={up ? 'text-green-500' : 'text-red-500'} title={`${q.percent_change_24h.toFixed(2)}%`}>
                {up ? <ArrowUpRight className="inline h-4 w-4" /> : <ArrowDownRight className="inline h-4 w-4" />} {Math.abs(q.percent_change_24h).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      <style>
        {`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        `}
      </style>
    </div>
  );
};

export default LiveTicker;
