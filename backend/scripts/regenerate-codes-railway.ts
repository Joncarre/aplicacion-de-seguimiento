import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Script para regenerar códigos directamente en Railway
// Uso: Establece DATABASE_URL en .env apuntando a Railway antes de ejecutar

const prisma = new PrismaClient();

async function regenerateDriverCodes(count: number = 30) {
    console.log('='.repeat(60));
    console.log('🔐 Regenerador de Códigos de Conductor para Railway');
    console.log('='.repeat(60));
    console.log('');
    console.log(`📊 Conectando a: ${process.env.DATABASE_URL ? 'Base de datos configurada' : 'ERROR: DATABASE_URL no configurada'}`);
    console.log('');

    try {
        // Verificar conexión
        await prisma.$connect();
        console.log('✅ Conexión establecida');
        console.log('');

        // Eliminar todos los códigos existentes
        console.log('🗑️  Eliminando códigos existentes...');
        const deletedCount = await prisma.driverCode.deleteMany({});
        console.log(`✅ ${deletedCount.count} códigos eliminados de la BD`);
        console.log('');

        console.log(`📊 Generando ${count} códigos nuevos...`);
        const codes: string[] = [];
        const bcryptRounds = 10;

        // Generar códigos únicos
        const plainCodes = new Set<string>();

        while (plainCodes.size < count) {
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += Math.floor(Math.random() * 10);
            }
            plainCodes.add(code);
        }

        console.log('✅ Códigos únicos generados');
        console.log('🔒 Hasheando y guardando códigos...');

        // Hashear y guardar códigos uno por uno
        let savedCount = 0;
        for (const plain of plainCodes) {
            const hashed = await bcrypt.hash(plain, bcryptRounds);
            await prisma.driverCode.create({
                data: {
                    code: hashed,
                    isActive: true,
                }
            });
            codes.push(plain);
            savedCount++;
            if (savedCount % 5 === 0) {
                console.log(`   Procesados ${savedCount}/${count} códigos...`);
            }
        }

        console.log('');
        console.log(`✅ ${savedCount} códigos guardados en BD de Railway`);
        console.log('');
        console.log('='.repeat(60));
        console.log('📋 CÓDIGOS GENERADOS (guárdalos en un lugar seguro):');
        console.log('='.repeat(60));
        console.log('');

        codes.forEach((code, index) => {
            console.log(`Código ${(index + 1).toString().padStart(2, '0')}: ${code}`);
        });

        console.log('');
        console.log('='.repeat(60));
        console.log('✅ Proceso completado exitosamente');
        console.log('='.repeat(60));
        console.log('');
        console.log('⚠️  IMPORTANTE: Guarda estos códigos ahora, no se guardarán en archivo');
        console.log('');

    } catch (error) {
        console.error('❌ Error regenerando códigos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar script
const count = process.argv[2] ? parseInt(process.argv[2]) : 30;

if (isNaN(count) || count < 1 || count > 100) {
    console.error('❌ Error: El número de códigos debe estar entre 1 y 100');
    process.exit(1);
}

regenerateDriverCodes(count)
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
