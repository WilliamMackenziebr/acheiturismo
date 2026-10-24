export function authBaseURL(env: NodeJS.ProcessEnv) {
  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  if (env.VERCEL_ENV !== "production") return env.BETTER_AUTH_URL || "http://localhost:3005";

  const canonical = new URL(env.BETTER_AUTH_URL || "https://www.acheioturismo.com.br");
  if (canonical.protocol !== "https:") throw new Error("Configure um endereço HTTPS para o painel em produção.");
  return {
    allowedHosts: [...new Set([
      canonical.host,
      "www.acheioturismo.com.br",
      "acheioturismo.com.br",
      "acheiturismo.vercel.app",
      "acheiturismo-macksystem.vercel.app",
      ...(env.VERCEL_URL ? [new URL(`https://${env.VERCEL_URL}`).host] : []),
    ])],
    protocol: "https" as const,
    fallback: canonical.origin,
  };
}
