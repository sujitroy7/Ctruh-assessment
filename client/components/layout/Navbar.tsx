"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import clsx from "clsx";
import { useCartStore, selectTotalCount } from "@/lib/store/cart";

function NavItem({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "text-sm text-ink-soft hover:text-ink transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loading = status === "loading";
  const cartCount = useCartStore(selectTotalCount);

  function closeAll() {
    setDropdownOpen(false);
    setMobileOpen(false);
  }

  return (
    <nav className="sticky top-0 z-sticky bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-ink">
          TShirt.com
        </Link>

        {/* ── Desktop nav (md+) ──────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-24 bg-neutral-100 rounded-md animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              {session?.user?.role === "customer" && (
                <NavItem href="/my-orders">My Orders</NavItem>
              )}
              {session?.user?.role === "owner" && (
                <>
                  <NavItem href="/admin/products">Products</NavItem>
                </>
              )}

              {/* Avatar + dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md
                             border border-border hover:bg-neutral-50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-primary-500 flex items-center
                                justify-center text-ink-inverse text-xs font-medium"
                  >
                    {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm text-ink-soft hidden lg:block">
                    {session?.user?.name}
                  </span>
                  <svg
                    className="w-3 h-3 text-ink-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-surface rounded-lg
                                border border-border shadow-dropdown py-1 z-dropdown"
                  >
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-ink-muted">Signed in as</p>
                      <p className="text-sm font-medium text-ink-soft truncate">
                        {session?.user?.email}
                      </p>
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded-sm
                                   text-xs font-medium bg-primary-50 text-primary-600"
                      >
                        {session?.user?.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        closeAll();
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-error-500
                                 hover:bg-error-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-md text-sm font-medium
                         text-ink-soft border border-border hover:bg-neutral-50 transition-colors"
            >
              Sign in
            </Link>
          )}

          {/* Cart */}
          {!loading && (!session || session?.user?.role === "customer") && (
            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
              className="relative p-1.5 text-ink-muted hover:text-ink transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary-600 text-ink-inverse text-[10px] font-semibold leading-none px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* ── Mobile right side (< md) ───────────────────────────── */}
        <div className="flex md:hidden items-center gap-1">
          {!loading && (!session || session?.user?.role === "customer") && (
            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
              className="relative p-2 text-ink-muted hover:text-ink transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary-600 text-ink-inverse text-[10px] font-semibold leading-none px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {loading ? (
            <div className="h-8 w-8 bg-neutral-100 rounded-md animate-pulse" />
          ) : (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="p-2 text-ink-muted hover:text-ink transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile menu panel ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {session ? (
              <>
                {/* User info row */}
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-full bg-primary-500 flex items-center
                                justify-center text-ink-inverse text-sm font-medium shrink-0"
                  >
                    {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-ink-muted truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <span
                    className="ml-auto shrink-0 px-2 py-0.5 rounded-sm
                               text-xs font-medium bg-primary-50 text-primary-600"
                  >
                    {session?.user?.role}
                  </span>
                </div>

                {/* Nav links */}
                {session?.user?.role === "customer" && (
                  <NavItem
                    href="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md hover:bg-neutral-50 block"
                  >
                    My Orders
                  </NavItem>
                )}
                {session?.user?.role === "owner" && (
                  <>
                    <NavItem
                      href="/admin/orders"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-neutral-50 block"
                    >
                      Orders
                    </NavItem>
                    <NavItem
                      href="/admin/products"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 rounded-md hover:bg-neutral-50 block"
                    >
                      Products
                    </NavItem>
                  </>
                )}

                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      closeAll();
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm
                               text-error-500 hover:bg-error-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-center
                           text-ink-soft border border-border hover:bg-neutral-50 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Click-outside overlay for desktop dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-raised"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
