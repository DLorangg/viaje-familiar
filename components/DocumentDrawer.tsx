// components/DocumentDrawer.tsx
'use client';

import { useState } from 'react';
import { X, ExternalLink, Ticket, FileText, QrCode, Building2, Plane, Train, PlusCircle, ShieldCheck, Trash2, Loader2, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { TripDayDocument } from '@/lib/transports';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  dateText: string;
  city: string;
  documents: TripDayDocument[];
  onOpenEdit?: () => void;
  /** Callback para eliminar un documento. Recibe el doc y su índice. */
  onDeleteDocument?: (doc: TripDayDocument, idx: number) => Promise<void>;
}

function getDocumentIcon(type?: string, title?: string) {
  const lowerTitle = (title || '').toLowerCase();
  if (type === 'image') {
    return <ImageIcon className="w-5 h-5 text-violet-600" />;
  }
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

function getDocTypeBadge(type?: string) {
  switch (type) {
    case 'image':   return { label: 'Imagen',  cls: 'bg-violet-50 text-violet-700 border-violet-200' };
    case 'pdf':     return { label: 'PDF',     cls: 'bg-rose-50   text-rose-700   border-rose-200' };
    case 'hotel':   return { label: 'Hotel',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'flight':  return { label: 'Vuelo',   cls: 'bg-sky-50    text-sky-700    border-sky-200' };
    case 'train':   return { label: 'Tren',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'qr':      return { label: 'QR',      cls: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'link':    return { label: 'Link',    cls: 'bg-slate-50  text-slate-700  border-slate-200' };
    default:        return { label: 'Ticket',  cls: 'bg-amber-50  text-amber-700  border-amber-200' };
  }
}

export default function DocumentDrawer({
  isOpen,
  onClose,
  dayNumber,
  dateText,
  city,
  documents,
  onOpenEdit,
  onDeleteDocument,
}: DocumentDrawerProps) {
  /** URL de la imagen a previsualizar (null = cerrado) */
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  /** Índice del doc que se está eliminando (para spinner individual) */
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDocumentClick = (doc: TripDayDocument) => {
    if (doc.type === 'image') {
      setPreviewImageUrl(doc.url);
    } else {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = async (doc: TripDayDocument, idx: number) => {
    if (!onDeleteDocument) return;
    if (!confirm(`¿Eliminar "${doc.title}"? Esta acción no se puede deshacer.`)) return;
    setDeletingIdx(idx);
    try {
      await onDeleteDocument(doc, idx);
    } finally {
      setDeletingIdx(null);
    }
  };

  return (
    <>
      {/* ─── Drawer principal ─── */}
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
                documents.map((doc, idx) => {
                  const isImage = doc.type === 'image';
                  const badge = getDocTypeBadge(doc.type);
                  const isDeleting = deletingIdx === idx;

                  return (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition group shadow-2xs"
                    >
                      {/* Ícono + info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2.5 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0">
                          {getDocumentIcon(doc.type, doc.title)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-extrabold text-slate-900 truncate group-hover:text-emerald-800 transition">
                            {doc.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${badge.cls}`}>
                              {badge.label}
                            </span>
                            {doc.storagePath && (
                              <span className="text-[10px] text-slate-400 font-medium">📎 Storage</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1.5 ml-3 shrink-0">
                        {/* Botón principal: preview o abrir */}
                        <button
                          type="button"
                          onClick={() => handleDocumentClick(doc)}
                          className={`inline-flex items-center gap-1 px-3 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer ${
                            isImage
                              ? 'bg-violet-600 hover:bg-violet-700'
                              : 'bg-emerald-800 hover:bg-emerald-900'
                          }`}
                          title={isImage ? 'Ver imagen' : 'Abrir en nueva pestaña'}
                        >
                          {isImage ? (
                            <><ZoomIn className="w-3.5 h-3.5" /><span className="hidden sm:inline">Ver</span></>
                          ) : (
                            <><ExternalLink className="w-3.5 h-3.5" /><span className="hidden sm:inline">Abrir</span></>
                          )}
                        </button>

                        {/* Botón eliminar (solo si hay callback) */}
                        {onDeleteDocument && (
                          <button
                            type="button"
                            onClick={() => handleDelete(doc, idx)}
                            disabled={isDeleting}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar documento"
                          >
                            {isDeleting
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
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

      {/* ─── Modal de vista previa de imagen ─── */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          {/* Cerrar con botón */}
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer backdrop-blur-sm"
            title="Cerrar vista previa"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Imagen */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImageUrl}
            alt="Vista previa"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Botón abrir en nueva pestaña */}
          <a
            href={previewImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm transition cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" /> Abrir en nueva pestaña
          </a>
        </div>
      )}
    </>
  );
}
