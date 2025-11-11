import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware de autenticación admin (simple - puedes mejorarlo)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const adminAuth = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username !== 'admin' || password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Credenciales inválidas' });
  }

  next();
};

// GET todas las paradas
router.get('/stops', adminAuth, async (req, res) => {
  try {
    const lineId = req.query.lineId as string | undefined;

    if (lineId) {
      // Paradas de una línea específica
      const stopsOnLine = await prisma.stopOnLine.findMany({
        where: { lineId },
        include: {
          stop: true,
          line: true,
        },
        orderBy: { order: 'asc' },
      });

      return res.json(stopsOnLine);
    }

    // Todas las paradas
    const stops = await prisma.stop.findMany({
      include: {
        lines: {
          include: {
            line: true,
          },
        },
      },
    });

    res.json(stops);
  } catch (error) {
    console.error('Error al obtener paradas:', error);
    res.status(500).json({ error: 'Error al obtener paradas' });
  }
});

// GET una parada específica
router.get('/stops/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const stop = await prisma.stop.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            line: true,
          },
        },
      },
    });

    if (!stop) {
      return res.status(404).json({ error: 'Parada no encontrada' });
    }

    res.json(stop);
  } catch (error) {
    console.error('Error al obtener parada:', error);
    res.status(500).json({ error: 'Error al obtener parada' });
  }
});

// POST crear nueva parada
router.post('/stops', adminAuth, async (req, res) => {
  try {
    const { name, street, latitude, longitude, lineId, order } = req.body;

    // Validaciones
    if (!name || !street || !latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: name, street, latitude, longitude' 
      });
    }

    // Crear parada
    const stop = await prisma.stop.create({
      data: {
        name,
        street,
        latitude,
        longitude,
      },
    });

    // Si se especifica lineId, asociar la parada a la línea
    if (lineId) {
      // Determinar el orden si no se especifica
      let stopOrder = order;
      if (!stopOrder) {
        const lastStop = await prisma.stopOnLine.findFirst({
          where: { lineId },
          orderBy: { order: 'desc' },
        });
        stopOrder = (lastStop?.order || 0) + 1;
      }

      await prisma.stopOnLine.create({
        data: {
          stopId: stop.id,
          lineId,
          order: stopOrder,
        },
      });
    }

    // Devolver la parada con sus relaciones
    const stopWithLines = await prisma.stop.findUnique({
      where: { id: stop.id },
      include: {
        lines: {
          include: {
            line: true,
          },
        },
      },
    });

    res.status(201).json(stopWithLines);
  } catch (error) {
    console.error('Error al crear parada:', error);
    res.status(500).json({ error: 'Error al crear parada' });
  }
});

// PUT actualizar parada
router.put('/stops/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, street, latitude, longitude } = req.body;

    const stop = await prisma.stop.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(street && { street }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
      },
      include: {
        lines: {
          include: {
            line: true,
          },
        },
      },
    });

    res.json(stop);
  } catch (error) {
    console.error('Error al actualizar parada:', error);
    res.status(500).json({ error: 'Error al actualizar parada' });
  }
});

// DELETE eliminar parada
router.delete('/stops/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.stop.delete({
      where: { id },
    });

    res.json({ message: 'Parada eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar parada:', error);
    res.status(500).json({ error: 'Error al eliminar parada' });
  }
});

// POST asignar parada a línea
router.post('/stops/:stopId/lines/:lineId', adminAuth, async (req, res) => {
  try {
    const { stopId, lineId } = req.params;
    const { order } = req.body;

    // Determinar el orden si no se especifica
    let stopOrder = order;
    if (!stopOrder) {
      const lastStop = await prisma.stopOnLine.findFirst({
        where: { lineId },
        orderBy: { order: 'desc' },
      });
      stopOrder = (lastStop?.order || 0) + 1;
    }

    const stopOnLine = await prisma.stopOnLine.create({
      data: {
        stopId,
        lineId,
        order: stopOrder,
      },
      include: {
        stop: true,
        line: true,
      },
    });

    res.status(201).json(stopOnLine);
  } catch (error) {
    console.error('Error al asignar parada a línea:', error);
    res.status(500).json({ error: 'Error al asignar parada a línea' });
  }
});

// DELETE desasignar parada de línea
router.delete('/stops/:stopId/lines/:lineId', adminAuth, async (req, res) => {
  try {
    const { stopId, lineId } = req.params;

    await prisma.stopOnLine.deleteMany({
      where: {
        stopId,
        lineId,
      },
    });

    res.json({ message: 'Parada desasignada de la línea correctamente' });
  } catch (error) {
    console.error('Error al desasignar parada de línea:', error);
    res.status(500).json({ error: 'Error al desasignar parada de línea' });
  }
});

// PUT actualizar orden de parada en una línea
router.put('/stops/:stopId/lines/:lineId/order', adminAuth, async (req, res) => {
  try {
    const { stopId, lineId } = req.params;
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({ error: 'El campo order es requerido' });
    }

    const stopOnLine = await prisma.stopOnLine.updateMany({
      where: {
        stopId,
        lineId,
      },
      data: {
        order,
      },
    });

    res.json({ message: 'Orden actualizado correctamente', stopOnLine });
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
});

export default router;
