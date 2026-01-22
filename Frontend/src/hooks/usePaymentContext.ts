import { useContext } from "react";
import { PaymentContext } from "../contexts/PaymentContextValue";

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePaymentContext must be used within a PaymentProvider");
  }
  return context;
};