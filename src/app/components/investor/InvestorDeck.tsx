import React, { useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { Download, TrendingUp, Users, DollarSign, Zap, Target, BarChart2, Globe, Shield, Rocket } from 'lucide-react';
import { NeuralLogo } from '../NeuralLogo';

// ─────────────────────────────────────────────
// MODELO FINANCEIRO — 60 meses (Mai/2026–Abr/2031)
// ─────────────────────────────────────────────

const MESES_LABELS = [
  'Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26',
  'Jan/27','Fev/27','Mar/27','Abr/27','Mai/27','Jun/27','Jul/27','Ago/27',
  'Set/27','Out/27','Nov/27','Dez/27','Jan/28','Fev/28','Mar/28','Abr/28',
  'Mai/28','Jun/28','Jul/28','Ago/28','Set/28','Out/28','Nov/28','Dez/28',
  'Jan/29','Fev/29','Mar/29','Abr/29','Mai/29','Jun/29','Jul/29','Ago/29',
  'Set/29','Out/29','Nov/29','Dez/29','Jan/30','Fev/30','Mar/30','Abr/30',
  'Mai/30','Jun/30','Jul/30','Ago/30','Set/30','Out/30','Nov/30','Dez/30',
  'Jan/31','Fev/31','Mar/31','Abr/31',
];

const USUARIOS_PAGANTES = [
   50,  90, 150, 230, 330, 450,  570,  700,  820,  920,  970, 1050,
 1130,1220,1340,1490,1660,1860, 2090, 2350, 2640, 2870, 3080, 3300,
 3650,4060,4540,5100,5740,6490, 7340, 8290, 9350,9870,10400,10900,
11600,12400,13300,14300,15400,16700,18200,19900,21800,23900,25000,25800,
27300,29000,31000,33300,35800,38500,41500,44800,48400,52300,56500,61000,
];

// ARPU blended: 50%×R$199 + 35%×R$299 + 15%×R$1.497 = R$99,5 + R$104,65 + R$224,55 = R$428,7 → R$430
const ARPU = 430; // R$ blended médio (somente usuários pagantes)
const CHURN_MENSAL = [
  7.0,6.8,6.5,6.2,6.0,5.8,5.6,5.4,5.2,5.0,4.9,4.8,
  4.7,4.6,4.5,4.4,4.3,4.2,4.1,4.0,3.9,3.8,3.7,3.6,
  3.5,3.5,3.4,3.4,3.3,3.3,3.2,3.2,3.1,3.1,3.0,3.0,
  3.0,2.9,2.9,2.9,2.8,2.8,2.8,2.7,2.7,2.7,2.6,2.6,
  2.6,2.5,2.5,2.5,2.5,2.4,2.4,2.4,2.3,2.3,2.3,2.2,
];

const data60 = MESES_LABELS.map((mes, i) => {
  const usuarios = USUARIOS_PAGANTES[i];
  const mrr = usuarios * ARPU;
  const churn = CHURN_MENSAL[i];
  const ltv = Math.round(ARPU / (churn / 100));
  const cac = Math.round(250 * Math.pow(0.986, i)); // CAC decai com escala
  return { mes, usuarios, mrr: Math.round(mrr / 1000), mrrBruto: mrr, churn, ltv, cac, ltvCac: +(ltv / cac).toFixed(1) };
});

// Totais anuais
function somaAno(inicio: number, fim: number) {
  return data60.slice(inicio, fim).reduce((s, d) => s + d.mrrBruto, 0);
}
// Receita real calculada via somaAno() · ARPU R$430 blended
// Usuários × ARPU mensal acumulado por período:
// Ano 1 rec ≈ R$2,72M | Ano 2 ≈ R$10,76M | Ano 3 ≈ R$36,86M | Ano 4 ≈ R$85,27M | Ano 5 ≈ R$214,7M
const ANOS = [
  { ano: 'Ano 1\n(2026)', usuarios: 1050,  mrr:   451_500, arr:   5_418_000, rec: somaAno(0, 12),  custo:  2_900_000, ebitda:   -180_000, margem: -7  },
  { ano: 'Ano 2\n(2027)', usuarios: 3300,  mrr: 1_419_000, arr:  17_028_000, rec: somaAno(12, 24), custo:  6_500_000, ebitda:  4_260_000, margem: 40 },
  { ano: 'Ano 3\n(2028)', usuarios: 10900, mrr: 4_687_000, arr:  56_244_000, rec: somaAno(24, 36), custo: 12_000_000, ebitda: 24_860_000, margem: 67 },
  { ano: 'Ano 4\n(2029)', usuarios: 25800, mrr:11_094_000, arr: 133_128_000, rec: somaAno(36, 48), custo: 24_000_000, ebitda: 61_270_000, margem: 72 },
  { ano: 'Ano 5\n(2030)', usuarios: 61000, mrr:26_230_000, arr: 314_760_000, rec: somaAno(48, 60), custo: 50_000_000, ebitda:164_740_000, margem: 77 },
];

const PLANOS = [
  { nome: 'Free',               preco: 0,    mix:  0, cor: '#6b7280', mixLabel: 'Funil gratuito' },
  { nome: 'Node Pro',           preco: 199,  mix: 50, cor: '#06b6d4', mixLabel: '50% da receita' },
  { nome: 'Node Institucional', preco: 299,  mix: 35, cor: '#10b981', mixLabel: '35% da receita' },
  { nome: 'Sindicate Core',     preco: 1497, mix: 15, cor: '#8b5cf6', mixLabel: '15% da receita — sob medida' },
];

const USO_RECURSOS = [
  { item: 'Marketing & Crescimento', pct: 40, cor: '#10b981' },
  { item: 'Engenharia & Produto',    pct: 30, cor: '#06b6d4' },
  { item: 'Customer Success & Ops',  pct: 20, cor: '#8b5cf6' },
  { item: 'G&A & Legal',             pct: 10, cor: '#f59e0b' },
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `R$ ${(n/1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `R$ ${(n/1_000).toFixed(0)}K`      :
                   `R$ ${n.toLocaleString('pt-BR')}`;

const fmtK = (n: number) =>
  n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : `${n}`;

// Tooltip customizado
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value?.toLocaleString('pt-BR')}</strong></p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
export function InvestorDeck() {
  const deckRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-page { page-break-after: always; break-after: page; }
          .print-avoid { page-break-inside: avoid; break-inside: avoid; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4 landscape; margin: 12mm; }
        }
      `}</style>

      <div ref={deckRef} className="bg-black min-h-screen text-white font-sans">

        {/* BOTÃO DOWNLOAD — FIXO */}
        <div className="no-print fixed top-4 right-6 z-50">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="max-w-[1200px] mx-auto px-8 py-10 space-y-16">

          {/* ══════════════════════════════════════════
              CAPA
          ══════════════════════════════════════════ */}
          <section className="print-page print-avoid min-h-[500px] flex flex-col justify-between border border-emerald-500/20 rounded-3xl p-12 bg-gradient-to-br from-zinc-950 via-black to-emerald-950/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative">
              <NeuralLogo className="!w-[160px]" />
            </div>
            <div className="relative">
              <p className="text-emerald-400 text-sm font-bold uppercase tracking-[0.3em] mb-4">Documento Confidencial · Projeções para Investidores</p>
              <h1 className="text-6xl font-black tracking-tight text-white mb-3">
                Neural Day Trader
              </h1>
              <p className="text-2xl text-zinc-400 font-light mb-10">
                Plataforma de Trading com Inteligência Artificial
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'ARR Projetado Ano 5', val: 'R$ 315M' },
                  { label: 'Usuários Pagantes Ano 5', val: '61.000' },
                  { label: 'EBITDA Margin Ano 5', val: '77%' },
                  { label: 'LTV/CAC Médio', val: '40×' },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{m.label}</p>
                    <p className="text-3xl font-bold text-emerald-400">{m.val}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-zinc-600">Abril 2026 · Versão 1.0</p>
              <p className="text-xs text-zinc-600">Confidencial — Não distribuir sem autorização</p>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              SUMÁRIO EXECUTIVO
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<Zap/>} title="Sumário Executivo" color="emerald" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {[
                {
                  title: 'O Problema',
                  color: 'border-red-500/30 bg-red-500/5',
                  accent: 'text-red-400',
                  items: [
                    '95% dos traders de varejo perdem dinheiro por falta de disciplina e ferramentas',
                    'Plataformas profissionais custam R$2.000–R$10.000/mês — inacessíveis ao varejo',
                    'Análise manual é lenta, emocional e inconsistente',
                    'Mercado carece de IA especializada em Day Trading com dados BR+Global',
                  ]
                },
                {
                  title: 'Nossa Solução',
                  color: 'border-emerald-500/30 bg-emerald-500/5',
                  accent: 'text-emerald-400',
                  items: [
                    'IA Neural autônoma que analisa, decide e executa operações 24/7',
                    'Preços democratizados: a partir de R$0 (free) e R$199/mês — 10–50× mais barato',
                    'Integração nativa MetaTrader 5 via MetaAPI com execução real',
                    'Análise preditiva, voice AI e alertas em tempo real',
                  ]
                },
                {
                  title: 'Por Que Agora',
                  color: 'border-cyan-500/30 bg-cyan-500/5',
                  accent: 'text-cyan-400',
                  items: [
                    'B3 atingiu 5,4M investidores em 2025 — crescimento de 340% em 5 anos',
                    'Custo de LLMs caiu 97% em 2 anos — janela de criação favorável',
                    'Regulamentação de fintechs mais madura no Brasil',
                    'Timing: primeiros 3 anos definem o market leader da categoria',
                  ]
                },
              ].map(c => (
                <div key={c.title} className={`border ${c.color} rounded-2xl p-6 print-avoid`}>
                  <h3 className={`font-bold text-lg mb-4 ${c.accent}`}>{c.title}</h3>
                  <ul className="space-y-3">
                    {c.items.map((it, i) => (
                      <li key={i} className="flex gap-2 text-sm text-zinc-300">
                        <span className={`${c.accent} font-bold shrink-0`}>→</span>{it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════
              MERCADO
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<Globe/>} title="Oportunidade de Mercado" color="cyan" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-4">
                {[
                  { label: 'TAM — Mercado Total Endereçável', val: 'R$ 12B', sub: 'Plataformas de trading + fintechs de investimento no Brasil', cor: 'border-cyan-500/40 bg-cyan-500/5', txt: 'text-cyan-400' },
                  { label: 'SAM — Mercado Acessível Endereçável', val: 'R$ 2,4B', sub: 'Traders ativos de varejo que buscam ferramentas profissionais', cor: 'border-emerald-500/40 bg-emerald-500/5', txt: 'text-emerald-400' },
                  { label: 'SOM — Mercado Obtível em 5 Anos', val: 'R$ 315M', sub: '~13% do SAM — 61.000 usuários pagantes × R$430 ARPU × 12', cor: 'border-purple-500/40 bg-purple-500/5', txt: 'text-purple-400' },
                ].map(m => (
                  <div key={m.label} className={`border ${m.cor} rounded-xl p-5 print-avoid`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">{m.label}</p>
                        <p className={`text-3xl font-black mt-1 ${m.txt}`}>{m.val}</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">{m.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 print-avoid">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Dados do Mercado Brasileiro</p>
                <div className="space-y-4">
                  {[
                    { stat: '5,4M', desc: 'Investidores ativos na B3 (2025)' },
                    { stat: '340%', desc: 'Crescimento de traders em 5 anos' },
                    { stat: '2,8M', desc: 'Day Traders ativos mensalmente' },
                    { stat: 'R$89B', desc: 'Volume médio diário B3 (2025)' },
                    { stat: '12%', desc: 'CAGR do segmento fintech BR' },
                    { stat: '4,7M', desc: 'Contas em corretoras digitais' },
                  ].map(s => (
                    <div key={s.stat} className="flex items-center gap-4">
                      <span className="text-2xl font-black text-emerald-400 w-20 shrink-0">{s.stat}</span>
                      <span className="text-sm text-zinc-400">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              MODELO DE NEGÓCIO & PRICING
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<DollarSign/>} title="Modelo de Negócio & Precificação" color="purple" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {PLANOS.map(p => (
                <div key={p.nome} className="border border-white/10 rounded-2xl p-5 bg-zinc-950 print-avoid">
                  <div className="h-2 rounded-full mb-4" style={{ backgroundColor: p.cor }} />
                  <p className="font-bold text-white text-lg">{p.nome}</p>
                  <p className="text-3xl font-black mt-2" style={{ color: p.cor }}>
                    {p.preco === 0 ? 'Grátis' : `R$ ${p.preco.toLocaleString('pt-BR')}`}
                    {p.preco > 0 && <span className="text-sm font-normal text-zinc-500">/mês</span>}
                  </p>
                  <p className="text-xs text-zinc-500 mt-3">{p.mix === 0 ? 'Modelo' : 'Mix de receita'}</p>
                  <p className="text-sm font-bold" style={{ color: p.cor }}>{p.mixLabel}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Kpi label="ARPU Blended" val="R$ 430/mês" sub="50%×Pro + 35%×Inst. + 15%×Sindicate" cor="text-emerald-400" />
              <Kpi label="Receita Recorrente" val="100% MRR" sub="Modelo SaaS puro — zero variável" cor="text-cyan-400" />
              <Kpi label="Margem Bruta" val="82%" sub="Software — infraestrutura escalável" cor="text-purple-400" />
            </div>
            <div className="mt-6 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 print-avoid">
              <p className="text-sm text-emerald-400 font-bold mb-2">Por que o modelo SaaS recorrente é ideal:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-400">
                {['Receita previsível e composta', 'CAC se diluí com baixo churn', 'Upgrade orgânico entre planos', 'Base instalada = barreira de entrada'].map(i => (
                  <div key={i} className="flex gap-2"><span className="text-emerald-500">✓</span>{i}</div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              PROJEÇÃO DE USUÁRIOS — 60 meses
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<Users/>} title="Projeção de Usuários Pagantes — 60 Meses" color="cyan" />
            <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 print-avoid">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={data60} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 9 }}
                    ticks={['Mai/26','Abr/27','Abr/28','Abr/29','Abr/30','Abr/31']}/>
                  <YAxis tickFormatter={fmtK} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<DarkTooltip/>} />
                  <Area type="monotone" dataKey="usuarios" name="Usuários Pagantes"
                    stroke="#10b981" strokeWidth={2} fill="url(#gradUsers)" />
                  {/* Marcadores de ano */}
                  {[11,23,35,47,59].map(i => (
                    <Line key={i} type="monotone" dataKey={() => data60[i]?.usuarios}
                      stroke="transparent" dot={false} />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
              {/* Tabela resumo anual */}
              <div className="mt-6 grid grid-cols-5 gap-3">
                {ANOS.map((a, i) => (
                  <div key={i} className="text-center bg-black/40 rounded-xl p-3 print-avoid">
                    <p className="text-xs text-zinc-500 whitespace-pre-line leading-tight">{a.ano}</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">{a.usuarios.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">usuários pagantes</p>
                    <p className="text-xs text-cyan-400 mt-1 font-bold">{fmt(a.mrr)}/mês</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              PROJEÇÕES FINANCEIRAS
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<BarChart2/>} title="Projeções Financeiras — MRR & ARR" color="emerald" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* MRR mensal */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 print-avoid">
                <p className="text-sm font-bold text-zinc-400 mb-4">MRR Mensal (R$ mil)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data60} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradMRR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 8 }}
                      ticks={['Mai/26','Abr/27','Abr/28','Abr/29','Abr/30','Abr/31']}/>
                    <YAxis tickFormatter={v => `${v}K`} tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <Tooltip content={<DarkTooltip/>} />
                    <Area type="monotone" dataKey="mrr" name="MRR (R$ mil)"
                      stroke="#06b6d4" strokeWidth={2} fill="url(#gradMRR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* ARR + EBITDA por ano */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 print-avoid">
                <p className="text-sm font-bold text-zinc-400 mb-4">ARR vs EBITDA por Ano (R$)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ANOS} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="ano" tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <YAxis tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : `${(v/1e3).toFixed(0)}K`}
                      tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <Tooltip content={<DarkTooltip/>} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                    <Bar dataKey="arr" name="ARR (R$)" fill="#10b981" radius={[3,3,0,0]} />
                    <Bar dataKey="ebitda" name="EBITDA (R$)" fill="#8b5cf6" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Tabela P&L */}
            <div className="mt-6 overflow-x-auto print-avoid">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Indicador</th>
                    {ANOS.map(a => <th key={a.ano} className="text-right py-3 px-4 text-zinc-500 font-medium whitespace-pre-line">{a.ano}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { row: 'Usuários Pagantes (fim)', vals: ANOS.map(a => a.usuarios.toLocaleString('pt-BR')), color: 'text-emerald-400' },
                    { row: 'MRR (fim de ano)', vals: ANOS.map(a => fmt(a.mrr)), color: 'text-cyan-400' },
                    { row: 'ARR', vals: ANOS.map(a => fmt(a.arr)), color: 'text-white font-semibold' },
                    { row: 'Receita Total no Ano', vals: ANOS.map(a => fmt(a.rec)), color: 'text-white' },
                    { row: 'Custos Operacionais', vals: ANOS.map(a => `(${fmt(a.custo)})`), color: 'text-red-400' },
                    { row: 'EBITDA', vals: ANOS.map(a => a.ebitda < 0 ? `(${fmt(Math.abs(a.ebitda))})` : fmt(a.ebitda)), color: 'text-purple-400' },
                    { row: 'Margem EBITDA', vals: ANOS.map(a => `${a.margem}%`), color: a => a.margem < 0 ? 'text-red-400' : 'text-emerald-400' },
                  ].map((r, ri) => (
                    <tr key={ri} className={`border-b border-zinc-900 ${ri % 2 === 0 ? 'bg-zinc-950/50' : ''}`}>
                      <td className="py-3 px-4 text-zinc-400">{r.row}</td>
                      {ANOS.map((a, i) => (
                        <td key={i} className={`py-3 px-4 text-right font-mono ${
                          typeof r.color === 'function' ? r.color(a) : r.color
                        }`}>
                          {r.vals[i]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              INDICADORES UNITÁRIOS
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<Target/>} title="Indicadores Unitários de Negócio" color="purple" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'LTV Médio (Y1 → Y5)', val: 'R$7.800 → R$19.500', sub: 'Lifetime Value = ARPU ÷ Churn', cor: 'text-emerald-400' },
                { label: 'CAC Médio (Y1 → Y5)',  val: 'R$250 → R$115',     sub: 'Custo de Aquisição de Cliente', cor: 'text-red-400' },
                { label: 'LTV/CAC (Y1 → Y5)',    val: '31× → 170×',        sub: 'Meta SaaS saudável: >3×',      cor: 'text-cyan-400' },
                { label: 'Payback Period',         val: '7 → 3 meses',      sub: 'Tempo para recuperar CAC',      cor: 'text-purple-400' },
                { label: 'Churn Mensal (Y1 → Y5)','val': '5,5% → 2,2%',    sub: 'Taxa de cancelamento mensal',   cor: 'text-amber-400' },
                { label: 'Margem Bruta',           val: '82%',               sub: 'Software puro — infra escalável', cor: 'text-emerald-400' },
                { label: 'NRR (Net Revenue Ret.)', val: '>115%',             sub: 'Expansão > Churn (upsell)',      cor: 'text-cyan-400' },
                { label: 'Breakeven',              val: 'Mês 12–13',         sub: '~Mai–Jun/2027 — EBITDA positivo', cor: 'text-purple-400' },
              ].map(m => (
                <Kpi key={m.label} label={m.label} val={m.val} sub={m.sub} cor={m.cor} />
              ))}
            </div>
            {/* LTV/CAC chart */}
            <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 print-avoid">
              <p className="text-sm font-bold text-zinc-400 mb-4">Evolução LTV/CAC e Churn Mensal ao longo de 60 meses</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={data60.filter((_, i) => i % 3 === 0)} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 9 }}/>
                  <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<DarkTooltip/>} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                  <Line yAxisId="left" type="monotone" dataKey="ltvCac" name="LTV/CAC"
                    stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="churn" name="Churn (%)"
                    stroke="#ef4444" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              CAPTAÇÃO & USO DOS RECURSOS
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<TrendingUp/>} title="Captação de Investimento & Uso dos Recursos" color="emerald" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-4">
                {[
                  { label: 'Rodada', val: 'Série Semente (Seed)',   cor: 'text-emerald-400' },
                  { label: 'Captação Alvo',      val: 'R$ 2,5 Milhões',      cor: 'text-white' },
                  { label: 'Valuation Pré-Money', val: 'R$ 12 Milhões',      cor: 'text-cyan-400' },
                  { label: 'Participação Ofertada','val': '~17%',             cor: 'text-purple-400' },
                  { label: 'Múltiplo de Entrada',  val: '0,7× ARR Y2 (R$17M) → Série A', cor: 'text-amber-400' },
                  { label: 'Runway esperado',       val: '18 meses → breakeven', cor: 'text-white' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between py-3 border-b border-zinc-800 print-avoid">
                    <span className="text-zinc-500 text-sm">{m.label}</span>
                    <span className={`font-bold text-sm ${m.cor}`}>{m.val}</span>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl print-avoid">
                  <p className="text-xs text-emerald-400 font-bold mb-2">Projeção de Retorno para Investidor</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Exit Y3 (5× ARR)', val: 'R$281M valuation → 19× retorno' },
                      { label: 'Exit Y5 (8× ARR)', val: 'R$2,5B valuation → 167× retorno' },
                    ].map(e => (
                      <div key={e.label} className="text-xs">
                        <p className="text-zinc-500">{e.label}</p>
                        <p className="text-white font-bold">{e.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 print-avoid">
                <p className="text-sm font-bold text-zinc-400 mb-4">Alocação dos Recursos (R$ 2,5M)</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={USO_RECURSOS} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="pct" nameKey="item" paddingAngle={3}>
                      {USO_RECURSOS.map((u, i) => <Cell key={i} fill={u.cor} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip/>} formatter={(v: any) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {USO_RECURSOS.map(u => (
                    <div key={u.item} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.cor }} />
                        <span className="text-xs text-zinc-400">{u.item}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{u.pct}% · {fmt(25_000_00 * u.pct / 100 / 10)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              ROADMAP & MILESTONES
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<Rocket/>} title="Roadmap & Milestones" color="cyan" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              {[
                {
                  ano: 'Ano 1 · 2026',
                  cor: 'border-emerald-500/40', acc: 'bg-emerald-500 text-black',
                  itens: [
                    'Lançamento plataforma (Mai/26)',
                    '1.000 usuários pagantes',
                    'MetaTrader 5 integrado',
                    'App mobile beta',
                    'Breakeven próximo (Dez/26)',
                  ]
                },
                {
                  ano: 'Ano 2 · 2027',
                  cor: 'border-cyan-500/40', acc: 'bg-cyan-500 text-black',
                  itens: [
                    'Breakeven (Fev/27)',
                    '3.500 usuários pagantes',
                    'App mobile full',
                    'Social Trading',
                    'Primeiros R$1M ARR',
                  ]
                },
                {
                  ano: 'Ano 3 · 2028',
                  cor: 'border-purple-500/40', acc: 'bg-purple-500 text-white',
                  itens: [
                    '10.000 usuários pagantes',
                    'Expansão LATAM (Arg, Col)',
                    'Módulo institucional',
                    'Série A (R$20M)',
                    'R$56M ARR',
                  ]
                },
                {
                  ano: 'Ano 4 · 2029',
                  cor: 'border-amber-500/40', acc: 'bg-amber-500 text-black',
                  itens: [
                    '25.000 usuários pagantes',
                    'México + Chile',
                    'API pública b2b',
                    'Certificação CVM',
                    'R$133M ARR',
                  ]
                },
                {
                  ano: 'Ano 5 · 2030',
                  cor: 'border-red-500/40', acc: 'bg-red-500 text-white',
                  itens: [
                    '61.000 usuários pagantes',
                    'Europa e EUA',
                    'IPO / Série C',
                    '77% Margem EBITDA',
                    'R$315M ARR',
                  ]
                },
              ].map((y, i) => (
                <div key={i} className={`border ${y.cor} rounded-2xl p-4 print-avoid`}>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-3 ${y.acc}`}>{y.ano}</span>
                  <ul className="space-y-2">
                    {y.itens.map((it, j) => (
                      <li key={j} className="text-xs text-zinc-400 flex gap-2">
                        <span className="text-zinc-600 shrink-0">◆</span>{it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════
              DIFERENCIAIS COMPETITIVOS
          ══════════════════════════════════════════ */}
          <section className="print-page">
            <SectionHeader icon={<Shield/>} title="Vantagens Competitivas & Tecnologia" color="purple" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {[
                { title: 'IA Neural Proprietária', desc: 'Modelo de decision-making com RSI, MACD, Fibonacci, volume analysis e pattern recognition em tempo real.' },
                { title: 'Integração MT5 Nativa', desc: 'Conexão direta via MetaAPI com execução real na corretora Infinox — spread competitivo, zero latência artificial.' },
                { title: 'Voice AI Trading', desc: 'Sistema TTS/STT Google Neural2 para análise por voz em pt-BR — diferencial único no mercado brasileiro.' },
                { title: 'Gestão de Risco Neural', desc: 'Stop Loss dinâmico, drawdown guardian, safe mode automático e hedge protection — capital sempre protegido.' },
                { title: 'Multi-Ativo Real-Time', desc: '300+ ativos: cripto (Binance WS), forex, índices globais, commodities — dados reais ao vivo via múltiplas fontes.' },
                { title: 'Data Moat', desc: 'Cada operação enriquece o modelo — efeito flywheel: mais usuários → mais dados → IA mais precisa → mais usuários.' },
              ].map(d => (
                <div key={d.title} className="border border-white/10 bg-zinc-950 rounded-xl p-5 print-avoid">
                  <p className="font-bold text-white mb-2">{d.title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* RODAPÉ */}
          <footer className="border-t border-zinc-800 pt-8 pb-4 flex items-center justify-between print-avoid">
            <div className="flex items-center gap-3">
              <NeuralLogo className="!w-[80px]" />
              <span className="text-zinc-600 text-xs">Neural Day Trader © 2026</span>
            </div>
            <p className="text-xs text-zinc-600">Documento confidencial — projeções financeiras baseadas em premissas de mercado. Resultados reais podem variar.</p>
          </footer>

        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    cyan:    'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    purple:  'text-purple-400 border-purple-500/30 bg-purple-500/10',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl border ${colors[color]}`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${colors[color].split(' ')[0]}` })}
      </div>
      <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
    </div>
  );
}

function Kpi({ label, val, sub, cor }: { label: string; val: string; sub: string; cor: string }) {
  return (
    <div className="border border-white/10 bg-zinc-950 rounded-xl p-4 print-avoid">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 leading-tight">{label}</p>
      <p className={`text-xl font-black ${cor}`}>{val}</p>
      <p className="text-xs text-zinc-600 mt-1">{sub}</p>
    </div>
  );
}
