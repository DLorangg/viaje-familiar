// components/DocumentDrawer.tsx
'use client';

import { X, ExternalLink, Ticket, FileText, QrCode, Building2, Plane, Train, PlusCircle, ShieldCheck } from 'lucide-react';
import { TripDayDocument } from '@/lib/transports';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  dateText: string;
  city: string;
  documents: TripDayDocument[];
  onOpenEdit?: () => void;
}

function getDocumentIcon(type?: string, title?: string) {
  const lowerTitle = (title || '').toLowerCase();
  if (type === 'hotel' || lowerTitle.includes('hotel') || lowerTitle.includes('alojamiento') || lowerTitle.includes('reserva')) {
    return <Building2 className="w-5 h-5 text-emerald-600" />;
  }
  if (type === 'flight' || lowerTitle.includes('vuelo') || lowerTitle.includes('boarding') || lowerTitle.includes('avion')) {
    return <Plane className="w-5 h-5 text-sky-600" />;
  }
  if (type === 'train' || lowerTitle.includes('tren') || lowerTitle.includes('renfe') || lowerTitle.includes('ave')) {
    return <Train className="w-5 h-5 text-emerald-600" />;
  }
  if (type === 'qr' || lowerTitle.includes('qr') || lowerTitle.includes('codigo')) {
    return <QrCode className="w-5 h-5 text-purple-600" />;
  }
  if (type === 'pdf' || lowerTitle.includes('pdf')) {
    return <FileText className="w-5 h-5 text-rose-600" />;
  }
  return <Ticket className="w-5 h-5 text-amber-600" />;
}

export default function DocumentDrawer({
  isOpen,
  onClose,
  dayNumber,
  dateText,
  city,
  documents,
  onOpenEdit,
}: DocumentDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  Día {dayNumber} · {city}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{dateText}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" /> Bóveda de Tickets y Vouchers
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido de documentos */}
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
            {documents.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Ticket className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No hay tickets ni vouchers adjuntos</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Podés guardar entradas (La Alhambra, Alcázar), pasajes de tren/avión o vouchers de hotel para tenerlos siempre a mano.
                </p>
                {onOpenEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEdit();
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Agregar Tickets al Día {dayNumber}
                  </button>
                )}
              </div>
            ) : (
              documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0">
                      {getDocumentIcon(doc.type, doc.title)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate group-hover:text-emerald-800 transition">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {doc.url}
                      </p>
                    </div>
                  </div>

                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 shrink-0 inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <span>Abrir</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
          {onOpenEdit && documents.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit();
              }}
              className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" /> Gestionar Tickets
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
