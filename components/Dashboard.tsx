'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  Landmark, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  MoreHorizontal,
  RotateCcw
} from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DashboardProps {
  onSetIncome: () => void;
  onExchange: (asset: any) => void;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onSetIncome, onExchange, onNavigate }: DashboardProps) {
  const { transactions, assets, resetData, monthlyIncome, fixedExpenses } = useFinanceStore();

  const totalIncomeTransactions = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalTransactionExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFixedExpenses = fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0);
  
  const totalExpense = totalTransactionExpense + totalFixedExpenses;

  const effectiveIncome = monthlyIncome + totalIncomeTransactions;
  const totalBalance = effectiveIncome - totalExpense;
  
  const totalAssetsValue = assets.reduce((acc, a) => acc + (a.balance * a.rate), 0);
  const totalNetWorth = totalBalance + totalAssetsValue;

  const recentTransactions = transactions.slice(0, 5);

  // Chart Data: Group transactions by month for the last 7 months
  const chartData = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      
      const monthIncome = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'income' && tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
        })
        .reduce((acc, t) => acc + t.amount, 0);
        
      // Add monthlyIncome (salary) to every month's income
      data.push({
        name: monthName,
        value: monthIncome + monthlyIncome
      });
    }
    return data;
  }, [transactions, monthlyIncome]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-brand-text-dim">Seu ponto de partida financeiro</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-brand-card border border-brand-border px-4 py-2 rounded-xl text-sm font-medium">
            Março / 2026
          </div>
          <button 
            onClick={async () => {
              if(confirm('Deseja realmente resetar todos os dados?')) await resetData();
            }}
            className="flex items-center gap-2 bg-brand-card border border-brand-border px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-border transition-colors"
          >
            <RotateCcw size={14} />
            Resetar Dados
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brand-orange p-6 rounded-3xl shadow-xl shadow-brand-orange/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Landmark className="text-white" size={20} />
            </div>
            <MoreHorizontal className="text-white/60" size={20} />
          </div>
          <h3 className="text-white/80 font-medium text-sm">Patrimônio Líquido</h3>
          <p className="text-white/60 text-[10px] mb-2 uppercase tracking-wider">Saldo + Investimentos</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalNetWorth)}</p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="text-brand-orange" size={20} />
            </div>
            <MoreHorizontal className="text-brand-text-dim" size={20} />
          </div>
          <h3 className="text-brand-text-dim font-medium text-sm">Total Receitas</h3>
          <p className="text-brand-text-dim/60 text-[10px] mb-2 uppercase tracking-wider">Ganhos Mensais</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(effectiveIncome)}</p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="text-brand-orange" size={20} />
            </div>
            <MoreHorizontal className="text-brand-text-dim" size={20} />
          </div>
          <h3 className="text-brand-text-dim font-medium text-sm">Total Despesas</h3>
          <p className="text-brand-text-dim/60 text-[10px] mb-2 uppercase tracking-wider">Saídas e Gastos</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
              <RotateCcw className="text-brand-orange" size={20} />
            </div>
            <MoreHorizontal className="text-brand-text-dim" size={20} />
          </div>
          <h3 className="text-brand-text-dim font-medium text-sm">Saldo em Conta</h3>
          <p className="text-brand-text-dim/60 text-[10px] mb-2 uppercase tracking-wider">Disponível para uso</p>
          <p className={cn("text-2xl font-bold", totalBalance >= 0 ? "text-white" : "text-red-500")}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Charts & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-brand-card border border-brand-border rounded-3xl p-6 order-2 lg:order-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold">Minha Carteira</h3>
            <button 
              onClick={() => onNavigate('analytics')}
              className="text-brand-orange text-xs font-bold hover:underline"
            >
              Ver Todos
            </button>
          </div>
          <div className="space-y-4 max-h-[300px] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar">
            {assets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{asset.flag}</span>
                  <div>
                    <p className="font-bold text-sm">{asset.symbol} <span className="text-[10px] bg-brand-border px-1.5 py-0.5 rounded text-brand-text-dim">{asset.type}</span></p>
                    <p className="text-xs text-brand-text-dim">{asset.balance.toFixed(4)} {asset.symbol}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onExchange(asset)}
                  className="lg:opacity-0 group-hover:opacity-100 transition-opacity bg-brand-border px-3 py-1 rounded-lg text-[10px] font-bold"
                >
                  Converter
                </button>
              </div>
            ))}
            {assets.length === 0 && (
              <p className="text-center py-4 text-brand-text-dim text-xs italic">Nenhum ativo cadastrado.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
          <div className="bg-[#0a0a0a] border border-brand-border rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Fluxo de Caixa</h3>
                <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.2em] font-semibold">Análise de Performance</p>
              </div>
              <button 
                onClick={onSetIncome}
                className="bg-brand-orange/5 text-brand-orange border border-brand-orange/20 px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-brand-orange/20 transition-all duration-300 hover:scale-105"
              >
                Definir Renda
              </button>
            </div>
            <div className="h-60 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5b00" stopOpacity={0.4}/>
                      <stop offset="50%" stopColor="#ff5b00" stopOpacity={0.1}/>
                      <stop offset="100%" stopColor="#ff5b00" stopOpacity={0}/>
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="soft-bloom" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.35  0 0 0 0 0  0 0 0 0.2 0" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="4 4" 
                    vertical={false} 
                    stroke="#ffffff" 
                    strokeOpacity={0.03}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9a9088', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}
                    dy={15}
                  />
                  <YAxis 
                    hide={true}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 10, 0.8)', 
                      backdropFilter: 'blur(16px)',
                      borderColor: 'rgba(255, 91, 0, 0.2)', 
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ color: '#ff5b00', fontWeight: '800', fontSize: '14px' }}
                    labelStyle={{ color: '#9a9088', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}
                    cursor={{ stroke: 'rgba(255, 91, 0, 0.2)', strokeWidth: 2, strokeDasharray: '6 6' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Valor']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ff5b00" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    filter="url(#soft-bloom)"
                    animationDuration={2500}
                    activeDot={{ 
                      r: 6, 
                      fill: '#ff5b00', 
                      stroke: '#0a0a0a', 
                      strokeWidth: 2,
                      filter: 'drop-shadow(0 0 8px #ff5b00)'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-brand-border">
          <h3 className="font-bold">Transações Recentes</h3>
          <button className="text-brand-orange text-xs font-bold hover:underline">Ver Todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-brand-text-dim text-[10px] uppercase tracking-wider border-b border-brand-border">
                <th className="px-6 py-4 font-semibold">Atividade</th>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Valor</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm">{t.desc}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-brand-text-dim">
                    {format(new Date(t.date), 'dd MMM yyyy', { locale: ptBR })}
                  </td>
                  <td className={cn(
                    "px-6 py-4 font-bold text-sm",
                    t.type === 'income' ? "text-green-500" : "text-white"
                  )}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-brand-border px-2 py-1 rounded-lg text-[10px] font-bold text-brand-text-dim">
                      {t.category}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-brand-text-dim text-sm italic">
                    Nenhuma transação registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
