'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
}

export default function MapView({ stops, busLocation, lineColor }: MapViewProps) {
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
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-base">Parada {index + 1}</p>
              <p className="font-semibold">{stop.name}</p>
              <p className="text-slate-600">{stop.street}</p>
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
              <p className="font-bold text-base">🚌 Autobús</p>
              <p className="text-slate-600">
                Última actualización: {new Date(busLocation.timestamp).toLocaleTimeString('es-ES')}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
