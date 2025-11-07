// Constantes de la aplicación

// Coordenadas de Aranjuez
export const ARANJUEZ_BOUNDS = {
  minLat: parseFloat(process.env.LOCATION_MIN_LAT || '39.95'),
  maxLat: parseFloat(process.env.LOCATION_MAX_LAT || '40.10'),
  minLng: parseFloat(process.env.LOCATION_MIN_LNG || '-3.70'),
  maxLng: parseFloat(process.env.LOCATION_MAX_LNG || '-3.50'),
};

// Configuración de ubicaciones
export const LOCATION_CONFIG = {
  UPDATE_INTERVAL: parseInt(process.env.LOCATION_UPDATE_INTERVAL || '10000'), // 10 segundos
  DIRECTION_DETECTION_DELAY: parseInt(process.env.DIRECTION_DETECTION_DELAY || '20000'), // 20 segundos
  MAX_ACCURACY_METERS: 100, // Precisión máxima aceptable
};

// Configuración de sesiones
export const SESSION_CONFIG = {
  EXPIRATION_HOURS: 8,
  CLEANUP_INTERVAL_HOURS: 24,
};

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  INVALID_CODE: 'Código inválido',
  CODE_IN_USE: 'Este código ya está en uso',
  CODE_NOT_FOUND: 'Código no encontrado',
  INVALID_COORDINATES: 'Coordenadas inválidas',
  SESSION_EXPIRED: 'Sesión expirada',
  UNAUTHORIZED: 'No autorizado',
  INTERNAL_ERROR: 'Error interno del servidor',
};
