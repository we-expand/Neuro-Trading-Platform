import { useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface MT5Price {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  bid?: number;
  ask?: number;
  timestamp: string;
  error?: string;
}

interface MT5PricesResponse {
  success: boolean;
  count: number;
  total: number;
  prices: MT5Price[];
  timestamp: string;
}

/**
 * 🚀 HOOK: useMT5Prices
 * 
 * Busca preços REAIS do MT5 via MetaApi para múltiplos ativos.
 * Atualiza automaticamente a cada 10 segundos.
 */
export function useMT5Prices(symbols: string[], enabled = true) {
  const [prices, setPrices] = useState<Record<string, MT5Price>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!enabled || symbols.length === 0) return;

    // Buscar credenciais MT5 do localStorage
    const mt5Token = localStorage.getItem('mt5_token');
    const mt5AccountId = localStorage.getItem('mt5_accountId');

    if (!mt5Token || !mt5AccountId) {
      console.warn('[useMT5Prices] ⚠️ Credenciais MT5 não configuradas');
      setError('MT5 não configurado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/mt5-prices`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            symbols,
            token: mt5Token,
            accountId: mt5AccountId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: MT5PricesResponse = await response.json();

      // Converter array para objeto indexado por símbolo
      const pricesMap: Record<string, MT5Price> = {};
      data.prices.forEach((p) => {
        pricesMap[p.symbol] = p;
      });

      setPrices(pricesMap);
      
      const successCount = data.prices.filter(p => p.price !== null).length;
      console.log(`[useMT5Prices] ✅ ${successCount}/${symbols.length} preços obtidos`);

    } catch (err: any) {
      console.error('[useMT5Prices] ❌ Erro:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbols, enabled]);

  // Buscar ao montar e a cada 10 segundos
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // 10s
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    prices,
    loading,
    error,
    refresh: fetchPrices,
  };
}

/**
 * 🚀 HOOK: useMT5Price (singular)
 * 
 * Busca preço REAL de um único ativo do MT5.
 */
export function useMT5Price(symbol: string, enabled = true) {
  const { prices, loading, error, refresh } = useMT5Prices([symbol], enabled);
  return {
    price: prices[symbol] || null,
    loading,
    error,
    refresh,
  };
}
