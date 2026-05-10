"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { XCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(email: string, password: string): FormErrors {
    const errs: FormErrors = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Minimum 6 characters";
    return errs;
  }

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
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Invalid email or password. Please try again." });
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-gray-50 flex">
      <div className="flex-1 flex justify-center px-6 py-12 mt-10">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your account to continue shopping.
            </p>
          </div>

          {/* Error banner */}
          {errors.general && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              defaultValue="bob@example.com"
              autoComplete="off"
              error={errors.email}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              defaultValue="Bob@1234"
              autoComplete="off"
              error={errors.password}
            />

            <Button
              type="submit"
              loading={loading}
              loadingText="Signing in…"
              fullWidth
              className="mt-1"
            >
              Sign in
            </Button>
          </form>

          {/* Divider + footer links */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 font-medium hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
