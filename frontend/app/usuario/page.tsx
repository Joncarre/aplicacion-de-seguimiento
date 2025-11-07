'use client';

import BackButton from '@/components/ui/BackButton';
import Card from '@/components/ui/Card';
import { Construction } from 'lucide-react';

export default function UsuarioPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Botón volver */}
        <div className="mb-6">
          <BackButton href="/" />
        </div>

        {/* Card de construcción */}
        <Card>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
              <Construction size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              En Construcción
            </h1>
            <p className="text-text-muted mb-6">
              El panel de usuario estará disponible en la Fase 4
            </p>
            
            <div className="text-left bg-green-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-text-primary">
                📅 Próximas funcionalidades:
              </p>
              <ul className="text-sm text-text-secondary space-y-1 ml-4">
                <li>• Selección de líneas (L1-L4)</li>
                <li>• Visualización de paradas en mapa</li>
                <li>• Consulta de tiempos de llegada</li>
                <li>• Seguimiento en tiempo real</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
