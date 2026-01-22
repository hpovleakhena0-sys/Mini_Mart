import React, { createContext, useContext, ReactNode } from "react";
import { useProducts } from "../hooks/useProducts";
import { Product } from "../lib/api";

interface InventoryContextType {
  products: ReturnType<typeof useProducts>["products"];
  loading: boolean;
  error: string | null;
  updateProduct: (
    productId: number,
    updates: Partial<Product>
  ) => Promise<Product>;
  addProduct: (product: Omit<Product, "id" | "created_at">) => Promise<Product>;
  deleteProduct: (productId: number) => Promise<void>;
  updateStock: (productId: number, newStock: number) => Promise<void>;
  getProduct: (productId: number) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error(
      "useInventoryContext must be used within an InventoryProvider"
    );
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({
  children,
}) => {
  const productsHook = useProducts();

  const value: InventoryContextType = {
    products: productsHook.products,
    loading: productsHook.loading,
    error: productsHook.error,
    updateProduct: productsHook.updateProduct,
    addProduct: productsHook.addProduct,
    deleteProduct: productsHook.deleteProduct,
    updateStock: productsHook.updateStock,
    getProduct: productsHook.getProduct,
    refreshProducts: productsHook.refreshProducts,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
