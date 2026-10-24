"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck, SpinnerGap } from "@phosphor-icons/react";
import { setPassword } from "@/lib/admin-api";
import { friendlyError } from "@/lib/admin-store";
import { PasswordInput } from "./PasswordInput";

export function PasswordSetup({ token, onComplete, onBack }: { token: string; onComplete: () => void; onBack: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== data.get("confirm")) { setError("As senhas precisam ser iguais."); return; }
    setBusy(true); setError("");
    try { await setPassword(token, password); onComplete(); }
    catch (cause) { setError(friendlyError(cause)); }
    finally { setBusy(false); }
  }
  return <div className="admin-app admin-loading"><section className="admin-login-form admin-password-setup"><div><ShieldCheck size={36} /><span className="admin-eyebrow">SEU ACESSO AO ACHEI</span><h1>Defina sua senha.</h1><p>Use pelo menos 12 caracteres para proteger seu painel.</p>{error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}<form onSubmit={submit}><div className="admin-field"><label htmlFor="setup-password">Nova senha</label><PasswordInput id="setup-password" name="password" visibilityLabel="nova senha" autoComplete="new-password" minLength={12} maxLength={128} required autoFocus /></div><div className="admin-field"><label htmlFor="setup-confirm">Confirme a nova senha</label><PasswordInput id="setup-confirm" name="confirm" visibilityLabel="confirmação da senha" autoComplete="new-password" minLength={12} maxLength={128} required /></div><button className="admin-button" disabled={busy}>{busy && <SpinnerGap className="admin-spin" />}{busy ? "Salvando…" : "Salvar minha senha"}</button><button type="button" className="admin-back-link" onClick={onBack} disabled={busy}>Voltar ao login</button></form></div></section></div>;
}
