import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

const DEFAULT_N8N_WEBHOOK_BASE = "https://n8n.facilities-ai.com.br/webhook/atelier";

function getN8nBaseUrl() {
  const configured = process.env.N8N_WEBHOOK_BASE_URL?.trim();
  return (configured || DEFAULT_N8N_WEBHOOK_BASE).replace(/\/$/, "");
}

async function proxyAtelierApi(request: Request): Promise<Response | null> {
  const incoming = new URL(request.url);
  const prefix = "/api/atelier";
  if (incoming.pathname !== prefix && !incoming.pathname.startsWith(`${prefix}/`)) {
    return null;
  }

  const suffix = incoming.pathname.slice(prefix.length) || "/";
  const target = new URL(`${getN8nBaseUrl()}${suffix}`);
  target.search = incoming.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body: hasBody ? body : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    const upstreamDisposition = upstream.headers.get("content-disposition");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);
    if (upstreamDisposition) responseHeaders.set("content-disposition", upstreamDisposition);
    if (!upstreamDisposition && suffix.endsWith("/pdf")) {
      responseHeaders.set("content-disposition", 'inline; filename="proposta-atelier-priscila-gefune.pdf"');
    }
    responseHeaders.set("cache-control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Falha ao acessar n8n:", error);
    return Response.json(
      {
        ok: false,
        code: "N8N_UNREACHABLE",
        message: "Não foi possível acessar o backend n8n.",
      },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const proxied = await proxyAtelierApi(request);
      if (proxied) return proxied;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
