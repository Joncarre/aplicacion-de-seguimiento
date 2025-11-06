# 🔒 Consideraciones de Seguridad

## Nivel de Seguridad

Este proyecto implementa **seguridad básica-intermedia**, apropiada para:
- Uso municipal/local
- Información no crítica
- Presupuesto limitado

## Amenazas Identificadas

### 1. Suplantación de Conductores
**Riesgo:** Usuarios maliciosos podrían intentar enviar ubicaciones falsas.

**Mitigación:**
- Códigos únicos de 10 dígitos
- Validación de código en cada conexión
- Códigos no reutilizables simultáneamente
- Registro de actividad por conductor

### 2. Inyección de Datos
**Riesgo:** Envío de coordenadas manipuladas o fuera de rango.

**Mitigación:**
```typescript
// Validación de coordenadas
function validateLocation(lat: number, lng: number): boolean {
  // Aranjuez está aproximadamente en:
  // Lat: 40.03° N, Lng: -3.60° W
  const ARANJUEZ_BOUNDS = {
    minLat: 39.95,
    maxLat: 40.10,
    minLng: -3.70,
    maxLng: -3.50
  };
  
  return (
    lat >= ARANJUEZ_BOUNDS.minLat &&
    lat <= ARANJUEZ_BOUNDS.maxLat &&
    lng >= ARANJUEZ_BOUNDS.minLng &&
    lng <= ARANJUEZ_BOUNDS.maxLng
  );
}
```

### 3. Ataques DDoS/Flood
**Riesgo:** Envío masivo de peticiones para saturar el servidor.

**Mitigación:**
```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 peticiones por minuto
  message: 'Demasiadas peticiones, intenta más tarde'
});

app.use('/api/', limiter);
```

### 4. Exposición de Códigos
**Riesgo:** Códigos de conductores podrían ser interceptados.

**Mitigación:**
- HTTPS obligatorio en producción
- Códigos hasheados en BD
- No enviar códigos en URLs
- Expiración de sesiones

### 5. XSS (Cross-Site Scripting)
**Riesgo:** Inyección de scripts maliciosos.

**Mitigación:**
- Sanitización de inputs
- Content Security Policy
- Escapado de HTML automático (React)

## Implementaciones de Seguridad

### 1. Autenticación de Conductores

```typescript
// backend/src/services/auth.service.ts
import bcrypt from 'bcrypt';

export class AuthService {
  async validateCode(code: string): Promise<boolean> {
    // 1. Buscar código en BD (hasheado)
    const driverCode = await prisma.driverCode.findFirst({
      where: { 
        code: await bcrypt.hash(code, 10),
        isActive: true 
      }
    });
    
    if (!driverCode) return false;
    
    // 2. Verificar que no esté en uso
    const activeSession = await this.checkActiveSession(driverCode.id);
    if (activeSession) return false;
    
    return true;
  }
  
  async createSession(codeId: string): Promise<string> {
    // Generar token de sesión
    const token = crypto.randomUUID();
    
    await prisma.session.create({
      data: {
        token,
        codeId,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas
      }
    });
    
    return token;
  }
}
```

### 2. Validación de Datos

```typescript
// backend/src/middleware/validation.middleware.ts
import { z } from 'zod';

// Schema para ubicación
const LocationSchema = z.object({
  latitude: z.number()
    .min(39.95)
    .max(40.10),
  longitude: z.number()
    .min(-3.70)
    .max(-3.50),
  timestamp: z.date(),
  accuracy: z.number().min(0).max(100)
});

export function validateLocation(req, res, next) {
  try {
    LocationSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Datos inválidos' });
  }
}
```

### 3. WebSocket Security

```typescript
// backend/src/socket/auth.socket.ts
import { Server } from 'socket.io';

export function setupSocketAuth(io: Server) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('No token provided'));
    }
    
    // Validar token
    const session = await validateSession(token);
    if (!session) {
      return next(new Error('Invalid token'));
    }
    
    // Adjuntar datos de sesión al socket
    socket.data.sessionId = session.id;
    socket.data.codeId = session.codeId;
    
    next();
  });
  
  // Limitar frecuencia de mensajes
  io.use((socket, next) => {
    let messageCount = 0;
    const resetInterval = setInterval(() => {
      messageCount = 0;
    }, 10000); // Reset cada 10s
    
    socket.on('conductor:location', () => {
      messageCount++;
      if (messageCount > 2) { // Max 2 mensajes por 10s
        socket.disconnect();
        clearInterval(resetInterval);
      }
    });
    
    next();
  });
}
```

### 4. Variables de Entorno

```bash
# .env.example
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/bus_tracking?schema=public"

# Servidor
PORT=3001
NODE_ENV=production

# Seguridad
JWT_SECRET=your-super-secret-key-change-in-production
SESSION_SECRET=another-secret-key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Códigos (para generar inicialmente)
ADMIN_KEY=your-admin-key-for-code-generation
```

### 5. Headers de Seguridad

```typescript
// backend/src/server.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

### 6. CORS Configurado

```typescript
// backend/src/server.ts
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Buenas Prácticas

### Backend

1. ✅ Nunca exponer errores detallados al cliente
2. ✅ Usar prepared statements (Prisma lo hace automáticamente)
3. ✅ Validar todos los inputs
4. ✅ Hashear códigos sensibles
5. ✅ Implementar rate limiting
6. ✅ Logs de auditoría para acciones de conductores
7. ✅ Limpiar datos antiguos regularmente

### Frontend

1. ✅ No almacenar códigos en localStorage
2. ✅ Usar HTTPS en producción
3. ✅ Validar datos antes de enviar
4. ✅ Timeout en peticiones
5. ✅ Manejo de errores apropiado
6. ✅ No mostrar información sensible en URLs

### Base de Datos

1. ✅ Usuario de BD con permisos mínimos necesarios
2. ✅ Backups regulares
3. ✅ Índices en columnas frecuentemente consultadas
4. ✅ Restricciones de integridad referencial
5. ✅ No almacenar códigos en texto plano

## Generación de Códigos

```typescript
// scripts/generate-codes.ts
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateDriverCodes(count: number = 30) {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generar código aleatorio de 10 dígitos
    let code = '';
    for (let j = 0; j < 10; j++) {
      code += Math.floor(Math.random() * 10);
    }
    
    // Verificar que no exista
    const exists = codes.includes(code);
    if (exists) {
      i--;
      continue;
    }
    
    codes.push(code);
    
    // Hashear y guardar en BD
    const hashedCode = await bcrypt.hash(code, 10);
    
    await prisma.driverCode.create({
      data: {
        code: hashedCode,
        plainCode: code, // Solo para entrega inicial, luego eliminar
        isActive: true
      }
    });
  }
  
  console.log('Códigos generados:', codes);
  
  // Exportar a archivo para entrega a conductores
  const fs = require('fs');
  fs.writeFileSync(
    'driver-codes.txt',
    codes.join('\n'),
    'utf-8'
  );
  
  console.log('Códigos guardados en driver-codes.txt');
}

generateDriverCodes(30);
```

## Monitoreo y Logs

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Eventos a registrar
export function logEvent(event: {
  type: 'auth' | 'location' | 'error' | 'security',
  message: string,
  metadata?: any
}) {
  logger.info({
    timestamp: new Date().toISOString(),
    ...event
  });
}

// Ejemplo de uso
logEvent({
  type: 'auth',
  message: 'Conductor autenticado',
  metadata: { codeId: 'xxx', ip: req.ip }
});
```

## Checklist de Seguridad

### Antes de Producción

- [ ] Cambiar todos los secrets por valores aleatorios
- [ ] Configurar HTTPS/SSL
- [ ] Habilitar CORS solo para dominio de producción
- [ ] Configurar rate limiting apropiado
- [ ] Implementar logs y monitoreo
- [ ] Realizar backup de BD
- [ ] Probar recuperación ante fallos
- [ ] Eliminar códigos en texto plano de BD
- [ ] Revisar variables de entorno
- [ ] Deshabilitar mensajes de error detallados
- [ ] Actualizar dependencias a últimas versiones
- [ ] Ejecutar audit de seguridad: `npm audit`

### Mantenimiento Regular

- [ ] Revisar logs semanalmente
- [ ] Rotar códigos de conductores cada 6 meses
- [ ] Actualizar dependencias mensualmente
- [ ] Ejecutar `npm audit` mensualmente
- [ ] Backup de BD semanal
- [ ] Limpiar datos antiguos (>7 días)

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**Nota:** Esta es una implementación de seguridad básica-intermedia. Para aplicaciones críticas o con información sensible, se recomienda contratar una auditoría de seguridad profesional.

**Última actualización:** Noviembre 2025
