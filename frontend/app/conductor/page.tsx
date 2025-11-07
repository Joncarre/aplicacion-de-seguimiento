'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { validateDriverCode } from '@/lib/utils';
import { api } from '@/lib/api';
import { Lock } from 'lucide-react';

export default function ConductorAuthPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación del código
    if (!validateDriverCode(code)) {
      setError('El código debe tener exactamente 10 dígitos');
      return;
    }

    setIsLoading(true);

    try {
      // Validar código con el backend
      const response = await api.validateCode(code);

      if (response.success) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('sessionId', response.data.sessionId);

        // Redirigir al panel de conductor
        router.push('/conductor/panel');
      } else {
        setError('Código inválido');
      }
    } catch (err: any) {
      console.error('Error validando código:', err);
      setError(err.message || 'Error al validar el código. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y máximo 10 dígitos
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCode(value);
    setError(''); // Limpiar error al escribir
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Botón volver */}
        <div className="mb-6">
          <BackButton href="/" />
        </div>

        {/* Tarjeta de autenticación */}
        <Card>
          {/* Icono y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl mb-4 shadow-lg">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Acceso de Conductor
            </h1>
            <p className="text-sm text-text-muted">
              Introduce tu código de conductor
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Código de conductor"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="12345"
              value={code}
              onChange={handleCodeChange}
              error={error}
              disabled={isLoading}
              autoFocus
              maxLength={10}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={code.length !== 10 || isLoading}
            >
              {isLoading ? 'Validando...' : 'Acceder'}
            </Button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-xs text-text-secondary text-center">
              Por favor, recuerda detener la ubicación al realizar un descanso o terminar la jornada.
            </p>
          </div>
        </Card>

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-8">
              <LoadingSpinner message="Validando código..." />
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
