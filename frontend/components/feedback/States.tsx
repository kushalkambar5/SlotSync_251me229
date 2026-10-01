import { AlertCircle, CheckCircle2, Inbox, Loader2, ShieldAlert } from "lucide-react";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-600" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-[#EF2B4D]" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-6 py-12 text-center" role="alert">
      <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
      <p className="text-sm font-semibold text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-[#F4F5F7]/50 px-6 py-12 text-center">
      <Inbox className="h-8 w-8 text-gray-400" aria-hidden="true" />
      <p className="text-sm font-bold text-[#1F1F1F]">{title}</p>
      {hint && <p className="max-w-sm text-xs text-gray-500">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function PermissionDenied({
  message = "You don't have permission to view this. If you believe this is a mistake, contact your administrator.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center" role="alert">
      <ShieldAlert className="h-8 w-8 text-amber-600" aria-hidden="true" />
      <p className="text-sm font-bold text-amber-900">Permission denied</p>
      <p className="max-w-md text-xs text-amber-800">{message}</p>
    </div>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800" role="status">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
