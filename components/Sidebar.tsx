'use client';

import React from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  History, 
  FileText, 
  PlusCircle, 
  MinusCircle, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export default function Sidebar({ activePage, setActivePage, onAddIncome, onAddExpense }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
    { id: 'monthly-expenses', icon: MinusCircle, label: 'Despesas' },
    { id: 'analytics', icon: Wallet, label: 'Carteira' },
    { id: 'investments', icon: TrendingUp, label: 'Investimentos' },
    { id: 'transactions', icon: History, label: 'Histórico' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
  ];

  const bottomNavItems = navItems.slice(0, 4);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-brand-dark border-r border-brand-border flex-col transition-all duration-300 shrink-0">
        <div className="px-6 flex justify-center items-center h-[88px]">
          <Image 
            src="https://vdbfuqnpjedmcyefkimc.supabase.co/storage/v1/object/public/Logo/ChatGPT%20Image%2029_03_2026,%2021_42_56.png" 
            alt="Dashboard Financeiro" 
            width={540}
            height={144}
            className="h-[60px] lg:h-[72px] w-auto max-w-full object-contain transition-all duration-300 scale-[2.2] origin-center translate-y-2"
            referrerPolicy="no-referrer"
          />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-xl transition-all group relative",
                activePage === item.id 
                  ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" 
                  : "text-brand-text-dim hover:bg-brand-card hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="ml-3 font-medium">{item.label}</span>
            </button>
          ))}

          <div className="pt-8 space-y-2 border-t border-brand-border mt-4">
            <button 
              onClick={onAddIncome}
              className="w-full flex items-center p-3 rounded-xl text-brand-text-dim hover:bg-brand-card hover:text-white transition-all group relative"
            >
              <PlusCircle size={20} />
              <span className="ml-3 font-medium text-sm">Nova Receita</span>
            </button>
            <button 
              onClick={onAddExpense}
              className="w-full flex items-center p-3 rounded-xl text-brand-text-dim hover:bg-brand-card hover:text-white transition-all group relative"
            >
              <MinusCircle size={20} />
              <span className="ml-3 font-medium text-sm">Nova Despesa</span>
            </button>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group relative"
            >
              <LogOut size={20} />
              <span className="ml-3 font-medium text-sm">Sair</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-brand-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-full bg-brand-orange flex items-center justify-center text-white font-bold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || 'Usuário'}</p>
              <p className="text-xs text-brand-text-dim truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-card border-t border-brand-border flex items-center justify-around px-2 z-[100] safe-area-bottom">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all",
              activePage === item.id ? "text-brand-orange" : "text-brand-text-dim"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-brand-text-dim"
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </div>

      {/* Mobile Full Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-brand-dark z-[200] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="h-16 flex items-center justify-between px-6 border-b border-brand-border">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-brand-text-dim">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest mb-4">Navegação</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center p-4 rounded-2xl transition-all",
                    activePage === item.id 
                      ? "bg-brand-orange text-white" 
                      : "bg-brand-card text-brand-text-dim"
                  )}
                >
                  <item.icon size={20} />
                  <span className="ml-4 font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest mb-4">Ações Rápidas</p>
              <button 
                onClick={() => {
                  onAddIncome();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center p-4 rounded-2xl bg-brand-card text-green-500"
              >
                <PlusCircle size={20} />
                <span className="ml-4 font-medium">Nova Receita</span>
              </button>
              <button 
                onClick={() => {
                  onAddExpense();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center p-4 rounded-2xl bg-brand-card text-red-500"
              >
                <MinusCircle size={20} />
                <span className="ml-4 font-medium">Nova Despesa</span>
              </button>
            </div>

            <div className="pt-6 border-t border-brand-border">
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center p-4 rounded-2xl bg-red-500/10 text-red-500"
              >
                <LogOut size={20} />
                <span className="ml-4 font-medium">Sair da Conta</span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-brand-card border-t border-brand-border">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-lg">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="ml-4">
                <p className="font-bold text-white">{user?.user_metadata?.full_name || 'Usuário'}</p>
                <p className="text-xs text-brand-text-dim">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
