import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Home,
  Info,
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
  Tag,
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
      {
        name: "description",
        content: "Gestão de eventos, estoque, propostas e clientes do Atelier Priscila Gefune.",
      },
      { property: "og:title", content: "Atelier Priscila Gefune | Gestão de Eventos" },
      {
        property: "og:description",
        content: "Um painel elegante e simples para organizar cada detalhe dos eventos.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

type Page = "Início" | "Eventos" | "Estoque" | "Propostas" | "Clientes" | "Configurações";
type ModalKind = "event" | "inventory" | "proposal" | "client" | null;
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "gold" | "dark" | "light" | "lightOutline" | "iconDark" | "iconLight" | "quietDark";
};

const navigation: { label: Page; icon: LucideIcon }[] = [
  { label: "Início", icon: Home },
  { label: "Eventos", icon: CalendarDays },
  { label: "Estoque", icon: Box },
  { label: "Propostas", icon: FileText },
  { label: "Clientes", icon: Users },
  { label: "Configurações", icon: Settings },
];

function Button({ children, className = "", variant = "dark", ...props }: ButtonProps) {
  const variants = {
    gold: "gold-button",
    dark: "border border-brand/35 bg-transparent text-foreground hover:border-brand/60 hover:bg-brand/5",
    light: "bg-card text-card-foreground hover:bg-[#f4eadc]",
    lightOutline: "border border-[#dcccb8] bg-[#fffaf3] text-[#332c25] hover:border-[#b98c4b] hover:bg-[#f8eee1]",
    iconDark: "text-brand hover:bg-brand/8 hover:text-[#efd9a5]",
    iconLight: "text-[#745a38] hover:bg-[#efe3d3]",
    quietDark: "text-muted-foreground hover:bg-brand/5 hover:text-brand",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Brand() {
  return (
    <div className="brand-logo-wrap">
      <img src={atelierLogo} width={1005} height={591} alt="Atelier Priscila Gefune" />
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
  onSelect: (page: Page) => void;
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
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[284px] flex-col overflow-hidden px-3 pb-5 pt-4 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-[164px] items-start justify-between px-2">
          <Brand />
          <Button
            variant="iconDark"
            className="h-10 w-10 shrink-0 lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav aria-label="Navegação principal" className="mt-6 space-y-2">
          {navigation.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant="quietDark"
              className={`h-12 w-full justify-start px-5 text-sm ${
                active === label ? "nav-item-active" : "nav-item-idle"
              }`}
              onClick={() => {
                onSelect(label);
                onClose();
              }}
            >
              <Icon className="h-5 w-5 shrink-0 stroke-[1.55] text-brand" />
              <span>{label}</span>
            </Button>
          ))}
        </nav>

        <div className="mt-auto hidden px-5 lg:block">
          <div className="mx-auto flex w-28 justify-center border-b border-brand/55 pb-4 text-brand/90">
            <Leaf className="h-20 w-20 stroke-[1]" />
          </div>
          <p className="mt-5 text-center font-display text-[15px] tracking-[0.22em] text-brand/90">
            Eventos que encantam
          </p>
          <div className="mx-auto mt-5 h-px w-16 bg-brand/70" />
        </div>
      </aside>
    </>
  );
}

function AppHeader({
  query,
  onQueryChange,
  active,
  onOpenMenu,
  announce,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  active: Page;
  onOpenMenu: () => void;
  announce: (message: string) => void;
}) {
  return (
    <header className="app-header sticky top-0 z-20 flex h-[70px] items-center gap-3 px-4 sm:px-6 lg:px-7">
      <Button variant="iconDark" className="h-10 w-10 lg:hidden" onClick={onOpenMenu} aria-label="Abrir menu">
        <Menu className="h-5 w-5" />
      </Button>

      <label className="relative min-w-0 max-w-[520px] flex-1">
        <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#d7c6a4]" />
        <span className="sr-only">Buscar</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="header-search h-10 w-full rounded-xl pl-11 pr-4 text-sm outline-none"
          placeholder={active === "Início" ? "Buscar eventos, clientes, propostas..." : `Buscar em ${active.toLocaleLowerCase("pt-BR")}...`}
        />
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <Button
          variant="iconDark"
          className="relative h-10 w-10"
          aria-label="Notificações"
          onClick={() => announce("Você tem 3 alertas importantes")}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#d85d56] px-1 text-[9px] font-bold text-white">
            3
          </span>
        </Button>
        <div className="hidden h-8 w-px bg-brand/20 sm:block" />
        <Button variant="quietDark" className="h-12 px-1 hover:bg-transparent" onClick={() => announce("Perfil de Priscila — demonstração")}> 
          <span className="grid h-10 w-10 place-items-center rounded-full bg-avatar font-display text-lg font-semibold text-[#2c241c]">
            PG
          </span>
          <span className="mobile-profile-copy hidden text-left sm:block">
            <strong className="block text-sm font-semibold text-[#f4eadc]">Olá, Priscila!</strong>
            <small className="block text-[10px] font-normal text-[#aaa097]">Que bom ter você aqui!</small>
          </span>
          <ChevronDown className="h-4 w-4 text-[#b9aa96]" />
        </Button>
      </div>
    </header>
  );
}

function PageHero({
  title,
  description,
  phrase,
}: {
  title: string;
  description: string;
  phrase: ReactNode;
}) {
  return (
    <section className="hero-band -mx-4 -mt-5 px-4 sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7">
      <img src={floralImage} width={1920} height={1024} className="hero-photo" alt="Arranjo floral elegante" />
      <div className="relative z-10 grid min-h-[150px] items-center gap-4 py-6 lg:grid-cols-[1fr_.72fr]">
        <div>
          <h1 className="font-display text-[42px] font-semibold leading-[.96] text-[#f1dfb7] sm:text-[54px]">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#d9d0c4] sm:text-base">{description}</p>
        </div>
        <div className="hidden justify-self-end pr-5 text-center xl:block">
          <p className="font-display text-2xl italic leading-tight text-[#f1dfb7]">{phrase}</p>
          <div className="mx-auto mt-3 h-px w-16 bg-brand" />
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendTone = "positive",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  trendTone?: "positive" | "negative" | "neutral";
}) {
  const trendClass =
    trendTone === "positive" ? "text-[#3d794a]" : trendTone === "negative" ? "text-[#c4433e]" : "text-[#77695a]";
  const TrendIcon = trendTone === "negative" ? ArrowDown : trendTone === "positive" ? ArrowUp : ArrowRight;

  return (
    <article className="ivory-card flex min-w-0 items-center gap-4 rounded-xl px-4 py-4">
      <div className="metric-icon">
        <Icon className="h-6 w-6 stroke-[1.6]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#31291f]">{label}</p>
        <div className="mt-0.5 flex items-end gap-3">
          <span className="font-display text-[35px] font-semibold leading-none text-[#241e18]">{value}</span>
          <span className={`mb-0.5 hidden items-center gap-1 text-[11px] font-semibold sm:flex ${trendClass}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#777067]" />
    </article>
  );
}

function LightPanelHeader({
  title,
  action = "Ver todos",
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e5d8c8] px-5 py-4">
      <h2 className="panel-heading">{title}</h2>
      {action && (
        <Button variant="iconLight" className="panel-link h-8 px-1 text-xs" onClick={onAction}>
          {action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function EventStatusBadge({ status }: { status: EventStatus }) {
  const cls =
    status === "Confirmado" || status === "Concluído"
      ? "status-positive"
      : status === "Proposta enviada"
        ? "status-info"
        : "status-warning";

  return <span className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const cls = status === "Aceita" ? "status-positive" : status === "Recusada" ? "status-danger" : status === "Aguardando" ? "status-warning" : "status-info";
  return <span className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

function InventoryIcon({ kind, className = "h-6 w-6" }: { kind: string; className?: string }) {
  const icons: Record<string, LucideIcon> = {
    table: Archive,
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

function InventoryThumb({ kind, large = false }: { kind: string; large?: boolean }) {
  const tone = kind === "decor" || kind === "vase" ? "is-green" : kind === "plate" ? "is-gold" : kind === "linen" ? "is-cream" : "";
  return (
    <div className={`inventory-thumb ${tone} ${large ? "!h-[58px] !w-[72px]" : ""}`}>
      <InventoryIcon kind={kind} className={large ? "h-8 w-8 stroke-[1.25]" : "h-7 w-7 stroke-[1.3]"} />
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
    const source = q
      ? mockEvents.filter((event) => `${event.title} ${event.place} ${event.client}`.toLocaleLowerCase("pt-BR").includes(q))
      : mockEvents;
    return source.slice(0, 3);
  }, [query]);

  const quickInventory = [mockInventory[0], mockInventory[3], mockInventory[2], mockInventory[1]];
  const dateLabels = ["Em 5 dias", "Em 14 dias", "Em 28 dias"];

  return (
    <>
      <PageHero
        title="Bem-vinda, Priscila!"
        description="Aqui estão os principais dados do seu negócio hoje."
        phrase={<><span>Sonhos em</span><br /><span>cada detalhe</span></>}
      />

      <section aria-label="Resumo" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={CalendarDays} label="Eventos em andamento" value="8" trend="+2 este mês" />
        <KpiCard icon={Users} label="Clientes ativos" value="24" trend="+5 este mês" />
        <KpiCard icon={FileText} label="Propostas enviadas" value="12" trend="+3 este mês" />
        <KpiCard icon={Box} label="Itens no estoque" value="156" trend="-4 esta semana" trendTone="negative" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.22fr_1fr_.72fr]">
        <article className="ivory-card overflow-hidden rounded-xl">
          <LightPanelHeader title="Próximos Eventos" onAction={() => navigate("Eventos")} />
          <div className="px-4">
            {shownEvents.length ? (
              shownEvents.map((event, index) => (
                <button
                  key={event.id}
                  className="grid w-full grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e4d7c7] py-3 text-left last:border-0 hover:bg-[#f6ecdf]"
                  onClick={() => announce(`Abrindo ${event.title}`)}
                >
                  <div className="date-chip rounded-lg px-2 py-2 text-center">
                    <div className="font-display text-2xl font-semibold leading-none">{event.day}</div>
                    <div className="mt-1 text-[10px] font-bold tracking-wide">{event.month}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#24201a]">{event.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-[#766c61]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9d6f33]" />
                      {event.place}
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="status-warning inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold">{dateLabels[index]}</span>
                    <ChevronRight className="h-4 w-4 text-[#7f7568]" />
                  </div>
                </button>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-[#796f64]">Nenhum evento encontrado.</div>
            )}
          </div>
        </article>

        <article className="ivory-card overflow-hidden rounded-xl">
          <LightPanelHeader title="Estoque rápido" onAction={() => navigate("Estoque")} />
          <div className="px-4">
            {quickInventory.map((item) => {
              const low = item.available <= Math.max(12, Math.ceil(item.total * 0.25));
              return (
                <button
                  key={item.id}
                  className="grid w-full grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e4d7c7] py-2.5 text-left last:border-0 hover:bg-[#f6ecdf]"
                  onClick={() => announce(`Disponibilidade de ${item.item}`)}
                >
                  <InventoryThumb kind={item.icon} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#27221c]">{item.item}</p>
                    <p className="mt-0.5 text-[11px] text-[#756b60]">{item.available} unidades</p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${low ? "status-danger" : "status-positive"}`}>
                      {low ? "Estoque baixo" : "Em bom nível"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#7f7568]" />
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="ivory-card overflow-hidden rounded-xl">
          <LightPanelHeader title="Ações rápidas" action="" />
          <div className="grid gap-2.5 p-4">
            {[
              ["Novo evento", CalendarDays, () => openModal("event"), true],
              ["Nova proposta", FileText, () => openModal("proposal"), false],
              ["Novo cliente", Users, () => openModal("client"), false],
              ["Adicionar item ao estoque", Box, () => openModal("inventory"), false],
            ].map(([label, Icon, onClick, primary]) => {
              const ActionIcon = Icon as LucideIcon;
              return (
                <Button
                  key={label as string}
                  variant={primary ? "gold" : "lightOutline"}
                  className="h-12 w-full justify-between px-4 text-sm"
                  onClick={onClick as () => void}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <ActionIcon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{label as string}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <article className="ivory-card overflow-hidden rounded-xl">
          <LightPanelHeader title="Propostas recentes" onAction={() => navigate("Propostas")} />
          <div className="px-4">
            {mockProposals.map((proposal) => (
              <button
                key={proposal.id}
                className="grid w-full grid-cols-[58px_minmax(0,1fr)_110px_104px_20px] items-center gap-3 border-b border-[#e4d7c7] py-2.5 text-left last:border-0 hover:bg-[#f6ecdf]"
                onClick={() => announce(`Proposta ${proposal.code}`)}
              >
                <span className="text-xs font-semibold text-[#5a4f43]">{proposal.code}</span>
                <span className="truncate text-xs font-medium text-[#302920]">{proposal.event}</span>
                <span className="hidden text-[11px] text-[#81766a] sm:block">{proposal.updatedAt}</span>
                <ProposalStatusBadge status={proposal.status} />
                <ChevronRight className="h-4 w-4 text-[#827769]" />
              </button>
            ))}
          </div>
        </article>

        <article className="ivory-card overflow-hidden rounded-xl">
          <LightPanelHeader title="Alertas importantes" onAction={() => announce("Todos os alertas")} />
          <div className="px-4">
            {mockAlerts.map((alert) => {
              const Icon = alert.kind === "danger" ? AlertTriangle : alert.kind === "warning" ? AlertCircle : Info;
              const tone = alert.kind === "danger" ? "status-danger" : alert.kind === "warning" ? "status-warning" : "status-info";
              return (
                <button
                  key={alert.id}
                  className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e4d7c7] py-3 text-left last:border-0 hover:bg-[#f6ecdf]"
                  onClick={() => announce(alert.title)}
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-full ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#3a3127]">{alert.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[#84786b]">{alert.detail}</p>
                  </div>
                  <span className="hidden text-[10px] text-[#8c8175] sm:block">{alert.timestamp}</span>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <Footer />
    </>
  );
}

const calendarDays = [
  { day: "28", muted: true }, { day: "29", muted: true }, { day: "30", muted: true },
  { day: "1" }, { day: "2" }, { day: "3" }, { day: "4" },
  { day: "5" }, { day: "6" }, { day: "7" }, { day: "8", dot: "#c59a59" }, { day: "9" }, { day: "10", mark: "gold", dot: "#3183a0" }, { day: "11", dot: "#8ca07d" },
  { day: "12" }, { day: "13" }, { day: "14" }, { day: "15", dot: "#3386a3" }, { day: "16" }, { day: "17" }, { day: "18", mark: "green", dot: "#c96a60" },
  { day: "19" }, { day: "20" }, { day: "21" }, { day: "22" }, { day: "23" }, { day: "24", dot: "#6a9b76" }, { day: "25", mark: "gold", dot: "#c96a60" },
  { day: "26" }, { day: "27" }, { day: "28" }, { day: "29" }, { day: "30" }, { day: "31" }, { day: "1", muted: true },
];

function EventsPage({
  query,
  openModal,
  announce,
}: {
  query: string;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  announce: (message: string) => void;
}) {
  const [localQuery, setLocalQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");
  const [month, setMonth] = useState("Todos os meses");

  const list = useMemo(() => {
    const q = `${query} ${localQuery}`.trim().toLocaleLowerCase("pt-BR");
    return mockEvents.filter((event) => {
      const matchesSearch = !q || `${event.title} ${event.client} ${event.place} ${event.city}`.toLocaleLowerCase("pt-BR").includes(q);
      const matchesStatus = status === "Todos os status" || event.status === status;
      const matchesMonth = month === "Todos os meses" || event.month === month;
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [query, localQuery, status, month]);

  return (
    <>
      <PageHero
        title="Eventos"
        description="Organize, acompanhe e visualize seus próximos eventos com clareza."
        phrase={<><span>Sonhos em</span><br /><span>cada detalhe</span></>}
      />

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_190px]">
        <KpiCard icon={CalendarDays} label="Eventos este mês" value="4" trend="+2 que o mês anterior" />
        <KpiCard icon={CheckCircle2} label="Confirmados" value="3" trend="+1 que o mês anterior" />
        <KpiCard icon={AlertCircle} label="Aguardando retorno" value="1" trend="-2 que o mês anterior" trendTone="negative" />
        <Button variant="gold" className="min-h-[96px] gap-3 text-base" onClick={() => openModal("event")}>
          <Plus className="h-5 w-5" />
          Novo evento
        </Button>
      </section>

      <section className="ivory-card mt-4 grid gap-2 rounded-xl p-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#87796b]" />
          <input
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
            className="light-control h-10 w-full rounded-lg pl-10 pr-3 text-xs outline-none"
            placeholder="Buscar eventos por nome, cliente ou local..."
          />
        </label>
        <label className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c5d4c]" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="light-control h-10 w-full appearance-none rounded-lg pl-10 pr-9 text-xs outline-none">
            <option>Todos os status</option>
            <option>Confirmado</option>
            <option>Em preparação</option>
            <option>Proposta enviada</option>
            <option>Em planejamento</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c5d4c]" />
        </label>
        <label className="relative">
          <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c5d4c]" />
          <select value={month} onChange={(event) => setMonth(event.target.value)} className="light-control h-10 w-full appearance-none rounded-lg pl-10 pr-9 text-xs outline-none">
            <option>Todos os meses</option>
            <option>SET</option>
            <option>OUT</option>
            <option>NOV</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c5d4c]" />
        </label>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="ivory-card overflow-hidden rounded-xl">
          <LightPanelHeader title="Próximos Eventos" />
          <div className="px-4 pb-1">
            {list.map((event) => (
              <div key={event.id} className="grid gap-3 border-b border-[#e4d7c7] py-3 last:border-0 lg:grid-cols-[68px_minmax(210px,1.2fr)_minmax(210px,1fr)_132px_116px] lg:items-center">
                <div className="date-chip w-[64px] rounded-lg px-2 py-2 text-center">
                  <div className="font-display text-2xl font-semibold leading-none">{event.day}</div>
                  <div className="mt-1 text-[10px] font-bold tracking-wide">{event.month}</div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#27221c]">{event.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-[#796f64]"><Users className="h-3.5 w-3.5" />{event.client}</p>
                </div>
                <div className="min-w-0 text-[11px] text-[#645a50]">
                  <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-[#90652f]" />{event.place}</p>
                  <p className="ml-5 mt-0.5 text-[#8d8377]">{event.city}</p>
                </div>
                <EventStatusBadge status={event.status} />
                <Button variant="lightOutline" className="h-9 px-3 text-[11px]" onClick={() => announce(`Detalhes de ${event.title}`)}>
                  Ver evento
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {!list.length && <div className="py-12 text-center text-sm text-[#7b7167]">Nenhum evento corresponde aos filtros atuais.</div>}
          </div>
        </article>

        <aside className="grid content-start gap-4">
          <article className="ivory-card rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="panel-heading">Agenda do mês</h2>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#3e352c]">
                <Button variant="iconLight" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                <span>Outubro 2026</span>
                <Button variant="iconLight" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-y-2 text-center text-[10px] text-[#51483e]">
              {['DOM','SEG','TER','QUA','QUI','SEX','SÁB'].map((label) => <span key={label} className="font-semibold">{label}</span>)}
              {calendarDays.map((item, index) => (
                <div key={`${item.day}-${index}`} className="relative mx-auto grid h-8 w-8 place-items-center">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-xs ${item.muted ? "text-[#c3bbb2]" : "text-[#302920]"} ${item.mark === "gold" ? "bg-[#f4e4be]" : item.mark === "green" ? "bg-[#deebd9]" : ""}`}>{item.day}</span>
                  {item.dot && <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full" style={{ background: item.dot }} />}
                </div>
              ))}
            </div>
          </article>

          <article className="dark-outline-card deco-corner rounded-xl px-6 py-5 text-center">
            <CalendarDays className="mx-auto h-6 w-6 text-brand" />
            <h3 className="mt-2 font-display text-2xl font-semibold text-brand">Cada evento é único</h3>
            <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-[#c6bbaa]">Mais que eventos, criamos experiências inesquecíveis.</p>
            <div className="mx-auto mt-4 h-px w-16 bg-brand/70" />
          </article>
        </aside>
      </section>

      <Footer />
    </>
  );
}

function InventoryPage({
  query,
  openModal,
  announce,
}: {
  query: string;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  announce: (message: string) => void;
}) {
  const [localQuery, setLocalQuery] = useState("");
  const [category, setCategory] = useState("Todas as categorias");
  const [stockStatus, setStockStatus] = useState("Todos os status");
  const categories = Array.from(new Set(mockInventory.map((item) => item.category)));

  const list = useMemo(() => {
    const q = `${query} ${localQuery}`.trim().toLocaleLowerCase("pt-BR");
    return mockInventory.filter((item) => {
      const low = item.available <= Math.max(12, Math.ceil(item.total * 0.25));
      const attention = !low && item.available <= Math.ceil(item.total * 0.6);
      const state = low ? "Estoque baixo" : attention ? "Atenção" : "Em bom nível";
      return (
        (!q || `${item.item} ${item.category} ${item.sku}`.toLocaleLowerCase("pt-BR").includes(q)) &&
        (category === "Todas as categorias" || item.category === category) &&
        (stockStatus === "Todos os status" || state === stockStatus)
      );
    });
  }, [query, localQuery, category, stockStatus]);

  const attentionItems = [mockInventory[1], mockInventory[2], mockInventory[5]];

  return (
    <>
      <PageHero
        title="Estoque"
        description="Controle o que está disponível, reservado e em baixa com facilidade."
        phrase={<><span>Organização que faz</span><br /><span>belos eventos</span></>}
      />

      <section className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_270px_270px_200px]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d0bd9b]" />
          <input
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
            className="dark-control h-12 w-full rounded-xl pl-11 pr-4 text-sm outline-none"
            placeholder="Buscar item no estoque..."
          />
        </label>
        <label className="relative">
          <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d0bd9b]" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="dark-control h-12 w-full appearance-none rounded-xl pl-11 pr-9 text-sm outline-none">
            <option>Todas as categorias</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d0bd9b]" />
        </label>
        <label className="relative">
          <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d0bd9b]" />
          <select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)} className="dark-control h-12 w-full appearance-none rounded-xl pl-11 pr-9 text-sm outline-none">
            <option>Todos os status</option>
            <option>Em bom nível</option>
            <option>Atenção</option>
            <option>Estoque baixo</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d0bd9b]" />
        </label>
        <Button variant="gold" className="h-12 text-sm" onClick={() => openModal("inventory")}>
          <Plus className="h-5 w-5" />
          Adicionar item
        </Button>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Box} label="Itens cadastrados" value="156" trend="+12 este mês" />
        <KpiCard icon={CheckCircle2} label="Disponíveis" value="118" trend="+8 este mês" />
        <KpiCard icon={CalendarDays} label="Reservados" value="26" trend="+4 este mês" />
        <KpiCard icon={AlertTriangle} label="Estoque baixo" value="12" trend="+3 este mês" trendTone="negative" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_410px]">
        <article className="ivory-card overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[#e5d8c8] px-5 py-4">
            <h2 className="panel-heading">Lista de itens</h2>
            <Button variant="iconLight" className="h-8 px-2 text-[11px] text-[#6f6254]">Ordenar por: <strong>Nome</strong><ChevronDown className="h-4 w-4" /></Button>
          </div>
          <div className="hidden grid-cols-[minmax(280px,1.6fr)_180px_70px_90px_90px_130px_20px] gap-3 border-b border-[#e5d8c8] bg-[#f3eadf] px-5 py-2.5 text-[10px] font-semibold text-[#776d62] lg:grid">
            <span>Item</span><span>Categoria</span><span>Total</span><span>Reservado</span><span>Disponível</span><span>Status</span><span />
          </div>
          <div className="px-4">
            {list.map((item) => {
              const low = item.available <= Math.max(12, Math.ceil(item.total * 0.25));
              const attention = !low && item.available <= Math.ceil(item.total * 0.6);
              const statusLabel = low ? "Estoque baixo" : attention ? "Atenção" : "Em bom nível";
              const statusClass = low ? "status-danger" : attention ? "status-warning" : "status-positive";
              return (
                <button
                  key={item.id}
                  className="grid w-full gap-3 border-b border-[#e5d8c8] py-2.5 text-left last:border-0 hover:bg-[#f6ecdf] lg:grid-cols-[minmax(280px,1.6fr)_180px_70px_90px_90px_130px_20px] lg:items-center"
                  onClick={() => announce(`Disponibilidade de ${item.item}`)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <InventoryThumb kind={item.icon} large />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2c261f]">{item.item}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-[#8a7f73]">{item.sku}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#70665b]">{item.category}</span>
                  <strong className="text-sm text-[#2d271f]">{item.total}</strong>
                  <span className="text-sm text-[#2d271f]">{item.reserved}</span>
                  <span className="text-sm text-[#2d271f]">{item.available}</span>
                  <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold ${statusClass}`}>{statusLabel}</span>
                  <ChevronRight className="hidden h-4 w-4 text-[#7f7568] lg:block" />
                </button>
              );
            })}
            {!list.length && <div className="py-12 text-center text-sm text-[#7b7167]">Nenhum item corresponde aos filtros atuais.</div>}
          </div>
        </article>

        <aside className="grid content-start gap-4">
          <article className="ivory-card overflow-hidden rounded-xl">
            <LightPanelHeader title="Itens com atenção" />
            <div className="px-4">
              {attentionItems.map((item, index) => (
                <button key={item.id} className="grid w-full grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e5d8c8] py-2.5 text-left last:border-0 hover:bg-[#f6ecdf]" onClick={() => announce(`Atenção em ${item.item}`)}>
                  <InventoryThumb kind={item.icon} large />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#302920]">{item.item}</p>
                    <p className="mt-0.5 text-[10px] text-[#857a6e]">{item.available} de {item.total} disponíveis</p>
                  </div>
                  <span className={`hidden rounded-full px-3 py-1.5 text-[10px] font-semibold sm:inline-flex ${index < 2 ? "status-danger" : "status-warning"}`}>
                    {index < 2 ? "Estoque baixo" : "Atenção"}
                  </span>
                </button>
              ))}
            </div>
          </article>

          <article className="ivory-card overflow-hidden rounded-xl">
            <LightPanelHeader title="Últimas movimentações" />
            <div className="px-4">
              {[
                { title: "Reserva realizada", text: "12 Cadeiras Chiavari", meta: "Evento #0048", time: "Hoje, 10:24", icon: ArrowDown, cls: "status-danger" },
                { title: "Entrada no estoque", text: "20 Sousplat dourado", meta: "Nota #2893", time: "Ontem, 16:08", icon: ArrowUp, cls: "status-positive" },
                { title: "Saída para evento", text: "6 Mesas redondas", meta: "Evento #0047", time: "Ontem, 14:32", icon: CalendarDays, cls: "status-warning" },
              ].map((movement) => {
                const MoveIcon = movement.icon;
                return (
                  <div key={movement.title} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e5d8c8] py-3 last:border-0">
                    <div className={`grid h-9 w-9 place-items-center rounded-full ${movement.cls}`}><MoveIcon className="h-4 w-4" /></div>
                    <div className="min-w-0"><p className="text-xs font-semibold text-[#302920]">{movement.title}</p><p className="mt-0.5 truncate text-[10px] text-[#83786b]">{movement.text}</p></div>
                    <div className="text-right text-[9px] text-[#8c8175]"><p>{movement.time}</p><p className="mt-0.5">{movement.meta}</p></div>
                  </div>
                );
              })}
            </div>
          </article>
        </aside>
      </section>

      <Footer />
    </>
  );
}

function SimplePageHero({ title, description }: { title: string; description: string }) {
  return <PageHero title={title} description={description} phrase={<><span>Planejar</span><br /><span>Decorar · Encantar</span></>} />;
}

function ProposalsPage({
  query,
  openModal,
  announce,
}: {
  query: string;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  announce: (message: string) => void;
}) {
  const [status, setStatus] = useState("Todas");
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return mockProposals.filter((proposal) => (!q || `${proposal.client} ${proposal.event} ${proposal.code}`.toLocaleLowerCase("pt-BR").includes(q)) && (status === "Todas" || proposal.status === status));
  }, [query, status]);

  return (
    <>
      <SimplePageHero title="Propostas" description="Organize orçamentos, acompanhe respostas e prepare os futuros PDFs comerciais." />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["Todas", "Aceita", "Aguardando", "Recusada", "Rascunho"].map((item) => (
            <Button key={item} variant={status === item ? "gold" : "dark"} className="h-9 px-4 text-xs" onClick={() => setStatus(item)}>{item}</Button>
          ))}
        </div>
        <Button variant="gold" className="h-10 px-5 text-sm" onClick={() => openModal("proposal")}><Plus className="h-4 w-4" />Nova proposta</Button>
      </div>
      <article className="ivory-card mt-4 overflow-hidden rounded-xl">
        <div className="hidden grid-cols-[90px_minmax(0,1fr)_150px_130px_120px_auto] gap-4 border-b border-[#e5d8c8] bg-[#f3eadf] px-5 py-3 text-[10px] font-semibold text-[#766c61] lg:grid">
          <span>Proposta</span><span>Cliente / evento</span><span>Data</span><span>Valor</span><span>Status</span><span />
        </div>
        {list.map((proposal) => (
          <div key={proposal.id} className="grid gap-3 border-b border-[#e5d8c8] px-5 py-4 last:border-0 lg:grid-cols-[90px_minmax(0,1fr)_150px_130px_120px_auto] lg:items-center">
            <strong className="text-sm text-[#8b642d]">{proposal.code}</strong>
            <div><p className="text-sm font-semibold text-[#302920]">{proposal.client}</p><p className="text-[11px] text-[#82776b]">{proposal.event}</p></div>
            <p className="text-[11px] text-[#5f554b]"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />{proposal.eventDate}</p>
            <strong className="text-sm text-[#302920]">{proposal.price}</strong>
            <ProposalStatusBadge status={proposal.status} />
            <div className="flex gap-2"><Button variant="lightOutline" className="h-9 px-3 text-xs" onClick={() => announce(`PDF ${proposal.code} pronto para prévia`)}><FileText className="h-4 w-4" />Gerar PDF</Button><Button variant="iconLight" className="h-9 w-9" onClick={() => announce(`Opções ${proposal.code}`)}><MoreHorizontal className="h-4 w-4" /></Button></div>
          </div>
        ))}
      </article>
      <Footer />
    </>
  );
}

function ClientsPage({
  query,
  openModal,
  announce,
}: {
  query: string;
  openModal: (kind: Exclude<ModalKind, null>) => void;
  announce: (message: string) => void;
}) {
  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return mockClients.filter((client) => !q || `${client.name} ${client.phone} ${client.email}`.toLocaleLowerCase("pt-BR").includes(q));
  }, [query]);

  return (
    <>
      <SimplePageHero title="Clientes" description="Contatos e histórico básico para encontrar cada cliente com rapidez." />
      <div className="mt-4 flex justify-end"><Button variant="gold" className="h-10 px-5 text-sm" onClick={() => openModal("client")}><UserPlus className="h-4 w-4" />Novo cliente</Button></div>
      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((client) => (
          <article key={client.id} className="ivory-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f1ddb4] font-display text-lg font-semibold text-[#33291e]">{client.initials}</div>
              <div className="min-w-0"><h2 className="truncate font-display text-xl font-semibold text-[#302920]">{client.name}</h2><p className="text-xs text-[#807569]">{client.events} {client.events === 1 ? "evento" : "eventos"}</p></div>
            </div>
            <div className="mt-4 space-y-2 border-t border-[#e5d8c8] pt-3 text-xs text-[#50473e]"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#9c6d32]" />{client.phone}</p><p className="flex min-w-0 items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-[#9c6d32]" /><span className="truncate">{client.email}</span></p><p className="flex items-center justify-between pt-1 text-[#7f7468]"><span>Próximo/último evento</span><strong className="text-[#6f4d28]">{client.lastEvent}</strong></p></div>
            <Button variant="lightOutline" className="mt-4 h-9 w-full text-xs" onClick={() => announce(`Histórico de ${client.name}`)}>Ver histórico</Button>
          </article>
        ))}
      </section>
      <Footer />
    </>
  );
}

function SettingsPage({ announce }: { announce: (message: string) => void }) {
  return (
    <>
      <SimplePageHero title="Configurações" description="Dados da empresa e informações que futuramente poderão aparecer em propostas e documentos." />
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <section className="ivory-card rounded-xl p-5">
          <h2 className="panel-heading">Dados da empresa</h2>
          <p className="mt-2 text-xs text-[#7d7266]">Esta tela continua demonstrativa nesta versão de validação.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nome da empresa" defaultValue="Atelier Priscila Gefune" />
            <Field label="Responsável" defaultValue="Priscila Gefune" />
            <Field label="Telefone" defaultValue="(43) 9.9603-7351" />
            <Field label="E-mail" defaultValue="contato@priscilagefune.com.br" />
            <div className="sm:col-span-2"><Field label="Endereço" defaultValue="Londrina - PR" /></div>
            <div className="sm:col-span-2"><label className="text-xs font-semibold text-[#74695e]">Mensagem das propostas</label><textarea defaultValue="Planejamos cada detalhe para transformar momentos especiais em memórias inesquecíveis." className="light-control mt-1 min-h-24 w-full rounded-lg px-3 py-2 text-sm outline-none" /></div>
          </div>
          <Button variant="gold" className="mt-5 h-10 px-5" onClick={() => announce("Configurações simuladas salvas")}>Salvar alterações</Button>
        </section>
        <aside className="dark-outline-card rounded-xl p-5">
          <h2 className="font-display text-2xl font-semibold text-brand">Identidade da proposta</h2>
          <div className="mt-4 mx-auto max-w-[310px]"><Brand /></div>
          <div className="ivory-card mt-5 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b6e35]">Proposta comercial</p>
            <h3 className="mt-2 font-display text-2xl text-[#302920]">Casamento Camila & Rafael</h3>
            <p className="mt-1 text-xs text-[#81766a]">Prévia conceitual da identidade aplicada aos futuros PDFs.</p>
            <div className="mt-5 h-px bg-[#e4d7c7]" />
            <div className="mt-4 flex items-end justify-between"><span className="text-xs text-[#81766a]">Investimento</span><strong className="font-display text-2xl text-[#79552b]">R$ 28.500</strong></div>
          </div>
        </aside>
      </div>
      <Footer />
    </>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#74695e]">{label}</span>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder} className="light-control mt-1 h-10 w-full rounded-lg px-3 text-sm outline-none" />
    </label>
  );
}

function MockModal({
  kind,
  onClose,
  announce,
}: {
  kind: Exclude<ModalKind, null>;
  onClose: () => void;
  announce: (message: string) => void;
}) {
  const content = {
    event: { eyebrow: "Novo evento", title: "Vamos organizar o próximo evento", icon: CalendarDays, button: "Salvar evento", fields: ["Cliente", "Nome do evento", "Data do evento", "Local"] },
    inventory: { eyebrow: "Novo item", title: "Adicionar ao estoque", icon: PackageCheck, button: "Adicionar item", fields: ["Nome do item", "Categoria", "Quantidade total", "Valor de locação"] },
    proposal: { eyebrow: "Nova proposta", title: "Criar proposta comercial", icon: FileText, button: "Montar proposta", fields: ["Cliente", "Evento", "Data do evento", "Valor estimado"] },
    client: { eyebrow: "Novo cliente", title: "Cadastrar cliente", icon: UserPlus, button: "Salvar cliente", fields: ["Nome", "Telefone", "E-mail", "Observação"] },
  }[kind];
  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay px-4" role="dialog" aria-modal="true">
      <div className="ivory-card w-full max-w-lg overflow-hidden rounded-xl shadow-[0_30px_90px_rgba(0,0,0,.55)]">
        <div className="flex items-start justify-between border-b border-[#e4d7c7] bg-[#f4eadc] px-5 py-4">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#93652d]">{content.eyebrow}</p><h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold text-[#302920]"><Icon className="h-5 w-5" />{content.title}</h2></div>
          <Button variant="iconLight" className="h-9 w-9" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></Button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {content.fields.map((label, index) => <Field key={label} label={label} type={label.includes("Data") ? "date" : label.includes("Quantidade") || label.includes("Valor") ? "number" : "text"} placeholder={index === 0 ? "Digite ou selecione" : undefined} />)}
          {kind === "event" && <><Field label="Retirada" type="date" /><Field label="Devolução" type="date" /></>}
          {kind === "inventory" && <div className="status-positive sm:col-span-2 rounded-lg px-4 py-3 text-xs"><Check className="mr-2 inline h-4 w-4" />Depois, fotos e detalhes avançados poderão ser adicionados.</div>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e4d7c7] px-5 py-4">
          <Button variant="lightOutline" className="h-10 px-4" onClick={onClose}>Cancelar</Button>
          <Button variant="gold" className="h-10 px-5" onClick={() => { announce(`${content.button} — simulação concluída`); onClose(); }}>{content.button}</Button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-4 flex flex-col gap-3 border-t border-brand/35 py-3 text-[10px] text-[#aca298] sm:flex-row sm:items-center sm:justify-between">
      <p><span className="font-display text-sm font-semibold text-[#ead9b1]">Atelier Priscila Gefune</span><span className="mx-3 text-brand/40">|</span>Transformando momentos em memórias inesquecíveis.</p>
      <div className="flex min-w-0 flex-1 items-center gap-5 sm:justify-end"><div className="hidden h-px max-w-[420px] flex-1 bg-brand/55 lg:block" /><p className="whitespace-nowrap">Gratidão por fazer parte de tantos sonhos ♡</p></div>
    </footer>
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
      <div className="lg:pl-[284px]">
        <AppHeader query={query} onQueryChange={setQuery} active={active} onOpenMenu={() => setMenuOpen(true)} announce={announce} />

        <main className="w-full px-4 pb-5 pt-5 sm:px-6 lg:px-7">
          {active === "Início" && <HomePage query={query} navigate={navigate} openModal={setModal} announce={announce} />}
          {active === "Eventos" && <EventsPage query={query} openModal={setModal} announce={announce} />}
          {active === "Estoque" && <InventoryPage query={query} openModal={setModal} announce={announce} />}
          {active === "Propostas" && <ProposalsPage query={query} openModal={setModal} announce={announce} />}
          {active === "Clientes" && <ClientsPage query={query} openModal={setModal} announce={announce} />}
          {active === "Configurações" && <SettingsPage announce={announce} />}
        </main>
      </div>

      {modal && <MockModal kind={modal} onClose={() => setModal(null)} announce={announce} />}
      {notice && (
        <div role="status" className="fixed bottom-5 right-5 z-[80] flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-lg border border-brand/30 bg-[#1b1a17] px-4 py-3 text-sm text-[#f1e6d6] shadow-[0_22px_64px_rgba(0,0,0,.55)]">
          <Sparkles className="h-4 w-4 shrink-0 text-brand" />
          {notice}
        </div>
      )}
    </div>
  );
}
