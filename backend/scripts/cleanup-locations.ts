import { performNightlyCleanup } from '../src/services/cleanup.service';
import logger from '../src/utils/logger';

/**
 * Script de limpieza nocturna de ubicaciones
 * Debe ejecutarse diariamente a las 4:00 AM (hora de España)
 * 
 * Uso manual:
 *   npm run cleanup
 * 
 * Configuración CRON (Linux/Mac):
 *   0 4 * * * cd /path/to/backend && npm run cleanup
 * 
 * Configuración Tarea Programada (Windows):
 *   Horario: 04:00 AM diario
 *   Acción: npm run cleanup
 *   Directorio: C:\path\to\backend
 */

async function main() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🧹 LIMPIEZA NOCTURNA DE UBICACIONES');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`⏰ Hora de ejecución: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`);
    console.log('');

    const result = await performNightlyCleanup();

    console.log('');
    console.log('📊 RESUMEN:');
    console.log(`   • Ubicaciones eliminadas: ${result.cleanup.deletedCount}`);
    console.log(`   • Total previo: ${result.stats.totalLocations}`);
    console.log('');
    
    if (result.stats.locationsByLine.length > 0) {
      console.log('📍 Por línea:');
      result.stats.locationsByLine.forEach(line => {
        console.log(`   • Línea ${line.lineId}: ${line.count} ubicaciones`);
      });
      console.log('');
    }

    console.log('✅ Limpieza completada exitosamente');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ERROR EN LIMPIEZA:');
    console.error(error);
    console.error('');
    
    logger.error('Error fatal en script de limpieza:', error);
    process.exit(1);
  }
}

main();
