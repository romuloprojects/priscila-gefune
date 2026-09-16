const API_BASE = "/api/atelier";

export type ApiFailure = {
  ok: false;
  code?: string;
  message?: string;
  [key: string]: unknown;
};

export class AtelierApiError extends Error {
  code?: string;
  payload?: unknown;

  constructor(message: string, code?: string, payload?: unknown) {
    super(message);
    this.name = "AtelierApiError";
    this.code = code;
    this.payload = payload;
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body != null && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  headers.set("accept", "application/json");

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "same-origin",
  });

  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new AtelierApiError(
      `Resposta inválida da API (${response.status}).`,
      "INVALID_RESPONSE",
      text,
    );
  }

  if (!response.ok || payload?.ok === false) {
    throw new AtelierApiError(
      payload?.message || `Falha na API (${response.status}).`,
      payload?.code,
      payload,
    );
  }

  return payload as T;
}

function qs(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && String(value) !== "") {
      search.set(key, String(value));
    }
  }
  const out = search.toString();
  return out ? `?${out}` : "";
}

export type DashboardOverview = {
  ok: true;
  kpis: {
    events_week: number;
    inventory_items: number;
    unavailable_today: number;
    pending_proposals: number;
  };
  upcoming_events: Array<{
    id: string;
    title: string;
    event_date: string;
    status: string;
    location: string | null;
    client_name: string | null;
  }>;
  quick_inventory: Array<{
    id: string;
    name: string;
    total_quantity: number;
    reserved_today: number;
    available_today: number;
    image_url: string | null;
  }>;
  recent_proposals: Array<{
    id: string;
    proposal_number: number;
    title: string;
    status: string;
    total: number | string;
    client_name: string | null;
  }>;
  alerts: Array<{
    id?: string;
    kind?: string;
    title?: string;
    detail?: string;
    [key: string]: unknown;
  }>;
};

export type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRecord = {
  id: string;
  title: string;
  event_date: string;
  reserve_from: string;
  reserve_until: string;
  ceremony_venue: string | null;
  reception_venue: string | null;
  guest_count: number | null;
  status: string;
  client_id: string | null;
  client_name: string | null;
  event_type: string | null;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  unit: string;
  total_quantity: number;
  maintenance_quantity: number;
  default_unit_price: number | string;
  image_url: string | null;
  active: boolean;
  category_id: string | null;
  category_name: string | null;
  available_without_reservations: number;
  stock_status: string;
};

export type AvailabilityItem = {
  inventory_item_id: string;
  name: string;
  total_quantity: number;
  maintenance_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  pricing_mode: string;
  default_price: number | string;
  active: boolean;
  category_id: string | null;
  category_name: string | null;
};

export type PackageItem = {
  id: string;
  name: string;
  description: string | null;
  default_price: number | string;
  pricing_mode: string;
  default_guest_count: number | null;
  active: boolean;
  event_type_id: string | null;
  event_type: string | null;
};

export type Proposal = {
  id: string;
  proposal_number: number;
  title: string;
  status: string;
  document_template: string;
  total: number | string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  client_name: string | null;
  event_title: string | null;
  event_date: string | null;
};

export type EventItemsResponse = {
  ok: true;
  event_id: string;
  from: string;
  until: string;
  items: Array<{
    inventory_item_id: string;
    name: string;
    quantity: number;
    default_unit_price: number | string;
  }>;
};

export type ProposalDetail = {
  ok: true;
  data: {
    id: string;
    proposal_number: number;
    title: string;
    status: string;
    document_template: string;
    guest_count: number | null;
    package_price_snapshot: number | string;
    discount_type: string;
    discount_value: number | string;
    subtotal: number | string;
    discount_amount: number | string;
    total: number | string;
    valid_until: string | null;
    intro_text: string | null;
    closing_text: string | null;
    payment_terms: Record<string, unknown>;
    notes: string | null;
    event_id: string | null;
    client_id: string | null;
  };
  client: Client | null;
  event: Record<string, any> | null;
  package: { id: string; name: string } | null;
  sections: Array<{
    id: string;
    section_key: string;
    title: string;
    sort_order: number;
    show_in_pdf: boolean;
  }>;
  items: Array<{
    id: string;
    section_id: string | null;
    inventory_item_id: string | null;
    name_snapshot: string;
    description_snapshot: string | null;
    quantity: number | string;
    unit_price: number | string;
    billing_mode: string;
    show_in_pdf: boolean;
    reserve_stock: boolean;
    sort_order: number;
  }>;
  services: Array<{
    id: string;
    section_id: string | null;
    service_id: string | null;
    name_snapshot: string;
    description_snapshot: string | null;
    quantity: number | string;
    unit_price: number | string;
    billing_mode: string;
    show_in_pdf: boolean;
    sort_order: number;
  }>;
};

export type CompanySettings = {
  id: number;
  business_name: string;
  business_line: string;
  phone: string | null;
  instagram: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  proposal_valid_days: number;
  intro_text: string | null;
  closing_text: string | null;
  payment_terms: Record<string, unknown>;
  updated_at: string;
};

export const atelierApi = {
  health: () =>
    requestJson<{ ok: true; postgres: unknown; gotenberg: unknown }>("/health"),

  dashboard: () => requestJson<DashboardOverview>("/dashboard/overview"),

  clients: {
    list: (search = "") =>
      requestJson<{ ok: true; data: Client[]; total: number }>(
        `/clients${qs({ search })}`,
      ),
    create: (body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: Client }>("/clients", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: Client }>(`/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  events: {
    list: (search = "") =>
      requestJson<{ ok: true; data: EventRecord[] }>(
        `/events${qs({ search })}`,
      ),
    create: (body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: EventRecord }>("/events", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: EventRecord }>(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    items: (id: string) => requestJson<EventItemsResponse>(`/events/${id}/items`),
    saveItems: (id: string, items: Array<{ inventory_item_id: string; quantity: number }>) =>
      requestJson<{ ok: true; event_id: string; items: unknown[] }>(`/events/${id}/items`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      }),
  },

  inventory: {
    list: (search = "") =>
      requestJson<{ ok: true; data: InventoryItem[] }>(
        `/inventory${qs({ search })}`,
      ),
    availability: (from: string, until: string, excludeEventId?: string) =>
      requestJson<{ ok: true; from: string; until: string; data: AvailabilityItem[] }>(
        `/inventory/availability${qs({
          from,
          until,
          exclude_event_id: excludeEventId,
        })}`,
      ),
    create: (body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: InventoryItem }>("/inventory", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: InventoryItem }>(`/inventory/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  services: {
    list: () => requestJson<{ ok: true; data: ServiceItem[] }>("/services"),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: ServiceItem }>(`/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  packages: {
    list: () => requestJson<{ ok: true; data: PackageItem[] }>("/packages"),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: PackageItem }>(`/packages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  proposals: {
    list: (status?: string, search?: string) =>
      requestJson<{ ok: true; data: Proposal[] }>(
        `/proposals${qs({ status, search })}`,
      ),
    detail: (id: string) => requestJson<ProposalDetail>(`/proposals/${id}`),
    create: (body: Record<string, unknown>) =>
      requestJson<ProposalDetail>("/proposals", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<ProposalDetail>(`/proposals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    reserve: (id: string) =>
      requestJson<{ ok: true; event_id: string; items: unknown[] }>(`/proposals/${id}/reserve`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    preview: (id: string) =>
      requestJson<{ ok: true; html: string; proposal_number: number; title: string }>(
        `/proposals/${id}/preview`,
      ),
    pdfUrl: (id: string) => `${API_BASE}/proposals/${id}/pdf`,
  },

  settings: {
    get: () => requestJson<{ ok: true; data: CompanySettings }>("/settings"),
    update: (body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: CompanySettings }>("/settings", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },
};
