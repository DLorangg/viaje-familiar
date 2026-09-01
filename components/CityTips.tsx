// components/CityTips.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, UtensilsCrossed, Sparkles, MapPin, Wine, Store } from 'lucide-react';
import PanuelicoIcon from '@/components/PanuelicoIcon';

interface CityTipsProps {
  city?: string;
  dayNumber?: number;
}

interface GastronomicBar {
  name: string;
  specialty: string;
  address?: string;
}

interface CityTipData {
  title: string;
  gastronomy: string[];
  bars: GastronomicBar[];
  traditions: string[];
  hotspots: string[];
}

function getCityData(cityName?: string): CityTipData {
  const name = (cityName || '').toLowerCase();

  if (name.includes('pamplona') || name.includes('iruña')) {
    return {
      title: 'Pamplona / Iruña (San Fermín)',
      gastronomy: [
        'Ruta de Fritos y Chistorra en Calles San Nicolás y Estafeta (probar el frito de pimiento en Bar San Nicolás).',
        'Pacharán navarro casero con hielos servido después de las comidas de cuadrilla.',
        'Ajoarriero tradicional navarro y verduras de la huerta de la Ribera (espárragos y alcachofas de Tudela).'
      ],
      bars: [
        { name: 'Bar Gaucho', specialty: 'Foie fresco a la plancha, huevo trufado y erizo de mar', address: 'C/ Espoz y Mina 7' },
        { name: 'Bar San Nicolás', specialty: 'Fritos tradicionales de pimiento, huevo y croquetas caseras', address: 'C/ San Nicolás 13' },
        { name: 'Bodega San Fermín', specialty: 'Vino navarro de bota y chistorra al sarmiento', address: 'C/ San Nicolás 21' },
        { name: 'Bar Baserri Berri', specialty: 'Pintxos creativos y de autor vanguardistas', address: 'C/ San Nicolás 32' },
      ],
      traditions: [
        '¡Regla de Oro!: El pañuelico rojo se lleva en la muñeca o en el bolsillo hasta las 12:00 h del 6 de julio (Txupinazo). Recién al grito de "¡Viva San Fermín!" se anuda al cuello.',
        'La fiesta se vive en la calle de blanco absoluto con faja y pañuelo rojo.',
        'Ambiente de peñas con charangas en la Calle Jarauta y Plaza del Castillo por la tarde.'
      ],
      hotspots: ['Plaza del Castillo', 'Calle Estafeta', 'Monumento al Encierro', 'Calle San Nicolás', 'Cuesta Santo Domingo']
    };
  }

  if (name.includes('donostia') || name.includes('san sebastián')) {
    return {
      title: 'Donostia / San Sebastián',
      gastronomy: [
        'Ruta de Pintxos por la Parte Vieja: pedir la Gilda clásica (guindilla de Ibarra, anchoa del Cantábrico y aceituna).',
        'Tarta de queso caramelizada mundialmente famosa de La Viña (Calle 31 de Agosto).',
        'Txangurro al horno (centollo desmigado) y brochetas de gambas con vino Txakoli bien frío escanciado.'
      ],
      bars: [
        { name: 'La Viña', specialty: 'La auténtica y legendaria tarta de queso vasca (pedir ración doble)', address: 'C/ 31 de Agosto 3' },
        { name: 'Bar Txepetxa', specialty: 'Pintxos gourmet de anchoas marinadas (con crema de centollo o foie)', address: 'C/ Pescadería 5' },
        { name: 'Gandarias', specialty: 'Solomillo tierno con pimiento de Gernika y brocheta de setas', address: 'C/ 31 de Agosto 23' },
        { name: 'Bar Nestor', specialty: 'La tortilla de patatas más deseada y chuletón a la brasa', address: 'C/ Pescadería 11' },
      ],
      traditions: [
        'Costumbre del Poteo: se pide un pintxo y un zurito/txakoli en cada bar y se rota caminando por el Casco Viejo.',
        'Paseo por la Bahía de La Concha hasta el Peine del Viento de Chillida al atardecer.'
      ],
      hotspots: ['Parte Vieja (Calle 31 de Agosto)', 'Playa de La Concha', 'Peine del Viento', 'Monte Urgull']
    };
  }

  if (name.includes('bilbao') || name.includes('bilbo')) {
    return {
      title: 'Bilbao (Bizkaia)',
      gastronomy: [
        'Pintxos en los bares bajo los arcos de Plaza Nueva (bacalao al pil-pil y rabas de calamar crujientes).',
        'Visita gastronómica al Mercado de la Ribera (el mercado cubierto más grande de Europa) con barras de degustación.',
        'Pastel Vasco tradicional y bollos de mantequilla típicos de panaderías bilbaínas.'
      ],
      bars: [
        { name: 'Mercado de la Ribera', specialty: 'Gildas gigantes, mariscos y degustación frente a la ría', address: 'Plaza de la Ribera' },
        { name: 'Bar Gure Toki', specialty: 'Sopa de Idiazábal, costilla melosa y bacalao confitado', address: 'Plaza Nueva 12' },
        { name: 'Café Iruña (Bilbao)', specialty: 'Pinchos morunos al carbón en un palacio de azulejos mudéjares', address: 'C/ Colón de Larreátegui 13' },
      ],
      traditions: [
        'Tomar un zurito (medio vaso de cerveza) o marianito (vermut preparado con ginebra) antes del almuerzo.',
        'Caminar por las Siete Calles (Zazpikaleak) y la ría del Nervión junto al Museo Guggenheim.'
      ],
      hotspots: ['Plaza Nueva', 'Mercado de la Ribera', 'Museo Guggenheim', 'Siete Calles']
    };
  }

  if (name.includes('granada')) {
    return {
      title: 'Granada (Andalucía)',
      gastronomy: [
        'Cultura de "Tapa Gratis": con cada caña, tinto de verano o vino te sirven una abundante tapa sin recargo.',
        'Piononos de Santa Fe (dulce embebido en almíbar y crema tostada) en confitería Ysla.',
        'Habitas tiernas con jamón de Trevélez y berenjenas fritas crujientes con miel de caña.'
      ],
      bars: [
        { name: 'Bar Los Diamantes', specialty: 'Pescaíto frito andaluz, gambas y calamares como tapa gratuita', address: 'C/ Navas 28' },
        { name: 'Bodegas Castañeda', specialty: 'Tablas calientes de ibéricos, queso curado y vermut de barril "Calicasas"', address: 'C/ Almireceros 1' },
      ],
      traditions: [
        'Subir al Mirador de San Nicolás en el barrio del Albaicín durante la puesta de sol dorada sobre La Alhambra.',
        'Pasear por el Paseo de los Tristes a la orilla del río Darro con vistas a las torres nazaríes.'
      ],
      hotspots: ['La Alhambra & Generalife', 'Barrio del Albaicín', 'Calle Navas', 'Mirador San Nicolás']
    };
  }

  if (name.includes('zaragoza')) {
    return {
      title: 'Zaragoza (Aragón)',
      gastronomy: [
        'Tapas en "El Tubo", el laberinto de callejuelas más concurrido de Aragón.',
        'Ternasco de Aragón asado (cordero lechal D.O. tierno con patatas panaderas).',
        'Frutas de Aragón confitadas bañadas en chocolate negro puro.'
      ],
      bars: [
        { name: 'Bar El Champi', specialty: 'Pintxo pirámide de champiñones a la plancha con gamba y salsa secreta', address: 'C/ Libertad 16 (El Tubo)' },
        { name: 'La Miguería', specialty: 'Cazuelas de migas aragonesas con uva, chistorra y huevo', address: 'C/ San Sebastián 5' },
      ],
      traditions: [
        'Costumbre de pasar a besar el manto de la Virgen del Pilar en la Basílica.',
        'Pasear por el Puente de Piedra con la imponente vista de la Basílica del Pilar sobre el río Ebro.'
      ],
      hotspots: ['El Tubo', 'Plaza del Pilar', 'Basílica del Pilar', 'Palacio de la Aljafería']
    };
  }

  if (name.includes('madrid')) {
    return {
      title: 'Madrid',
      gastronomy: [
        'Bocadillo de calamares fritos recién rebozados en pan crujiente en los bares de Plaza Mayor.',
        'Vermut de grifo con patatas bravas y tortilla de patatas jugosa con cebolla en La Latina.',
        'Churros y porras con chocolate caliente espeso tradicional.'
      ],
      bars: [
        { name: 'Chocolatería San Ginés', specialty: 'Churros y porras artesanales con chocolate espeso (abierto 24h)', address: 'Pasadizo de San Ginés 5' },
        { name: 'Bar La Campana', specialty: 'El rey del bocadillo de calamares en pan recién horneado', address: 'C/ Botoneras 6 (Plaza Mayor)' },
        { name: 'Mercado de San Miguel', specialty: 'Ostras, quesos ibéricos, pinchos de tortilla y vermut gourmet', address: 'Plaza de San Miguel' },
        { name: 'Casa Revuelta', specialty: 'Soldaditos de Pavía (tajadas de bacalao rebozado insuperables)', address: 'C/ Latoneros 3' },
      ],
      traditions: [
        'Pasear por el Parque del Retiro en bote y disfrutar del atardecer en el Templo de Debod egipcio.',
        'Tapeo de domingo al mediodía por la Cava Baja y el Rastro madrileño.'
      ],
      hotspots: ['Plaza Mayor', 'Barrio de La Latina', 'Mercado de San Miguel', 'Parque del Retiro', 'Puerta del Sol']
    };
  }

  if (name.includes('barcelona')) {
    return {
      title: 'Barcelona (Catalunya)',
      gastronomy: [
        'Pa amb tomàquet (pan con tomate de colgar) con jamón ibérico de bellota y butifarra con mongetes.',
        'Paella marinera o Fideuà con alioli casero en terrazas frente al mar.',
        'Tapeo cosmopolita en los barrios de El Born y Gràcia.'
      ],
      bars: [
        { name: 'Bar La Cova Fumada', specialty: 'La auténtica "Bomba de la Barceloneta" (croquetón de patata, carne y salsa picante)', address: 'C/ del Baluard 56' },
        { name: 'El Xampanyet', specialty: 'Cava rosado de la casa con anchoas del Cantábrico y tortilla', address: 'C/ de Montcada 22 (El Born)' },
      ],
      traditions: [
        'Pasear por las Ramblas y el Barrio Gótico hasta la Catedral del Mar (Santa María del Mar).',
        'Contemplar las fachadas iluminadas de Gaudí (Sagrada Familia y Casa Batlló) de noche.'
      ],
      hotspots: ['Barrio Gótico', 'El Born', 'Paseo de Gràcia', 'Playa de la Barceloneta']
    };
  }

  if (name.includes('cáseda') || name.includes('sangüesa') || name.includes('javier')) {
    return {
      title: 'Cáseda & Navarra Rural',
      gastronomy: [
        'Vinos tintos y rosados D.O. Navarra de bodegas históricas de la comarca.',
        'Costillicas de cordero a la brasa de sarmiento y queso de oveja de Roncal / Idiazábal.',
        'Repostería tradicional de pueblo (trenzas de hojaldre) y embutidos caseros.'
      ],
      bars: [
        { name: 'Mesón Rural de Cáseda', specialty: 'Almuerzos populares con txistorra, huevos fritos y vino navarro', address: 'Plaza del Pueblo' },
        { name: 'Restaurante Castillo de Javier', specialty: 'Menú del peregrino con pochas navarras y ternera estofada', address: 'Javier (Navarra)' },
      ],
      traditions: [
        'Reunión familiar extendida, sobremesa larga y visita al Castillo de San Francisco Javier y Monasterio de Leyre.',
        'Tranquilidad de pueblo navarro a orillas del río Aragón.'
      ],
      hotspots: ['Castillo de Javier', 'Monasterio de Leyre', 'Orillas del Río Aragón', 'Sangüesa Histórica']
    };
  }

  return {
    title: cityName || 'España',
    gastronomy: [
      'Tapeo tradicional español: tortilla de patatas jugosa, jamón ibérico de bellota y croquetas caseras.',
      'Vino tinto de Rioja o Ribera del Duero y cañas de cerveza bien frías tiradas al momento.'
    ],
    bars: [
      { name: 'Taberna Típica', specialty: 'Tortilla de patatas, tabla de quesos y embutidos ibéricos' },
    ],
    traditions: [
      'Horarios locales: el almuerzo se sirve entre 13:30 y 15:30 h, y la cena a partir de las 21:00 h.',
      'La sobremesa es sagrada: tiempo para conversar relajadamente después de comer.'
    ],
    hotspots: ['Centro Histórico', 'Plaza Mayor', 'Mercado Municipal']
  };
}

export default function CityTips({ city, dayNumber }: CityTipsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const data = getCityData(city);
  const isSanFermin = data.title.includes('Pamplona') || data.title.includes('San Fermín');

  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl overflow-hidden transition shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-100/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-emerald-700 text-white rounded-xl shrink-0">
            <UtensilsCrossed className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <span>💡 Tips & Gastronomía: {data.title}</span>
              {isSanFermin && <PanuelicoIcon className="w-3.5 h-3.5 shrink-0" />}
            </h4>
            <p className="text-[11px] text-emerald-800 font-medium">
              Bares insignia, pintxos estrella y tradiciones locales
            </p>
          </div>
        </div>

        <div className="p-1 text-emerald-800 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-emerald-200/60 bg-white/70 space-y-3.5 text-xs">
          
          {/* Bares Insignia & Pintxos Estrella */}
          {data.bars && data.bars.length > 0 && (
            <div>
              <h5 className="font-black text-emerald-950 flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider">
                <Store className="w-3.5 h-3.5 text-emerald-700" /> Bares Insignia & Qué Pedir
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.bars.map((bar, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-emerald-200/70 shadow-2xs">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-slate-900 text-xs">{bar.name}</span>
                      {bar.address && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          {bar.address}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-1">
                      ⭐ <strong className="text-slate-800">Especialidad:</strong> {bar.specialty}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gastronomía General */}
          <div>
            <h5 className="font-black text-emerald-950 flex items-center gap-1.5 mb-1.5 text-[11px] uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-700" /> Gastronomía Típica
            </h5>
            <ul className="space-y-1 pl-4 list-disc text-slate-700 leading-relaxed font-medium">
              {data.gastronomy.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Tradiciones & Secretos */}
          <div>
            <h5 className="font-black text-emerald-950 flex items-center gap-1.5 mb-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Tradiciones & Secretos
            </h5>
            <ul className="space-y-1 pl-4 list-disc text-slate-700 leading-relaxed font-medium">
              {data.traditions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Rincones imperdibles */}
          <div>
            <h5 className="font-black text-emerald-950 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-red-600" /> Rincones Clave
            </h5>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {data.hotspots.map((spot, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-100/80 text-emerald-900 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border border-emerald-200"
                >
                  📍 {spot}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
