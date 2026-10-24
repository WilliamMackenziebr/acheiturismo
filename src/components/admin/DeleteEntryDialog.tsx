"use client";

import { useEffect, useRef, useState } from "react";
import { SpinnerGap, Trash, X } from "@phosphor-icons/react";
import { friendlyError } from "@/lib/admin-store";
import type { AdminEntry } from "@/types/admin";

export function DeleteEntryDialog({ entry, onClose, onDelete }: { entry: AdminEntry; onClose: () => void; onDelete: (entry: AdminEntry) => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  async function confirm() {
    setBusy(true); setError("");
    try { await onDelete(entry); }
    catch (cause) { setError(friendlyError(cause)); setBusy(false); }
  }
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <button className="admin-icon-button admin-delete-close" aria-label="Cancelar exclusão" disabled={busy} onClick={onClose}><X size={20} /></button>
    <Trash size={32} className="admin-delete-icon" />
    <h2 id="delete-title">Excluir este cadastro?</h2>
    <p id="delete-description"><strong>{entry.name}</strong> será removido do painel e do site. Esta ação não pode ser desfeita pelo painel.</p>
    {error && <div className="admin-alert" role="alert">{error}</div>}
    <div className="admin-delete-actions"><button className="admin-button admin-button--outline" disabled={busy} onClick={onClose} autoFocus>Cancelar</button><button className="admin-button admin-button--danger" disabled={busy} onClick={() => void confirm()}>{busy ? <SpinnerGap className="admin-spin" /> : <Trash size={17} />}{busy ? "Excluindo…" : "Excluir cadastro"}</button></div>
  </dialog>;
}
