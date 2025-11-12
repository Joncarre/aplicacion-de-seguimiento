'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
}

interface StopOnLine extends Stop {
  order: number;
  lineId: string;
  lineName: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lines, setLines] = useState<BusLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [stops, setStops] = useState<StopOnLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Formulario de nueva parada
  const [newStop, setNewStop] = useState({
    name: '',
    street: '',
    latitude: '',
    longitude: '',
    order: '',
  });

  // Autenticación básica
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Guardar credenciales para usar en las peticiones
    const credentials = btoa(`${username}:${password}`);
    localStorage.setItem('adminAuth', credentials);

    // Probar autenticación cargando líneas
    try {
      const response = await fetch('http://localhost:3001/api/lines', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        loadLines();
      } else {
        setError('Credenciales incorrectas');
        localStorage.removeItem('adminAuth');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

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
    }
  };

  // Cargar paradas de una línea
  const loadStopsForLine = async (lineId: string) => {
    setIsLoading(true);
    setError('');

    const credentials = localStorage.getItem('adminAuth');

    try {
      const response = await fetch(`http://localhost:3001/api/admin/stops?lineId=${lineId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transformar datos
        const transformedStops = data.map((item: any) => ({
          ...item.stop,
          order: item.order,
          lineId: item.lineId,
          lineName: item.line.name,
        }));
        setStops(transformedStops);
      } else {
        setError('Error al cargar paradas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nueva parada
  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedLine) {
      setError('Selecciona una línea primero');
      return;
    }

    const credentials = localStorage.getItem('adminAuth');

    try {
      const response = await fetch('http://localhost:3001/api/admin/stops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({
          name: newStop.name,
          street: newStop.street,
          latitude: parseFloat(newStop.latitude),
          longitude: parseFloat(newStop.longitude),
          lineId: selectedLine,
          order: newStop.order ? parseInt(newStop.order) : undefined,
        }),
      });

      if (response.ok) {
        // Resetear formulario
        setNewStop({ name: '', street: '', latitude: '', longitude: '', order: '' });
        // Recargar paradas
        loadStopsForLine(selectedLine);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear parada');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  // Eliminar parada
  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta parada?')) return;

    const credentials = localStorage.getItem('adminAuth');

    try {
      const response = await fetch(`http://localhost:3001/api/admin/stops/${stopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        loadStopsForLine(selectedLine);
      } else {
        setError('Error al eliminar parada');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  // Effect para cargar paradas cuando cambia la línea seleccionada
  useEffect(() => {
    if (selectedLine && isAuthenticated) {
      loadStopsForLine(selectedLine);
    }
  }, [selectedLine, isAuthenticated]);

  // Verificar autenticación al montar
  useEffect(() => {
    const credentials = localStorage.getItem('adminAuth');
    if (credentials) {
      setIsAuthenticated(true);
      loadLines();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-slate-800">
            Panel de Administración
          </h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Acceder
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Gestión de Paradas
          </h1>
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Selector de línea */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Selecciona una línea
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {lines.map((line) => (
              <button
                key={line.id}
                onClick={() => setSelectedLine(line.id)}
                className={`p-4 rounded-lg font-semibold text-white transition-all ${
                  selectedLine === line.id
                    ? 'ring-4 ring-offset-2 ring-slate-400 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: line.color }}
              >
                {line.name}
              </button>
            ))}
          </div>
        </Card>

        {selectedLine && (
          <>
            {/* Formulario de nueva parada */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Añadir nueva parada
              </h2>
              <form onSubmit={handleCreateStop} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre de la parada
                    </label>
                    <input
                      type="text"
                      value={newStop.name}
                      onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      required
                      placeholder="Ej: Plaza de Toros"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Calle
                    </label>
                    <input
                      type="text"
                      value={newStop.street}
                      onChange={(e) => setNewStop({ ...newStop, street: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      required
                      placeholder="Ej: Calle de la Reina"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={newStop.latitude}
                      onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      required
                      placeholder="Ej: 40.0333"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={newStop.longitude}
                      onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      required
                      placeholder="Ej: -3.6000"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Orden (opcional)
                    </label>
                    <input
                      type="number"
                      value={newStop.order}
                      onChange={(e) => setNewStop({ ...newStop, order: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      placeholder="Ej: 1, 2, 3... (auto si se deja vacío)"
                    />
                  </div>
                  <Button type="submit" className="px-8">
                    Añadir Parada
                  </Button>
                </div>
              </form>
            </Card>

            {/* Lista de paradas */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Paradas de la línea
              </h2>

              {isLoading ? (
                <p className="text-slate-600 text-center py-8">Cargando paradas...</p>
              ) : stops.length === 0 ? (
                <p className="text-slate-600 text-center py-8">
                  No hay paradas en esta línea. Añade la primera parada arriba.
                </p>
              ) : (
                <div className="space-y-3">
                  {stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-500 text-sm">
                            #{stop.order}
                          </span>
                          <div>
                            <h3 className="font-semibold text-slate-800">{stop.name}</h3>
                            <p className="text-sm text-slate-600">{stop.street}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {stop.latitude}, {stop.longitude}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteStop(stop.id)}
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
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
