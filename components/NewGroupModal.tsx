// components/NewGroupModal.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plane, X, Sparkles } from 'lucide-react';
import PanuelicoIcon from '@/components/PanuelicoIcon';

const PRESET_DATES = [
  'Viernes 2 Jul', 'Sábado 3 Jul', 'Domingo 4 Jul', 'Lunes 5 Jul',
  'Martes 6 Jul', 'Miércoles 7 Jul', 'Jueves 8 Jul', 'Viernes 9 Jul',
  'Sábado 10 Jul', 'Domingo 11 Jul', 'Lunes 12 Jul', 'Martes 13 Jul',
  'Miércoles 14 Jul', 'Jueves 15 Jul', 'Viernes 16 Jul', 'Sábado 17 Jul',
  'Domingo 18 Jul', 'Lunes 19 Jul', 'Martes 20 Jul', 'Miércoles 21 Jul',
  'Jueves 22 Jul', 'Viernes 23 Jul', 'Sábado 24 Jul', 'Domingo 25 Jul'
];

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (newGroupName: string) => void;
}

export default function NewGroupModal({ isOpen, onClose, onGroupCreated }: NewGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#009A44');
  const [usesCommonFlight, setUsesCommonFlight] = useState(true);
  const [customFlight, setCustomFlight] = useState('');
  const [includeSanFermin, setIncludeSanFermin] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    const flight = usesCommonFlight ? 'AR1132' : (customFlight.trim().toUpperCase() || null);

    const { data: groupData, error: groupError } = await supabase
      .from('family_groups')
      .insert({
        name: groupName.trim(),
        color: groupColor,
        flight_code: flight,
      })
      .select()
      .single();

    if (groupError) {
      alert('Error: ' + groupError.message);
      setLoading(false);
      return;
    }

    // Generar los 24 días con títulos de fecha pregenerados
    const daysToInsert = PRESET_DATES.map((dateTitle, index) => {
      const dayNum = index + 1;
      let city = 'Por definir';
      let lat = 40.4168;
      let lng = -3.7038;
      let transport = 'walk';
      let activity = '';
      let flightCode = null;

      if (dayNum === 1) {
        city = 'Buenos Aires';
        lat = -34.6037;
        lng = -58.3816;
        transport = flight ? 'plane' : 'walk';
        activity = flight ? `Salida en vuelo ${flight}` : 'Inicio del viaje';
        flightCode = flight;
      } else if (dayNum === 2) {
        city = 'Madrid';
        lat = 40.4168;
        lng = -3.7038;
        transport = 'walk';
        activity = 'Llegada a Madrid';
      } else if (includeSanFermin && dayNum >= 5 && dayNum <= 8) {
        city = dayNum === 8 ? 'Cáseda' : 'Pamplona';
        lat = dayNum === 8 ? 42.5925 : 42.8125;
        lng = dayNum === 8 ? -1.3653 : -1.6458;
        transport = dayNum === 8 ? 'car' : 'walk';
        activity = dayNum === 5 ? 'Txupinazo de San Fermín' : (dayNum === 6 ? 'Día Grande y Procesión' : (dayNum === 7 ? 'Ambiente de Peñas' : 'Reunión familiar en Cáseda'));
      } else if (dayNum === 24) {
        city = 'Buenos Aires';
        lat = -34.6037;
        lng = -58.3816;
        activity = 'Llegada / Fin del viaje';
      }

      return {
        group_id: groupData.id,
        group_name: groupData.name,
        day_number: dayNum,
        date_text: dateTitle,
        city,
        lat,
        lng,
        transport_type: transport,
        activity,
        flight_code: flightCode,
      };
    });

    await supabase.from('trip_days').insert(daysToInsert);

    setLoading(false);
    onGroupCreated(groupData.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">Nuevo Grupo Familiar</h3>
              <p className="text-xs text-slate-500">Crea el itinerario base de 24 días</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre del grupo</label>
            <input
              type="text"
              placeholder="Ej: Ana y Patri"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Color distintivo</label>
            <input
              type="color"
              value={groupColor}
              onChange={(e) => setGroupColor(e.target.value)}
              className="w-full h-10 border border-slate-300 rounded-xl p-1 cursor-pointer"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-sky-600" /> Vuelo compartido (AR 1132 - Viernes 2 Jul)
              </span>
              <input
                type="checkbox"
                checked={usesCommonFlight}
                onChange={(e) => setUsesCommonFlight(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {!usesCommonFlight && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nº de vuelo personalizado (o dejar vacío si se define luego)
                </label>
                <input
                  type="text"
                  placeholder="Ej: IB6844 o 'A definir'"
                  value={customFlight}
                  onChange={(e) => setCustomFlight(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl px-3 py-2 text-xs uppercase outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50/70 border border-red-200 rounded-2xl">
            <span className="text-xs font-bold text-red-950 flex items-center gap-1.5">
              <PanuelicoIcon className="w-4 h-4" /> Sincronizar San Fermín / Txupinazo (6 al 9 Jul)
            </span>
            <input
              type="checkbox"
              checked={includeSanFermin}
              onChange={(e) => setIncludeSanFermin(e.target.checked)}
              className="w-4 h-4 accent-red-600 cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 font-bold text-slate-700 rounded-xl hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-700 font-bold text-white rounded-xl hover:bg-emerald-800 shadow-md transition cursor-pointer"
            >
              {loading ? 'Creando...' : 'Crear Itinerario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}