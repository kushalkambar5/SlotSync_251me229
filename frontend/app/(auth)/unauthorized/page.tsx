import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7]/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-4xl font-extrabold text-amber-600">403</p>
        <h1 className="mt-2 text-xl font-bold text-[#1F1F1F]">Not authorized</h1>
        <p className="mt-2 text-sm text-amber-900">
          You are signed in, but your role does not have permission to view
          this page. Contact your administrator if you need access.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#EF2B4D] px-4 py-2 text-sm font-bold text-white hover:bg-[#D81E40]"
          >
            Go to dashboard
          </Link>
          <Link
            href="/facilities"
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1F1F1F] ring-1 ring-gray-300 hover:bg-gray-50"
          >
            Browse facilities
          </Link>
        </div>
      </div>
    </div>
  );
}
