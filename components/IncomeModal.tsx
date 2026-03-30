'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { X } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IncomeModal({ isOpen, onClose }: IncomeModalProps) {
  const { monthlyIncome, setMonthlyIncome } = useFinanceStore();
  const [amount, setAmount] = useState(monthlyIncome.toString());

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setMonthlyIncome(parseFloat(amount) || 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Definir Renda Mensal</h2>
          <button onClick={onClose} className="text-brand-text-dim hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Valor da Renda (R$)</label>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              placeholder="0,00"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90 transition-all active:scale-[0.98]"
          >
            Salvar Renda
          </button>
        </form>
      </div>
    </div>
  );
}
