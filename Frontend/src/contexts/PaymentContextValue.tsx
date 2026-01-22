import { createContext } from "react";

export interface Payment {
  id: string;
  transaction_id: string;
  order_id: string;
  customer: string;
  amount: number;
  method: string;
  status: string;
  payment_date: string;
}

export interface PaymentContextType {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  addPayment: (payment: Omit<Payment, "id" | "payment_date">) => Promise<void>;
  updatePaymentStatus: (paymentId: string, status: string) => Promise<void>;
  refreshPayments: () => Promise<void>;
}

export const PaymentContext = createContext<PaymentContextType | undefined>(
  undefined
);
