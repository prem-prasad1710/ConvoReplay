/**
 * Groq uses HTTPS; Node may fail with UNABLE_TO_GET_ISSUER_CERT_LOCALLY when:
 * - Corporate SSL inspection / missing root CA in Node's trust store
 * - Broken macOS/Homebrew OpenSSL chain
 *
 * Proper fix: set NODE_EXTRA_CA_CERTS=/path/to/corporate-root.pem
 * Dev-only escape hatch: GROQ_TLS_INSECURE=1 (disables TLS verification for Groq requests only)
 */
import { Agent, fetch as undiciFetch } from "undici";

let insecureDispatcher: Agent | undefined;

export function groqCompatibleFetch(
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (process.env.GROQ_TLS_INSECURE === "1") {
    insecureDispatcher ??= new Agent({
      connect: { rejectUnauthorized: false },
    });
    // undici's Response type differs from globalThis.Response; OpenAI client only needs a Web Response at runtime.
    return undiciFetch(
      // OpenAI passes Request in some paths; undici's typings expect undici.Request — runtime is compatible.
      url as Parameters<typeof undiciFetch>[0],
      {
        ...init,
        dispatcher: insecureDispatcher,
      } as Parameters<typeof undiciFetch>[1] & { dispatcher: Agent }
    ) as unknown as Promise<Response>;
  }

  return fetch(url, init);
}

/** Walk Error.cause chain for TLS / fetch diagnostics */
export function flattenErrorChain(e: unknown): string {
  const parts: string[] = [];
  let cur: unknown = e;
  for (let i = 0; i < 8 && cur != null; i++) {
    if (cur instanceof Error) {
      parts.push(cur.message);
      const code = (cur as NodeJS.ErrnoException).code;
      if (typeof code === "string") parts.push(code);
      cur = cur.cause;
    } else {
      parts.push(String(cur));
      break;
    }
  }
  return parts.join(" ");
}
