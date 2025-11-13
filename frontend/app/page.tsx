'use client';

import Link from 'next/link';
import { User, Bus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Título principal con efecto neón */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-neon-green mb-3 glow-text whitespace-nowrap">
            Autobuses Aranjuez
          </h1>
          <p className="text-dark-text-secondary text-sm md:text-base">
            Seguimiento en tiempo real
          </p>
        </div>

        {/* Tarjetas de selección con estilo oscuro */}
        <div className="space-y-4">
          {/* Opción: Soy Usuario */}
          <Link href="/usuario" className="block group">
            <div className="card-dark p-6 rounded-2xl cursor-pointer transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-neon-green/20 rounded-2xl flex items-center justify-center">
                  <User size={32} className="text-neon-green" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-dark-text-primary mb-1 transition-colors">
                    Soy usuario
                  </h2>
                  <p className="text-sm text-dark-text-muted">
                    Consulta horarios y ubicaciones
                  </p>
                </div>
                <div className="text-neon-green transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Opción: Soy Conductor */}
          <Link href="/conductor" className="block group">
            <div className="card-dark p-6 rounded-2xl cursor-pointer transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center">
                  <Bus size={32} className="text-neon-blue" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-dark-text-primary mb-1 transition-colors">
                    Soy conductor
                  </h2>
                  <p className="text-sm text-dark-text-muted">
                    Accede al panel de conductor
                  </p>
                </div>
                <div className="text-neon-blue transition-transform">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer con estilo oscuro */}
        <div className="mt-12 text-center">
          <p className="text-xs text-dark-text-muted">
            All rights reserved © 2025 Jonathan Carrero
          </p>
          <p className="text-xs text-dark-text-muted mt-1 opacity-70">
            Version 1.0.0
          </p>
        </div>
      </div>
    </main>
  );
}
