import { Router } from 'express';
import {
  submitLocation,
  assignLineToSession,
  endDriverSession,
  getLocationsByLine,
  getBusLines,
  manualCleanup,
  getStats,
} from '../controllers/location.controller';

const router = Router();

// GET /api/lines - Obtener todas las líneas
router.get('/lines', getBusLines);

// POST /api/location - Enviar ubicación del conductor
router.post('/location', submitLocation);

// PUT /api/session/:sessionId/line - Asignar línea a sesión
router.put('/session/:sessionId/line', assignLineToSession);

// PUT /api/session/:sessionId/end - Finalizar sesión
router.put('/session/:sessionId/end', endDriverSession);

// GET /api/location/line/:lineId - Obtener ubicaciones de una línea
router.get('/location/line/:lineId', getLocationsByLine);

// POST /api/admin/cleanup - Limpieza manual (TODO: proteger)
router.post('/admin/cleanup', manualCleanup);

// GET /api/admin/stats - Estadísticas (TODO: proteger)
router.get('/admin/stats', getStats);

export default router;
