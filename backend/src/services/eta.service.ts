import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BusPosition {
  sessionId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: Date;
}

interface StopPosition {
  id: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface BusETA {
  sessionId: string;
  estimatedMinutes: number;
  distanceMeters: number;
  isApproaching: boolean;
  currentStopOrder: number | null;
  nextStopOrder: number | null;
}

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en metros
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

/**
 * Determina si el bus se está acercando a una parada comparando las últimas 2 posiciones
 * Requiere al menos 2 posiciones (20 segundos de datos)
 */
async function isBusApproachingStop(
  sessionId: string,
  targetStopLat: number,
  targetStopLon: number
): Promise<boolean | null> {
  // Obtener las últimas 2 posiciones del bus
  const positions = await prisma.busLocation.findMany({
    where: { sessionId },
    orderBy: { timestamp: 'desc' },
    take: 2,
  });

  // Si no hay al menos 2 posiciones, no podemos determinar la dirección
  if (positions.length < 2) {
    return null;
  }

  const [latest, previous] = positions;

  // Calcular distancias a la parada objetivo
  const latestDistance = calculateDistance(
    parseFloat(latest.latitude.toString()),
    parseFloat(latest.longitude.toString()),
    targetStopLat,
    targetStopLon
  );

  const previousDistance = calculateDistance(
    parseFloat(previous.latitude.toString()),
    parseFloat(previous.longitude.toString()),
    targetStopLat,
    targetStopLon
  );

  // Si la distancia actual es menor que la anterior, se está acercando
  return latestDistance < previousDistance;
}

/**
 * Encuentra la parada más cercana al bus en la ruta
 */
function findClosestStop(busPos: BusPosition, stops: StopPosition[]): { stop: StopPosition; distance: number } | null {
  if (stops.length === 0) return null;

  let closestStop = stops[0];
  let minDistance = calculateDistance(
    busPos.latitude,
    busPos.longitude,
    closestStop.latitude,
    closestStop.longitude
  );

  for (let i = 1; i < stops.length; i++) {
    const distance = calculateDistance(
      busPos.latitude,
      busPos.longitude,
      stops[i].latitude,
      stops[i].longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestStop = stops[i];
    }
  }

  return { stop: closestStop, distance: minDistance };
}

/**
 * Calcula el tiempo estimado de llegada siguiendo el recorrido de paradas
 * Si el bus está después de la parada objetivo, calculará el camino largo (completar la ruta)
 */
function calculateETAAlongRoute(
  busPos: BusPosition,
  targetStop: StopPosition,
  stops: StopPosition[],
  currentStopIndex: number
): { estimatedMinutes: number; distanceMeters: number } {
  const AVERAGE_SPEED_KMH = 30; // Velocidad promedio en ciudad
  const STOP_TIME_MINUTES = 1; // Tiempo promedio en cada parada

  let totalDistance = 0;
  let stopsToVisit = 0;

  // Distancia desde la posición actual del bus a la parada más cercana
  const closestStopResult = findClosestStop(busPos, stops);
  if (!closestStopResult) {
    return { estimatedMinutes: 0, distanceMeters: 0 };
  }

  totalDistance += closestStopResult.distance;

  // Encontrar el índice de la parada objetivo
  const targetIndex = stops.findIndex(s => s.id === targetStop.id);
  
  if (targetIndex === -1) {
    return { estimatedMinutes: 0, distanceMeters: 0 };
  }

  // Si el bus está después de la parada objetivo (se alejó), debe completar toda la ruta
  if (currentStopIndex > targetIndex) {
    // Distancia desde la parada actual hasta el final de la ruta
    for (let i = currentStopIndex; i < stops.length - 1; i++) {
      const distance = calculateDistance(
        stops[i].latitude,
        stops[i].longitude,
        stops[i + 1].latitude,
        stops[i + 1].longitude
      );
      totalDistance += distance;
      stopsToVisit++;
    }

    // Más la distancia desde el inicio hasta la parada objetivo
    for (let i = 0; i < targetIndex; i++) {
      const distance = calculateDistance(
        stops[i].latitude,
        stops[i].longitude,
        stops[i + 1].latitude,
        stops[i + 1].longitude
      );
      totalDistance += distance;
      stopsToVisit++;
    }
  } else {
    // El bus está antes de la parada, calcular distancia directa por el recorrido
    for (let i = currentStopIndex; i < targetIndex; i++) {
      const distance = calculateDistance(
        stops[i].latitude,
        stops[i].longitude,
        stops[i + 1].latitude,
        stops[i + 1].longitude
      );
      totalDistance += distance;
      stopsToVisit++;
    }
  }

  // Calcular tiempo estimado
  const distanceKm = totalDistance / 1000;
  const timeInHours = distanceKm / AVERAGE_SPEED_KMH;
  const travelTimeMinutes = timeInHours * 60;
  const stopTimeMinutes = stopsToVisit * STOP_TIME_MINUTES;
  const totalTimeMinutes = Math.ceil(travelTimeMinutes + stopTimeMinutes);

  return {
    estimatedMinutes: totalTimeMinutes,
    distanceMeters: Math.round(totalDistance)
  };
}

/**
 * Calcula los ETAs para una parada específica desde todos los buses activos de una línea
 */
export async function calculateETAsForStop(lineId: string, stopId: string): Promise<BusETA[]> {
  try {
    // 1. Obtener todas las paradas de la línea en orden
    const stopsOnLine = await prisma.stopOnLine.findMany({
      where: { lineId },
      include: { stop: true },
      orderBy: { order: 'asc' }
    });

    const stops: StopPosition[] = stopsOnLine.map((sol: any) => ({
      id: sol.stop.id,
      latitude: parseFloat(sol.stop.latitude.toString()),
      longitude: parseFloat(sol.stop.longitude.toString()),
      order: sol.order
    }));

    const targetStop = stops.find(s => s.id === stopId);
    if (!targetStop) {
      return [];
    }

    // 2. Obtener todas las sesiones activas de esta línea
    const activeSessions = await prisma.session.findMany({
      where: {
        lineId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      select: { id: true }
    });

    if (activeSessions.length === 0) {
      return [];
    }

    // 3. Obtener la última ubicación de cada sesión
    const etas: BusETA[] = [];

    for (const session of activeSessions) {
      const latestLocation = await prisma.busLocation.findFirst({
        where: { sessionId: session.id },
        orderBy: { timestamp: 'desc' }
      });

      if (!latestLocation) continue;

      const busPos: BusPosition = {
        sessionId: session.id,
        latitude: parseFloat(latestLocation.latitude.toString()),
        longitude: parseFloat(latestLocation.longitude.toString()),
        speed: latestLocation.speed,
        heading: latestLocation.heading,
        timestamp: latestLocation.timestamp
      };

      // 4. Encontrar la parada más cercana al bus
      const closestStopResult = findClosestStop(busPos, stops);
      if (!closestStopResult) continue;

      const currentStopIndex = stops.findIndex(s => s.id === closestStopResult.stop.id);

      // 5. Determinar si el bus se está acercando a la parada objetivo usando las últimas 2 posiciones
      const approaching = await isBusApproachingStop(
        session.id,
        targetStop.latitude,
        targetStop.longitude
      );

      // Si no podemos determinar la dirección (menos de 2 posiciones) o se está alejando, saltamos
      if (approaching === null || !approaching) {
        continue;
      }

      // 6. Calcular ETA siguiendo la ruta
      const { estimatedMinutes, distanceMeters } = calculateETAAlongRoute(
        busPos,
        targetStop,
        stops,
        currentStopIndex
      );

      // Solo incluir buses que se estén acercando y tengan un ETA válido
      if (approaching && estimatedMinutes > 0 && estimatedMinutes < 60) {
        etas.push({
          sessionId: session.id,
          estimatedMinutes,
          distanceMeters,
          isApproaching: approaching,
          currentStopOrder: closestStopResult.stop.order,
          nextStopOrder: currentStopIndex + 1 < stops.length ? stops[currentStopIndex + 1].order : null
        });
      }
    }

    // 7. Ordenar por tiempo estimado (más cercano primero)
    return etas.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);

  } catch (error) {
    console.error('Error calculando ETAs:', error);
    return [];
  }
}

export default {
  calculateETAsForStop
};
