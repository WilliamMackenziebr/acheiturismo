"use client";

export const backendConfigured = process.env.NEXT_PUBLIC_ADMIN_BACKEND === "cloudflare";
export const adminPreviewMode = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ADMIN_PREVIEW === "true";

export interface AdminUser { id: string; email: string; name: string }
export interface AdminSession { user: AdminUser | null; authorized: boolean; storageReady: boolean }

export async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...options.headers }, cache: "no-store", credentials: "same-origin" });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event("achei:session-expired"));
    const message = response.status === 429 ? "Muitas tentativas. Aguarde um minuto antes de tentar novamente."
      : path.includes("/sign-in/") && (response.status === 400 || response.status === 401) ? "Não foi possível entrar. Confira seu e-mail e senha."
      : data?.error && typeof data.error === "string" ? data.error
      : path.includes("/reset-password") ? "Este link expirou ou já foi utilizado. Solicite um novo link de definição de senha."
      : "Não foi possível concluir. Confira a conexão e tente novamente.";
    throw new Error(message);
  }
  return data as T;
}

export function getAdminSession() { return adminRequest<AdminSession>("/api/admin/session"); }

export async function signIn(email: string, password: string) {
  await adminRequest("/api/auth/sign-in/email", { method: "POST", body: JSON.stringify({ email: email.trim(), password, rememberMe: true }) });
  return getAdminSession();
}

export function signOut() { return adminRequest("/api/auth/sign-out", { method: "POST", body: "{}" }); }

export function setPassword(token: string, newPassword: string) {
  return adminRequest("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });
}
