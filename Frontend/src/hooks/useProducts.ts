import { useState, useEffect, useCallback } from 'react';
import { productApi, Product, ApiError } from '@/lib/api';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
  getProduct: (id: number) => Product | undefined;
  updateStock: (id: number, newStock: number) => Promise<void>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    try {
      setError(null);
      const newProduct = await productApi.create(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to add product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateProduct = useCallback(async (id: number, updates: Partial<Product>): Promise<Product> => {
    try {
      setError(null);
      const updatedProduct = await productApi.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await productApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to delete product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    try {
      setError(null);
      return await productApi.search(query);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to search products';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getProduct = useCallback((id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const updateStock = useCallback(async (id: number, newStock: number): Promise<void> => {
    await updateProduct(id, { stock: newStock });
  }, [updateProduct]);

  // Load products on mount
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return {
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProduct,
    updateStock,
    setProducts,
  };
};