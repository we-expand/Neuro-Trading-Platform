/**
 * 🔄 BINANCE POLLING SERVICE
 * 
 * Fallback quando WebSocket não funciona (CSP/CORS do Figma Make)
 * Atualiza preços via REST API a cada 1 segundo
 * 
 * 🆕 USA PROXY DO BACKEND para contornar CORS!
 */

import { debugLog, debugError } from '@/app/config/debug';

export interface BinanceTickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

type TickerCallback = (data: BinanceTickerData) => void;

interface PollingSubscription {
  symbol: string;
  callbacks: Set<TickerCallback>;
  intervalId: NodeJS.Timeout | null;
  lastData: BinanceTickerData | null;
}

class BinancePollingService {
  private subscriptions: Map<string, PollingSubscription> = new Map();
  private readonly POLL_INTERVAL = 1000; // 1 segundo
  // 🔥 MUDADO: Restaurado para a API direta da Binance (o app agora roda na Vercel, não tem problema de CORS)
  private readonly API_BASE_URL = `https://api.binance.com/api/v3`;

  /**
   * Subscreve a um símbolo e recebe atualizações via polling
   */
  subscribe(symbol: string, callback: TickerCallback): () => void {
    const normalizedSymbol = symbol.toUpperCase();
    
    console.log(`[BinancePolling] 🔄 SUBSCRIBE: ${normalizedSymbol}`);

    // Se já existe subscription, apenas adiciona callback
    if (this.subscriptions.has(normalizedSymbol)) {
      const sub = this.subscriptions.get(normalizedSymbol)!;
      sub.callbacks.add(callback);
      console.log(`[BinancePolling] ✅ Callback adicionado (total: ${sub.callbacks.size})`);
      
      // Se já tem dados em cache, chama callback imediatamente
      if (sub.lastData) {
        callback(sub.lastData);
      }
      
      return () => this.unsubscribe(normalizedSymbol, callback);
    }

    // Cria nova subscription
    const sub: PollingSubscription = {
      symbol: normalizedSymbol,
      callbacks: new Set([callback]),
      intervalId: null,
      lastData: null
    };

    this.subscriptions.set(normalizedSymbol, sub);
    console.log(`[BinancePolling] 🆕 Nova subscription criada para ${normalizedSymbol}`);
    
    this.startPolling(normalizedSymbol);

    return () => this.unsubscribe(normalizedSymbol, callback);
  }

  /**
   * Remove callback de um símbolo
   */
  private unsubscribe(symbol: string, callback: TickerCallback): void {
    const sub = this.subscriptions.get(symbol);
    if (!sub) return;

    sub.callbacks.delete(callback);
    console.log(`[BinancePolling] ❌ Callback removido (restantes: ${sub.callbacks.size})`);

    // Se não há mais callbacks, para o polling
    if (sub.callbacks.size === 0) {
      this.stopPolling(symbol);
      this.subscriptions.delete(symbol);
      console.log(`[BinancePolling] 🛑 Polling parado para ${symbol}`);
    }
  }

  /**
   * Inicia polling para um símbolo
   */
  private startPolling(symbol: string): void {
    const sub = this.subscriptions.get(symbol);
    if (!sub) return;

    console.log(`[BinancePolling] ▶️ Iniciando polling para ${symbol} (${this.POLL_INTERVAL}ms)`);

    // Faz primeira requisição imediatamente
    this.fetchAndNotify(symbol);

    // Configura intervalo
    sub.intervalId = setInterval(() => {
      this.fetchAndNotify(symbol);
    }, this.POLL_INTERVAL);
  }

  /**
   * Para polling para um símbolo
   */
  private stopPolling(symbol: string): void {
    const sub = this.subscriptions.get(symbol);
    if (!sub || !sub.intervalId) return;

    clearInterval(sub.intervalId);
    sub.intervalId = null;
  }

  /**
   * Busca dados da API e notifica callbacks
   */
  private async fetchAndNotify(symbol: string): Promise<void> {
    const sub = this.subscriptions.get(symbol);
    if (!sub) return;

    try {
      // 🚫 EVITAR ERRO DE CORS / 400: Binance não suporta S&P500, Ouro ou Forex.
      // Se tentarmos buscar SPX500USDT, a Binance vai dar 400 e bloquear por CORS.
      const nonCryptoPrefixes = ['SPX', 'US', 'NAS', 'UK', 'DE', 'JPN', 'HKG', 'AUS', 'XAU', 'XAG', 'XPT', 'XPD', 'UKO', 'USO', 'NGA', 'EUR', 'GBP', 'AUD', 'NZD', 'CAD', 'CHF', 'JPY'];
      const isNonCrypto = nonCryptoPrefixes.some(prefix => symbol.startsWith(prefix));
      
      if (isNonCrypto) {
        // Interrompe o polling desse ativo na Binance e não faz fetch
        this.stopPolling(symbol);
        return;
      }

      // � Busca ticker 24h via API direta
      const response = await fetch(
        `${this.API_BASE_URL}/ticker/24hr?symbol=${symbol}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Converte para formato padronizado
      const tickerData: BinanceTickerData = {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        change: parseFloat(data.priceChange),
        changePercent: parseFloat(data.priceChangePercent),
        timestamp: Date.now()
      };

      // Atualiza cache
      sub.lastData = tickerData;

      debugLog('MARKET_DATA', `[BinancePolling] 📊 Dados recebidos:`, {
        symbol: tickerData.symbol,
        price: tickerData.price.toFixed(2),
        change: tickerData.change.toFixed(2),
        changePercent: tickerData.changePercent.toFixed(2) + '%',
        callbacks: sub.callbacks.size
      });

      // Notifica todos os callbacks
      let callbacksExecuted = 0;
      sub.callbacks.forEach(callback => {
        try {
          callback(tickerData);
          callbacksExecuted++;
        } catch (error) {
          debugError(`[BinancePolling] ❌ Erro no callback:`, error);
        }
      });

      debugLog('MARKET_DATA', `[BinancePolling] ✅ Callbacks executados: ${callbacksExecuted}/${sub.callbacks.size}`);

    } catch (error) {
      debugError(`[BinancePolling] ❌ Erro ao buscar dados:`, error);
    }
  }

  /**
   * Para todos os pollings (cleanup)
   */
  destroy(): void {
    console.log(`[BinancePolling] 🧹 Cleanup: parando ${this.subscriptions.size} pollings`);
    
    this.subscriptions.forEach((sub, symbol) => {
      this.stopPolling(symbol);
    });
    
    this.subscriptions.clear();
  }
}

// Singleton instance
export const binancePolling = new BinancePollingService();