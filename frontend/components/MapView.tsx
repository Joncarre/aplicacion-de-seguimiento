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

  // Tracking continuo de la ubicación del usuario
  useEffect(() => {
    if (!navigator.geolocation) {
      const msg = 'Tu navegador no soporta geolocalización';
      console.error(msg);
      setLocationError(msg);
      return;
    }

    console.log('Iniciando tracking de ubicación del usuario...');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude] as [number, number];
        console.log('Ubicación actualizada:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setUserLocation(coords);
        setLocationError(null);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Cleanup: detener el tracking cuando el componente se desmonte
    return () => {
      console.log('🛑 Deteniendo tracking de ubicación');
      navigator.geolocation.clearWatch(watchId);
    };
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

  // Icono personalizado para las paradas con el color de la línea
  const createStopIcon = (stopNumber: number) => {
    // Oscurecer un poco el color si es naranja
    let iconColor = lineColor;
    if (lineColor.toLowerCase() === '#ff6b35' || lineColor.toLowerCase().includes('orange')) {
      iconColor = '#e65100'; // naranja oscuro
    }

    return new L.Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="${iconColor}" opacity="0.9"/>
          <circle cx="12" cy="12" r="8" fill="white" opacity="0.3"/>
          <text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="white">${stopNumber}</text>
        </svg>
      `),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  // Icono personalizado para la ubicación del usuario
  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 24 32">
        <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 17.5 8.5 17.5s8.5-12.25 8.5-17.5C20.5 3.81 16.69 0 12 0z" fill="#3b82f6" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="8.5" r="3" fill="white"/>
      </svg>
    `),
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
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

      {/* Markers de paradas */}
      {stops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={[parseFloat(stop.latitude.toString()), parseFloat(stop.longitude.toString())]}
          icon={createStopIcon(index + 1)}
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
              <p className="my-0" style={{ marginBottom: '2px', marginTop: '4px' }}>Parada {index + 1}</p>
              <p className="font-normal text-slate-700 my-0" style={{ marginBottom: '2px', marginTop: '2px' }}>{stop.name}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Marker de la ubicación del usuario */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={userIcon}
        />
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
          background: rgba(255, 255, 255, 0.81) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 
                      0 4px 12px rgba(0, 0, 0, 0.08) !important;
          padding: 8px 12px !important;
          position: relative !important;
        }

        .leaflet-popup-content-wrapper::before {
          content: '' !important;
          position: absolute !important;
          inset: 0 !important;
          border-radius: 12px !important;
          padding: 2px !important;
          background: ${lineColor} !important;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
          -webkit-mask-composite: xor !important;
          mask-composite: exclude !important;
          pointer-events: none !important;
        }

        .leaflet-popup-tip {
          display: none !important;
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
