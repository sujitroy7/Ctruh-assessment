"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  useCartStore,
  selectTotalPrice,
  selectTotalCount,
} from "@/lib/store/cart";
import { addAddress } from "@/lib/api/customers";
import { createOrder } from "@/lib/api/orders";
import { ShippingAddress } from "@/types/address";

interface FormErrors {
  full_name?: string;
  line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  general?: string;
}

function validate(addr: Partial<ShippingAddress>): FormErrors {
  const errs: FormErrors = {};
  if (!addr.full_name?.trim()) errs.full_name = "Full name is required";
  if (!addr.line1?.trim()) errs.line1 = "Address line 1 is required";
  if (!addr.city?.trim()) errs.city = "City is required";
  if (!addr.state?.trim()) errs.state = "State is required";
  if (!addr.postal_code?.trim()) errs.postal_code = "Postal code is required";
  if (!addr.country?.trim()) errs.country = "Country is required";
  if (!addr.phone?.trim()) errs.phone = "Phone is required";
  return errs;
}

function SuccessScreen({ countdown }: { countdown: number }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold leading-tight text-ink mb-3">
          Order placed successfully!
        </h1>
        <p className="text-sm leading-relaxed text-ink-soft mb-6">
          Thank you for your purchase. We&apos;ve received your order and will
          start processing it shortly.
        </p>
        <p className="text-xs text-ink-muted">
          Redirecting to home in{" "}
          <span className="font-mono font-medium text-ink">{countdown}</span>s…
        </p>
      </div>
    </div>
  );
}

const idempotency_key = crypto.randomUUID();
export default function CheckoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = selectTotalPrice({ items });
  const totalCount = selectTotalCount({ items });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const [addr, setAddr] = useState<Partial<ShippingAddress>>({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, router]);

  function handleChange(field: keyof ShippingAddress) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddr((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate(addr);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (items.length === 0) {
      setErrors({ general: "Your cart is empty." });
      return;
    }

    setLoading(true);
    try {
      // Step 1: save the address and get its ID
      const addressResult = await addAddress({
        ...(addr as ShippingAddress),
        idempotency_key: idempotency_key,
      });

      if (!addressResult.success) {
        setErrors({
          general:
            addressResult.message ||
            "Failed to save address. Please try again.",
        });
        return;
      }

      // Step 2: place the order with the saved address ID
      const orderResult = await createOrder({
        idempotency_key,
        address_id: addressResult.data._id,
      });

      if (!orderResult.success) {
        setErrors({
          general:
            orderResult.message || "Failed to place order. Please try again.",
        });
        return;
      }

      clearCart();
      setSuccess(true);
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <SuccessScreen countdown={countdown} />;
  }

  return (
    <main className="min-h-screen bg-canvas px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold leading-tight text-ink mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Shipping address */}
            <div className="lg:col-span-2 rounded-lg border border-border bg-surface shadow-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-ink">Shipping address</h2>
              </div>

              {errors.general && (
                <div className="mb-5 px-4 py-3 rounded-md bg-error-50 border border-error-200">
                  <p className="text-sm text-error-600">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Full name"
                  placeholder="Jane Doe"
                  value={addr.full_name}
                  onChange={handleChange("full_name")}
                  error={errors.full_name}
                />
                <Input
                  label="Address line 1"
                  placeholder="123 Main St"
                  value={addr.line1}
                  onChange={handleChange("line1")}
                  error={errors.line1}
                />
                <Input
                  label="Address line 2 (optional)"
                  placeholder="Apt 4B"
                  value={addr.line2}
                  onChange={handleChange("line2")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="New York"
                    value={addr.city}
                    onChange={handleChange("city")}
                    error={errors.city}
                  />
                  <Input
                    label="State / Province"
                    placeholder="NY"
                    value={addr.state}
                    onChange={handleChange("state")}
                    error={errors.state}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Postal code"
                    placeholder="10001"
                    value={addr.postal_code}
                    onChange={handleChange("postal_code")}
                    error={errors.postal_code}
                  />
                  <Input
                    label="Country"
                    placeholder="United States"
                    value={addr.country}
                    onChange={handleChange("country")}
                    error={errors.country}
                  />
                </div>
                <Input
                  label="Phone"
                  placeholder="+1 555 000 0000"
                  type="tel"
                  value={addr.phone}
                  onChange={handleChange("phone")}
                  error={errors.phone}
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-lg border border-border bg-surface shadow-card p-6">
                <h2 className="text-lg font-bold text-ink mb-5">
                  Order summary
                </h2>

                {!isMounted ? (
                  <div className="animate-pulse space-y-3 pb-4 border-b border-border mb-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 rounded-md bg-neutral-100" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center pb-4 border-b border-border mb-4">
                    <ShoppingBag className="w-8 h-8 text-ink-muted mb-2" />
                    <p className="text-sm text-ink-soft">Your cart is empty</p>
                  </div>
                ) : (
                  <ul className="space-y-3 pb-4 border-b border-border mb-4">
                    {items.map((item) => (
                      <li
                        key={item.productItemId}
                        className="flex items-start gap-3"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-neutral-100 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink leading-snug truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {item.color} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium font-mono text-ink flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="space-y-2 text-sm text-ink-soft">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalCount} items)</span>
                    <span className="font-medium">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-success-700">Free</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-base font-bold text-ink">Total</span>
                  <span className="text-xl font-bold font-mono text-ink">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={loading}
                    loadingText="Placing order…"
                    disabled={isMounted && items.length === 0}
                  >
                    Place order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
