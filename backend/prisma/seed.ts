import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear las 5 líneas de autobús
  const lines = [
    { name: 'L1', color: '#ef476f', description: 'Línea 1' },
    { name: 'L2', color: '#ffa654', description: 'Línea 2' },
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
    // L1 - Línea Centro-Norte (8 paradas)
    { name: 'Plaza de Toros', street: 'Calle de la Reina', lat: 40.0320, lon: -3.6010, line: 'L1', order: 1 },
    { name: 'Jardines del Príncipe', street: 'Calle del Jardín', lat: 40.0330, lon: -3.6015, line: 'L1', order: 2 },
    { name: 'Estación de Renfe', street: 'Plaza de la Estación', lat: 40.0340, lon: -3.6020, line: 'L1', order: 3 },
    { name: 'Centro de Salud', street: 'Calle de la Salud', lat: 40.0350, lon: -3.6025, line: 'L1', order: 4 },
    { name: 'Hospital', street: 'Avenida de Andalucía', lat: 40.0360, lon: -3.6030, line: 'L1', order: 5 },
    { name: 'IES Alpajés', street: 'Avenida del Ejército', lat: 40.0370, lon: -3.6035, line: 'L1', order: 6 },
    { name: 'Polideportivo', street: 'Calle del Deporte', lat: 40.0380, lon: -3.6040, line: 'L1', order: 7 },
    { name: 'Residencial Norte', street: 'Calle de la Paz', lat: 40.0390, lon: -3.6045, line: 'L1', order: 8 },

    // L2 - Línea Este-Oeste (9 paradas)
    { name: 'Palacio Real', street: 'Calle del Príncipe', lat: 40.0315, lon: -3.6025, line: 'L2', order: 1 },
    { name: 'Iglesia de San Antonio', street: 'Plaza de San Antonio', lat: 40.0342, lon: -3.6048, line: 'L2', order: 2 },
    { name: 'Mercado Municipal', street: 'Plaza del Mercado', lat: 40.0288, lon: -3.5995, line: 'L2', order: 3 },
    { name: 'Correos', street: 'Calle de las Infantas', lat: 40.0365, lon: -3.6072, line: 'L2', order: 4 },
    { name: 'Ayuntamiento', street: 'Plaza de la Constitución', lat: 40.0251, lon: -3.5968, line: 'L2', order: 5 },
    { name: 'Teatro Real Carlos III', street: 'Calle del Teatro', lat: 40.0398, lon: -3.6115, line: 'L2', order: 6 },
    { name: 'Parque del Parterre', street: 'Calle de la Montaña', lat: 40.0276, lon: -3.6008, line: 'L2', order: 7 },
    { name: 'Piscina Municipal', street: 'Avenida del Deporte', lat: 40.0422, lon: -3.6138, line: 'L2', order: 8 },
    { name: 'Zona Industrial', street: 'Polígono Sur', lat: 40.0234, lon: -3.5942, line: 'L2', order: 9 },

    // L3 - Línea Circular (10 paradas)
    { name: 'Universidad', street: 'Avenida de la Universidad', lat: 40.0268, lon: -3.6055, line: 'L3', order: 1 },
    { name: 'Campus Universitario', street: 'Calle del Saber', lat: 40.0392, lon: -3.5978, line: 'L3', order: 2 },
    { name: 'Centro Comercial', street: 'Calle del Comercio', lat: 40.0325, lon: -3.6092, line: 'L3', order: 3 },
    { name: 'Cines Aranjuez', street: 'Avenida del Ocio', lat: 40.0247, lon: -3.6018, line: 'L3', order: 4 },
    { name: 'Biblioteca Municipal', street: 'Plaza de las Letras', lat: 40.0411, lon: -3.6145, line: 'L3', order: 5 },
    { name: 'Museo de la Ciudad', street: 'Calle de la Cultura', lat: 40.0283, lon: -3.5965, line: 'L3', order: 6 },
    { name: 'Teatro', street: 'Calle del Arte', lat: 40.0356, lon: -3.6105, line: 'L3', order: 7 },
    { name: 'Conservatorio', street: 'Plaza de la Música', lat: 40.0229, lon: -3.6032, line: 'L3', order: 8 },
    { name: 'Parque de Infantas', street: 'Calle de las Infantas', lat: 40.0437, lon: -3.5988, line: 'L3', order: 9 },
    { name: 'Centro Cívico', street: 'Avenida de Europa', lat: 40.0305, lon: -3.6078, line: 'L3', order: 10 },

    // L4 - Línea Sur (7 paradas)
    { name: 'Jardines del Príncipe Sur', street: 'Calle del Jardín Sur', lat: 40.0371, lon: -3.6062, line: 'L4', order: 1 },
    { name: 'Plaza de Parejas', street: 'Plaza de Parejas', lat: 40.0258, lon: -3.5952, line: 'L4', order: 2 },
    { name: 'Casco Antiguo', street: 'Calle Mayor', lat: 40.0425, lon: -3.6128, line: 'L4', order: 3 },
    { name: 'Casa de la Cultura', street: 'Calle de la Cultura', lat: 40.0293, lon: -3.6015, line: 'L4', order: 4 },
    { name: 'Plaza de Abastos', street: 'Plaza de Abastos', lat: 40.0408, lon: -3.5972, line: 'L4', order: 5 },
    { name: 'Convento de San Pascual', street: 'Calle San Pascual', lat: 40.0242, lon: -3.6098, line: 'L4', order: 6 },
    { name: 'Río Tajo', street: 'Paseo del Río', lat: 40.0384, lon: -3.6042, line: 'L4', order: 7 },

    // L5 - Línea Residencial (8 paradas)
    { name: 'Urbanización Norte', street: 'Calle de la Paz', lat: 40.0336, lon: -3.6088, line: 'L5', order: 1 },
    { name: 'Plaza Mayor Norte', street: 'Plaza Mayor Norte', lat: 40.0415, lon: -3.5995, line: 'L5', order: 2 },
    { name: 'Colegio San Fernando', street: 'Avenida San Fernando', lat: 40.0265, lon: -3.6122, line: 'L5', order: 3 },
    { name: 'Parque Infantil', street: 'Calle de los Niños', lat: 40.0448, lon: -3.6012, line: 'L5', order: 4 },
    { name: 'Centro de Salud Norte', street: 'Calle de la Salud', lat: 40.0221, lon: -3.5958, line: 'L5', order: 5 },
    { name: 'Supermercado Central', street: 'Avenida del Comercio', lat: 40.0377, lon: -3.6152, line: 'L5', order: 6 },
    { name: 'Parque de Ocio', street: 'Calle del Ocio', lat: 40.0298, lon: -3.6038, line: 'L5', order: 7 },
    { name: 'Estación de Autobuses', street: 'Plaza de los Viajeros', lat: 40.0432, lon: -3.5982, line: 'L5', order: 8 },
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
  console.log('   - L1: 8 paradas | L2: 9 paradas | L3: 10 paradas | L4: 7 paradas | L5: 8 paradas');
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
