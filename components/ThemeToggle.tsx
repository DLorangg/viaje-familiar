// components/ThemeToggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-white/10" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 hover:bg-white/20 text-white rounded-xl transition cursor-pointer flex items-center justify-center"
      title={isDark ? 'Cambiar a Modo Claro' : 'Activar Modo Oscuro / Ahorro de Batería'}
      aria-label="Cambiar tema"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-200 animate-in spin-in-180 duration-300" />
      )}
    </button>
  );
}
