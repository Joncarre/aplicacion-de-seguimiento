import { Router } from 'express';
import etaController from '../controllers/eta.controller';

const router = Router();

/**
 * GET /api/eta/:lineId/:stopId
 * Obtiene los tiempos estimados de llegada para una parada específica
 * 
 * Parámetros:
 * - lineId: ID de la línea de autobús
 * - stopId: ID de la parada
 * 
 * Respuesta exitosa:
 * {
 *   success: true,
 *   data: [
 *     {
 *       sessionId: string,
 *       estimatedMinutes: number,
 *       distanceMeters: number,
 *       isApproaching: boolean,
 *       currentStopOrder: number | null,
 *       nextStopOrder: number | null
 *     }
 *   ]
 * }
 */
router.get('/:lineId/:stopId', etaController.getETAsForStop);

export default router;
