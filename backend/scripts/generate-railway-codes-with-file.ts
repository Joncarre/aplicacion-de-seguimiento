import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function showRailwayCodes() {
    console.log('='.repeat(70));
    console.log('ATENCIÓN: Los códigos YA están en Railway (30 códigos activos)');
    console.log('Este script genera NUEVOS códigos y los muestra.');
    console.log('¿Quieres REEMPLAZAR los códigos actuales? (Ctrl+C para cancelar)');
    console.log('='.repeat(70));
    console.log('Esperando 5 segundos...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\nContinuando...\n');

    try {
        await prisma.$connect();

        // Eliminar códigos existentes
        console.log('🗑️  Eliminando códigos existentes de Railway...');
        await prisma.driverCode.deleteMany({});
        console.log('✅ Códigos eliminados\n');

        // Generar nuevos códigos
        console.log('📊 Generando 30 códigos nuevos...\n');
        const plainCodes = new Set<string>();

        while (plainCodes.size < 30) {
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += Math.floor(Math.random() * 10);
            }
            plainCodes.add(code);
        }

        const codesArray = Array.from(plainCodes);

        // Hashear y guardar
        console.log('🔒 Guardando en Railway...\n');
        for (const plain of codesArray) {
            const hashed = await bcrypt.hash(plain, 10);
            await prisma.driverCode.create({
                data: { code: hashed, isActive: true }
            });
        }

        // Guardar en archivo local también
        const outputDir = path.join(process.cwd(), 'generated');
        const outputFile = path.join(outputDir, 'railway-codes.txt');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        let fileContent = '='.repeat(70) + '\n';
        fileContent += 'CÓDIGOS DE CONDUCTOR - RAILWAY (PRODUCCIÓN)\n';
        fileContent += '='.repeat(70) + '\n';
        fileContent += `Generados: ${new Date().toLocaleString('es-ES')}\n`;
        fileContent += `Total: 30 códigos\n`;
        fileContent += '='.repeat(70) + '\n\n';

        codesArray.forEach((code, index) => {
            fileContent += `Código ${(index + 1).toString().padStart(2, '0')}: ${code}\n`;
        });

        fileContent += '\n' + '='.repeat(70) + '\n';

        fs.writeFileSync(outputFile, fileContent, 'utf-8');

        console.log('✅ 30 códigos guardados en Railway\n');
        console.log('='.repeat(70));
        console.log('📋 CÓDIGOS GENERADOS:');
        console.log('='.repeat(70));
        console.log('');

        codesArray.forEach((code, index) => {
            console.log(`Código ${(index + 1).toString().padStart(2, '0')}: ${code}`);
        });

        console.log('');
        console.log('='.repeat(70));
        console.log(`✅ Códigos guardados en: ${outputFile}`);
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

showRailwayCodes();
