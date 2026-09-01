// components/WelcomeGroupModal.tsx
'use client';

import { useState } from 'react';
import { UserPlus, Users, ArrowRight, X } from 'lucide-react';
import PanuelicoIcon from '@/components/PanuelicoIcon';

interface Group {
  id: string;
  name: string;
  color?: string;
}

interface WelcomeGroupModalProps {
  isOpen: boolean;
  groups: Group[];
  onSelectGroup: (groupName: string) => void;
  onCreateNewGroup: () => void;
  onViewAll: () => void;
}

// Colores de grupo con fallback a la paleta Ikurriña
function getGroupColor(color?: string): string {
  if (color && color.startsWith('#')) return color;
  return '#009A44';
}

// Emoji representativo por posición del grupo
const GROUP_EMOJIS = ['🧳', '🎒', '🗺️', '⛵', '🚂', '✈️', '🏔️', '🎭'];

export default function WelcomeGroupModal({
  isOpen,
  groups,
  onSelectGroup,
  onCreateNewGroup,
  onViewAll,
}: WelcomeGroupModalProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Fondo difuminado con gradiente festivo */}
      <div
        className="absolute inset-0 bg-emerald-950/85 backdrop-blur-md"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg my-8 z-10">
        {/* Tarjeta Principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">

          {/* Cabecera Festiva */}
          <div className="bg-emerald-800 px-6 py-8 text-center relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-6 text-4xl select-none">🎉</div>
              <div className="absolute top-3 right-8 text-3xl select-none">🐂</div>
              <div className="absolute bottom-2 left-12 text-2xl select-none">🇪🇸</div>
              <div className="absolute bottom-1 right-6 text-4xl select-none">🎺</div>
            </div>

            <div className="relative">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-white/15 rounded-2xl border border-white/20">
                  <PanuelicoIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                ¡Bienvenidos al Viaje
                <br />
                <span className="text-emerald-200">San Fermín 2027!</span>
              </h2>
              <p className="text-sm text-emerald-100/90 font-medium mt-2.5 max-w-sm mx-auto leading-relaxed">
                ¿Quién está usando la app?{' '}
                <span className="text-emerald-200 font-bold">Elegí tu grupo</span> para ver tu
                itinerario personalizado:
              </p>
            </div>
          </div>

          {/* Grilla de Grupos */}
          <div className="p-5 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Grupos familiares registrados
            </p>

            {groups.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Cargando grupos familiares...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {groups.map((group, idx) => {
                  const color = getGroupColor(group.color);
                  const emoji = GROUP_EMOJIS[idx % GROUP_EMOJIS.length];
                  const isHovered = hoveredGroup === group.name;

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => onSelectGroup(group.name)}
                      onMouseEnter={() => setHoveredGroup(group.name)}
                      onMouseLeave={() => setHoveredGroup(null)}
                      className="group w-full p-4 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200/80 hover:border-emerald-400 rounded-2xl text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Badge de color del grupo */}
                          <div
                            className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg shadow-sm"
                            style={{ backgroundColor: color + '22', border: `2px solid ${color}44` }}
                          >
                            {emoji}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 text-sm block truncate group-hover:text-emerald-900 transition-colors">
                              {group.name}
                            </span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5"
                              style={{
                                backgroundColor: color + '20',
                                color: color,
                              }}
                            >
                              ● Mi grupo
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                            isHovered
                              ? 'text-emerald-700 translate-x-0.5'
                              : 'text-slate-300'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Separador */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              {/* Ver itinerario de toda la familia */}
              <button
                type="button"
                onClick={onViewAll}
                className="w-full py-2.5 px-4 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 hover:text-emerald-900 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Ver itinerario general de toda la familia
              </button>

              {/* Crear nuevo grupo */}
              <button
                type="button"
                onClick={onCreateNewGroup}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Soy nuevo / Crear otro grupo
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <p className="text-center text-[11px] text-slate-400 font-medium">
              🔒 Tu selección se guarda automáticamente en este dispositivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
