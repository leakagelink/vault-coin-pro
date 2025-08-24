
import { CMC_API_KEY } from '@/lib/firebase';

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

// Note: Due to CORS restrictions, in production you'd need to proxy this through your backend
// For demo purposes, we'll use mock data that simulates the API structure
export const fetchCryptoPrices = async (): Promise<CryptoData[]> => {
  // In a real app, you'd make this call through your backend to avoid CORS issues
  // const response = await fetch(`${CMC_BASE_URL}/cryptocurrency/listings/latest?limit=20`, {
  //   headers: {
  //     'X-CMC_PRO_API_KEY': CMC_API_KEY,
  //   },
  // });
  
  // Mock data that matches CMC API structure
  return [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      quote: {
        USD: {
          price: 43250.67,
          percent_change_24h: 2.34,
          percent_change_7d: 5.67,
          market_cap: 847234567890,
          volume_24h: 23456789012
        }
      }
    },
    {
      id: 1027,
      name: "Ethereum",
      symbol: "ETH",
      quote: {
        USD: {
          price: 2645.32,
          percent_change_24h: -1.67,
          percent_change_7d: 3.45,
          market_cap: 318234567890,
          volume_24h: 15678901234
        }
      }
    },
    {
      id: 1839,
      name: "BNB",
      symbol: "BNB",
      quote: {
        USD: {
          price: 315.67,
          percent_change_24h: 5.43,
          percent_change_7d: -2.11,
          market_cap: 48234567890,
          volume_24h: 1234567890
        }
      }
    },
    {
      id: 2010,
      name: "Cardano",
      symbol: "ADA",
      quote: {
        USD: {
          price: 0.4567,
          percent_change_24h: 0.89,
          percent_change_7d: 7.23,
          market_cap: 16234567890,
          volume_24h: 567890123
        }
      }
    }
  ];
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
