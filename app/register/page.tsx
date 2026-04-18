'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              nome: name,
              email: email,
              created_at: new Date().toISOString(),
            },
          ]);

        if (profileError) throw profileError;

        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-orange/5 blur-[100px] rounded-full" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="mb-6 flex justify-center items-center h-20 w-full overflow-hidden">
            <Image 
              src="https://vdbfuqnpjedmcyefkimc.supabase.co/storage/v1/object/public/Logo/ChatGPT%20Image%2029_03_2026,%2021_42_56.png" 
              alt="Elite Finance Logo" 
              width={400}
              height={100}
              className="h-full w-auto object-contain scale-[2.5]"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-brand-text-dim text-sm mt-2">Comece a gerenciar suas finanças hoje</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-medium text-brand-text-dim uppercase tracking-wider mb-2 ml-1">
              Nome Completo
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-dim group-focus-within:text-brand-orange transition-colors" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-brand-text-dim/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-text-dim uppercase tracking-wider mb-2 ml-1">
              E-mail
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-dim group-focus-within:text-brand-orange transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-brand-text-dim/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-text-dim uppercase tracking-wider mb-2 ml-1">
              Senha
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-dim group-focus-within:text-brand-orange transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-dark/50 border border-brand-border rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-brand-text-dim/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3.5 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-orange/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Cadastrar Agora'
            )}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <p className="text-brand-text-dim text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-brand-orange hover:text-brand-orange/80 hover:underline font-semibold transition-colors">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
