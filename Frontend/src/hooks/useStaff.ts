import { useState, useEffect, useCallback } from 'react';
import { staffApi, Staff, ApiError } from '@/lib/api';

interface UseStaffReturn {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  refreshStaff: () => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id' | 'created_at' | 'last_login'>) => Promise<Staff>;
  updateStaff: (id: number, updates: Partial<Staff>) => Promise<Staff>;
  deleteStaff: (id: number) => Promise<void>;
  searchStaff: (query: string) => Promise<Staff[]>;
  getStaff: (id: number) => Staff | undefined;
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

export const useStaff = (): UseStaffReturn => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffApi.getAll();
      setStaff(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to fetch staff';
      setError(errorMessage);
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStaff = useCallback(async (staffData: Omit<Staff, 'id' | 'created_at' | 'last_login'>): Promise<Staff> => {
    try {
      setError(null);
      const newStaff = await staffApi.create(staffData);
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to add staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateStaff = useCallback(async (id: number, updates: Partial<Staff>): Promise<Staff> => {
    try {
      setError(null);
      const updatedStaff = await staffApi.update(id, updates);
      setStaff(prev => prev.map(s => s.id === id ? updatedStaff : s));
      return updatedStaff;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to update staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteStaff = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await staffApi.delete(id);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to delete staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const searchStaff = useCallback(async (query: string): Promise<Staff[]> => {
    try {
      setError(null);
      return await staffApi.search(query);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to search staff';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getStaff = useCallback((id: number): Staff | undefined => {
    return staff.find(s => s.id === id);
  }, [staff]);

  // Load staff on mount
  useEffect(() => {
    refreshStaff();
  }, [refreshStaff]);

  return {
    staff,
    loading,
    error,
    refreshStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    searchStaff,
    getStaff,
    setStaff,
  };
};