
/**
 * Database Client Service for ABS FEED ERP
 * Pointing to internal Next.js API Routes.
 */

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  source: 'remote' | 'local';
}

export class DatabaseService {
  private static async request(endpoint: string, method: string = 'GET', body: any = null): Promise<any> {
    const config: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      console.log(`[DatabaseService] Requesting: ${method} /api${endpoint}`);
      const response = await fetch(`/api${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[DatabaseService] API Error: ${response.status}`, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { data, success: true, source: 'remote' };
    } catch (error: any) {
      console.warn(`[DatabaseService] Request failed for ${endpoint}, falling back to local storage:`, error.message);
      const fallbackData = this.fallback(endpoint, method, body);
      return { data: fallbackData, success: false, source: 'local', error: error.message };
    }
  }

  private static fallback(endpoint: string, method: string, body: any) {
    if (typeof window === 'undefined') return null;
    const collection = endpoint.split('/')[1];
    const key = `erp_local_${collection}`;
    let data = JSON.parse(localStorage.getItem(key) || '[]');

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

    if (method === 'DELETE' && endpoint.includes('sales')) {
      const url = new URL(endpoint, 'http://localhost');
      const invoiceNo = url.searchParams.get('invoiceNo');
      data = data.filter((s: any) => s.invoiceNo !== invoiceNo);
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    }
    
    return null;
  }

  static async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      return res.ok;
    } catch (e) {
      console.error("[DatabaseService] Health check failed:", e);
      return false;
    }
  }

  static async getProducts() { return await this.request('/products'); }
  static async saveProducts(products: any[]) { return await this.request('/sync/products', 'POST', products); }

  static async getCustomers() { return await this.request('/customers'); }
  static async saveCustomers(customers: any[]) { return await this.request('/sync/customers', 'POST', customers); }

  static async getOfficers() { return await this.request('/officers'); }
  static async saveOfficers(officers: any[]) { return await this.request('/sync/officers', 'POST', officers); }

  static async getSales() { return await this.request('/sales'); }
  // Added saveSales to support bulk syncing of sales records (needed when cascading updates occur)
  static async saveSales(sales: any[]) { return await this.request('/sync/sales', 'POST', sales); }
  static async addSale(sale: any) { return await this.request('/sales', 'POST', sale); }
  static async deleteSale(invoiceNo: string) { return await this.request(`/sales?invoiceNo=${invoiceNo}`, 'DELETE'); }
}
