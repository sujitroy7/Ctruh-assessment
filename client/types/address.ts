export type ShippingAddress = {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
};

export type Address = ShippingAddress & {
  id: string;
  idempotency_key: string;
};
