
/**
 * Supabase Edge Function: cmc-proxy
 * Proxies CoinMarketCap API with your secret CMC_API_KEY, returning top listings.
 * Configure secret in Supabase dashboard: CMC_API_KEY
 */
import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('CMC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'CMC_API_KEY is not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let limit = 10;
    let convert = 'USD';

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (typeof body.limit === 'number') limit = Math.max(1, Math.min(100, body.limit));
      if (typeof body.convert === 'string') convert = body.convert.toUpperCase();
    } else {
      const url = new URL(req.url);
      const qLimit = url.searchParams.get('limit');
      const qConvert = url.searchParams.get('convert');
      if (qLimit) limit = Math.max(1, Math.min(100, Number(qLimit)));
      if (qConvert) convert = qConvert.toUpperCase();
    }

    const cmcUrl = new URL('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest');
    cmcUrl.searchParams.set('limit', String(limit));
    cmcUrl.searchParams.set('convert', convert);

    const res = await fetch(cmcUrl.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
      },
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('cmc-proxy error', e);
    return new Response(JSON.stringify({ error: 'Internal error', details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
