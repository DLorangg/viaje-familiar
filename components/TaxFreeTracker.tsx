// components/TaxFreeTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, Sparkles, Plane, HelpCircle, Receipt, ArrowRight, ShoppingBag } from 'lucide-react';

interface TaxFreeItem {
  id: string;
  store: string;
  amount: number;
  vatRate: number; // 0.21 (21%) o 0.10 (10%)
  date: string;
  isValidated: boolean;
}

interface TaxFreeTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_TAX_FREE_KEY = 'san_fermin_2027_tax_free_purchases';

const DEFAULT_ITEMS: TaxFreeItem[] = [
  {
    id: '1',
    store: 'El Corte Inglés (Pamplona / Madrid)',
    amount: 150,
    vatRate: 0.21,
    date: '08/07/2027',
    isValidated: false,
  },
];

export default function TaxFreeTracker({ isOpen, onClose }: TaxFreeTrackerProps) {
  const [items, setItems] = useState<TaxFreeItem[]>([]);
  const [store, setStore] = useState('');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState<number>(0.21);
  const [activeTab, setActiveTab] = useState<'tracker' | 'guide'>('tracker');

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_TAX_FREE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
  }, []);

  const saveItems = (newItems: TaxFreeItem[]) => {
    setItems(newItems);
    localStorage.setItem(LOCAL_STORAGE_TAX_FREE_KEY, JSON.stringify(newItems));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!store.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor ingresa una tienda y un monto válido en €.');
      return;
    }

    const newItem: TaxFreeItem = {
      id: String(Date.now()),
      store: store.trim(),
      amount: numAmount,
      vatRate,
      date: new Date().toLocaleDateString('es-AR'),
      isValidated: false,
    };

    saveItems([newItem, ...items]);
    setStore('');
    setAmount('');
  };

  const handleToggleValidation = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, isValidated: !item.isValidated } : item
    );
    saveItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('¿Eliminar este registro de compra?')) {
      const updated = items.filter((item) => item.id !== id);
      saveItems(updated);
    }
  };

  // Cálculo de totales y reintegro estimado de IVA
  const totalPurchases = items.reduce((acc, i) => acc + i.amount, 0);
  const totalEstimatedRefund = items.reduce((acc, i) => {
    const vat = i.amount - i.amount / (1 + i.vatRate);
    // Operadores suelen cobrar una pequeña comisión de gestión administrativa (~15%)
    const netRefund = vat * 0.85;
    return acc + netRefund;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Gestor de Tax Free DIVA (España)</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Recupero de IVA de compras para residentes fuera de la UE (Argentina)
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

          {/* Selector de Pestañas */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={`py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'tracker'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Mis Compras ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'guide'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              Guía Aeropuerto Barajas
            </button>
          </div>

          {activeTab === 'tracker' ? (
            <div className="mt-4 space-y-4">
              
              {/* Tarjetas de Resumen */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Compras
                  </span>
                  <span className="text-xl font-black text-slate-900 block mt-1 tabular-nums">
                    {totalPurchases.toFixed(2)} €
                  </span>
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Reintegro Estimado (IVA)
                  </span>
                  <span className="text-xl font-black text-emerald-950 block mt-1 tabular-nums">
                    ~ {totalEstimatedRefund.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Formulario para Cargar Compra */}
              <form onSubmit={handleAddItem} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  + Registrar nuevo ticket / formulario DIVA
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      placeholder="Tienda (ej. Zara Gran Vía)"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      placeholder="Monto total €"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={vatRate}
                      onChange={(e) => setVatRate(parseFloat(e.target.value))}
                      className="bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value={0.21}>21% (Ropa/Electrónica)</option>
                      <option value={0.10}>10% (Alimentos/Otros)</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista de Compras */}
              <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-semibold">
                    No tenés compras registradas aún. Al comprar en España, pedí tu factura Tax Free DIVA.
                  </p>
                ) : (
                  items.map((item) => {
                    const vat = item.amount - item.amount / (1 + item.vatRate);
                    const netRefund = vat * 0.85;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          item.isValidated
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleValidation(item.id)}
                            className="text-emerald-700 shrink-0 cursor-pointer"
                            title={item.isValidated ? 'Marcar como pendiente' : 'Marcar como validado en Barajas'}
                          >
                            {item.isValidated ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-600" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <h5 className="font-extrabold text-xs text-slate-900 truncate">
                              {item.store}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              {item.date} · IVA {(item.vatRate * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-black text-xs text-slate-900 block tabular-nums">
                              {item.amount.toFixed(2)} €
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 block tabular-nums">
                              Devolución: ~ {netRefund.toFixed(2)} €
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-300 hover:text-red-600 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          ) : (
            /* Pestaña de Guía Aeropuerto Barajas DIVA */
            <div className="mt-4 space-y-3.5 max-h-[50vh] overflow-y-auto pr-1 text-xs text-slate-700 leading-relaxed">
              
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                <h4 className="font-black text-amber-950 flex items-center gap-1.5 text-xs mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" /> ¿Cómo funciona el Tax Free en España?
                </h4>
                <p className="text-[11px] text-amber-900 font-medium">
                  Los viajeros residentes en Argentina no pagan el IVA de sus compras de bienes que se lleven en el equipaje. ¡No hay monto mínimo de compra en España!
                </p>
              </div>

              {/* Pasos */}
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-black text-slate-900 block mb-1">1. Al comprar en las tiendas:</span>
                  <p className="text-[11px] text-slate-600">
                    Mostrá tu pasaporte argentino y pedí el <strong>"Formulario Electrónico DIVA"</strong> (te entregarán un ticket con código de barras o código QR).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-black text-slate-900 block mb-1">2. En el Aeropuerto de Madrid Barajas (Antes de despachar valijas):</span>
                  <p className="text-[11px] text-slate-600">
                    Buscá los <strong>quioscos táctiles interactivos DIVA</strong> (están señalizados junto a los mostradores de facturación en Terminal 4 planta 2 o Terminal 1 planta 1).
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Escaneá el código de barras/QR de cada formulario en la máquina. Aparecerá el tilde verde: <em>"Formulario DIVA validado electrónicamente"</em>. ¡Listo, no hace falta hacer fila en aduana!
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-black text-slate-900 block mb-1">3. Cobro del dinero:</span>
                  <p className="text-[11px] text-slate-600">
                    Una vez pasado el control de seguridad, acercate a las oficinas del operador (Global Blue, Planet o Innova Tax Free) en la zona de embarque para recibir el reembolso en efectivo en euros o acreditado directamente en tu tarjeta de crédito.
                  </p>
                </div>
              </div>

            </div>
          )}

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
