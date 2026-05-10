import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.url(),
  BACKEND_URL: z.url(),
  NEXTAUTH_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);
console.log(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    parsed.error.flatten().fieldErrors,
  );

  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
