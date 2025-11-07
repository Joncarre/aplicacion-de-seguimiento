const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Realiza una petición HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  /**
   * Valida un código de conductor
   */
  async validateCode(code: string): Promise<{
    success: boolean;
    message: string;
    data: {
      token: string;
      sessionId: string;
    };
  }> {
    return this.request('/api/auth/validate-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  /**
   * Valida una sesión existente
   */
  async validateSession(token: string): Promise<{
    success: boolean;
    message: string;
    data: {
      sessionId: string;
      isActive: boolean;
      expiresAt: string;
    };
  }> {
    return this.request('/api/auth/validate-session', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * Finaliza una sesión de conductor
   */
  async endSession(token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request('/api/auth/end-session', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // ============================================
  // LOCATION ENDPOINTS
  // ============================================

  /**
   * Envía la ubicación del conductor
   */
  async submitLocation(data: {
    sessionId: string;
    lineId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number | null;
    heading?: number | null;
  }): Promise<{
    success: boolean;
    location: {
      id: string;
      latitude: number;
      longitude: number;
      timestamp: string;
    };
  }> {
    return this.request('/api/location', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Asigna una línea a una sesión
   */
  async assignLineToSession(sessionId: string, lineId: string): Promise<{
    success: boolean;
    session: {
      id: string;
      lineId: string;
    };
  }> {
    return this.request(`/api/session/${sessionId}/line`, {
      method: 'PUT',
      body: JSON.stringify({ lineId }),
    });
  }

  /**
   * Finaliza la sesión de conductor
   */
  async endDriverSession(sessionId: string): Promise<{
    success: boolean;
    session: {
      id: string;
      endedAt: string;
    };
  }> {
    return this.request(`/api/session/${sessionId}/end`, {
      method: 'PUT',
    });
  }

  /**
   * Obtiene ubicaciones recientes de una línea
   */
  async getLocationsByLine(lineId: string, limit?: number): Promise<{
    success: boolean;
    locations: Array<{
      id: string;
      latitude: number;
      longitude: number;
      accuracy: number | null;
      speed: number | null;
      heading: number | null;
      timestamp: string;
      sessionId: string;
    }>;
  }> {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.request(`/api/location/line/${lineId}${queryString}`);
  }

  /**
   * Obtiene todas las líneas de autobús
   */
  async getBusLines(): Promise<{
    success: boolean;
    lines: Array<{
      id: string;
      name: string;
      color: string;
      description: string | null;
    }>;
  }> {
    return this.request('/api/lines');
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  /**
   * Verifica que el servidor esté funcionando
   */
  async health(): Promise<{
    status: string;
    uptime: number;
    timestamp: string;
  }> {
    return this.request('/health');
  }
}

// Exportar instancia única
export const api = new ApiClient(API_URL);

export default api;
