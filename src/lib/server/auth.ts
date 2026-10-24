import { betterAuth } from "better-auth";
import { database } from "@/lib/server/d1";
import { authBaseURL } from "@/lib/server/auth-origin";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("O acesso ao painel ainda não foi configurado.");
  return betterAuth({
    appName: "Achei Turismo",
    baseURL: authBaseURL(process.env),
    secret,
    database: database(),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
    },
    session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60 },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 60, customRules: { "/sign-in/email": { window: 60, max: 5 }, "/reset-password": { window: 60, max: 5 } } },
    // Schema is managed by the provision script; avoid introspection per cold start.
    advanced: { database: { validateSchema: false } },
    telemetry: { enabled: false },
  });
}

let instance: ReturnType<typeof createAuth> | undefined;
export function adminAuth() { return instance ??= createAuth(); }

export async function adminSession(headers: Headers) {
  const session = await adminAuth().api.getSession({ headers });
  if (!session) return { user: null, authorized: false };
  const result = await database().prepare("SELECT user_id FROM administrators WHERE user_id = ?").bind(session.user.id).all();
  return { user: { id: session.user.id, name: session.user.name, email: session.user.email }, authorized: result.results.length === 1 };
}
