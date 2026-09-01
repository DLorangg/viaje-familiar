// components/CurrencyConverter.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Coins, ArrowRightLeft, Settings2, RefreshCw, Check } from 'lucide-react';

interface CurrencyConverterProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_RATES_KEY = 'san_fermin_2027_currency_rates';

interface Rates {
  euroToArs: number;
  euroToUsd: number;
}

const DEFAULT_RATES: Rates = {
  euroToArs: 1450,
  euroToUsd: 1.08,
};

const PRESETS = [
  { label: '☕ Café / Zurito', euro: 2.5 },
  { label: '🍢 Pintxo + Caña', euro: 5.0 },
  { label: '🍽️ Menú del día', euro: 18.0 },
  { label: '🍷 Cena de Pintxos', euro: 35.0 },
  { label: '🏨 Noche de Hotel', euro: 90.0 },
];

export default function CurrencyConverter({ isOpen, onClose }: CurrencyConverterProps) {
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [euroAmount, setEuroAmount] = useState<string>('20');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [customArsRate, setCustomArsRate] = useState<string>('1450');
  const [customUsdRate, setCustomUsdRate] = useState<string>('1.08');

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_RATES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRates(parsed);
        setCustomArsRate(String(parsed.euroToArs || 1450));
        setCustomUsdRate(String(parsed.euroToUsd || 1.08));
      } catch {
        setRates(DEFAULT_RATES);
      }
    }
  }, []);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const ars = parseFloat(customArsRate.replace(',', '.'));
    const usd = parseFloat(customUsdRate.replace(',', '.'));
    if (!isNaN(ars) && ars > 0 && !isNaN(usd) && usd > 0) {
      const newRates = { euroToArs: ars, euroToUsd: usd };
      setRates(newRates);
      localStorage.setItem(LOCAL_STORAGE_RATES_KEY, JSON.stringify(newRates));
      setShowConfig(false);
    }
  };

  const parsedEuro = parseFloat(euroAmount.replace(',', '.')) || 0;
  const convertedArs = Math.round(parsedEuro * rates.euroToArs);
  const convertedUsd = (parsedEuro * rates.euroToUsd).toFixed(2);

  if (!isOpen) return null;

  const addAmount = (val: number) => {
    const current = parseFloat(euroAmount.replace(',', '.')) || 0;
    setEuroAmount(String(current + val));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Conversor de Divisas (€)</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  1 € = ${rates.euroToArs.toLocaleString('es-AR')} ARS · ${rates.euroToUsd} USD
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

          {/* Formulario Principal de Conversión */}
          <div className="mt-5 space-y-4">
            
            {/* Input Euros */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Monto en Euros (€)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={euroAmount}
                  onChange={(e) => setEuroAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-2xl font-black text-slate-900 bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums"
                  autoFocus
                />
                <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-xl">€</span>
              </div>

              {/* Botones de incremento rápido */}
              <div className="flex gap-1.5 mt-2">
                {[1, 5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addAmount(val)}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    +{val}€
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setEuroAmount('0')}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Cero
                </button>
              </div>
            </div>

            {/* Resultados de Conversión */}
            <div className="grid grid-cols-2 gap-3">
              {/* Pesos Argentinos */}
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Pesos Argentinos</span>
                <span className="text-xl font-black text-emerald-950 block mt-1 tabular-nums">
                  ${convertedArs.toLocaleString('es-AR')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                  @ ${rates.euroToArs} / €
                </span>
              </div>

              {/* Dólares Estadounidenses */}
              <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200">
                <span className="text-[11px] font-bold text-sky-800 uppercase block">Dólares (USD)</span>
                <span className="text-xl font-black text-sky-950 block mt-1 tabular-nums">
                  ${convertedUsd}
                </span>
                <span className="text-[10px] text-sky-700 font-semibold mt-0.5 block">
                  @ ${rates.euroToUsd} / €
                </span>
              </div>
            </div>

            {/* Presets habituales del viaje */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Gastos habituales de referencia
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {PRESETS.map((p, idx) => {
                  const ars = Math.round(p.euro * rates.euroToArs);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEuroAmount(String(p.euro))}
                      className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold transition cursor-pointer"
                    >
                      <span className="text-slate-800">{p.label} ({p.euro} €)</span>
                      <span className="font-bold text-emerald-800">${ars.toLocaleString('es-AR')} ARS</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configuración de Cotizaciones */}
            {showConfig ? (
              <form onSubmit={handleSaveRates} className="p-3.5 bg-slate-100 rounded-2xl border border-slate-300 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800">Ajustar tipo de cambio</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomArsRate(String(DEFAULT_RATES.euroToArs));
                      setCustomUsdRate(String(DEFAULT_RATES.euroToUsd));
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
                  >
                    Restablecer
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">1 € en ARS</label>
                    <input
                      type="number"
                      step="any"
                      value={customArsRate}
                      onChange={(e) => setCustomArsRate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">1 € en USD</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customUsdRate}
                      onChange={(e) => setCustomUsdRate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="px-3 py-1 text-xs text-slate-500 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Guardar Cotización
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-500" /> Ajustar cotizaciones (€ / ARS / USD)
              </button>
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
