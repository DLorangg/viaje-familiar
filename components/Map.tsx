// components/Map.tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseTransports, TRANSPORT_OPTIONS } from '@/lib/transports';

export interface DayItem {
  id: string;
  day_number: number;
  city: string;
  lat: number;
  lng: number;
  transport_type?: string | null;
}

export interface RadarGroupDay {
  id: string;
  group_name: string;
  group_color?: string;
  day_number: number;
  city: string;
  lat: number;
  lng: number;
  activity?: string;
  transport_type?: string;
  accommodation_name?: string;
}

interface MapProps {
  days: DayItem[];
  currentDayIndex: number;
  onSelectDay?: (index: number) => void;
  isRadarMode?: boolean;
  radarDays?: RadarGroupDay[];
}

export default function Map({
  days,
  currentDayIndex,
  onSelectDay,
  isRadarMode = false,
  radarDays = [],
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // 1. Inicialización segura del mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([40.4168, -3.7038], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Actualización de marcadores y rutas
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // MODO RADAR FAMILIAR
    if (isRadarMode && radarDays && radarDays.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      // Agrupar grupos que estén en la misma ciudad / coordenadas
      const clusters: Record<string, RadarGroupDay[]> = {};
      radarDays.forEach((groupDay) => {
        if (typeof groupDay.lat !== 'number' || typeof groupDay.lng !== 'number') return;
        const key = `${groupDay.lat.toFixed(2)},${groupDay.lng.toFixed(2)}`;
        if (!clusters[key]) clusters[key] = [];
        clusters[key].push(groupDay);
      });

      const bounds: [number, number][] = [];

      Object.values(clusters).forEach((groupCluster) => {
        const first = groupCluster[0];
        bounds.push([first.lat, first.lng]);

        if (groupCluster.length > 1) {
          // Reunión Familiar (Múltiples grupos en la misma ciudad)
          const clusterNames = groupCluster.map((g) => g.group_name).join(', ');
          const clusterHtml = `
            <div style="
              background: linear-gradient(135deg, #dc2626, #991b1b);
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: 900;
              font-size: 11px;
              border: 2px solid white;
              box-shadow: 0 4px 14px rgba(220,38,38,0.45);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
            ">
              <span style="font-size: 13px;">🧣</span>
              <span>¡Reunión Familiar! (${groupCluster.length})</span>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'radar-cluster-pin',
            html: clusterHtml,
            iconSize: [160, 32],
            iconAnchor: [80, 16],
          });

          const marker = L.marker([first.lat, first.lng], { icon: customIcon });
          marker.bindTooltip(
            `<div style="font-family: inherit; min-width: 160px;">
              <b style="color: #dc2626; font-size: 13px;">🎉 ¡Reunión Familiar en ${first.city}!</b>
              <div style="margin-top: 4px; font-size: 11px; color: #334155;">
                <b>Grupos presentes:</b> ${clusterNames}
              </div>
              <div style="margin-top: 6px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
                ${groupCluster.map((g) => `• <b>${g.group_name}</b>: ${g.activity || g.city}`).join('<br/>')}
              </div>
            </div>`,
            { direction: 'top', offset: [0, -10] }
          );

          markersLayer.addLayer(marker);
        } else {
          // Grupo individual
          const g = first;
          const groupColor = g.group_color || '#009A44';
          const pinHtml = `
            <div style="
              background-color: ${groupColor};
              color: white;
              padding: 5px 10px;
              border-radius: 16px;
              font-weight: 800;
              font-size: 11px;
              border: 2px solid white;
              box-shadow: 0 3px 10px rgba(0,0,0,0.3);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 5px;
              cursor: pointer;
            ">
              <span>👤</span>
              <span>${g.group_name}</span>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'radar-group-pin',
            html: pinHtml,
            iconSize: [120, 28],
            iconAnchor: [60, 14],
          });

          const marker = L.marker([g.lat, g.lng], { icon: customIcon });
          marker.bindTooltip(
            `<div style="font-family: inherit;">
              <b style="color: ${groupColor}; font-size: 12px;">👤 ${g.group_name}</b><br/>
              📍 <b>${g.city}</b> (Día ${g.day_number})<br/>
              📝 <i>${g.activity || 'Sin actividades registradas'}</i>
              ${g.accommodation_name ? `<br/>🏨 ${g.accommodation_name}` : ''}
            </div>`,
            { direction: 'top', offset: [0, -10] }
          );

          markersLayer.addLayer(marker);
        }
      });

      // Encuadrar el mapa para ver a todos los familiares
      if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 12, animate: true });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 8, { animate: true });
      }

      return;
    }

    // MODO VISTA INDIVIDUAL (Itinerario del grupo actual)
    if (!days || days.length === 0) return;

    // Dibujar pines de todos los días del grupo seleccionado
    days.forEach((day, index) => {
      const isSelected = index === currentDayIndex;

      const markerHtml = `
        <div style="
          background-color: ${isSelected ? '#dc2626' : '#065f46'};
          color: white;
          width: ${isSelected ? '32px' : '22px'};
          height: ${isSelected ? '32px' : '22px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: ${isSelected ? '13px' : '10px'};
          border: 2px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${day.day_number}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: markerHtml,
        iconSize: [isSelected ? 32 : 22, isSelected ? 32 : 22],
        iconAnchor: [isSelected ? 16 : 11, isSelected ? 16 : 11],
      });

      const marker = L.marker([day.lat, day.lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectDay) onSelectDay(index);
      });

      const transportEmojis = parseTransports(day.transport_type)
        .map((t) => TRANSPORT_OPTIONS[t]?.emoji || '')
        .filter(Boolean)
        .join(' ');

      marker.bindTooltip(
        `<b>Día ${day.day_number}: ${day.city}</b>${transportEmojis ? ` <span style="font-size: 11px;">${transportEmojis}</span>` : ''}`,
        {
          direction: 'top',
          offset: [0, -10],
        }
      );

      markersLayer.addLayer(marker);
    });

    // Trazar línea conectora del itinerario
    const coords: [number, number][] = days.map((d) => [d.lat, d.lng]);
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(coords);
    } else {
      polylineRef.current = L.polyline(coords, {
        color: '#065f46',
        weight: 3,
        opacity: 0.75,
        dashArray: '5, 8',
      }).addTo(map);
    }

    // Centrar en el día actual
    const currentDay = days[currentDayIndex];
    if (currentDay && typeof currentDay.lat === 'number' && typeof currentDay.lng === 'number') {
      const targetZoom = currentDay.city.toLowerCase().includes('buenos aires') ? 6 : 11;
      map.setView([currentDay.lat, currentDay.lng], targetZoom, { animate: true });
    }
  }, [days, currentDayIndex, onSelectDay, isRadarMode, radarDays]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[440px] rounded-2xl" />;
}