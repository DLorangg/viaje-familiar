// components/RouteCalculator.tsx
'use client';

import { useState } from 'react';
import { Car, Fuel, Clock, MapPin, Navigation, Sparkles, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';

interface RouteCalculatorProps {
  city?: string;
  dayNumber?: number;
}

interface ScenicStop {
  name: string;
  desc: string;
  detourMin: string;
}

interface RoadSegment {
  routeTitle: string;
  distanceKm: number;
  driveTime: string;
  highway: string;
  tollsCost: number;
  scenicStops: ScenicStop[];
  tip: string;
}

const ROAD_SEGMENTS: Record<string, RoadSegment> = {
  'donostia': {
    routeTitle: 'Pamplona ➔ San Sebastián (Donostia)',
    distanceKm: 85,
    driveTime: '1h 10m',
    highway: 'Autovía A-15 (Autovía de Leitzaran) · Sin peaje',
    tollsCost: 0,
    scenicStops: [
      { name: 'Mirador del Valle de Leitzaran', desc: 'Paisaje montañoso verde esmeralda y viaductos espectaculares', detourMin: '5 min' },
      { name: 'Playa de Zarautz / Getaria', desc: 'Pueblos marineros con parrillas de pescado a orillas del Cantábrico', detourMin: '20 min' },
    ],
    tip: 'La A-15 atraviesa túneles de montaña imponentes. Al entrar en Donostia, estacionar en parking subterráneo (ej. San Martín o La Concha).'
  },
  'bilbao': {
    routeTitle: 'Donostia ➔ Bilbao (Bizkaia)',
    distanceKm: 102,
    driveTime: '1h 15m (Rápida) / 2h 30m (Costa)',
    highway: 'AP-8 Autopista del Cantábrico (~8.50 €) o N-634 Costa',
    tollsCost: 8.50,
    scenicStops: [
      { name: 'San Juan de Gaztelugatxe', desc: 'La mítica ermita sobre el peñón de Rocadragón (Juego de Tronos)', detourMin: '35 min' },
      { name: 'Gernika-Lumo', desc: 'El Árbol de Gernika y la Casa de Juntas histórica', detourMin: '15 min' },
      { name: 'Zumaia Flysch', desc: 'Acantilados geológicos milenarios', detourMin: '15 min' },
    ],
    tip: 'Si hay tiempo, tomar el desvío costero por Gernika y Gaztelugatxe. ¡Vistas del Cantábrico que quitan el aliento!'
  },
  'cantabria': {
    routeTitle: 'Bilbao ➔ Cantabria / Santander',
    distanceKm: 100,
    driveTime: '1h 10m',
    highway: 'Autovía A-8 (Sin peaje)',
    tollsCost: 0,
    scenicStops: [
      { name: 'Castro Urdiales', desc: 'Puerto pesquero e iglesia gótica de Santa María sobre el mar', detourMin: '10 min' },
      { name: 'Santillana del Mar', desc: 'Villa medieval de calles empedradas intactas y Museo de Altamira', detourMin: '25 min' },
      { name: 'Comillas (El Capricho de Gaudí)', desc: 'Palacete modernista único rodeado de jardines', detourMin: '30 min' },
    ],
    tip: 'Ruta directa en autovía sin peaje con accesos rápidos a las mejores playas y acantilados del norte.'
  },
  'cáseda': {
    routeTitle: 'Pamplona ➔ Cáseda & Comarca de Sangüesa',
    distanceKm: 55,
    driveTime: '45 min',
    highway: 'Autovía A-21 y NA-534 · Sin peaje',
    tollsCost: 0,
    scenicStops: [
      { name: 'Castillo de Javier', desc: 'Fortaleza medieval cuna de San Francisco Javier', detourMin: '10 min' },
      { name: 'Foz de Lumbier', desc: 'Desfiladero natural del río Salazar con nidos de buitres leonados', detourMin: '15 min' },
      { name: 'Monasterio de Leyre', desc: 'Cripta románica con vistas al embalse de Yesa', detourMin: '15 min' },
    ],
    tip: 'Carreteras comarcales muy tranquilas y bien asfaltadas entre campos de trigo y viñedos navarros.'
  },
  'zaragoza': {
    routeTitle: 'Pamplona / Navarra ➔ Zaragoza',
    distanceKm: 178,
    driveTime: '1h 50m',
    highway: 'Autopista AP-15 / AP-68 (~12.80 €) o libre por N-121',
    tollsCost: 12.80,
    scenicStops: [
      { name: 'Parque Natural Bardenas Reales', desc: 'El asombroso paisaje desértico de formaciones arcillosas (Castildetierra)', detourMin: '30 min' },
      { name: 'Tudela', desc: 'Capital de la verdura de Navarra con su catedral y judería', detourMin: '10 min' },
      { name: 'Olite (Palacio Real)', desc: 'Espectacular castillo gótico de cuento de hadas', detourMin: '10 min' },
    ],
    tip: 'Parada casi obligatoria en Olite para ver su castillo medieval antes de descender al valle del Ebro.'
  },
  'barcelona': {
    routeTitle: 'Zaragoza ➔ Barcelona',
    distanceKm: 315,
    driveTime: '3h 15m',
    highway: 'Autopista AP-2 (Liberalizada · Sin peaje)',
    tollsCost: 0,
    scenicStops: [
      { name: 'Lleida (Seu Vella)', desc: 'Antigua catedral fortaleza sobre la colina', detourMin: '10 min' },
      { name: 'Montaña de Montserrat', desc: 'Macizo rocoso y monasterio benedictino mágico', detourMin: '30 min' },
    ],
    tip: 'La AP-2 ya no tiene peajes. Tráfico fluido a través de la llanura de los Monegros y Cataluña.'
  },
  'granada': {
    routeTitle: 'Madrid ➔ Granada',
    distanceKm: 420,
    driveTime: '4h 15m',
    highway: 'Autovía de Andalucía A-4 y A-44 · Sin peaje',
    tollsCost: 0,
    scenicStops: [
      { name: 'Puerto Lápice (Molinos de Don Quijote)', desc: 'Venta manchega tradicional de Don Quijote', detourMin: '5 min' },
      { name: 'Paso de Despeñaperros', desc: 'Frontera natural y desfiladero histórico hacia Andalucía', detourMin: '0 min (en ruta)' },
      { name: 'Jaén (Catedral del Renacimiento)', desc: 'Rodeada por el mar de olivos andaluces', detourMin: '15 min' },
    ],
    tip: 'Excelente autovía de doble vía sin costo. Planear parada a mitad de camino en La Mancha.'
  },
};

export default function RouteCalculator({ city, dayNumber }: RouteCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fuelPrice, setFuelPrice] = useState<number>(1.65); // €/L
  const [consumption, setConsumption] = useState<number>(6.5); // L/100km

  const normalizedCity = (city || '').toLowerCase();
  let segmentKey = 'donostia';

  if (normalizedCity.includes('bilbao') || normalizedCity.includes('bilbo')) segmentKey = 'bilbao';
  else if (normalizedCity.includes('cantabria') || normalizedCity.includes('santander')) segmentKey = 'cantabria';
  else if (normalizedCity.includes('cáseda') || normalizedCity.includes('sangüesa') || normalizedCity.includes('javier')) segmentKey = 'cáseda';
  else if (normalizedCity.includes('zaragoza')) segmentKey = 'zaragoza';
  else if (normalizedCity.includes('barcelona')) segmentKey = 'barcelona';
  else if (normalizedCity.includes('granada') || normalizedCity.includes('sevilla')) segmentKey = 'granada';
  else if (normalizedCity.includes('donostia') || normalizedCity.includes('san sebastián')) segmentKey = 'donostia';

  const segment = ROAD_SEGMENTS[segmentKey] || ROAD_SEGMENTS.donostia;

  // Cálculo de combustible estimado
  const fuelLiters = (segment.distanceKm / 100) * consumption;
  const estimatedFuelCost = fuelLiters * fuelPrice;
  const totalCostEuro = estimatedFuelCost + segment.tollsCost;

  return (
    <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl overflow-hidden transition shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-sky-100/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-sky-700 text-white rounded-xl shrink-0">
            <Car className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-sky-950 flex items-center gap-1.5">
              <span>🚗 Ruta en Auto: {segment.routeTitle}</span>
            </h4>
            <p className="text-[11px] text-sky-800 font-medium">
              {segment.distanceKm} km · {segment.driveTime} · Est. {totalCostEuro.toFixed(2)} € (Nafta + Peajes)
            </p>
          </div>
        </div>

        <div className="p-1 text-sky-800 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-sky-200/60 bg-white/80 space-y-3.5 text-xs">
          
          {/* Métricas clave */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Distancia</span>
              <span className="font-black text-slate-900 text-sm tabular-nums">{segment.distanceKm} km</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo al Volante</span>
              <span className="font-black text-slate-900 text-sm">{segment.driveTime}</span>
            </div>
            <div className="p-2 bg-sky-50 border border-sky-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-sky-800 block">Peajes Estimados</span>
              <span className="font-black text-sky-950 text-sm tabular-nums">
                {segment.tollsCost > 0 ? `${segment.tollsCost.toFixed(2)} €` : '0.00 € (Libre)'}
              </span>
            </div>
          </div>

          {/* Autopista y Vía */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-slate-700">
            <Navigation className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Vía Principal: </span>
              <span>{segment.highway}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">{segment.tip}</p>
            </div>
          </div>

          {/* Paradas Escénicas en Ruta */}
          <div>
            <h5 className="font-black text-sky-950 flex items-center gap-1.5 mb-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Paradas Escénicas Recomendadas
            </h5>
            <div className="space-y-1.5">
              {segment.scenicStops.map((stop, idx) => (
                <div key={idx} className="p-2 bg-white rounded-xl border border-sky-200/70 flex justify-between items-start gap-2 shadow-2xs">
                  <div>
                    <span className="font-black text-slate-900 text-xs">📍 {stop.name}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">{stop.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                    +{stop.detourMin}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimación de Costo Total */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
              <Fuel className="w-4 h-4 text-emerald-700" />
              <span>Gasto estimado tramo:</span>
            </div>
            <div className="text-right">
              <span className="font-black text-emerald-950 text-sm tabular-nums">
                ~ {totalCostEuro.toFixed(2)} €
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                ({estimatedFuelCost.toFixed(2)} € nafta + {segment.tollsCost.toFixed(2)} € peaje)
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
