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
  reserve_from: string | null;
  reserve_until: string | null;
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


export type PackageDetailResponse = {
  ok: true;
  data: PackageItem & { intro_text?: string | null; closing_text?: string | null };
  sections: Array<{
    id: string;
    section_key: string;
    title: string;
    sort_order: number;
    show_default: boolean;
  }>;
  items: Array<{
    id: string;
    section_id: string | null;
    inventory_item_id: string;
    name: string;
    quantity_mode: string;
    default_quantity: number | string;
    multiplier: number | string;
    included_in_package: boolean;
    show_default: boolean;
    current_unit_price: number | string;
  }>;
  services: Array<{
    id: string;
    section_id: string | null;
    service_id: string;
    name: string;
    included_in_package: boolean;
    override_price: number | string | null;
    current_price: number | string;
    show_default: boolean;
  }>;
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
  from: string | null;
  until: string | null;
  items: Array<{
    inventory_item_id: string;
    name: string;
    quantity: number;
    default_unit_price: number | string;
  }>;
};


export type EventDetailResponse = {
  ok: true;
  data: Omit<EventRecord, "event_type" | "client_name"> & {
    event_type_id: string | null;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
    client?: { id: string; name: string; phone: string | null } | null;
    event_type?: { id: string; name: string; code: string } | null;
  };
  items: Array<{
    inventory_item_id: string;
    name: string;
    quantity: number;
    source: string;
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
    recipient_name: string | null;
    recipient_phone: string | null;
    recipient_email: string | null;
    event_title_snapshot: string | null;
    event_type_snapshot: string | null;
    event_date_snapshot: string | null;
    ceremony_venue_snapshot: string | null;
    reception_venue_snapshot: string | null;
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
      requestJson<{ ok: true; data: Client }>("/client-update", {
        method: "PATCH",
        body: JSON.stringify({ ...body, id }),
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
    detail: (id: string) => requestJson<EventDetailResponse>(`/event-detail${qs({ id })}`),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: EventRecord }>("/event-update", {
        method: "PATCH",
        body: JSON.stringify({ ...body, id }),
      }),
    delete: (id: string) =>
      requestJson<{ ok: true; deleted_id: string; title: string; detached_proposals: number }>(`/event-delete${qs({ id })}`, {
        method: "DELETE",
      }),
    items: (id: string) => requestJson<EventItemsResponse>(`/event-items${qs({ event_id: id })}`),
    saveItems: (id: string, items: Array<{ inventory_item_id: string; quantity: number }>) =>
      requestJson<{ ok: true; event_id: string; items: unknown[] }>("/event-items", {
        method: "PUT",
        body: JSON.stringify({ event_id: id, items }),
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
      requestJson<{ ok: true; data: InventoryItem }>("/inventory-update", {
        method: "PATCH",
        body: JSON.stringify({ ...body, id }),
      }),
  },

  services: {
    list: () => requestJson<{ ok: true; data: ServiceItem[] }>("/services"),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: ServiceItem }>("/service-update", {
        method: "PATCH",
        body: JSON.stringify({ ...body, id }),
      }),
  },

  packages: {
    list: () => requestJson<{ ok: true; data: PackageItem[] }>("/packages"),
    detail: (id: string) => requestJson<PackageDetailResponse>(`/package-detail${qs({ id })}`),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<{ ok: true; data: PackageItem }>("/package-update", {
        method: "PATCH",
        body: JSON.stringify({ ...body, id }),
      }),
  },

  proposals: {
    list: (status?: string, search?: string) =>
      requestJson<{ ok: true; data: Proposal[] }>(
        `/proposals${qs({ status, search })}`,
      ),
    detail: (id: string) => requestJson<ProposalDetail>(`/proposal-detail${qs({ id })}`),
    create: (body: Record<string, unknown>) =>
      requestJson<ProposalDetail>("/proposals", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      requestJson<ProposalDetail>("/proposal-update", {
        method: "PATCH",
        body: JSON.stringify({ ...body, id }),
      }),
    reserve: (id: string) =>
      requestJson<{ ok: true; event_id: string; items: unknown[] }>("/proposal-reserve", {
        method: "POST",
        body: JSON.stringify({ id }),
      }),
    preview: (id: string) =>
      requestJson<{ ok: true; html: string; proposal_number: number; title: string }>(
        `/proposal-preview${qs({ id })}`,
      ),
    pdfUrl: (id: string) => `${API_BASE}/proposal-pdf${qs({ id })}`,
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
