'use client';

import React, { useState } from 'react';
import { useFinanceStore, Asset } from '@/lib/store';
import { X } from 'lucide-react';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAsset: Asset | null;
}

export default function ExchangeModal({ isOpen, onClose, targetAsset }: ExchangeModalProps) {
  const { addTransaction, updateAssetBalance, transactions } = useFinanceStore();
  const [amountBrl, setAmountBrl] = useState('');

  if (!isOpen || !targetAsset) return null;

  const result = amountBrl ? parseFloat(amountBrl) / targetAsset.rate : 0;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const brl = parseFloat(amountBrl);
    if (!brl || brl > totalBalance) {
      alert('Saldo insuficiente ou valor inválido!');
      return;
    }
    
    // Add transaction as an investment expense
    await addTransaction({
      desc: `Aporte em ${targetAsset.symbol}`,
      amount: brl,
      type: 'expense',
      category: 'Investimentos'
    });
    
    // Update asset balance
    await updateAssetBalance(targetAsset.symbol, brl / targetAsset.rate);
    
    setAmountBrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Comprar {targetAsset.symbol}</h2>
          <button onClick={onClose} className="text-brand-text-dim hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Valor em R$ para aportar</label>
            <input 
              type="number" 
              step="0.01"
              value={amountBrl}
              onChange={(e) => setAmountBrl(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              placeholder="0,00"
              required
            />
            <p className="text-[10px] text-brand-text-dim">Saldo disponível: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}</p>
          </div>

          <div className="bg-brand-dark border border-brand-border p-6 rounded-2xl text-center">
            <p className="text-xs text-brand-text-dim mb-2">Estimativa de recebimento</p>
            <p className="text-2xl font-bold text-brand-orange">
              {result.toFixed(6)} <span className="text-sm font-medium text-white">{targetAsset.symbol}</span>
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90 transition-all active:scale-[0.98]"
          >
            Confirmar Transação
          </button>
        </form>
      </div>
    </div>
  );
}
