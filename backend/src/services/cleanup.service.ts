import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Limpia todas las ubicaciones de la base de datos
 * Se ejecuta diariamente a las 4:00 AM para resetear datos del día anterior
 */
export async function cleanupAllLocations() {
  try {
    const result = await prisma.busLocation.deleteMany({});
    
    logger.info(`🧹 Limpieza completada: ${result.count} ubicaciones eliminadas`);
    
    return {
      success: true,
      deletedCount: result.count,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error en limpieza de ubicaciones:', error);
    throw error;
  }
}

/**
 * Limpia ubicaciones anteriores a una fecha específica
 * Útil para limpiezas manuales o testing
 */
export async function cleanupLocationsBefore(date: Date) {
  try {
    const result = await prisma.busLocation.deleteMany({
      where: {
        timestamp: {
          lt: date,
        },
      },
    });
    
    logger.info(`🧹 Limpieza completada: ${result.count} ubicaciones eliminadas antes de ${date.toISOString()}`);
    
    return {
      success: true,
      deletedCount: result.count,
      beforeDate: date.toISOString(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error en limpieza de ubicaciones:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas antes de la limpieza
 * Para análisis futuro de patrones de uso
 */
export async function getLocationStats() {
  try {
    const totalLocations = await prisma.busLocation.count();
    
    const locationsByLine = await prisma.busLocation.groupBy({
      by: ['lineId'],
      _count: {
        id: true,
      },
    });

    const oldestLocation = await prisma.busLocation.findFirst({
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true },
    });

    const newestLocation = await prisma.busLocation.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    return {
      totalLocations,
      locationsByLine: locationsByLine.map(item => ({
        lineId: item.lineId,
        count: item._count.id,
      })),
      oldestTimestamp: oldestLocation?.timestamp,
      newestTimestamp: newestLocation?.timestamp,
    };
  } catch (error) {
    logger.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}

/**
 * Calcula estadísticas agregadas del día antes de limpiar
 * TODO: Guardar en tabla daily_stats para análisis histórico (Fase futura)
 */
export async function calculateDailyStats() {
  try {
    const stats = await getLocationStats();
    
    // TODO: En una fase futura, guardar estas estadísticas en una tabla
    // Por ahora solo las registramos en logs
    logger.info('📊 Estadísticas del día:', {
      total: stats.totalLocations,
      porLinea: stats.locationsByLine,
      periodo: {
        desde: stats.oldestTimestamp,
        hasta: stats.newestTimestamp,
      },
    });
    
    return stats;
  } catch (error) {
    logger.error('Error calculando estadísticas:', error);
    throw error;
  }
}

/**
 * Proceso completo de limpieza nocturna
 * 1. Calcular estadísticas del día
 * 2. Guardar estadísticas (futuro)
 * 3. Limpiar todas las ubicaciones
 */
export async function performNightlyCleanup() {
  try {
    logger.info('🌙 Iniciando limpieza nocturna...');
    
    // Paso 1: Obtener estadísticas
    const stats = await calculateDailyStats();
    
    // Paso 2: Limpiar ubicaciones
    const cleanupResult = await cleanupAllLocations();
    
    logger.info('✅ Limpieza nocturna completada:', {
      ubicacionesEliminadas: cleanupResult.deletedCount,
      estadisticasPrevias: stats,
    });
    
    return {
      success: true,
      stats,
      cleanup: cleanupResult,
    };
  } catch (error) {
    logger.error('❌ Error en limpieza nocturna:', error);
    throw error;
  }
}
