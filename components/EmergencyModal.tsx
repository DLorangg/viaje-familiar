// components/EmergencyModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, PhoneCall, ShieldAlert, HeartPulse, Building, Edit2, Check, ExternalLink } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_INSURANCE_KEY = 'san_fermin_2027_emergency_insurance';

interface InsuranceData {
  company: string;
  policyNumber: string;
  phone: string;
  notes: string;
}

const DEFAULT_INSURANCE: InsuranceData = {
  company: 'Assist Card / Universal Assistance',
  policyNumber: 'AR-2027-FAMILIA',
  phone: '+34 91 123 4567',
  notes: 'Cobertura médica y repatriación en Unión Europea',
};

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const [insurance, setInsurance] = useState<InsuranceData>(DEFAULT_INSURANCE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<InsuranceData>(DEFAULT_INSURANCE);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_INSURANCE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInsurance(parsed);
        setFormData(parsed);
      } catch {
        setInsurance(DEFAULT_INSURANCE);
      }
    }
  }, []);

  const handleSaveInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    setInsurance(formData);
    localStorage.setItem(LOCAL_STORAGE_INSURANCE_KEY, JSON.stringify(formData));
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 border border-red-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Contactos de Emergencia & SOS</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Acceso rápido a números oficiales y seguro de viaje
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

          <div className="mt-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            
            {/* Botones de Llamada de Emergencia Inmediata */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* 112 Europa */}
              <a
                href="tel:112"
                className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex flex-col justify-between transition shadow-md group cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Toda Europa
                  </span>
                  <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black block leading-none">112</span>
                  <span className="text-[11px] font-bold opacity-90 block mt-1">
                    Emergencias & Policía
                  </span>
                </div>
              </a>

              {/* 092 Policía Pamplona */}
              <a
                href="tel:092"
                className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex flex-col justify-between transition shadow-md group cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Pamplona / Iruña
                  </span>
                  <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black block leading-none">092</span>
                  <span className="text-[11px] font-bold opacity-90 block mt-1">
                    Policía Municipal
                  </span>
                </div>
              </a>
            </div>

            {/* Seguro Médico Familiar */}
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 uppercase tracking-wider">
                  <HeartPulse className="w-4 h-4 text-emerald-700" />
                  <span>Seguro Médico & Asistencia al Viajero</span>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveInsurance} className="space-y-2 text-xs pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Compañía Aseguradora</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Nº de Póliza</label>
                      <input
                        type="text"
                        value={formData.policyNumber}
                        onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 uppercase outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono 24h</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Notas / Cobertura</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-slate-500 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-800 text-white rounded-xl font-bold"
                    >
                      Guardar Datos
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Aseguradora:</span>
                    <span className="font-extrabold text-slate-900">{insurance.company}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Póliza Familiar:</span>
                    <span className="font-black text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {insurance.policyNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Asistencia Médica 24h:</span>
                    <a
                      href={`tel:${insurance.phone.replace(/\s+/g, '')}`}
                      className="font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline"
                    >
                      <PhoneCall className="w-3 h-3" /> {insurance.phone}
                    </a>
                  </div>
                  {insurance.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-emerald-200/60 mt-1">
                      {insurance.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Consulados y Embajada Argentina en España */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Building className="w-4 h-4 text-sky-700" />
                <span>Consulados y Embajada Argentina</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Madrid */}
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-900">Consulado General en Madrid</span>
                    <a
                      href="tel:+34639504532"
                      className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" /> +34 639 504 532
                    </a>
                  </div>
                  <p className="text-slate-500 mt-0.5">C. de Fernando el Santo, 15, Madrid (Guardia 24h)</p>
                </div>

                {/* Barcelona */}
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-900">Consulado General en Barcelona</span>
                    <a
                      href="tel:+34609719367"
                      className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" /> +34 609 719 367
                    </a>
                  </div>
                  <p className="text-slate-500 mt-0.5">Passeig de Gràcia, 11, Barcelona (Guardia 24h)</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
