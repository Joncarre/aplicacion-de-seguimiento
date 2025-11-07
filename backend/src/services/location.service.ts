import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface LocationData {
  sessionId: string;
  lineId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number | null;
  heading?: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida los datos de ubicación recibidos
 */
export function validateLocationData(data: Partial<LocationData>): ValidationResult {
  const errors: string[] = [];

  if (!data.sessionId || typeof data.sessionId !== 'string') {
    errors.push('sessionId es requerido y debe ser un string');
  }

  if (!data.lineId || typeof data.lineId !== 'string') {
    errors.push('lineId es requerido y debe ser un string');
  }

  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('latitude debe ser un número entre -90 y 90');
  }

  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('longitude debe ser un número entre -180 y 180');
  }

  if (data.accuracy !== undefined && (typeof data.accuracy !== 'number' || data.accuracy < 0)) {
    errors.push('accuracy debe ser un número positivo');
  }

  if (data.speed !== undefined && data.speed !== null && (typeof data.speed !== 'number' || data.speed < 0)) {
    errors.push('speed debe ser un número positivo o null');
  }

  if (data.heading !== undefined && data.heading !== null && (typeof data.heading !== 'number' || data.heading < 0 || data.heading > 360)) {
    errors.push('heading debe ser un número entre 0 y 360 o null');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica que la sesión sea válida y esté activa
 */
export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { code: true },
    });

    if (!session) {
      logger.warn(`Session not found: ${sessionId}`);
      return false;
    }

    if (!session.isActive) {
      logger.warn(`Session is not active: ${sessionId}`);
      return false;
    }

    if (new Date() > session.expiresAt) {
      logger.warn(`Session expired: ${sessionId}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating session:', error);
    return false;
  }
}

/**
 * Verifica que la línea exista en la base de datos
 */
export async function validateBusLine(lineId: string): Promise<boolean> {
  try {
    const line = await prisma.busLine.findUnique({
      where: { id: lineId },
    });

    return line !== null;
  } catch (error) {
    logger.error('Error validating bus line:', error);
    return false;
  }
}

/**
 * Guarda una ubicación en la base de datos
 */
export async function saveLocation(data: LocationData) {
  try {
    const location = await prisma.busLocation.create({
      data: {
        sessionId: data.sessionId,
        lineId: data.lineId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        speed: data.speed,
        heading: data.heading,
        timestamp: new Date(),
      },
    });

    logger.info(`Location saved for session ${data.sessionId}`);
    return location;
  } catch (error) {
    logger.error('Error saving location:', error);
    throw error;
  }
}

/**
 * Actualiza la línea asignada a una sesión
 */
export async function updateSessionLine(sessionId: string, lineId: string) {
  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: { lineId },
    });

    logger.info(`Session ${sessionId} assigned to line ${lineId}`);
    return session;
  } catch (error) {
    logger.error('Error updating session line:', error);
    throw error;
  }
}

/**
 * Finaliza una sesión de conductor
 */
export async function endSession(sessionId: string) {
  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    logger.info(`Session ended: ${sessionId}`);
    return session;
  } catch (error) {
    logger.error('Error ending session:', error);
    throw error;
  }
}

/**
 * Obtiene las últimas ubicaciones de una línea
 */
export async function getRecentLocationsByLine(lineId: string, limit: number = 10) {
  try {
    const locations = await prisma.busLocation.findMany({
      where: {
        lineId,
        session: { isActive: true },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        session: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    return locations;
  } catch (error) {
    logger.error('Error fetching recent locations:', error);
    throw error;
  }
}

/**
 * Obtiene todas las líneas de autobús
 */
export async function getAllBusLines() {
  try {
    const lines = await prisma.busLine.findMany({
      orderBy: { name: 'asc' },
    });

    return lines;
  } catch (error) {
    logger.error('Error fetching bus lines:', error);
    throw error;
  }
}
