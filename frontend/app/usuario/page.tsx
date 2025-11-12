'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import BackButton from '@/components/ui/BackButton';

// Importar el mapa de forma dinámica (para evitar SSR issues con Leaflet)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <p className="text-center py-12">Cargando mapa...</p>,
});

interface BusLine {
  id: string;
  name: string;
  color: string;
  description: string | null;
}

interface Stop {
  id: string;
  name: string;
  street: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface BusLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface BusETA {
  busId: string;
  estimatedMinutes: number;
  latitude: number;
  longitude: number;
}

export default function UsuarioPage() {
  const [lines, setLines] = useState<BusLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [etas, setEtas] = useState<BusETA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingETAs, setIsLoadingETAs] = useState(false);
  const [error, setError] = useState('');

  // Función para ajustar el brillo de un color hexadecimal
  const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Cargar líneas al montar el componente
  useEffect(() => {
    loadLines();
  }, []);

  // Cargar líneas
  const loadLines = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/lines');
      if (response.ok) {
        const data = await response.json();
        setLines(data.lines || data);
      }
    } catch (err) {
      console.error('Error al cargar líneas:', err);
      setError('Error al cargar líneas');
    }
  };

  // Cargar paradas cuando se selecciona una línea
  useEffect(() => {
    if (selectedLineId) {
      const line = lines.find((l) => l.id === selectedLineId);
      setSelectedLine(line || null);
      loadStopsForLine(selectedLineId);
      loadBusLocation(selectedLineId);

      // Actualizar ubicación del bus cada 10 segundos
      const interval = setInterval(() => {
        loadBusLocation(selectedLineId);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedLineId, lines]);

  // Cargar paradas de una línea
  const loadStopsForLine = async (lineId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/lines/${lineId}/stops`);
      if (response.ok) {
        const data = await response.json();
        setStops(data);
      } else {
        setError('Error al cargar paradas');
      }
    } catch (err) {
      console.error('Error al cargar paradas:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar ubicación actual del bus
  const loadBusLocation = async (lineId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bus-location/${lineId}/latest`);
      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setBusLocation({
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            timestamp: data.timestamp,
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar ubicación del bus:', err);
    }
  };

  // Cargar ETAs reales desde el backend
  const loadRealETAs = async (stop: Stop): Promise<BusETA[]> => {
    if (!selectedLineId) return [];
    
    try {
      const response = await fetch(`http://localhost:3001/api/eta/${selectedLineId}/${stop.id}`);
      
      if (!response.ok) {
        console.error('Error cargando ETAs');
        return [];
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        return [];
      }

      // Transformar los datos del backend al formato del frontend
      return data.data.map((eta: any, index: number) => ({
        busId: `Autobús ${index + 1}`,
        estimatedMinutes: eta.estimatedMinutes,
        latitude: stop.latitude,
        longitude: stop.longitude,
      }));

    } catch (err) {
      console.error('Error al cargar ETAs:', err);
      return [];
    }
  };

  // Manejar selección de parada
  const handleStopClick = async (stop: Stop) => {
    setSelectedStop(stop);
    setIsLoadingETAs(true);
    setEtas([]); // Limpiar ETAs previos
    
    // Esperar 20 segundos antes de mostrar ETAs (necesitamos 2 posiciones del bus)
    // Las posiciones se envían cada 10 segundos, por lo que 20 segundos garantizan 2 posiciones
    setTimeout(async () => {
      const realETAs = await loadRealETAs(stop);
      setEtas(realETAs);
      setIsLoadingETAs(false);
    }, 20000); // 20 segundos
  };

  // Volver a la lista de paradas
  const handleBackToStops = () => {
    setSelectedStop(null);
    setEtas([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton href="/" />
          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            Seguimiento de autobuses
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona una línea para recorrido y ubicación en tiempo real
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Selector de líneas */}
        <Card className="p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            Selecciona tu línea
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {lines && lines.length > 0 ? (
              lines.map((line) => (
                <button
                  key={line.id}
                  onClick={() => setSelectedLineId(line.id)}
                  className={`pushable-line ${
                    selectedLineId === line.id ? 'selected' : ''
                  }`}
                  style={{
                    '--line-color': line.color,
                    '--line-color-dark': adjustColor(line.color, -20),
                    '--line-color-darker': adjustColor(line.color, -30),
                  } as React.CSSProperties}
                >
                  <span className="shadow-line"></span>
                  <span className="edge-line"></span>
                  <span className="front-line">
                    {line.name}
                  </span>
                </button>
              ))
            ) : (
              <p className="col-span-5 text-center text-slate-600">Cargando líneas...</p>
            )}
          </div>
        </Card>

        {selectedLine && (
          <>
            {/* Mapa */}
            <Card className="p-0 overflow-hidden mb-4" style={{ height: '500px' }}>
              {isLoading ? (
                <p className="text-center py-12">Cargando mapa...</p>
              ) : (
                <MapView
                  stops={stops}
                  busLocation={busLocation}
                  lineColor={selectedLine.color}
                  onStopClick={handleStopClick}
                />
              )}
            </Card>

            {/* Lista de paradas O Panel de ETAs */}
            <Card className="p-6">
              {!selectedStop ? (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">
                    Paradas de la línea
                  </h3>
                  {stops.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">
                      No hay paradas configuradas para esta línea
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {stops.map((stop, index) => (
                        <button
                          key={stop.id}
                          onClick={() => handleStopClick(stop)}
                          className="w-full flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 border-2"
                            style={{ 
                              backgroundColor: 'white',
                              borderColor: selectedLine.color,
                              color: selectedLine.color
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-slate-800">{stop.name}</h4>
                            <p className="text-sm text-slate-600">{stop.street}</p>
                          </div>
                          <svg
                            className="w-5 h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Panel de tiempos de llegada */}
                  <div className="mb-4">
                    <button
                      onClick={handleBackToStops}
                      className="font-medium rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent hover:bg-green-50 text-accent-primary px-4 py-2 text-sm flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Volver a paradas
                    </button>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Tiempos de llegada en:
                    </h3>
                    <div className="mt-2 flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 border-2"
                        style={{ 
                          backgroundColor: 'white',
                          borderColor: selectedLine.color,
                          color: selectedLine.color
                        }}
                      >
                        {stops.findIndex((s) => s.id === selectedStop.id) + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{selectedStop.name}</h4>
                        <p className="text-sm text-slate-600">{selectedStop.street}</p>
                      </div>
                    </div>
                  </div>

                  {/* Estado de carga con mensaje de espera de 20 segundos */}
                  {isLoadingETAs ? (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: selectedLine.color }}></div>
                        <p className="text-slate-700 font-semibold mb-2">Calculando tiempos de llegada...</p>
                        <p className="text-sm text-slate-600 text-center max-w-md">
                          Esperando datos de posición del autobús (~20 segundos) Necesitamos determinar la dirección
                        </p>
                      </div>
                    </div>
                  ) : etas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-600">Lo sentimos, no hay autobuses acercándose a esta parada en este momento</p>
                      <p className="text-sm text-slate-500 mt-2">Los autobuses deben estar activos y transmitiendo su ubicación</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {etas.map((eta, index) => (
                        <div
                          key={eta.busId}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                              style={{ backgroundColor: selectedLine.color }}
                            >
                              <svg
                                className="w-6 h-6 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4M7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17m9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m1.5-7H6V6h12v4z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{eta.busId}</p>
                              <p className="text-xs text-slate-500">Línea {selectedLine.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold" style={{ color: selectedLine.color }}>
                              {Math.round(eta.estimatedMinutes)}
                            </p>
                            <p className="text-xs text-slate-600">minutos</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 text-center">
                      El cálculo mostrado se basa en la posición real del autobús
                    </p>
                  </div>
                </>
              )}
            </Card>
          </>
        )}
      </div>

      <style jsx>{`
        /* Pushable button styles para líneas */
        .pushable-line {
          position: relative;
          background: transparent;
          padding: 0px;
          border: none;
          cursor: pointer;
          outline-offset: 4px;
          transition: filter 250ms;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          height: 56px;
          width: 100%;
        }

        .pushable-line:focus:not(:focus-visible) {
          outline: none;
        }

        /* Edge layer */
        .edge-line {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          border-radius: 8px;
          background: var(--line-color-darker);
        }

        /* Front layer */
        .front-line {
          display: block;
          position: relative;
          border-radius: 8px;
          padding: 16px 16px;
          color: white;
          font-weight: 700;
          text-transform: none;
          font-size: 0.9rem;
          transform: translateY(-4px);
          transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
          background: var(--line-color);
        }

        .pushable-line:hover .front-line {
          transform: translateY(-4px);
          transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
        }

        .pushable-line:active .front-line {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable-line.selected .front-line {
          transform: translateY(-6px);
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
        }

        .pushable-line.selected:active .front-line {
          transform: translateY(-4px);
        }

        /* Leaflet popup styles */
        .leaflet-popup-content-wrapper {
          background-color: white !important;
        }
      `}</style>
    </div>
  );
}
