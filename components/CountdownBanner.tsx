// components/CountdownBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Flame, Clock } from 'lucide-react';
import PanuelicoIcon from '@/components/PanuelicoIcon';

const CHUPINAZO_TARGET_DATE = new Date('2027-07-06T12:00:00+02:00').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const difference = CHUPINAZO_TARGET_DATE - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isFinished: false };
    };

    // Calcular inmediatamente al montar
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return (
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-red-800 text-white py-2.5 px-4 shadow-inner border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-emerald-100">
          <Clock className="w-4 h-4 animate-spin text-emerald-300" />
          <span>Calculando tiempo para San Fermín...</span>
        </div>
      </div>
    );
  }

  if (timeLeft.isFinished) {
    return (
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white py-2.5 px-4 shadow-inner border-b border-red-800 flex items-center justify-center gap-2.5 text-sm font-black animate-pulse">
        <PanuelicoIcon className="w-5 h-5" />
        <span>¡¡VIVA SAN FERMÍN!! ¡¡GORA SAN FERMÍN!! 🍾🎉🚀</span>
        <PanuelicoIcon className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-red-900 text-white py-2.5 px-3 sm:px-6 shadow-md border-b border-emerald-950/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Título del evento con PanuelicoIcon */}
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="p-1.5 bg-white/10 rounded-xl backdrop-blur-xs flex items-center justify-center border border-white/10 shadow-xs">
            <PanuelicoIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <span className="text-xs sm:text-sm font-black tracking-wide uppercase text-white drop-shadow-xs">
                Cuenta Regresiva al Txupinazo (Iruña)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <p className="text-[11px] text-emerald-100/90 font-medium">
              Iruña / Pamplona · Martes 6 de Julio de 2027 · 12:00 h
            </p>
          </div>
        </div>

        {/* Cajas de Tiempo Restante */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Días */}
          <div className="flex flex-col items-center bg-black/35 backdrop-blur-xs border border-white/20 px-2.5 py-1 rounded-xl min-w-[50px] sm:min-w-[58px] shadow-xs">
            <span className="text-base sm:text-lg font-black leading-tight text-amber-300 tracking-tight tabular-nums">
              {timeLeft.days}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Días</span>
          </div>

          <span className="font-bold text-emerald-300/80 text-sm sm:text-base">:</span>

          {/* Horas */}
          <div className="flex flex-col items-center bg-black/35 backdrop-blur-xs border border-white/20 px-2.5 py-1 rounded-xl min-w-[44px] sm:min-w-[50px] shadow-xs">
            <span className="text-base sm:text-lg font-black leading-tight text-white tracking-tight tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Hs</span>
          </div>

          <span className="font-bold text-emerald-300/80 text-sm sm:text-base">:</span>

          {/* Minutos */}
          <div className="flex flex-col items-center bg-black/35 backdrop-blur-xs border border-white/20 px-2.5 py-1 rounded-xl min-w-[44px] sm:min-w-[50px] shadow-xs">
            <span className="text-base sm:text-lg font-black leading-tight text-white tracking-tight tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Min</span>
          </div>

          <span className="font-bold text-emerald-300/80 text-sm sm:text-base">:</span>

          {/* Segundos */}
          <div className="flex flex-col items-center bg-black/35 backdrop-blur-xs border border-white/20 px-2.5 py-1 rounded-xl min-w-[44px] sm:min-w-[50px] shadow-xs">
            <span className="text-base sm:text-lg font-black leading-tight text-white tracking-tight tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Seg</span>
          </div>
        </div>

      </div>
    </div>
  );
}
