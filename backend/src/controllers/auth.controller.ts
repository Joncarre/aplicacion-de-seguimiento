import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import { z } from 'zod';

// Schema de validación para el código
const ValidateCodeSchema = z.object({
  code: z.string()
    .length(10, 'El código debe tener 10 dígitos')
    .regex(/^\d{10}$/, 'El código solo debe contener dígitos')
});

// Schema para finalizar sesión
const EndSessionSchema = z.object({
  token: z.string().uuid('Token inválido')
});

/**
 * POST /api/auth/validate-code
 * Valida un código de conductor
 */
export async function validateCode(req: Request, res: Response) {
  try {
    // Validar datos de entrada
    const validation = ValidateCodeSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { code } = validation.data;

    // Validar código
    const result = await authService.validateCode(code);

    if (!result.valid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: result.message || ERROR_MESSAGES.INVALID_CODE
      });
    }

    // Crear sesión
    const session = await authService.createSession(result.codeId!);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Código validado correctamente',
      data: {
        token: session.token,
        sessionId: session.sessionId
      }
    });

  } catch (error) {
    console.error('Error en validateCode:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
}

/**
 * POST /api/auth/validate-session
 * Valida un token de sesión
 */
export async function validateSession(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Token requerido'
      });
    }

    const result = await authService.validateSession(token);

    if (!result.valid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.SESSION_EXPIRED
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sesión válida',
      data: {
        sessionId: result.session.id,
        isActive: result.session.isActive,
        expiresAt: result.session.expiresAt
      }
    });

  } catch (error) {
    console.error('Error en validateSession:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
}

/**
 * POST /api/auth/end-session
 * Finaliza una sesión de conductor
 */
export async function endSession(req: Request, res: Response) {
  try {
    // Validar datos de entrada
    const validation = EndSessionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { token } = validation.data;

    await authService.endSession(token);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sesión finalizada correctamente'
    });

  } catch (error) {
    console.error('Error en endSession:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
}
