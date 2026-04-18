'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceStore, TransactionType, Transaction } from '@/lib/store';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editTransactionId?: string | null;
}

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  defaultType = 'expense',
  editTransactionId = null
}: TransactionModalProps) {
  const { addTransaction, updateTransaction, transactions } = useFinanceStore();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState('Outros');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editTransactionId) {
      const t = transactions.find(tx => tx.id === editTransactionId);
      if (t) {
        setDesc(t.desc);
        setAmount(t.amount.toString());
        setType(t.type);
        setCategory(t.category);
      }
    } else {
      setDesc('');
      setAmount('');
      setType(defaultType);
      setCategory('Outros');
    }
  }, [editTransactionId, isOpen, transactions, defaultType]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    
    if (editTransactionId) {
      await updateTransaction(editTransactionId, {
        desc,
        amount: parseFloat(amount),
        type,
        category
      });
    } else {
      await addTransaction({
        desc,
        amount: parseFloat(amount),
        type,
        category
      });
    }
    
    onClose();
  };

  const categories = [
    'Alimentação',
    'Saúde/Estética',
    'Aluguel',
    'Contas em Geral',
    'Salário',
    'Investimentos',
    'Lazer',
    'Outros'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{editTransactionId ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button onClick={onClose} className="text-brand-text-dim hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Descrição</label>
            <input 
              type="text" 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              placeholder="Ex: Aluguel, Supermercado..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Valor (R$)</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Tipo</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              >
                <option value="income">Receita (+)</option>
                <option value="expense">Despesa (-)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Categoria</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90 transition-all active:scale-[0.98]"
          >
            Salvar Transação
          </button>
        </form>
      </div>
    </div>
  );
}
