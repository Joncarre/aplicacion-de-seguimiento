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

  console.log('\n🗑️  Eliminando paradas antiguas de L1...');

  // Primero eliminar las relaciones StopOnLine de L1
  const deletedRelations = await prisma.stopOnLine.deleteMany({
    where: {
      lineId: createdLines['L1'].id
    }
  });
  console.log(`✅ ${deletedRelations.count} relaciones de paradas eliminadas de L1`);

  // Luego eliminar las paradas que solo pertenecían a L1
  // (esto no afectará paradas compartidas con otras líneas)
  const stopsToDelete = await prisma.stop.findMany({
    where: {
      lines: {
        none: {} // Paradas que ya no tienen ninguna línea asociada
      }
    }
  });

  for (const stop of stopsToDelete) {
    await prisma.stop.delete({
      where: { id: stop.id }
    });
  }
  console.log(`✅ ${stopsToDelete.length} paradas huérfanas eliminadas`);

  console.log('\n🚏 Creando paradas de L1 en Aranjuez...');

  // Paradas de L1 con coordenadas reales
  const stopsData = [
    // L1 - Línea completa con paradas reales (32 paradas - Ida y Vuelta)
    // Ida
    { name: 'Valeras - San Antonio', street: 'Ida: Valeras - San Antonio', lat: 40.033812728108465, lon: -3.6085229597493673, line: 'L1', order: 1 },
    { name: 'Abastos - Florida', street: 'Ida: Abastos - Florida', lat: 40.03219893965174, lon: -3.606989186757715, line: 'L1', order: 2 },
    { name: 'Abastos - Ayuntamiento', street: 'Ida: Abastos - Ayuntamiento', lat: 40.03205928640961, lon: -3.6038349091616606, line: 'L1', order: 3 },
    { name: 'Abastos - Concha', street: 'Ida: Abastos - Concha', lat: 40.03182658066351, lon: -3.6009958155931026, line: 'L1', order: 4 },
    { name: 'Foso - Gobernador', street: 'Ida: Foso - Gobernador', lat: 40.03253140920107, lon: -3.597875425391982, line: 'L1', order: 5 },
    { name: 'Foso - Infantas', street: 'Ida: Foso - Infantas', lat: 40.0335642661764, lon: -3.5979370867577, line: 'L1', order: 6 },
    { name: 'Moreras - La Barraca de Federico', street: 'Ida: Moreras - La Barraca de Federico', lat: 40.03550311476256, lon: -3.5968147963423736, line: 'L1', order: 7 },
    { name: 'Moreras - Ancha (Ida)', street: 'Ida: Moreras - Ancha', lat: 40.035350358201256, lon: -3.5947716301853183, line: 'L1', order: 8 },
    { name: 'Moreras - Primero de Mayo (Ida)', street: 'Ida: Moreras - Primero de Mayo', lat: 40.03534883619025, lon: -3.5927056078955077, line: 'L1', order: 9 },
    { name: 'Primero de Mayo - Polideportivo (Ida 1)', street: 'Ida: Primero de Mayo - Polideportivo', lat: 40.0340311834769, lon: -3.5925734076600873, line: 'L1', order: 10 },
    { name: 'Gta. Nuevo Aranjuez - Cuarteles', street: 'Gta. Nuevo Aranjuez - Cuarteles', lat: 40.032474047885074, lon: -3.593057567495322, line: 'L1', order: 11 },
    { name: 'Primero de Mayo - Polideportivo (Ida 2)', street: 'Primero de Mayo - Polideportivo', lat: 40.03406600817077, lon: -3.592777158985715, line: 'L1', order: 12 },
    { name: 'Moreras - Colegio', street: 'Moreras - Colegio', lat: 40.035068365135686, lon: -3.5894366423002553, line: 'L1', order: 13 },
    { name: 'Moreras - Augusto Moreno', street: 'Moreras - Augusto Moreno', lat: 40.034739269543984, lon: -3.584642380934511, line: 'L1', order: 14 },
    { name: 'Caramillar - Noria', street: 'Caramillar - Noria', lat: 40.035964645939636, lon: -3.5786712370382796, line: 'L1', order: 15 },
    { name: 'Estudios Cinematográficos - Mediodía', street: 'Estudios Cinematográficos - Mediodía', lat: 40.03802218441581, lon: -3.5783529216967502, line: 'L1', order: 16 },
    { name: 'Cecilio Lázaro - Víctimas del Terrorismo', street: 'Cecilio Lázaro - Víctimas del Terrorismo', lat: 40.03595520260203, lon: -3.580360462178551, line: 'L1', order: 17 },
    { name: 'Moreras - Julio Valdeón', street: 'Moreras - Julio Valdeón', lat: 40.034847833908266, lon: -3.584197933343236, line: 'L1', order: 18 },
    { name: 'Álvarez de Quindos - Cándido López', street: 'Álvarez de Quindos - Cándido López', lat: 40.03478410485926, lon: -3.587831529648191, line: 'L1', order: 19 },
    { name: 'Alvarez de Quindos - Cuarteles', street: 'Alvarez de Quindos - Cuarteles', lat: 40.03296245281095, lon: -3.5894437045079615, line: 'L1', order: 20 },
    { name: 'Gta. Nuevo Aranjuez - Primero de Mayo', street: 'Gta. Nuevo Aranjuez - Primero de Mayo', lat: 40.03272061274892, lon: -3.5920257314957924, line: 'L1', order: 21 },
    // Vuelta
    { name: 'Primero de Mayo - Polideportivo (Vuelta)', street: 'Vuelta: Primero de Mayo - Polideportivo', lat: 40.03412533341811, lon: -3.5930556996904226, line: 'L1', order: 22 },
    { name: 'Moreras - Primero de Mayo (Vuelta)', street: 'Vuelta: Moreras - Primero de Mayo', lat: 40.03523075252211, lon: -3.59272572446297, line: 'L1', order: 23 },
    { name: 'Moreras - Ancha (Vuelta)', street: 'Vuelta: Moreras - Ancha', lat: 40.0353873416899, lon: -3.5946870934416406, line: 'L1', order: 24 },
    { name: 'Príncipe - Iglesia', street: 'Príncipe - Iglesia', lat: 40.03581706159243, lon: -3.5984277112307295, line: 'L1', order: 25 },
    { name: 'Infantas - Capitán Angosto Gómez', street: 'Infantas - Capitán Angosto Gómez', lat: 40.03488880262144, lon: -3.6009081299288312, line: 'L1', order: 26 },
    { name: 'Rey - Auditorio', street: 'Rey - Auditorio', lat: 40.03252200921908, lon: -3.600089048684796, line: 'L1', order: 27 },
    { name: 'Gobernador - Almíbar', street: 'Gobernador - Almíbar', lat: 40.03242471324906, lon: -3.6022663388154252, line: 'L1', order: 28 },
    { name: 'Gobernador - Mercado de Abastos', street: 'Gobernador - Mercado de Abastos', lat: 40.03274182363451, lon: -3.6046414640261952, line: 'L1', order: 29 },
    { name: 'Gobernador - Valeras', street: 'Gobernador - Valeras', lat: 40.032895293680106, lon: -3.6080918756725655, line: 'L1', order: 30 },
    { name: 'Valeras - San Antonio (Vuelta)', street: 'Vuelta: Valeras - San Antonio', lat: 40.033707690940446, lon: -3.6086776906854703, line: 'L1', order: 31 },
    { name: 'Estación - Est. Aranjuez', street: 'Estación - Est. Aranjuez', lat: 40.03465769049544, lon: -3.617225658483494, line: 'L1', order: 32 },

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
  console.log('   - L1: 32 paradas | L2: 9 paradas | L3: 10 paradas | L4: 7 paradas | L5: 8 paradas');
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
