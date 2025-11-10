'use client';

import Link from 'next/link';
import { User, Bus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Título principal */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            Autobuses Aranjuez
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Seguimiento en tiempo real
          </p>
        </div>

        {/* Tarjetas de selección */}
        <div className="space-y-4">
          {/* Opción: Soy Usuario */}
          <Link href="/usuario" className="block">
            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-text-primary mb-1">
                    Soy usuario
                  </h2>
                  <p className="text-sm text-text-muted">
                    Consulta horarios y ubicaciones
                  </p>
                </div>
                <div className="text-accent-primary">
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
            </Card>
          </Link>

          {/* Opción: Soy Conductor */}
          <Link href="/conductor" className="block">
            <Card hover className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bus size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-text-primary mb-1">
                    Soy conductor
                  </h2>
                  <p className="text-sm text-text-muted">
                    Accede al panel de conductor
                  </p>
                </div>
                <div className="text-accent-primary">
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
            </Card>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-text-muted">
            All rights reserved © 2025 Jonathan Carrero
          </p>
          <p className="text-xs text-text-muted mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </main>
  );
}
