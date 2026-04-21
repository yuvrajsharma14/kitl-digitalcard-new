"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  cardId:      string;
  displayName: string;
}

export function DeleteCardButton({ cardId, displayName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/v1/cards/${cardId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500 truncate">Delete "{displayName}"?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors shrink-0"
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="rounded-md border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
      title="Delete card"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
