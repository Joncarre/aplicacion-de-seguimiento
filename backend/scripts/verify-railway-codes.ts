import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCodes() {
    try {
        await prisma.$connect();
        console.log('✅ Conectado a Railway');

        const total = await prisma.driverCode.count();
        const active = await prisma.driverCode.count({ where: { isActive: true } });

        console.log(`\nTotal de códigos: ${total}`);
        console.log(`Códigos activos: ${active}`);

        // Obtener los primeros 5 códigos para verificar
        const recentCodes = await prisma.driverCode.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, isActive: true, createdAt: true }
        });

        console.log('\nÚltimos 5 códigos creados:');
        recentCodes.forEach((code, i) => {
            console.log(`  ${i + 1}. ID: ${code.id.substring(0, 8)}... - Activo: ${code.isActive} - Fecha: ${code.createdAt}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyCodes();
