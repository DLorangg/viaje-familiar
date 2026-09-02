// app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import EditModal from '@/components/EditModal';
import NewGroupModal from '@/components/NewGroupModal';
import FlightTracker from '@/components/FlightTracker';
import CountdownBanner from '@/components/CountdownBanner';
import WeatherWidget from '@/components/WeatherWidget';
import TimelineScroller from '@/components/TimelineScroller';
import DocumentDrawer from '@/components/DocumentDrawer';
import ExpenseTracker from '@/components/ExpenseTracker';
import TravelChecklist from '@/components/TravelChecklist';
import PrintableItinerary from '@/components/PrintableItinerary';
import CurrencyConverter from '@/components/CurrencyConverter';
import EmergencyModal from '@/components/EmergencyModal';
import CityTips from '@/components/CityTips';
import SanFerminSchedule from '@/components/SanFerminSchedule';
import RouteCalculator from '@/components/RouteCalculator';
import TaxFreeTracker from '@/components/TaxFreeTracker';
import EuskeraGlossary from '@/components/EuskeraGlossary';
import ThemeToggle from '@/components/ThemeToggle';
import WelcomeGroupModal from '@/components/WelcomeGroupModal';
import DaySearchModal from '@/components/DaySearchModal';
import PanuelicoIcon from '@/components/PanuelicoIcon';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit3,
  UserPlus,
  MapPin,
  Compass,
  Sparkles,
  Radio,
  Building2,
  Ticket,
  ExternalLink,
  Receipt,
  CheckSquare,
  Printer,
  Coins,
  ShieldAlert,
  Share2,
  ShoppingBag,
  BookOpen,
  WifiOff,
  Flame,
  Car,
} from 'lucide-react';
import {
  parseTransports,
  TRANSPORT_OPTIONS,
  TripDay,
  parseDocuments,
} from '@/lib/transports';
import type { RadarGroupDay } from '@/components/Map';

const DynamicMap = dynamic(() => import('@/components/Map'), { ssr: false });

const LOCAL_STORAGE_GROUP_KEY = 'selected_family_group';

export default function Home() {
  const [groups, setGroups] = useState<any[]>([]);
  const [currentGroupName, setCurrentGroupName] = useState('Gise y Dami');
  const [days, setDays] = useState<TripDay[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isDocumentDrawerOpen, setIsDocumentDrawerOpen] = useState(false);
  const [isExpenseTrackerOpen, setIsExpenseTrackerOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isTaxFreeOpen, setIsTaxFreeOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRadarMode, setIsRadarMode] = useState(false);
  const [radarDays, setRadarDays] = useState<RadarGroupDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareToast, setShareToast] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Atajo de teclado global: Cmd + K / Ctrl + K para abrir el buscador rápido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Monitor de estado online / offline
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // 1. Cargar lista de grupos y verificar URL / localStorage
  useEffect(() => {
    const init = async () => {
      const loadedGroups = await (async () => {
        try {
          const { data } = await supabase.from('family_groups').select('*').order('created_at', { ascending: true });
          return data && data.length > 0 ? data : [];
        } catch {
          return [];
        }
      })();
      setGroups(loadedGroups);

      // Prioridad 1: Parámetro ?grupo= en la URL
      const params = new URLSearchParams(window.location.search);
      const urlGroup = params.get('grupo');
      if (urlGroup) {
        const matched = loadedGroups.find((g: any) => g.name.toLowerCase() === urlGroup.toLowerCase()) || { name: urlGroup };
        localStorage.setItem(LOCAL_STORAGE_GROUP_KEY, matched.name);
        setCurrentGroupName(matched.name);
        return;
      }

      // Prioridad 2: localStorage
      const savedGroup = localStorage.getItem(LOCAL_STORAGE_GROUP_KEY);
      if (savedGroup) {
        setCurrentGroupName(savedGroup);
        return;
      }

      // Prioridad 3: Primera visita → abrir modal de bienvenida
      setIsWelcomeOpen(true);
      if (loadedGroups.length > 0) {
        setCurrentGroupName(loadedGroups[0].name);
      }
    };

    init();
  }, []);

  // Determina el día inicial de forma inteligente (viaje real julio 2027 o sessionStorage)
  const applySmartDayIndex = (loadedDays: TripDay[], groupName: string) => {
    if (!loadedDays || loadedDays.length === 0) return;

    // 1. Comprobar si la fecha de hoy coincide con el rango del viaje (2 al 25 de julio de 2027)
    const now = new Date();
    const isJuly2027 = now.getFullYear() === 2027 && now.getMonth() === 6; // 6 = Julio
    const dayOfMonth = now.getDate();

    if (isJuly2027 && dayOfMonth >= 2 && dayOfMonth <= 25) {
      // 2 de julio es Día 1, 3 de julio es Día 2, ..., 25 de julio es Día 24
      const targetDayNumber = dayOfMonth - 1;
      const matchingIdx = loadedDays.findIndex((d) => d.day_number === targetDayNumber);
      if (matchingIdx !== -1) {
        setCurrentIndex(matchingIdx);
        return;
      }
    }

    // 2. Si no coincide, consultar sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(`last_day_index_${groupName}`);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < loadedDays.length) {
            setCurrentIndex(parsed);
            return;
          }
        }
      } catch {
        // Ignorar restricciones en entornos sin acceso a sessionStorage
      }
    }

    // 3. En su defecto, iniciar en el Día 1 (índice 0)
    setCurrentIndex(0);
  };

  // Guardar en sessionStorage cada vez que el usuario cambia de día
  useEffect(() => {
    if (typeof window !== 'undefined' && currentGroupName && days.length > 0) {
      try {
        sessionStorage.setItem(`last_day_index_${currentGroupName}`, String(currentIndex));
      } catch {
        // Ignorar errores en almacenamiento
      }
    }
  }, [currentIndex, currentGroupName, days.length]);

  // 2. Cargar días del grupo seleccionado con soporte offline
  const fetchDays = async (groupName: string) => {
    setLoading(true);
    const localDaysKey = `cached_days_${groupName}`;

    try {
      const { data, error } = await supabase
        .from('trip_days')
        .select('*')
        .eq('group_name', groupName)
        .order('day_number', { ascending: true });

      if (!error && data && data.length > 0) {
        setDays(data);
        localStorage.setItem(localDaysKey, JSON.stringify(data));
        applySmartDayIndex(data, groupName);
      } else {
        const cached = localStorage.getItem(localDaysKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setDays(parsed);
          applySmartDayIndex(parsed, groupName);
        }
      }
    } catch {
      const cached = localStorage.getItem(localDaysKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setDays(parsed);
        applySmartDayIndex(parsed, groupName);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentGroupName) {
      fetchDays(currentGroupName);
    }
  }, [currentGroupName]);

  // 3. Consultar la posición de todos los grupos para el día activo (Radar Familiar)
  const fetchRadarDays = useCallback(async (dayNumber: number, groupList: any[]) => {
    try {
      const { data } = await supabase
        .from('trip_days')
        .select('*')
        .eq('day_number', dayNumber);

      if (data) {
        const mapped: RadarGroupDay[] = data.map((d: any) => {
          const foundGroup = groupList.find((g) => g.name === d.group_name);
          return {
            id: d.id,
            group_name: d.group_name,
            group_color: foundGroup?.color || '#009A44',
            day_number: d.day_number,
            city: d.city,
            lat: d.lat,
            lng: d.lng,
            activity: d.activity,
            transport_type: d.transport_type,
            accommodation_name: d.accommodation_name,
          };
        });
        setRadarDays(mapped);
      }
    } catch {
      // offline fallback
    }
  }, []);

  const currentDay = days[currentIndex] || ({} as TripDay);
  const activeDayNumber = currentDay.day_number || currentIndex + 1;

  useEffect(() => {
    if (groups.length > 0 && activeDayNumber) {
      fetchRadarDays(activeDayNumber, groups);
    }
  }, [activeDayNumber, groups, fetchRadarDays]);

  const handleSelectGroupFromWelcome = (groupName: string) => {
    localStorage.setItem(LOCAL_STORAGE_GROUP_KEY, groupName);
    setCurrentGroupName(groupName);
    setIsWelcomeOpen(false);
  };

  const handleChangeGroup = (groupName: string) => {
    localStorage.setItem(LOCAL_STORAGE_GROUP_KEY, groupName);
    setCurrentGroupName(groupName);
  };

  const handleShareLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?grupo=${encodeURIComponent(currentGroupName)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    } catch {
      prompt('Copiá este enlace para compartir tu itinerario:', url);
    }
  };

  const handleGroupCreated = async (newGroupName: string) => {
    const { data } = await supabase.from('family_groups').select('*').order('created_at', { ascending: true });
    if (data) setGroups(data);
    handleSelectGroupFromWelcome(newGroupName);
    setIsNewGroupOpen(false);
  };

  const handleAddNextDay = async () => {
    const nextNumber = days.length + 1;
    const { error } = await supabase.from('trip_days').insert({
      group_name: currentGroupName,
      day_number: nextNumber,
      date_text: `Día ${nextNumber}`,
      city: 'Madrid',
      lat: 40.4168,
      lng: -3.7038,
      transport_type: 'walk',
      activity: '',
    });
    if (!error) {
      fetchDays(currentGroupName);
      setIsEditOpen(false);
    }
  };

  const isSanFerminDay =
    currentDay.city?.toLowerCase().includes('pamplona') ||
    currentDay.city?.toLowerCase().includes('iruña') ||
    currentDay.city?.toLowerCase().includes('cáseda') ||
    (currentDay.day_number >= 5 && currentDay.day_number <= 9);

  const activeTransports = parseTransports(currentDay.transport_type);
  const hasCarTransport = activeTransports.includes('car');
  const activeDocuments = parseDocuments(currentDay.documents);

  /**
   * Elimina un documento del drawer:
   * 1. Si tiene storagePath, borra el archivo del bucket.
   * 2. Actualiza el array documents en trip_days.
   * 3. Refresca los días del grupo.
   */
  const handleDeleteDocumentFromDrawer = async (doc: import('@/lib/transports').TripDayDocument, idx: number) => {
    // 1. Borrar del Storage si corresponde
    if (doc.storagePath) {
      const { error: storageErr } = await supabase.storage
        .from('trip-documents')
        .remove([doc.storagePath]);
      if (storageErr) {
        console.warn('No se pudo eliminar el archivo del storage:', storageErr.message);
      }
    }

    // 2. Actualizar el array de documentos en la BD
    const updatedDocs = activeDocuments.filter((_, i) => i !== idx);
    await supabase
      .from('trip_days')
      .update({ documents: updatedDocs.length > 0 ? updatedDocs : null })
      .eq('id', currentDay.id);

    // 3. Refrescar datos
    fetchDays(currentGroupName);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">

      {/* Banner de Estado Offline */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-black py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo Offline Activo · Navegando con datos y mapas guardados en caché</span>
        </div>
      )}

      {/* Toast de enlace copiado */}
      {shareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-emerald-400">✓</span> ¡Enlace copiado! Compartilo por WhatsApp 🎉
        </div>
      )}

      {/* Header en Verde Ikurriña con Selector de Grupos y Herramientas */}
      <header className="bg-emerald-800 dark:bg-emerald-950 text-white px-4 sm:px-6 py-3 shadow-md flex flex-wrap justify-between items-center sticky top-0 z-40 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center">
            <PanuelicoIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black leading-tight tracking-tight">San Fermín 2027</h1>
            <p className="text-[11px] text-emerald-200 font-medium">Hub Familiar de Viajes</p>
          </div>
        </div>

        {/* Barra de Herramientas y Acciones */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          {/* Botones de Utilidades Rápidas */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 gap-0.5 sm:gap-1">
            <button
              onClick={() => setIsExpenseTrackerOpen(true)}
              className="px-2 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Gestor de gastos compartidos en €"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Gastos</span>
            </button>

            <button
              onClick={() => setIsChecklistOpen(true)}
              className="px-2 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Checklist de equipaje y trámites"
            >
              <CheckSquare className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden sm:inline">Checklist</span>
            </button>

            <button
              onClick={() => setIsCurrencyOpen(true)}
              className="px-2 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Conversor de divisas (€ / ARS / USD)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Divisas</span>
            </button>

            <button
              onClick={() => setIsTaxFreeOpen(true)}
              className="px-2 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Gestor de Tax Free DIVA (Compras en España)"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">Tax Free</span>
            </button>

            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="px-2 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Glosario de Euskera y Jerga Sanferminera"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden md:inline">Euskera</span>
            </button>

            <button
              onClick={() => setIsScheduleOpen(true)}
              className="px-2 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Cronograma San Fermín Hora por Hora"
            >
              <Flame className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden lg:inline">San Fermín</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-2 py-1.5 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Vista imprimible / Exportar a PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-200" />
              <span className="hidden lg:inline">Imprimir</span>
            </button>

            <button
              onClick={() => setIsEmergencyOpen(true)}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-xs"
              title="Contactos de emergencia 112 y seguro médico"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span>SOS</span>
            </button>

            {/* Toggle de Modo Oscuro */}
            <ThemeToggle />
          </div>

          {/* Botón Buscador Rápido (Cmd+K / Ctrl+K) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 px-2.5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-xs active:scale-95"
            title="Buscador rápido de itinerario (Ctrl+K o ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200 bg-black/25 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Chip de identidad activa + botón cambiar grupo */}
          <button
            onClick={() => setIsWelcomeOpen(true)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 px-2.5 py-2 rounded-xl transition cursor-pointer"
            title="Cambiar de grupo"
          >
            <span className="text-sm">👤</span>
            <span className="text-xs font-black text-white max-w-[110px] truncate hidden sm:inline">
              {currentGroupName}
            </span>
            <ChevronRight className="w-3 h-3 text-emerald-200 shrink-0" />
          </button>

          {/* Botón Compartir Itinerario */}
          <button
            onClick={handleShareLink}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            title="Compartir mi itinerario por WhatsApp"
          >
            <Share2 className="w-4 h-4 text-emerald-200" />
            <span className="hidden md:inline">Compartir</span>
          </button>

          {/* Selector de Grupo */}
          <select
            value={currentGroupName}
            onChange={(e) => handleChangeGroup(e.target.value)}
            className="bg-emerald-900 dark:bg-emerald-900 text-white text-xs font-bold rounded-xl px-2.5 py-2 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer hidden xl:block"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                👤 {g.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsNewGroupOpen(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2.5 py-2 rounded-xl text-xs font-bold items-center gap-1 transition cursor-pointer hidden md:flex"
            title="Crear nuevo grupo familiar"
          >
            <UserPlus className="w-4 h-4" /> <span className="hidden md:inline">Nuevo</span>
          </button>

          <button
            onClick={() => setIsEditOpen(true)}
            className="bg-white text-emerald-900 hover:bg-emerald-50 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-emerald-700" /> <span>Editar</span>
          </button>
        </div>
      </header>

      {/* Banner de Cuenta Regresiva al Txupinazo */}
      <CountdownBanner />

      {/* Línea de Tiempo Horizontal (Scroller de Días) */}
      <TimelineScroller
        days={days}
        currentIndex={currentIndex}
        onSelectDay={(index) => setCurrentIndex(index)}
      />

      {/* Contenido Principal */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Columna Izquierda: Tarjeta Grande del Día */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="space-y-4">
            
            {/* Cabecera del Día: Fecha y Navegación */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-800 text-white text-xs font-black px-3 py-1.5 rounded-xl">
                  DÍA {activeDayNumber}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm">
                  {currentDay.date_text || `Día ${activeDayNumber}`}
                </span>
                {isSanFerminDay && (
                  <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-[11px] font-black px-2 py-0.5 rounded-lg animate-pulse">
                    <PanuelicoIcon className="w-3.5 h-3.5" />
                    <span>San Fermín</span>
                  </span>
                )}
              </div>

              {/* Botones Anterior / Siguiente */}
              <div className="flex gap-1">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Día anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentIndex === days.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(days.length - 1, prev + 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Día siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Acceso Destacado al Cronograma de San Fermín si corresponde */}
            {isSanFerminDay && (
              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-between shadow-xs transition cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <PanuelicoIcon className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <span className="text-xs font-black block leading-tight">
                      Cronograma Oficial San Fermín Hora por Hora
                    </span>
                    <span className="text-[10px] text-red-100 block">
                      Dianas, Encierros (08:00h), Gigantes y Fuegos Artificiales
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Destino y Medios de Transporte */}
            <div className="flex justify-between items-start gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destino</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentDay.city || 'Destino por definir'}
                </h3>
                
                {/* Widget de Clima */}
                <div className="mt-2">
                  <WeatherWidget
                    lat={currentDay.lat}
                    lng={currentDay.lng}
                    city={currentDay.city}
                  />
                </div>
              </div>

              {/* Badges de Medios de Transporte */}
              <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1 max-w-[200px]">
                {activeTransports.map((tId) => {
                  const opt = TRANSPORT_OPTIONS[tId] || TRANSPORT_OPTIONS.walk;
                  const IconComp = opt.icon;
                  return (
                    <span
                      key={tId}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${opt.badgeClass}`}
                      title={opt.label}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${opt.badgeIconClass}`} />
                      <span>{opt.shortLabel}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Vuelo en Tiempo Real */}
            {currentDay.flight_code && (
              <FlightTracker flightCode={currentDay.flight_code} />
            )}

            {/* Calculador de Rutas en Auto si el día tiene transporte en coche */}
            {hasCarTransport && (
              <RouteCalculator city={currentDay.city} dayNumber={activeDayNumber} />
            )}

            {/* Sección de Alojamiento Detallado */}
            {currentDay.accommodation_name && (
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-xl shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      Alojamiento Reservado
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {currentDay.accommodation_name}
                    </h4>
                    {currentDay.accommodation_address && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {currentDay.accommodation_address}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    currentDay.accommodation_name + ' ' + (currentDay.accommodation_address || currentDay.city)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Ver</span>
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                </a>
              </div>
            )}

            {/* Bóveda de Tickets y Documentos */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tickets & Documentos
                </span>
                <button
                  type="button"
                  onClick={() => setIsDocumentDrawerOpen(true)}
                  className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ver Bóveda ({activeDocuments.length})</span>
                </button>
              </div>
              {activeDocuments.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeDocuments.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800 rounded-xl text-xs font-bold shadow-2xs transition group cursor-pointer"
                    >
                      <span>🎟️</span>
                      <span className="max-w-[130px] truncate">{doc.title}</span>
                      <ExternalLink className="w-3 h-3 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="w-full text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer transition text-left"
                >
                  <span>Sin tickets ni vouchers adjuntos para hoy.</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    + Adjuntar ticket
                  </span>
                </button>
              )}
            </div>

            {/* Actividades y Planes */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Actividades y Planes</span>
              <p className="text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm leading-relaxed whitespace-pre-line">
                {currentDay.activity || 'Sin actividades registradas para este día.'}
              </p>
            </div>

            {/* Mini-Guía Gastronómica y Tips Locales de la Ciudad */}
            <CityTips city={currentDay.city} dayNumber={activeDayNumber} />
          </div>

          <div className="pt-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${currentDay.lat || 40.4168},${currentDay.lng || -3.7038}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-center text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            >
              <MapPin className="w-4 h-4" /> Abrir Ciudad en Google Maps
            </a>
          </div>
        </div>

        {/* Columna Derecha: Mapa Leaflet con Modo Radar Familiar */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
          
          {/* Cabecera del Mapa con Toggle de Radar Familiar */}
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              {isRadarMode ? (
                <>
                  <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-slate-900 dark:text-white font-black">
                    Radar Familiar: Día {activeDayNumber} ({radarDays.length} grupos)
                  </span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-emerald-700" />
                  <span>Mapa del Recorrido: {currentGroupName}</span>
                </>
              )}
            </h3>

            {/* Botón Switch Modo Individual vs Radar Familiar */}
            <button
              onClick={() => setIsRadarMode((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
                isRadarMode
                  ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300'
                  : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isRadarMode ? 'animate-pulse' : ''}`} />
              <span>{isRadarMode ? 'Ver Itinerario Individual' : 'Activar Radar Familiar'}</span>
            </button>
          </div>

          {/* Contenedor del Mapa Leaflet */}
          <div className="w-full flex-1 min-h-[480px] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner relative">
            {loading ? (
              <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                <span>Cargando mapa interactivo...</span>
              </div>
            ) : (
              <DynamicMap
                days={days}
                currentDayIndex={currentIndex}
                onSelectDay={(index) => setCurrentIndex(index)}
                isRadarMode={isRadarMode}
                radarDays={radarDays}
              />
            )}
          </div>

        </div>
      </main>

      {/* Modales y Drawers */}
      
      {/* Modal de edición */}
      <EditModal
        isOpen={isEditOpen}
        day={currentDay}
        onClose={() => setIsEditOpen(false)}
        onUpdated={() => {
          fetchDays(currentGroupName);
          if (activeDayNumber) fetchRadarDays(activeDayNumber, groups);
        }}
        onAddDay={handleAddNextDay}
      />

      {/* Bóveda / Drawer de Documentos */}
      <DocumentDrawer
        isOpen={isDocumentDrawerOpen}
        onClose={() => setIsDocumentDrawerOpen(false)}
        dayNumber={activeDayNumber}
        dateText={currentDay.date_text || `Día ${activeDayNumber}`}
        city={currentDay.city || 'Destino'}
        documents={activeDocuments}
        onOpenEdit={() => setIsEditOpen(true)}
        onDeleteDocument={handleDeleteDocumentFromDrawer}
      />

      {/* Modal de nuevo grupo */}
      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Gestor de Gastos Compartidos */}
      <ExpenseTracker
        isOpen={isExpenseTrackerOpen}
        onClose={() => setIsExpenseTrackerOpen(false)}
        groups={groups}
      />

      {/* Checklist de Viaje */}
      <TravelChecklist
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />

      {/* Itinerario Imprimible / Exportar a PDF */}
      <PrintableItinerary
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        days={days}
        groupName={currentGroupName}
      />

      {/* Conversor de Divisas */}
      <CurrencyConverter
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
      />

      {/* Ficha de Emergencias SOS */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Modal de Bienvenida / Selector de Grupo */}
      <WelcomeGroupModal
        isOpen={isWelcomeOpen}
        groups={groups}
        onSelectGroup={handleSelectGroupFromWelcome}
        onCreateNewGroup={() => {
          setIsWelcomeOpen(false);
          setIsNewGroupOpen(true);
        }}
        onViewAll={() => {
          setIsWelcomeOpen(false);
          setIsRadarMode(true);
        }}
      />

      {/* Cronograma San Fermín Hora por Hora */}
      <SanFerminSchedule
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        initialDay={
          activeDayNumber === 6 ? '6' : activeDayNumber === 7 ? '7' : activeDayNumber === 8 ? '8' : activeDayNumber === 9 ? '9' : '6'
        }
      />

      {/* Gestor de Tax Free DIVA */}
      <TaxFreeTracker
        isOpen={isTaxFreeOpen}
        onClose={() => setIsTaxFreeOpen(false)}
      />

      {/* Glosario de Euskera y Jerga Sanferminera */}
      <EuskeraGlossary
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Buscador Rápido de Itinerario (Cmd+K / Ctrl+K) */}
      <DaySearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        days={days}
        onSelectDay={(index) => {
          setCurrentIndex(index);
          setIsSearchOpen(false);
        }}
      />

    </div>
  );
}