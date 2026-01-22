import { useState, useEffect, useCallback } from 'react';
import { supplierApi, Supplier, ApiError } from '@/lib/api';

interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  refreshSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => Promise<Supplier>;
  updateSupplier: (id: number, updates: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: number) => Promise<void>;
  searchSuppliers: (query: string) => Promise<Supplier[]>;
  getSupplier: (id: number) => Supplier | undefined;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

export const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierApi.getAll();
      setSuppliers(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to fetch suppliers';
      setError(errorMessage);
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSupplier = useCallback(async (supplierData: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> => {
    try {
      setError(null);
      const newSupplier = await supplierApi.create(supplierData);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to add supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateSupplier = useCallback(async (id: number, updates: Partial<Supplier>): Promise<Supplier> => {
    try {
      setError(null);
      const updatedSupplier = await supplierApi.update(id, updates);
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to update supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteSupplier = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await supplierApi.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to delete supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const searchSuppliers = useCallback(async (query: string): Promise<Supplier[]> => {
    try {
      setError(null);
      return await supplierApi.search(query);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to search suppliers';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getSupplier = useCallback((id: number): Supplier | undefined => {
    return suppliers.find(s => s.id === id);
  }, [suppliers]);

  // Load suppliers on mount
  useEffect(() => {
    refreshSuppliers();
  }, [refreshSuppliers]);

  return {
    suppliers,
    loading,
    error,
    refreshSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    getSupplier,
    setSuppliers,
  };
};