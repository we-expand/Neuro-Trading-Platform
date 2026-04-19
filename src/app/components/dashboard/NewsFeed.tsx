import React, { useState, useEffect, useRef } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, RefreshCcw, Zap, AlertTriangle, Volume2, ThumbsUp, ThumbsDown, MapPin, Bot, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSpeechAlert } from '@/app/hooks/useSpeechAlert';
import { intelligentCrawler, NewsArticle } from '@/app/services/intelligentCrawler'; // 🔥 USAR O CRAWLER REAL!

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: number;
  url?: string;
  isCritical?: boolean;
  relevanceScore?: number; // 🔥 SCORE DE RELEVÂNCIA (0-100)
  assets?: string[]; // 🔥 ATIVOS MENCIONADOS
  userFeedback?: 'like' | 'dislike' | null; // 🔥 FEEDBACK DO USUÁRIO
}

interface MarketAlert {
  id: string;
  symbol: string;
  change: number;
  message: string;
  severity: 'critical' | 'warning';
}

interface UserPreferences {
  likedTopics: string[]; // 🔥 TÓPICOS QUE O USUÁRIO GOSTA
  dislikedTopics: string[];
  preferredAssets: string[];
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [nextUpdateIn, setNextUpdateIn] = useState(30); // 🔥 30 SEGUNDOS (não 5 minutos!)
  const [criticalPopup, setCriticalPopup] = useState<MarketAlert | null>(null);
  const [userLocation, setUserLocation] = useState<{ country: string, city: string }>({ country: 'Detectando...', city: '' });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    likedTopics: [],
    dislikedTopics: [],
    preferredAssets: ['BTC', 'ETH', 'SPX', 'BVSP'] // Default
  });
  const [filterMode, setFilterMode] = useState<'all' | 'relevant' | 'critical'>('relevant');
  const [showFeedbackTip, setShowFeedbackTip] = useState(true);
  
  const { speak } = useSpeechAlert({ rate: 0.95, volume: 1.0 });
  const alertedIdsRef = useRef(new Set<string>());
  
  // 🌍 DETECTAR LOCALIZAÇÃO REAL DO USUÁRIO
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Tentar geolocalização do navegador primeiro
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // Usar reverse geocoding para pegar país/cidade
              try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
                const data = await response.json();
                setUserLocation({
                  country: data.address.country || 'Brasil',
                  city: data.address.city || data.address.town || data.address.village || ''
                });
                localStorage.setItem('neural_user_country', data.address.country || 'Brasil');
                localStorage.setItem('neural_user_city', data.address.city || '');
              } catch (error) {
                console.error('Reverse geocoding failed:', error);
                fallbackToIPLocation();
              }
            },
            (error) => {
              console.warn('Geolocation denied:', error);
              fallbackToIPLocation();
            }
          );
        } else {
          fallbackToIPLocation();
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        setUserLocation({ country: 'Brasil', city: 'São Paulo' });
      }
    };
    
    const fallbackToIPLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserLocation({
          country: data.country_name || 'Brasil',
          city: data.city || ''
        });
        localStorage.setItem('neural_user_country', data.country_name || 'Brasil');
        localStorage.setItem('neural_user_city', data.city || '');
      } catch (error) {
        console.error('IP location failed:', error);
        setUserLocation({ country: 'Brasil', city: 'São Paulo' });
      }
    };
    
    detectLocation();
    
    // Carregar preferências salvas
    const savedPrefs = localStorage.getItem('neural_user_news_preferences');
    if (savedPrefs) {
      try {
        setUserPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, []);
  
  // 🚨 MONITORAR MERCADO EM PÂNICO
  const checkMarketPanic = async () => {
    try {
      const alerts: MarketAlert[] = [];
      
      // Verificar BTC
      const btcResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      const btcData = await btcResponse.json();
      const btcChange = parseFloat(btcData.priceChangePercent);
      
      if (btcChange < -5) {
        const alertId = `btc-crash-${Math.floor(btcChange)}`;
        const alert: MarketAlert = {
          id: alertId,
          symbol: 'BTC',
          change: btcChange,
          message: `🚨 ALERTA CRÍTICO: Bitcoin despencando ${btcChange.toFixed(2)}% em 24h! Possível capitulação de mercado.`,
          severity: 'critical'
        };
        alerts.push(alert);
        
        // 🔊 FALAR SE NÃO FALOU AINDA
        if (!alertedIdsRef.current.has(alertId)) {
          alertedIdsRef.current.add(alertId);
          speak(`Alerta crítico! Bitcoin despencando ${Math.abs(btcChange).toFixed(1)} por cento em 24 horas. Possível capitulação de mercado.`, 'high');
          setCriticalPopup(alert);
          setTimeout(() => setCriticalPopup(null), 10000);
        }
      }
      
      // Verificar ETH
      const ethResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT');
      const ethData = await ethResponse.json();
      const ethChange = parseFloat(ethData.priceChangePercent);
      
      if (ethChange < -5) {
        const alertId = `eth-crash-${Math.floor(ethChange)}`;
        const alert: MarketAlert = {
          id: alertId,
          symbol: 'ETH',
          change: ethChange,
          message: `⚠️ Ethereum em queda forte: ${ethChange.toFixed(2)}% nas últimas 24h.`,
          severity: ethChange < -8 ? 'critical' : 'warning'
        };
        alerts.push(alert);
        
        // 🔊 FALAR SE CRÍTICO E NÃO FALOU AINDA
        if (ethChange < -7 && !alertedIdsRef.current.has(alertId)) {
          alertedIdsRef.current.add(alertId);
          speak(`Alerta! Ethereum em queda forte de ${Math.abs(ethChange).toFixed(1)} por cento nas últimas 24 horas.`, 'high');
          if (!criticalPopup) {
            setCriticalPopup(alert);
            setTimeout(() => setCriticalPopup(null), 8000);
          }
        }
      }
      
      setMarketAlerts(alerts);
    } catch (error) {
      console.error('Market panic check failed:', error);
    }
  };
  
  // 🤖 IA: CALCULAR RELEVÂNCIA DA NOTÍCIA
  const calculateRelevance = (item: any, userPrefs: UserPreferences): number => {
    let score = 50; // Base score
    
    const titleLower = (item.title || '').toLowerCase();
    const bodyLower = (item.body || item.description || '').toLowerCase();
    const fullText = titleLower + ' ' + bodyLower;
    
    // 🔥 BOOST: Ativos preferidos do usuário
    userPrefs.preferredAssets.forEach(asset => {
      if (fullText.includes(asset.toLowerCase())) {
        score += 20;
      }
    });
    
    // 🔥 BOOST: Tópicos que o usuário gostou no passado
    userPrefs.likedTopics.forEach(topic => {
      if (fullText.includes(topic.toLowerCase())) {
        score += 15;
      }
    });
    
    // 🔥 PENALTY: Tópicos que o usuário não gostou
    userPrefs.dislikedTopics.forEach(topic => {
      if (fullText.includes(topic.toLowerCase())) {
        score -= 25;
      }
    });
    
    // 🔥 BOOST: Notícias frescas (últimas 2 horas)
    const ageInHours = (Date.now() - item.timestamp) / (1000 * 60 * 60);
    if (ageInHours < 1) score += 30; // Última hora = SUPER relevante
    else if (ageInHours < 2) score += 15; // Últimas 2 horas
    else if (ageInHours > 24) score -= 40; // Mais de 24h = PENALIZAR FORTE
    
    // 🔥 BOOST: Palavras-chave críticas
    const criticalKeywords = ['breaking', 'urgent', 'alert', 'crash', 'surge', 'record', 'all-time', 'high', 'low'];
    criticalKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) score += 10;
    });
    
    // 🔥 BOOST: Localização do usuário
    if (userLocation.country && fullText.includes(userLocation.country.toLowerCase())) {
      score += 25;
    }
    if (userLocation.city && fullText.includes(userLocation.city.toLowerCase())) {
      score += 20;
    }
    
    return Math.max(0, Math.min(100, score)); // Clamp 0-100
  };
  
  // 🔥 FETCH: NOTÍCIAS DE MÚLTIPLAS FONTES (MAIS FRESCO!)
  const fetchNews = async () => {
    try {
      const allNews: NewsItem[] = [];
      
      // 🌐 FONTE 1: CryptoCompare (Crypto News)
      try {
        const ccResponse = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const ccData = await ccResponse.json();
        
        if (ccData.Data && ccData.Data.length > 0) {
          const ccNews = ccData.Data.map((item: any) => {
            const timestamp = item.published_on * 1000;
            const relevance = calculateRelevance({ ...item, timestamp }, userPreferences);
            
            return {
              id: `cc-${item.id}`,
              title: item.title,
              source: item.source_info?.name || 'CryptoNews',
              time: formatTimeAgo(timestamp),
              sentiment: analyzeSentiment(item.title),
              timestamp,
              url: item.url,
              isCritical: detectCritical(item.title),
              relevanceScore: relevance,
              assets: extractAssets(item.title),
              userFeedback: null
            };
          });
          allNews.push(...ccNews);
        }
      } catch (e) {
        console.error('CryptoCompare failed:', e);
      }
      
      // 🌐 FONTE 2: Finnhub (Market News - requires API key)
      // Note: Finnhub tem limite gratuito. Em produção, usar API key real.
      try {
        const fhResponse = await fetch('https://finnhub.io/api/v1/news?category=general&token=demo');
        const fhData = await fhResponse.json();
        
        if (fhData && Array.isArray(fhData)) {
          const fhNews = fhData.slice(0, 20).map((item: any) => {
            const timestamp = item.datetime * 1000;
            const relevance = calculateRelevance({ ...item, title: item.headline, timestamp }, userPreferences);
            
            return {
              id: `fh-${item.id}`,
              title: item.headline,
              source: item.source,
              time: formatTimeAgo(timestamp),
              sentiment: analyzeSentiment(item.headline),
              timestamp,
              url: item.url,
              isCritical: detectCritical(item.headline),
              relevanceScore: relevance,
              assets: extractAssets(item.headline),
              userFeedback: null
            };
          });
          allNews.push(...fhNews);
        }
      } catch (e) {
        console.error('Finnhub failed:', e);
      }
      
      // 🔥 FILTRAR: Apenas notícias das últimas 6 horas (FRESCAS!)
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
      const freshNews = allNews.filter(n => n.timestamp > sixHoursAgo);
      
      // 🤖 ORDENAR: Por relevância + timestamp
      const sortedNews = freshNews.sort((a, b) => {
        const scoreA = (a.relevanceScore || 50) + (Date.now() - a.timestamp) / (1000 * 60 * 60) * -5; // Penalizar idade
        const scoreB = (b.relevanceScore || 50) + (Date.now() - b.timestamp) / (1000 * 60 * 60) * -5;
        return scoreB - scoreA;
      });
      
      // 🔥 LIMITAR: Top 30 mais relevantes
      setNews(sortedNews.slice(0, 30));
      setLastUpdated(new Date());
      
      // 🔊 FALAR NOTÍCIA CRÍTICA SE HOUVER
      const criticalNews = sortedNews.filter(n => n.isCritical && n.relevanceScore && n.relevanceScore > 70);
      if (criticalNews.length > 0 && !alertedIdsRef.current.has(criticalNews[0].id)) {
        alertedIdsRef.current.add(criticalNews[0].id);
        speak(`Notícia crítica! ${criticalNews[0].title}`, 'high');
      }
      
    } catch (e) {
      console.error('News Fetch Error:', e);
    }
  };
  
  // 🎯 FEEDBACK DO USUÁRIO (APRENDIZADO)
  const handleFeedback = (newsId: string, feedback: 'like' | 'dislike') => {
    setNews(prev => prev.map(item => {
      if (item.id === newsId) {
        // Atualizar feedback
        const updatedItem = { ...item, userFeedback: feedback };
        
        // 🤖 APRENDER: Extrair tópicos e atualizar preferências
        const topics = item.title.toLowerCase().split(' ').filter(w => w.length > 4);
        
        setUserPreferences(prevPrefs => {
          const newPrefs = { ...prevPrefs };
          
          if (feedback === 'like') {
            // Adicionar tópicos aos "liked"
            topics.forEach(topic => {
              if (!newPrefs.likedTopics.includes(topic)) {
                newPrefs.likedTopics.push(topic);
              }
              // Remover de "disliked" se estava lá
              newPrefs.dislikedTopics = newPrefs.dislikedTopics.filter(t => t !== topic);
            });
            
            // Adicionar ativos mencionados aos preferidos
            if (item.assets) {
              item.assets.forEach(asset => {
                if (!newPrefs.preferredAssets.includes(asset)) {
                  newPrefs.preferredAssets.push(asset);
                }
              });
            }
          } else {
            // Adicionar tópicos aos "disliked"
            topics.forEach(topic => {
              if (!newPrefs.dislikedTopics.includes(topic)) {
                newPrefs.dislikedTopics.push(topic);
              }
              // Remover de "liked" se estava lá
              newPrefs.likedTopics = newPrefs.likedTopics.filter(t => t !== topic);
            });
          }
          
          // Salvar preferências
          localStorage.setItem('neural_user_news_preferences', JSON.stringify(newPrefs));
          
          return newPrefs;
        });
        
        return updatedItem;
      }
      return item;
    }));
    
    // 🔊 CONFIRMAÇÃO POR VOZ
    if (feedback === 'like') {
      speak('Entendido! Vou mostrar mais notícias como essa.', 'normal');
    } else {
      speak('Entendido! Vou evitar notícias como essa.', 'normal');
    }
  };
  
  // 🔍 EXTRAIR ATIVOS MENCIONADOS
  const extractAssets = (text: string): string[] => {
    const assets: string[] = [];
    const assetKeywords = ['BTC', 'Bitcoin', 'ETH', 'Ethereum', 'SOL', 'Solana', 'XRP', 'Ripple', 'ADA', 'Cardano', 'DOGE', 'Dogecoin', 'SPX', 'S&P', 'NASDAQ', 'DOW', 'BVSP', 'Ibovespa'];
    
    assetKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        // Normalizar para ticker
        if (keyword.includes('Bitcoin')) assets.push('BTC');
        else if (keyword.includes('Ethereum')) assets.push('ETH');
        else if (keyword.includes('Solana')) assets.push('SOL');
        else if (keyword.includes('Ripple')) assets.push('XRP');
        else if (keyword.includes('Cardano')) assets.push('ADA');
        else if (keyword.includes('Dogecoin')) assets.push('DOGE');
        else if (keyword.includes('S&P') || keyword.includes('SPX')) assets.push('SPX');
        else if (keyword.includes('Ibovespa') || keyword.includes('BVSP')) assets.push('BVSP');
        else assets.push(keyword);
      }
    });
    
    return [...new Set(assets)]; // Remove duplicates
  };
  
  // Simple heuristic for sentiment color
  const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
      const lower = text.toLowerCase();
      if (lower.includes('sobe') || lower.includes('high') || lower.includes('rally') || lower.includes('bull') || lower.includes('aprova') || lower.includes('lucro') || lower.includes('surge') || lower.includes('gain') || lower.includes('up') || lower.includes('soar')) return 'positive';
      if (lower.includes('cai') || lower.includes('low') || lower.includes('drop') || lower.includes('bear') || lower.includes('ban') || lower.includes('perda') || lower.includes('crash') || lower.includes('plunge') || lower.includes('collapse') || lower.includes('down') || lower.includes('fall')) return 'negative';
      return 'neutral';
  };
  
  const detectCritical = (text: string): boolean => {
    const lower = text.toLowerCase();
    return lower.includes('crash') || 
           lower.includes('panic') ||
           lower.includes('collapse') ||
           lower.includes('plunge') ||
           lower.includes('breaking') ||
           lower.includes('urgent') ||
           lower.includes('alert');
  };

  // Initial Load & Refresh
  useEffect(() => {
    fetchNews();
    checkMarketPanic();
    
    const newsInterval = setInterval(fetchNews, 30000); // 🔥 30 SEGUNDOS!
    const panicInterval = setInterval(checkMarketPanic, 60000); // 1 min
    
    return () => {
      clearInterval(newsInterval);
      clearInterval(panicInterval);
    };
  }, [userPreferences]); // Re-fetch quando preferências mudarem

  // Timer for Next Update Display
  useEffect(() => {
    const timer = setInterval(() => {
      setNextUpdateIn(prev => {
        if (prev <= 1) {
             return 30; // 🔥 30 SEGUNDOS
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };
  
  // 🔥 FILTRAR NOTÍCIAS POR MODO
  const filteredNews = news.filter(item => {
    if (filterMode === 'critical') return item.isCritical;
    if (filterMode === 'relevant') return (item.relevanceScore || 0) >= 60;
    return true; // 'all'
  });

  return (
    <div className="bg-[#050505] border border-white/5 rounded-xl h-full flex flex-col relative overflow-hidden group">
      {/* 🚨 POPUP CRÍTICO FULLSCREEN */}
      <AnimatePresence>
        {criticalPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setCriticalPopup(null)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-red-900 to-red-950 border-4 border-red-500 rounded-3xl p-8 max-w-2xl mx-4 shadow-[0_0_100px_rgba(239,68,68,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-red-500/20 rounded-2xl border-2 border-red-400">
                  <AlertTriangle className="w-12 h-12 text-red-300 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Volume2 className="w-6 h-6 text-red-300 animate-bounce" />
                    <h2 className="text-3xl font-black text-red-100 uppercase tracking-wider">
                      ALERTA CRÍTICO!
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-black text-white">{criticalPopup.symbol}</span>
                    <span className="text-5xl font-black text-red-300">{criticalPopup.change.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-xl p-6 mb-6 border border-red-500/30">
                <p className="text-xl text-red-100 leading-relaxed font-medium">
                  {criticalPopup.message}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-300">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider">Alerta em Tempo Real</span>
                </div>
                <button
                  onClick={() => setCriticalPopup(null)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors uppercase tracking-wider"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#080808]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {localStorage.getItem('neural_user_region') === 'BR' ? 'Notícias (Brasil/Global)' : 
             localStorage.getItem('neural_user_region') === 'PT' ? 'Notícias (Portugal/Global)' : 
             'Global Market News'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" />
                {Math.floor(nextUpdateIn / 60)}:{(nextUpdateIn % 60).toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Live</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* 🚨 ALERTAS CRÍTICOS DE MERCADO */}
        {marketAlerts.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-red-900/40 to-red-800/40 border-b border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                🚨 ALERTAS CRÍTICOS DE MERCADO
              </span>
            </div>
            {marketAlerts.map(alert => (
              <div key={alert.id} className="mt-2 p-2 bg-red-950/50 rounded border border-red-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-400">{alert.symbol}</span>
                  <span className={`text-xs font-mono font-bold ${
                    alert.severity === 'critical' ? 'text-red-300' : 'text-orange-300'
                  }`}>
                    {alert.change.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-red-200 mt-1 leading-relaxed">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <AnimatePresence initial={false}>
            {filteredNews.map((item) => (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0, x: -20 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => item.url && window.open(item.url, '_blank')}
                className={`border-b border-white/5 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group/item relative overflow-hidden ${
                  item.isCritical ? 'bg-red-950/20' : ''
                }`}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                    item.sentiment === 'positive' ? 'bg-emerald-500' : 
                    item.sentiment === 'negative' ? 'bg-rose-500' : 'bg-slate-700'
                }`} />

                <div className="flex justify-between items-start gap-3 mb-1">
                    <div className="flex items-start gap-2">
                      {item.isCritical && <Zap className="w-3 h-3 text-red-400 shrink-0 mt-0.5 animate-pulse" />}
                      <h3 className={`text-xs font-bold leading-relaxed ${
                        item.isCritical ? 'text-red-200' : 'text-slate-200 group-hover/item:text-white'
                      }`}>
                          {item.title}
                      </h3>
                    </div>
                    {item.sentiment === 'positive' && <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />}
                    {item.sentiment === 'negative' && <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{item.source}</span>
                        <span className="text-[10px] text-slate-700">•</span>
                        <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                        {item.relevanceScore && (
                          <div className="flex items-center gap-1 ml-2">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span className="text-[9px] font-mono text-amber-400">{item.relevanceScore.toFixed(0)}%</span>
                          </div>
                        )}
                        {item.assets && item.assets.length > 0 && (
                          <div className="flex items-center gap-1 ml-2">
                            {item.assets.map(asset => (
                              <span key={asset} className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1 rounded">
                                {asset}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* 🔥 FEEDBACK BUTTONS */}
                      {item.userFeedback === null ? (
                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleFeedback(item.id, 'like'); }}
                            className="p-1 hover:bg-emerald-500/20 rounded transition-colors"
                            title="Gostei"
                          >
                            <ThumbsUp className="w-3 h-3 text-slate-500 hover:text-emerald-400" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleFeedback(item.id, 'dislike'); }}
                            className="p-1 hover:bg-rose-500/20 rounded transition-colors"
                            title="Não gostei"
                          >
                            <ThumbsDown className="w-3 h-3 text-slate-500 hover:text-rose-400" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {item.userFeedback === 'like' && <ThumbsUp className="w-3 h-3 text-emerald-500" />}
                          {item.userFeedback === 'dislike' && <ThumbsDown className="w-3 h-3 text-rose-500" />}
                        </div>
                      )}
                      <ExternalLink className="w-3 h-3 text-slate-700 group-hover/item:text-blue-400 transition-colors" />
                    </div>
                </div>
            </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <div className="p-2 border-t border-white/5 bg-[#080808] text-center">
        <p className="text-[9px] text-slate-600 uppercase tracking-widest">
            Última Sincronização: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}