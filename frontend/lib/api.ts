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
