// components/DaySearchModal.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Calendar, MapPin, Building2, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { TripDay, parseTransports, TRANSPORT_OPTIONS } from '@/lib/transports';

interface DaySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: TripDay[];
  onSelectDay: (index: number) => void;
}

interface SearchMatch {
  index: number;
  day: TripDay;
  field: 'city' | 'activity' | 'accommodation' | 'date';
  snippet?: string;
}

// Función para resaltar la coincidencia dentro de un texto
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-200 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-black px-1 rounded-sm shadow-2xs"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// Extrae un fragmento legible centrado en la palabra encontrada
function getSnippet(fullText: string, query: string, maxLength = 100): string {
  if (!fullText) return '';
  const lowerText = fullText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return fullText.length > maxLength ? fullText.substring(0, maxLength) + '...' : fullText;
  }

  const start = Math.max(0, matchIndex - 35);
  const end = Math.min(fullText.length, matchIndex + query.length + 55);

  let snippet = fullText.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}

export default function DaySearchModal({
  isOpen,
  onClose,
  days,
  onSelectDay,
}: DaySearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Autoenfocar input al abrir y reiniciar estado
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filtrado de días en tiempo real
  const results = useMemo<SearchMatch[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Si está vacío, mostramos todos los días ordenados
      return days.map((day, index) => ({
        index,
        day,
        field: 'city',
      }));
    }

    const matches: SearchMatch[] = [];

    days.forEach((day, index) => {
      const cityMatch = day.city?.toLowerCase().includes(q);
      const activityMatch = day.activity?.toLowerCase().includes(q);
      const accommodationMatch = day.accommodation_name?.toLowerCase().includes(q);
      const dateMatch = day.date_text?.toLowerCase().includes(q);

      if (cityMatch) {
        matches.push({
          index,
          day,
          field: 'city',
        });
      } else if (activityMatch) {
        matches.push({
          index,
          day,
          field: 'activity',
          snippet: getSnippet(day.activity || '', q),
        });
      } else if (accommodationMatch) {
        matches.push({
          index,
          day,
          field: 'accommodation',
          snippet: getSnippet(day.accommodation_name || '', q),
        });
      } else if (dateMatch) {
        matches.push({
          index,
          day,
          field: 'date',
        });
      }
    });

    return matches;
  }, [query, days]);

  // Manejo de teclado (Flechas, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectDay(results[selectedIndex].index);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Desplazar elemento enfocado a la vista
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-6 sm:mt-0 transition-all flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Cabecera del buscador */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-2xl shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar ciudad, actividad, hotel, fecha... (ej: Alhambra, Gaudí, Madrid)"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
            />
          </div>

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
            ESC
          </kbd>

          <button
            onClick={onClose}
            className="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de resultados */}
        <div ref={listRef} className="p-2.5 sm:p-3 overflow-y-auto space-y-1.5 max-h-[55vh]">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No encontramos resultados para &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Probá buscando por nombre de ciudad (Pamplona, Barcelona), actividad o nombre de hotel.
              </p>
            </div>
          ) : (
            results.map((match, i) => {
              const isSelected = i === selectedIndex;
              const transports = parseTransports(match.day.transport_type);
              const transportEmojis = transports
                .map((t) => TRANSPORT_OPTIONS[t]?.emoji || '')
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={match.day.id || i}
                  data-active={isSelected ? 'true' : 'false'}
                  onClick={() => {
                    onSelectDay(match.index);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all border flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Badge de Día */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 border shadow-2xs transition-colors ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-tighter opacity-80 leading-none">Día</span>
                    <span className="text-sm leading-none mt-0.5">{match.day.day_number}</span>
                  </div>

                  {/* Información del Día */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <HighlightedText text={match.day.city} query={query} />
                      </h4>

                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <HighlightedText text={match.day.date_text || `Día ${match.day.day_number}`} query={query} />
                      </span>

                      {transportEmojis && (
                        <span className="text-xs ml-auto shrink-0" title="Medio de transporte">
                          {transportEmojis}
                        </span>
                      )}
                    </div>

                    {/* Fragmento de Actividad */}
                    {match.snippet ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {match.field === 'accommodation' && (
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1 inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Hotel:
                          </span>
                        )}
                        <HighlightedText text={match.snippet} query={query} />
                      </p>
                    ) : match.day.activity ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {match.day.activity}
                      </p>
                    ) : null}

                    {/* Alojamiento si existe y no fue el snippet */}
                    {match.day.accommodation_name && match.field !== 'accommodation' && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{match.day.accommodation_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Flecha derecha indicadora */}
                  <div className="shrink-0 self-center">
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-400 translate-x-0.5'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer con atajos de ayuda */}
        <div className="p-3 sm:px-5 sm:py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-semibold">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-semibold">
                ↓
              </kbd>
              Navegar
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-semibold">
                ↵
              </kbd>
              Seleccionar
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{results.length} día{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Cerrar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
