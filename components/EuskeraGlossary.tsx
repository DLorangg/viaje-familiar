// components/EuskeraGlossary.tsx
'use client';

import { useState } from 'react';
import { X, Search, BookOpen, Volume2, Sparkles, MessageCircle, Heart } from 'lucide-react';
import PanuelicoIcon from '@/components/PanuelicoIcon';

interface GlossaryTerm {
  term: string;
  pronunciation: string;
  meaning: string;
  category: 'saludos' | 'fiesta' | 'gastronomia';
  example?: string;
}

const GLOSSARY_DATA: GlossaryTerm[] = [
  // Saludos y Cortesía
  { term: 'Kaixo', pronunciation: 'cái-sho', meaning: 'Hola', category: 'saludos', example: 'Kaixo! Egun on!' },
  { term: 'Agur', pronunciation: 'a-gur', meaning: 'Adiós / Chau / Hasta luego', category: 'saludos', example: 'Agur, gero arte!' },
  { term: 'Eskerrik asko', pronunciation: 'es-que-rric as-co', meaning: 'Muchas gracias', category: 'saludos', example: 'Eskerrik asko por la atención.' },
  { term: 'Mesedez', pronunciation: 'me-se-des', meaning: 'Por favor', category: 'saludos', example: 'Zurito bat, mesedez (Una cervecita corta, por favor).' },
  { term: 'Egun on', pronunciation: 'e-gun on', meaning: 'Buenos días', category: 'saludos' },
  { term: 'Arratsalde on', pronunciation: 'a-rra-tsal-de on', meaning: 'Buenas tardes', category: 'saludos' },
  { term: 'Gabon', pronunciation: 'ga-bon', meaning: 'Buenas noches', category: 'saludos' },
  { term: 'Bai / Ez', pronunciation: 'bai / es', meaning: 'Sí / No', category: 'saludos' },
  { term: 'Zorionak', pronunciation: 'so-rio-nac', meaning: '¡Felicidades! / ¡Enhorabuena!', category: 'saludos' },

  // San Fermín y Fiesta
  { term: '¡Gora San Fermín!', pronunciation: 'go-ra san fer-min', meaning: '¡Viva San Fermín! (El grito unánime del Txupinazo)', category: 'fiesta', example: '¡Pamploneses, Viva San Fermín! ¡Gora San Fermín!' },
  { term: 'Txupinazo', pronunciation: 'chu-pi-na-so', meaning: 'Cohete inaugural disparado a las 12:00 h del 6 de julio desde el Ayuntamiento', category: 'fiesta' },
  { term: 'Peñas', pronunciation: 'pe-ñas', meaning: 'Las 16 sociedades y agrupaciones festivas que le dan vida, música y charangas a las fiestas', category: 'fiesta' },
  { term: 'Charanga', pronunciation: 'cha-ran-ga', meaning: 'Banda callejera de metales y percusión que anima el tardeo y las plazas', category: 'fiesta' },
  { term: 'Pañuelico', pronunciation: 'pa-ñue-li-co', meaning: 'El pañuelo triangular rojo que solo se ata al cuello tras el estallido del Txupinazo', category: 'fiesta' },
  { term: 'Kilikis y Zaldikos', pronunciation: 'qui-li-quis y sal-di-cos', meaning: 'Cabezudos y caballos de cartón piedra que persiguen amistosamente a los niños con vergas de gomaespuma', category: 'fiesta' },
  { term: 'Diana', pronunciation: 'dia-na', meaning: 'Marcha matutina con la que la banda La Pamplonesa despierta a la ciudad a las 06:45 h', category: 'fiesta' },
  { term: 'Encierro', pronunciation: 'en-cie-rro', meaning: 'La mítica carrera de toros bravos de 848 metros por el Casco Viejo a las 08:00 h', category: 'fiesta' },
  { term: 'Riau-Riau', pronunciation: 'riau-riau', meaning: 'El tradicional vals festivo de Astráin que se canta camino a las Vísperas de San Lorenzo', category: 'fiesta' },
  { term: 'Pobre de Mí', pronunciation: 'po-bre de mi', meaning: 'Ceremonia de despedida el 14 de julio a medianoche con velas encendidas en la Plaza Consistorial', category: 'fiesta' },

  // Gastronomía y Bebidas
  { term: 'Pintxo', pronunciation: 'pin-cho', meaning: 'Bocado gastronómico tradicional montado sobre una rebanada de pan o en cazuelita', category: 'gastronomia', example: 'Ruta de pintxos por San Nicolás y Casco Viejo.' },
  { term: 'Txakoli', pronunciation: 'cha-co-lí', meaning: 'Vino blanco joven del País Vasco, fresco, seco y con un ligero toque de aguja', category: 'gastronomia' },
  { term: 'Sagardoa', pronunciation: 'sa-gar-do-a', meaning: 'Sidra natural vasca que se escancia desde la barrica (txotx)', category: 'gastronomia' },
  { term: 'Zurito', pronunciation: 'su-ri-to', meaning: 'Corto de cerveza (aprox. 150 ml), la medida perfecta para acompañar cada pintxo sin llenarse', category: 'gastronomia' },
  { term: 'Txistorra', pronunciation: 'chis-to-rra', meaning: 'Embutido fresco de cerdo navarro con pimentón y ajo, cocinado a la brasa o frito', category: 'gastronomia' },
  { term: 'Gilda', pronunciation: 'guil-da', meaning: 'El pintxo rey clásico: palillo con guindilla de Ibarra en vinagre, anchoa en salazón y aceituna verde', category: 'gastronomia' },
  { term: 'Marianito', pronunciation: 'ma-ria-ni-to', meaning: 'Vermut rojo artesanal preparado con un toque de ginebra, cáscara de naranja y aceituna', category: 'gastronomia' },
  { term: 'Poteo', pronunciation: 'po-te-o', meaning: 'Costumbre social de recorrer cuadrillas de bar en bar bebiendo y comiendo pintxos', category: 'gastronomia' },
  { term: 'Pacharán', pronunciation: 'pa-cha-rán', meaning: 'Licor navarro tradicional elaborado macerando endrinas silvestres en anís', category: 'gastronomia' },
];

export default function EuskeraGlossary({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'saludos' | 'fiesta' | 'gastronomia'>('all');

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = search.toLowerCase();
    const matchesSearch =
      item.term.toLowerCase().includes(query) ||
      item.meaning.toLowerCase().includes(query) ||
      item.pronunciation.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl relative my-8 border border-emerald-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-800 text-white rounded-2xl shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Glosario de Euskera & Jerga Sanferminera</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Diccionario práctico de pronunciación y modismos para integrarse a la fiesta
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

          {/* Mención a Rocío */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 mt-3.5 flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-700 text-white rounded-xl shrink-0">
              <Heart className="w-4 h-4" />
            </div>
            <p className="text-xs text-emerald-950 font-semibold">
              <strong className="text-emerald-900 font-black">Tip de Pronunciación:</strong> Para cualquier duda sobre entonación vasca, ¡consultale directamente a <span className="underline decoration-emerald-500 decoration-2 font-bold">Rocío</span>! 😉
            </p>
          </div>

          {/* Buscador y Categorías */}
          <div className="mt-3.5 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar término o significado (ej. zurito, kaixo, gora)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: 'Todos los términos' },
                { key: 'fiesta', label: '🎉 San Fermín' },
                { key: 'gastronomia', label: '🍢 Gastronomía' },
                { key: 'saludos', label: '👋 Saludos y Cortesía' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCategory === tab.key
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Términos */}
          <div className="mt-3.5 space-y-2 max-h-[44vh] overflow-y-auto pr-1">
            {filteredTerms.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400 font-semibold">
                No se encontraron términos para "{search}".
              </p>
            ) : (
              filteredTerms.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 transition"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{item.term}</span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        🗣️ /{item.pronunciation}/
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                      {item.category === 'fiesta' ? 'San Fermín' : item.category === 'gastronomia' ? 'Gastronomía' : 'Cortesía'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium mt-1 leading-snug">
                    {item.meaning}
                  </p>

                  {item.example && (
                    <p className="text-[11px] text-slate-500 italic mt-1 bg-white/70 p-1.5 rounded-lg border border-slate-200/60">
                      Ej: "{item.example}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            Cerrar Glosario
          </button>
        </div>

      </div>
    </div>
  );
}
