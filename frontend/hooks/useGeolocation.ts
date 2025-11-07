import { useState, useEffect, useCallback } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface UseGeolocationReturn {
  location: GeolocationData | null;
  error: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permiso de ubicación denegado. Por favor, actívalo en la configuración.';
      case error.POSITION_UNAVAILABLE:
        return 'Ubicación no disponible. Verifica tu conexión GPS.';
      case error.TIMEOUT:
        return 'Tiempo de espera agotado. Intenta de nuevo.';
      default:
        return 'Error al obtener ubicación.';
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización');
      return false;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: position.timestamp,
          };
          
          setLocation(locationData);
          setIsLoading(false);
          setError(null);
          resolve(true);
        },
        (error) => {
          const errorMessage = getErrorMessage(error);
          setError(errorMessage);
          setIsLoading(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    location,
    error,
    isLoading,
    requestPermission,
  };
}

export function useGeolocationTracking(
  isActive: boolean,
  intervalMs: number = 10000
): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permiso de ubicación denegado. Por favor, actívalo en la configuración.';
      case error.POSITION_UNAVAILABLE:
        return 'Ubicación no disponible. Verifica tu conexión GPS.';
      case error.TIMEOUT:
        return 'Tiempo de espera agotado. Intenta de nuevo.';
      default:
        return 'Error al obtener ubicación.';
    }
  };

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        };
        
        setLocation(locationData);
        setError(null);
      },
      (error) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización');
      return false;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: position.timestamp,
          };
          
          setLocation(locationData);
          setIsLoading(false);
          setError(null);
          resolve(true);
        },
        (error) => {
          const errorMessage = getErrorMessage(error);
          setError(errorMessage);
          setIsLoading(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Actualizar ubicación inmediatamente
    updateLocation();

    // Configurar intervalo
    const intervalId = setInterval(updateLocation, intervalMs);

    // Limpiar intervalo al desmontar o cuando isActive cambie
    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, intervalMs, updateLocation]);

  return {
    location,
    error,
    isLoading,
    requestPermission,
  };
}
