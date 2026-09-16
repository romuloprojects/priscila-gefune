import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Bell,
  Box,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Home,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MoreHorizontal,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import floralImage from "../assets/eventos-floral.jpg";
import atelierLogo from "../assets/atelier-priscila-gefune-logo.jpeg";
import {
  mockAlerts,
  mockClients,
  mockEvents,
  mockInventory,
  mockProposals,
  type EventStatus,
  type ProposalStatus,
} from "../data/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier Priscila Gefune | Gestão de Eventos" },
      { name: "description", content: "Organização de eventos, estoque, propostas e clientes do Atelier Priscila Gefune." },
      { property: "og:title", content: "Atelier Priscila Gefune | Gestão de Eventos" },
      { property: "og:description", content: "Um painel elegante e simples para organizar cada detalhe dos eventos." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

type Page = "Início" | "Eventos" | "Estoque" | "Propostas" | "Clientes" | "Configurações";
type ModalKind = "event" | "inventory" | "proposal" | "client" | null;
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "quiet" | "icon" | "outline";
};

function Button({ children, className = "", variant = "quiet", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-button hover:bg-primary/90",
    quiet: "text-foreground hover:bg-muted",
    icon: "text-muted-foreground hover:bg-muted hover:text-brand",
    outline: "border border-input bg-card text-foreground hover:border-brand/55 hover:bg-muted",
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
  { label: "Estoque", icon: Box },
  { label: "Propostas", icon: FileText },
  { label: "Clientes", icon: Users },
  { label: "Configurações", icon: Settings },
];

const metrics = [
  { label: "Eventos em andamento", value: "4", icon: CalendarDays, trend: "+2 este mês", trendTone: "success" },
  { label: "Clientes ativos", value: "24", icon: Users, trend: "+5 este mês", trendTone: "success" },
  { label: "Propostas enviadas", value: "12", icon: FileText, trend: "+3 este mês", trendTone: "success" },
  { label: "Itens no estoque", value: "1.240", icon: Box, trend: "38 indisponíveis", trendTone: "danger" },
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "max-w-[210px]" : "w-full"}>
      <img
        src={atelierLogo}
        width={1005}
        height={591}
        alt="Atelier Priscila Gefune"
        className="brand-logo-image"
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
      {open && <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-overlay lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r border-sidebar-border bg-sidebar px-5 py-5 shadow-elevated transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="art-deco-frame w-full overflow-hidden bg-[#11110f] p-1.5">
            <Brand />
          </div>
          <Button variant="icon" className="h-10 w-10 shrink-0 lg:hidden" onClick={onClose} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav aria-label="Navegação principal" className="mt-8 space-y-2">
          {navigation.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              className={`h-12 w-full justify-start border px-4 text-sm ${
                active === label
                  ? "border-brand/55 bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "border-transparent text-sidebar-foreground hover:border-brand/20 hover:bg-sidebar-accent/45"
              }`}
              onClick={() => {
                onSelect(label);
                onClose();
              }}
            >
              <Icon className={`h-5 w-5 stroke-[1.55] ${active === label ? "text-brand" : "text-brand/85"}`} />
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
          <div className="mx-auto max-w-[190px] text-center">
            <p className="text-[10px] font-semibold uppercase leading-6 tracking-[0.34em] text-brand">
              Eventos<br />que encantam
            </p>
            <div className="mx-auto mt-4 h-px w-12 bg-brand/70" />
          </div>
        </div>
      </aside>
    </>
  );
}

function PanelTitle({
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
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 px-5 py-4">
      <h2 className="flex min-w-0 items-center gap-3 font-display text-xl font-semibold text-brand sm:text-2xl">
        <Icon className="h-5 w-5 shrink-0 stroke-[1.55]" />
        <span className="truncate">{children}</span>
      </h2>
      {action && (
        <Button className="h-8 px-1 text-xs text-brand hover:bg-transparent hover:text-brand/75" onClick={onAction}>
          {action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: EventStatus | ProposalStatus }) {
  const cls =
    status === "Confirmado" || status === "Aprovada" || status === "Concluído"
      ? "bg-sage text-success"
      : status === "Em preparação" || status === "Pendente"
        ? "bg-blush text-[#f0b6a8]"
        : "bg-sand text-brand";

  return <span className={`inline-flex w-fit items-center rounded-md px-3 py-1.5 text-xs font-medium ${cls}`}>{status}</span>;
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
    <div className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-semibold leading-none text-brand sm:text-5xl">{title}</h1>
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
    <div className="premium-panel rounded-lg border-dashed px-6 py-10 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-brand" />
      <h3 className="mt-3 font-display text-2xl text-brand">{title}</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function HomePage({
  query,
  navigate,
  openModal,
  announce,
}: {
  query: string;
  navigate: (page: Page) => void;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  announce: (message: string) => void;
}) {
  const shownEvents = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    if (!q) return mockEvents.slice(0, 3);
    return mockEvents
      .filter((event) => `${event.title} ${event.place} ${event.client}`.toLocaleLowerCase("pt-BR").includes(q))
      .slice(0, 3);
  }, [query]);

  const quickInventory = [mockInventory[1], mockInventory[3], mockInventory[5], mockInventory[0]];

  return (
    <>
      <section className="deco-corner relative min-h-[112px] overflow-hidden border-b border-border/55 pb-5 pt-2">
        <img
          src={floralImage}
          width={1920}
          height={1024}
          alt="Arranjo floral elegante"
          className="hero-photo absolute inset-y-0 right-0 h-full w-[58%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-hero-wash" />
        <div className="relative z-10 grid items-center gap-4 lg:grid-cols-[1fr_.7fr]">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-none text-brand sm:text-5xl">Bem-vinda, Priscila!</h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Aqui estão os principais dados do seu negócio hoje.</p>
          </div>
          <div className="hidden justify-self-center text-center xl:block">
            <p className="font-display text-2xl italic leading-tight text-brand/90">Sonhos em<br />cada detalhe</p>
            <div className="mx-auto mt-3 h-px w-16 bg-brand/70" />
          </div>
        </div>
      </section>

      <section aria-label="Resumo" className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, trend, trendTone }) => (
          <article key={label} className="metric-card-light flex min-w-0 items-center gap-3 rounded-xl p-3.5 sm:gap-4 sm:p-4">
            <div className="metric-icon-light">
              <Icon className="h-6 w-6 stroke-[1.55] sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-3xl font-semibold leading-none sm:text-4xl">{value}</p>
              <p className="mt-1 text-xs font-medium sm:text-sm">{label}</p>
              <p className={`mt-1 text-[11px] ${trendTone === "success" ? "light-card-success" : "light-card-danger"}`}>
                {trendTone === "success" ? "↑" : "↓"} {trend}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.02fr_.88fr_.72fr]">
        <article className="premium-panel overflow-hidden rounded-xl">
          <PanelTitle icon={CalendarDays} action="Ver todos" onAction={() => navigate("Eventos")}>Próximos eventos</PanelTitle>
          <div className="px-4 py-1">
            {shownEvents.length ? (
              shownEvents.map((event, index) => (
                <button
                  key={event.id}
                  className="grid w-full grid-cols-[62px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/55 py-3 text-left last:border-0 hover:bg-muted/35"
                  onClick={() => announce(`Abrindo ${event.title}`)}
                >
                  <div className="rounded-md border border-brand/25 bg-sand/45 px-2 py-2 text-center">
                    <div className="font-display text-2xl leading-none text-foreground">{event.day}</div>
                    <div className="mt-1 text-[10px] font-semibold text-muted-foreground">{event.month}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                      {event.place}
                    </p>
                  </div>
                  <span className={`hidden rounded-md px-3 py-1.5 text-[11px] font-medium sm:inline-flex ${index === 0 ? "bg-blush text-[#f0b6a8]" : index === 1 ? "bg-sage text-success" : "bg-muted text-muted-foreground"}`}>
                    {index === 0 ? "Em 5 dias" : index === 1 ? "Em 12 dias" : "Em 18 dias"}
                  </span>
                </button>
              ))
            ) : (
              <div className="py-5"><EmptyOrNotice title="Nenhum evento encontrado" text="Tente buscar por outro nome, cliente ou local." /></div>
            )}
          </div>
        </article>

        <article className="premium-panel overflow-hidden rounded-xl">
          <PanelTitle icon={Box} action="Ver estoque" onAction={() => navigate("Estoque")}>Estoque rápido</PanelTitle>
          <div className="px-4 py-1">
            {quickInventory.map((item) => {
              const low = item.available <= 150;
              return (
                <button key={item.id} className="grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/55 py-2.5 text-left last:border-0 hover:bg-muted/35" onClick={() => announce(`Disponibilidade de ${item.item}`)}>
                  <div className="grid h-11 w-11 place-items-center rounded-md border border-brand/20 bg-[#ece4d6] text-[#725a33]">
                    <InventoryIcon kind={item.icon} className="h-6 w-6 stroke-[1.45]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.item}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{item.available} unidades disponíveis</p>
                  </div>
                  <span className={`hidden rounded-md px-2.5 py-1 text-[10px] font-medium sm:inline-flex ${low ? "bg-blush text-[#f1b3a4]" : "bg-sage text-success"}`}>
                    {low ? "Estoque baixo" : "Em bom nível"}
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="premium-panel overflow-hidden rounded-xl">
          <PanelTitle icon={WandSparkles}>Ações rápidas</PanelTitle>
          <div className="grid gap-2 p-4">
            {[
              ["Novo evento", CalendarDays, () => openModal("event")],
              ["Nova proposta", FileText, () => openModal("proposal")],
              ["Novo cliente", Users, () => openModal("client")],
              ["Adicionar item ao estoque", Box, () => openModal("inventory")],
            ].map(([label, Icon, onClick]) => {
              const ActionIcon = Icon as LucideIcon;
              return (
                <Button key={label as string} variant="outline" className="h-12 w-full justify-between border-brand/35 px-4 text-sm" onClick={onClick as () => void}>
                  <span className="flex min-w-0 items-center gap-3"><ActionIcon className="h-5 w-5 shrink-0 text-brand" /><span className="truncate">{label as string}</span></span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
                </Button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <article className="premium-panel overflow-hidden rounded-xl">
          <PanelTitle icon={FileText} action="Ver todas" onAction={() => navigate("Propostas")}>Propostas recentes</PanelTitle>
          <div className="divide-y divide-border/55 px-4">
            {mockProposals.slice(0, 4).map((proposal) => (
              <button key={proposal.id} className="grid w-full gap-2 py-2.5 text-left sm:grid-cols-[24px_minmax(0,1fr)_140px_104px] sm:items-center" onClick={() => announce(`Proposta ${proposal.code}`)}>
                <FileText className="hidden h-4 w-4 text-brand sm:block" />
                <div className="min-w-0"><p className="truncate text-sm font-medium">{proposal.event} · {proposal.client}</p><p className="text-[11px] text-muted-foreground">Atualizada {proposal.updatedAt}</p></div>
                <p className="text-xs text-muted-foreground">{proposal.price}</p>
                <StatusBadge status={proposal.status} />
              </button>
            ))}
          </div>
        </article>

        <article className="premium-panel overflow-hidden rounded-xl">
          <PanelTitle icon={Bell} action="Ver todos" onAction={() => announce("Todos os alertas")}>Alertas importantes</PanelTitle>
          <div className="divide-y divide-border/55 px-4">
            {mockAlerts.map((alert) => {
              const Icon = alert.kind === "danger" ? AlertCircle : alert.kind === "warning" ? CalendarDays : FileText;
              const tone = alert.kind === "danger" ? "bg-blush text-[#ef9f8e]" : alert.kind === "warning" ? "bg-sand text-brand" : "bg-sage text-success";
              return (
                <button key={alert.id} className="grid w-full grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 py-3 text-left hover:bg-muted/25" onClick={() => announce(alert.title)}>
                  <div className={`grid h-9 w-9 place-items-center rounded-full ${tone}`}><Icon className="h-4.5 w-4.5" /></div>
                  <div className="min-w-0"><p className="text-sm font-semibold">{alert.title}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{alert.detail}</p></div>
                  <ArrowRight className="h-4 w-4 text-brand/75" />
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <footer className="mt-5 flex flex-col gap-2 border-t border-brand/25 pt-3 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p><span className="font-semibold text-brand">Atelier Priscila Gefune</span><span className="mx-2 text-brand/35">|</span>Transformando momentos em memórias inesquecíveis.</p>
        <p className="font-display text-sm italic text-brand/70">Planejar · Decorar · Encantar</p>
      </footer>
    </>
  );
}

function EventsPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const [status, setStatus] = useState("Todos");
  const list = useMemo(
    () =>
      mockEvents.filter((event) => {
        const q = query.trim().toLocaleLowerCase("pt-BR");
        const matchesSearch = !q || `${event.title} ${event.client} ${event.place}`.toLocaleLowerCase("pt-BR").includes(q);
        return matchesSearch && (status === "Todos" || event.status === status);
      }),
    [query, status],
  );

  return (
    <>
      <PageHeader eyebrow="Agenda" title="Eventos" description="Acompanhe os próximos eventos e encontre rapidamente o que precisa preparar." action="Novo evento" onAction={() => openModal("event")} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["Todos", "Confirmado", "Em preparação", "Proposta enviada", "Concluído"].map((item) => (
          <Button key={item} variant={status === item ? "primary" : "outline"} className="h-9 px-3 text-xs" onClick={() => setStatus(item)}>{item}</Button>
        ))}
      </div>
      <div className="grid gap-3">
        {list.map((event) => (
          <article key={event.id} className="premium-panel grid gap-4 rounded-xl p-4 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center">
            <div className="rounded-lg border border-brand/25 bg-sand/45 py-3 text-center"><div className="font-display text-3xl leading-none text-brand">{event.day}</div><div className="mt-1 text-xs font-semibold text-muted-foreground">{event.month}</div></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl font-semibold text-brand">{event.title}</h2><StatusBadge status={event.status} /></div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-brand" />{event.client}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand" />{event.place}</span><span>{event.guests} convidados</span><span>{event.items} itens</span></div>
              <p className="mt-2 text-xs text-muted-foreground">Retirada {event.pickup} · Devolução {event.returnDate}</p>
            </div>
            <Button variant="outline" className="h-10 px-4 text-xs" onClick={() => announce(`Detalhes de ${event.title}`)}>Ver evento<ArrowRight className="h-4 w-4" /></Button>
          </article>
        ))}
        {!list.length && <EmptyOrNotice title="Nenhum evento encontrado" text="Tente remover algum filtro ou buscar por outro cliente, local ou evento." />}
      </div>
    </>
  );
}

function InventoryPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...Array.from(new Set(mockInventory.map((item) => item.category)))];
  const list = useMemo(
    () =>
      mockInventory.filter((item) => {
        const q = query.trim().toLocaleLowerCase("pt-BR");
        return (!q || `${item.item} ${item.category}`.toLocaleLowerCase("pt-BR").includes(q)) && (category === "Todos" || item.category === category);
      }),
    [query, category],
  );

  return (
    <>
      <PageHeader eyebrow="Materiais" title="Estoque" description="Veja o que está disponível, reservado ou em manutenção sem complicação." action="Adicionar item" onAction={() => openModal("inventory")} />
      <div className="compact-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => <Button key={item} variant={category === item ? "primary" : "outline"} className="h-9 shrink-0 px-3 text-xs" onClick={() => setCategory(item)}>{item}</Button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => (
          <article key={item.id} className="premium-panel rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-lg border border-brand/25 bg-sand/50 text-brand"><InventoryIcon kind={item.icon} className="h-6 w-6 stroke-[1.5]" /></div><div><h2 className="font-display text-xl font-semibold text-brand">{item.item}</h2><p className="text-xs text-muted-foreground">{item.category}</p></div></div>
              <Button variant="icon" className="h-9 w-9" aria-label={`Opções de ${item.item}`} onClick={() => announce(`Opções de ${item.item}`)}><MoreHorizontal className="h-5 w-5" /></Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg bg-muted px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p><p className="mt-1 font-display text-2xl">{item.total}</p></div><div className="rounded-lg bg-blush px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-[#e6aa9b]">Reservado</p><p className="mt-1 font-display text-2xl text-[#e6aa9b]">{item.reserved}</p></div><div className="rounded-lg bg-sage px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-success">Disponível</p><p className="mt-1 font-display text-2xl text-success">{item.available}</p></div></div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs"><span className="text-muted-foreground">Retorno mais próximo</span><strong className="text-brand">{item.nextReturn}</strong></div>
            {item.maintenance > 0 && <div className="mt-2 flex items-center gap-2 rounded-md bg-sand/65 px-3 py-2 text-xs text-brand"><AlertTriangle className="h-4 w-4" />{item.maintenance} em manutenção</div>}
            <Button variant="outline" className="mt-3 h-9 w-full text-xs" onClick={() => announce(`Disponibilidade de ${item.item}`)}>Ver disponibilidade</Button>
          </article>
        ))}
        {!list.length && <div className="sm:col-span-2 xl:col-span-3"><EmptyOrNotice title="Nada por aqui" text="Nenhum item corresponde aos filtros atuais." /></div>}
      </div>
    </>
  );
}

function ProposalsPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const [status, setStatus] = useState("Todas");
  const list = useMemo(
    () =>
      mockProposals.filter((proposal) => {
        const q = query.trim().toLocaleLowerCase("pt-BR");
        return (!q || `${proposal.client} ${proposal.event} ${proposal.code}`.toLocaleLowerCase("pt-BR").includes(q)) && (status === "Todas" || proposal.status === status);
      }),
    [query, status],
  );

  return (
    <>
      <PageHeader eyebrow="Comercial" title="Propostas" description="Organize orçamentos, acompanhe respostas e gere uma prévia do PDF." action="Nova proposta" onAction={() => openModal("proposal")} />
      <div className="mb-4 flex gap-2">{["Todas", "Pendente", "Aprovada", "Rascunho"].map((item) => <Button key={item} variant={status === item ? "primary" : "outline"} className="h-9 px-3 text-xs" onClick={() => setStatus(item)}>{item}</Button>)}</div>
      <div className="premium-panel overflow-hidden rounded-xl">
        <div className="hidden grid-cols-[90px_minmax(0,1fr)_170px_130px_120px_auto] gap-4 border-b border-border/60 bg-muted/45 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid"><span>Proposta</span><span>Cliente / evento</span><span>Data</span><span>Valor</span><span>Status</span><span /></div>
        {list.map((proposal) => <div key={proposal.id} className="grid gap-3 border-b border-border/55 px-5 py-4 last:border-0 lg:grid-cols-[90px_minmax(0,1fr)_170px_130px_120px_auto] lg:items-center"><strong className="text-sm text-brand">{proposal.code}</strong><div><p className="text-sm font-semibold">{proposal.client}</p><p className="text-xs text-muted-foreground">{proposal.event}</p></div><p className="text-xs"><CalendarDays className="mr-1 inline h-3.5 w-3.5 text-brand" />{proposal.eventDate}</p><strong className="text-sm">{proposal.price}</strong><StatusBadge status={proposal.status} /><div className="flex gap-2"><Button variant="outline" className="h-9 px-3 text-xs" onClick={() => announce(`PDF ${proposal.code} pronto para prévia`)}><FileText className="h-4 w-4 text-brand" />Gerar PDF</Button><Button variant="icon" className="h-9 w-9" aria-label="Mais opções" onClick={() => announce(`Opções ${proposal.code}`)}><MoreHorizontal className="h-5 w-5" /></Button></div></div>)}
        {!list.length && <div className="p-5"><EmptyOrNotice title="Nenhuma proposta encontrada" text="Tente outro filtro ou crie uma nova proposta." /></div>}
      </div>
    </>
  );
}

function ClientsPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return mockClients.filter((client) => !q || `${client.name} ${client.phone} ${client.email}`.toLocaleLowerCase("pt-BR").includes(q));
  }, [query]);

  return (
    <>
      <PageHeader eyebrow="Relacionamento" title="Clientes" description="Contatos e histórico básico para você encontrar cada cliente rapidamente." action="Novo cliente" actionIcon={UserPlus} onAction={() => openModal("client")} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((client) => <article key={client.id} className="premium-panel rounded-xl p-4"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-avatar font-display text-lg font-semibold text-[#3b2b18]">{client.initials}</div><div className="min-w-0"><h2 className="truncate font-display text-xl font-semibold text-brand">{client.name}</h2><p className="text-xs text-muted-foreground">{client.events} {client.events === 1 ? "evento" : "eventos"}</p></div></div><div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" />{client.phone}</p><p className="flex min-w-0 items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-brand" /><span className="truncate">{client.email}</span></p><p className="flex items-center justify-between pt-1 text-muted-foreground"><span>Próximo/último evento</span><strong className="text-brand">{client.lastEvent}</strong></p></div><Button variant="outline" className="mt-4 h-9 w-full text-xs" onClick={() => announce(`Histórico de ${client.name}`)}>Ver histórico</Button></article>)}
        {!list.length && <div className="sm:col-span-2 xl:col-span-3"><EmptyOrNotice title="Cliente não encontrado" text="Você pode buscar por nome, telefone ou e-mail." /></div>}
      </div>
    </>
  );
}

function SettingsPage({ announce }: { announce: (message: string) => void }) {
  return (
    <>
      <PageHeader eyebrow="Preferências" title="Configurações" description="Dados que futuramente poderão aparecer nas propostas e documentos da empresa." />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <section className="premium-panel rounded-xl p-5">
          <h2 className="font-display text-2xl font-semibold text-brand">Dados da empresa</h2>
          <p className="mt-1 text-xs text-muted-foreground">Esta tela é apenas visual nesta versão de validação.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nome da empresa" defaultValue="Atelier Priscila Gefune" /><Field label="Responsável" defaultValue="Priscila Gefune" /><Field label="Telefone" defaultValue="(43) 9.9603-7351" /><Field label="E-mail" defaultValue="contato@priscilagefune.com.br" /><div className="sm:col-span-2"><Field label="Endereço" defaultValue="Paraná - PR" /></div><div className="sm:col-span-2"><label className="text-xs font-semibold text-muted-foreground">Mensagem das propostas</label><textarea defaultValue="Planejamos cada detalhe para transformar momentos especiais em memórias inesquecíveis." className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></div></div>
          <Button variant="primary" className="mt-5 h-10 px-5" onClick={() => announce("Configurações simuladas salvas")}>Salvar alterações</Button>
        </section>
        <aside className="premium-panel rounded-xl p-5">
          <h2 className="font-display text-2xl font-semibold text-brand">Identidade da proposta</h2>
          <div className="mt-4 rounded-xl border border-brand/30 bg-[#11110f] p-4"><Brand compact /><div className="mt-5 rounded-lg border border-brand/25 bg-card p-4 shadow-soft"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Proposta comercial</p><h3 className="mt-2 font-display text-2xl text-brand">Casamento Ana & Lucas</h3><p className="mt-1 text-xs text-muted-foreground">Prévia conceitual da identidade aplicada aos futuros PDFs.</p><div className="mt-5 h-px bg-border" /><div className="mt-4 flex items-end justify-between"><span className="text-xs text-muted-foreground">Investimento</span><strong className="font-display text-2xl text-brand">R$ 18.750</strong></div></div></div>
        </aside>
      </div>
    </>
  );
}

function Field({ label, defaultValue, type = "text", placeholder }: { label: string; defaultValue?: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
    </label>
  );
}

function MockModal({ kind, onClose, announce }: { kind: Exclude<ModalKind, null>; onClose: () => void; announce: (message: string) => void }) {
  const content = {
    event: { eyebrow: "Novo evento", title: "Vamos organizar o próximo evento", icon: CalendarDays, button: "Salvar evento", fields: ["Cliente", "Nome do evento", "Data do evento", "Local"] },
    inventory: { eyebrow: "Novo item", title: "Adicionar ao estoque", icon: PackageCheck, button: "Adicionar item", fields: ["Nome do item", "Categoria", "Quantidade total", "Valor de locação"] },
    proposal: { eyebrow: "Nova proposta", title: "Criar proposta comercial", icon: FileText, button: "Montar proposta", fields: ["Cliente", "Evento", "Data do evento", "Valor estimado"] },
    client: { eyebrow: "Novo cliente", title: "Cadastrar cliente", icon: UserPlus, button: "Salvar cliente", fields: ["Nome", "Telefone", "E-mail", "Observação"] },
  }[kind];
  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay px-4" role="dialog" aria-modal="true">
      <div className="premium-panel w-full max-w-lg overflow-hidden rounded-xl shadow-elevated">
        <div className="flex items-start justify-between border-b border-border bg-muted/40 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">{content.eyebrow}</p><h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold text-brand"><Icon className="h-5 w-5" />{content.title}</h2></div><Button variant="icon" className="h-9 w-9" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></Button></div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">{content.fields.map((label, index) => <Field key={label} label={label} type={label.includes("Data") ? "date" : label.includes("Quantidade") || label.includes("Valor") ? "number" : "text"} placeholder={index === 0 ? "Digite ou selecione" : undefined} />)}{kind === "event" && <><Field label="Retirada" type="date" /><Field label="Devolução" type="date" /></>}{kind === "inventory" && <div className="sm:col-span-2 rounded-lg bg-sage px-4 py-3 text-xs text-success"><Check className="mr-2 inline h-4 w-4" />Depois, fotos e detalhes avançados poderão ser adicionados.</div>}</div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4"><Button variant="outline" className="h-10 px-4" onClick={onClose}>Cancelar</Button><Button variant="primary" className="h-10 px-5" onClick={() => { announce(`${content.button} — simulação concluída`); onClose(); }}>{content.button}</Button></div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<Page>("Início");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<ModalKind>(null);

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const navigate = (page: Page) => {
    setActive(page);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={active} onSelect={navigate} />
      <div className="lg:pl-[286px]">
        <header className="sticky top-0 z-20 grid h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:px-7">
          <Button variant="icon" className="h-10 w-10 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>
          <label className="relative min-w-0 max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-md border border-input bg-muted/30 pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-brand/55 focus:ring-2 focus:ring-ring" placeholder={active === "Início" ? "Buscar eventos, clientes, propostas..." : `Buscar em ${active.toLocaleLowerCase("pt-BR")}...`} /></label>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3"><Button variant="icon" className="relative h-10 w-10" aria-label="Notificações" onClick={() => announce("Você tem 3 alertas importantes")}><Bell className="h-5 w-5 text-brand" /><span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">3</span></Button><div className="hidden h-8 w-px bg-border sm:block" /><Button className="mobile-profile h-12 px-1 hover:bg-transparent" onClick={() => announce("Perfil de Priscila — demonstração")}><span className="grid h-10 w-10 place-items-center rounded-full bg-avatar font-display text-lg font-semibold text-[#3b2b18]">PG</span><span className="hidden text-left sm:block"><strong className="block text-sm font-semibold">Olá, Priscila!</strong><small className="block text-[10px] font-normal text-muted-foreground">Que bom ter você aqui!</small></span><ChevronDown className="h-4 w-4 text-muted-foreground" /></Button></div>
        </header>

        <main className="mx-auto max-w-[1660px] px-4 pb-8 pt-5 sm:px-6 lg:px-7">
          {active !== "Início" && <Button className="mb-4 h-8 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-brand" onClick={() => navigate("Início")}><ArrowLeft className="h-4 w-4" />Voltar ao início</Button>}
          {active === "Início" && <HomePage query={query} navigate={navigate} openModal={setModal} announce={announce} />}
          {active === "Eventos" && <EventsPage query={query} openModal={setModal} announce={announce} />}
          {active === "Estoque" && <InventoryPage query={query} openModal={setModal} announce={announce} />}
          {active === "Propostas" && <ProposalsPage query={query} openModal={setModal} announce={announce} />}
          {active === "Clientes" && <ClientsPage query={query} openModal={setModal} announce={announce} />}
          {active === "Configurações" && <SettingsPage announce={announce} />}
        </main>
      </div>

      {modal && <MockModal kind={modal} onClose={() => setModal(null)} announce={announce} />}
      {notice && <div role="status" className="fixed bottom-5 right-5 z-[80] flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-md border border-brand/30 bg-popover px-4 py-3 text-sm text-popover-foreground shadow-elevated"><Sparkles className="h-4 w-4 shrink-0 text-brand" />{notice}</div>}
    </div>
  );
}
