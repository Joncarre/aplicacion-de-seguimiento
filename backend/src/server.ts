import app from './app';
import { Server } from 'http';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3001;

// Crear servidor HTTP
const server: Server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚌 Servidor de Autobuses Aranjuez');
  console.log('='.repeat(50));
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Manejo de errores del servidor
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso`);
  } else {
    console.error('❌ Error del servidor:', error);
  }
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default server;
