// components/WeatherWidget.tsx
'use client';

import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudDrizzle,
  Sparkles,
  Shirt,
  Thermometer,
} from 'lucide-react';

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  city?: string;
}

interface ClimateProfile {
  tempRange: string;
  condition: string;
  clothingTip: string;
  icon: LucideIcon;
  badgeStyle: string;
  iconStyle: string;
}

const DEFAULT_PROFILE: ClimateProfile = {
  tempRange: '18°C – 30°C',
  condition: 'Verano español templado/cálido',
  clothingTip: 'Ropa liviana de verano, calzado cómodo para caminar y abrigo fino para la noche.',
  icon: Sun,
  badgeStyle: 'bg-amber-50/90 text-amber-950 border-amber-200/80',
  iconStyle: 'text-amber-500',
};

function getJulyClimateProfile(cityName?: string): ClimateProfile {
  const name = (cityName || '').toLowerCase();

  if (name.includes('pamplona') || name.includes('iruña') || name.includes('cáseda') || name.includes('navarra') || name.includes('olite')) {
    return {
      tempRange: '16°C – 29°C',
      condition: 'Soleado / Noches frescas (15°C)',
      clothingTip: 'Ropa blanca liviana, calzado cerrado cómodo y abrigo fino para la noche.',
      icon: Sun,
      badgeStyle: 'bg-amber-50/90 text-amber-950 border-amber-200/80',
      iconStyle: 'text-amber-500',
    };
  }

  if (name.includes('san sebastián') || name.includes('donostia') || name.includes('guipúzcoa') || name.includes('gipuzkoa')) {
    return {
      tempRange: '18°C – 25°C',
      condition: 'Templado marítimo y brisa costera',
      clothingTip: 'Ropa de verano, traje de baño para La Concha y campera liviana/rompevientos.',
      icon: CloudSun,
      badgeStyle: 'bg-sky-50/90 text-sky-950 border-sky-200/80',
      iconStyle: 'text-sky-600',
    };
  }

  if (name.includes('bilbao') || name.includes('bilbo') || name.includes('santander') || name.includes('cantabria')) {
    return {
      tempRange: '17°C – 26°C',
      condition: 'Templado costero (posible txirimiri)',
      clothingTip: 'Ropa fresca, calzado cerrado cómodo y paraguas compacto.',
      icon: CloudDrizzle,
      badgeStyle: 'bg-blue-50/90 text-blue-950 border-blue-200/80',
      iconStyle: 'text-blue-500',
    };
  }

  if (name.includes('zaragoza') || name.includes('aragón')) {
    return {
      tempRange: '20°C – 34°C',
      condition: 'Muy caluroso y seco (viento Cierzo)',
      clothingTip: 'Ropa muy liviana, anteojos de sol, gorro y protector solar indispensable.',
      icon: Sun,
      badgeStyle: 'bg-amber-100/90 text-amber-950 border-amber-300',
      iconStyle: 'text-amber-600',
    };
  }

  if (name.includes('barcelona') || name.includes('cataluña') || name.includes('catalunya') || name.includes('costa brava')) {
    return {
      tempRange: '22°C – 30°C',
      condition: 'Caluroso y húmedo mediterráneo',
      clothingTip: 'Ropa fresca de lino/algodón, calzado liviano y malla para la playa.',
      icon: Sun,
      badgeStyle: 'bg-orange-50/90 text-orange-950 border-orange-200/80',
      iconStyle: 'text-orange-500',
    };
  }

  if (name.includes('granada') || name.includes('sevilla') || name.includes('córdoba') || name.includes('andalucía')) {
    return {
      tempRange: '19°C – 37°C',
      condition: 'Calor seco extremo de siesta (14-18h)',
      clothingTip: 'Ropa ultraliviana, hidratación constante y sombrero para La Alhambra.',
      icon: Sun,
      badgeStyle: 'bg-amber-100/90 text-amber-950 border-amber-400/80',
      iconStyle: 'text-amber-600',
    };
  }

  if (name.includes('madrid') || name.includes('toledo') || name.includes('segovia')) {
    return {
      tempRange: '21°C – 36°C',
      condition: 'Muy caluroso y seco de verano',
      clothingTip: 'Ropa fresca, evitar sol entre 14 y 18 h y buscar terrazas con sombra.',
      icon: Sun,
      badgeStyle: 'bg-orange-50/90 text-orange-950 border-orange-200/80',
      iconStyle: 'text-orange-500',
    };
  }

  if (name.includes('buenos aires') || name.includes('ezeiza') || name.includes('viedma') || name.includes('bahía blanca')) {
    return {
      tempRange: '8°C – 15°C',
      condition: 'Invierno templado / fresco',
      clothingTip: 'Campera abrigada para el tramo de salida / regreso en Ezeiza.',
      icon: Cloud,
      badgeStyle: 'bg-slate-100 text-slate-800 border-slate-200',
      iconStyle: 'text-slate-600',
    };
  }

  return DEFAULT_PROFILE;
}

export default function WeatherWidget({ city }: WeatherWidgetProps) {
  const profile = useMemo(() => getJulyClimateProfile(city), [city]);
  const WeatherIcon = profile.icon;

  return (
    <div className="space-y-2 mt-1">
      {/* Badge Principal del Rango Térmico de Julio */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-2xs transition ${profile.badgeStyle}`}
        title={`Clima estimado de Julio en ${city || 'destino'}`}
      >
        <div className="flex items-center gap-1.5">
          <WeatherIcon className={`w-4 h-4 shrink-0 ${profile.iconStyle}`} />
          <span className="font-black text-xs sm:text-sm tracking-tight tabular-nums">
            {profile.tempRange}
          </span>
        </div>

        <span className="text-[11px] font-bold text-current opacity-90 hidden sm:inline">
          · {profile.condition}
        </span>
      </div>

      {/* Pastilla con Recomendación de Ropa */}
      <div className="flex items-start gap-1.5 p-2 bg-slate-50 border border-slate-200/70 rounded-xl text-[11px] text-slate-700 leading-snug">
        <Shirt className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-950">Tip de Ropa: </span>
          <span>{profile.clothingTip}</span>
        </div>
      </div>
    </div>
  );
}
