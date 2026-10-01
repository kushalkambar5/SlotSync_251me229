"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea, Label, FieldError } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api/errors";

function ReasonDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (reason.trim().length < 3) {
      setError("Please provide a reason (min 3 characters).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-3">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Event postponed by department…"
        />
        <FieldError message={error ?? undefined} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={submit} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

export function CancellationDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  return (
    <ReasonDialog
      open={open}
      onClose={onClose}
      title="Request cancellation"
      description="Your approved booking will move to Cancellation Requested. An admin must approve it before it is cancelled."
      confirmLabel="Submit request"
      onConfirm={onConfirm}
    />
  );
}

export function RejectBookingDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  return (
    <ReasonDialog
      open={open}
      onClose={onClose}
      title="Reject booking"
      description="A reason is required — the requester will see it in their notification."
      confirmLabel="Reject booking"
      danger
      onConfirm={onConfirm}
    />
  );
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => void onConfirm()} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
