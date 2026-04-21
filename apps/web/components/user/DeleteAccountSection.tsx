"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAccountSection() {
  const [open, setOpen]         = useState(false);
  const [confirm, setConfirm]   = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  const canDelete = confirm === "DELETE";

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/user/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        setDeleting(false);
        return;
      }
      // Account deleted — sign out and redirect
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Permanently delete your account and all associated cards, analytics, and data.
        This action <span className="font-medium text-gray-700">cannot be undone</span>.
      </p>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setConfirm(""); setError(""); } }}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            Delete My Account
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <TriangleAlert className="h-5 w-5" />
              Delete account
            </DialogTitle>
            <DialogDescription className="pt-1">
              This will permanently delete your account, all your digital cards,
              analytics, and every piece of data associated with your account.
              There is no recovery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Type <span className="font-mono font-semibold text-gray-900">DELETE</span> to confirm:
              </p>
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE"
                className={canDelete ? "border-red-400 focus-visible:ring-red-400" : ""}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="min-w-[130px]"
            >
              {deleting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…</>
                : "Yes, delete it"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
