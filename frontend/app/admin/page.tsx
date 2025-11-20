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
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

  // Estado para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<string | null>(null);

  // Formulario de nueva parada
  const [newStop, setNewStop] = useState({
    name: '',
    street: '',
    latitude: '',
    longitude: '',
    order: '',
  });

  // Formulario de edición de parada
  const [editStop, setEditStop] = useState({
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
    
    console.log('Intentando login con usuario:', username);

    // Probar autenticación cargando líneas
    try {
      const response = await fetch('http://localhost:3001/api/lines', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        console.log('✅ Login exitoso, guardando credenciales');
        localStorage.setItem('adminAuth', credentials);
        localStorage.setItem('adminUsername', username);
        setIsAuthenticated(true);
        loadLines();
      } else {
        console.error('❌ Login fallido:', response.status);
        setError('Credenciales incorrectas');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUsername');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError('Error al conectar con el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setLines([]);
    setStops([]);
    setSelectedLine('');
  };

  // Cargar líneas
  const loadLines = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/lines');
      if (response.ok) {
        const data = await response.json();
        // La API puede devolver { lines: [...] } o directamente [...]
        setLines(Array.isArray(data) ? data : (data.lines || []));
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
    
    console.log('🔍 Cargando paradas para línea:', lineId);
    console.log('🔑 Credenciales en localStorage:', credentials ? 'Sí' : 'No');

    if (!credentials) {
      console.error('❌ No hay credenciales guardadas');
      setError('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      console.log('📡 Haciendo petición a:', `http://localhost:3001/api/admin/stops?lineId=${lineId}`);
      
      const response = await fetch(`http://localhost:3001/api/admin/stops?lineId=${lineId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      console.log('📥 Respuesta del servidor:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        // Verificar si data es un array
        if (!Array.isArray(data)) {
          console.error('❌ Los datos no son un array:', data);
          setError('Formato de datos incorrecto');
          setStops([]);
          return;
        }
        
        // Transformar datos
        const transformedStops = data.map((item: any) => ({
          id: item.stop?.id || item.id,
          name: item.stop?.name || item.name,
          street: item.stop?.street || item.street,
          latitude: item.stop?.latitude || item.latitude,
          longitude: item.stop?.longitude || item.longitude,
          order: item.order,
          lineId: item.lineId,
          lineName: item.line?.name || '',
        }));
        console.log('✅ Paradas transformadas:', transformedStops.length);
        setStops(transformedStops);
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', response.status, errorText);
        
        // Si es 403, las credenciales son inválidas
        if (response.status === 403) {
          setError('Sesión expirada. Por favor, vuelve a iniciar sesión.');
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminUsername');
          setIsAuthenticated(false);
        } else {
          setError(`Error al cargar paradas: ${response.status}`);
        }
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
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

  // Solicitar confirmación de eliminación
  const handleDeleteClick = (stopId: string) => {
    setStopToDelete(stopId);
    setShowDeleteConfirm(true);
  };

  // Confirmar eliminación
  const confirmDeleteStop = async () => {
    if (!stopToDelete) return;

    const credentials = localStorage.getItem('adminAuth');

    try {
      const response = await fetch(`http://localhost:3001/api/admin/stops/${stopToDelete}`, {
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
    } finally {
      setShowDeleteConfirm(false);
      setStopToDelete(null);
    }
  };

  // Iniciar edición de parada
  const handleStartEdit = (stop: StopOnLine) => {
    setEditingStopId(stop.id);
    setEditStop({
      name: stop.name,
      street: stop.street,
      latitude: stop.latitude.toString(),
      longitude: stop.longitude.toString(),
      order: stop.order.toString(),
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingStopId(null);
    setEditStop({ name: '', street: '', latitude: '', longitude: '', order: '' });
  };

  // Guardar cambios de edición
  const handleSaveEdit = async (stopId: string) => {
    const credentials = localStorage.getItem('adminAuth');
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/admin/stops/${stopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({
          name: editStop.name,
          street: editStop.street,
          latitude: parseFloat(editStop.latitude),
          longitude: parseFloat(editStop.longitude),
          order: parseInt(editStop.order),
        }),
      });

      if (response.ok) {
        setEditingStopId(null);
        setEditStop({ name: '', street: '', latitude: '', longitude: '', order: '' });
        loadStopsForLine(selectedLine);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al actualizar parada');
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
    // FORZAR LIMPIEZA: Eliminar credenciales antiguas al cargar la página
    // Esto obliga al usuario a volver a autenticarse con la nueva contraseña
    console.log('🧹 Limpiando credenciales antiguas...');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
    
    // Comentar el código anterior que intentaba reutilizar credenciales
    /*
    const credentials = localStorage.getItem('adminAuth');
    if (credentials) {
      // Verificar que las credenciales aún son válidas
      fetch('http://localhost:3001/api/lines', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      })
        .then(response => {
          if (response.ok) {
            setIsAuthenticated(true);
            loadLines();
          } else {
            // Credenciales inválidas, limpiar
            localStorage.removeItem('adminAuth');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('adminAuth');
          setIsAuthenticated(false);
        });
    }
    */
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-dark-bg-card border border-dark-border">
          <h1 className="text-3xl font-bold text-center mb-6 text-dark-text-primary">
            Panel de Administración
          </h1>
          
          {error && (
            <div className="bg-neon-pink bg-opacity-10 border border-neon-pink text-neon-pink p-3 rounded-lg mb-4 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-transparent text-dark-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-transparent text-dark-text-primary"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-neon-blue hover:bg-opacity-80 text-white">
              Acceder
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dark-text-primary">
            Gestión de Paradas
          </h1>
          <Button onClick={handleLogout} variant="outline" className="border-dark-border text-dark-text-primary hover:bg-dark-bg-tertiary">
            Cerrar Sesión
          </Button>
        </div>

        {error && (
          <div className="bg-neon-pink bg-opacity-10 border border-neon-pink text-neon-pink p-3 rounded-lg mb-4 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Selector de línea */}
        <Card className="p-6 mb-6 bg-dark-bg-card border border-dark-border">
          <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">
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
            <Card className="p-6 mb-6 bg-dark-bg-card border border-dark-border">
              <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">
                Añadir nueva parada
              </h2>
              <form onSubmit={handleCreateStop} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Nombre de la parada
                    </label>
                    <input
                      type="text"
                      value={newStop.name}
                      onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg text-dark-text-primary focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      required
                      placeholder="Ej: Plaza de Toros"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Calle
                    </label>
                    <input
                      type="text"
                      value={newStop.street}
                      onChange={(e) => setNewStop({ ...newStop, street: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg text-dark-text-primary focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      required
                      placeholder="Ej: Calle de la Reina"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={newStop.latitude}
                      onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg text-dark-text-primary focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      required
                      placeholder="Ej: 40.0333"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={newStop.longitude}
                      onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg text-dark-text-primary focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      required
                      placeholder="Ej: -3.6000"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      Orden (opcional)
                    </label>
                    <input
                      type="number"
                      value={newStop.order}
                      onChange={(e) => setNewStop({ ...newStop, order: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-bg-tertiary border border-dark-border rounded-lg text-dark-text-primary focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="Ej: 1, 2, 3... (auto si se deja vacío)"
                    />
                  </div>
                  <Button type="submit" className="px-8 bg-neon-green hover:bg-opacity-80 text-dark-bg-primary">
                    Añadir Parada
                  </Button>
                </div>
              </form>
            </Card>

            {/* Lista de paradas */}
            <Card className="p-6 bg-dark-bg-card border border-dark-border">
              <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">
                Paradas de la línea
              </h2>

              {isLoading ? (
                <p className="text-dark-text-secondary text-center py-8">Cargando paradas...</p>
              ) : stops.length === 0 ? (
                <p className="text-dark-text-secondary text-center py-8">
                  No hay paradas en esta línea. Añade la primera parada arriba.
                </p>
              ) : (
                <div className="space-y-3">
                  {stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="p-4 bg-dark-bg-tertiary bg-opacity-30 rounded-lg border border-dark-border transition-colors"
                    >
                      {editingStopId === stop.id ? (
                        // Modo edición
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-dark-text-secondary mb-1">
                                Nombre
                              </label>
                              <input
                                type="text"
                                value={editStop.name}
                                onChange={(e) => setEditStop({ ...editStop, name: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-bg-secondary border border-dark-border rounded text-sm text-dark-text-primary focus:ring-2 focus:ring-neon-blue"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-dark-text-secondary mb-1">
                                Calle
                              </label>
                              <input
                                type="text"
                                value={editStop.street}
                                onChange={(e) => setEditStop({ ...editStop, street: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-bg-secondary border border-dark-border rounded text-sm text-dark-text-primary focus:ring-2 focus:ring-neon-blue"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-dark-text-secondary mb-1">
                                Latitud
                              </label>
                              <input
                                type="number"
                                step="0.0000001"
                                value={editStop.latitude}
                                onChange={(e) => setEditStop({ ...editStop, latitude: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-bg-secondary border border-dark-border rounded text-sm text-dark-text-primary focus:ring-2 focus:ring-neon-blue"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-dark-text-secondary mb-1">
                                Longitud
                              </label>
                              <input
                                type="number"
                                step="0.0000001"
                                value={editStop.longitude}
                                onChange={(e) => setEditStop({ ...editStop, longitude: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-bg-secondary border border-dark-border rounded text-sm text-dark-text-primary focus:ring-2 focus:ring-neon-blue"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                              className="text-sm px-4 border-dark-border text-dark-text-secondary hover:bg-dark-bg-secondary"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => handleSaveEdit(stop.id)}
                              className="text-sm px-4 bg-neon-green hover:bg-opacity-80 text-dark-bg-primary"
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm" style={{ color: 'rgb(57 227 184)' }}>
                                #{stop.order}
                              </span>
                              <div>
                                <h3 className="font-semibold text-dark-text-primary">{stop.name}</h3>
                                <p className="text-sm text-dark-text-secondary">{stop.street}</p>
                                <p className="text-xs text-dark-text-muted mt-1">
                                  {stop.latitude}, {stop.longitude}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleStartEdit(stop)}
                              variant="outline"
                              className="text-neon-blue hover:bg-neon-blue hover:bg-opacity-10 border-neon-blue border-opacity-30"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(stop.id)}
                              variant="outline"
                              className="text-neon-pink hover:bg-neon-pink hover:bg-opacity-10 border-neon-pink border-opacity-30"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-dark-bg-card border border-dark-border shadow-xl">
            <h3 className="text-xl font-bold text-dark-text-primary mb-4">¿Eliminar parada?</h3>
            <p className="text-dark-text-secondary mb-6">
              ¿Estás seguro de que quieres eliminar esta parada? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="border-dark-border text-dark-text-secondary hover:bg-dark-bg-secondary"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDeleteStop}
                className="bg-neon-pink hover:bg-opacity-80 text-white"
              >
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
