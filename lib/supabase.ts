import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getLogoUrl = (bucket: string, path: string) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Transactions
export const fetchTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { data, error };
};

export const saveTransaction = async (transaction: any, userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .upsert({ ...transaction, user_id: userId });
  return { data, error };
};

export const deleteTransactionFromDb = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error };
};

// Assets
export const fetchAssets = async (userId: string) => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const saveAsset = async (asset: any, userId: string) => {
  const { data, error } = await supabase
    .from('assets')
    .upsert({ ...asset, user_id: userId });
  return { data, error };
};

export const deleteAssetFromDb = async (symbol: string, userId: string) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('symbol', symbol)
    .eq('user_id', userId);
  return { error };
};

// Fixed Expenses
export const fetchFixedExpenses = async (userId: string) => {
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const saveFixedExpense = async (expense: any, userId: string) => {
  const { data, error } = await supabase
    .from('fixed_expenses')
    .upsert({ ...expense, user_id: userId });
  return { data, error };
};

export const deleteFixedExpenseFromDb = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('fixed_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error };
};

// Profile / Monthly Income
export const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('monthly_income')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfileIncome = async (income: number, userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, monthly_income: income });
  return { data, error };
};

export const clearAllDataInDb = async (userId: string) => {
  await Promise.all([
    supabase.from('transactions').delete().eq('user_id', userId),
    supabase.from('assets').delete().eq('user_id', userId),
    supabase.from('fixed_expenses').delete().eq('user_id', userId)
  ]);
};
