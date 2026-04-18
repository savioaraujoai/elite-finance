'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import TransactionModal from '@/components/TransactionModal';
import AssetModal from '@/components/AssetModal';
import IncomeModal from '@/components/IncomeModal';
import ExchangeModal from '@/components/ExchangeModal';
import { useFinanceStore, Asset } from '@/lib/store';
import { 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Mail, 
  MessageCircle,
  PlusCircle,
  ArrowDownCircle,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  PolarAngleAxis
} from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getLogoUrl } from '@/lib/supabase';

export default function MainLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [fixedExpDesc, setFixedExpDesc] = useState('');
  const [fixedExpAmount, setFixedExpAmount] = useState('');
  const [fixedExpCategory, setFixedExpCategory] = useState('Moradia');

  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    assets, 
    fixedExpenses, 
    addFixedExpense, 
    deleteFixedExpense, 
    monthlyIncome, 
    setLogoUrl,
    initializeFromSupabase,
    isLoading
  } = useFinanceStore();

  useEffect(() => {
    initializeFromSupabase();
  }, [initializeFromSupabase]);

  useEffect(() => {
    // Fetch logo from Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_LOGO_BUCKET || 'Logo';
    const path = process.env.NEXT_PUBLIC_SUPABASE_LOGO_PATH || 'Logo moderno com seta laranja.png';
    
    if (supabaseUrl && supabaseKey) {
      const url = getLogoUrl(bucket, path);
      if (url) setLogoUrl(url);
    }
  }, [setLogoUrl]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const effectiveIncome = monthlyIncome + totalIncome;
  const totalFixedExpenses = fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0);
  const commitmentPercentage = effectiveIncome > 0 ? (totalFixedExpenses / effectiveIncome) * 100 : 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (type: 'income' | 'expense', id: string | null = null) => {
    setModalType(type);
    setEditTransactionId(id);
    setIsModalOpen(true);
  };

  const openExchange = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsExchangeModalOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleShare = (method: 'email' | 'whatsapp') => {
    const totalIncomeTransactions = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalTransactionExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalFixedExpenses = fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0);
    
    const totalIncome = monthlyIncome + totalIncomeTransactions;
    const totalExpense = totalTransactionExpense + totalFixedExpenses;
    const balance = totalIncome - totalExpense;
    
    const text = `Relatório Financeiro\n\nReceitas: ${formatCurrency(totalIncome)}\nDespesas: ${formatCurrency(totalExpense)}\nSaldo: ${formatCurrency(balance)}`;
    
    if (method === 'email') {
      window.location.href = `mailto:?subject=Relatório Financeiro&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
    setIsShareMenuOpen(false);
  };

  // Group transactions by month for reports
  const monthlyReports = transactions.reduce((acc: any, t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!acc[key]) {
      acc[key] = {
        name: format(date, 'MMMM / yyyy', { locale: ptBR }),
        income: 0,
        expense: 0,
        key
      };
    }
    if (t.type === 'income') acc[key].income += t.amount;
    else acc[key].expense += t.amount;
    return acc;
  }, {});

  const reportsList = Object.values(monthlyReports)
    .sort((a: any, b: any) => b.key.localeCompare(a.key))
    .filter((report: any) => selectedMonth === 'all' || report.key === selectedMonth);

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  fixedExpenses.forEach(fe => {
    categoryTotals[fe.category] = (categoryTotals[fe.category] || 0) + fe.amount;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: value as number
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#ff5b00', '#4facfe', '#43e97b', '#fa709a', '#c471ed'];

  return (
    <div className="flex h-screen bg-brand-dark text-white overflow-hidden relative font-sans">
      {isLoading && (
        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-brand-text-dim animate-pulse">Sincronizando com Supabase...</p>
          </div>
        </div>
      )}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onAddIncome={() => openModal('income')}
        onAddExpense={() => openModal('expense')}
      />

      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-center px-6 border-b border-brand-border shrink-0 bg-brand-dark/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="relative h-10 w-32 flex items-center justify-center overflow-hidden">
            <Image 
              src="https://vdbfuqnpjedmcyefkimc.supabase.co/storage/v1/object/public/Logo/ChatGPT%20Image%2029_03_2026,%2021_42_56.png" 
              alt="Elite Finance" 
              width={540}
              height={144}
              className="h-full w-auto object-contain scale-[2.5] translate-y-1"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:flex h-16 border-b border-brand-border items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-brand-card rounded-lg transition-colors text-brand-text-dim">
                <ChevronLeft size={18} />
              </button>
              <button className="p-1.5 hover:bg-brand-card rounded-lg transition-colors text-brand-text-dim">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="flex items-center text-xs font-medium text-brand-text-dim">
              <Image 
                src="https://vdbfuqnpjedmcyefkimc.supabase.co/storage/v1/object/public/Logo/ChatGPT%20Image%2029_03_2026,%2021_42_56.png" 
                alt="Logo" 
                width={100}
                height={24}
                className="h-4 w-auto mr-2 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="mx-2 text-brand-border">/</span> <span className="text-white capitalize">
                {activePage === 'dashboard' ? 'Painel' : 
                 activePage === 'monthly-expenses' ? 'Despesas' :
                 activePage === 'analytics' ? 'Carteira' :
                 activePage === 'investments' ? 'Investimentos' :
                 activePage === 'transactions' ? 'Histórico' :
                 activePage === 'reports' ? 'Relatórios' : 
                 activePage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative" ref={shareMenuRef}>
            <button 
              onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
              className="flex items-center gap-2 bg-brand-card border border-brand-border px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-border transition-colors"
            >
              <Share2 size={14} />
              Compartilhar Relatório
            </button>

            {isShareMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-brand-card border border-brand-border rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => handleShare('email')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-brand-border transition-colors text-left"
                >
                  <Mail size={14} className="text-brand-orange" />
                  Enviar por E-mail
                </button>
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-brand-border transition-colors text-left border-t border-brand-border"
                >
                  <MessageCircle size={14} className="text-green-500" />
                  Enviar por WhatsApp
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {activePage === 'dashboard' && (
              <Dashboard 
                onSetIncome={() => setIsIncomeModalOpen(true)}
                onExchange={openExchange}
                onNavigate={setActivePage}
              />
            )}
            
            {activePage === 'transactions' && (
              <div className="animate-in fade-in duration-500 space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Histórico de Transações</h1>
                    <p className="text-sm text-brand-text-dim">Todas as suas movimentações financeiras</p>
                  </div>
                  <button 
                    onClick={() => openModal('expense')}
                    className="bg-brand-orange px-6 py-3 lg:py-2 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/20 w-full sm:w-auto"
                  >
                    + Nova Transação
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 lg:py-2 flex items-center gap-3">
                    <span className="text-brand-text-dim text-[10px] font-bold uppercase tracking-wider">Busca</span>
                    <input 
                      type="text" 
                      placeholder="Pesquisar..." 
                      className="bg-transparent border-none outline-none text-sm w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 lg:py-2 flex items-center gap-3">
                    <span className="text-brand-text-dim text-[10px] font-bold uppercase tracking-wider">Categoria</span>
                    <select 
                      className="bg-transparent border-none outline-none text-sm w-full cursor-pointer"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="all">Todas</option>
                      {Array.from(new Set(transactions.map(t => t.category))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block bg-brand-card border border-brand-border rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-brand-text-dim text-[10px] uppercase tracking-wider border-b border-brand-border">
                        <th className="px-6 py-4 font-semibold">Data</th>
                        <th className="px-6 py-4 font-semibold">Descrição</th>
                        <th className="px-6 py-4 font-semibold">Categoria</th>
                        <th className="px-6 py-4 font-semibold text-right">Valor</th>
                        <th className="px-6 py-4 font-semibold text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {transactions
                        .filter(t => {
                          const matchesSearch = t.desc.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 text-xs text-brand-text-dim">
                            {format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-sm">{t.desc}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-brand-border px-2 py-1 rounded-lg text-[10px] font-bold text-brand-text-dim">
                              {t.category}
                            </span>
                          </td>
                          <td className={cn(
                            "px-6 py-4 font-bold text-sm text-right",
                            t.type === 'income' ? "text-green-500" : "text-white"
                          )}>
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openModal(t.type, t.id)}
                                className="text-brand-text-dim hover:text-brand-orange transition-colors"
                              >
                                <PlusCircle size={16} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if(confirm('Deseja excluir esta transação?')) await deleteTransaction(t.id);
                                }}
                                className="text-brand-text-dim hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {transactions
                    .filter(t => {
                      const matchesSearch = t.desc.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((t) => (
                    <div key={t.id} className="bg-brand-card border border-brand-border p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm">{t.desc}</p>
                          <p className="text-[10px] text-brand-text-dim uppercase mt-1">{t.category} • {format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        </div>
                        <p className={cn(
                          "font-bold text-sm",
                          t.type === 'income' ? "text-green-500" : "text-white"
                        )}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-brand-border">
                        <button 
                          onClick={() => openModal(t.type, t.id)}
                          className="flex-1 bg-brand-dark py-2 rounded-xl text-[10px] font-bold text-brand-text-dim flex items-center justify-center gap-2"
                        >
                          <PlusCircle size={14} /> Editar
                        </button>
                        <button 
                          onClick={async () => {
                            if(confirm('Deseja excluir esta transação?')) await deleteTransaction(t.id);
                          }}
                          className="flex-1 bg-red-500/10 py-2 rounded-xl text-[10px] font-bold text-red-500 flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center py-12 text-brand-text-dim text-sm italic">Nenhuma transação encontrada.</p>
                  )}
                </div>
              </div>
            )}

            {activePage === 'monthly-expenses' && (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Despesas Mensais</h1>
                    <p className="text-sm text-brand-text-dim">Gestão de gastos fixos e recorrentes</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* List of fixed expenses */}
                  <div className="bg-brand-card border border-brand-border rounded-3xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center gap-2">
                        <ArrowDownCircle className="text-brand-orange" size={18} />
                        Despesas Fixas
                      </h3>
                      <div className="text-xs font-bold text-brand-orange">
                        Total: {formatCurrency(fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0))}
                      </div>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                      {fixedExpenses.map((fe) => (
                        <div key={fe.id} className="flex items-center justify-between p-4 bg-brand-dark/50 border border-brand-border rounded-2xl group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center shrink-0">
                              <ArrowDownCircle className="text-brand-orange" size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{fe.desc}</p>
                              <p className="text-[10px] text-brand-text-dim uppercase">{fe.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <p className="font-bold text-sm">{formatCurrency(fe.amount)}</p>
                            <button 
                              onClick={async () => {
                                if(confirm('Deseja excluir esta despesa?')) await deleteFixedExpense(fe.id);
                              }}
                              className="text-brand-text-dim hover:text-red-500 transition-colors lg:opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {fixedExpenses.length === 0 && (
                        <p className="text-center py-8 text-brand-text-dim text-sm italic">Nenhuma despesa fixa cadastrada.</p>
                      )}
                    </div>
                    {fixedExpenses.length > 0 && (
                      <button 
                        onClick={() => {
                          fixedExpenses.forEach(fe => {
                            addTransaction({
                              desc: `[FIXA] ${fe.desc}`,
                              amount: fe.amount,
                              type: 'expense',
                              category: fe.category
                            });
                          });
                          alert('Despesas fixas lançadas no histórico com sucesso!');
                        }}
                        className="w-full mt-6 bg-brand-dark border border-brand-border py-3 rounded-xl font-bold text-xs hover:bg-brand-border transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={14} />
                        Lançar no Mês Atual
                      </button>
                    )}
                  </div>

                  {/* Form to add fixed expense */}
                  <div className="bg-brand-card border border-brand-border rounded-3xl p-6 flex flex-col">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                      <PlusCircle size={18} className="text-brand-orange" />
                      Nova Despesa Fixa
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!fixedExpDesc || !fixedExpAmount) return;
                      addFixedExpense({
                        desc: fixedExpDesc,
                        amount: parseFloat(fixedExpAmount),
                        category: fixedExpCategory
                      });
                      setFixedExpDesc('');
                      setFixedExpAmount('');
                    }} className="space-y-4 flex-1 flex flex-col">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Descrição</label>
                          <input 
                            type="text" 
                            value={fixedExpDesc}
                            onChange={(e) => setFixedExpDesc(e.target.value)}
                            className="w-full bg-brand-dark border border-brand-border rounded-2xl px-4 py-3 lg:py-2.5 text-sm focus:border-brand-orange outline-none transition-all placeholder:text-brand-text-dim/30"
                            placeholder="Ex: Aluguel..."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Valor (R$)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={fixedExpAmount}
                            onChange={(e) => setFixedExpAmount(e.target.value)}
                            className="w-full bg-brand-dark border border-brand-border rounded-2xl px-4 py-3 lg:py-2.5 text-sm focus:border-brand-orange outline-none transition-all placeholder:text-brand-text-dim/30"
                            placeholder="0,00"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Categoria</label>
                        <select 
                          value={fixedExpCategory}
                          onChange={(e) => setFixedExpCategory(e.target.value)}
                          className="w-full bg-brand-dark border border-brand-border rounded-2xl px-4 py-3 lg:py-2.5 text-sm focus:border-brand-orange outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Moradia">🏠 Moradia</option>
                          <option value="Alimentação">🍕 Alimentação</option>
                          <option value="Transporte">🚗 Transporte</option>
                          <option value="Saúde">🏥 Saúde</option>
                          <option value="Educação">📚 Educação</option>
                          <option value="Lazer">🎮 Lazer</option>
                          <option value="Outros">📦 Outros</option>
                        </select>
                      </div>
                      
                      <div className="bg-brand-dark/30 p-4 rounded-2xl border border-brand-border/50 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-brand-text-dim uppercase font-bold">Impacto Projetado</span>
                          <span className={cn(
                            "text-xs font-bold",
                            (effectiveIncome > 0 ? ((fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0) + (parseFloat(fixedExpAmount) || 0)) / effectiveIncome) * 100 : 0) > 70 ? "text-red-500" : "text-brand-orange"
                          )}>
                            {(effectiveIncome > 0 ? ((fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0) + (parseFloat(fixedExpAmount) || 0)) / effectiveIncome) * 100 : 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1 w-full bg-brand-dark rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              (effectiveIncome > 0 ? ((fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0) + (parseFloat(fixedExpAmount) || 0)) / effectiveIncome) * 100 : 0) > 70 ? "bg-red-500" : "bg-brand-orange"
                            )}
                            style={{ width: `${Math.min(100, (effectiveIncome > 0 ? ((fixedExpenses.reduce((acc, fe) => acc + fe.amount, 0) + (parseFloat(fixedExpAmount) || 0)) / effectiveIncome) * 100 : 0))}%` }}
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-brand-orange py-4 lg:py-3 rounded-2xl font-bold text-sm shadow-xl shadow-brand-orange/20 hover:bg-brand-orange/90 transition-all"
                      >
                        Salvar Despesa Fixa
                      </button>
                    </form>
                  </div>
                </div>

                {/* Chart - Full Width */}
                <div className="bg-brand-card border border-brand-border rounded-3xl p-8 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold">Resumo de Estatísticas</h3>
                      <p className="text-xs text-brand-text-dim uppercase tracking-widest mt-1">Distribuição de Gastos Fixos</p>
                    </div>
                    <div className="flex gap-8 text-right">
                      <div>
                        <p className="text-[10px] text-brand-text-dim uppercase font-bold">Total Mensal</p>
                        <p className="text-xl font-bold text-brand-orange">{formatCurrency(totalFixedExpenses)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 h-80 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData.length > 0 ? pieData : [{ name: 'Sem dados', value: 1 }]}
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                            {pieData.length === 0 && <Cell fill="#262626" stroke="none" />}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#151619', borderColor: '#262626', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                            formatter={(value: any) => [formatCurrency(Number(value)), 'Valor']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {pieData.map((d, i) => (
                          <div key={d.name} className="flex items-center justify-between text-xs group">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                              />
                              <span className="text-brand-text-dim font-medium">{d.name}</span>
                            </div>
                            <span className="font-bold">{formatCurrency(d.value)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-brand-border space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                            <span className="text-brand-text-dim">Comprometimento Total</span>
                            <span>{commitmentPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-brand-dark rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                              style={{ width: `${Math.min(100, commitmentPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'investments' && (
              <div className="animate-in fade-in duration-500 space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Investimentos</h1>
                    <p className="text-sm text-brand-text-dim">Gerencie seus aportes e novos investimentos</p>
                  </div>
                  <button 
                    onClick={() => setIsAssetModalOpen(true)}
                    className="bg-brand-orange px-6 py-3 lg:py-2 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Plus size={18} />
                    Novo Investimento
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {[
                    { title: 'Ações & ETFs', icon: '📈', desc: 'Aportes em empresas e fundos de índice' },
                    { title: 'Fundos Imobiliários', icon: '🏢', desc: 'FIIs e rendimentos de aluguel' },
                    { title: 'Criptoativos', icon: '₿', desc: 'Bitcoin, Ethereum e ativos digitais' },
                    { title: 'Tesouro Direto', icon: '🏛️', desc: 'Títulos públicos do governo' },
                    { title: 'CDB / CDI', icon: '🏦', desc: 'Renda fixa bancária pós-fixada' },
                    { title: 'LCI / LCA', icon: '🚜', desc: 'Crédito imobiliário e do agronegócio' },
                    { title: 'Debêntures', icon: '📜', desc: 'Títulos de dívida de empresas' },
                    { title: 'Previdência Privada', icon: '🛡️', desc: 'Planejamento de aposentadoria' },
                  ].map((item) => (
                    <div key={item.title} className="bg-brand-card border border-brand-border p-6 rounded-3xl hover:border-brand-orange transition-colors cursor-pointer group" onClick={() => setIsAssetModalOpen(true)}>
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                      <h3 className="font-bold mb-2 text-sm lg:text-base">{item.title}</h3>
                      <p className="text-[10px] lg:text-xs text-brand-text-dim">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-brand-card border border-brand-border p-6 rounded-3xl">
                  <h3 className="font-bold mb-4 text-sm lg:text-base">Resumo de Patrimônio Alocado</h3>
                  <p className="text-2xl lg:text-3xl font-bold text-white">
                    {formatCurrency(assets.reduce((acc, a) => acc + (a.balance * a.rate), 0))}
                  </p>
                </div>
              </div>
            )}

            {activePage === 'reports' && (
              <div className="animate-in fade-in duration-500 space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Relatórios Mensais</h1>
                    <p className="text-sm text-brand-text-dim">Desempenho financeiro mês a mês</p>
                  </div>
                  <select 
                    className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 lg:py-2 text-xs font-bold focus:outline-none focus:border-brand-orange transition-colors w-full sm:w-auto"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="all">Todos os Meses</option>
                    {Object.values(monthlyReports).sort((a: any, b: any) => b.key.localeCompare(a.key)).map((report: any) => (
                      <option key={report.key} value={report.key}>{report.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {reportsList.map((report: any) => (
                    <div key={report.key} className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-4 hover:border-brand-orange transition-colors">
                      <div className="border-b border-brand-border pb-4">
                        <h3 className="font-bold capitalize text-sm lg:text-base">{report.name}</h3>
                      </div>
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-brand-text-dim">Receitas</span>
                        <span className="text-green-500 font-bold">+ {formatCurrency(report.income)}</span>
                      </div>
                      <div className="flex justify-between text-xs lg:text-sm">
                        <span className="text-brand-text-dim">Despesas</span>
                        <span className="text-red-500 font-bold">- {formatCurrency(report.expense)}</span>
                      </div>
                      <div className="pt-4 border-t border-brand-border flex justify-between font-bold text-sm lg:text-base">
                        <span>Resultado</span>
                        <span className={cn(report.income - report.expense >= 0 ? "text-white" : "text-red-500")}>
                          {formatCurrency(report.income - report.expense)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {reportsList.length === 0 && (
                    <p className="text-brand-text-dim italic col-span-full text-center py-12">Nenhum histórico disponível.</p>
                  )}
                </div>
              </div>
            )}

            {activePage === 'analytics' && (
              <div className="animate-in fade-in duration-500 space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Wallet / Financeiro</h1>
                    <p className="text-sm text-brand-text-dim">Gestão de ativos e carteira consolidada</p>
                  </div>
                  <button 
                    onClick={() => setIsAssetModalOpen(true)}
                    className="bg-brand-orange px-6 py-3 lg:py-2 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/20 w-full sm:w-auto"
                  >
                    + Adicionar Ativo
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                  <div className="bg-brand-card border border-brand-border p-6 rounded-3xl">
                    <h3 className="text-brand-text-dim font-medium text-[10px] lg:text-sm mb-2 uppercase tracking-widest">Patrimônio Total</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-white">
                      {formatCurrency(assets.reduce((acc, a) => acc + (a.balance * a.rate), 0))}
                    </p>
                  </div>
                  <div className="bg-brand-card border border-brand-border p-6 rounded-3xl">
                    <h3 className="text-brand-text-dim font-medium text-[10px] lg:text-sm mb-2 uppercase tracking-widest">Total de Ativos</h3>
                    <p className="text-2xl lg:text-3xl font-bold text-white">{assets.length}</p>
                  </div>
                  <div className="bg-brand-card border border-brand-border p-6 rounded-3xl">
                    <h3 className="text-brand-text-dim font-medium text-[10px] lg:text-sm mb-2 uppercase tracking-widest">Maior Posição</h3>
                    <p className="text-lg lg:text-xl font-bold text-brand-orange">
                      {assets.length > 0 
                        ? assets.reduce((prev, current) => (prev.balance * prev.rate > current.balance * current.rate) ? prev : current).symbol 
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-brand-card border border-brand-border rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-brand-border flex items-center justify-between">
                      <h3 className="font-bold">Ativos na Carteira</h3>
                    </div>
                    
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-brand-text-dim text-[10px] uppercase tracking-wider border-b border-brand-border">
                            <th className="px-6 py-4 font-semibold">Ativo</th>
                            <th className="px-6 py-4 font-semibold">Tipo</th>
                            <th className="px-6 py-4 font-semibold">Saldo</th>
                            <th className="px-6 py-4 font-semibold text-right">Valor (BRL)</th>
                            <th className="px-6 py-4 font-semibold text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                          {assets.map((asset) => (
                            <tr key={asset.symbol} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <span className="text-2xl">{asset.flag}</span>
                                <span className="font-bold">{asset.symbol}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-brand-border px-2 py-1 rounded-lg text-[10px] font-bold text-brand-text-dim">
                                  {asset.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {asset.balance.toFixed(4)} {asset.symbol}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-brand-orange">
                                {formatCurrency(asset.balance * asset.rate)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button 
                                  onClick={async () => {
                                    if(confirm(`Deseja excluir o ativo ${asset.symbol}?`)) {
                                      await useFinanceStore.getState().deleteAsset(asset.symbol);
                                    }
                                  }}
                                  className="text-brand-text-dim hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {assets.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-brand-text-dim text-sm italic">
                                Nenhum ativo na carteira.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-brand-border">
                      {assets.map((asset) => (
                        <div key={asset.symbol} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{asset.flag}</span>
                              <div>
                                <p className="font-bold text-sm">{asset.symbol}</p>
                                <p className="text-[10px] text-brand-text-dim uppercase">{asset.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-brand-orange">{formatCurrency(asset.balance * asset.rate)}</p>
                              <p className="text-[10px] text-brand-text-dim">{asset.balance.toFixed(4)} {asset.symbol}</p>
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button 
                              onClick={async () => {
                                if(confirm(`Deseja excluir o ativo ${asset.symbol}?`)) {
                                  await useFinanceStore.getState().deleteAsset(asset.symbol);
                                }
                              }}
                              className="bg-red-500/10 px-4 py-2 rounded-xl text-[10px] font-bold text-red-500 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Excluir Ativo
                            </button>
                          </div>
                        </div>
                      ))}
                      {assets.length === 0 && (
                        <p className="text-center py-12 text-brand-text-dim text-sm italic">Nenhum ativo cadastrado.</p>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-brand-card border border-brand-border p-6 rounded-3xl h-full">
                      <h3 className="font-bold mb-6 text-sm lg:text-base">Alocação de Patrimônio</h3>
                      <div className="h-60 lg:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={assets.map(a => ({ name: a.symbol, value: a.balance * a.rate }))}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {assets.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#FFD700', '#00FF00', '#00FFFF', '#3B82F6', '#A855F7', '#EC4899'][index % 6]} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#151619', borderColor: '#262626', borderRadius: '12px' }}
                              formatter={(value: any) => formatCurrency(Number(value))}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 mt-4">
                        {assets.map((a, i) => (
                          <div key={a.symbol} className="flex items-center justify-between text-[10px] lg:text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#FFD700', '#00FF00', '#00FFFF', '#3B82F6', '#A855F7', '#EC4899'][i % 6] }} />
                              <span className="text-brand-text-dim">{a.symbol}</span>
                            </div>
                            <span className="font-bold">
                              {((a.balance * a.rate / assets.reduce((acc, curr) => acc + (curr.balance * curr.rate), 0)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-card border border-brand-border p-6 lg:p-8 rounded-3xl">
                  <h3 className="font-bold mb-6 text-sm lg:text-base">Comparativo de Valor de Mercado</h3>
                  <div className="h-60 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assets.map(a => ({ name: a.symbol, valor: a.balance * a.rate }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9a9088', fontSize: 10 }} />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#151619', borderColor: '#262626', borderRadius: '12px' }}
                          formatter={(value: any) => formatCurrency(Number(value))}
                        />
                        <Bar dataKey="valor" fill="#ff5b00" radius={[8, 8, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => openModal('expense')}
        className="fixed bottom-20 lg:bottom-8 right-6 lg:right-8 w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-orange/40 hover:scale-110 active:scale-95 transition-all z-[110]"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditTransactionId(null);
        }} 
        defaultType={modalType}
        editTransactionId={editTransactionId}
      />

      <AssetModal 
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
      />

      <IncomeModal 
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />

      <ExchangeModal 
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        targetAsset={selectedAsset}
      />
    </div>
  );
}
