// components/ExpenseTracker.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Plus, Trash2, Receipt, ArrowRight, Check, DollarSign, Users, RefreshCw } from 'lucide-react';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_between: string[];
  created_at?: string;
}

interface ExpenseTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: { id: string; name: string; color?: string }[];
}

const LOCAL_STORAGE_KEY = 'san_fermin_2027_expenses';

export default function ExpenseTracker({ isOpen, onClose, groups }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'balances' | 'history'>('form');

  // Inicializar pagador y grupos al abrir
  useEffect(() => {
    if (groups.length > 0) {
      if (!paidBy) setPaidBy(groups[0].name);
      if (splitBetween.length === 0) setSplitBetween(groups.map((g) => g.name));
    }
  }, [groups, paidBy, splitBetween]);

  // Cargar gastos desde Supabase con fallback a LocalStorage
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setExpenses(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } else {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) setExpenses(JSON.parse(local));
      }
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) setExpenses(JSON.parse(local));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchExpenses();
    }
  }, [isOpen]);

  // Cálculo de Balances y Liquidación de Deudas
  const { totalAmount, netBalances, settlements } = useMemo(() => {
    let total = 0;
    const balances: Record<string, number> = {};

    groups.forEach((g) => {
      balances[g.name] = 0;
    });

    expenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      total += amt;

      // Al pagador se le suma lo que puso
      balances[exp.paid_by] = (balances[exp.paid_by] || 0) + amt;

      // A cada participante se le descuenta su parte
      const splitList = exp.split_between && exp.split_between.length > 0 ? exp.split_between : groups.map((g) => g.name);
      const splitAmount = amt / splitList.length;

      splitList.forEach((groupName) => {
        balances[groupName] = (balances[groupName] || 0) - splitAmount;
      });
    });

    // Algoritmo de liquidación simplificada
    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, bal]) => {
      if (bal < -0.01) {
        debtors.push({ name, amount: -bal });
      } else if (bal > 0.01) {
        creditors.push({ name, amount: bal });
      }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transfers: { from: string; to: string; amount: number }[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settlementAmt = Math.min(debtor.amount, creditor.amount);

      if (settlementAmt > 0.01) {
        transfers.push({
          from: debtor.name,
          to: creditor.name,
          amount: settlementAmt,
        });
      }

      debtor.amount -= settlementAmt;
      creditor.amount -= settlementAmt;

      if (debtor.amount <= 0.01) dIdx++;
      if (creditor.amount <= 0.01) cIdx++;
    }

    return { totalAmount: total, netBalances: balances, settlements: transfers };
  }, [expenses, groups]);

  if (!isOpen) return null;

  const toggleSplitGroup = (groupName: string) => {
    setSplitBetween((prev) =>
      prev.includes(groupName)
        ? prev.length > 1
          ? prev.filter((name) => name !== groupName)
          : prev
        : [...prev, groupName]
    );
  };

  const handleSelectAll = () => {
    setSplitBetween(groups.map((g) => g.name));
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0 || !paidBy || splitBetween.length === 0) {
      alert('Por favor completa todos los campos con un monto válido.');
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      description: description.trim(),
      amount: numAmount,
      paid_by: paidBy,
      split_between: splitBetween,
      created_at: new Date().toISOString(),
    };

    setLoading(true);

    try {
      const { error } = await supabase.from('trip_expenses').insert([newExpense]);
      if (!error) {
        await fetchExpenses();
      } else {
        const updated = [newExpense, ...expenses];
        setExpenses(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    setDescription('');
    setAmount('');
    setLoading(false);
    setActiveTab('history');
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    setLoading(true);

    try {
      await supabase.from('trip_expenses').delete().eq('id', id);
    } catch {
      // ignore
    }

    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Gastos Compartidos</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Total del viaje: <span className="text-emerald-700 font-black">{totalAmount.toFixed(2)} €</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación por pestañas */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'form' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> <span>Cargar Gasto</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('balances')}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'balances' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>⚖️ Balances</span>
              {settlements.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'history' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Historial ({expenses.length})</span>
            </button>
          </div>

          {/* Contenido de pestañas */}
          <div className="mt-4 max-h-[50vh] overflow-y-auto pr-1">
            
            {/* Pestaña 1: Cargar Gasto */}
            {activeTab === 'form' && (
              <form onSubmit={handleAddExpense} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción del gasto</label>
                  <input
                    type="text"
                    placeholder="Ej: Cena de Pintxos Donostia, Alquiler de Auto, Supermercado"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto en Euros (€)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl pl-8 pr-3.5 py-2 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">¿Quién lo pagó?</label>
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.name}>
                          👤 {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Dividir entre ({splitBetween.length} de {groups.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      Todos
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {groups.map((g) => {
                      const isSelected = splitBetween.includes(g.name);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleSplitGroup(g.name)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">👤 {g.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 font-black text-white text-sm rounded-xl shadow-md transition disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? 'Guardando...' : 'Registrar Gasto (€)'}
                </button>
              </form>
            )}

            {/* Pestaña 2: Balances y Liquidación de Deudas */}
            {activeTab === 'balances' && (
              <div className="space-y-4">
                {/* Deudas Simplificadas */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80">
                  <h4 className="text-xs font-black uppercase text-emerald-900 mb-2.5 flex items-center gap-1.5">
                    <span>💳</span> Liquidación Simplificada de Cuentas
                  </h4>
                  {settlements.length === 0 ? (
                    <p className="text-xs font-semibold text-emerald-800">
                      ✨ ¡Todas las cuentas están al día y equilibradas!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {settlements.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200 text-xs font-bold shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-slate-800">👤 {s.from}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-emerald-900">👤 {s.to}</span>
                          </div>
                          <span className="font-black text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                            {s.amount.toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saldos Netos por Grupo */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Saldos Netos</h4>
                  <div className="space-y-1.5">
                    {Object.entries(netBalances).map(([groupName, bal]) => {
                      const isPositive = bal > 0.01;
                      const isZero = Math.abs(bal) <= 0.01;
                      return (
                        <div
                          key={groupName}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                        >
                          <span className="font-bold text-slate-800">👤 {groupName}</span>
                          <span
                            className={`font-black ${
                              isZero
                                ? 'text-slate-500'
                                : isPositive
                                ? 'text-emerald-700'
                                : 'text-red-600'
                            }`}
                          >
                            {isPositive ? `+${bal.toFixed(2)} € (a favor)` : isZero ? '0.00 € (al día)' : `${bal.toFixed(2)} € (a pagar)`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña 3: Historial de Gastos */}
            {activeTab === 'history' && (
              <div className="space-y-2">
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No hay gastos registrados todavía.
                  </div>
                ) : (
                  expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 text-xs transition space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-900 text-sm">{exp.description}</span>
                        <span className="font-black text-emerald-800 text-sm">{Number(exp.amount).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                        <span>
                          Pagó <b className="text-slate-700">{exp.paid_by}</b> · Dividido entre {exp.split_between?.length || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition cursor-pointer"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
