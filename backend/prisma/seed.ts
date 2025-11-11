import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear las 5 líneas de autobús
  const lines = [
    { name: 'L1', color: '#ef476f', description: 'Línea 1' },
    { name: 'L2', color: '#ffd166', description: 'Línea 2' },
    { name: 'L3', color: '#06d6a0', description: 'Línea 3' },
    { name: 'L4', color: '#118ab2', description: 'Línea 4' },
    { name: 'L5', color: '#9984d4', description: 'Línea 5' },
  ];

  console.log('📍 Creando líneas de autobús...');

  const createdLines: { [key: string]: any } = {};

  for (const line of lines) {
    const created = await prisma.busLine.upsert({
      where: { name: line.name },
      update: {
        color: line.color,
        description: line.description,
      },
      create: line,
    });
    createdLines[line.name] = created;
    console.log(`✅ Línea ${created.name} creada/actualizada con color ${created.color}`);
  }

  console.log('\n🚏 Creando paradas de ejemplo en Aranjuez...');

  // Paradas de ejemplo (coordenadas ficticias en Aranjuez)
  // Centro: aproximadamente 40.0333, -3.6000
  const stopsData = [
    // L1 - Línea Centro-Norte
    { name: 'Plaza de Toros', street: 'Calle de la Reina', lat: 40.0320, lon: -3.6010, line: 'L1', order: 1 },
    { name: 'Estación de Renfe', street: 'Plaza de la Estación', lat: 40.0340, lon: -3.6020, line: 'L1', order: 2 },
    { name: 'Hospital', street: 'Avenida de Andalucía', lat: 40.0360, lon: -3.6030, line: 'L1', order: 3 },
    { name: 'Polideportivo', street: 'Calle del Deporte', lat: 40.0380, lon: -3.6040, line: 'L1', order: 4 },

    // L2 - Línea Este-Oeste
    { name: 'Palacio Real', street: 'Calle del Príncipe', lat: 40.0333, lon: -3.5980, line: 'L2', order: 1 },
    { name: 'Mercado Municipal', street: 'Plaza del Mercado', lat: 40.0333, lon: -3.6000, line: 'L2', order: 2 },
    { name: 'Ayuntamiento', street: 'Plaza de la Constitución', lat: 40.0333, lon: -3.6020, line: 'L2', order: 3 },
    { name: 'Parque del Parterre', street: 'Calle de la Montaña', lat: 40.0333, lon: -3.6040, line: 'L2', order: 4 },

    // L3 - Línea Circular
    { name: 'Universidad', street: 'Avenida de la Universidad', lat: 40.0300, lon: -3.6000, line: 'L3', order: 1 },
    { name: 'Centro Comercial', street: 'Calle del Comercio', lat: 40.0310, lon: -3.6010, line: 'L3', order: 2 },
    { name: 'Biblioteca Municipal', street: 'Plaza de las Letras', lat: 40.0320, lon: -3.6000, line: 'L3', order: 3 },
    { name: 'Teatro', street: 'Calle del Arte', lat: 40.0310, lon: -3.5990, line: 'L3', order: 4 },

    // L4 - Línea Sur
    { name: 'Jardines del Príncipe', street: 'Calle del Jardín', lat: 40.0280, lon: -3.6010, line: 'L4', order: 1 },
    { name: 'Casco Antiguo', street: 'Calle Mayor', lat: 40.0290, lon: -3.6000, line: 'L4', order: 2 },
    { name: 'Plaza de Abastos', street: 'Plaza de Abastos', lat: 40.0300, lon: -3.5990, line: 'L4', order: 3 },

    // L5 - Línea Residencial
    { name: 'Urbanización Norte', street: 'Calle de la Paz', lat: 40.0400, lon: -3.6000, line: 'L5', order: 1 },
    { name: 'Colegio San Fernando', street: 'Avenida San Fernando', lat: 40.0380, lon: -3.6010, line: 'L5', order: 2 },
    { name: 'Centro de Salud', street: 'Calle de la Salud', lat: 40.0360, lon: -3.6000, line: 'L5', order: 3 },
    { name: 'Parque de Ocio', street: 'Calle del Ocio', lat: 40.0340, lon: -3.5990, line: 'L5', order: 4 },
  ];

  for (const stopData of stopsData) {
    // Crear o actualizar la parada
    const stop = await prisma.stop.upsert({
      where: {
        id: `${stopData.name.toLowerCase().replace(/\s+/g, '-')}-${stopData.line}`,
      },
      update: {
        name: stopData.name,
        street: stopData.street,
        latitude: stopData.lat,
        longitude: stopData.lon,
      },
      create: {
        id: `${stopData.name.toLowerCase().replace(/\s+/g, '-')}-${stopData.line}`,
        name: stopData.name,
        street: stopData.street,
        latitude: stopData.lat,
        longitude: stopData.lon,
      },
    });

    // Asociar a la línea correspondiente
    const line = createdLines[stopData.line];
    
    await prisma.stopOnLine.upsert({
      where: {
        stopId_lineId: {
          stopId: stop.id,
          lineId: line.id,
        },
      },
      update: {
        order: stopData.order,
      },
      create: {
        stopId: stop.id,
        lineId: line.id,
        order: stopData.order,
      },
    });

    console.log(`✅ Parada ${stopData.name} creada en ${stopData.line} (orden: ${stopData.order})`);
  }

  console.log('');
  console.log('✅ Seed completado!');
  console.log('📊 Resumen:');
  console.log(`   - ${lines.length} líneas creadas`);
  console.log(`   - ${stopsData.length} paradas creadas`);
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('   1. Ejecuta: npm run generate-codes');
  console.log('   2. Accede al panel de administración para gestionar paradas');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
