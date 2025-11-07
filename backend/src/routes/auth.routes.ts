import { Router } from 'express';
import { validateCode, validateSession, endSession } from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/validate-code
 * Valida un código de conductor y crea una sesión
 * 
 * Body:
 * {
 *   "code": "1234567890"
 * }
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Código validado correctamente",
 *   "data": {
 *     "token": "uuid",
 *     "sessionId": "uuid"
 *   }
 * }
 * 
 * Response 401:
 * {
 *   "error": "Código inválido" | "Este código ya está en uso"
 * }
 */
router.post('/validate-code', validateCode);

/**
 * POST /api/auth/validate-session
 * Valida que un token de sesión sea válido
 * 
 * Body:
 * {
 *   "token": "uuid"
 * }
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Sesión válida",
 *   "data": {
 *     "sessionId": "uuid",
 *     "isActive": true,
 *     "expiresAt": "2025-11-06T20:00:00.000Z"
 *   }
 * }
 */
router.post('/validate-session', validateSession);

/**
 * POST /api/auth/end-session
 * Finaliza una sesión de conductor
 * 
 * Body:
 * {
 *   "token": "uuid"
 * }
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Sesión finalizada correctamente"
 * }
 */
router.post('/end-session', endSession);

export default router;
