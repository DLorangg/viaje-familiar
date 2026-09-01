// app/api/flight/route.ts
import { NextResponse } from 'next/server';

// Base de datos de vuelos conocidos del viaje (respaldo exacto)
const FLIGHT_CATALOG: Record<string, any> = {
  'AR1132': {
    flight: 'AR 1132',
    airline: 'Aerolíneas Argentinas',
    status: 'Programado',
    departureAirport: 'Buenos Aires (EZE - Ezeiza)',
    arrivalAirport: 'Madrid (MAD - Barajas T1)',
    departureTime: '23:55 hs',
    arrivalTime: '16:10 hs (+1)',
    terminal: 'Terminal A',
    gate: 'Puerta 12',
    live: false
  },
  'AR1133': {
    flight: 'AR 1133',
    airline: 'Aerolíneas Argentinas',
    status: 'Programado',
    departureAirport: 'Madrid (MAD - Barajas T1)',
    arrivalAirport: 'Buenos Aires (EZE - Ezeiza)',
    departureTime: '20:05 hs',
    arrivalTime: '04:20 hs (+1)',
    terminal: 'Terminal 1',
    gate: 'Puerta B24',
    live: false
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawFlight = searchParams.get('flight');

  if (!rawFlight) {
    return NextResponse.json({ error: 'Número de vuelo requerido' }, { status: 400 });
  }

  // Normalizar código (eliminar espacios y pasar a mayúsculas)
  const normalizedCode = rawFlight.replace(/\s+/g, '').toUpperCase();
  const apiKey = process.env.RAPIDAPI_KEY;

  // 1. Si no hay API Key activa o está en desarrollo, responder con el catálogo de rutas
  if (!apiKey) {
    const mockData = FLIGHT_CATALOG[normalizedCode] || {
      flight: rawFlight,
      airline: 'Aerolínea Comercial',
      status: 'Programado',
      departureAirport: 'Aeropuerto Origen',
      arrivalAirport: 'Aeropuerto Destino',
      departureTime: '--:--',
      arrivalTime: '--:--',
      terminal: 'TBD',
      gate: 'TBD',
      live: false
    };

    return NextResponse.json(mockData);
  }

  // 2. Consulta en vivo a la API externa
  try {
    const response = await fetch(
      `https://aerodatabox.p.rapidapi.com/flights/number/${normalizedCode}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
        },
        next: { revalidate: 300 } // Cachear por 5 minutos
      }
    );

    const data = await response.json();
    const flight = Array.isArray(data) ? data[0] : data;

    if (!flight || !flight.departure) {
      // Si la API no tiene datos para esa fecha, usar el catálogo de respaldo
      return NextResponse.json(FLIGHT_CATALOG[normalizedCode] || { flight: rawFlight, status: 'Confirmado' });
    }

    return NextResponse.json({
      flight: `${flight.airline?.name || ''} ${normalizedCode}`.trim(),
      airline: flight.airline?.name || 'Aerolínea Comercial',
      status: flight.status || 'Programado',
      departureTime: flight.departure?.scheduledTimeLocal ? flight.departure.scheduledTimeLocal.substring(11, 16) + ' hs' : '--:--',
      arrivalTime: flight.arrival?.scheduledTimeLocal ? flight.arrival.scheduledTimeLocal.substring(11, 16) + ' hs' : '--:--',
      departureAirport: `${flight.departure?.airport?.name || 'Origen'} (${flight.departure?.airport?.iata || ''})`,
      arrivalAirport: `${flight.arrival?.airport?.name || 'Destino'} (${flight.arrival?.airport?.iata || ''})`,
      terminal: flight.departure?.terminal || 'TBD',
      gate: flight.departure?.gate || 'TBD',
      live: true
    });
  } catch (error) {
    // Si falla la conexión con el proveedor externo, responder con el catálogo
    return NextResponse.json(FLIGHT_CATALOG[normalizedCode] || { flight: rawFlight, status: 'Confirmado' });
  }
}