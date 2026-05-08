import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-200 mb-4">403</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">
          You don&apos;t have permission to view this page.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-medium
                       bg-blue-600 text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium
                       border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
