import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Bell,
  Box,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Home,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Package,
  PackageCheck,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type FormEvent,
  type ReactNode,
} from "react";

import floralImage from "../assets/eventos-floral.jpg";
import priscilaLogo from "../assets/atelier-priscila-gefune-logo-light.png";
import {
  AtelierApiError,
  atelierApi,
  type AvailabilityItem,
  type Client,
  type CompanySettings,
  type DashboardOverview,
  type EventDetailResponse,
  type EventRecord,
  type InventoryItem,
  type PackageDetailResponse,
  type PackageItem,
  type Proposal,
  type ProposalDetail,
  type ServiceItem,
} from "../services/atelierApi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier Priscila Gefune | Gestão de Eventos" },
      {
        name: "description",
        content: "Organize eventos, estoque, propostas e clientes com leveza em um só lugar.",
      },
      { property: "og:title", content: "Atelier Priscila Gefune | Gestão de Eventos" },
      {
        property: "og:description",
        content: "Gestão elegante e simples para cerimonial e decoração de eventos.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

type Page = "Início" | "Eventos" | "Estoque" | "Propostas" | "Clientes";
type ModalKind = "event" | "inventory" | "proposal" | "client";
type ModalState = { kind: ModalKind; inventoryItem?: InventoryItem } | null;
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "quiet" | "icon" | "outline";
};

type BackendState = {
  dashboard: DashboardOverview | null;
  clients: Client[];
  events: EventRecord[];
  inventory: InventoryItem[];
  availability: AvailabilityItem[];
  proposals: Proposal[];
  packages: PackageItem[];
  services: ServiceItem[];
  settings: CompanySettings | null;
  healthy: boolean;
};

const EMPTY_BACKEND: BackendState = {
  dashboard: null,
  clients: [],
  events: [],
  inventory: [],
  availability: [],
  proposals: [],
  packages: [],
  services: [],
  settings: null,
  healthy: false,
};

function Button({ children, className = "", variant = "quiet", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-button hover:bg-primary/90",
    quiet: "text-foreground hover:bg-muted",
    icon: "text-muted-foreground hover:bg-muted hover:text-foreground",
    outline: "border border-input bg-card text-foreground hover:bg-muted",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const navigation: { label: Page; icon: LucideIcon }[] = [
  { label: "Início", icon: Home },
  { label: "Eventos", icon: CalendarDays },
  { label: "Estoque", icon: Archive },
  { label: "Propostas", icon: FileText },
  { label: "Clientes", icon: Users },
];

function Brand() {
  return (
    <div className="flex w-full items-center justify-center">
      <img
        src={priscilaLogo}
        alt="Atelier Priscila Gefune"
        className="h-auto w-full max-w-[208px] object-contain"
      />
    </div>
  );
}

function Sidebar({
  open,
  onClose,
  active,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  active: Page;
  onSelect: (label: Page) => void;
}) {
  return (
    <>
      {open && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-overlay lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-border bg-sidebar px-5 py-7 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <Button
            variant="icon"
            className="h-10 w-10 lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav aria-label="Navegação principal" className="mt-10 space-y-1.5">
          {navigation.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              className={`h-11 w-full justify-start px-4 text-sm ${active === label ? "bg-sidebar-accent text-sidebar-primary shadow-soft" : "text-sidebar-foreground"}`}
              onClick={() => {
                onSelect(label);
                onClose();
              }}
            >
              <Icon className="h-[19px] w-[19px] stroke-[1.7]" />
              {label}
            </Button>
          ))}
        </nav>
        <div className="mt-auto hidden lg:block">
          <div className="botanical-mark" aria-hidden="true">
            <Leaf />
            <Leaf />
            <Leaf />
          </div>
          <blockquote className="mx-auto max-w-[170px] text-center font-display text-lg italic leading-relaxed text-muted-foreground">
            “Eventos extraordinários tornam a vida mais bonita.”
          </blockquote>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  action,
  onAction,
}: {
  icon: LucideIcon;
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
      <h2 className="flex min-w-0 items-center gap-3 font-display text-xl font-semibold text-foreground sm:text-2xl">
        <Icon className="h-5 w-5 shrink-0 text-brand" />
        <span className="truncate">{children}</span>
      </h2>
      {action && (
        <Button className="h-9 px-2 text-xs text-success" onClick={onAction}>
          {action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const positive = ["Confirmado", "Aprovada", "Concluído", "Em andamento"];
  const attention = ["Em preparação", "Pendente", "Enviada"];
  const cls = positive.includes(status)
    ? "bg-sage text-success"
    : attention.includes(status)
      ? "bg-blush text-danger"
      : "bg-sand text-brand";
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function InventoryIcon({ kind, className = "h-5 w-5" }: { kind: string; className?: string }) {
  const icons: Record<string, LucideIcon> = {
    table: Box,
    chair: PackageCheck,
    linen: Archive,
    vase: Leaf,
    plate: Package,
    panel: Archive,
    decor: Sparkles,
  };
  const Icon = icons[kind] ?? Package;
  return <Icon className={className} />;
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  actionIcon: ActionIcon = Plus,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl font-medium leading-none sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action && (
        <Button variant="primary" className="h-11 self-start px-5 sm:self-auto" onClick={onAction}>
          <ActionIcon className="h-4 w-4" />
          {action}
        </Button>
      )}
    </div>
  );
}

function EmptyOrNotice({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-brand" />
      <h3 className="mt-3 font-display text-2xl">{title}</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}

function formatCurrency(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(number) ? number : 0,
  );
}

function eventStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Planejado",
    quote: "Orçamento",
    sent: "Proposta enviada",
    confirmed: "Confirmado",
    preparation: "Em preparação",
    in_progress: "Em andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  };
  return labels[status] ?? status;
}

function proposalStatusLabel(_status: string) {
  return "Emitida";
}

function inventoryIconKind(category: string | null | undefined) {
  const value = (category || "").toLocaleLowerCase("pt-BR");
  if (value.includes("mobili")) return "table";
  if (value.includes("têxt") || value.includes("text")) return "linen";
  if (value.includes("louça") || value.includes("mesa posta")) return "plate";
  if (value.includes("decora")) return "vase";
  return "decor";
}

function dateParts(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return {
    day: String(day).padStart(2, "0"),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(date)
      .replace(".", "")
      .toLocaleUpperCase("pt-BR"),
  };
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("pt-BR") ?? "")
    .join("") || "CL";
}

function HomePage({
  query,
  navigate,
  openModal,
  announce,
  dashboard,
  onPreview,
  onPdf,
}: {
  query: string;
  navigate: (page: Page) => void;
  openModal: (kind: ModalKind) => void;
  announce: (message: string) => void;
  dashboard: DashboardOverview | null;
  onPreview: (id: string) => void;
  onPdf: (id: string) => void;
}) {
  const upcoming = dashboard?.upcoming_events ?? [];
  const shownEvents = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    if (!q) return upcoming.slice(0, 3);
    return upcoming
      .filter((event) =>
        `${event.title} ${event.location ?? ""} ${event.client_name ?? ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(q),
      )
      .slice(0, 3);
  }, [query, upcoming]);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const kpis = dashboard?.kpis;
  const metrics = [
    { label: "Eventos esta semana", value: String(kpis?.events_week ?? 0), icon: CalendarDays, tone: "sage" },
    {
      label: "Itens em estoque",
      value: new Intl.NumberFormat("pt-BR").format(kpis?.inventory_items ?? 0),
      icon: Box,
      tone: "sand",
    },
    {
      label: "Indisponíveis hoje",
      value: new Intl.NumberFormat("pt-BR").format(kpis?.unavailable_today ?? 0),
      icon: AlertTriangle,
      tone: "rose",
    },
    { label: "Propostas emitidas", value: String(kpis?.pending_proposals ?? 0), icon: FileText, tone: "sage" },
  ];

  return (
    <>
      <section className="relative min-h-[126px] overflow-hidden rounded-lg border border-border bg-surface px-5 py-6 shadow-soft sm:px-7">
        <img
          src={floralImage}
          width={1920}
          height={1024}
          alt="Arranjo de rosas e folhagens em tons suaves"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-hero-wash" />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand first-letter:uppercase">
            {formattedDate}
          </p>
          <h1 className="font-display text-4xl font-medium leading-none sm:text-5xl">
            Bem-vinda, Priscila Gefune!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Tudo o que você precisa para organizar seus eventos com tranquilidade.
          </p>
        </div>
        <p className="relative z-10 mt-4 hidden text-right font-display text-xl italic text-brand/80 xl:block">
          Mais que eventos, histórias reais.
        </p>
      </section>

      <section aria-label="Resumo" className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article
            key={label}
            className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-soft sm:gap-4 sm:p-4"
          >
            <div className={`metric-icon tone-${tone}`}>
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
              <p className="font-display text-3xl leading-tight sm:text-4xl">{value}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.04fr]">
        <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          <SectionTitle icon={CalendarDays} action="Ver todos" onAction={() => navigate("Eventos")}>
            Próximos eventos
          </SectionTitle>
          <div className="px-5">
            {shownEvents.length ? (
              shownEvents.map((event) => {
                const parts = dateParts(event.event_date);
                const status = eventStatusLabel(event.status);
                return (
                  <button
                    key={event.id}
                    className="grid w-full grid-cols-[52px_minmax(0,1fr)] gap-4 border-b border-border py-3 text-left transition-colors hover:bg-muted/45 last:border-0 sm:grid-cols-[58px_minmax(0,1fr)_auto] sm:items-center"
                    onClick={() => announce(`Evento: ${event.title}`)}
                  >
                    <div className="border-r border-border">
                      <div className="font-display text-2xl leading-none">{parts.day}</div>
                      <div className="mt-1 text-[11px] font-semibold text-muted-foreground">{parts.month}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${event.status === "confirmed" ? "bg-success" : "bg-blush-strong"}`}
                        />
                        <p className="truncate text-sm font-medium">{event.title}</p>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location || "Local ainda não informado"}
                      </p>
                    </div>
                    <span className="col-start-2 sm:col-start-auto">
                      <StatusBadge status={status} />
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum evento futuro cadastrado.
              </p>
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          <SectionTitle icon={Box} action="Ver estoque" onAction={() => navigate("Estoque")}>
            Estoque rápido
          </SectionTitle>
          <div className="overflow-x-auto px-5 pb-2">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Item</th>
                  <th className="font-medium">Total</th>
                  <th className="font-medium">Reservado</th>
                  <th className="font-medium">Disponível</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.quick_inventory ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="py-3 font-medium">
                      <span className="mr-3 inline-grid h-9 w-9 place-items-center rounded-lg bg-sand text-brand">
                        <InventoryIcon kind="decor" />
                      </span>
                      {row.name}
                    </td>
                    <td>{row.total_quantity}</td>
                    <td className="text-danger">{row.reserved_today}</td>
                    <td className="font-medium text-success">{row.available_today}</td>
                  </tr>
                ))}
                {!dashboard?.quick_inventory?.length && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                      O catálogo está criado. Informe as quantidades físicas para iniciar o controle de disponibilidade.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          <SectionTitle icon={ClipboardList} action="Ver todas" onAction={() => navigate("Propostas")}>
            Propostas recentes
          </SectionTitle>
          <div className="px-4">
            {(dashboard?.recent_proposals ?? []).slice(0, 3).map((proposal) => (
              <div
                key={proposal.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{proposal.client_name || proposal.title}</p>
                  <p className="text-xs text-muted-foreground">Proposta #{proposal.proposal_number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="hidden text-xs font-semibold sm:block">{formatCurrency(proposal.total)}</strong>
                  <Button
                    className="h-8 bg-sand px-3 text-xs"
                    onClick={() => onPreview(proposal.id)}
                  >
                    Prévia
                  </Button>
                  <Button
                    className="h-8 bg-sand px-3 text-xs"
                    onClick={() => onPdf(proposal.id)}
                  >
                    PDF
                  </Button>
                </div>
              </div>
            ))}
            {!dashboard?.recent_proposals?.length && (
              <p className="py-8 text-center text-xs text-muted-foreground">Nenhuma proposta criada ainda.</p>
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          <SectionTitle icon={Bell}>Alertas importantes</SectionTitle>
          <div className="px-4">
            {(dashboard?.alerts ?? []).map((alert, index) => {
              const kind = alert.kind ?? "warning";
              const Icon = kind === "danger" ? AlertTriangle : kind === "warning" ? Clock : FileText;
              const tone =
                kind === "danger"
                  ? "bg-blush text-danger"
                  : kind === "warning"
                    ? "bg-sand text-brand"
                    : "bg-sage text-success";
              return (
                <Button
                  key={alert.id ?? index}
                  className="grid min-h-[54px] w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-border px-0 text-left text-xs last:border-0"
                  onClick={() => announce(alert.title || "Alerta")}
                >
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{alert.title || alert.detail || "Alerta do sistema"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              );
            })}
            {!dashboard?.alerts?.length && (
              <div className="flex min-h-[108px] items-center gap-3 px-1 text-xs text-success">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage">
                  <Check className="h-4 w-4" />
                </span>
                Nenhum alerta automático pendente neste momento.
              </div>
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
          <SectionTitle icon={Zap}>Ações rápidas</SectionTitle>
          <div className="grid grid-cols-2 gap-2 p-4">
            <Button className="min-h-[58px] flex-col bg-peach px-3 text-xs" onClick={() => openModal("event")}>
              <CalendarDays className="h-5 w-5 text-brand" />Novo evento
            </Button>
            <Button className="min-h-[58px] flex-col bg-peach px-3 text-xs" onClick={() => openModal("client")}>
              <UserPlus className="h-5 w-5 text-brand" />Novo cliente
            </Button>
            <Button className="min-h-[58px] flex-col bg-peach px-3 text-xs" onClick={() => openModal("inventory")}>
              <PackageCheck className="h-5 w-5 text-brand" />Adicionar item
            </Button>
            <Button className="min-h-[58px] flex-col bg-peach px-3 text-xs" onClick={() => openModal("proposal")}>
              <FileText className="h-5 w-5 text-brand" />Nova proposta
            </Button>
          </div>
        </article>
      </section>
    </>
  );
}

function EventsPage({
  query,
  events,
  openModal,
  announce,
  onReserve,
  onDetail,
}: {
  query: string;
  events: EventRecord[];
  openModal: (kind: ModalKind) => void;
  announce: (message: string) => void;
  onReserve: (event: EventRecord) => void;
  onDetail: (eventId: string) => void;
}) {
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return events.filter((event) => {
      const text = `${event.title} ${event.client_name ?? ""} ${event.event_type ?? ""} ${event.reception_venue ?? ""} ${event.ceremony_venue ?? ""}`.toLocaleLowerCase("pt-BR");
      return !q || text.includes(q);
    });
  }, [events, query]);

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos"
        description="Acompanhe datas, períodos de reserva e o andamento de cada evento."
        action="Novo evento"
        onAction={() => openModal("event")}
      />
      <div className="grid gap-3">
        {list.map((event) => {
          const parts = dateParts(event.event_date);
          const place = event.reception_venue || event.ceremony_venue || "Local não informado";
          return (
            <article
              key={event.id}
              className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-soft md:grid-cols-[70px_minmax(0,1fr)_auto] md:items-center"
            >
              <div className="rounded-lg bg-peach px-3 py-3 text-center">
                <div className="font-display text-3xl leading-none">{parts.day}</div>
                <div className="mt-1 text-[11px] font-semibold text-brand">{parts.month}</div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-semibold">{event.title}</h2>
                  <StatusBadge status={eventStatusLabel(event.status)} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.client_name || "Cliente não vinculado"} · {event.event_type || "Evento"}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{place}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.guest_count ?? "—"} convidados</span>
                  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{event.reserve_from && event.reserve_until ? `Reserva: ${formatDate(event.reserve_from)} a ${formatDate(event.reserve_until)}` : "Sem reserva do acervo"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="h-9 px-4 text-xs" onClick={() => onDetail(event.id)}>
                  Detalhes
                </Button>
                <Button
                  className="h-9 bg-sand px-4 text-xs text-brand"
                  onClick={() => event.reserve_from && event.reserve_until ? onReserve(event) : onDetail(event.id)}
                >
                  {event.reserve_from && event.reserve_until ? "Itens / reserva" : "Adicionar acervo"}
                </Button>
              </div>
            </article>
          );
        })}
        {!list.length && (
          <EmptyOrNotice
            title="Nenhum evento encontrado"
            text="Cadastre o primeiro evento ou altere os termos da busca."
          />
        )}
      </div>
    </>
  );
}

function InventoryPage({
  query,
  inventory,
  availability,
  openModal,
  onEdit,
}: {
  query: string;
  inventory: InventoryItem[];
  availability: AvailabilityItem[];
  openModal: (kind: ModalKind) => void;
  onEdit: (item: InventoryItem) => void;
}) {
  const [category, setCategory] = useState("Todos");
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(inventory.map((item) => item.category_name || "Sem categoria")))],
    [inventory],
  );
  const availabilityMap = useMemo(
    () => new Map(availability.map((item) => [item.inventory_item_id, item])),
    [availability],
  );
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return inventory.filter((item) => {
      const text = `${item.name} ${item.category_name ?? ""}`.toLocaleLowerCase("pt-BR");
      return (!q || text.includes(q)) && (category === "Todos" || (item.category_name || "Sem categoria") === category);
    });
  }, [inventory, query, category]);

  return (
    <>
      <PageHeader
        eyebrow="Acervo"
        title="Estoque"
        description="Acompanhe quantidades, valores e disponibilidade dos itens do acervo."
        action="Adicionar item"
        onAction={() => openModal("inventory")}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((name) => (
          <Button
            key={name}
            className={`h-9 shrink-0 px-4 text-xs ${category === name ? "bg-sand text-brand" : "border border-border bg-card"}`}
            onClick={() => setCategory(name)}
          >
            {name}
          </Button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => {
          const stock = availabilityMap.get(item.id);
          const reserved = stock?.reserved_quantity ?? 0;
          const available = stock?.available_quantity ?? item.available_without_reservations;
          return (
            <article key={item.id} className="rounded-lg border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-sand text-brand">
                    <InventoryIcon kind={inventoryIconKind(item.category_name)} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-xl font-semibold">{item.name}</h2>
                    <p className="text-xs text-muted-foreground">{item.category_name || "Sem categoria"}</p>
                  </div>
                </div>
                {item.stock_status === "low" && item.total_quantity > 0 && (
                  <span className="rounded-full bg-blush px-2 py-1 text-[10px] font-semibold text-danger">Baixo</span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-lg bg-muted/45 py-3 text-center">
                <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p><strong>{item.total_quantity}</strong></div>
                <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Reservado</p><strong className="text-danger">{reserved}</strong></div>
                <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Disponível</p><strong className="text-success">{available}</strong></div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Valor padrão</p>
                  <strong className="font-display text-xl">{formatCurrency(item.default_unit_price)}</strong>
                </div>
                <Button variant="outline" className="h-9 px-4 text-xs" onClick={() => onEdit(item)}>
                  Editar item
                </Button>
              </div>
            </article>
          );
        })}
        {!list.length && (
          <div className="sm:col-span-2 xl:col-span-3">
            <EmptyOrNotice
              title="Nenhum item encontrado"
              text="O seed inicial cria o catálogo com quantidades físicas zeradas; ajuste as quantidades reais antes dos testes de reserva."
            />
          </div>
        )}
      </div>
    </>
  );
}

function ProposalsPage({
  query,
  proposals,
  openModal,
  onPreview,
  onPdf,
  onEdit,
  onDelete,
}: {
  query: string;
  proposals: Proposal[];
  openModal: (kind: ModalKind) => void;
  onPreview: (id: string) => void;
  onPdf: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return proposals.filter((proposal) => {
      const text = `${proposal.client_name ?? ""} ${proposal.event_title ?? ""} ${proposal.title} ${proposal.proposal_number}`.toLocaleLowerCase("pt-BR");
      return !q || text.includes(q);
    });
  }, [proposals, query]);

  return (
    <>
      <PageHeader
        eyebrow="Comercial"
        title="Propostas"
        description="Crie, edite, visualize e gere propostas comerciais em PDF."
        action="Nova proposta"
        onAction={() => openModal("proposal")}
      />
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        {list.map((proposal) => (
          <div
            key={proposal.id}
            className="grid gap-3 border-b border-border px-5 py-4 last:border-0 lg:grid-cols-[90px_minmax(0,1fr)_150px_130px_120px_auto] lg:items-center"
          >
            <strong className="text-sm text-brand">#{proposal.proposal_number}</strong>
            <div>
              <p className="text-sm font-semibold">{proposal.client_name || "Cliente não vinculado"}</p>
              <p className="text-xs text-muted-foreground">{proposal.event_title || proposal.title}</p>
            </div>
            <p className="text-xs"><CalendarDays className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />{formatDate(proposal.event_date)}</p>
            <strong className="text-sm">{formatCurrency(proposal.total)}</strong>
            <StatusBadge status={proposalStatusLabel(proposal.status)} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => onEdit(proposal.id)}>Editar</Button>
              <Button className="h-9 bg-sand px-3 text-xs" onClick={() => onPreview(proposal.id)}>
                <FileText className="h-4 w-4" />Prévia
              </Button>
              <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => onPdf(proposal.id)}>
                PDF
              </Button>
              <Button variant="outline" className="h-9 px-3 text-xs text-danger" onClick={() => onDelete(proposal.id)} title="Excluir proposta">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!list.length && (
          <div className="p-5">
            <EmptyOrNotice title="Nenhuma proposta encontrada" text="Crie a primeira proposta usando um dos pacotes cadastrados." />
          </div>
        )}
      </div>
    </>
  );
}

function ClientsPage({
  query,
  clients,
  events,
  openModal,
  announce,
}: {
  query: string;
  clients: Client[];
  events: EventRecord[];
  openModal: (kind: ModalKind) => void;
  announce: (message: string) => void;
}) {
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return clients.filter((client) => {
      const text = `${client.name} ${client.phone ?? ""} ${client.email ?? ""}`.toLocaleLowerCase("pt-BR");
      return !q || text.includes(q);
    });
  }, [clients, query]);

  return (
    <>
      <PageHeader
        eyebrow="Relacionamento"
        title="Clientes"
        description="Cadastro central usado por eventos e propostas."
        action="Novo cliente"
        actionIcon={UserPlus}
        onAction={() => openModal("client")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((client) => {
          const clientEvents = events
            .filter((event) => event.client_id === client.id)
            .sort((a, b) => b.event_date.localeCompare(a.event_date));
          return (
            <article key={client.id} className="rounded-lg border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-avatar font-display font-semibold text-primary">
                  {initials(client.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-semibold">{client.name}</h2>
                  <p className="text-xs text-muted-foreground">{clientEvents.length} evento(s)</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" />{client.phone || "Telefone não informado"}</p>
                <p className="flex min-w-0 items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-brand" /><span className="truncate">{client.email || "E-mail não informado"}</span></p>
                <p className="flex items-center justify-between pt-1 text-muted-foreground"><span>Próximo/último evento</span><strong className="text-foreground">{formatDate(clientEvents[0]?.event_date)}</strong></p>
              </div>
              <Button variant="outline" className="mt-4 h-9 w-full text-xs" onClick={() => announce(`Cliente ${client.name} selecionado`)}>
                Ver histórico
              </Button>
            </article>
          );
        })}
        {!list.length && (
          <div className="sm:col-span-2 xl:col-span-3">
            <EmptyOrNotice title="Cliente não encontrado" text="Cadastre o primeiro cliente ou altere a busca." />
          </div>
        )}
      </div>
    </>
  );
}

function CatalogPriceRow({
  title,
  subtitle,
  value,
  onSave,
}: {
  title: string;
  subtitle?: string | null;
  value: number | string;
  onSave: (value: number) => Promise<void>;
}) {
  const [price, setPrice] = useState(String(Number(value ?? 0).toFixed(2)));
  const [saving, setSaving] = useState(false);

  useEffect(() => setPrice(String(Number(value ?? 0).toFixed(2))), [value]);

  return (
    <div className="grid gap-3 border-b border-border py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <label className="relative block">
        <span className="sr-only">Valor de {title}</span>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <Button
        variant="outline"
        className="h-9 px-3 text-xs"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await onSave(Number(price || 0));
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}

function SettingsPage({
  settings,
  packages,
  announce,
  onRefresh,
}: {
  settings: CompanySettings | null;
  packages: PackageItem[];
  announce: (message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    business_name: "Atelier Priscila Gefune",
    business_line: "Decoração & Cerimonial",
    phone: "",
    email: "",
    instagram: "",
    address: "",
    proposal_valid_days: "7",
    intro_text: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      business_name: settings.business_name || "",
      business_line: settings.business_line || "",
      phone: settings.phone || "",
      email: settings.email || "",
      instagram: settings.instagram || "",
      address: settings.address || "",
      proposal_valid_days: String(settings.proposal_valid_days ?? 7),
      intro_text: settings.intro_text || "",
    });
  }, [settings]);

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await atelierApi.settings.update({
        ...form,
        proposal_valid_days: Number(form.proposal_valid_days || 7),
      });
      announce("Configurações salvas");
      await onRefresh();
    } catch (error) {
      announce(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };



  return (
    <>
      <PageHeader
        eyebrow="Preferências"
        title="Configurações"
        description="Dados institucionais e textos padrão da empresa. Valores de pacotes, serviços e locações são definidos na própria proposta."
      />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <form className="rounded-lg border border-border bg-card p-5 shadow-soft" onSubmit={saveSettings}>
          <h2 className="font-display text-2xl font-semibold">Dados da empresa</h2>
          <p className="mt-1 text-xs text-muted-foreground">Alterações são gravadas pelo workflow 60.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ControlledField label="Nome da empresa" value={form.business_name} onChange={(value) => setForm((old) => ({ ...old, business_name: value }))} />
            <ControlledField label="Linha de atuação" value={form.business_line} onChange={(value) => setForm((old) => ({ ...old, business_line: value }))} />
            <ControlledField label="Telefone" value={form.phone} onChange={(value) => setForm((old) => ({ ...old, phone: value }))} />
            <ControlledField label="E-mail" type="email" value={form.email} onChange={(value) => setForm((old) => ({ ...old, email: value }))} />
            <ControlledField label="Instagram" value={form.instagram} onChange={(value) => setForm((old) => ({ ...old, instagram: value }))} />
            <ControlledField label="Validade padrão (dias)" type="number" value={form.proposal_valid_days} onChange={(value) => setForm((old) => ({ ...old, proposal_valid_days: value }))} />
            <div className="sm:col-span-2">
              <ControlledField label="Endereço" value={form.address} onChange={(value) => setForm((old) => ({ ...old, address: value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Mensagem de abertura das propostas</label>
              <textarea
                value={form.intro_text}
                onChange={(event) => setForm((old) => ({ ...old, intro_text: event.target.value }))}
                className="mt-1 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <Button variant="primary" className="mt-5 h-10 px-5" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Identidade da proposta</h2>
          <div className="mt-4 rounded-xl bg-peach p-5">
            <Brand />
            <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-soft">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Proposta comercial</p>
              <h3 className="mt-2 font-display text-2xl">{packages[0]?.name || "Pacote de evento"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">A prévia e o PDF usam o mesmo conteúdo da proposta.</p>
              <div className="mt-5 h-px bg-border" />
              <div className="mt-4 flex items-end justify-between gap-4">
                <span className="text-xs text-muted-foreground">Investimento</span>
                <strong className="text-right text-sm font-semibold text-brand">Definido em cada proposta</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-4 rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-2xl font-semibold">Valores comerciais</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pacotes, serviços e itens do acervo usam o catálogo apenas como referência. O valor efetivo é escolhido ao montar cada proposta, porque pode variar conforme evento, quantidade de convidados e negociação.</p>
        <div className="mt-4 rounded-lg bg-sage px-4 py-3 text-xs text-success"><Check className="mr-2 inline h-4 w-4" />Ao criar uma proposta, você poderá marcar itens e serviços, ajustar quantidades e definir os valores daquela negociação sem alterar propostas antigas.</div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
  min,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function ControlledField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

type ProposalDraftItemRow = {
  inventoryItemId: string;
  name: string;
  description: string | null;
  selected: boolean;
  quantity: number;
  unitPrice: number;
  included: boolean;
  reserveStock: boolean;
  sectionKey: string;
  sectionTitle: string;
  quantityMode: string;
  defaultQuantity: number;
  multiplier: number;
  packageDefined: boolean;
};

type ProposalDraftServiceRow = {
  serviceId: string;
  name: string;
  description: string | null;
  selected: boolean;
  quantity: number;
  unitPrice: number;
  included: boolean;
  sectionKey: string;
  sectionTitle: string;
  packageDefined: boolean;
};

function suggestedPackageQuantity(mode: string, defaultQuantity: number, multiplier: number, guests: number) {
  if (mode === "per_guest") return Math.max(0, guests * multiplier);
  if (mode === "per_table_4") return Math.max(0, Math.ceil(guests / 4) * multiplier);
  return Math.max(0, defaultQuantity);
}

function ProposalCreateModal({
  clients,
  events,
  packages,
  inventory,
  services,
  settings,
  onClose,
  onSaved,
  onCreated,
  announce,
}: {
  clients: Client[];
  events: EventRecord[];
  packages: PackageItem[];
  inventory: InventoryItem[];
  services: ServiceItem[];
  settings: CompanySettings | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onCreated: (proposalId: string) => void;
  announce: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recipientMode, setRecipientMode] = useState<"client" | "contact">("contact");
  const [clientId, setClientId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [eventId, setEventId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [ceremonyVenue, setCeremonyVenue] = useState("");
  const [receptionVenue, setReceptionVenue] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const [packageId, setPackageId] = useState("");
  const [packagePrice, setPackagePrice] = useState(0);
  const [pricingMode, setPricingMode] = useState<"automatic" | "manual">("manual");
  const [manualTotal, setManualTotal] = useState("");
  const [showItemPrices, setShowItemPrices] = useState(false);
  const [showServicePrices, setShowServicePrices] = useState(false);
  const [title, setTitle] = useState("");
  const defaultPaymentTerms = (settings?.payment_terms ?? {}) as Record<string, any>;
  const [paymentMethods, setPaymentMethods] = useState<string[]>(() => Array.isArray(defaultPaymentTerms.methods) ? defaultPaymentTerms.methods : ["Pix", "Transferência", "Cartão"]);
  const [cardInstallments, setCardInstallments] = useState(String(defaultPaymentTerms.installments_card ?? 12));
  const [paymentNotes, setPaymentNotes] = useState(String(defaultPaymentTerms.notes ?? "Sinal para reservar a data; saldo pode ser dividido nos meses que antecedem o evento."));
  const [packageDetail, setPackageDetail] = useState<PackageDetailResponse | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [items, setItems] = useState<ProposalDraftItemRow[]>(() => inventory.map((item) => ({
    inventoryItemId: item.id,
    name: item.name,
    description: item.description,
    selected: false,
    quantity: 1,
    unitPrice: Number(item.default_unit_price || 0),
    included: false,
    reserveStock: true,
    sectionKey: "itens_acervo",
    sectionTitle: "Itens / acervo",
    quantityMode: "manual",
    defaultQuantity: 1,
    multiplier: 1,
    packageDefined: false,
  })));
  const [serviceRows, setServiceRows] = useState<ProposalDraftServiceRow[]>(() => services.map((service) => ({
    serviceId: service.id,
    name: service.name,
    description: service.description,
    selected: false,
    quantity: 1,
    unitPrice: Number(service.default_price || 0),
    included: false,
    sectionKey: "servicos",
    sectionTitle: "Serviços",
    packageDefined: false,
  })));

  useEffect(() => {
    setItems((old) => inventory.map((item) => {
      const existing = old.find((row) => row.inventoryItemId === item.id);
      return existing ?? {
        inventoryItemId: item.id,
        name: item.name,
        description: item.description,
        selected: false,
        quantity: 1,
        unitPrice: Number(item.default_unit_price || 0),
        included: false,
        reserveStock: true,
        sectionKey: "itens_acervo",
        sectionTitle: "Itens / acervo",
        quantityMode: "manual",
        defaultQuantity: 1,
        multiplier: 1,
        packageDefined: false,
      };
    }));
  }, [inventory]);

  useEffect(() => {
    setServiceRows((old) => services.map((service) => {
      const existing = old.find((row) => row.serviceId === service.id);
      return existing ?? {
        serviceId: service.id,
        name: service.name,
        description: service.description,
        selected: false,
        quantity: 1,
        unitPrice: Number(service.default_price || 0),
        included: false,
        sectionKey: "servicos",
        sectionTitle: "Serviços",
        packageDefined: false,
      };
    }));
  }, [services]);

  useEffect(() => {
    if (!packageId) {
      setPackageDetail(null);
      setPackagePrice(0);
      setItems((old) => old.map((row) => ({ ...row, selected: false, included: false, packageDefined: false, sectionKey: "itens_acervo", sectionTitle: "Itens / acervo", quantityMode: "manual", defaultQuantity: 1, multiplier: 1 })));
      setServiceRows((old) => old.map((row) => ({ ...row, selected: false, included: false, packageDefined: false, sectionKey: "servicos", sectionTitle: "Serviços" })));
      return;
    }

    const selectedPackage = packages.find((item) => item.id === packageId);
    if (selectedPackage) {
      const suggestedPrice = Number(selectedPackage.default_price || 0);
      setPackagePrice(suggestedPrice);
      if (!manualTotal && suggestedPrice > 0) setManualTotal(String(suggestedPrice));
      if (!guestCount && selectedPackage.default_guest_count) setGuestCount(selectedPackage.default_guest_count);
      if (!title) setTitle(selectedPackage.name);
      if (selectedPackage.name.toLocaleLowerCase("pt-BR").includes("locação")) setShowItemPrices(true);
    }

    let cancelled = false;
    setLoadingPackage(true);
    setError("");
    void atelierApi.packages.detail(packageId)
      .then((detail) => {
        if (cancelled) return;
        setPackageDetail(detail);
        const sectionsById = new Map(detail.sections.map((section) => [section.id, section]));
        const pkgItems = new Map(detail.items.map((item) => [item.inventory_item_id, item]));
        const pkgServices = new Map(detail.services.map((service) => [service.service_id, service]));
        const effectiveGuests = guestCount || detail.data.default_guest_count || 0;

        setItems(inventory.map((item) => {
          const packageItem = pkgItems.get(item.id);
          const section = packageItem?.section_id ? sectionsById.get(packageItem.section_id) : undefined;
          const mode = packageItem?.quantity_mode || "manual";
          const defaultQuantity = Number(packageItem?.default_quantity ?? 1);
          const multiplier = Number(packageItem?.multiplier ?? 1);
          return {
            inventoryItemId: item.id,
            name: item.name,
            description: item.description,
            selected: Boolean(packageItem?.show_default),
            quantity: packageItem ? suggestedPackageQuantity(mode, defaultQuantity, multiplier, effectiveGuests) : 1,
            unitPrice: Number(packageItem?.current_unit_price ?? item.default_unit_price ?? 0),
            included: Boolean(packageItem?.included_in_package),
            reserveStock: true,
            sectionKey: section?.section_key || "itens_acervo",
            sectionTitle: section?.title || "Itens / acervo",
            quantityMode: mode,
            defaultQuantity,
            multiplier,
            packageDefined: Boolean(packageItem),
          };
        }));

        setServiceRows(services.map((service) => {
          const packageService = pkgServices.get(service.id);
          const section = packageService?.section_id ? sectionsById.get(packageService.section_id) : undefined;
          return {
            serviceId: service.id,
            name: service.name,
            description: service.description,
            selected: Boolean(packageService?.show_default),
            quantity: 1,
            unitPrice: Number(packageService?.override_price ?? packageService?.current_price ?? service.default_price ?? 0),
            included: Boolean(packageService?.included_in_package),
            sectionKey: section?.section_key || "servicos",
            sectionTitle: section?.title || "Serviços",
            packageDefined: Boolean(packageService),
          };
        }));
      })
      .catch((caught) => {
        if (!cancelled) setError(apiErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoadingPackage(false);
      });
    return () => { cancelled = true; };
  }, [packageId]);

  useEffect(() => {
    if (!packageDetail) return;
    setItems((old) => old.map((row) => row.packageDefined ? {
      ...row,
      quantity: suggestedPackageQuantity(row.quantityMode, row.defaultQuantity, row.multiplier, guestCount),
    } : row));
  }, [guestCount, packageDetail]);

  const selectEvent = (id: string) => {
    setEventId(id);
    const selected = events.find((item) => item.id === id);
    if (!selected) return;
    setEventTitle(selected.title || "");
    setEventDate(selected.event_date?.slice(0, 10) || "");
    setCeremonyVenue(selected.ceremony_venue || "");
    setReceptionVenue(selected.reception_venue || "");
    setGuestCount(selected.guest_count ?? 0);
    if (selected.client_id) {
      setRecipientMode("client");
      setClientId(selected.client_id);
    }
  };

  const automaticTotalPreview = useMemo(() => {
    const itemTotal = items.filter((row) => row.selected && !row.included).reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
    const serviceTotal = serviceRows.filter((row) => row.selected && !row.included).reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
    return packagePrice + itemTotal + serviceTotal;
  }, [items, serviceRows, packagePrice]);
  const totalPreview = pricingMode === "manual" ? Number(manualTotal || 0) : automaticTotalPreview;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const linkedClient = clients.find((client) => client.id === clientId);
      if (recipientMode === "client" && !clientId) throw new AtelierApiError("Selecione o cliente da proposta.", "RECIPIENT_REQUIRED");
      if (recipientMode === "contact" && !recipientName.trim()) throw new AtelierApiError("Informe o nome do contato da proposta.", "RECIPIENT_REQUIRED");

      const sectionMap = new Map<string, { section_key: string; title: string; sort_order: number; show_in_pdf: boolean }>();
      for (const section of packageDetail?.sections ?? []) {
        sectionMap.set(section.section_key, { section_key: section.section_key, title: section.title, sort_order: section.sort_order, show_in_pdf: section.show_default });
      }
      for (const row of items.filter((item) => item.selected)) {
        if (!sectionMap.has(row.sectionKey)) sectionMap.set(row.sectionKey, { section_key: row.sectionKey, title: row.sectionTitle, sort_order: 800, show_in_pdf: true });
      }
      for (const row of serviceRows.filter((service) => service.selected)) {
        if (!sectionMap.has(row.sectionKey)) sectionMap.set(row.sectionKey, { section_key: row.sectionKey, title: row.sectionTitle, sort_order: 900, show_in_pdf: true });
      }

      const validDays = settings?.proposal_valid_days ?? 7;
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + validDays);
      const validUntil = `${validDate.getFullYear()}-${String(validDate.getMonth() + 1).padStart(2, "0")}-${String(validDate.getDate()).padStart(2, "0")}`;
      const selectedPackage = packages.find((item) => item.id === packageId);
      const hasRentalItems = items.some((row) => row.selected);

      const result = await atelierApi.proposals.create({
        client_id: recipientMode === "client" ? clientId : "",
        recipient_name: recipientMode === "client" ? linkedClient?.name || "" : recipientName.trim(),
        recipient_phone: recipientMode === "client" ? linkedClient?.phone || "" : recipientPhone.trim(),
        recipient_email: recipientMode === "client" ? linkedClient?.email || "" : recipientEmail.trim(),
        event_id: eventId,
        event_title: eventTitle.trim(),
        event_date: eventDate,
        ceremony_venue: ceremonyVenue.trim(),
        reception_venue: receptionVenue.trim(),
        package_id: packageId,
        package_price: packagePrice,
        pricing_mode: pricingMode,
        manual_total: pricingMode === "manual" ? manualTotal : "",
        show_item_prices: showItemPrices,
        show_service_prices: showServicePrices,
        title: title.trim() || selectedPackage?.name || "Proposta personalizada",
        guest_count: guestCount || "",
        valid_until: validUntil,
        document_template: selectedPackage?.name.toLocaleLowerCase("pt-BR").includes("locação") || (!packageId && hasRentalItems) ? "rental" : "package",
        status: "sent",
        payment_terms: {
          methods: paymentMethods,
          installments_card: paymentMethods.includes("Cartão") && cardInstallments ? Number(cardInstallments) : null,
          reservation_requires_deposit: true,
          notes: paymentNotes.trim(),
        },
        sections: Array.from(sectionMap.values()),
        items: items.filter((row) => row.selected).map((row, index) => ({
          inventory_item_id: row.inventoryItemId,
          name: row.name,
          description: row.description,
          quantity: row.quantity,
          unit_price: row.included ? 0 : row.unitPrice,
          billing_mode: row.included ? "included" : "unit",
          show_in_pdf: true,
          reserve_stock: row.reserveStock,
          sort_order: index,
          section_key: row.sectionKey,
          section_title: row.sectionTitle,
        })),
        services: serviceRows.filter((row) => row.selected).map((row, index) => ({
          service_id: row.serviceId,
          name: row.name,
          description: row.description,
          quantity: row.quantity,
          unit_price: row.included ? 0 : row.unitPrice,
          billing_mode: row.included ? "included" : "unit",
          show_in_pdf: true,
          sort_order: index,
          section_key: row.sectionKey,
          section_title: row.sectionTitle,
        })),
      });

      await onSaved();
      announce(`Proposta #${result.data.proposal_number} criada e calculada`);
      onClose();
      onCreated(result.data.id);
    } catch (caught) {
      const message = apiErrorMessage(caught);
      setError(message);
      announce(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay px-3 py-3 sm:px-5 sm:py-5" role="dialog" aria-modal="true">
      <form className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated" onSubmit={submit}>
        <div className="flex items-start justify-between border-b border-border bg-peach px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Nova proposta</p>
            <h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold"><FileText className="h-5 w-5 text-brand" />Montar proposta comercial</h2>
            <p className="mt-1 text-xs text-muted-foreground">Defina aqui os valores desta negociação. O catálogo serve apenas como referência inicial.</p>
          </div>
          <Button variant="icon" className="h-9 w-9" onClick={onClose} type="button" aria-label="Fechar"><X className="h-5 w-5" /></Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
            <aside className="space-y-4">
              <section className="rounded-lg border border-border p-4">
                <h3 className="font-display text-xl font-semibold">Destinatário</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/35 p-1">
                  <button type="button" onClick={() => setRecipientMode("contact")} className={`rounded-md px-3 py-2 text-xs font-medium ${recipientMode === "contact" ? "bg-card shadow-soft text-brand" : "text-muted-foreground"}`}>Novo contato</button>
                  <button type="button" onClick={() => setRecipientMode("client")} className={`rounded-md px-3 py-2 text-xs font-medium ${recipientMode === "client" ? "bg-card shadow-soft text-brand" : "text-muted-foreground"}`}>Cliente cadastrado</button>
                </div>
                <div className="mt-3 space-y-3">
                  {recipientMode === "client" ? (
                    <label className="block"><span className="text-xs font-semibold text-muted-foreground">Cliente</span><select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">Selecione</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
                  ) : (
                    <>
                      <ControlledField label="Nome do contato" value={recipientName} onChange={setRecipientName} />
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><ControlledField label="Telefone" value={recipientPhone} onChange={setRecipientPhone} /><ControlledField label="E-mail" type="email" value={recipientEmail} onChange={setRecipientEmail} /></div>
                    </>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="font-display text-xl font-semibold">Evento</h3>
                <p className="mt-1 text-[10px] text-muted-foreground">Vincular um evento é opcional. A proposta pode nascer antes do cadastro definitivo.</p>
                <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Evento cadastrado (opcional)</span><select value={eventId} onChange={(e) => selectEvent(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">Sem vínculo</option>{events.map((item) => <option key={item.id} value={item.id}>{formatDate(item.event_date)} · {item.title}</option>)}</select></label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <ControlledField label="Nome / tipo do evento" value={eventTitle} onChange={setEventTitle} />
                  <ControlledField label="Data" type="date" value={eventDate} onChange={setEventDate} />
                  <ControlledField label="Convidados" type="number" value={guestCount ? String(guestCount) : ""} onChange={(value) => setGuestCount(Math.max(0, Number(value || 0)))} />
                  <ControlledField label="Local da cerimônia" value={ceremonyVenue} onChange={setCeremonyVenue} />
                  <div className="sm:col-span-2 xl:col-span-1 2xl:col-span-2"><ControlledField label="Local da recepção" value={receptionVenue} onChange={setReceptionVenue} /></div>
                </div>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="font-display text-xl font-semibold">Modelo e investimento</h3>
                <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Pacote / modelo (opcional)</span><select value={packageId} onChange={(e) => setPackageId(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">Proposta personalizada</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <div className="mt-3"><ControlledField label="Título" value={title} onChange={setTitle} /></div>
                <div className="mt-4 rounded-lg bg-muted/35 p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <button type="button" onClick={() => setPricingMode("manual")} className={`rounded-md px-3 py-2 text-xs font-medium ${pricingMode === "manual" ? "bg-card text-brand shadow-soft" : "text-muted-foreground"}`}>Valor final</button>
                    <button type="button" onClick={() => setPricingMode("automatic")} className={`rounded-md px-3 py-2 text-xs font-medium ${pricingMode === "automatic" ? "bg-card text-brand shadow-soft" : "text-muted-foreground"}`}>Somar detalhes</button>
                  </div>
                </div>
                {pricingMode === "manual" ? (
                  <div className="mt-3">
                    <ControlledField label="Valor final da proposta" type="number" value={manualTotal} onChange={setManualTotal} />
                    <p className="mt-1 text-[10px] text-muted-foreground">Os valores individuais dos itens e serviços ficam opcionais e podem ser usados apenas como referência interna.</p>
                  </div>
                ) : (
                  <div className="mt-3">
                    <ControlledField label="Valor base do pacote" type="number" value={packagePrice ? String(packagePrice) : ""} onChange={(value) => setPackagePrice(Math.max(0, Number(value || 0)))} />
                    <p className="mt-1 text-[10px] text-muted-foreground">O total é calculado por pacote + itens + serviços cobrados separadamente.</p>
                  </div>
                )}
                <div className="mt-4 space-y-2 rounded-lg border border-border bg-card p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">O que o cliente vê</p>
                  <label className="flex items-center justify-between gap-3 text-xs"><span>Mostrar preços dos itens / locações no PDF</span><input type="checkbox" checked={showItemPrices} onChange={(e) => setShowItemPrices(e.target.checked)} /></label>
                  <label className="flex items-center justify-between gap-3 text-xs"><span>Mostrar preços dos serviços no PDF</span><input type="checkbox" checked={showServicePrices} onChange={(e) => setShowServicePrices(e.target.checked)} /></label>
                </div>
                <div className="mt-4 rounded-lg border border-border bg-card p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">Formas de pagamento</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {["Pix", "Transferência", "Cartão"].map((method) => (
                      <label key={method} className="flex items-center gap-2"><input type="checkbox" checked={paymentMethods.includes(method)} onChange={(e) => setPaymentMethods((old) => e.target.checked ? Array.from(new Set([...old, method])) : old.filter((item) => item !== method))} />{method}</label>
                    ))}
                  </div>
                  {paymentMethods.includes("Cartão") && <div className="mt-3"><ControlledField label="Parcelas no cartão" type="number" value={cardInstallments} onChange={setCardInstallments} /></div>}
                  <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Condição / observação de pagamento</span><textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="mt-1 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
                </div>
                <div className="mt-4 rounded-lg bg-sand p-4">
                  <div className="flex items-end justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-brand">Investimento</span><strong className="font-display text-3xl">{formatCurrency(totalPreview)}</strong></div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{pricingMode === "manual" ? "Valor final definido por você para esta negociação." : "Valor calculado automaticamente pelos detalhes selecionados."}</p>
                </div>
              </section>
            </aside>

            <div className="space-y-4">
              <section className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-xl font-semibold">Itens / locações</h3><p className="text-xs text-muted-foreground">Marque o que entra nesta proposta e ajuste quantidade e valor somente para esta negociação.</p></div>{loadingPackage && <RefreshCw className="mt-1 h-4 w-4 animate-spin text-brand" />}</div>
                <div className="mt-3 max-h-[300px] overflow-auto rounded-lg border border-border">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead className="sticky top-0 bg-card text-muted-foreground"><tr><th className="p-2 font-medium">Usar</th><th className="p-2 font-medium">Item</th><th className="p-2 font-medium">Qtd.</th><th className="p-2 font-medium">Incluso</th><th className="p-2 font-medium">Valor interno (opcional)</th><th className="p-2 font-medium">Reservar</th></tr></thead>
                    <tbody>{items.map((row, index) => <tr key={row.inventoryItemId} className="border-t border-border"><td className="p-2"><input type="checkbox" checked={row.selected} onChange={(e) => setItems((old) => old.map((item, i) => i === index ? { ...item, selected: e.target.checked } : item))} /></td><td className="p-2"><strong>{row.name}</strong>{row.packageDefined && <span className="ml-2 rounded-full bg-sage px-2 py-0.5 text-[9px] text-success">do pacote</span>}</td><td className="p-2"><input type="number" min="0" step="1" disabled={!row.selected} value={String(row.quantity)} onChange={(e) => setItems((old) => old.map((item, i) => i === index ? { ...item, quantity: Math.max(0, Number(e.target.value || 0)) } : item))} className="h-8 w-20 rounded border border-input bg-background px-2" /></td><td className="p-2"><input type="checkbox" disabled={!row.selected || !packageId} checked={row.included} onChange={(e) => setItems((old) => old.map((item, i) => i === index ? { ...item, included: e.target.checked } : item))} /></td><td className="p-2"><input type="number" min="0" step="0.01" disabled={!row.selected || row.included} value={row.unitPrice ? String(row.unitPrice) : ""} placeholder="Opcional" onChange={(e) => setItems((old) => old.map((item, i) => i === index ? { ...item, unitPrice: Math.max(0, Number(e.target.value || 0)) } : item))} className="h-8 w-28 rounded border border-input bg-background px-2" /></td><td className="p-2"><input type="checkbox" disabled={!row.selected} checked={row.reserveStock} onChange={(e) => setItems((old) => old.map((item, i) => i === index ? { ...item, reserveStock: e.target.checked } : item))} /></td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="font-display text-xl font-semibold">Serviços</h3>
                <p className="text-xs text-muted-foreground">O valor individual é opcional e serve para controle interno. Você pode deixar em branco e informar somente o valor final da proposta.</p>
                <div className="mt-3 max-h-[300px] overflow-auto rounded-lg border border-border">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="sticky top-0 bg-card text-muted-foreground"><tr><th className="p-2 font-medium">Usar</th><th className="p-2 font-medium">Serviço</th><th className="p-2 font-medium">Qtd.</th><th className="p-2 font-medium">Incluso</th><th className="p-2 font-medium">Valor interno (opcional)</th></tr></thead>
                    <tbody>{serviceRows.map((row, index) => <tr key={row.serviceId} className="border-t border-border"><td className="p-2"><input type="checkbox" checked={row.selected} onChange={(e) => setServiceRows((old) => old.map((service, i) => i === index ? { ...service, selected: e.target.checked } : service))} /></td><td className="p-2"><strong>{row.name}</strong>{row.packageDefined && <span className="ml-2 rounded-full bg-sage px-2 py-0.5 text-[9px] text-success">do pacote</span>}</td><td className="p-2"><input type="number" min="0" step="1" disabled={!row.selected} value={String(row.quantity)} onChange={(e) => setServiceRows((old) => old.map((service, i) => i === index ? { ...service, quantity: Math.max(0, Number(e.target.value || 0)) } : service))} className="h-8 w-20 rounded border border-input bg-background px-2" /></td><td className="p-2"><input type="checkbox" disabled={!row.selected || !packageId} checked={row.included} onChange={(e) => setServiceRows((old) => old.map((service, i) => i === index ? { ...service, included: e.target.checked } : service))} /></td><td className="p-2"><input type="number" min="0" step="0.01" disabled={!row.selected || row.included} value={row.unitPrice ? String(row.unitPrice) : ""} placeholder="Opcional" onChange={(e) => setServiceRows((old) => old.map((service, i) => i === index ? { ...service, unitPrice: Math.max(0, Number(e.target.value || 0)) } : service))} className="h-8 w-28 rounded border border-input bg-background px-2" /></td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              <div className="rounded-lg bg-sage px-4 py-3 text-xs text-success"><Check className="mr-2 inline h-4 w-4" />Os valores acima ficam congelados nesta proposta. Alterar o catálogo depois não modifica a negociação já criada.</div>
            </div>
          </div>
          {error && <div className="mt-4 rounded-lg bg-blush px-4 py-3 text-xs text-danger">{error}</div>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          <p className="hidden text-xs text-muted-foreground sm:block">A proposta pode ser criada para um contato ainda não cadastrado como cliente.</p>
          <div className="ml-auto flex gap-2"><Button variant="outline" className="h-10 px-4" onClick={onClose} type="button">Cancelar</Button><Button variant="primary" className="h-10 px-5" type="submit" disabled={saving}>{saving ? "Criando..." : "Criar proposta"}</Button></div>
        </div>
      </form>
    </div>
  );
}


function EntityModal({
  state,
  clients,
  events,
  packages,
  onClose,
  onSaved,
  announce,
}: {
  state: Exclude<ModalState, null>;
  clients: Client[];
  events: EventRecord[];
  packages: PackageItem[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  announce: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const kind = state.kind;
  const editingInventory = state.inventoryItem;
  const content = {
    event: { eyebrow: "Novo evento", title: "Vamos organizar o próximo evento", icon: CalendarDays, button: "Salvar evento" },
    inventory: {
      eyebrow: editingInventory ? "Editar item" : "Novo item",
      title: editingInventory ? editingInventory.name : "Adicionar ao estoque",
      icon: PackageCheck,
      button: editingInventory ? "Salvar item" : "Adicionar item",
    },
    proposal: { eyebrow: "Nova proposta", title: "Criar proposta comercial", icon: FileText, button: "Criar proposta" },
    client: { eyebrow: "Novo cliente", title: "Cadastrar cliente", icon: UserPlus, button: "Salvar cliente" },
  }[kind];
  const Icon = content.icon;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    try {
      if (kind === "client") {
        await atelierApi.clients.create({
          name: value("name"),
          phone: value("phone"),
          email: value("email"),
          notes: value("notes"),
        });
      }

      if (kind === "inventory") {
        const categoryName = value("category_name");
        const payload = {
          name: value("name"),
          ...(categoryName ? { category_name: categoryName } : {}),
          unit: value("unit") || "un",
          total_quantity: Number(value("total_quantity") || 0),
          maintenance_quantity: Number(value("maintenance_quantity") || 0),
          default_unit_price: Number(value("default_unit_price") || 0),
          description: value("description"),
        };
        if (editingInventory) {
          await atelierApi.inventory.update(editingInventory.id, payload);
        } else {
          await atelierApi.inventory.create(payload);
        }
      }

      if (kind === "event") {
        const date = value("event_date");
        const reserveFrom = value("reserve_from");
        const reserveUntil = value("reserve_until");
        if (Boolean(reserveFrom) !== Boolean(reserveUntil)) {
          throw new AtelierApiError("Preencha as duas datas da reserva ou deixe as duas em branco.", "RESERVATION_PERIOD_PAIR");
        }
        await atelierApi.events.create({
          client_id: value("client_id"),
          event_type_code: value("event_type_code") || "OUTRO",
          title: value("title"),
          event_date: date,
          reserve_from: reserveFrom,
          reserve_until: reserveUntil,
          reception_venue: value("reception_venue"),
          ceremony_venue: value("ceremony_venue"),
          guest_count: value("guest_count"),
          status: value("status") || "confirmed",
          notes: value("notes"),
        });
      }

      if (kind === "proposal") {
        const eventId = value("event_id");
        const selectedEvent = events.find((item) => item.id === eventId);
        const packageId = value("package_id");
        const selectedPackage = packages.find((item) => item.id === packageId);
        const clientId = value("client_id") || selectedEvent?.client_id || "";
        await atelierApi.proposals.create({
          client_id: clientId,
          event_id: eventId,
          package_id: packageId,
          title: value("title") || selectedPackage?.name || "Proposta",
          guest_count: value("guest_count") || selectedEvent?.guest_count || "",
          document_template: selectedPackage?.name.toLocaleLowerCase("pt-BR").includes("locação") ? "rental" : "package",
          status: "sent",
        });
      }

      await onSaved();
      announce(`${content.button} — salvo com sucesso`);
      onClose();
    } catch (caught) {
      const message = apiErrorMessage(caught);
      setError(message);
      announce(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay px-4" role="dialog" aria-modal="true">
      <form className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-elevated" onSubmit={submit}>
        <div className="flex items-start justify-between border-b border-border bg-peach px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{content.eyebrow}</p>
            <h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold"><Icon className="h-5 w-5 text-brand" />{content.title}</h2>
          </div>
          <Button variant="icon" className="h-9 w-9" onClick={onClose} type="button" aria-label="Fechar"><X className="h-5 w-5" /></Button>
        </div>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          {kind === "client" && (
            <>
              <Field label="Nome" name="name" required placeholder="Nome do cliente" />
              <Field label="Telefone" name="phone" placeholder="(00) 00000-0000" />
              <Field label="E-mail" name="email" type="email" placeholder="cliente@email.com" />
              <Field label="Observação" name="notes" placeholder="Observação opcional" />
            </>
          )}

          {kind === "inventory" && (
            <>
              <Field label="Nome do item" name="name" required defaultValue={editingInventory?.name} />
              <Field label="Categoria" name="category_name" defaultValue={editingInventory?.category_name} placeholder="Ex.: Louças" />
              <Field label="Quantidade total" name="total_quantity" type="number" min="0" required defaultValue={editingInventory?.total_quantity ?? 0} />
              <Field label="Em manutenção" name="maintenance_quantity" type="number" min="0" defaultValue={editingInventory?.maintenance_quantity ?? 0} />
              <Field label="Valor padrão" name="default_unit_price" type="number" min="0" step="0.01" defaultValue={Number(editingInventory?.default_unit_price ?? 0)} />
              <Field label="Unidade" name="unit" defaultValue={editingInventory?.unit ?? "un"} />
              <div className="sm:col-span-2"><Field label="Descrição" name="description" defaultValue={editingInventory?.description} /></div>
              <div className="sm:col-span-2 rounded-lg bg-sage px-4 py-3 text-xs text-success"><Check className="mr-2 inline h-4 w-4" />Valor e quantidade atualizados passam a ser usados nos próximos cálculos.</div>
            </>
          )}

          {kind === "event" && (
            <>
              <SelectField label="Cliente" name="client_id" options={clients.map((client) => ({ value: client.id, label: client.name }))} />
              <SelectField
                label="Tipo de evento"
                name="event_type_code"
                required
                options={[
                  { value: "CASAMENTO", label: "Casamento" },
                  { value: "15_ANOS", label: "15 anos" },
                  { value: "ANIVERSARIO", label: "Aniversário" },
                  { value: "CORPORATIVO", label: "Corporativo" },
                  { value: "OUTRO", label: "Outro" },
                ]}
              />
              <div className="sm:col-span-2"><Field label="Nome do evento" name="title" required placeholder="Ex.: Casamento Ana & Lucas" /></div>
              <Field label="Data do evento" name="event_date" type="date" required />
              <Field label="Convidados" name="guest_count" type="number" min="0" />
              <SelectField
                label="Status"
                name="status"
                defaultValue="confirmed"
                options={[
                  { value: "quote", label: "Orçamento" },
                  { value: "sent", label: "Proposta enviada" },
                  { value: "confirmed", label: "Confirmado" },
                  { value: "preparation", label: "Em preparação" },
                  { value: "in_progress", label: "Em andamento" },
                  { value: "completed", label: "Concluído" },
                  { value: "cancelled", label: "Cancelado" },
                ]}
              />
              <div className="hidden sm:block" />
              <Field label="Retirada / início da reserva (opcional)" name="reserve_from" type="date" />
              <Field label="Devolução / fim da reserva (opcional)" name="reserve_until" type="date" />
              <div className="sm:col-span-2 rounded-lg border border-border bg-muted/35 px-3 py-2 text-xs text-muted-foreground">
                Preencha as duas datas somente quando este evento usar itens do acervo do Atelier. Eventos sem itens próprios podem ficar sem período de reserva.
              </div>
              <Field label="Local da cerimônia" name="ceremony_venue" />
              <Field label="Local da recepção" name="reception_venue" />
              <div className="sm:col-span-2"><Field label="Observação" name="notes" /></div>
            </>
          )}

          {kind === "proposal" && (
            <>
              <SelectField label="Cliente" name="client_id" options={clients.map((client) => ({ value: client.id, label: client.name }))} />
              <SelectField label="Evento" name="event_id" options={events.map((item) => ({ value: item.id, label: `${formatDate(item.event_date)} · ${item.title}` }))} />
              <div className="sm:col-span-2"><SelectField label="Pacote / modelo" name="package_id" options={packages.map((item) => ({ value: item.id, label: `${item.name} · ${formatCurrency(item.default_price)}` }))} /></div>
              <Field label="Título" name="title" placeholder="Deixe vazio para usar o nome do pacote" />
              <Field label="Convidados" name="guest_count" type="number" min="0" />
              <div className="sm:col-span-2 rounded-lg bg-sand px-4 py-3 text-xs text-brand">Ao escolher um pacote, itens e serviços padrão são copiados para a proposta. Alterações futuras no catálogo não mudam essa proposta.</div>
            </>
          )}

          {error && <div className="sm:col-span-2 rounded-lg bg-blush px-4 py-3 text-xs text-danger">{error}</div>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" className="h-10 px-4" onClick={onClose} type="button">Cancelar</Button>
          <Button variant="primary" className="h-10 px-5" type="submit" disabled={saving}>{saving ? "Salvando..." : content.button}</Button>
        </div>
      </form>
    </div>
  );
}

function ProposalPreview({ html, title, onClose }: { html: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[75] bg-overlay p-3 sm:p-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border bg-peach px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Pré-visualização</p>
            <h2 className="font-display text-xl font-semibold">{title}</h2>
          </div>
          <Button variant="icon" className="h-9 w-9" onClick={onClose} aria-label="Fechar prévia"><X className="h-5 w-5" /></Button>
        </div>
        <iframe title={title} srcDoc={html} className="min-h-0 flex-1 bg-white" />
      </div>
    </div>
  );
}


function EventDetailModal({
  eventId,
  clients,
  onClose,
  onSaved,
  announce,
}: {
  eventId: string;
  clients: Client[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  announce: (message: string) => void;
}) {
  const [detail, setDetail] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    client_id: "",
    event_date: "",
    guest_count: "",
    reserve_from: "",
    reserve_until: "",
    ceremony_venue: "",
    reception_venue: "",
    status: "confirmed",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void atelierApi.events.detail(eventId)
      .then((result) => {
        if (cancelled) return;
        setDetail(result);
        const event = result.data;
        setForm({
          title: event.title ?? "",
          client_id: event.client_id ?? "",
          event_date: event.event_date?.slice(0, 10) ?? "",
          guest_count: event.guest_count == null ? "" : String(event.guest_count),
          reserve_from: event.reserve_from?.slice(0, 10) ?? "",
          reserve_until: event.reserve_until?.slice(0, 10) ?? "",
          ceremony_venue: event.ceremony_venue ?? "",
          reception_venue: event.reception_venue ?? "",
          status: event.status || "confirmed",
          notes: event.notes ?? "",
        });
      })
      .catch((caught) => {
        if (!cancelled) setError(apiErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const change = (key: keyof typeof form, value: string) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (Boolean(form.reserve_from) !== Boolean(form.reserve_until)) {
      setError("Preencha as duas datas da reserva ou deixe as duas em branco.");
      return;
    }
    setSaving(true);
    try {
      await atelierApi.events.update(eventId, {
        title: form.title,
        client_id: form.client_id,
        event_date: form.event_date,
        guest_count: form.guest_count,
        reserve_from: form.reserve_from,
        reserve_until: form.reserve_until,
        ceremony_venue: form.ceremony_venue,
        reception_venue: form.reception_venue,
        status: form.status,
        notes: form.notes,
      });
      await onSaved();
      announce("Evento atualizado com sucesso");
      onClose();
    } catch (caught) {
      const message = apiErrorMessage(caught);
      setError(message);
      announce(message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const title = detail?.data.title || "este evento";
    if (!window.confirm(`Excluir definitivamente ${title}? As reservas de itens deste evento serão liberadas.`)) return;
    setDeleting(true);
    setError("");
    try {
      const result = await atelierApi.events.delete(eventId);
      await onSaved();
      announce(result.detached_proposals > 0
        ? `Evento excluído. ${result.detached_proposals} proposta(s) permaneceram salvas sem vínculo com o evento.`
        : "Evento excluído com sucesso");
      onClose();
    } catch (caught) {
      const message = apiErrorMessage(caught);
      setError(message);
      announce(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[76] grid place-items-center bg-overlay px-4" role="dialog" aria-modal="true">
      <form onSubmit={save} className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-start justify-between border-b border-border bg-peach px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Detalhes do evento</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{detail?.data.title || "Evento"}</h2>
            {detail?.data.event_type && (
              <p className="mt-1 text-xs text-muted-foreground">{detail.data.event_type.name}</p>
            )}
          </div>
          <Button variant="icon" className="h-9 w-9" onClick={onClose} type="button" aria-label="Fechar"><X className="h-5 w-5" /></Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />Carregando detalhes...</div>
          ) : detail ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">Nome do evento</span>
                <input value={form.title} onChange={(e) => change("title", e.target.value)} required className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Cliente vinculado</span>
                <select value={form.client_id} onChange={(e) => change("client_id", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Sem cliente vinculado</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Status</span>
                <select value={form.status} onChange={(e) => change("status", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option value="draft">Planejado / não confirmado</option>
                  <option value="quote">Orçamento</option>
                  <option value="sent">Proposta enviada</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="preparation">Em preparação</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Data do evento</span>
                <input type="date" value={form.event_date} onChange={(e) => change("event_date", e.target.value)} required className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Convidados</span>
                <input type="number" min="0" value={form.guest_count} onChange={(e) => change("guest_count", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Retirada / início da reserva (opcional)</span>
                <input type="date" value={form.reserve_from} onChange={(e) => change("reserve_from", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Devolução / fim da reserva (opcional)</span>
                <input type="date" value={form.reserve_until} onChange={(e) => change("reserve_until", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <div className="sm:col-span-2 rounded-lg border border-border bg-muted/35 px-3 py-2 text-xs text-muted-foreground">
                O período de reserva é opcional. Só preencha quando houver itens do acervo do Atelier. {detail.items.length > 0 ? `Este evento possui ${detail.items.length} item(ns) reservado(s); remova-os antes de limpar as datas.` : "Sem itens do acervo reservados neste momento."}
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Local da cerimônia</span>
                <input value={form.ceremony_venue} onChange={(e) => change("ceremony_venue", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Local da recepção</span>
                <input value={form.reception_venue} onChange={(e) => change("reception_venue", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">Observações</span>
                <textarea value={form.notes} onChange={(e) => change("notes", e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
          ) : null}
          {error && <div className="mt-4 rounded-lg border border-danger/20 bg-blush px-4 py-3 text-xs text-danger">{error}</div>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background px-5 py-4">
          <Button type="button" variant="outline" className="h-10 border-danger/30 px-4 text-danger hover:bg-blush" onClick={() => void remove()} disabled={loading || deleting || saving}>
            <Trash2 className="h-4 w-4" />{deleting ? "Excluindo..." : "Excluir evento"}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-10 px-4" onClick={onClose}>Fechar</Button>
            <Button type="submit" variant="primary" className="h-10 px-5" disabled={loading || saving || deleting}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ReservationModal({
  event,
  inventory,
  onClose,
  onSaved,
  announce,
}: {
  event: EventRecord;
  inventory: InventoryItem[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  announce: (message: string) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasReservationPeriod = Boolean(event.reserve_from && event.reserve_until);

  useEffect(() => {
    let cancelled = false;
    if (!event.reserve_from || !event.reserve_until) {
      setAvailability([]);
      setQuantities({});
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    void Promise.all([
      atelierApi.events.items(event.id),
      atelierApi.inventory.availability(event.reserve_from, event.reserve_until, event.id),
    ])
      .then(([itemsResult, availabilityResult]) => {
        if (cancelled) return;
        const current: Record<string, number> = {};
        for (const item of itemsResult.items) current[item.inventory_item_id] = Number(item.quantity || 0);
        setQuantities(current);
        setAvailability(availabilityResult.data);
      })
      .catch((caught) => {
        if (!cancelled) setError(apiErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [event.id, event.reserve_from, event.reserve_until]);

  const availabilityMap = useMemo(
    () => new Map(availability.map((item) => [item.inventory_item_id, item])),
    [availability],
  );

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const items = Object.entries(quantities)
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([inventory_item_id, quantity]) => ({ inventory_item_id, quantity: Number(quantity) }));
      await atelierApi.events.saveItems(event.id, items);
      await onSaved();
      announce(`Reserva de itens atualizada para ${event.title}`);
      onClose();
    } catch (caught) {
      const message = stockConflictMessage(caught);
      setError(message);
      announce(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[74] grid place-items-center bg-overlay px-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-start justify-between border-b border-border bg-peach px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Reserva de estoque</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{event.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasReservationPeriod ? `${formatDate(event.reserve_from)} a ${formatDate(event.reserve_until)}` : "Sem período de reserva do acervo"}
            </p>
          </div>
          <Button variant="icon" className="h-9 w-9" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {!hasReservationPeriod ? (
            <div className="rounded-lg border border-border bg-muted/35 px-5 py-8 text-center">
              <Package className="mx-auto h-7 w-7 text-brand" />
              <h3 className="mt-3 font-display text-xl">Este evento não usa o acervo neste momento</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Defina retirada/início e devolução/fim da reserva em Detalhes somente se houver itens próprios do Atelier para bloquear no período.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />Carregando estoque e reservas...</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="hidden grid-cols-[minmax(0,1fr)_100px_110px_120px] gap-3 bg-muted/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Item</span><span>Total</span><span>Disponível</span><span>Reservar</span>
              </div>
              {inventory.map((item) => {
                const stock = availabilityMap.get(item.id);
                const max = Number(stock?.available_quantity ?? item.available_without_reservations ?? 0);
                const requested = Number(quantities[item.id] ?? 0);
                const invalid = requested > max;
                return (
                  <div key={item.id} className="grid gap-3 border-t border-border px-4 py-3 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_100px_110px_120px] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category_name || "Sem categoria"}</p>
                    </div>
                    <div className="text-xs"><span className="sm:hidden text-muted-foreground">Total: </span>{stock?.total_quantity ?? item.total_quantity}</div>
                    <div className={`text-xs font-semibold ${max > 0 ? "text-success" : "text-danger"}`}><span className="sm:hidden text-muted-foreground">Disponível: </span>{max}</div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={requested}
                      onChange={(change) => setQuantities((old) => ({ ...old, [item.id]: Math.max(0, Number(change.target.value || 0)) }))}
                      className={`h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${invalid ? "border-danger text-danger" : "border-input"}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
          {error && <div className="mt-4 rounded-lg bg-blush px-4 py-3 text-xs text-danger">{error}</div>}
          {!loading && inventory.every((item) => item.total_quantity === 0) && (
            <div className="mt-4 rounded-lg bg-sand px-4 py-3 text-xs text-brand">
              O catálogo inicial está com quantidade física zero. Atualize o estoque real antes de confirmar reservas.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" className="h-10 px-4" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" className="h-10 px-5" onClick={() => void save()} disabled={saving || loading || !hasReservationPeriod}>{saving ? "Validando estoque..." : "Salvar reserva"}</Button>
        </div>
      </div>
    </div>
  );
}

function ProposalEditor({
  proposalId,
  onClose,
  onSaved,
  announce,
  onPreview,
  onPdf,
  onDelete,
}: {
  proposalId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
  announce: (message: string) => void;
  onPreview: (id: string) => void;
  onPdf: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [detail, setDetail] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void atelierApi.proposals.detail(proposalId)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(apiErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [proposalId]);

  const updateData = (patch: Partial<ProposalDetail["data"]>) => {
    setDetail((old) => old ? { ...old, data: { ...old.data, ...patch } } : old);
  };

  const saveProposal = async (showMessage = true) => {
    if (!detail) return false;
    setSaving(true);
    setError("");
    try {
      const sectionKeys = new Map(detail.sections.map((section) => [section.id, section.section_key]));
      const result = await atelierApi.proposals.update(proposalId, {
        title: detail.data.title,
        status: "sent",
        guest_count: detail.data.guest_count ?? "",
        package_price: Number(detail.data.package_price_snapshot ?? 0),
        pricing_mode: detail.data.pricing_mode || "manual",
        manual_total: detail.data.pricing_mode === "manual" ? detail.data.manual_total ?? detail.data.total ?? 0 : "",
        show_item_prices: Boolean(detail.data.show_item_prices),
        show_service_prices: Boolean(detail.data.show_service_prices),
        discount_type: detail.data.discount_type,
        discount_value: Number(detail.data.discount_value ?? 0),
        valid_until: detail.data.valid_until ?? "",
        intro_text: detail.data.intro_text ?? "",
        closing_text: detail.data.closing_text ?? "",
        payment_terms: detail.data.payment_terms ?? {},
        notes: detail.data.notes ?? "",
        client_id: detail.data.client_id ?? "",
        event_id: detail.data.event_id ?? "",
        recipient_name: detail.data.recipient_name ?? detail.client?.name ?? "",
        recipient_phone: detail.data.recipient_phone ?? detail.client?.phone ?? "",
        recipient_email: detail.data.recipient_email ?? detail.client?.email ?? "",
        event_title: detail.data.event_title_snapshot ?? detail.event?.title ?? "",
        event_date: detail.data.event_date_snapshot ?? detail.event?.event_date ?? "",
        ceremony_venue: detail.data.ceremony_venue_snapshot ?? detail.event?.ceremony_venue ?? "",
        reception_venue: detail.data.reception_venue_snapshot ?? detail.event?.reception_venue ?? "",
        sections: detail.sections.map((section) => ({
          section_key: section.section_key,
          title: section.title,
          sort_order: section.sort_order,
          show_in_pdf: section.show_in_pdf,
        })),
        items: detail.items.map((item) => ({
          inventory_item_id: item.inventory_item_id,
          name: item.name_snapshot,
          description: item.description_snapshot,
          quantity: Number(item.quantity ?? 0),
          unit_price: Number(item.unit_price ?? 0),
          billing_mode: item.billing_mode,
          show_in_pdf: item.show_in_pdf,
          reserve_stock: item.reserve_stock,
          sort_order: item.sort_order,
          section_key: item.section_id ? sectionKeys.get(item.section_id) : undefined,
        })),
        services: detail.services.map((service) => ({
          service_id: service.service_id,
          name: service.name_snapshot,
          description: service.description_snapshot,
          quantity: Number(service.quantity ?? 0),
          unit_price: Number(service.unit_price ?? 0),
          billing_mode: service.billing_mode,
          show_in_pdf: service.show_in_pdf,
          sort_order: service.sort_order,
          section_key: service.section_id ? sectionKeys.get(service.section_id) : undefined,
        })),
      });
      setDetail(result);
      await onSaved();
      if (showMessage) announce(`Proposta #${result.data.proposal_number} salva e recalculada`);
      return true;
    } catch (caught) {
      const message = apiErrorMessage(caught);
      setError(message);
      announce(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const reserveStock = async () => {
    if (!(await saveProposal(false))) return;
    try {
      await atelierApi.proposals.reserve(proposalId);
      await onSaved();
      announce("Estoque da proposta reservado para o evento");
    } catch (caught) {
      const message = stockConflictMessage(caught);
      setError(message);
      announce(message);
    }
  };

  const setSection = (index: number, patch: Partial<ProposalDetail["sections"][number]>) => {
    setDetail((old) => {
      if (!old) return old;
      const sections = [...old.sections];
      sections[index] = { ...sections[index], ...patch };
      return { ...old, sections };
    });
  };

  const setItem = (index: number, patch: Partial<ProposalDetail["items"][number]>) => {
    setDetail((old) => {
      if (!old) return old;
      const items = [...old.items];
      items[index] = { ...items[index], ...patch };
      return { ...old, items };
    });
  };

  const setService = (index: number, patch: Partial<ProposalDetail["services"][number]>) => {
    setDetail((old) => {
      if (!old) return old;
      const services = [...old.services];
      services[index] = { ...services[index], ...patch };
      return { ...old, services };
    });
  };

  return (
    <div className="fixed inset-0 z-[74] grid place-items-center bg-overlay px-3 py-3 sm:px-5 sm:py-5" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-start justify-between border-b border-border bg-peach px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Editor de proposta</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {detail ? `#${detail.data.proposal_number} · ${detail.data.title}` : "Carregando proposta..."}
            </h2>
            {detail && <p className="mt-1 text-xs text-muted-foreground">{detail.client?.name || detail.data.recipient_name || "Contato não informado"} · {detail.package?.name || "Proposta personalizada"}</p>}
          </div>
          <Button variant="icon" className="h-9 w-9" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading && <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />Carregando composição...</div>}
          {detail && (
            <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <aside className="space-y-4">
                <section className="rounded-lg border border-border p-4">
                  <h3 className="font-display text-xl font-semibold">Destinatário e evento</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <ControlledField label="Nome do contato" value={detail.data.recipient_name ?? detail.client?.name ?? ""} onChange={(value) => updateData({ recipient_name: value })} />
                    <ControlledField label="Telefone" value={detail.data.recipient_phone ?? detail.client?.phone ?? ""} onChange={(value) => updateData({ recipient_phone: value })} />
                    <ControlledField label="E-mail" type="email" value={detail.data.recipient_email ?? detail.client?.email ?? ""} onChange={(value) => updateData({ recipient_email: value })} />
                    <ControlledField label="Data do evento" type="date" value={(detail.data.event_date_snapshot ?? detail.event?.event_date ?? "").slice(0, 10)} onChange={(value) => updateData({ event_date_snapshot: value || null })} />
                    <ControlledField label="Nome / tipo do evento" value={detail.data.event_title_snapshot ?? detail.event?.title ?? ""} onChange={(value) => updateData({ event_title_snapshot: value })} />
                    <ControlledField label="Local da cerimônia" value={detail.data.ceremony_venue_snapshot ?? detail.event?.ceremony_venue ?? ""} onChange={(value) => updateData({ ceremony_venue_snapshot: value })} />
                    <div className="sm:col-span-2 xl:col-span-1 2xl:col-span-2"><ControlledField label="Local da recepção" value={detail.data.reception_venue_snapshot ?? detail.event?.reception_venue ?? ""} onChange={(value) => updateData({ reception_venue_snapshot: value })} /></div>
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground">Estes dados ficam congelados na proposta e podem existir mesmo sem cliente ou evento previamente cadastrados.</p>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="font-display text-xl font-semibold">Dados comerciais</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <ControlledField label="Título" value={detail.data.title} onChange={(value) => updateData({ title: value })} />
                    <label className="block"><span className="text-xs font-semibold text-muted-foreground">Status</span><div className="mt-1 flex h-10 items-center rounded-md border border-input bg-muted/35 px-3 text-sm">Emitida</div></label>
                    <ControlledField label="Convidados" type="number" value={String(detail.data.guest_count ?? "")} onChange={(value) => updateData({ guest_count: value ? Number(value) : null })} />
                    <ControlledField label="Validade" type="date" value={detail.data.valid_until?.slice(0, 10) || ""} onChange={(value) => updateData({ valid_until: value || null })} />
                    <label className="block"><span className="text-xs font-semibold text-muted-foreground">Forma de definir o investimento</span><select value={detail.data.pricing_mode || "manual"} onChange={(e) => updateData({ pricing_mode: e.target.value as "automatic" | "manual" })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="manual">Valor final definido pela Priscila</option><option value="automatic">Somar pacote + itens + serviços</option></select></label>
                    {detail.data.pricing_mode === "manual" ? (
                      <ControlledField label="Valor final da proposta" type="number" value={detail.data.manual_total == null ? String(detail.data.total ?? "") : String(detail.data.manual_total)} onChange={(value) => updateData({ manual_total: value === "" ? null : Number(value) })} />
                    ) : (
                      <>
                        <ControlledField label="Valor base do pacote" type="number" value={detail.data.package_price_snapshot ? String(detail.data.package_price_snapshot) : ""} onChange={(value) => updateData({ package_price_snapshot: Number(value || 0) })} />
                        <label className="block"><span className="text-xs font-semibold text-muted-foreground">Tipo de desconto</span><select value={detail.data.discount_type} onChange={(e) => updateData({ discount_type: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="none">Sem desconto</option><option value="amount">Valor em R$</option><option value="percent">Percentual</option></select></label>
                        <ControlledField label="Desconto" type="number" value={String(detail.data.discount_value ?? 0)} onChange={(value) => updateData({ discount_value: Number(value || 0) })} />
                      </>
                    )}
                  </div>
                  <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/25 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">Visibilidade no PDF</p>
                    <label className="flex items-center justify-between gap-3 text-xs"><span>Mostrar preços dos itens / locações</span><input type="checkbox" checked={Boolean(detail.data.show_item_prices)} onChange={(e) => updateData({ show_item_prices: e.target.checked })} /></label>
                    <label className="flex items-center justify-between gap-3 text-xs"><span>Mostrar preços dos serviços</span><input type="checkbox" checked={Boolean(detail.data.show_service_prices)} onChange={(e) => updateData({ show_service_prices: e.target.checked })} /></label>
                  </div>
                  <div className="mt-4 rounded-lg bg-sand p-4">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Soma interna dos detalhes</span><strong className="text-foreground">{formatCurrency(detail.data.subtotal)}</strong></div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Desconto</span><strong className="text-danger">{formatCurrency(detail.data.discount_amount)}</strong></div>
                    <div className="mt-3 flex items-end justify-between border-t border-brand/15 pt-3"><span className="text-xs font-semibold uppercase tracking-wide text-brand">Total</span><strong className="font-display text-3xl">{formatCurrency(detail.data.total)}</strong></div>
                    <p className="mt-2 text-[10px] text-muted-foreground">{detail.data.pricing_mode === "manual" ? "Os valores internos podem ficar em branco. O cliente recebe somente o investimento final, salvo se você habilitar a exibição dos preços acima." : "O total é recalculado automaticamente ao salvar."}</p>
                  </div>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="font-display text-xl font-semibold">Formas de pagamento</h3>
                  <p className="mt-1 text-xs text-muted-foreground">As opções abaixo aparecem no PDF e podem ser ajustadas em cada proposta.</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {["Pix", "Transferência", "Cartão"].map((method) => {
                      const pay = (detail.data.payment_terms ?? {}) as Record<string, any>;
                      const methods = Array.isArray(pay.methods) ? pay.methods : ["Pix", "Transferência", "Cartão"];
                      return <label key={method} className="flex items-center gap-2"><input type="checkbox" checked={methods.includes(method)} onChange={(e) => { const next = e.target.checked ? Array.from(new Set([...methods, method])) : methods.filter((item: string) => item !== method); updateData({ payment_terms: { ...pay, methods: next } }); }} />{method}</label>;
                    })}
                  </div>
                  {(() => { const pay = (detail.data.payment_terms ?? {}) as Record<string, any>; const methods = Array.isArray(pay.methods) ? pay.methods : ["Pix", "Transferência", "Cartão"]; return methods.includes("Cartão") ? <div className="mt-3"><ControlledField label="Parcelas no cartão" type="number" value={String(pay.installments_card ?? 12)} onChange={(value) => updateData({ payment_terms: { ...pay, installments_card: value ? Number(value) : null } })} /></div> : null; })()}
                  <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Condição / observação de pagamento</span><textarea value={String(((detail.data.payment_terms ?? {}) as Record<string, any>).notes ?? "")} onChange={(e) => { const pay = (detail.data.payment_terms ?? {}) as Record<string, any>; updateData({ payment_terms: { ...pay, notes: e.target.value } }); }} className="mt-1 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="font-display text-xl font-semibold">Seções do PDF</h3>
                  <div className="mt-3 space-y-2">
                    {detail.sections.map((section, index) => (
                      <label key={section.id} className="flex items-center gap-3 rounded-md bg-muted/35 px-3 py-2 text-sm">
                        <input type="checkbox" checked={section.show_in_pdf} onChange={(e) => setSection(index, { show_in_pdf: e.target.checked })} />
                        <span>{section.title}</span>
                      </label>
                    ))}
                    {!detail.sections.length && <p className="text-xs text-muted-foreground">Nenhuma seção configurada.</p>}
                  </div>
                </section>
              </aside>

              <div className="space-y-4">
                <section className="rounded-lg border border-border p-4">
                  <div className="flex items-end justify-between"><div><h3 className="font-display text-xl font-semibold">Itens / acervo</h3><p className="text-xs text-muted-foreground">Marque o que aparece no PDF e ajuste quantidade/valor desta proposta.</p></div></div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-xs">
                      <thead className="text-muted-foreground"><tr><th className="pb-2 font-medium">PDF</th><th className="pb-2 font-medium">Item</th><th className="pb-2 font-medium">Qtd.</th><th className="pb-2 font-medium">Valor interno</th><th className="pb-2 font-medium">Subtotal interno</th><th className="pb-2 font-medium">Reserva</th></tr></thead>
                      <tbody>
                        {detail.items.map((item, index) => {
                          const subtotal = item.billing_mode === "included" ? 0 : item.billing_mode === "fixed" ? Number(item.unit_price) : Number(item.quantity) * Number(item.unit_price);
                          return <tr key={item.id} className="border-t border-border"><td className="py-2"><input type="checkbox" checked={item.show_in_pdf} onChange={(e) => setItem(index, { show_in_pdf: e.target.checked })} /></td><td className="py-2 pr-3"><strong>{item.name_snapshot}</strong>{item.billing_mode === "included" && <span className="ml-2 rounded-full bg-sage px-2 py-0.5 text-[9px] text-success">Incluso</span>}</td><td className="py-2 pr-2"><input type="number" min="0" step="1" value={String(item.quantity)} onChange={(e) => setItem(index, { quantity: Number(e.target.value || 0) })} className="h-8 w-20 rounded border border-input bg-background px-2" /></td><td className="py-2 pr-2"><input type="number" min="0" step="0.01" value={Number(item.unit_price) ? String(item.unit_price) : ""} placeholder="Opcional" onChange={(e) => setItem(index, { unit_price: Number(e.target.value || 0) })} className="h-8 w-24 rounded border border-input bg-background px-2" disabled={item.billing_mode === "included"} /></td><td className="py-2 font-semibold">{formatCurrency(subtotal)}</td><td className="py-2"><input type="checkbox" checked={item.reserve_stock} onChange={(e) => setItem(index, { reserve_stock: e.target.checked })} /></td></tr>;
                        })}
                      </tbody>
                    </table>
                    {!detail.items.length && <p className="py-6 text-center text-xs text-muted-foreground">Nenhum item adicionado à proposta.</p>}
                  </div>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="font-display text-xl font-semibold">Serviços</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-xs">
                      <thead className="text-muted-foreground"><tr><th className="pb-2 font-medium">PDF</th><th className="pb-2 font-medium">Serviço</th><th className="pb-2 font-medium">Qtd.</th><th className="pb-2 font-medium">Valor interno</th><th className="pb-2 font-medium">Subtotal interno</th></tr></thead>
                      <tbody>
                        {detail.services.map((service, index) => {
                          const subtotal = service.billing_mode === "included" ? 0 : service.billing_mode === "fixed" ? Number(service.unit_price) : Number(service.quantity) * Number(service.unit_price);
                          return <tr key={service.id} className="border-t border-border"><td className="py-2"><input type="checkbox" checked={service.show_in_pdf} onChange={(e) => setService(index, { show_in_pdf: e.target.checked })} /></td><td className="py-2 pr-3"><strong>{service.name_snapshot}</strong>{service.billing_mode === "included" && <span className="ml-2 rounded-full bg-sage px-2 py-0.5 text-[9px] text-success">Incluso</span>}</td><td className="py-2 pr-2"><input type="number" min="0" step="1" value={String(service.quantity)} onChange={(e) => setService(index, { quantity: Number(e.target.value || 0) })} className="h-8 w-20 rounded border border-input bg-background px-2" /></td><td className="py-2 pr-2"><input type="number" min="0" step="0.01" value={Number(service.unit_price) ? String(service.unit_price) : ""} placeholder="Opcional" onChange={(e) => setService(index, { unit_price: Number(e.target.value || 0) })} className="h-8 w-24 rounded border border-input bg-background px-2" disabled={service.billing_mode === "included"} /></td><td className="py-2 font-semibold">{formatCurrency(subtotal)}</td></tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}
          {error && <div className="mt-4 rounded-lg bg-blush px-4 py-3 text-xs text-danger">{error}</div>}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" className="mr-auto h-10 px-4 text-danger" disabled={saving} onClick={() => onDelete(proposalId)}><Trash2 className="h-4 w-4" />Excluir proposta</Button>
          <Button variant="outline" className="h-10 px-4" onClick={onClose}>Fechar</Button>
          <Button variant="outline" className="h-10 px-4" disabled={!detail || saving} onClick={() => void reserveStock()}>Salvar + reservar estoque</Button>
          <Button variant="outline" className="h-10 px-4" disabled={!detail || saving} onClick={async () => { if (await saveProposal(false)) onPreview(proposalId); }}>Prévia</Button>
          <Button variant="outline" className="h-10 px-4" disabled={!detail || saving} onClick={async () => { if (await saveProposal(false)) onPdf(proposalId); }}>PDF</Button>
          <Button variant="primary" className="h-10 px-5" disabled={!detail || saving} onClick={() => void saveProposal(true)}>{saving ? "Salvando..." : "Salvar proposta"}</Button>
        </div>
      </div>
    </div>
  );
}

function stockConflictMessage(error: unknown) {
  if (error instanceof AtelierApiError) {
    const payload = error.payload as { conflicts?: Array<{ requested?: number; available?: number; missing?: number }> } | undefined;
    if (error.code === "STOCK_CONFLICT" && payload?.conflicts?.length) {
      const first = payload.conflicts[0];
      return `Estoque insuficiente: solicitado ${first.requested ?? "—"}, disponível ${first.available ?? 0}${first.missing ? `, faltam ${first.missing}` : ""}.`;
    }
  }
  return apiErrorMessage(error);
}

function apiErrorMessage(error: unknown) {
  if (error instanceof AtelierApiError) {
    return error.code ? `${error.message} (${error.code})` : error.message;
  }
  if (error instanceof Error) return error.message;
  return "Erro inesperado ao carregar os dados.";
}

function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<Page>("Início");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [reservationEvent, setReservationEvent] = useState<EventRecord | null>(null);
  const [eventDetailId, setEventDetailId] = useState<string | null>(null);
  const [proposalEditorId, setProposalEditorId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ html: string; title: string } | null>(null);
  const [backend, setBackend] = useState<BackendState>(EMPTY_BACKEND);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<string[]>([]);

  const announce = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const date = todayIso();
    const results = await Promise.allSettled([
      atelierApi.health(),
      atelierApi.dashboard(),
      atelierApi.clients.list(),
      atelierApi.events.list(),
      atelierApi.inventory.list(),
      atelierApi.inventory.availability(date, date),
      atelierApi.proposals.list(),
      atelierApi.packages.list(),
      atelierApi.services.list(),
      atelierApi.settings.get(),
    ]);

    const nextIssues: string[] = [];
    const fail = (index: number, label: string) => {
      const result = results[index];
      if (result.status === "rejected") nextIssues.push(`${label}: ${apiErrorMessage(result.reason)}`);
    };
    [
      "Conexão",
      "Resumo",
      "Clientes",
      "Eventos",
      "Estoque",
      "Disponibilidade",
      "Propostas",
      "Pacotes",
      "Serviços",
      "Preferências",
    ].forEach((label, index) => fail(index, label));

    setBackend((previous) => ({
      dashboard: results[1].status === "fulfilled" ? results[1].value : previous.dashboard,
      clients: results[2].status === "fulfilled" ? results[2].value.data : previous.clients,
      events: results[3].status === "fulfilled" ? results[3].value.data : previous.events,
      inventory: results[4].status === "fulfilled" ? results[4].value.data : previous.inventory,
      availability: results[5].status === "fulfilled" ? results[5].value.data : previous.availability,
      proposals: results[6].status === "fulfilled" ? results[6].value.data : previous.proposals,
      packages: results[7].status === "fulfilled" ? results[7].value.data : previous.packages,
      services: results[8].status === "fulfilled" ? results[8].value.data : previous.services,
      settings: results[9].status === "fulfilled" ? results[9].value.data : previous.settings,
      healthy: results[0].status === "fulfilled" && results[0].value.ok === true,
    }));
    setIssues(nextIssues);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const navigate = (page: Page) => {
    setActive(page);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (kind: ModalKind) => setModal({ kind });

  const previewProposal = async (id: string) => {
    try {
      const result = await atelierApi.proposals.preview(id);
      setPreview({ html: result.html, title: `Proposta #${result.proposal_number} · ${result.title}` });
    } catch (error) {
      announce(apiErrorMessage(error));
    }
  };

  const openPdf = (id: string) => {
    window.open(atelierApi.proposals.pdfUrl(id), "_blank", "noopener,noreferrer");
  };

  const deleteProposal = async (id: string) => {
    if (!window.confirm("Excluir esta proposta? Esta ação não pode ser desfeita.")) return;
    try {
      await atelierApi.proposals.delete(id);
      if (proposalEditorId === id) setProposalEditorId(null);
      await refresh();
      announce("Proposta excluída");
    } catch (error) {
      announce(apiErrorMessage(error));
    }
  };

  const alertCount = backend.dashboard?.alerts?.length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={active} onSelect={navigate} />
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:px-7">
          <Button variant="icon" className="h-10 w-10 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>
          <label className="relative min-w-0 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">Buscar</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              placeholder={active === "Início" ? "Buscar eventos, clientes ou itens..." : `Buscar em ${active.toLocaleLowerCase("pt-BR")}...`}
            />
          </label>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Button variant="icon" className="h-10 w-10" aria-label="Atualizar dados" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /></Button>
            <Button variant="primary" className="h-10 px-3 sm:px-5" onClick={() => openModal("event")}><Plus className="h-4 w-4" /><span className="hidden sm:inline">Novo evento</span></Button>
            <Button variant="icon" className="relative h-10 w-10" aria-label="Notificações" onClick={() => announce(alertCount ? `Você tem ${alertCount} alerta(s)` : "Sem alertas pendentes")}><Bell className="h-5 w-5" />{alertCount > 0 && <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-danger" />}</Button>
            <Button className="mobile-profile h-11 px-2" onClick={() => announce(backend.healthy ? "Sistema conectado" : "Verifique a conexão do sistema")}><span className="grid h-8 w-8 place-items-center rounded-full bg-avatar font-display text-sm font-semibold text-primary">PG</span><span>Olá, Priscila Gefune</span><ChevronDown className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 pb-9 pt-5 sm:px-6 lg:px-7">
          {issues.length > 0 && (
            <div className="mb-4 rounded-lg border border-danger/20 bg-blush px-4 py-3 text-xs text-danger">
              <strong>Não foi possível carregar alguns dados:</strong> {issues.join(" · ")}
            </div>
          )}
          {loading && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-soft">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />Atualizando dados...
            </div>
          )}

          {active !== "Início" && (
            <Button className="mb-4 h-8 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-brand" onClick={() => navigate("Início")}><ArrowLeft className="h-4 w-4" />Voltar ao início</Button>
          )}

          {active === "Início" && (
            <HomePage
              query={query}
              navigate={navigate}
              openModal={openModal}
              announce={announce}
              dashboard={backend.dashboard}
              onPreview={previewProposal}
              onPdf={openPdf}
            />
          )}
          {active === "Eventos" && <EventsPage query={query} events={backend.events} openModal={openModal} announce={announce} onReserve={setReservationEvent} onDetail={setEventDetailId} />}
          {active === "Estoque" && (
            <InventoryPage
              query={query}
              inventory={backend.inventory}
              availability={backend.availability}
              openModal={openModal}
              onEdit={(item) => setModal({ kind: "inventory", inventoryItem: item })}
            />
          )}
          {active === "Propostas" && (
            <ProposalsPage query={query} proposals={backend.proposals} openModal={openModal} onPreview={previewProposal} onPdf={openPdf} onEdit={setProposalEditorId} onDelete={(id) => void deleteProposal(id)} />
          )}
          {active === "Clientes" && <ClientsPage query={query} clients={backend.clients} events={backend.events} openModal={openModal} announce={announce} />}
        </main>
      </div>

      {modal?.kind === "proposal" && (
        <ProposalCreateModal
          clients={backend.clients}
          events={backend.events}
          packages={backend.packages}
          inventory={backend.inventory}
          services={backend.services}
          settings={backend.settings}
          onClose={() => setModal(null)}
          onSaved={refresh}
          onCreated={setProposalEditorId}
          announce={announce}
        />
      )}
      {modal && modal.kind !== "proposal" && (
        <EntityModal
          state={modal}
          clients={backend.clients}
          events={backend.events}
          packages={backend.packages}
          onClose={() => setModal(null)}
          onSaved={refresh}
          announce={announce}
        />
      )}
      {eventDetailId && (
        <EventDetailModal
          eventId={eventDetailId}
          clients={backend.clients}
          onClose={() => setEventDetailId(null)}
          onSaved={refresh}
          announce={announce}
        />
      )}
      {reservationEvent && (
        <ReservationModal
          event={reservationEvent}
          inventory={backend.inventory}
          onClose={() => setReservationEvent(null)}
          onSaved={refresh}
          announce={announce}
        />
      )}
      {proposalEditorId && (
        <ProposalEditor
          proposalId={proposalEditorId}
          onClose={() => setProposalEditorId(null)}
          onSaved={refresh}
          announce={announce}
          onPreview={previewProposal}
          onPdf={openPdf}
          onDelete={(id) => void deleteProposal(id)}
        />
      )}
      {preview && <ProposalPreview html={preview.html} title={preview.title} onClose={() => setPreview(null)} />}
      {notice && (
        <div role="status" className="fixed bottom-5 right-5 z-[80] flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-md border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-elevated"><Sparkles className="h-4 w-4 shrink-0 text-brand" />{notice}</div>
      )}
    </div>
  );
}
