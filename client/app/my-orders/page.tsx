"use client";

import { useState } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import clsx from "clsx";
import {
  Package,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  id: string;
  product_item_id: string;
  product_name: string;
  gender: string;
  type: string;
  color: string;
  unit_price: number;
  item_qty: number;
  thumbnail_url?: string;
};

type Order = {
  id: string;
  customer_id: string;
  items: OrderItem[];
  status: OrderStatus;
  payment_status: string;
  total_amount: number;
  tracking_number?: string;
  createdAt: string;
  updatedAt: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    customer_id: "cust_abc",
    items: [
      {
        id: "item_1",
        product_item_id: "prod_101",
        product_name: "Classic Logo Tee",
        gender: "unisex",
        type: "Graphic Tees",
        color: "White",
        unit_price: 29.99,
        item_qty: 2,
      },
    ],
    status: "delivered",
    payment_status: "paid",
    total_amount: 59.98,
    createdAt: "2026-04-28T10:00:00.000Z",
    updatedAt: "2026-04-30T10:00:00.000Z",
  },
  {
    id: "ord_002",
    customer_id: "cust_abc",
    items: [
      {
        id: "item_2",
        product_item_id: "prod_204",
        product_name: "Essential Oversized Tee",
        gender: "unisex",
        type: "Oversized",
        color: "Black",
        unit_price: 34.99,
        item_qty: 1,
      },
    ],
    status: "shipped",
    payment_status: "paid",
    total_amount: 34.99,
    tracking_number: "TRK998877",
    createdAt: "2026-05-06T10:00:00.000Z",
    updatedAt: "2026-05-07T10:00:00.000Z",
  },
  {
    id: "ord_003",
    customer_id: "cust_abc",
    items: [
      {
        id: "item_3",
        product_item_id: "prod_317",
        product_name: "Vintage Stripe Polo",
        gender: "male",
        type: "Polo",
        color: "Navy",
        unit_price: 44.99,
        item_qty: 1,
      },
    ],
    status: "delivered",
    payment_status: "paid",
    total_amount: 44.99,
    createdAt: "2026-04-15T10:00:00.000Z",
    updatedAt: "2026-04-20T10:00:00.000Z",
  },
  {
    id: "ord_004",
    customer_id: "cust_abc",
    items: [
      {
        id: "item_4",
        product_item_id: "prod_089",
        product_name: "Kids Dino Print Tee",
        gender: "unisex",
        type: "Kids",
        color: "Green",
        unit_price: 19.99,
        item_qty: 3,
      },
    ],
    status: "confirmed",
    payment_status: "paid",
    total_amount: 59.97,
    createdAt: "2026-05-07T10:00:00.000Z",
    updatedAt: "2026-05-07T10:00:00.000Z",
  },
  {
    id: "ord_005",
    customer_id: "cust_abc",
    items: [
      {
        id: "item_5",
        product_item_id: "prod_422",
        product_name: "Minimalist Plain Tee",
        gender: "unisex",
        type: "Plain",
        color: "Grey",
        unit_price: 24.99,
        item_qty: 2,
      },
    ],
    status: "delivered",
    payment_status: "paid",
    total_amount: 49.98,
    createdAt: "2026-03-30T10:00:00.000Z",
    updatedAt: "2026-04-05T10:00:00.000Z",
  },
];

const TYPE_COLORS: Record<string, string> = {
  "Graphic Tees": "bg-primary-50 text-primary-600",
  Oversized: "bg-secondary-50 text-secondary-600",
  Polo: "bg-success-50 text-success-700",
  Kids: "bg-warning-50 text-warning-700",
  Plain: "bg-neutral-100 text-ink-muted",
};

type Tab = "all" | "active" | "delivered";

const TABS_KEYS = ["all", "active", "delivered"] as const;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
];

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getEstimatedDelivery(createdAt: string): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

function StatusLine({ order }: { order: Order }) {
  if (order.status === "delivered") {
    return (
      <div className="flex items-center gap-1.5 mb-1">
        <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-success-700">
          Delivered
        </span>
        <span className="text-xs text-ink-muted">
          · {formatDate(order.updatedAt)}
        </span>
      </div>
    );
  }

  if (order.status === "cancelled") {
    return (
      <div className="flex items-center gap-1.5 mb-1">
        <XCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-error-700">Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 mb-1">
      <Truck className="w-4 h-4 text-warning-600 flex-shrink-0" />
      <span className="text-sm font-semibold text-warning-700">
        Arriving {formatDate(getEstimatedDelivery(order.createdAt))}
      </span>
    </div>
  );
}

function OrderCard({
  order,
  onCancel,
}: {
  order: Order;
  onCancel: (id: string) => void;
}) {
  const firstItem = order.items[0];
  const typeColor =
    TYPE_COLORS[firstItem?.type ?? ""] ?? "bg-neutral-100 text-ink-muted";
  const totalItems = order.items.reduce((sum, i) => sum + i.item_qty, 0);

  return (
    <li className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 border-b border-border">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Order placed
            </p>
            <p className="text-sm font-medium text-ink">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Total
            </p>
            <p className="text-sm font-bold font-mono text-ink">
              ${order.total_amount.toFixed(2)}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Items
            </p>
            <p className="text-sm font-medium text-ink">{totalItems}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-xs text-ink-muted">
              Order # <span className="font-mono text-ink">{order.id}</span>
            </p>
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5 ml-auto">
              View details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4 flex items-start gap-4">
        {firstItem?.thumbnail_url ? (
          <img
            src={firstItem.thumbnail_url}
            alt={firstItem.product_name}
            className="flex-shrink-0 w-20 h-20 rounded-lg object-cover"
          />
        ) : (
          <div
            className={clsx(
              "flex-shrink-0 w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1",
              typeColor,
            )}
          >
            <Package className="w-7 h-7" />
            <span className="text-[10px] font-medium tracking-wide text-center px-1">
              {firstItem?.type}
            </span>
          </div>
        )}

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <div className="min-w-0">
            <StatusLine order={order} />
            <p className="text-sm font-medium text-ink leading-snug truncate">
              {firstItem?.product_name}
            </p>
            <p className="text-sm text-ink-muted mt-0.5">
              {firstItem?.color} &nbsp;·&nbsp; Qty: {firstItem?.item_qty}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(TABS_KEYS).withDefault("all"),
  );

  function handleCancel(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "cancelled" as const } : o,
      ),
    );
  }

  const visible = orders.filter((o) => {
    if (activeTab === "active") return ACTIVE_STATUSES.includes(o.status);
    if (activeTab === "delivered") return o.status === "delivered";
    return true;
  });

  const counts = {
    all: orders.length,
    active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold leading-tight text-ink mb-6">
        My Orders
      </h1>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === tab.key
                ? "text-primary-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary-600"
                : "text-ink-muted hover:text-ink-soft",
            )}
          >
            {tab.label}
            <span
              className={clsx(
                "ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs",
                activeTab === tab.key
                  ? "bg-primary-50 text-primary-600"
                  : "bg-neutral-100 text-ink-muted",
              )}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Order list */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-ink-muted">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-ink">No orders found</p>
          <p className="text-xs text-ink-muted mt-1">
            {activeTab === "all"
              ? "You haven't placed any orders yet."
              : activeTab === "active"
                ? "You have no active orders."
                : "You have no delivered orders."}
          </p>
          <Button variant="secondary" size="sm" className="mt-4">
            Start shopping
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} />
          ))}
        </ul>
      )}
    </main>
  );
}
