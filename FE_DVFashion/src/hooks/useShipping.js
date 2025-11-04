import { useState } from "react";
import { shippingAPI } from "../services/shippingAPI";

export const useShipping = () => {
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = async (payload) => {
    setIsCalculating(true);
    try {
      const res = await shippingAPI.calculate(payload);
      // res expected shape: { data: { shippingFee, estimatedDeliveryTime, deliveryTimeText } } or similar
      // shippingController returns ApiResponse.success(ShippingCalculationResponse)
      // addressAPI wrappers in project return .data already; adapt if necessary
      const data = res?.data ?? res;
      return data;
    } finally {
      setIsCalculating(false);
    }
  };

  return { calculate, isCalculating };
};
