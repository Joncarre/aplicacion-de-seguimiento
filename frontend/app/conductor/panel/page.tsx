'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGeolocationTracking } from '@/hooks/useGeolocation';
import { api } from '@/lib/api';

type BusLine = {
  id: string;
  name: string;
  color: string;
};

export default function PanelConductor() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busLines, setBusLines] = useState<BusLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hook de geolocalización con tracking automático
  const { location, error: locationError, requestPermission } = useGeolocationTracking(isTransmitting, 10000);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('authToken');
    const storedSessionId = localStorage.getItem('sessionId');
    
    if (!token || !storedSessionId) {
      router.push('/conductor');
      return;
    }
    
    setIsAuthenticated(true);
    setSessionId(storedSessionId);

    // Cargar líneas de autobús desde la API
    loadBusLines();
  }, [router]);

  const loadBusLines = async () => {
    try {
      const response = await api.getBusLines();
      setBusLines(response.lines);
    } catch (error) {
      console.error('Error al cargar líneas:', error);
      setApiError('Error al cargar las líneas de autobús');
    }
  };

  // Enviar ubicación al backend cada vez que cambie
  useEffect(() => {
    if (!location || !isTransmitting || !sessionId || !selectedLine) {
      return;
    }

    const sendLocation = async () => {
      try {
        await api.submitLocation({
          sessionId,
          lineId: selectedLine,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
        });
        
        console.log('Ubicación enviada:', location);
        setApiError(null);
      } catch (error) {
        console.error('Error al enviar ubicación:', error);
        setApiError('Error al enviar ubicación al servidor');
      }
    };

    sendLocation();
  }, [location, isTransmitting, sessionId, selectedLine]);

  const handleLineSelection = (lineId: string) => {
    setSelectedLine(lineId);
  };

  const handleStartJourney = async () => {
    if (!selectedLine || !sessionId) {
      alert('Por favor, selecciona una línea antes de comenzar');
      return;
    }

    try {
      // Asignar línea a la sesión
      await api.assignLineToSession(sessionId, selectedLine);
      
      // Solicitar permisos de geolocalización
      const permissionGranted = await requestPermission();
      
      if (permissionGranted) {
        setIsTransmitting(true);
        setApiError(null);
      }
    } catch (error) {
      console.error('Error al iniciar trayecto:', error);
      setApiError('Error al iniciar el trayecto');
    }
  };

  const handlePauseJourney = () => {
    setIsTransmitting(false);
  };

  const handleEndJourneyClick = () => {
    setShowEndConfirm(true);
  };

  const handleEndJourneyConfirm = async () => {
    if (!sessionId) return;

    try {
      // Finalizar sesión en el backend
      await api.endDriverSession(sessionId);
      
      // Limpiar estado local
      setIsTransmitting(false);
      setSelectedLine(null);
      setApiError(null);
      
      // Limpiar localStorage y redirigir al login
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionId');
      
      router.push('/conductor');
    } catch (error) {
      console.error('Error al finalizar trayecto:', error);
      setApiError('Error al finalizar el trayecto');
      setShowEndConfirm(false);
    }
  };

  const handleEndJourneyCancel = () => {
    setShowEndConfirm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
        <p className="text-muted-foreground">Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4 pb-safe">
      <div className="max-w-md mx-auto space-y-4">
        {/* Selección de línea */}
        {!isTransmitting && (
          <Card>
            <CardHeader className="mb-2.5">
              <CardTitle className="text-base font-normal">Selecciona tu línea</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {busLines.map((line) => (
                  <button
                    key={line.id}
                    onClick={() => handleLineSelection(line.id)}
                    className={`p-4 rounded-lg border-[2px] transition-all ${
                      selectedLine === line.id
                        ? 'scale-100'
                        : ''
                    }`}
                    style={{
                      backgroundColor: selectedLine === line.id ? `${line.color}20` : 'white',
                      borderColor: selectedLine === line.id ? line.color : '#e5e7eb',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLine !== line.id) {
                        e.currentTarget.style.borderColor = line.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLine !== line.id) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Bus 
                        className="w-6 h-6" 
                        style={{ color: line.color }}
                      />
                      <span className="font-bold text-lg">{line.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado de transmisión */}
        {isTransmitting && selectedLine && (
          <div className="backdrop-blur-sm rounded-3xl shadow-lg p-6 border transition-all duration-100 animated-border-card">
            <div className="flex flex-col items-center gap-3">
              <MapPin className="w-12 h-12 animate-pulse" 
                style={{ color: busLines.find(l => l.id === selectedLine)?.color }} 
              />
              <div className="text-center">
                <p className="font-bold text-green-900">
                  Transmitiendo posición...
                </p>
                <p className="text-sm font-semibold"
                  style={{ color: busLines.find(l => l.id === selectedLine)?.color }}>
                  Línea {busLines.find(l => l.id === selectedLine)?.name} activa
                </p>
                <p className="text-xs text-green-600 mt-1">
                  GPS actualizado cada 10 segundos
                </p>
                {location && (
                  <div className="mt-2 text-xs text-green-600">
                    <p>Latitud: {location.latitude.toFixed(6)}</p>
                    <p>Longitud: {location.longitude.toFixed(6)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error de ubicación */}
        {locationError && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error de ubicación</p>
                  <p className="text-sm text-red-700">{locationError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error de API */}
        {apiError && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        {!isTransmitting ? (
          <div className="flex justify-center">
            <button
              onClick={handleStartJourney}
              disabled={!selectedLine}
              className="pushable"
              style={{ 
                width: '75%',
                cursor: selectedLine ? 'pointer' : 'not-allowed',
                opacity: selectedLine ? 1 : 0.7
              }}
            >
              <span className="shadow-start"></span>
              <span className="edge-start"></span>
              <span className="front-start">
                Comenzar trayecto
              </span>
            </button>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePauseJourney}
              className="pushable"
              style={{ width: '45%' }}
            >
              <span className="shadow-pause"></span>
              <span className="edge-pause"></span>
              <span className="front-pause">
                Pausar trayecto
              </span>
            </button>
            <button
              onClick={handleEndJourneyClick}
              className="pushable"
              style={{ width: '40%' }}
            >
              <span className="shadow-end"></span>
              <span className="edge-end"></span>
              <span className="front-end">
                Finalizar trayecto
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 transition-all duration-300 p-10 max-w-sm w-full transform hover:scale-[1.00]">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¿Finalizar trayecto?
              </h3>
              <p className="text-sm text-gray-600">
                Esta acción cerrará tu sesión actual
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleEndJourneyCancel}
                className="flex-1 h-12 text-base font-medium transition-all hover:scale-100"
                style={{ backgroundColor: '#9ca3af', color: 'white', borderColor: '#5f5f5fff', borderWidth: '1px', borderRadius: '6px' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEndJourneyConfirm}
                className="flex-1 h-12 text-base font-medium transition-all hover:scale-100"
                style={{ backgroundColor: '#f35d52ff', color: 'white', borderColor: '#c42424ff', borderWidth: '1px', borderRadius: '6px' }}
              >
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .animated-border-card {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(var(--angle), #070707, #17c3b2) border-box;
          animation: 4s rotate linear infinite;
        }

        @keyframes rotate {
          to {
            --angle: 360deg;
          }
        }

        /* Pushable button styles */
        .pushable {
          position: relative;
          background: transparent;
          padding: 0px;
          border: none;
          cursor: pointer;
          outline-offset: 4px;
          transition: filter 250ms;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          height: 56px;
        }

        .pushable:focus:not(:focus-visible) {
          outline: none;
        }

   

        /* Edge layer */
        .edge-pause, .edge-end, .edge-start {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          border-radius: 8px;
        }

        .edge-pause {
          background: linear-gradient(
            to right,
            hsl(44, 85%, 55%) 0%,
            hsl(44, 85%, 65%) 8%,
            hsl(44, 85%, 55%) 92%,
            hsl(44, 85%, 45%) 100%
          );
        }

        .edge-end {
          background: linear-gradient(
            to right,
            hsl(15, 85%, 55%) 0%,
            hsl(15, 85%, 65%) 8%,
            hsl(15, 85%, 55%) 92%,
            hsl(15, 85%, 45%) 100%
          );
        }

        .edge-start {
          background: linear-gradient(
            to right,
            hsl(30, 10%, 55%) 0%,
            hsl(30, 10%, 65%) 8%,
            hsl(30, 10%, 55%) 92%,
            hsl(30, 10%, 45%) 100%
          );
        }

        /* Front layer */
        .front-pause, .front-end, .front-start {
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
        }

        .front-pause {
          background: #f7d08a;
        }

        .front-end {
          background: #f79f79;
        }

        .front-start {
          background: #a8a8a8ff;
        }

        .pushable:disabled .front-start {
          background: #dfd7d3ff;
        }

        .pushable:active .front-pause,
        .pushable:active .front-end,
        .pushable:active .front-start {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable:disabled:hover .front-start {
          transform: translateY(-4px);
        }

        .pushable:disabled:active .front-start {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}
