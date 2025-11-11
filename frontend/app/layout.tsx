import type { Metadata, Viewport } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Autobuses Aranjuez | Seguimiento en Tiempo Real',
  description: 'Aplicación de seguimiento en tiempo real de autobuses urbanos de Aranjuez. Consulta la ubicación exacta de cada autobús y tiempos estimados de llegada.',
  keywords: ['autobuses', 'Aranjuez', 'transporte público', 'tiempo real', 'tracking'],
  authors: [{ name: 'Autobuses Aranjuez' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bus ARJ',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://autobuses-aranjuez.com',
    siteName: 'Autobuses Aranjuez',
    title: 'Seguimiento de Autobuses - Aranjuez',
    description: 'Sigue tu autobús en tiempo real',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={quicksand.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={quicksand.className}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          {children}
        </div>
      </body>
    </html>
  );
}
