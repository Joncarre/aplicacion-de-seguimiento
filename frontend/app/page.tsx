'use client';

import Link from 'next/link';
import { User, Bus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <main className="min-h-screen flex justify-center p-4 relative z-10">
      <style jsx>{`
        .hover-border-glow {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-border-glow:hover {
          border-color: rgba(6, 214, 160, 0.8);
          box-shadow: 0 0 20px rgba(6, 214, 160, 0.5);
        }
        .hover-border-glow-blue {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-border-glow-blue:hover {
          border-color: rgba(17, 138, 178, 0.8);
          box-shadow: 0 0 20px rgba(17, 138, 178, 0.5);
        }
      `}</style>
      <div className="w-full max-w-md animate-fadeIn">
        {/* Título principal con efecto neón */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-green mb-3 whitespace-nowrap">
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
            <div className="p-6 hover:bg-dark-bg-hover rounded-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover-border-glow">
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
            <div className="p-6 hover:bg-dark-bg-hover rounded-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover-border-glow-blue">
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
        <div className="mt-8 text-center">
          {/* Botón de feedback */}
          <Link
            href="/contacto"
            className="inline-block px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300"
          >
            Danos tu opinión
          </Link>

          <p className="text-xs text-dark-text-muted mt-4">
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
