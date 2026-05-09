"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import clsx from "clsx";

function NavItem({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const loading = status === "loading";

  return (
    <nav className="bg-white border-b border-gray-200 z-50 h-16">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-gray-900">
          TShirt.com
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? (
            // Skeleton to prevent layout shift while session loads
            <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
          ) : session ? (
            // ── Logged in ──────────────────────────────────────────────
            <div className="flex items-center gap-3">
              {session.user.role === "customer" && (
                <>
                  <NavItem href="/my-orders">My Orders</NavItem>
                </>
              )}

              {session.user.role === "owner" && (
                <>
                  <Link
                    href="/admin/orders"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/admin/products"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Products
                  </Link>
                </>
              )}

              {/* Avatar + name */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-blue-500 flex items-center
                                  justify-center text-white text-xs font-medium"
                  >
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {session.user.name}
                  </span>
                  <svg
                    className="w-3 h-3 text-gray-400"
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

                {/* Dropdown */}
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-white rounded-xl
                                  border border-gray-200 shadow-lg py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {session.user.email}
                      </p>
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded-full
                                       text-xs font-medium
                                       bg-blue-50 text-blue-600"
                      >
                        {session.user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500
                                 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ── Not logged in ──────────────────────────────────────────
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium
                           text-gray-600 border border-gray-300
                           hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Cart — visible to guests and customers, hidden for owners */}
          {!loading && (!session || session.user.role === "customer") && (
            <Link
              href="/cart"
              aria-label="Cart"
              className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}
