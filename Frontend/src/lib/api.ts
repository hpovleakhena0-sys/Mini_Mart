// API configuration and service functions
const API_BASE_URL = 'http://localhost:8000/api';

// For form data uploads (images)
export const API_BASE_FULL_URL = 'http://localhost:8000';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  min_stock?: number;
  category: string;
  sku?: string;
  supplier?: string;
  image?: string;
  description?: string;
  created_at?: string;
}

// Internal type for API responses (strings for numbers)
interface RawProduct {
  id: string | number;
  name: string;
  price: string | number;
  stock: string | number;
  min_stock?: string | number;
  category: string;
  sku?: string;
  supplier?: string;
  image?: string;
  description?: string;
  created_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  total_purchases: number;
  total_spent: number;
  last_visit?: string;
  status: string;
  address?: string;
  created_at?: string;
}

export interface Sale {
  id: number;
  customer: Customer;
  product: Product;
  quantity: number;
  total_price: number;
  sale_date: string;
  payment_status: string;
  payment_method: string;
}

export interface Payment {
  id: number;
  transaction_id: string;
  order_id: string;
  customer: Customer | number; // Can be Customer object or ID
  amount: number;
  method: string;
  status: string;
  payment_date: string;
}

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  status: string;
  last_login?: string;
  created_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  created_at?: string;
}

export interface DashboardData {
  today_sales: number;
  transactions: number;
  products_in_stock: number;
  low_stock_count: number;
  active_customers: number;
  recent_sales: Sale[];
  low_stock_items: {
    name: string;
    stock: number;
    min_stock: number;
    category: string;
  }[];
  payment_success_rate: number;
  avg_transaction_value: number;
  avg_checkout_time: number;
}

interface RawLowStockItem {
  name: string;
  stock: string | number;
  min_stock: string | number;
  category: string;
}

interface RawSale extends Omit<Sale, 'quantity' | 'total_price'> {
  quantity: string | number;
  total_price: string | number;
}

interface RawDashboardData {
  today_sales: string | number;
  transactions: string | number;
  products_in_stock: string | number;
  low_stock_count: string | number;
  active_customers: string | number;
  recent_sales: RawSale[];
  low_stock_items: RawLowStockItem[];
  payment_success_rate: string | number;
  avg_transaction_value: string | number;
  avg_checkout_time: string | number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    // If errorData is an object with field errors, extract them
    if (typeof errorData === 'object' && !errorData.message) {
      const fieldErrors = Object.entries(errorData)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('; ');
      errorMessage = fieldErrors || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }
  
  // Handle empty responses (like DELETE requests)
  const text = await response.text();
  if (!text) {
    return null;
  }
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// Convert string numbers to actual numbers
export const normalizeProduct = (product: RawProduct): Product => {
  return {
    ...product,
    id: Number(product.id),
    price: Number(product.price),
    stock: Number(product.stock),
    min_stock: product.min_stock !== undefined && product.min_stock !== null ? Number(product.min_stock) : undefined,
  };
};

// Handle paginated responses with data normalization
export const handlePaginatedResponse = <T>(data: { results: T[] } | T[]): T[] => {
  let items: T[];

  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    items = data.results;
  } else {
    items = data as T[];
  }

  // Normalize numeric fields for Product, Payment, and Customer items
  return items.map(item => {
    if (typeof item === 'object' && item !== null) {
      if ('price' in item) {
        return normalizeProduct(item as unknown as RawProduct) as T;
      }
      if ('amount' in item) {
        return {
          ...item,
          amount: Number((item as { amount: string | number }).amount)
        } as T;
      }
      if ('total_spent' in item) {
        return {
          ...item,
          total_spent: Number((item as { total_spent: string | number }).total_spent)
        } as T;
      }
    }
    return item;
  });
};

const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error');
  }
};

// Product API functions
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const data = await apiRequest<{results: Product[]} | Product[]>('/products/');
    return handlePaginatedResponse(data);
  },
  
  getById: (id: number): Promise<Product> => 
    apiRequest<Product>(`/products/${id}/`),
  
  create: (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => 
    apiRequest<Product>('/products/', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  
  update: (id: number, product: Partial<Product>): Promise<Product> => 
    apiRequest<Product>(`/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  
  delete: (id: number): Promise<void> => 
    apiRequest<null>(`/products/${id}/`, {
      method: 'DELETE',
    }).then(() => void 0),
  
  search: (query: string): Promise<Product[]> => 
    apiRequest<Product[]>(`/products/?search=${encodeURIComponent(query)}`),
};

// Customer API functions
export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const data = await apiRequest<{results: Customer[]} | Customer[]>('/customers/');
    return handlePaginatedResponse(data);
  },
  
  getById: (id: number): Promise<Customer> => 
    apiRequest<Customer>(`/customers/${id}/`),
  
  create: (customer: Omit<Customer, 'id' | 'created_at' | 'total_purchases' | 'total_spent' | 'last_visit'>): Promise<Customer> =>
    apiRequest<Customer>('/customers/', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),
  
  update: (id: number, customer: Partial<Customer>): Promise<Customer> => 
    apiRequest<Customer>(`/customers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    }),
  
  delete: (id: number): Promise<void> =>
    apiRequest<void>(`/customers/${id}/`, {
      method: 'DELETE',
    }),

  search: (query: string): Promise<Customer[]> =>
    apiRequest<Customer[]>(`/customers/?search=${encodeURIComponent(query)}`),
};

// Sale API functions
export const saleApi = {
  getAll: async (): Promise<Sale[]> => {
    const data = await apiRequest<{results: Sale[]} | Sale[]>('/sales/');
    return handlePaginatedResponse(data);
  },
  
  getById: (id: number): Promise<Sale> =>
    apiRequest<Sale>(`/sales/${id}/`),
  
  create: (sale: Omit<Sale, 'id' | 'sale_date' | 'payment_status' | 'payment_method'>, paymentMethod: string): Promise<Sale> =>
    apiRequest<Sale>('/sales/', {
      method: 'POST',
      body: JSON.stringify({
        ...sale,
        payment_method: paymentMethod
      }),
    }),
  
  update: (id: number, sale: Partial<Sale>): Promise<Sale> =>
    apiRequest<Sale>(`/sales/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(sale),
    }),
  
  delete: (id: number): Promise<void> =>
    apiRequest<void>(`/sales/${id}/`, {
      method: 'DELETE',
    }),
  
  processPayment: (id: number, paymentMethod: string): Promise<Sale> =>
    apiRequest<Sale>(`/sales/${id}/process_payment/`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
    }),
};

// Payment API functions
export const paymentApi = {
  getAll: async (): Promise<Payment[]> => {
    const data = await apiRequest<{results: Payment[]} | Payment[]>('/payments/');
    return handlePaginatedResponse(data);
  },

  getById: (id: number): Promise<Payment> =>
    apiRequest<Payment>(`/payments/${id}/`),

  create: (payment: Omit<Payment, 'id' | 'payment_date'>): Promise<Payment> =>
    apiRequest<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  update: (id: number, payment: Partial<Payment>): Promise<Payment> =>
    apiRequest<Payment>(`/payments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    }),

  delete: (id: number): Promise<void> =>
    apiRequest<void>(`/payments/${id}/`, {
      method: 'DELETE',
    }),
};

// Staff API functions
export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    const data = await apiRequest<{results: Staff[]} | Staff[]>('/staff/');
    return handlePaginatedResponse(data);
  },

  getById: (id: number): Promise<Staff> =>
    apiRequest<Staff>(`/staff/${id}/`),

  create: (staff: Omit<Staff, 'id' | 'created_at' | 'last_login'>): Promise<Staff> =>
    apiRequest<Staff>('/staff/', {
      method: 'POST',
      body: JSON.stringify(staff),
    }),

  update: (id: number, staff: Partial<Staff>): Promise<Staff> =>
    apiRequest<Staff>(`/staff/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    }),

  delete: (id: number): Promise<void> =>
    apiRequest<void>(`/staff/${id}/`, {
      method: 'DELETE',
    }),

  search: (query: string): Promise<Staff[]> =>
    apiRequest<Staff[]>(`/staff/?search=${encodeURIComponent(query)}`),
};

// Supplier API functions
export const supplierApi = {
  getAll: async (): Promise<Supplier[]> => {
    const data = await apiRequest<{results: Supplier[]} | Supplier[]>('/suppliers/');
    return handlePaginatedResponse(data);
  },

  getById: (id: number): Promise<Supplier> =>
    apiRequest<Supplier>(`/suppliers/${id}/`),

  create: (supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> =>
    apiRequest<Supplier>('/suppliers/', {
      method: 'POST',
      body: JSON.stringify(supplier),
    }),

  update: (id: number, supplier: Partial<Supplier>): Promise<Supplier> =>
    apiRequest<Supplier>(`/suppliers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    }),

  delete: (id: number): Promise<void> =>
    apiRequest<void>(`/suppliers/${id}/`, {
      method: 'DELETE',
    }),

  search: (query: string): Promise<Supplier[]> =>
    apiRequest<Supplier[]>(`/suppliers/?search=${encodeURIComponent(query)}`),
};

// Normalize dashboard data numbers
const normalizeDashboardData = (data: RawDashboardData): DashboardData => {
  return {
    ...data,
    today_sales: Number(data.today_sales),
    transactions: Number(data.transactions),
    products_in_stock: Number(data.products_in_stock),
    low_stock_count: Number(data.low_stock_count),
    active_customers: Number(data.active_customers),
    recent_sales: data.recent_sales.map((sale: RawSale) => ({
      ...sale,
      quantity: Number(sale.quantity),
      total_price: Number(sale.total_price),
    })),
    low_stock_items: data.low_stock_items.map((item: RawLowStockItem) => ({
      ...item,
      stock: Number(item.stock),
      min_stock: Number(item.min_stock),
    })),
    payment_success_rate: Number(data.payment_success_rate),
    avg_transaction_value: Number(data.avg_transaction_value),
    avg_checkout_time: Number(data.avg_checkout_time),
  };
};

// Reports data interfaces
export interface ReportsData {
  metrics: {
    revenue: {
      total: number;
      today: number;
      week: number;
      month: number;
    };
    orders: {
      total: number;
      today: number;
      week: number;
      month: number;
    };
    avg_order_value: number;
    customers: {
      total: number;
      new_today: number;
      new_week: number;
      new_month: number;
    };
  };
  top_products: {
    product__name: string;
    product__category: string;
    total_sold: number;
    total_revenue: number;
  }[];
  payment_methods: {
    payment_method: string;
    count: number;
    total: number;
  }[];
  recent_reports: {
    name: string;
    type: string;
    size: string;
    date: string;
  }[];
}

// Dashboard API functions
export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const data = await apiRequest<RawDashboardData>('/sales/dashboard/');
    return normalizeDashboardData(data);
  },
};

// Reports API functions
export const reportsApi = {
  getReports: async (): Promise<ReportsData> => {
    return apiRequest<ReportsData>('/sales/reports/');
  },
};

export { ApiError };