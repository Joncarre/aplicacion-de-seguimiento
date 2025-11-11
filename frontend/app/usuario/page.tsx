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

export default function UsuarioPage() {
  const [lines, setLines] = useState<BusLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        setLines(data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <BackButton href="/" />
          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            🚌 Seguimiento de Autobuses - Aranjuez
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona una línea para ver su recorrido y ubicación en tiempo real
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
                  className={`p-4 rounded-lg font-bold text-white transition-all ${
                    selectedLineId === line.id
                      ? 'ring-4 ring-offset-2 ring-slate-400 scale-105'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: line.color }}
                >
                  {line.name}
                </button>
              ))
            ) : (
              <p className="col-span-5 text-center text-slate-600">Cargando líneas...</p>
            )}
          </div>
        </Card>

        {selectedLine && (
          <>
            {/* Información de la línea seleccionada */}
            <div className="mb-4 p-4 rounded-lg text-white font-semibold"
                 style={{ backgroundColor: selectedLine.color }}>
              <h2 className="text-xl">
                Línea {selectedLine.name} - {selectedLine.description}
              </h2>
              <p className="text-sm opacity-90 mt-1">
                {stops.length} paradas • 
                {busLocation 
                  ? ' Bus en circulación 🟢' 
                  : ' Sin buses activos 🔴'}
              </p>
            </div>

            {/* Mapa */}
            <Card className="p-0 overflow-hidden mb-4" style={{ height: '500px' }}>
              {isLoading ? (
                <p className="text-center py-12">Cargando mapa...</p>
              ) : (
                <MapView
                  stops={stops}
                  busLocation={busLocation}
                  lineColor={selectedLine.color}
                />
              )}
            </Card>

            {/* Lista de paradas */}
            <Card className="p-6">
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
                    <div
                      key={stop.id}
                      className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3"
                        style={{ backgroundColor: selectedLine.color }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{stop.name}</h4>
                        <p className="text-sm text-slate-600">{stop.street}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
