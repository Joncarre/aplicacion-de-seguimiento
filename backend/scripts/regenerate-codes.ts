import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Limpia todos los códigos existentes y genera nuevos
 */
async function regenerateDriverCodes(count: number = 30) {
    console.log('='.repeat(60));
    console.log('🔐 Regenerador de Códigos de Conductor');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Eliminar todos los códigos existentes
        console.log('🗑️  Eliminando códigos existentes...');
        const deletedCount = await prisma.driverCode.deleteMany({});
        console.log(`✅ ${deletedCount.count} códigos eliminados de la BD`);
        console.log('');

        console.log(`📊 Generando ${count} códigos nuevos...`);
        console.log('');

        const codes: { plain: string; hashed: string }[] = [];
        const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');

        // Generar códigos únicos
        const plainCodes = new Set<string>();

        while (plainCodes.size < count) {
            // Generar código de 6 dígitos
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += Math.floor(Math.random() * 10);
            }
            plainCodes.add(code);
        }

        console.log('✅ Códigos únicos generados');
        console.log('🔒 Hasheando códigos...');

        // Hashear códigos
        for (const plain of plainCodes) {
            const hashed = await bcrypt.hash(plain, bcryptRounds);
            codes.push({ plain, hashed });
        }

        console.log('✅ Códigos hasheados');
        console.log('💾 Guardando en base de datos...');

        // Guardar en base de datos
        let savedCount = 0;
        for (const { hashed } of codes) {
            await prisma.driverCode.create({
                data: {
                    code: hashed,
                    isActive: true,
                }
            });
            savedCount++;
        }

        console.log(`✅ ${savedCount} códigos guardados en BD`);
        console.log('');

        // Exportar códigos a archivo
        const outputDir = path.join(process.cwd(), 'generated');
        const outputFile = path.join(outputDir, 'driver-codes.txt');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(outputDir, `driver-codes-${timestamp}.txt`);

        // Crear directorio si no existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Crear contenido del archivo
        let fileContent = '='.repeat(70) + '\n';
        fileContent += '          CÓDIGOS DE CONDUCTOR - AUTOBUSES ARANJUEZ\n';
        fileContent += '='.repeat(70) + '\n';
        fileContent += `Generados: ${new Date().toLocaleString('es-ES')}\n`;
        fileContent += `Total: ${codes.length} códigos\n`;
        fileContent += '='.repeat(70) + '\n\n';
        fileContent += '⚠️  IMPORTANTE:\n';
        fileContent += '   - Guarda este archivo en un lugar seguro\n';
        fileContent += '   - Entrega UN código a cada conductor\n';
        fileContent += '   - NO compartas estos códigos públicamente\n';
        fileContent += '   - Cada código solo puede usarse por un conductor a la vez\n';
        fileContent += '\n' + '='.repeat(70) + '\n\n';

        // Añadir códigos numerados
        codes.forEach((code, index) => {
            fileContent += `Código ${(index + 1).toString().padStart(2, '0')}: ${code.plain}\n`;
        });

        fileContent += '\n' + '='.repeat(70) + '\n';
        fileContent += 'Fin de la lista de códigos\n';
        fileContent += '='.repeat(70) + '\n';

        // Guardar archivo principal
        fs.writeFileSync(outputFile, fileContent, 'utf-8');

        // Guardar backup con timestamp
        fs.writeFileSync(backupFile, fileContent, 'utf-8');

        console.log('📄 Códigos exportados a archivos:');
        console.log(`   - ${outputFile}`);
        console.log(`   - ${backupFile}`);
        console.log('');
        console.log('='.repeat(60));
        console.log('✅ Proceso completado exitosamente');
        console.log('='.repeat(60));
        console.log('');
        console.log('📋 PRÓXIMOS PASOS:');
        console.log('   1. Revisa el archivo generado en ./generated/driver-codes.txt');
        console.log('   2. Imprime o envía los códigos a cada conductor');
        console.log('   3. Guarda el backup en un lugar seguro');
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
