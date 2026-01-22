import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { paymentApi, Payment as ApiPayment } from "@/lib/api";
import {
  PaymentContext,
  PaymentContextType,
  Payment,
} from "./PaymentContextValue";

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({
  children,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentApi.getAll();
      // Transform API data to match frontend interface
      const transformedPayments: Payment[] = data.map(
        (payment: ApiPayment) => ({
          id: payment.id.toString(),
          transaction_id: payment.transaction_id,
          order_id: payment.order_id,
          customer:
            typeof payment.customer === "object"
              ? payment.customer.name
              : payment.customer.toString(),
          amount: Number(payment.amount),
          method: payment.method,
          status: payment.status,
          payment_date: new Date(payment.payment_date).toLocaleString(),
        })
      );
      setPayments(transformedPayments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payments");
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const addPayment = async (
    paymentData: Omit<Payment, "id" | "payment_date">
  ) => {
    try {
      // Transform frontend data to API format
      const apiPayment = {
        transaction_id: paymentData.transaction_id,
        order_id: paymentData.order_id,
        customer: 1, // Default customer ID for now - should be passed from form
        amount: paymentData.amount,
        method: paymentData.method,
        status: paymentData.status,
      };

      const newPayment = await paymentApi.create(
        apiPayment as Omit<ApiPayment, "id" | "payment_date">
      );

      // Transform back to frontend format
      const transformedPayment: Payment = {
        id: newPayment.id.toString(),
        transaction_id: newPayment.transaction_id,
        order_id: newPayment.order_id,
        customer:
          typeof newPayment.customer === "object"
            ? newPayment.customer.name
            : newPayment.customer.toString(),
        amount: Number(newPayment.amount),
        method: newPayment.method,
        status: newPayment.status,
        payment_date: new Date(newPayment.payment_date).toLocaleString(),
      };

      setPayments((prev) => [...prev, transformedPayment]);

      toast({
        title: "Payment recorded",
        description: `Payment of $${paymentData.amount.toFixed(
          2
        )} has been recorded.`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      await paymentApi.update(parseInt(paymentId), { status });
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId ? { ...payment, status } : payment
        )
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const refreshPayments = async () => {
    await fetchPayments();
  };

  const value: PaymentContextType = {
    payments,
    loading,
    error,
    addPayment,
    updatePaymentStatus,
    refreshPayments,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
