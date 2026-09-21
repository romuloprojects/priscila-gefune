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

function parseCookies(value: string | null) {
  const out: Record<string, string> = {};
  for (const part of (value || "").split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) continue;
    out[rawKey] = decodeURIComponent(rest.join("="));
  }
  return out;
}

const SESSION_COOKIE = "atelier_session";

async function callN8n(path: string, request: Request, token?: string): Promise<Response> {
  const incoming = new URL(request.url);
  const target = new URL(`${getN8nBaseUrl()}${path}`);
  target.search = incoming.search;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (token) headers.set("authorization", `Bearer ${token}`);
  const ua = request.headers.get("user-agent");
  if (ua) headers.set("user-agent", ua);
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;
  return fetch(target, { method, headers, body: hasBody ? body : undefined, redirect: "manual", cache: "no-store" });
}

type SessionPayload = {
  ok?: boolean;
  authenticated?: boolean;
  user?: { id?: string; name?: string; username?: string; role?: "admin" | "inventory" };
  expires_at?: string;
};

async function getSession(request: Request, token: string): Promise<SessionPayload | null> {
  const probe = new Request(new URL("/api/atelier/auth/session", request.url), { method: "GET", headers: { accept: "application/json" } });
  try {
    const response = await callN8n("/auth/session", probe, token);
    if (!response.ok) return null;
    const payload = await response.json() as SessionPayload;
    return payload.ok === true && payload.authenticated === true ? payload : null;
  } catch { return null; }
}

const INVENTORY_ROLE_PATHS = new Set([
  "/auth/session",
  "/auth/logout",
  "/inventory",
  "/inventory-update",
  "/inventory/availability",
  "/inventory-movements",
]);

function isAllowedForRole(role: string | undefined, suffix: string) {
  if (role !== "inventory") return true;
  return INVENTORY_ROLE_PATHS.has(suffix);
}

async function sanitizeInventoryRequest(request: Request, suffix: string, role: string | undefined) {
  if (role !== "inventory" || !["/inventory", "/inventory-update"].includes(suffix) || request.method.toUpperCase() === "GET") return request;
  const body = await request.clone().json().catch(() => ({})) as Record<string, unknown>;
  delete body.default_unit_price;
  return new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify(body),
  });
}

function stripCommercialInventoryFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripCommercialInventoryFields);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === "default_unit_price") continue;
      out[key] = stripCommercialInventoryFields(child);
    }
    return out;
  }
  return value;
}


function safePdfFilenamePart(value: unknown, fallback = "Cliente") {
  const clean = String(value ?? fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return clean || fallback;
}

function pdfFilenameDate(value: unknown) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "sem-data";
}

function proposalPdfContentDisposition(filename: string) {
  const safe = filename.replace(/["\r\n]/g, "");
  return `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

async function resolveProposalPdfFilename(request: Request, token: string) {
  try {
    // Reutiliza o mesmo ?id=<uuid> recebido em /proposal-pdf.
    // callN8n preserva a query string do Request.
    const detailRequest = new Request(request.url, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    const response = await callN8n("/proposal-detail", detailRequest, token);
    if (!response.ok) return null;

    const payload = await response.json() as any;
    if (!payload?.ok) return null;

    const recipientName =
      payload?.client?.name ||
      payload?.data?.recipient_name ||
      "Cliente";

    const eventDate =
      payload?.event?.event_date ||
      payload?.data?.event_date_snapshot ||
      "";

    return `Proposta_${safePdfFilenamePart(recipientName)}_${pdfFilenameDate(eventDate)}.pdf`;
  } catch {
    return null;
  }
}

async function proxyAtelierApi(request: Request): Promise<Response | null> {
  const incoming = new URL(request.url);
  const prefix = "/api/atelier";
  if (incoming.pathname !== prefix && !incoming.pathname.startsWith(`${prefix}/`)) return null;

  const suffix = incoming.pathname.slice(prefix.length) || "/";
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE] || "";
  const publicAuth = suffix === "/auth/login";

  if (!publicAuth && suffix !== "/auth/session" && !token) {
    return Response.json({ ok: false, code: "AUTH_REQUIRED", message: "Faça login para continuar." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  let session: SessionPayload | null = null;
  if (!publicAuth && suffix !== "/auth/session") {
    session = await getSession(request, token);
    if (!session) {
      return Response.json({ ok: false, code: "SESSION_EXPIRED", message: "Sua sessão expirou. Entre novamente." }, { status: 401, headers: { "cache-control": "no-store", "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
    }
    if (!isAllowedForRole(session.user?.role, suffix)) {
      return Response.json({ ok: false, code: "FORBIDDEN", message: "Seu usuário não possui acesso a esta área." }, { status: 403, headers: { "cache-control": "no-store" } });
    }
  }

  try {
    if (suffix === "/auth/login") {
      const upstream = await callN8n(suffix, request);
      const payload = await upstream.json() as any;
      if (!upstream.ok || payload?.ok === false || !payload?.token) {
        return Response.json(payload, { status: upstream.ok ? 401 : upstream.status, headers: { "cache-control": "no-store" } });
      }
      const maxAge = payload.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
      const { token: _hidden, ...safe } = payload;
      return Response.json({ ...safe, authenticated: true }, { headers: { "cache-control": "no-store", "set-cookie": `${SESSION_COOKIE}=${encodeURIComponent(payload.token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}` } });
    }

    if (suffix === "/auth/session") {
      if (!token) return Response.json({ ok: false, authenticated: false }, { status: 401, headers: { "cache-control": "no-store" } });
      const upstream = await callN8n(suffix, request, token);
      const body = await upstream.text();
      return new Response(body, { status: upstream.ok ? 200 : upstream.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }

    if (suffix === "/auth/logout") {
      const upstream = await callN8n(suffix, request, token);
      const body = await upstream.text();
      return new Response(body || JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store", "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
    }

    const role = session?.user?.role;
    const outboundRequest = await sanitizeInventoryRequest(request, suffix, role);
    const upstream = await callN8n(suffix, outboundRequest, token);

    if (role === "inventory" && ["/inventory", "/inventory-update", "/inventory/availability", "/inventory-movements"].includes(suffix)) {
      const contentType = upstream.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await upstream.json().catch(() => null);
        if (payload !== null) {
          return Response.json(stripCommercialInventoryFields(payload), {
            status: upstream.status,
            headers: { "cache-control": "no-store" },
          });
        }
      }
    }

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    const upstreamDisposition = upstream.headers.get("content-disposition");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);

    if (suffix.endsWith("/proposal-pdf") && upstream.ok) {
      // O workflow 53 já calcula binary.data.fileName, porém a resposta binária
      // do Webhook não expõe esse metadata como Content-Disposition.
      // O proxy resolve o nome/data da proposta e define o header que o navegador usa ao salvar.
      const dynamicFilename = await resolveProposalPdfFilename(request, token);
      const filename = dynamicFilename || "Proposta_Atelier_Priscila_Gefune.pdf";
      responseHeaders.set("content-disposition", proposalPdfContentDisposition(filename));
    } else if (upstreamDisposition) {
      responseHeaders.set("content-disposition", upstreamDisposition);
    } else if (suffix.endsWith("/meeting-pdf")) {
      responseHeaders.set("content-disposition", 'attachment; filename="relatorio-reuniao-atelier-priscila-gefune.pdf"');
    }

    responseHeaders.set("cache-control", "no-store");
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
  } catch (error) {
    console.error("Falha ao acessar o serviço da aplicação:", error);
    return Response.json({ ok: false, code: "SERVICE_UNAVAILABLE", message: "Não foi possível acessar o serviço da aplicação." }, { status: 502, headers: { "cache-control": "no-store" } });
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
