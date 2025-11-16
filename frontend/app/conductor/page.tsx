'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus } from 'lucide-react';
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
      setError('El código debe tener exactamente 6 dígitos');
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
    // Solo permitir números y máximo 6 dígitos
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError(''); // Limpiar error al escribir
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Botón volver */}
        <div className="mb-6">
          <BackButton href="/" />
        </div>

        {/* Tarjeta de autenticación con estilo oscuro */}
        <div className="card-dark p-8 rounded-2xl">
          {/* Icono y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-blue/20 rounded-2xl mb-4">
              <Bus size={32} className="text-neon-blue" />
            </div>
            <h1 className="text-2xl font-bold text-neon-blue mb-2">
              Acceso Conductor
            </h1>
            <p className="text-sm text-dark-text-muted">
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
              placeholder="123456"
              value={code}
              onChange={handleCodeChange}
              error={error}
              disabled={isLoading}
              autoFocus
              maxLength={6}
            />

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={code.length !== 6 || isLoading}
                className="pushable-access"
                style={{
                  width: '100%',
                  cursor: (code.length === 6 && !isLoading) ? 'pointer' : 'not-allowed',
                  opacity: (code.length === 6 && !isLoading) ? 1 : 0.7
                }}
              >
                <span className="shadow-access"></span>
                <span className="edge-access"></span>
                <span className="front-access">
                  {isLoading ? 'Validando...' : 'Acceder'}
                </span>
              </button>
            </div>
          </form>

          {/* Información adicional con estilo oscuro */}
          <div className="mt-6 p-4 bg-neon-blue bg-opacity-10 rounded-xl border border-neon-blue border-opacity-30 backdrop-blur-sm">
            <p className="text-xs text-white text-center">
              Por favor, recuerda detener la ubicación al realizar un descanso o terminar la jornada.
            </p>
          </div>
        </div>

        {/* Loading overlay con estilo oscuro */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card-dark p-8 rounded-2xl">
              <LoadingSpinner message="Validando código..." />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`

        /* Pushable button styles con efecto neón */
        .pushable-access {
          position: relative;
          background: transparent;
          padding: 0px;
          border: none;
          cursor: pointer;
          outline-offset: 4px;
          transition: filter 250ms;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          height: 56px;
        }

        .pushable-access:focus:not(:focus-visible) {
          outline: none;
        }

        /* Edge layer con sombra oscura */
        .edge-access {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          border-radius: 8px;
          background: #118ab2;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }

        /* Front layer con efecto neón */
        .front-access {
          display: block;
          position: relative;
          border-radius: 8px;
          padding: 16px 16px;
          color: #ffffffff;
          font-weight: 700;
          text-transform: none;
          font-size: 0.9rem;
          transform: translateY(-4px);
          transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1), box-shadow 300ms;
          background: #5ea6beff;
          box-shadow: 0 0 20px rgba(207, 207, 207, 0), 0 0 40px rgba(0, 2, 3, 0.3);
        }

        .pushable-access:disabled .front-access {
          background: #1a1f3a;
          color: #d8d8d8ff;
          box-shadow: none;
        }

        .pushable-access:active:not(:disabled) .front-access {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable-access:disabled:hover .front-access {
          transform: translateY(-4px);
        }

        .pushable-access:disabled:active .front-access {
          transform: translateY(-4px);
        }
      `}</style>
    </main>
  );
}
