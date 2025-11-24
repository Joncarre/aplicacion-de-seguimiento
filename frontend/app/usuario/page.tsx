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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      const response = await fetch(`${API_URL}/api/lines`);
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
      const response = await fetch(`${API_URL}/api/lines/${lineId}/stops`);
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
      const response = await fetch(`${API_URL}/api/bus-location/${lineId}/latest`);
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
      const response = await fetch(`${API_URL}/api/eta/${selectedLineId}/${stop.id}`);

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
    <div className="min-h-screen bg-transparent relative z-10">
      {/* Header con estilo oscuro */}
      <div className="bg-transparent" style={{ border: 'none !important' }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton href="/" />
          <h1 className="text-xl font-light tracking-wide text-neon-white mt-4" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
            Seguimiento de autobuses
          </h1>
          <p className="text-sm text-dark-text-muted mt-1">
            Selecciona una línea para recorrido y ubicación en tiempo real
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="bg-neon-pink bg-opacity-10 border border-neon-pink text-neon-pink p-3 rounded-lg mb-4 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Selector de líneas con estilo oscuro */}
        <div className="card-dark-no-border px-6 mb-4 rounded-2xl" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-light tracking-wide text-dark-text-primary mb-4" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>

          </h2>
          <div className="grid grid-cols-5 gap-2" style={{ backgroundColor: 'transparent' }}>
            {lines && lines.length > 0 ? (
              lines.map((line) => (
                <button
                  key={line.id}
                  onClick={() => setSelectedLineId(line.id)}
                  className={`pushable-line ${selectedLineId === line.id ? 'selected' : ''
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
              <p className="col-span-5 text-center text-dark-text-muted">Cargando líneas...</p>
            )}
          </div>
        </div>

        {selectedLine && (
          <>
            {/* Mapa con borde neón */}
            <div className="card-dark p-0 overflow-hidden mb-4 rounded-2xl" style={{ height: '350px' }}>
              {isLoading ? (
                <p className="text-center py-12 text-dark-text-muted">Cargando mapa...</p>
              ) : (
                <MapView
                  stops={stops}
                  busLocation={busLocation}
                  lineColor={selectedLine.color}
                  onStopClick={handleStopClick}
                />
              )}
            </div>

            {/* Lista de paradas O Panel de ETAs con estilo oscuro */}
            <div className="card-dark-no-border p-6 rounded-2xl" style={{ backgroundColor: 'transparent' }}>
              {!selectedStop ? (
                <>
                  {stops.length === 0 ? (
                    <p className="text-dark-text-muted text-center py-8">
                      No hay paradas configuradas para esta línea
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {stops.map((stop, index) => (
                        <div
                          key={stop.id}
                          onClick={() => handleStopClick(stop)}
                          className="w-full flex items-center p-3 bg-dark-bg-tertiary bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-all cursor-pointer border border-gray-600 group"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 border-2 transition-all"
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: selectedLine.color,
                              color: selectedLine.color
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-dark-text-primary transition-colors">{stop.name}</h4>
                            <p className="text-sm text-dark-text-muted">{stop.street}</p>
                          </div>
                          <svg
                            className="w-5 h-5 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: selectedLine.color }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
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
                      className="font-medium rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-50 text-neon-green px-4 py-2 text-sm flex items-center gap-2"
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
                    <h3 className="text-lg font-semibold text-dark-text-primary mt-4">
                      Tiempos de llegada en:
                    </h3>
                    <div className="mt-2 flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 border-2"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: selectedLine.color,
                          color: selectedLine.color,
                          boxShadow: `0 0 10px ${selectedLine.color}40`
                        }}
                      >
                        {stops.findIndex((s) => s.id === selectedStop.id) + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-text-primary">{selectedStop.name}</h4>
                        <p className="text-sm text-dark-text-muted">{selectedStop.street}</p>
                      </div>
                    </div>
                  </div>

                  {/* Estado de carga con mensaje de espera de 20 segundos */}
                  {isLoadingETAs ? (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="dots-loader mb-4">
                          <div className="dot" style={{ backgroundColor: selectedLine.color }}></div>
                          <div className="dot" style={{ backgroundColor: selectedLine.color }}></div>
                          <div className="dot" style={{ backgroundColor: selectedLine.color }}></div>
                        </div>
                        <p className="text-dark-text-primary font-semibold mb-2">Calculando tiempos de llegada...</p>
                        <p className="text-sm text-dark-text-muted text-center max-w-md">
                          Esperando datos de posición del autobús (~20 segundos) Necesitamos determinar la dirección
                        </p>
                      </div>
                    </div>
                  ) : etas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-dark-text-secondary">Lo sentimos, no hay autobuses acercándose a esta parada en este momento</p>
                      <p className="text-sm text-dark-text-muted mt-2">Los autobuses deben estar activos y transmitiendo su ubicación</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {etas.map((eta, index) => (
                        <div
                          key={eta.busId}
                          className="flex items-center justify-between p-4 bg-dark-bg-tertiary bg-opacity-30 rounded-lg border border-dark-border transition-all group"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                              style={{
                                backgroundColor: selectedLine.color,
                                boxShadow: `0 0 15px ${selectedLine.color}60`
                              }}
                            >
                              <svg
                                className="w-6 h-6 text-dark-bg-primary"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4M7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17m9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m1.5-7H6V6h12v4z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-dark-text-primary">{eta.busId}</p>
                              <p className="text-xs text-dark-text-muted">Línea {selectedLine.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold" style={{
                              color: selectedLine.color,
                              textShadow: `0 0 10px ${selectedLine.color}40`
                            }}>
                              {Math.round(eta.estimatedMinutes)}
                            </p>
                            <p className="text-xs text-dark-text-muted">minutos</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-neon-blue bg-opacity-10 rounded-lg border border-neon-blue border-opacity-30 backdrop-blur-sm">
                    <p className="text-xs text-neon-blue text-center">
                      Tiempos calculados en base a la localización real del autobús
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        /* Dots loader */
        .dots-loader {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
        }

        .dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          animation: pulse-dot 1.4s ease-in-out infinite;
          box-shadow: 0 0 15px currentColor;
        }

        .dot:nth-child(1) {
          animation-delay: 0s;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes pulse-dot {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        /* Pushable button styles para líneas con efecto neón */
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

        /* Edge layer con sombra oscura */
        .edge-line {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          border-radius: 8px;
          background: var(--line-color-darker);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }

        /* Front layer con efecto neón */
        .front-line {
          display: block;
          position: relative;
          border-radius: 8px;
          padding: 16px 16px;
          color: #ffffff;
          font-weight: 700;
          text-transform: none;
          font-size: 0.9rem;
          transform: translateY(-4px);
          transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1), box-shadow 300ms;
          background: var(--line-color);
          box-shadow: 0 0 15px var(--line-color), 0 0 30px var(--line-color)50;
        }

        .pushable-line:hover .front-line {
          transform: translateY(-6px);
          transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
          box-shadow: 0 0 20px var(--line-color), 0 0 40px var(--line-color)60, 0 0 60px var(--line-color)30;
        }

        .pushable-line:active .front-line {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable-line.selected .front-line {
          transform: translateY(-6px);
          box-shadow: 0 0 25px var(--line-color), 0 0 50px var(--line-color)70, inset 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .pushable-line.selected:active .front-line {
          transform: translateY(-4px);
        }

        /* Leaflet popup styles para modo oscuro */
        .leaflet-popup-content-wrapper {
          background-color: #0f1420 !important;
          color: #e2e8f0 !important;
          border: 1px solid #1e293b !important;
          box-shadow: 0 0 20px rgba(6, 214, 160, 0.2) !important;
        }

        .leaflet-popup-tip {
          background-color: #0f1420 !important;
          border: 1px solid #1e293b !important;
        }
      `}</style>
    </div>
  );
}
