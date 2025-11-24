'use client';

import { Mail } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

export default function ContactoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Botón de volver */}
                <div className="mb-6">
                    <BackButton href="/" />
                </div>

                {/* Icono de email */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-xl md:text-2xl font-light text-center text-white mb-3" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
                    Gracias por utilizar esta aplicación
                </h1>

                {/* Mensaje principal */}
                <p className="text-base text-slate-300 text-center leading-relaxed mb-6" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
                    Esperamos que sea de gran ayuda
                </p>

                {/* Mensaje de contacto */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600/30">
                    <p className="text-sm text-slate-300 text-center leading-relaxed mb-3" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
                        Por favor, si tienes algún problema o sugerencia de mejora, escribe un correo a:
                    </p>

                    {/* Email destacado */}
                    <a
                        href="mailto:autobusesaranjuez@gmail.com"
                        className="block text-center text-base font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300 mb-2"
                        style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}
                    >
                        autobusesaranjuez@gmail.com
                    </a>

                    <p className="text-xs text-slate-400 text-center" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
                        Estaremos encantados de ayudarte
                    </p>
                </div>

            </div>
        </div>
    );
}
