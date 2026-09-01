// components/TimelineScroller.tsx
'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseTransports, TRANSPORT_OPTIONS, TripDay } from '@/lib/transports';
import PanuelicoIcon from '@/components/PanuelicoIcon';

interface TimelineScrollerProps {
  days: TripDay[];
  currentIndex: number;
  onSelectDay: (index: number) => void;
}

export default function TimelineScroller({
  days,
  currentIndex,
  onSelectDay,
}: TimelineScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeDayRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll para centrar el día activo cuando cambia el índice
  useEffect(() => {
    if (activeDayRef.current && scrollContainerRef.current) {
      activeDayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentIndex]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!days || days.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-2xs py-2.5 px-3 sm:px-6 relative">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        
        {/* Botón Flecha Izquierda (Desktop) */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="hidden md:flex p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition shrink-0"
          title="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Contenedor con Scroll Horizontal */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {days.map((day, idx) => {
            const isSelected = idx === currentIndex;
            const transportIds = parseTransports(day.transport_type);
            const isSanFerminDay =
              day.city.toLowerCase().includes('pamplona') ||
              day.city.toLowerCase().includes('iruña') ||
              day.city.toLowerCase().includes('cáseda') ||
              (day.day_number >= 5 && day.day_number <= 8);

            const selectedClass = isSanFerminDay
              ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-600/30 scale-[1.02]'
              : 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/30 scale-[1.02]';

            return (
              <button
                key={day.id || idx}
                ref={isSelected ? activeDayRef : null}
                type="button"
                onClick={() => onSelectDay(idx)}
                className={`flex flex-col shrink-0 px-3.5 py-2 rounded-2xl border text-left transition-all duration-200 cursor-pointer min-w-[124px] sm:min-w-[136px] ${
                  isSelected
                    ? selectedClass
                    : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Header de la tarjeta: Día y Pañuelo si es San Fermín */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isSanFerminDay
                        ? 'bg-red-100 text-red-700 font-extrabold border border-red-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Día {day.day_number}
                  </span>
                  {isSanFerminDay && (
                    <div title="San Fermín / Iruña">
                      <PanuelicoIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Fecha */}
                <div
                  className={`text-xs font-bold truncate leading-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {day.date_text || `Día ${day.day_number}`}
                </div>

                {/* Ciudad */}
                <div
                  className={`text-[11px] truncate font-medium mt-0.5 ${
                    isSelected
                      ? isSanFerminDay
                        ? 'text-red-100'
                        : 'text-emerald-100'
                      : 'text-slate-500'
                  }`}
                >
                  {day.city || 'Destino'}
                </div>

                {/* Íconos de Transporte */}
                <div className="flex items-center gap-1 mt-1.5 pt-1 border-t border-current/15">
                  {transportIds.map((tId) => {
                    const opt = TRANSPORT_OPTIONS[tId] || TRANSPORT_OPTIONS.walk;
                    const IconComp = opt.icon;
                    return (
                      <div
                        key={tId}
                        className={`p-0.5 rounded ${
                          isSelected ? 'text-white' : 'text-slate-500'
                        }`}
                        title={opt.label}
                      >
                        <IconComp className="w-3 h-3" />
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Botón Flecha Derecha (Desktop) */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="hidden md:flex p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
          title="Desplazar a la derecha"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
