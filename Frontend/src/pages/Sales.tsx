import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Receipt,
  ShoppingBag,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { Product, Customer, saleApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface CartItem extends Product {
  quantity: number;
}

export default function Sales() {
  const { toast } = useToast();
  const { products, loading, error, updateProduct, refreshProducts } =
    useProducts();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(
    null
  );
  const [processingPayment, setProcessingPayment] = useState(false);

  // Get unique categories from products
  const categories = [
    "All",
    ...Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getAvailableStock = (productId: number) =>
    products.find((product) => product.id === productId)?.stock ?? 0;

  const showStockError = (availableStock: number) => {
    toast({
      variant: "destructive",
      title: "Insufficient stock",
      description:
        availableStock > 0
          ? `Only ${availableStock} unit${
              availableStock === 1 ? "" : "s"
            } available.`
          : "This product is out of stock.",
    });
  };

  const processOrder = async (paymentMethod: "cash" | "card") => {
    if (!cart.length) return;

    setProcessingPayment(true);
    try {
      // Refresh inventory to ensure we have the latest stock levels
      await refreshProducts();

      // Re-validate stock levels after refresh
      const insufficientStock = cart.some((item) => {
        const currentProduct = products.find((p) => p.id === item.id);
        return currentProduct && currentProduct.stock < item.quantity;
      });

      if (insufficientStock) {
        toast({
          variant: "destructive",
          title: "Stock validation failed",
          description:
            "Some items in your cart are out of stock or have insufficient quantity. Please update your cart.",
        });
        return;
      }
      // Create a walk-in customer object for the sale
      const walkInCustomer: Customer = {
        id: 1,
        name: "Walk-in Customer",
        email: "",
        total_purchases: 0,
        total_spent: 0,
        status: "active",
      };

      // Create sales records for each item in cart
      const salesPromises = cart.map((cartItem) => {
        return saleApi.create(
          {
            customer: walkInCustomer,
            product: cartItem,
            quantity: cartItem.quantity,
            total_price: cartItem.price * cartItem.quantity,
          },
          paymentMethod
        );
      });

      // Process all sales
      const salesResults = await Promise.all(salesPromises);

      // Refresh products to update inventory display
      await refreshProducts();

      setPaymentMethod(paymentMethod);
      setShowReceipt(true);

      // Invalidate dashboard cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast({
        title: "Payment successful",
        description: `Order completed using ${
          paymentMethod === "cash" ? "cash" : "card"
        } payment.`,
      });
    } catch (error) {
      console.error("Error processing order:", error);
      let errorMessage = "Failed to process payment. Please try again.";

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes("Insufficient stock")) {
          errorMessage =
            "Cannot complete payment: Some items are out of stock or quantity has changed.";
        } else if (error.message.includes("Network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        variant: "destructive",
        title: "Payment failed",
        description: errorMessage,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const addToCart = (product: Product) => {
    const availableStock = getAvailableStock(product.id);
    if (availableStock <= 0) {
      showStockError(availableStock);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const desiredQuantity = existing ? existing.quantity + 1 : 1;

      if (desiredQuantity > availableStock) {
        showStockError(availableStock);
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: desiredQuantity } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    const availableStock = getAvailableStock(productId);

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const newQuantity = item.quantity + delta;

          if (newQuantity <= 0) {
            return { ...item, quantity: 0 };
          }

          if (newQuantity > availableStock) {
            showStockError(availableStock);
            return item;
          }

          return { ...item, quantity: newQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const handleCashPayment = () => processOrder("cash");
  const handleCardPayment = () => processOrder("card");

  const closeReceipt = () => {
    setShowReceipt(false);
    setPaymentMethod(null);
    clearCart();
  };

  const handleReceiptVisibilityChange = (open: boolean) => {
    if (!open) {
      closeReceipt();
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const orderNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  if (loading) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Error loading products: {error}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-6">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search and Filters */}
          <div className="mb-4 space-y-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "secondary"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium">No products found</p>
                <p className="text-sm">
                  {searchQuery || selectedCategory !== "All"
                    ? "Try adjusting your search or filter"
                    : "No products available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product, index) => {
                  const isOutOfStock = product.stock === 0;

                  return (
                    <Card
                      key={product.id}
                      variant="interactive"
                      className={cn(
                        "animate-scale-in",
                        isOutOfStock
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      aria-disabled={isOutOfStock}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-secondary rounded-lg mb-3 overflow-hidden">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              isOutOfStock &&
                                "bg-destructive/15 text-destructive"
                            )}
                          >
                            {isOutOfStock ? "Out" : product.stock}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <Card
          variant="elevated"
          className="w-full lg:w-96 flex flex-col animate-slide-in-right"
        >
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Current Order
              </div>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium">Cart is empty</p>
                <p className="text-sm">Click products to add them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {/* Cart Footer */}
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (12%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="pos-secondary"
                disabled={cart.length === 0 || processingPayment}
                onClick={handleCashPayment}
                className="w-full"
              >
                {processingPayment ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Banknote className="w-5 h-5 mr-2" />
                )}
                Cash
              </Button>
              <Button
                variant="pos-success"
                disabled={cart.length === 0 || processingPayment}
                onClick={handleCardPayment}
                className="w-full"
              >
                {processingPayment ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                Pay
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={handleReceiptVisibilityChange}>
        <DialogContent className="w-[800px] h-[752px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Payment Successful
            </DialogTitle>
            <DialogDescription>
              Order receipt and inventory update details
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Order Details */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Order #{orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleString()}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Order Details</h4>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (12%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Payment Method</span>
                    <span>
                      {paymentMethod === "cash" ? "Cash" : "Credit Card"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Updated Inventory */}
              <div className="space-y-4">
                <h4 className="font-semibold mb-3">Updated Inventory</h4>
                <div className="border rounded-lg p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products
                      .filter((product) =>
                        cart.some((item) => item.id === product.id)
                      )
                      .map((product) => {
                        const cartItem = cart.find(
                          (item) => item.id === product.id
                        );
                        const originalStock = cartItem
                          ? product.stock + cartItem.quantity
                          : product.stock;
                        const newStock = product.stock;

                        return (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 bg-secondary/50 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.sku || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                ${product.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Stock: {originalStock} → {newStock}
                              </div>
                              {cartItem && (
                                <div className="text-xs text-success">
                                  Sold: {cartItem.quantity}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 text-center">Scan to Verify</h4>
              <div className="flex justify-center">
                <QRCode
                  value={`Order:${orderNumber}|Total:${total.toFixed(
                    2
                  )}|Method:${
                    paymentMethod === "cash" ? "Cash" : "Card"
                  }|Date:${new Date().toISOString()}`}
                  size={200}
                  style={{ height: "200px", maxWidth: "100%", width: "250px" }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Scan this QR code to verify your order
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={closeReceipt} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
