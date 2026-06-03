"use client";

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export type RazorpayOrderResponse = {
  bookingId: string;
  keyId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
};

let razorpayScriptPromise: Promise<void> | null = null;

export const loadRazorpayCheckout = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout can only run in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = async (
  options: Omit<RazorpayOptions, "key" | "amount" | "currency" | "order_id"> & {
    keyId: string;
    order: RazorpayOrderResponse["order"];
  }
) => {
  await loadRazorpayCheckout();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable.");
  }

  const razorpay = new window.Razorpay({
    ...options,
    key: options.keyId,
    amount: options.order.amount,
    currency: options.order.currency,
    order_id: options.order.id,
  });

  razorpay.open();
};
