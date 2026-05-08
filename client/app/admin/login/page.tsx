"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If admin was trying to reach a specific admin page, go back there
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(email: string, password: string): FormErrors {
    const errs: FormErrors = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Minimum 6 characters";
    return errs;
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const validationErrors = validate(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: "owner", // 👈 silently sent — user never sees this
        redirect: false,
      });

      if (result?.error) {
        setErrors({
          general: "Invalid credentials or you don't have admin access.",
        });
        return;
      }

      // Extra safety check — verify backend actually returned owner role.
      // getSession() triggers jwt() → session() callbacks and returns
      // the fresh session with role populated.
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      if (session?.user?.role !== "owner") {
        // Backend returned a non-owner role despite us requesting owner.
        // Sign them out immediately and show an error.
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
        setErrors({
          general: "Access denied. This portal is for admins only.",
        });
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card — dark theme to visually distinguish from customer login */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            {/* Admin badge */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold
                             bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 mb-4"
            >
              Admin Portal
            </span>
            <h1 className="text-2xl font-bold text-white">Sign in as Admin</h1>
            <p className="text-sm text-gray-400 mt-1">
              Restricted to authorized personnel only
            </p>
          </div>

          {/* General error banner */}
          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                name="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors
                           bg-gray-700 border border-gray-600 text-white
                           placeholder:text-gray-500
                           focus:border-yellow-400
                           aria-[invalid]:border-red-400"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors
                           bg-gray-700 border border-gray-600 text-white
                           placeholder:text-gray-500
                           focus:border-yellow-400
                           aria-[invalid]:border-red-400"
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 px-4 py-2 rounded-lg text-sm font-medium
                         transition-all duration-150
                         bg-yellow-400 text-gray-900
                         hover:bg-yellow-300 active:bg-yellow-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Not an admin?{" "}
            <Link
              href="/login"
              className="text-yellow-400 hover:underline font-medium"
            >
              Customer login
            </Link>
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
