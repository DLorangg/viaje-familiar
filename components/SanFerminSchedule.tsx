// components/SanFerminSchedule.tsx
'use client';

import { useState } from 'react';
import { X, Sparkles, Clock, MapPin, AlertCircle, Calendar, Music, Flame, Shield } from 'lucide-react';
import PanuelicoIcon from '@/components/PanuelicoIcon';

interface SanFerminScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  initialDay?: '6' | '7' | '8' | '9';
}

interface ScheduleEvent {
  time: string;
  title: string;
  location: string;
  description: string;
  iconType: 'chupinazo' | 'music' | 'bull' | 'fire' | 'ceremony' | 'giants';
  highlight?: boolean;
}

const SCHEDULE_DATA: Record<'6' | '7' | '8' | '9', { title: string; subtitle: string; events: ScheduleEvent[] }> = {
  '6': {
    title: '6 de Julio · La Víspera y el Txupinazo',
    subtitle: 'El día más emocionante del año: el inicio de la fiesta universal',
    events: [
      {
        time: '10:00 - 11:45',
        title: 'La Espera Blanca en la Plaza',
        location: 'Plaza Consistorial y Plaza del Castillo',
        description: 'La marea blanca se congrega cantando y alzando los pañuelicos rojos al aire en las manos.',
        iconType: 'music',
      },
      {
        time: '12:00',
        title: '¡¡EL TXUPINAZO!!',
        location: 'Plaza Consistorial (Balcón del Ayuntamiento)',
        description: 'Al grito de "¡Pamploneses, Pamplonesas, Viva San Fermín! ¡Gora San Fermín!", estalla el cohete y toda la plaza se anuda el pañuelico rojo al cuello al unísono.',
        iconType: 'chupinazo',
        highlight: true,
      },
      {
        time: '12:15',
        title: 'Primera salida de la Comparsa de Gigantes y Cabezudos',
        location: 'Salida desde el Palacio de Ezpeleta (C/ Mayor)',
        description: 'Los reyes y reinas de cartón piedra bailan entre la multitud acompañados de gaiteros y txistularis.',
        iconType: 'giants',
      },
      {
        time: '13:00 - 17:00',
        title: 'El Gran Tardeo y Charangas de las Peñas',
        location: 'Calles San Nicolás, Estafeta, Comedias y Jarauta',
        description: 'Rutas de fritos, zuritos y pasacalles con las charangas de las 16 peñas oficiales.',
        iconType: 'music',
      },
      {
        time: '17:30',
        title: 'Desfile de Mulillas y Alguacilillos',
        location: 'Desde Plaza Consistorial a Plaza de Toros',
        description: 'Cortejo tradicional previo a la corrida de rejones con la banda La Pamplonesa.',
        iconType: 'ceremony',
      },
      {
        time: '20:00',
        title: 'Vísperas Solemnes de San Fermín y Riau-Riau',
        location: 'Capilla de San Fermín (Iglesia de San Lorenzo)',
        description: 'Canto del "Astrain" y emotivo homenaje religioso al Santo Morenito.',
        iconType: 'ceremony',
      },
      {
        time: '21:45',
        title: 'Primer Toro de Fuego',
        location: 'Plaza Consistorial y Cuesta de Santo Domingo',
        description: 'Armazón con pirotecnia y buscapiés llevado a hombros entre los corredores más jóvenes.',
        iconType: 'fire',
      },
      {
        time: '23:00',
        title: 'Gran Concurso Internacional de Fuegos Artificiales',
        location: 'Fosos de la Ciudadela',
        description: 'Espectáculo pirotécnico celestial. El mejor lugar para verlo es el césped de la Vuelta del Castillo.',
        iconType: 'fire',
        highlight: true,
      },
      {
        time: '23:30 - 04:00',
        title: 'Conciertos y Verbenas al Aire Libre',
        location: 'Plaza del Castillo, Plaza de los Fueros y Antoniutti',
        description: 'Escenarios en vivo con música vasca, rock, pop y orquestas populares.',
        iconType: 'music',
      },
    ],
  },
  '7': {
    title: '7 de Julio · Día Grande de San Fermín',
    subtitle: 'El día del Santo Patrón: fervor, tradición y el primer encierro del año',
    events: [
      {
        time: '06:45',
        title: 'Las Dianas Matutinas',
        location: 'Calles del Casco Viejo',
        description: 'La banda municipal "La Pamplonesa" despierta a la ciudad tocando por Santo Domingo y Mayor.',
        iconType: 'music',
      },
      {
        time: '07:55',
        title: 'Cántico a San Fermín ("A San Fermín pedimos...")',
        location: 'Hornacina de Santo Domingo',
        description: 'Los mozos cantan con el periódico en mano ante la imagen del Santo para pedir su protección.',
        iconType: 'ceremony',
      },
      {
        time: '08:00',
        title: 'PRIMER ENCIERRO DE SAN FERMÍN',
        location: 'Santo Domingo ➔ Mercaderes ➔ Estafeta ➔ Plaza de Toros',
        description: '848 metros de carrera vertiginosa de 6 toros bravos y 6 cabestros en apenas 2 minutos y medio.',
        iconType: 'bull',
        highlight: true,
      },
      {
        time: '08:15',
        title: 'Suelta de Vaquillas en el Ruedo',
        location: 'Plaza de Toros de Pamplona',
        description: 'Diversión popular con vaquillas para los asistentes en las gradas y el ruedo.',
        iconType: 'bull',
      },
      {
        time: '09:30',
        title: 'Desfile de la Comparsa de Gigantes y Cabezudos',
        location: 'Plaza del Ayuntamiento',
        description: 'Los kilikis y cabezudos persiguen alegremente con sus vergas de gomaespuma.',
        iconType: 'giants',
      },
      {
        time: '10:00',
        title: 'Solemne Procesión de San Fermín',
        location: 'Salida de la Parroquia de San Lorenzo',
        description: 'El Santo recorre las calles del Casco Antiguo entre pétalos, jotas emocionantes y txistularis.',
        iconType: 'ceremony',
        highlight: true,
      },
      {
        time: '13:30',
        title: 'Aperitivo y Almuerzo de San Fermín',
        location: 'Sociedades gastronómicas y restaurantes',
        description: 'Menú tradicional con pochas de Sangüesa, cordero al chilindrón o magras con tomate.',
        iconType: 'music',
      },
      {
        time: '21:45',
        title: 'Toro de Fuego',
        location: 'Plaza Consistorial',
        description: 'Carreras con fuegos artificiales de suelo para todas las familias.',
        iconType: 'fire',
      },
      {
        time: '23:00',
        title: 'Fuegos Artificiales de la Ciudadela',
        location: 'Parque de la Ciudadela',
        description: 'Segunda jornada del Concurso Internacional Pirotécnico.',
        iconType: 'fire',
      },
    ],
  },
  '8': {
    title: '8 de Julio · Fiesta y Tradición',
    subtitle: 'El ritmo no para: encierros, deportes rurales y cultura navarra',
    events: [
      {
        time: '06:45',
        title: 'Dianas con txistus y gaitas',
        location: 'Casco Antiguo',
        description: 'Comienzo musical del tercer día de fiestas.',
        iconType: 'music',
      },
      {
        time: '08:00',
        title: 'Segundo Encierro de Toros',
        location: 'Recorrido oficial de Santo Domingo a la Plaza de Toros',
        description: 'Carrera con ganadería de renombre (ej. Cebada Gago o Miura).',
        iconType: 'bull',
        highlight: true,
      },
      {
        time: '09:30',
        title: 'Gigantes y Cabezudos en los Barrios',
        location: 'Calles del Ensanche y Casco Viejo',
        description: 'Baile de las 4 parejas de gigantes (Europeos, Asiáticos, Africanos y Americanos).',
        iconType: 'giants',
      },
      {
        time: '12:00',
        title: 'Exhibición de Deporte Rural Vasco (Herri Kirolak)',
        location: 'Plaza de los Fueros',
        description: 'Aizkolaris (corte de troncos con hacha), harrijasotzailes (levantamiento de piedras cilíndricas y esféricas) y sokatira.',
        iconType: 'ceremony',
        highlight: true,
      },
      {
        time: '18:30',
        title: 'Corrida de Toros y Salida de Peñas',
        location: 'Plaza de Toros ➔ C/ Olite ➔ Casco Viejo',
        description: 'La salida de las peñas a las 20:30 h con pancartas y música es pura energía.',
        iconType: 'bull',
      },
      {
        time: '21:45',
        title: 'Toro de Fuego',
        location: 'Plaza Consistorial',
        description: 'Pirotecnia nocturna por Santo Domingo.',
        iconType: 'fire',
      },
      {
        time: '23:00',
        title: 'Fuegos Artificiales en la Ciudadela',
        location: 'La Ciudadela',
        description: 'Noche de pirotecnia de diseñadores internacionales.',
        iconType: 'fire',
      },
    ],
  },
  '9': {
    title: '9 de Julio · Día Infantil y Familiar',
    subtitle: 'Actividades dedicadas a los más chicos y ambiente alegre en las plazas',
    events: [
      {
        time: '06:45',
        title: 'Dianas de La Pamplonesa',
        location: 'Recorrido matutino',
        description: 'Paso de la banda por las murallas y plazas.',
        iconType: 'music',
      },
      {
        time: '08:00',
        title: 'Tercer Encierro de San Fermín',
        location: 'Recorrido oficial',
        description: 'Emoción matutina en la curva de Mercaderes y recta de Estafeta.',
        iconType: 'bull',
        highlight: true,
      },
      {
        time: '10:00',
        title: 'Ofrenda Floral Infantil a San Fermín',
        location: 'Rincón de la Aduana / San Lorenzo',
        description: 'Los niños vestidos de blanco y rojo llevan claveles rojos al Santo.',
        iconType: 'ceremony',
      },
      {
        time: '11:00',
        title: 'Parque Infantil y Talleres en Taconera',
        location: 'Parques de Taconera y Vistabella',
        description: 'Juegos gigantes, tirolesas, teatro de títeres y espectáculos infantiles gratuitos.',
        iconType: 'giants',
      },
      {
        time: '13:00',
        title: 'Alarde de Txistularis',
        location: 'Plaza de San José (junto a la Catedral)',
        description: 'Encuentro multitudinario de músicos de txistu de toda Navarra y Euskal Herria.',
        iconType: 'music',
        highlight: true,
      },
      {
        time: '21:45',
        title: 'Toro de Fuego',
        location: 'Plaza Consistorial',
        description: 'Tradición nocturna imperdible.',
        iconType: 'fire',
      },
      {
        time: '23:00',
        title: 'Fuegos Artificiales en la Ciudadela',
        location: 'Ciudadela de Pamplona',
        description: 'Pirotecnia sincronizada con música.',
        iconType: 'fire',
      },
    ],
  },
};

export default function SanFerminSchedule({ isOpen, onClose, initialDay = '6' }: SanFerminScheduleProps) {
  const [selectedDay, setSelectedDay] = useState<'6' | '7' | '8' | '9'>(initialDay);

  if (!isOpen) return null;

  const currentSchedule = SCHEDULE_DATA[selectedDay];

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl relative my-8 border border-red-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 text-white rounded-2xl shadow-md">
                <PanuelicoIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Cronograma San Fermín Hora por Hora</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Guía oficial de actos, encierros, gigantes y charangas de Pamplona / Iruña
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

          {/* Selector de Días (Tabs) */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {(['6', '7', '8', '9'] as const).map((dayKey) => {
              const isActive = selectedDay === dayKey;
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDay(dayKey)}
                  className={`py-2.5 px-2 rounded-2xl font-black text-xs transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md scale-102'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-sm">{dayKey === '6' ? '🚀 6 Jul' : dayKey === '7' ? '👑 7 Jul' : `🎉 ${dayKey} Jul`}</span>
                  <span className="text-[10px] font-semibold opacity-90">
                    {dayKey === '6' ? 'Txupinazo' : dayKey === '7' ? 'San Fermín' : 'Fiesta'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Encabezado del Día Activo */}
          <div className="bg-red-50/80 border border-red-200/80 rounded-2xl p-3.5 mt-3.5">
            <h4 className="font-black text-red-950 text-sm">{currentSchedule.title}</h4>
            <p className="text-xs text-red-800 font-medium mt-0.5">{currentSchedule.subtitle}</p>
          </div>

          {/* Línea de Tiempo de Eventos */}
          <div className="mt-4 space-y-3 max-h-[48vh] overflow-y-auto pr-1">
            {currentSchedule.events.map((event, idx) => {
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition ${
                    event.highlight
                      ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-1 ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-white rounded-lg text-xs font-black tabular-nums shrink-0">
                        {event.time}
                      </span>
                      <h5 className={`font-black text-xs sm:text-sm ${event.highlight ? 'text-amber-950' : 'text-slate-900'}`}>
                        {event.title}
                      </h5>
                    </div>
                    {event.highlight && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full shrink-0">
                        ⭐ Imperdible
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-2">
                    <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip / Protocolo de San Fermín */}
          <div className="mt-3.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-900 font-semibold">
            <PanuelicoIcon className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Recordatorio:</strong> Indumentaria blanca de pies a cabeza, faja roja y pañuelico en mano hasta las 12:00 h del 6 de julio.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            Cerrar Cronograma
          </button>
        </div>

      </div>
    </div>
  );
}
