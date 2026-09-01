import type { LucideIcon } from 'lucide-react';
import { Plane, Bus, Train, Car, Footprints, Ship } from 'lucide-react';

export type TransportId = 'plane' | 'bus' | 'train' | 'car' | 'walk' | 'ferry';

export interface TripDayDocument {
  id?: string;
  title: string;
  url: string;
  type?: 'ticket' | 'pdf' | 'qr' | 'link' | 'hotel' | 'flight' | 'train';
}

export interface TripDay {
  id: string;
  group_id?: string;
  group_name: string;
  day_number: number;
  date_text: string;
  city: string;
  lat: number;
  lng: number;
  transport_type: string;
  activity?: string;
  flight_code?: string | null;
  accommodation_name?: string | null;
  accommodation_address?: string | null;
  documents?: TripDayDocument[] | string | null;
  created_at?: string;
}

export function parseDocuments(docField: unknown): TripDayDocument[] {
  if (!docField) return [];
  if (Array.isArray(docField)) {
    return docField.filter((d) => d && typeof d === 'object' && d.title && d.url) as TripDayDocument[];
  }
  if (typeof docField === 'string') {
    try {
      const parsed = JSON.parse(docField);
      if (Array.isArray(parsed)) {
        return parsed.filter((d) => d && typeof d === 'object' && d.title && d.url) as TripDayDocument[];
      }
    } catch {
      return [];
    }
  }
  return [];
}

export interface TransportOption {
  id: TransportId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  emoji: string;
  // Colores para el chip/botón en el modal de edición
  activeClass: string;
  // Colores para el badge en la vista principal
  badgeClass: string;
  badgeIconClass: string;
}

export const TRANSPORT_OPTIONS: Record<TransportId, TransportOption> = {
  plane: {
    id: 'plane',
    label: 'Avión',
    shortLabel: 'Avión',
    icon: Plane,
    emoji: '✈️',
    activeClass: 'bg-sky-50 text-sky-700 border-sky-400 ring-2 ring-sky-400/30 shadow-xs font-bold',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    badgeIconClass: 'text-sky-600',
  },
  bus: {
    id: 'bus',
    label: 'Colectivo / Micro',
    shortLabel: 'Colectivo',
    icon: Bus,
    emoji: '🚌',
    activeClass: 'bg-indigo-50 text-indigo-700 border-indigo-400 ring-2 ring-indigo-400/30 shadow-xs font-bold',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    badgeIconClass: 'text-indigo-600',
  },
  train: {
    id: 'train',
    label: 'Tren',
    shortLabel: 'Tren',
    icon: Train,
    emoji: '🚆',
    activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs font-bold',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeIconClass: 'text-emerald-600',
  },
  car: {
    id: 'car',
    label: 'Auto',
    shortLabel: 'Auto',
    icon: Car,
    emoji: '🚗',
    activeClass: 'bg-amber-50 text-amber-700 border-amber-400 ring-2 ring-amber-400/30 shadow-xs font-bold',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeIconClass: 'text-amber-600',
  },
  walk: {
    id: 'walk',
    label: 'A pie / Visita',
    shortLabel: 'A pie',
    icon: Footprints,
    emoji: '🚶',
    activeClass: 'bg-slate-100 text-slate-800 border-slate-400 ring-2 ring-slate-400/30 shadow-xs font-bold',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeIconClass: 'text-slate-500',
  },
  ferry: {
    id: 'ferry',
    label: 'Ferry / Barco',
    shortLabel: 'Ferry',
    icon: Ship,
    emoji: '⛴️',
    activeClass: 'bg-purple-50 text-purple-700 border-purple-400 ring-2 ring-purple-400/30 shadow-xs font-bold',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    badgeIconClass: 'text-purple-600',
  },
};

export const TRANSPORT_LIST: TransportOption[] = [
  TRANSPORT_OPTIONS.plane,
  TRANSPORT_OPTIONS.bus,
  TRANSPORT_OPTIONS.train,
  TRANSPORT_OPTIONS.car,
  TRANSPORT_OPTIONS.walk,
  TRANSPORT_OPTIONS.ferry,
];

/**
 * Parsea un string de transportes (ej: "bus, plane", "bus-plane", "plane", "walk")
 * devolviendo una lista válida de identificadores de transporte reconocidos.
 */
export function parseTransports(transportString?: string | null): TransportId[] {
  if (!transportString || typeof transportString !== 'string') {
    return ['walk'];
  }

  const normalized = transportString.toLowerCase().trim();
  if (!normalized) {
    return ['walk'];
  }

  // Manejar casos especiales históricos como "bus-plane"
  const cleaned = normalized.replace(/bus-plane/g, 'bus,plane');

  // Separar por comas, barras, signos más o espacios
  const parts = cleaned.split(/[,/+\s]+/).map((p) => p.trim()).filter(Boolean);

  const matched: TransportId[] = [];

  for (const part of parts) {
    let key: TransportId | null = null;

    if (part in TRANSPORT_OPTIONS) {
      key = part as TransportId;
    } else if (part === 'ship' || part === 'barco' || part === 'boat') {
      key = 'ferry';
    } else if (part === 'colectivo' || part === 'micro') {
      key = 'bus';
    } else if (part === 'avion' || part === 'avión' || part === 'flight' || part === 'vuelo') {
      key = 'plane';
    } else if (part === 'caminata' || part === 'pie' || part === 'visita') {
      key = 'walk';
    } else if (part === 'coche') {
      key = 'car';
    }

    if (key && !matched.includes(key)) {
      matched.push(key);
    }
  }

  return matched.length > 0 ? matched : ['walk'];
}

/**
 * Convierte un array de transportes a una cadena separada por comas para persistir en Supabase.
 */
export function formatTransports(transports: string[]): string {
  if (!transports || transports.length === 0) {
    return 'walk';
  }
  return transports.join(', ');
}
