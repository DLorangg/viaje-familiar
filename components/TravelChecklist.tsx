// components/TravelChecklist.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Plus, Trash2, RotateCcw, Check, Sparkles, ShieldAlert } from 'lucide-react';
import PanuelicoIcon from '@/components/PanuelicoIcon';

export interface ChecklistItem {
  id: string;
  text: string;
  category: 'clothing' | 'docs' | 'tech' | 'logistics';
  checked: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Indumentaria
  { id: 'c1', text: 'Pantalón blanco (para San Fermín / Txupinazo)', category: 'clothing', checked: false },
  { id: 'c2', text: 'Remera o camisa blanca impoluta', category: 'clothing', checked: false },
  { id: 'c3', text: 'Pañuelico rojo tradicional de San Fermín', category: 'clothing', checked: true },
  { id: 'c4', text: 'Faja roja festiva', category: 'clothing', checked: false },
  { id: 'c5', text: 'Calzado cómodo y cerrado para caminar', category: 'clothing', checked: false },
  { id: 'c6', text: 'Campera liviana o abrigo para las noches', category: 'clothing', checked: false },

  // Documentos
  { id: 'd1', text: 'Pasaporte vigente (mínimo 6 meses de validez)', category: 'docs', checked: false },
  { id: 'd2', text: 'Pasajes de avión (AR1132 / Vuelos)', category: 'docs', checked: false },
  { id: 'd3', text: 'Reservas de trenes Renfe / AVE', category: 'docs', checked: false },
  { id: 'd4', text: 'Seguro médico y asistencia al viajero', category: 'docs', checked: false },
  { id: 'd5', text: 'Vouchers y confirmaciones de hotel / Airbnb', category: 'docs', checked: false },

  // Tecnología
  { id: 't1', text: 'Adaptadores de enchufe europeos (Tipo C / F)', category: 'tech', checked: false },
  { id: 't2', text: 'Powerbank / cargador portátil para el día', category: 'tech', checked: false },
  { id: 't3', text: 'Chip eSIM internacional / Roaming habilitado', category: 'tech', checked: false },
  { id: 't4', text: 'Cables de carga y auriculares', category: 'tech', checked: false },

  // Logística
  { id: 'l1', text: 'Licencia de conducir internacional (alquiler de auto)', category: 'logistics', checked: false },
  { id: 'l2', text: 'Tarjeta de crédito con aviso de viaje en el banco', category: 'logistics', checked: false },
  { id: 'l3', text: 'Euros en efectivo para peñas y comercios tradicionales', category: 'logistics', checked: false },
];

const LOCAL_STORAGE_KEY = 'san_fermin_2027_checklist';

interface TravelChecklistProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TravelChecklist({ isOpen, onClose }: TravelChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'clothing' | 'docs' | 'tech' | 'logistics'>('clothing');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(DEFAULT_ITEMS);
      }
    }
  }, []);

  const saveItems = (newItems: ChecklistItem[]) => {
    setItems(newItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
  };

  const handleToggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: String(Date.now()),
      text: newItemText.trim(),
      category: newItemCategory,
      checked: false,
    };

    saveItems([...items, newItem]);
    setNewItemText('');
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    saveItems(updated);
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer el checklist a la lista recomendada original?')) {
      saveItems(DEFAULT_ITEMS);
    }
  };

  if (!isOpen) return null;

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.checked).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((i) => i.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Checklist de Equipaje & Trámites</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Preparativos indispensables para España y San Fermín 2027
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

          {/* Barra de Progreso */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mt-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Progreso de preparación</span>
              <span className="text-emerald-700 font-black">{completedItems} de {totalItems} ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Filtros por Categoría */}
          <div className="flex gap-1.5 overflow-x-auto py-3 no-scrollbar text-xs font-bold">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'clothing', label: '🧣 Ropa Blanca' },
              { id: 'docs', label: '📄 Documentos' },
              { id: 'tech', label: '🔌 Tecnología' },
              { id: 'logistics', label: '🚗 Logística' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Lista de Items */}
          <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition cursor-pointer select-none group ${
                  item.checked
                    ? 'bg-emerald-50/70 border-emerald-200 text-slate-500 line-through'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-800 font-bold shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition shrink-0 ${
                      item.checked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 group-hover:border-emerald-600'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="truncate flex-1">{item.text}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="text-slate-400 hover:text-red-600 p-1 transition opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                  title="Eliminar ítem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Formulario para agregar ítem */}
            {showAddForm ? (
              <form onSubmit={handleAddItem} className="bg-slate-100 p-3 rounded-2xl border border-slate-300 space-y-2">
                <input
                  type="text"
                  placeholder="Ej: Cámara de fotos, Protector solar..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="clothing">🧣 Indumentaria</option>
                    <option value="docs">📄 Documentos</option>
                    <option value="tech">🔌 Tecnología</option>
                    <option value="logistics">🚗 Logística</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar elemento a la lista
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
            title="Restablecer items originales"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
