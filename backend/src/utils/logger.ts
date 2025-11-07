import winston from 'winston';

// Configurar el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'bus-tracking-api' },
  transports: [
    // Archivo para errores
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Archivo para todos los logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// En desarrollo, también mostrar en consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Función helper para registrar eventos
export function logEvent(event: {
  type: 'auth' | 'location' | 'error' | 'security' | 'info',
  message: string,
  metadata?: any
}) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: event.type,
    message: event.message,
    ...event.metadata
  };

  switch (event.type) {
    case 'error':
    case 'security':
      logger.error(logData);
      break;
    default:
      logger.info(logData);
  }
}

export default logger;
