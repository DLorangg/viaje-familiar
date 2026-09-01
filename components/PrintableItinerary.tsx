// components/PrintableItinerary.tsx
'use client';

import { X, Printer, Calendar, MapPin, Building2, Plane } from 'lucide-react';
import { TripDay, parseTransports, TRANSPORT_OPTIONS } from '@/lib/transports';
import PanuelicoIcon from '@/components/PanuelicoIcon';

interface PrintableItineraryProps {
  isOpen: boolean;
  onClose: () => void;
  days: TripDay[];
  groupName: string;
}

export default function PrintableItinerary({
  isOpen,
  onClose,
  days,
  groupName,
}: PrintableItineraryProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col justify-between print:max-w-none print:max-h-none print:shadow-none print:border-none print:p-4 print:my-0 print:rounded-none">
        
        {/* Header no imprimible */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Itinerario Completo para Imprimir / PDF</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Formato ultra-compacto optimizado para 2 páginas A4 de bolsillo
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Encabezado visible en la impresión */}
        <div className="hidden print:block pb-3 mb-3 border-b-2 border-slate-900">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                San Fermín & España 2027 · Itinerario Familiar
              </h1>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Grupo: <b>{groupName}</b> · 2 al 25 de Julio de 2027 (24 días)
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-500">
              ¡Gora San Fermín! 🧣
            </div>
          </div>
        </div>

        {/* Grilla compacta de días */}
        <div className="overflow-y-auto max-h-[65vh] pr-1 print:max-h-none print:overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 print:gap-2">
            {days.map((day) => {
              const isSanFermin =
                day.city?.toLowerCase().includes('pamplona') ||
                day.city?.toLowerCase().includes('iruña') ||
                day.city?.toLowerCase().includes('cáseda') ||
                (day.day_number >= 5 && day.day_number <= 8);

              const transports = parseTransports(day.transport_type);

              return (
                <div
                  key={day.id || day.day_number}
                  className={`p-3 rounded-2xl border text-xs break-inside-avoid print:p-2.5 print:rounded-xl ${
                    isSanFermin
                      ? 'bg-red-50/60 border-red-200 print:bg-slate-50 print:border-slate-300'
                      : 'bg-slate-50 border-slate-200 print:bg-white print:border-slate-200'
                  }`}
                >
                  {/* Encabezado del día */}
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black text-[11px] px-2 py-0.5 rounded-full uppercase ${
                          isSanFermin
                            ? 'bg-red-600 text-white print:bg-slate-800'
                            : 'bg-emerald-800 text-white print:bg-slate-700'
                        }`}
                      >
                        Día {day.day_number}
                      </span>
                      <span className="font-bold text-slate-600 print:text-slate-800">
                        {day.date_text}
                      </span>
                    </div>

                    {/* Ciudad */}
                    <span className="font-extrabold text-slate-900 text-xs">
                      📍 {day.city}
                    </span>
                  </div>

                  {/* Vuelo o Transporte */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 my-1">
                    {day.flight_code && (
                      <span className="bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                        ✈️ {day.flight_code}
                      </span>
                    )}
                    {transports.map((t) => (
                      <span key={t} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                        {TRANSPORT_OPTIONS[t]?.emoji} {TRANSPORT_OPTIONS[t]?.shortLabel}
                      </span>
                    ))}
                    {day.accommodation_name && (
                      <span className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded truncate max-w-[180px]">
                        🏨 {day.accommodation_name}
                      </span>
                    )}
                  </div>

                  {/* Actividad */}
                  <p className="text-slate-700 text-[11px] leading-relaxed mt-1 line-clamp-3 print:line-clamp-none font-medium">
                    {day.activity || 'Sin actividades registradas.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer no imprimible */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 print:hidden">
          <span className="text-xs text-slate-400 font-semibold">
            {days.length} días estructurados
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 font-bold text-white text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> <span>Imprimir Itinerario</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
