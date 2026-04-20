/**
 * ============================================================
 * NEURAL DAY TRADER — GRÁFICO STANDALONE (VERSÃO RESTAURADA)
 * ============================================================
 * Arquivo 100% autocontido. Copie e cole em qualquer app React.
 *
 * Dependências necessárias no seu projeto:
 * npm install klinecharts lucide-react sonner
 *
 * Também requer Tailwind CSS configurado.
 * ============================================================
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { init, dispose, registerOverlay, getSupportedOverlays } from 'klinecharts';
import type { KLineData, OverlayTemplate } from 'klinecharts';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Activity,
  Clock,
  Search,
  Minus,
  Square,
  Triangle,
  Type,
  Eraser,
  Crosshair,
  GitBranch,
  Ruler,
  ZoomIn,
  Lock,
  Eye,
  Trash2,
  Smile,
  Navigation,
  Target,
  Zap,
  RotateCcw,
  X,
  Trophy,
  TrendingUpDown,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// ============================================================
// TIPOS
// ============================================================

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1H' | '2H' | '4H' | '1D' | '1W' | '1M';

interface MarketAsset {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  category: string;
}

interface LiquidityZone {
  id: string;
  price: number;
  strength: number;
  type: 'support' | 'resistance';
  touches: number;
  volume: number;
  distance: number;
  significance: 'critical' | 'strong' | 'moderate' | 'weak';
}

interface TradingSignal {
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number;
  reasons: string[];
  rsi: number;
  trend: 'bullish' | 'bearish' | 'sideways';
}

interface IndicatorConfig {
  id: string;
  name: string;
  description: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'support_resistance';
  klinechartsName: string;
  defaultParams?: number[];
  isPaneIndicator?: boolean;
}

// ============================================================
// REGISTRAR OVERLAY CUSTOMIZADO: PONTO MARCADOR
// ============================================================

const PointMarkerOverlay: OverlayTemplate = {
  name: 'pointMarker',
  totalStep: 1,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
  createPointFigures: ({ coordinates, overlay }: any) => {
    if (coordinates.length > 0) {
      const point = coordinates[0];
      return {
        type: 'circle',
        attrs: { x: point.x, y: point.y, r: 3 },
        styles: {
          style: 'fill',
          color: overlay.styles?.circle?.color || '#3b82f6',
        },
      };
    }
    return [];
  },
};

try { registerOverlay(PointMarkerOverlay); } catch (_) {}

// ============================================================
// INDICADORES DISPONÍVEIS
// ============================================================

const INDICATORS: IndicatorConfig[] = [
  { id: 'ma',   name: 'MA – Média Móvel Simples',            description: 'Simple Moving Average',                  category: 'trend',               klinechartsName: 'MA',   defaultParams: [5, 10, 20, 60],  isPaneIndicator: false },
  { id: 'ema',  name: 'EMA – Média Móvel Exponencial',       description: 'Exponential Moving Average',             category: 'trend',               klinechartsName: 'EMA',  defaultParams: [6, 12, 20],     isPaneIndicator: false },
  { id: 'wma',  name: 'WMA – Média Móvel Ponderada',         description: 'Weighted Moving Average',                category: 'trend',               klinechartsName: 'WMA',  defaultParams: [5, 10, 20],     isPaneIndicator: false },
  { id: 'sar',  name: 'SAR – Parabolic SAR',                  description: 'Parabolic Stop and Reverse',             category: 'trend',               klinechartsName: 'SAR',  defaultParams: [2, 2, 20],      isPaneIndicator: false },
  { id: 'dmi',  name: 'DMI – Directional Movement Index',    description: 'Índice de Movimento Direcional',         category: 'trend',               klinechartsName: 'DMI',  defaultParams: [14, 6],          isPaneIndicator: true  },
  { id: 'boll', name: 'BOLL – Bollinger Bands',              description: 'Bandas de Bollinger',                    category: 'volatility',          klinechartsName: 'BOLL', defaultParams: [20, 2],          isPaneIndicator: false },
  { id: 'rsi',  name: 'RSI – Relative Strength Index',       description: 'Índice de Força Relativa',              category: 'momentum',            klinechartsName: 'RSI',  defaultParams: [6, 12, 24],      isPaneIndicator: true  },
  { id: 'macd', name: 'MACD – Convergência de Médias',       description: 'Moving Average Convergence/Divergence', category: 'momentum',            klinechartsName: 'MACD', defaultParams: [12, 26, 9],      isPaneIndicator: true  },
  { id: 'kdj',  name: 'KDJ – Stochastic Oscillator',         description: 'Oscilador Estocástico',                  category: 'momentum',            klinechartsName: 'KDJ',  defaultParams: [9, 3, 3],        isPaneIndicator: true  },
  { id: 'cci',  name: 'CCI – Commodity Channel Index',       description: 'Índice de Canal de Commodities',         category: 'momentum',            klinechartsName: 'CCI',  defaultParams: [13],             isPaneIndicator: true  },
  { id: 'wr',   name: 'WR – Williams %R',                    description: 'Williams Percent Range',                 category: 'momentum',            klinechartsName: 'WR',   defaultParams: [6, 10, 14],      isPaneIndicator: true  },
  { id: 'atr',  name: 'ATR – Average True Range',            description: 'Amplitude Média Verdadeira',             category: 'volatility',          klinechartsName: 'ATR',  defaultParams: [14],             isPaneIndicator: true  },
  { id: 'dc',   name: 'DC – Donchian Channel',               description: 'Canal de Donchian',                      category: 'volatility',          klinechartsName: 'DC',   defaultParams: [20],             isPaneIndicator: false },
  { id: 'vol',  name: 'VOL – Volume',                        description: 'Volume de Negociação',                  category: 'volume',              klinechartsName: 'VOL',  defaultParams: [5, 10, 20],      isPaneIndicator: true  },
  { id: 'obv',  name: 'OBV – On Balance Volume',             description: 'Volume em Balanço',                      category: 'volume',              klinechartsName: 'OBV',  defaultParams: [30],             isPaneIndicator: true  },
  { id: 'roc',  name: 'ROC – Rate of Change',                description: 'Taxa de Mudança',                        category: 'momentum',            klinechartsName: 'ROC',  defaultParams: [12, 6],          isPaneIndicator: true  },
];

const ASSETS: MarketAsset[] = [
  { symbol: 'BTCUSD',  name: 'Bitcoin',                  bid: 86500,   ask: 86502,   change: -2400,  changePercent: -2.70, category: 'Crypto' },
  { symbol: 'ETHUSD',  name: 'Ethereum',                 bid: 3200,    ask: 3201,    change: -80,    changePercent: -2.44, category: 'Crypto' },
  { symbol: 'EURUSD',  name: 'Euro / US Dollar',         bid: 1.0412,  ask: 1.0413,  change: 0.0015, changePercent:  0.14, category: 'Forex' },
  { symbol: 'XAUUSD',  name: 'Gold',                     bid: 2678,    ask: 2679,    change: 12,     changePercent:  0.45, category: 'Commodities' },
  { symbol: 'NAS100',  name: 'NASDAQ 100',               bid: 21345,   ask: 21347,   change: 75,     changePercent:  0.35, category: 'Índices' },
];

const BINANCE_SYMBOL_MAP: Record<string, string> = {
  BTCUSD: 'BTCUSDT', ETHUSD: 'ETHUSDT', BNBUSD: 'BNBUSDT', SOLUSD: 'SOLUSDT', XRPUSD: 'XRPUSDT'
};

const TIMEFRAME_TO_BINANCE: Record<Timeframe, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1H': '1h', '2H': '2h', '4H': '4h', '1D': '1d', '1W': '1w', '1M': '1M',
};

function toBinanceSymbol(symbol: string): string | null {
  return BINANCE_SYMBOL_MAP[symbol] || null;
}

async function fetchCandlesBinance(symbol: string, timeframe: Timeframe, limit = 200): Promise<KLineData[]> {
  const bSymbol = toBinanceSymbol(symbol);
  if (!bSymbol) return generateFallbackCandles(symbol, timeframe, limit);

  try {
    const interval = TIMEFRAME_TO_BINANCE[timeframe];
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${bSymbol}&interval=${interval}&limit=${limit}`);
    const data: any[][] = await res.json();
    return data.map((c) => ({
      timestamp: c[0],
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5]),
    }));
  } catch {
    return generateFallbackCandles(symbol, timeframe, limit);
  }
}

function generateFallbackCandles(symbol: string, timeframe: Timeframe, limit = 200): KLineData[] {
  const MS: Record<Timeframe, number> = {
    '1m': 60000, '5m': 300000, '15m': 900000, '30m': 1800000,
    '1H': 3600000, '2H': 7200000, '4H': 14400000, '1D': 86400000,
    '1W': 604800000, '1M': 2592000000,
  };
  let base = 100;
  const interval = MS[timeframe];
  const now = Date.now();
  const candles: KLineData[] = [];
  for (let i = limit - 1; i >= 0; i--) {
    const timestamp = now - i * interval;
    const close = base * (1 + (Math.random() - 0.5) * 0.002);
    candles.push({ timestamp, open: base, high: Math.max(base, close), low: Math.min(base, close), close, volume: Math.random() * 1000 });
    base = close;
  }
  return candles;
}

// ============================================================
// COMPONENTE: SIDEBAR DE FERRAMENTAS DE DESENHO
// ============================================================

function DrawingSidebar({ onToolSelect, onDeleteAll, activeDrawingTool, crosshairMode, onCrosshairChange }: any) {
  const groups = [
    { label: 'Cursor', tools: [{ id: 'cursor-arrow', icon: Navigation, label: 'Seta' }, { id: 'cursor-crosshair', icon: Crosshair, label: 'Cruz' }] },
    { label: 'Linhas', tools: [{ id: 'trendline', icon: TrendingUpDown, label: 'Tendência' }, { id: 'horizontal-line', icon: Minus, label: 'Horizontal' }] },
  ];
  return (
    <div className="w-10 bg-[#0d0d0d] border-r border-gray-800 flex flex-col items-center py-2 gap-1 shrink-0 overflow-y-auto">
      {groups.map((group) => (
        <React.Fragment key={group.label}>
          {group.tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button key={tool.id} onClick={() => onToolSelect(tool.id)} className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-gray-800">
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </React.Fragment>
      ))}
      <button onClick={onDeleteAll} className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:text-red-400 mt-auto"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL: ChartView
// ============================================================

export default function ChartView() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartIdRef = useRef(`neural-chart-${Math.random().toString(36).slice(2, 8)}`);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chartId = chartIdRef.current;
    try { dispose(chartId); } catch (_) {}
    const chart = init(chartId);
    if (!chart) return;

    chart.setStyles({
      grid: { show: true, horizontal: { color: '#2a2a2a' }, vertical: { color: '#1a1a1a' } },
      candle: { bar: { upColor: '#22c55e', downColor: '#ef4444' } }
    });

    chartInstanceRef.current = chart;
    const loadData = async () => {
      const candles = await fetchCandlesBinance(selectedSymbol, timeframe);
      chart.applyNewData(candles);
      if (candles.length) setCurrentPrice(candles[candles.length - 1].close);
    };
    loadData();
    return () => { try { dispose(chartId); } catch (_) {} };
  }, [selectedSymbol, timeframe]);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
      <div className="h-16 border-b border-gray-800 px-6 flex items-center justify-between bg-black">
        <h2 className="text-xl font-bold">{selectedSymbol} <span className="text-sm font-normal text-gray-500">{timeframe}</span></h2>
        <div className="text-2xl font-mono font-bold text-green-400">{currentPrice?.toFixed(2)}</div>
      </div>
      <div className="flex-1 flex min-h-0">
        <DrawingSidebar onToolSelect={() => {}} onDeleteAll={() => {}} />
        <div 
          ref={chartContainerRef} 
          id={chartIdRef.current} 
          className="flex-1 bg-black relative" 
          style={{ minHeight: