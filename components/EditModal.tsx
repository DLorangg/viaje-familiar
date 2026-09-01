// components/EditModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Trash2, PlusCircle, Check, Building2, Ticket, Link as LinkIcon, Plus } from 'lucide-react';
import {
  TRANSPORT_LIST,
  parseTransports,
  formatTransports,
  parseDocuments,
  TransportId,
  TripDay,
  TripDayDocument,
} from '@/lib/transports';

interface EditModalProps {
  day: TripDay | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onAddDay?: () => void;
}

export default function EditModal({ day, isOpen, onClose, onUpdated, onAddDay }: EditModalProps) {
  const [city, setCity] = useState('');
  const [dateText, setDateText] = useState('');
  const [transports, setTransports] = useState<TransportId[]>(['walk']);
  const [activity, setActivity] = useState('');
  const [flightCode, setFlightCode] = useState('');
  const [accommodationName, setAccommodationName] = useState('');
  const [accommodationAddress, setAccommodationAddress] = useState('');
  const [documents, setDocuments] = useState<TripDayDocument[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState<'ticket' | 'pdf' | 'qr' | 'link' | 'hotel' | 'flight' | 'train'>('ticket');
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (day && isOpen) {
      setCity(day.city || '');
      setDateText(day.date_text || '');
      setTransports(parseTransports(day.transport_type));
      setActivity(day.activity || '');
      setFlightCode(day.flight_code || '');
      setAccommodationName(day.accommodation_name || '');
      setAccommodationAddress(day.accommodation_address || '');
      setDocuments(parseDocuments(day.documents));
      setShowAddDocForm(false);
      setNewDocTitle('');
      setNewDocUrl('');
      setNewDocType('ticket');
    }
  }, [day, isOpen]);

  if (!isOpen || !day) return null;

  const handleToggleTransport = (id: TransportId) => {
    setTransports((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((t) => t !== id);
        return next.length > 0 ? next : ['walk'];
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;

    const newDoc: TripDayDocument = {
      id: String(Date.now()),
      title: newDocTitle.trim(),
      url: newDocUrl.trim(),
      type: newDocType,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setNewDocTitle('');
    setNewDocUrl('');
    setShowAddDocForm(false);
  };

  const handleRemoveDocument = (indexToRemove: number) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Buscar coordenadas automáticamente si se cambia la ciudad
  const fetchCoordinates = async (cityName: string): Promise<{ lat: number; lng: number }> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error(e);
    }
    return { lat: day.lat, lng: day.lng };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let coords = { lat: day.lat, lng: day.lng };
    if (city.trim().toLowerCase() !== (day.city || '').toLowerCase()) {
      coords = await fetchCoordinates(city);
    }

    const { error } = await supabase
      .from('trip_days')
      .update({
        city: city.trim(),
        date_text: dateText.trim(),
        lat: coords.lat,
        lng: coords.lng,
        transport_type: formatTransports(transports),
        activity,
        flight_code: flightCode ? flightCode.trim().toUpperCase() : null,
        accommodation_name: accommodationName.trim() || null,
        accommodation_address: accommodationAddress.trim() || null,
        documents: documents.length > 0 ? documents : null,
      })
      .eq('id', day.id);

    setLoading(false);
    if (!error) {
      onUpdated();
      onClose();
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleDeleteDay = async () => {
    if (!confirm(`¿Estás seguro de eliminar el Día ${day.day_number}?`)) return;
    setLoading(true);
    await supabase.from('trip_days').delete().eq('id', day.id);
    setLoading(false);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
              {day.group_name} - Día {day.day_number}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Editar Información del Día</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1">
          {/* Fecha y Ciudad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título de Fecha</label>
              <input
                type="text"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                placeholder="Ej: Viernes 2 Jul"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ciudad Destino</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Madrid, Barcelona..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
          </div>

          {/* Selector de medios de transporte múltiples con chips interactivos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Medios de Transporte <span className="text-[11px] font-normal text-slate-400 normal-case">(Selección múltiple)</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                {transports.length} seleccionado{transports.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRANSPORT_LIST.map((opt) => {
                const isSelected = transports.includes(opt.id);
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleTransport(opt.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer select-none text-left ${
                      isSelected
                        ? opt.activeClass
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1 rounded-lg shrink-0 ${isSelected ? 'bg-white/80' : 'bg-slate-100 text-slate-600'}`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate flex-1">{opt.shortLabel}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Número de Vuelo */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Nº de Vuelo (Opcional - ej: AR1132 o AR1650, AR1132)
            </label>
            <input
              type="text"
              placeholder="Ej: AR1132 o AR1650, AR1132"
              value={flightCode}
              onChange={(e) => setFlightCode(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold uppercase outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Sección de Alojamiento */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" /> Alojamiento / Hospedaje
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nombre del hotel o depto (ej: Hotel NH Pamplona Iruña Park)"
                value={accommodationName}
                onChange={(e) => setAccommodationName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <input
                type="text"
                placeholder="Dirección o zona (ej: C. de San Fermín 12, Pamplona)"
                value={accommodationAddress}
                onChange={(e) => setAccommodationAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Sección de Bóveda de Tickets y Documentos */}
          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-700" /> Bóveda de Tickets y Vouchers ({documents.length})
              </label>
              {!showAddDocForm && (
                <button
                  type="button"
                  onClick={() => setShowAddDocForm(true)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar ticket
                </button>
              )}
            </div>

            {/* Lista de documentos guardados */}
            {documents.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-200/60 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm">🎟️</span>
                      <span className="font-bold text-slate-800 truncate">{doc.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition cursor-pointer"
                      title="Eliminar ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar documento */}
            {showAddDocForm && (
              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Título (ej: Entrada La Alhambra)"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="ticket">🎟️ Entrada</option>
                      <option value="hotel">🏨 Hotel</option>
                      <option value="train">🚆 Tren</option>
                      <option value="flight">✈️ Vuelo</option>
                      <option value="pdf">📄 PDF</option>
                      <option value="link">🔗 Link</option>
                    </select>
                  </div>
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Enlace o URL (Google Drive, Dropbox, PDF...)"
                    value={newDocUrl}
                    onChange={(e) => setNewDocUrl(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddDocForm(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-2xs"
                  >
                    Guardar Ticket
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actividades */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Actividades, Notas y Planes</label>
            <textarea
              rows={4}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Escribí aquí las actividades de este día..."
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleDeleteDay}
              className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Eliminar día
            </button>
            {onAddDay && (
              <button
                type="button"
                onClick={onAddDay}
                className="text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Agregar día siguiente
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 font-bold text-slate-700 text-sm rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-700 font-bold text-white text-sm rounded-xl hover:bg-emerald-800 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}