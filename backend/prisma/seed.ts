import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear las 4 líneas de autobús
  const lines = [
    { name: 'L1', color: '#86efac', description: 'Línea 1' },
    { name: 'L2', color: '#6ee7b7', description: 'Línea 2' },
    { name: 'L3', color: '#5eead4', description: 'Línea 3' },
    { name: 'L4', color: '#7dd3fc', description: 'Línea 4' },
  ];

  console.log('📍 Creando líneas de autobús...');

  for (const line of lines) {
    const created = await prisma.busLine.upsert({
      where: { name: line.name },
      update: {},
      create: line,
    });
    console.log(`✅ Línea ${created.name} creada`);
  }

  console.log('');
  console.log('✅ Seed completado!');
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('   1. Ejecuta: npm run generate-codes');
  console.log('   2. Añade las paradas de cada línea (Fase 4)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
