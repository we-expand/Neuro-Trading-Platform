// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import { useApexLogic } from '../hooks/useApexLogic';

export const ChartView = () => {
  const chartContainerRef = useRef(null);
  const chartIdRef = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`);
  const logic = useApexLogic();
  const symbol = 'BTCUSD';

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chartId = chartIdRef.current;
    try { dispose(chartId); } catch (_) {}
    const chart = init(chartId);
    if (!chart) return;
    chart.setStyles({ 
      grid: { show: true, horizontal: { color: '#1a1a1a' } }, 
      candle: { bar: { upColor: '#22c55e', downColor: '#ef4444' } } 
    });
    const mockData = [];
    let price = 85000;
    for (let i = 0; i < 100; i++) {
      const close = price + (Math.random() - 0.5) * 100;
      mockData.push({ timestamp: Date.now() - (100 - i) * 60000, open: price, high: Math.max(price, close) + 10, low: Math.min(price, close) - 10, close, volume: Math.random() * 100 });
      price = close;
    }
    chart.applyNewData(mockData);
    return () => dispose(chartId);
  }, [symbol]);

  return (
    <div className="w-full bg-black rounded-xl border border-[#222] overflow-hidden" style={{ minHeight: '700px' }}>
      <div className="p-4 border-b border-[#222] bg-[#050505]">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Neural Engine: {symbol}</span>
      </div>
      <div ref={chartContainerRef} id={chartIdRef.current} style={{ height: '700px', width: '100%' }} />
    </div>
  );
};
