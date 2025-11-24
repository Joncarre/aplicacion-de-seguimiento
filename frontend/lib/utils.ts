import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind CSS de manera inteligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un tiempo en segundos a formato legible
 * @param seconds - Segundos
 * @returns Cadena formateada (ej: "5 min", "1 h 30 min")
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seg`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Valida un código de conductor (6 dígitos)
 */
export function validateDriverCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Obtiene el color de una línea
 */
export function getLineColor(lineName: string): string {
  const colors: Record<string, string> = {
    'L1': '#86efac',
    'L2': '#ffa654',
    'L3': '#5eead4',
    'L4': '#7dd3fc',
  };

  return colors[lineName] || '#10b981';
}
