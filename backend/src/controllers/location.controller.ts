import { Request, Response } from 'express';
import {
  validateLocationData,
  validateSession,
  validateBusLine,
  saveLocation,
  updateSessionLine,
  endSession,
  getRecentLocationsByLine,
  getAllBusLines,
  LocationData,
} from '../services/location.service';
import {
  performNightlyCleanup,
  getLocationStats,
} from '../services/cleanup.service';
import logger from '../utils/logger';

/**
 * POST /api/location
 * Recibe y guarda la ubicación del conductor
 */
export async function submitLocation(req: Request, res: Response) {
  try {
    const locationData: Partial<LocationData> = req.body;

    // Validar datos de ubicación
    const validation = validateLocationData(locationData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Datos de ubicación inválidos',
        details: validation.errors,
      });
    }

    // Validar sesión
    const isSessionValid = await validateSession(locationData.sessionId!);
    if (!isSessionValid) {
      return res.status(401).json({
        error: 'Sesión inválida o expirada',
      });
    }

    // Validar línea
    const isLineValid = await validateBusLine(locationData.lineId!);
    if (!isLineValid) {
      return res.status(400).json({
        error: 'Línea de autobús no válida',
      });
    }

    // Guardar ubicación
    const location = await saveLocation(locationData as LocationData);

    logger.info(`Location submitted: ${location.id}`);

    res.status(201).json({
      success: true,
      location: {
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
      },
    });
  } catch (error) {
    logger.error('Error in submitLocation:', error);
    res.status(500).json({
      error: 'Error al guardar ubicación',
    });
  }
}

/**
 * PUT /api/session/:sessionId/line
 * Actualiza la línea asignada a una sesión
 */
export async function assignLineToSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const { lineId } = req.body;

    if (!lineId || typeof lineId !== 'string') {
      return res.status(400).json({
        error: 'lineId es requerido',
      });
    }

    // Validar sesión
    const isSessionValid = await validateSession(sessionId);
    if (!isSessionValid) {
      return res.status(401).json({
        error: 'Sesión inválida o expirada',
      });
    }

    // Validar línea
    const isLineValid = await validateBusLine(lineId);
    if (!isLineValid) {
      return res.status(400).json({
        error: 'Línea de autobús no válida',
      });
    }

    // Actualizar sesión
    const session = await updateSessionLine(sessionId, lineId);

    res.json({
      success: true,
      session: {
        id: session.id,
        lineId: session.lineId,
      },
    });
  } catch (error) {
    logger.error('Error in assignLineToSession:', error);
    res.status(500).json({
      error: 'Error al asignar línea',
    });
  }
}

/**
 * PUT /api/session/:sessionId/end
 * Finaliza una sesión de conductor
 */
export async function endDriverSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;

    // Validar que la sesión existe
    const isSessionValid = await validateSession(sessionId);
    if (!isSessionValid) {
      return res.status(401).json({
        error: 'Sesión no encontrada',
      });
    }

    // Finalizar sesión
    const session = await endSession(sessionId);

    res.json({
      success: true,
      session: {
        id: session.id,
        endedAt: session.endedAt,
      },
    });
  } catch (error) {
    logger.error('Error in endDriverSession:', error);
    res.status(500).json({
      error: 'Error al finalizar sesión',
    });
  }
}

/**
 * GET /api/location/line/:lineId
 * Obtiene las ubicaciones recientes de una línea
 */
export async function getLocationsByLine(req: Request, res: Response) {
  try {
    const { lineId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validar línea
    const isLineValid = await validateBusLine(lineId);
    if (!isLineValid) {
      return res.status(400).json({
        error: 'Línea de autobús no válida',
      });
    }

    // Obtener ubicaciones
    const locations = await getRecentLocationsByLine(lineId, limit);

    res.json({
      success: true,
      locations: locations.map((loc) => ({
        id: loc.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        speed: loc.speed,
        heading: loc.heading,
        timestamp: loc.timestamp,
        sessionId: loc.sessionId,
      })),
    });
  } catch (error) {
    logger.error('Error in getLocationsByLine:', error);
    res.status(500).json({
      error: 'Error al obtener ubicaciones',
    });
  }
}

/**
 * GET /api/lines
 * Obtiene todas las líneas de autobús
 */
export async function getBusLines(req: Request, res: Response) {
  try {
    const lines = await getAllBusLines();

    res.json({
      success: true,
      lines: lines.map((line) => ({
        id: line.id,
        name: line.name,
        color: line.color,
        description: line.description,
      })),
    });
  } catch (error) {
    logger.error('Error in getBusLines:', error);
    res.status(500).json({
      error: 'Error al obtener líneas',
    });
  }
}

/**
 * POST /api/admin/cleanup
 * Ejecuta la limpieza nocturna manualmente
 * TODO: Proteger con autenticación de administrador
 */
export async function manualCleanup(req: Request, res: Response) {
  try {
    logger.info('🧹 Limpieza manual iniciada');
    
    const result = await performNightlyCleanup();

    res.json({
      success: true,
      message: 'Limpieza completada exitosamente',
      deletedCount: result.cleanup.deletedCount,
      stats: result.stats,
    });
  } catch (error) {
    logger.error('Error in manualCleanup:', error);
    res.status(500).json({
      error: 'Error al ejecutar limpieza',
    });
  }
}

/**
 * GET /api/admin/stats
 * Obtiene estadísticas de ubicaciones
 * TODO: Proteger con autenticación de administrador
 */
export async function getStats(req: Request, res: Response) {
  try {
    const stats = await getLocationStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Error in getStats:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
    });
  }
}
