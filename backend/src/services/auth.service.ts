import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SESSION_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import { logEvent } from '../utils/logger';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Valida un código de conductor
   * @param code - Código de 10 dígitos
   * @returns true si el código es válido, false si no
   */
  async validateCode(code: string): Promise<{ valid: boolean; codeId?: string; message?: string }> {
    try {
      // 1. Buscar todos los códigos activos
      const driverCodes = await prisma.driverCode.findMany({
        where: { isActive: true }
      });

      // 2. Verificar el código contra cada hash
      let matchedCodeId: string | null = null;

      for (const driverCode of driverCodes) {
        const isMatch = await bcrypt.compare(code, driverCode.code);
        if (isMatch) {
          matchedCodeId = driverCode.id;
          break;
        }
      }

      if (!matchedCodeId) {
        logEvent({
          type: 'security',
          message: 'Intento de autenticación con código inválido',
          metadata: { code: code.substring(0, 3) + '***' }
        });
        return { valid: false, message: ERROR_MESSAGES.INVALID_CODE };
      }

      // 3. Verificar que no haya una sesión activa con este código
      const activeSession = await this.checkActiveSession(matchedCodeId);
      
      if (activeSession) {
        logEvent({
          type: 'security',
          message: 'Intento de uso de código ya en uso',
          metadata: { codeId: matchedCodeId }
        });
        return { valid: false, message: ERROR_MESSAGES.CODE_IN_USE };
      }

      logEvent({
        type: 'auth',
        message: 'Código validado correctamente',
        metadata: { codeId: matchedCodeId }
      });

      return { valid: true, codeId: matchedCodeId };

    } catch (error) {
      logEvent({
        type: 'error',
        message: 'Error validando código',
        metadata: { error }
      });
      throw error;
    }
  }

  /**
   * Crea una sesión para un conductor
   * @param codeId - ID del código de conductor
   * @returns Token de sesión
   */
  async createSession(codeId: string): Promise<{ token: string; sessionId: string }> {
    try {
      // Generar token único
      const token = crypto.randomUUID();

      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SESSION_CONFIG.EXPIRATION_HOURS);

      // Crear sesión en BD
      const session = await prisma.session.create({
        data: {
          token,
          codeId,
          isActive: true,
          expiresAt,
        }
      });

      logEvent({
        type: 'auth',
        message: 'Sesión creada',
        metadata: { 
          sessionId: session.id,
          codeId,
          expiresAt: expiresAt.toISOString()
        }
      });

      return {
        token,
        sessionId: session.id
      };

    } catch (error) {
      logEvent({
        type: 'error',
        message: 'Error creando sesión',
        metadata: { error, codeId }
      });
      throw error;
    }
  }

  /**
   * Verifica si existe una sesión activa para un código
   * @param codeId - ID del código
   * @returns true si hay sesión activa
   */
  async checkActiveSession(codeId: string): Promise<boolean> {
    const activeSession = await prisma.session.findFirst({
      where: {
        codeId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return !!activeSession;
  }

  /**
   * Valida un token de sesión
   * @param token - Token de sesión
   * @returns Datos de la sesión si es válida
   */
  async validateSession(token: string): Promise<{ valid: boolean; session?: any }> {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          code: true
        }
      });

      if (!session) {
        return { valid: false };
      }

      // Verificar que la sesión esté activa
      if (!session.isActive) {
        return { valid: false };
      }

      // Verificar que no haya expirado
      if (session.expiresAt < new Date()) {
        // Marcar como inactiva
        await prisma.session.update({
          where: { id: session.id },
          data: { isActive: false, endedAt: new Date() }
        });
        return { valid: false };
      }

      return { valid: true, session };

    } catch (error) {
      logEvent({
        type: 'error',
        message: 'Error validando sesión',
        metadata: { error }
      });
      return { valid: false };
    }
  }

  /**
   * Finaliza una sesión
   * @param token - Token de sesión
   */
  async endSession(token: string): Promise<void> {
    try {
      const session = await prisma.session.findUnique({
        where: { token }
      });

      if (session) {
        await prisma.session.update({
          where: { id: session.id },
          data: {
            isActive: false,
            endedAt: new Date()
          }
        });

        logEvent({
          type: 'auth',
          message: 'Sesión finalizada',
          metadata: { sessionId: session.id }
        });
      }
    } catch (error) {
      logEvent({
        type: 'error',
        message: 'Error finalizando sesión',
        metadata: { error, token }
      });
      throw error;
    }
  }

  /**
   * Limpia sesiones expiradas (para ejecutar periódicamente)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.session.updateMany({
        where: {
          isActive: true,
          expiresAt: {
            lt: new Date()
          }
        },
        data: {
          isActive: false,
          endedAt: new Date()
        }
      });

      if (result.count > 0) {
        logEvent({
          type: 'info',
          message: 'Sesiones expiradas limpiadas',
          metadata: { count: result.count }
        });
      }

      return result.count;
    } catch (error) {
      logEvent({
        type: 'error',
        message: 'Error limpiando sesiones expiradas',
        metadata: { error }
      });
      throw error;
    }
  }
}

export default new AuthService();
