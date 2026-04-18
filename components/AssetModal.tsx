'use client';

import React, { useState } from 'react';
import { useFinanceStore, AssetType } from '@/lib/store';
import { X } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetModal({ isOpen, onClose }: AssetModalProps) {
  const addAsset = useFinanceStore((state) => state.addAsset);
  const [symbol, setSymbol] = useState('');
  const [flag, setFlag] = useState('');
  const [rate, setRate] = useState('');
  const [type, setType] = useState<AssetType>('Fiduciária');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !flag || !rate) return;
    
    await addAsset({
      symbol: symbol.toUpperCase(),
      flag,
      rate: parseFloat(rate),
      type,
      balance: 0
    });
    
    setSymbol('');
    setFlag('');
    setRate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Adicionar Novo Investimento</h2>
          <button onClick={onClose} className="text-brand-text-dim hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Tipo de Investimento</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
            >
              <optgroup label="Renda Variável">
                <option value="Ação">Ação / ETF</option>
                <option value="FII">Fundo Imobiliário (FII)</option>
                <option value="Criptoativo">Criptoativo</option>
              </optgroup>
              <optgroup label="Renda Fixa">
                <option value="CDB">CDB (Certificado de Depósito Bancário)</option>
                <option value="CDI">CDI / Renda Fixa Pós</option>
                <option value="LCI/LCA">LCI / LCA</option>
                <option value="Tesouro Direto">Tesouro Direto</option>
                <option value="Debêntures">Debêntures</option>
              </optgroup>
              <optgroup label="Outros">
                <option value="Fiduciária">Moeda Fiduciária (Fiat)</option>
                <option value="Previdência">Previdência Privada</option>
                <option value="Rendimento Mensal">Rendimento Mensal</option>
                <option value="Rendimento Anual">Rendimento Anual</option>
                <option value="Outros">Outros</option>
              </optgroup>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Símbolo (ex: BTC, AAPL, EUR)</label>
            <input 
              type="text" 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              placeholder="BTC"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Emoji do Ativo</label>
            <input 
              type="text" 
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              placeholder="₿"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text-dim uppercase tracking-wider">Cotação Atual (1 Ativo = X BRL)</label>
            <input 
              type="number" 
              step="0.0001"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
              placeholder="320000.00"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90 transition-all active:scale-[0.98]"
          >
            Salvar Ativo
          </button>
        </form>
      </div>
    </div>
  );
}
