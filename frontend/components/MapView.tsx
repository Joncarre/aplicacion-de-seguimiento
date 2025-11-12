'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Arreglar iconos por defecto de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

interface MapViewProps {
  stops: Stop[];
  busLocation: BusLocation | null;
  lineColor: string;
  onStopClick?: (stop: Stop) => void;
}

export default function MapView({ stops, busLocation, lineColor, onStopClick }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (!navigator.geolocation) {
      const msg = 'Tu navegador no soporta geolocalización';
      console.error(msg);
      setLocationError(msg);
      alert(msg);
      return;
    }

    console.log('🔍 Solicitando permisos de geolocalización...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude] as [number, number];
        console.log('✅ Ubicación obtenida:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setUserLocation(coords);
        setLocationError(null);
        alert(`Ubicación detectada: ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación:', error);
        let errorMessage = 'No se pudo obtener tu ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación DENEGADO. Por favor, permite el acceso a tu ubicación en la configuración del navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener tu ubicación.';
            break;
        }
        
        console.error('💡 Mensaje de error:', errorMessage);
        setLocationError(errorMessage);
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, []);

  // Centro del mapa: Aranjuez
  const defaultCenter: [number, number] = [40.0333, -3.6000];

  // Si hay paradas, centrar en la primera
  const center: [number, number] = stops.length > 0
    ? [parseFloat(stops[0].latitude.toString()), parseFloat(stops[0].longitude.toString())]
    : defaultCenter;

  // Crear array de coordenadas para la línea
  const routeCoordinates: [number, number][] = stops.map((stop) => [
    parseFloat(stop.latitude.toString()),
    parseFloat(stop.longitude.toString()),
  ]);

  // Icono personalizado para el bus
  const busIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${lineColor}">
        <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4M7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17m9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m1.5-7H6V6h12v4z"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

  // Icono personalizado para la ubicación del usuario
  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="#3b82f6" opacity="0.3"/>
        <circle cx="12" cy="12" r="4" fill="#3b82f6"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Dibujar línea entre paradas */}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          color={lineColor}
          weight={4}
          opacity={0.7}
        />
      )}

      {/* Markers de paradas */}
      {stops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={[parseFloat(stop.latitude.toString()), parseFloat(stop.longitude.toString())]}
          eventHandlers={{
            click: () => {
              if (onStopClick) {
                onStopClick(stop);
              }
            },
          }}
        >
          <Popup>
            <div className="text-sm" style={{ color: lineColor }}>
              <p className="font-bold mb-0.5">Parada {index + 1}</p>
              <p className="font-normal text-slate-700">{stop.name}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Marker del bus en tiempo real */}
      {busLocation && (
        <Marker
          position={[busLocation.latitude, busLocation.longitude]}
          icon={busIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-base">Autobús</p>
              <p className="text-slate-600">
                Última actualización: {new Date(busLocation.timestamp).toLocaleTimeString('es-ES')}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marker de la ubicación del usuario */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={userIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-base">📍 Tu ubicación</p>
              <p className="text-slate-600">Estás aquí</p>
            </div>
          </Popup>
        </Marker>
      )}

      <style>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes rotate {
          to {
            --angle: 360deg;
          }
        }

        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(12px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 
                      0 4px 12px rgba(0, 0, 0, 0.08) !important;
          border: 2px solid transparent !important;
          background: linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)) padding-box,
                      linear-gradient(var(--angle), ${lineColor}, ${lineColor}80, ${lineColor}) border-box !important;
          padding: 8px 12px !important;
          animation: 4s rotate linear infinite !important;
        }

        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(12px) !important;
        }

        .leaflet-popup-content {
          margin: 8px 6px !important;
        }

        .leaflet-container a.leaflet-popup-close-button {
          display: none !important;
        }
      `}</style>
    </MapContainer>
  );
}
