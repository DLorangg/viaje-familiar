// components/FlightTracker.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plane, RefreshCw } from 'lucide-react';

interface FlightData {
  flight?: string;
  airline?: string;
  status?: string;
  departureTime?: string;
  departureAirport?: string;
  arrivalTime?: string;
  arrivalAirport?: string;
  terminal?: string;
  gate?: string;
}

function SingleFlightCard({ code }: { code: string }) {
  const [data, setData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFlight = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flight?flight=${encodeURIComponent(code.trim())}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlight();
  }, [code]);

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 shadow-sm">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-600 text-white rounded-lg">
            <Plane className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-black text-sky-950 text-sm block leading-tight">
              {data?.flight || code}
            </span>
            <span className="text-[10px] text-sky-700 font-medium">
              {data?.airline || 'Aerolínea Comercial'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-sky-200/80 text-sky-900 font-bold px-2 py-0.5 rounded-full">
            {loading ? 'Consultando...' : data?.status || 'Programado'}
          </span>
          <button
            onClick={fetchFlight}
            className="p-1 hover:bg-sky-100 rounded-full text-sky-600 transition"
            title="Actualizar vuelo"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs border-t border-sky-100 pt-2 text-sky-900">
        <div>
          <span className="text-sky-500 font-semibold block text-[10px]">Salida</span>
          <span className="font-bold text-xs text-slate-800">{data?.departureTime || '--:--'}</span>
          <span className="block text-[10px] text-slate-600 truncate" title={data?.departureAirport}>
            {data?.departureAirport}
          </span>
        </div>
        <div>
          <span className="text-sky-500 font-semibold block text-[10px]">Llegada</span>
          <span className="font-bold text-xs text-slate-800">{data?.arrivalTime || '--:--'}</span>
          <span className="block text-[10px] text-slate-600 truncate" title={data?.arrivalAirport}>
            {data?.arrivalAirport}
          </span>
        </div>
      </div>

      {(data?.terminal || data?.gate) && (
        <div className="mt-2 pt-1.5 border-t border-sky-100/70 flex justify-between text-[10px] text-sky-800 font-medium">
          <span>Terminal: <b className="text-slate-800">{data.terminal}</b></span>
          <span>Puerta: <b className="text-slate-800">{data.gate}</b></span>
        </div>
      )}
    </div>
  );
}

export default function FlightTracker({ flightCode }: { flightCode: string }) {
  if (!flightCode) return null;

  // Si hay múltiples vuelos separados por coma (ej: "AR1650, AR1132")
  const flightCodes = flightCode.split(',').map((c) => c.trim()).filter(Boolean);

  return (
    <div className="space-y-2.5">
      {flightCodes.map((code) => (
        <SingleFlightCard key={code} code={code} />
      ))}
    </div>
  );
}