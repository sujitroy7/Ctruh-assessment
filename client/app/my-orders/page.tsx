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

type Order = {
  id: string;
  customer_id: string;
  product_item_id: string;
  item_qty: number;
  purchased: boolean;
  is_deleted: boolean;
  product_name: string;
  product_price: number;
  order_date: string;
  estimated_delivery?: string;
  category: string;
  size: string;
  color: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    customer_id: "cust_abc",
    product_item_id: "prod_101",
    item_qty: 2,
    purchased: true,
    is_deleted: false,
    product_name: "Classic Logo Tee",
    product_price: 29.99,
    order_date: "2026-04-28",
    category: "Graphic Tees",
    size: "L",
    color: "White",
  },
  {
    id: "ord_002",
    customer_id: "cust_abc",
    product_item_id: "prod_204",
    item_qty: 1,
    purchased: false,
    is_deleted: false,
    product_name: "Essential Oversized Tee",
    product_price: 34.99,
    order_date: "2026-05-06",
    estimated_delivery: "2026-05-12",
    category: "Oversized",
    size: "XL",
    color: "Black",
  },
  {
    id: "ord_003",
    customer_id: "cust_abc",
    product_item_id: "prod_317",
    item_qty: 1,
    purchased: true,
    is_deleted: false,
    product_name: "Vintage Stripe Polo",
    product_price: 44.99,
    order_date: "2026-04-15",
    category: "Polo",
    size: "M",
    color: "Navy",
  },
  {
    id: "ord_004",
    customer_id: "cust_abc",
    product_item_id: "prod_089",
    item_qty: 3,
    purchased: false,
    is_deleted: false,
    product_name: "Kids Dino Print Tee",
    product_price: 19.99,
    order_date: "2026-05-07",
    estimated_delivery: "2026-05-14",
    category: "Kids",
    size: "8Y",
    color: "Green",
  },
  {
    id: "ord_005",
    customer_id: "cust_abc",
    product_item_id: "prod_422",
    item_qty: 2,
    purchased: true,
    is_deleted: false,
    product_name: "Minimalist Plain Tee",
    product_price: 24.99,
    order_date: "2026-03-30",
    category: "Plain",
    size: "S",
    color: "Grey",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Graphic Tees": "bg-primary-50 text-primary-600",
  Oversized: "bg-secondary-50 text-secondary-600",
  Polo: "bg-success-50 text-success-700",
  Kids: "bg-warning-50 text-warning-700",
  Plain: "bg-neutral-100 text-ink-muted",
};

type Tab = "all" | "pending" | "purchased";

const TABS_KEYS = ["all", "pending", "purchased"] as const;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "purchased", label: "Delivered" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function OrderCard({
  order,
  onCancel,
}: {
  order: Order;
  onCancel: (id: string) => void;
}) {
  const total = (order.product_price * order.item_qty).toFixed(2);
  const categoryColor =
    CATEGORY_COLORS[order.category] ?? "bg-neutral-100 text-ink-muted";

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
              {formatDate(order.order_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Total
            </p>
            <p className="text-sm font-bold font-mono text-ink">${total}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Items
            </p>
            <p className="text-sm font-medium text-ink">{order.item_qty}</p>
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
        {/* Product image placeholder */}
        <div
          className={clsx(
            "flex-shrink-0 w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1",
            categoryColor,
          )}
        >
          <Package className="w-7 h-7" />
          <span className="text-[10px] font-medium tracking-wide">
            {order.category}
          </span>
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Status line */}
              {order.purchased ? (
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-success-700">
                    Delivered
                  </span>
                  <span className="text-xs text-ink-muted">
                    · {formatDate(order.order_date)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-1">
                  <Truck className="w-4 h-4 text-warning-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-warning-700">
                    Arriving{" "}
                    {order.estimated_delivery
                      ? formatDate(order.estimated_delivery)
                      : "soon"}
                  </span>
                </div>
              )}

              <p className="text-sm font-medium text-ink leading-snug truncate">
                {order.product_name}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {order.size} &nbsp;·&nbsp; {order.color} &nbsp;·&nbsp; Qty:{" "}
                {order.item_qty} &nbsp;·&nbsp;{" "}
                <span className="font-mono">
                  ${order.product_price.toFixed(2)}
                </span>{" "}
                each
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {order.purchased ? (
              <>
                <Button variant="primary" size="sm">
                  Buy it again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Star className="w-3.5 h-3.5" />}
                >
                  Write a review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Return or replace
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" size="sm">
                  Track package
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={() => onCancel(order.id)}
                >
                  Cancel order
                </Button>
              </>
            )}
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
      prev.map((o) => (o.id === id ? { ...o, is_deleted: true } : o)),
    );
  }

  const visible = orders
    .filter((o) => !o.is_deleted)
    .filter((o) => {
      if (activeTab === "pending") return !o.purchased;
      if (activeTab === "purchased") return o.purchased;
      return true;
    });

  const counts = {
    all: orders.filter((o) => !o.is_deleted).length,
    pending: orders.filter((o) => !o.is_deleted && !o.purchased).length,
    purchased: orders.filter((o) => !o.is_deleted && o.purchased).length,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Page heading */}
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
              : activeTab === "pending"
                ? "You have no pending orders."
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
