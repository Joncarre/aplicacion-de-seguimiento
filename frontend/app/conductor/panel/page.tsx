'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, MapPin, Power, Radio, AlertCircle } from 'lucide-react';
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

  const handleEndJourney = async () => {
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
    }
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
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Panel de Conductor</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {isTransmitting && (
                  <Radio className="w-5 h-5 text-green-600 animate-pulse" />
                )}
              </div>
            </div>
            <CardDescription>
              Sesión ID: {sessionId?.slice(0, 8)}...
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Selección de línea */}
        {!isTransmitting && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selecciona tu línea</CardTitle>
              <CardDescription>
                Elige la línea que vas a operar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {busLines.map((line) => (
                  <button
                    key={line.id}
                    onClick={() => handleLineSelection(line.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedLine === line.id
                        ? 'border-green-600 bg-green-50 scale-105'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    style={{
                      backgroundColor: selectedLine === line.id ? `${line.color}20` : undefined,
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
          <Card className="border-green-600 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <MapPin className="w-12 h-12 text-green-600 animate-pulse" />
                <div className="text-center">
                  <p className="font-bold text-green-900">
                    Transmitiendo posición...
                  </p>
                  <p className="text-sm text-green-700">
                    Línea {selectedLine} activa
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    GPS actualizado cada 10 segundos
                  </p>
                  {location && (
                    <div className="mt-2 text-xs text-green-600">
                      <p>Lat: {location.latitude.toFixed(6)}</p>
                      <p>Lng: {location.longitude.toFixed(6)}</p>
                      <p>Precisión: {location.accuracy.toFixed(0)}m</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
        <Card>
          <CardContent className="pt-6 space-y-3">
            {!isTransmitting ? (
              <Button
                onClick={handleStartJourney}
                disabled={!selectedLine}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Comenzar trayecto
              </Button>
            ) : (
              <Button
                onClick={handleEndJourney}
                variant="destructive"
                className="w-full h-14 text-lg"
              >
                <Power className="w-5 h-5 mr-2" />
                Finalizar trayecto
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
