/**
 * 🚀 DIRECT BINANCE SERVICE
 *
 * Busca dados DIRETAMENTE da Binance API pública
 * SEM passar por Supabase Edge Functions
 *
 * Usado como FALLBACK quando Edge Functions estão fora do ar
 */

export interface BinanceTickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
  volume?: number;
  high?: number;
  low?: number;
}

/**
 * Busca dados de um símbolo diretamente da Binance
 */
export async function fetchDirectBinance(symbol: string): Promise<BinanceTickerData | null> {
  try {
    const normalizedSymbol = symbol.toUpperCase();

    // 🔥 CHAMADA DIRETA - sem proxy, sem Edge Functions
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${normalizedSymbol}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[DirectBinance] ⚠️ HTTP ${response.status} for ${symbol}`);
      return null;
    }

    const data = await response.json();

    return {
      symbol: normalizedSymbol,
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChange),
      changePercent: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume),
      high: parseFloat(data.highPrice),
      low: parseFloat(data.lowPrice),
      timestamp: Date.now()
    };

  } catch (error) {
    console.error(`[DirectBinance] ❌ Error fetching ${symbol}:`, error);
    return null;
  }
}

/**
 * Busca múltiplos símbolos em paralelo
 */
export async function fetchMultipleBinance(symbols: string[]): Promise<Map<string, BinanceTickerData>> {
  const results = new Map<string, BinanceTickerData>();

  const promises = symbols.map(async (symbol) => {
    const data = await fetchDirectBinance(symbol);
    if (data) {
      results.set(symbol, data);
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * Verifica se um símbolo é crypto Binance
 */
export function isBinanceSymbol(symbol: string): boolean {
  const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT'];
  return cryptoSymbols.includes(symbol.toUpperCase());
}
