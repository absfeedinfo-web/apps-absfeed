
/**
 * Database Service for ABS FEED ERP
 * Connecting to the Express.js Backend API.
 */

const BACKEND_PORT = 5000;
let detectedApiUrl: string | null = null;
let isBackendAvailable = false;

export class DatabaseService {
  /**
   * Probes possible API endpoints to find the working one.
   */
  static async checkConnection(): Promise<boolean> {
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol;
    
    // Possible API roots to check
    const candidates = [
      '/api', // Relative path (best for proxies)
      `${protocol}//${hostname}:${BACKEND_PORT}/api`, // Absolute current host
      `http://localhost:${BACKEND_PORT}/api`, // Hardcoded localhost
      `http://127.0.0.1:${BACKEND_PORT}/api` // Loopback IP
    ];

    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        
        const response = await fetch(`${url}/health`, { 
          method: 'GET', 
          signal: controller.signal,
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          detectedApiUrl = url;
          isBackendAvailable = true;
          console.log(`ABS ERP: Backend discovered at ${url}`);
          return true;
        }
      } catch (e) {
        // Continue to next candidate
      }
    }

    isBackendAvailable = false;
    console.warn("ABS ERP: No backend detected. Operating in Local Mode.");
    return false;
  }

  private static async request(endpoint: string, method: string = 'GET', body: any = null) {
    // If no URL discovered yet, try to discover it
    if (!detectedApiUrl) {
      const connected = await this.checkConnection();
      if (!connected) return this.fallback(endpoint, method, body);
    }

    const config: RequestInit = {
      method,
      mode: 'cors', 
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${detectedApiUrl}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      // If a request fails, re-verify connection
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        isBackendAvailable = false;
        // Don't null detectedApiUrl yet, just fallback
      }
      return this.fallback(endpoint, method, body);
    }
  }

  private static fallback(endpoint: string, method: string, body: any) {
    const collection = endpoint.split('/')[1];
    const key = `erp_local_${collection}`;
    const data = JSON.parse(localStorage.getItem(key) || '[]');

    if (method === 'GET') return data;
    
    if (endpoint.includes('/sync')) {
      localStorage.setItem(key, JSON.stringify(body));
      return { success: true };
    }
    
    if (method === 'POST' && (collection === 'sales' || endpoint === '/sales')) {
      data.push(body);
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    }
    
    if (method === 'DELETE' && (collection === 'sales' || endpoint.startsWith('/sales/'))) {
      const parts = endpoint.split('/');
      const invoiceNo = parts[parts.length - 1];
      const filtered = data.filter((s: any) => s.invoiceNo !== invoiceNo);
      localStorage.setItem(key, JSON.stringify(filtered));
      return { success: true };
    }
    
    if (method === 'PUT' && (collection === 'sales' || endpoint.startsWith('/sales/'))) {
      const parts = endpoint.split('/');
      const invoiceNo = parts[parts.length - 1];
      const updated = data.map((s: any) => s.invoiceNo === invoiceNo ? body : s);
      localStorage.setItem(key, JSON.stringify(updated));
      return { success: true };
    }

    if (method === 'POST' && collection === 'users') {
      data.push(body);
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    }

    if (method === 'PUT' && collection === 'users') {
      localStorage.setItem(key, JSON.stringify(body));
      return { success: true };
    }
    
    return null;
  }

  static get isOnline() { return isBackendAvailable; }

  static async getProducts() { return await this.request('/products'); }
  static async saveProducts(products: any[]) { return await this.request('/sync/products', 'POST', products); }

  static async getCustomers() { return await this.request('/customers'); }
  static async saveCustomers(customers: any[]) { return await this.request('/sync/customers', 'POST', customers); }

  static async getOfficers() { return await this.request('/officers'); }
  static async saveOfficers(officers: any[]) { return await this.request('/sync/officers', 'POST', officers); }

  static async getSales() { return await this.request('/sales'); }
  static async addSale(sale: any) { return await this.request('/sales', 'POST', sale); }
  static async updateSale(sale: any) { return await this.request(`/sales/${sale.invoiceNo}`, 'PUT', sale); }
  static async deleteSale(invoiceNo: string) { return await this.request(`/sales/${invoiceNo}`, 'DELETE'); }

  static async getUsers() { return await this.request('/users'); }
  static async saveUsers(users: any[]) { return await this.request('/sync/users', 'POST', users); }
}
