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
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/lines - Obtener todas las líneas
router.get('/lines', getBusLines);

// GET /api/lines/:lineId/stops - Obtener paradas de una línea
router.get('/lines/:lineId/stops', async (req, res) => {
  try {
    const { lineId } = req.params;

    const stopsOnLine = await prisma.stopOnLine.findMany({
      where: { lineId },
      include: {
        stop: true,
      },
      orderBy: { order: 'asc' },
    });

    const stops = stopsOnLine.map((sol) => ({
      id: sol.stop.id,
      name: sol.stop.name,
      street: sol.stop.street,
      latitude: sol.stop.latitude,
      longitude: sol.stop.longitude,
      order: sol.order,
    }));

    return res.json(stops);
  } catch (error) {
    console.error('Error al obtener paradas:', error);
    return res.status(500).json({ error: 'Error al obtener paradas' });
  }
});

// GET /api/bus-location/:lineId/latest - Obtener última ubicación de un bus en una línea
router.get('/bus-location/:lineId/latest', async (req, res) => {
  try {
    const { lineId } = req.params;

    const latestLocation = await prisma.busLocation.findFirst({
      where: {
        lineId,
        session: {
          isActive: true,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!latestLocation) {
      return res.status(404).json({ message: 'No hay buses activos en esta línea' });
    }

    return res.json(latestLocation);
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    return res.status(500).json({ error: 'Error al obtener ubicación' });
  }
});

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
