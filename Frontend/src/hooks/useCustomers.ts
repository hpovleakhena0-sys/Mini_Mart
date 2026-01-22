import { useState, useEffect, useCallback } from 'react';
import { customerApi, Customer, ApiError } from '@/lib/api';

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'total_purchases' | 'total_spent' | 'last_visit'>) => Promise<Customer>;
  updateCustomer: (id: number, updates: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: number) => Promise<void>;
  searchCustomers: (query: string) => Promise<Customer[]>;
  getCustomer: (id: number) => Customer | undefined;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export const useCustomers = (): UseCustomersReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'created_at' | 'total_purchases' | 'total_spent' | 'last_visit'>): Promise<Customer> => {
    try {
      setError(null);
      const newCustomer = await customerApi.create(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to add customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCustomer = useCallback(async (id: number, updates: Partial<Customer>): Promise<Customer> => {
    try {
      setError(null);
      const updatedCustomer = await customerApi.update(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to update customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await customerApi.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to delete customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const searchCustomers = useCallback(async (query: string): Promise<Customer[]> => {
    try {
      setError(null);
      return await customerApi.search(query);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to search customers';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getCustomer = useCallback((id: number): Customer | undefined => {
    return customers.find(c => c.id === id);
  }, [customers]);

  // Load customers on mount
  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  return {
    customers,
    loading,
    error,
    refreshCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomer,
    setCustomers,
  };
};