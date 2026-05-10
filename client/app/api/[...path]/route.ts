import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await getServerSession(authOptions);
  const { path } = await params;

  const url = new URL(req.url);
  const backendUrl = `${process.env.BACKEND_URL}/${path.join("/")}${url.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (session?.accessToken) {
    headers.set("cookie", `access_token=${session.accessToken}`);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  const res = await fetch(backendUrl, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    // required when streaming req.body
    duplex: "half",
    cache: "no-store",
  } as RequestInit);

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
