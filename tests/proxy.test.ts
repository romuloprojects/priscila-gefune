import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import server from "../src/server";
import { atelierApi, AtelierApiError } from "../src/services/atelierApi";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const request = (path: string, body?: unknown, cookie = "atelier_session=test") =>
  new Request("https://atelier.example/api/atelier" + path, {
    headers: { cookie, "content-type": "application/json" },
    ...(body === undefined ? {} : { method: "POST", body: JSON.stringify(body) }),
  });
const handle = (req: Request) => server.fetch(req, {}, {});
function backend(
  role: string | undefined,
  respond: (url: URL, init: RequestInit) => Response | Promise<Response>,
) {
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/auth/session"))
      return Response.json({ ok: true, authenticated: true, user: { role } });
    return respond(url, init);
  };
}

test("unauthenticated request does not reach upstream", async () => {
  globalThis.fetch = async () => {
    throw Error("Must not fetch");
  };
  assert.equal((await handle(request("/inventory", undefined, ""))).status, 401);
});
test("malformed session cookie returns JSON 401 rather than SSR 500", async () => {
  const response = await handle(request("/inventory", undefined, "atelier_session=%E0%A4%A"));
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, "AUTH_REQUIRED");
});
test("login stores token only in HttpOnly cookie", async () => {
  globalThis.fetch = async () =>
    Response.json({ ok: true, token: "secret/token", remember: true, user: { role: "admin" } });
  const response = await handle(request("/auth/login", { username: "test", password: "test" }, ""));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).token, undefined);
  assert.match(
    response.headers.get("set-cookie")!,
    /secret%2Ftoken.*HttpOnly; Secure; SameSite=Lax/,
  );
});
test("unknown and absent roles cannot access protected business data", async () => {
  for (const role of [undefined, "unexpected"]) {
    backend(role, () => {
      throw Error("Business endpoint must not be called");
    });
    assert.equal((await handle(request("/proposals"))).status, 403);
  }
});
test("inventory role cannot access proposals", async () => {
  backend("inventory", () => {
    throw Error("Forbidden endpoint");
  });
  assert.equal((await handle(request("/proposals"))).status, 403);
});
test("inventory role cannot alter commercial price or archive item", async () => {
  backend("inventory", (_url, init) => {
    const body = JSON.parse(
      String(init.body && new TextDecoder().decode(init.body as ArrayBuffer)),
    );
    assert.deepEqual(body, { id: "i1", total_quantity: 20 });
    return Response.json({ ok: true, data: { ...body, default_unit_price: 99 } });
  });
  const response = await handle(
    request("/inventory-update", {
      id: "i1",
      total_quantity: 20,
      default_unit_price: 1,
      active: false,
    }),
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.default_unit_price, undefined);
});
test("admin update preserves IDs, prices and logical deletion", async () => {
  const payload = { id: "i1", active: false, default_unit_price: 55 };
  backend("admin", (_url, init) => {
    assert.deepEqual(JSON.parse(new TextDecoder().decode(init.body as ArrayBuffer)), payload);
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer test");
    return Response.json({ ok: true, data: payload });
  });
  assert.deepEqual(
    (await (await handle(request("/inventory-update", payload))).json()).data,
    payload,
  );
});
test("nested inventory response strips prices only for inventory user", async () => {
  backend("inventory", () =>
    Response.json({
      ok: true,
      data: [
        { id: "i1", default_unit_price: 2, nested: { default_unit_price: 3, total_quantity: 4 } },
      ],
    }),
  );
  assert.deepEqual((await (await handle(request("/inventory"))).json()).data, [
    { id: "i1", nested: { total_quantity: 4 } },
  ]);
});
test("PDF remains binary, preserves query and receives recipient filename", async () => {
  const bytes = new Uint8Array([37, 80, 68, 70, 45, 0, 255]);
  backend("admin", (url) => {
    assert.equal(url.searchParams.get("id"), "p1");
    if (url.pathname.endsWith("/proposal-detail"))
      return Response.json({
        ok: true,
        client: { name: "Márcia Silva" },
        event: { event_date: "2026-12-20" },
      });
    return new Response(bytes, { headers: { "content-type": "application/pdf" } });
  });
  const response = await handle(request("/proposal-pdf?id=p1"));
  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-disposition")!,
    /Proposta_Marcia_Silva_20-12-2026.pdf/,
  );
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
});
test("meeting PDF receives contact and meeting date filename", async () => {
  const bytes = new Uint8Array([37, 80, 68, 70, 45, 1, 2]);
  backend("admin", (url) => {
    assert.equal(url.searchParams.get("id"), "m1");
    if (url.pathname.endsWith("/meeting-detail"))
      return Response.json({
        ok: true,
        data: { contact_name: "Évelly & Maicom", meeting_at: "2026-09-22T18:30:00-03:00" },
      });
    return new Response(bytes, { headers: { "content-type": "application/pdf" } });
  });
  const response = await handle(request("/meeting-pdf?id=m1"));
  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-disposition")!,
    /Relatorio_Reuniao_Evelly_Maicom_22-09-2026.pdf/,
  );
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
});

test("stock conflict status and structured details survive proxy", async () => {
  const payload = {
    ok: false,
    code: "STOCK_CONFLICT",
    conflicts: [{ requested: 10, available: 2 }],
  };
  backend("admin", () => Response.json(payload, { status: 409 }));
  const response = await handle(request("/event-items", { event_id: "e1" }));
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), payload);
});
test("logout expires browser cookie", async () => {
  backend("admin", () => Response.json({ ok: true }));
  assert.match((await handle(request("/auth/logout", {}))).headers.get("set-cookie")!, /Max-Age=0/);
});
test("API client rejects invalid JSON and preserves typed backend error", async () => {
  globalThis.fetch = async () => new Response("<html>error</html>", { status: 502 });
  await assert.rejects(
    () => atelierApi.inventory.list(),
    (error: unknown) => error instanceof AtelierApiError && error.code === "INVALID_RESPONSE",
  );
  globalThis.fetch = async () =>
    Response.json({ ok: false, code: "STOCK_CONFLICT", message: "Sem estoque" }, { status: 409 });
  await assert.rejects(
    () => atelierApi.inventory.list(),
    (error: unknown) =>
      error instanceof AtelierApiError &&
      error.code === "STOCK_CONFLICT" &&
      error.message === "Sem estoque",
  );
});
