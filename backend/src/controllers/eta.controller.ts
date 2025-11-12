import { Request, Response } from 'express';
import etaService from '../services/eta.service';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

/**
 * GET /api/eta/:lineId/:stopId
 * Obtiene los ETAs calculados para una parada específica
 */
export async function getETAsForStop(req: Request, res: Response) {
  try {
    const { lineId, stopId } = req.params;

    if (!lineId || !stopId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'lineId y stopId son requeridos'
      });
    }

    const etas = await etaService.calculateETAsForStop(lineId, stopId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: etas
    });

  } catch (error) {
    console.error('Error obteniendo ETAs:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
}

export default {
  getETAsForStop
};
