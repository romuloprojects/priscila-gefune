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
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import floralImage from "../assets/eventos-floral.jpg";
import priscilaLogo from "../assets/atelier-priscila-gefune-logo-light.png";
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
      { name: "description", content: "Organize eventos, estoque, propostas e clientes com leveza em um só lugar." },
      { property: "og:title", content: "Atelier Priscila Gefune | Gestão de Eventos" },
      { property: "og:description", content: "Gestão elegante e simples para cerimonial e decoração de eventos." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

type Page = "Início" | "Eventos" | "Estoque" | "Propostas" | "Clientes" | "Configurações";
type ModalKind = "event" | "inventory" | "proposal" | "client" | null;
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "quiet" | "icon" | "outline" };

function Button({ children, className = "", variant = "quiet", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-button hover:bg-primary/90",
    quiet: "text-foreground hover:bg-muted",
    icon: "text-muted-foreground hover:bg-muted hover:text-foreground",
    outline: "border border-input bg-card text-foreground hover:bg-muted",
  };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

const navigation: { label: Page; icon: LucideIcon }[] = [
  { label: "Início", icon: Home },
  { label: "Eventos", icon: CalendarDays },
  { label: "Estoque", icon: Archive },
  { label: "Propostas", icon: FileText },
  { label: "Clientes", icon: Users },
  { label: "Configurações", icon: Settings },
];

const metrics = [
  { label: "Eventos esta semana", value: "4", icon: CalendarDays, tone: "sage" },
  { label: "Itens em estoque", value: "1.240", icon: Box, tone: "sand" },
  { label: "Indisponíveis hoje", value: "38", icon: AlertTriangle, tone: "rose" },
  { label: "Propostas pendentes", value: "3", icon: FileText, tone: "sage" },
];

function Brand() {
  return <div className="flex w-full items-center justify-center">
    <img
      src={priscilaLogo}
      alt="Atelier Priscila Gefune"
      className="h-auto w-full max-w-[208px] object-contain"
    />
  </div>;
}

function Sidebar({ open, onClose, active, onSelect }: { open: boolean; onClose: () => void; active: Page; onSelect: (label: Page) => void }) {
  return <>
    {open && <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-overlay lg:hidden" onClick={onClose} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-border bg-sidebar px-5 py-7 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between"><Brand /><Button variant="icon" className="h-10 w-10 lg:hidden" onClick={onClose} aria-label="Fechar menu"><X className="h-5 w-5" /></Button></div>
      <nav aria-label="Navegação principal" className="mt-10 space-y-1.5">
        {navigation.map(({ label, icon: Icon }) => <Button key={label} className={`h-11 w-full justify-start px-4 text-sm ${active === label ? "bg-sidebar-accent text-sidebar-primary shadow-soft" : "text-sidebar-foreground"}`} onClick={() => { onSelect(label); onClose(); }}><Icon className="h-[19px] w-[19px] stroke-[1.7]" />{label}</Button>)}
      </nav>
      <div className="mt-auto hidden lg:block"><div className="botanical-mark" aria-hidden="true"><Leaf /><Leaf /><Leaf /></div><blockquote className="mx-auto max-w-[170px] text-center font-display text-lg italic leading-relaxed text-muted-foreground">“Eventos extraordinários tornam a vida mais bonita.”</blockquote></div>
    </aside>
  </>;
}

function SectionTitle({ icon: Icon, children, action, onAction }: { icon: LucideIcon; children: ReactNode; action?: string; onAction?: () => void }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
    <h2 className="flex min-w-0 items-center gap-3 font-display text-xl font-semibold text-foreground sm:text-2xl"><Icon className="h-5 w-5 shrink-0 text-brand" /><span className="truncate">{children}</span></h2>
    {action && <Button className="h-9 px-2 text-xs text-success" onClick={onAction}>{action}<ArrowRight className="h-4 w-4" /></Button>}
  </div>;
}

function StatusBadge({ status }: { status: EventStatus | ProposalStatus }) {
  const cls = status === "Confirmado" || status === "Aprovada" || status === "Concluído"
    ? "bg-sage text-success"
    : status === "Em preparação" || status === "Pendente"
      ? "bg-blush text-danger"
      : "bg-sand text-brand";
  return <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-medium ${cls}`}>{status}</span>;
}

function InventoryIcon({ kind, className = "h-5 w-5" }: { kind: string; className?: string }) {
  const icons: Record<string, LucideIcon> = { table: Box, chair: PackageCheck, linen: Archive, vase: Leaf, plate: Package, panel: Archive, decor: Sparkles };
  const Icon = icons[kind] ?? Package;
  return <Icon className={className} />;
}

function PageHeader({ eyebrow, title, description, action, actionIcon: ActionIcon = Plus, onAction }: { eyebrow?: string; title: string; description: string; action?: string; actionIcon?: LucideIcon; onAction?: () => void }) {
  return <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>{eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>}<h1 className="font-display text-4xl font-medium leading-none sm:text-5xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p></div>
    {action && <Button variant="primary" className="h-11 self-start px-5 sm:self-auto" onClick={onAction}><ActionIcon className="h-4 w-4" />{action}</Button>}
  </div>;
}

function EmptyOrNotice({ title, text }: { title: string; text: string }) {
  return <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center"><Sparkles className="mx-auto h-6 w-6 text-brand" /><h3 className="mt-3 font-display text-2xl">{title}</h3><p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">{text}</p></div>;
}

function HomePage({ query, navigate, openModal, announce }: { query: string; navigate: (page: Page) => void; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const shownEvents = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    if (!q) return mockEvents.slice(0, 3);
    return mockEvents.filter((event) => `${event.title} ${event.place} ${event.client}`.toLocaleLowerCase("pt-BR").includes(q)).slice(0, 3);
  }, [query]);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return <>
    <section className="relative min-h-[126px] overflow-hidden rounded-lg border border-border bg-surface px-5 py-6 shadow-soft sm:px-7">
      <img src={floralImage} width={1920} height={1024} alt="Arranjo de rosas e folhagens em tons suaves" className="absolute inset-0 h-full w-full object-cover object-right" />
      <div className="absolute inset-0 bg-hero-wash" />
      <div className="relative z-10 max-w-2xl"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand first-letter:uppercase">{formattedDate}</p><h1 className="font-display text-4xl font-medium leading-none sm:text-5xl">Bem-vinda, Priscila Gefune!</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Tudo o que você precisa para organizar seus eventos com tranquilidade.</p></div>
      <p className="relative z-10 mt-4 hidden text-right font-display text-xl italic text-brand/80 xl:block">Mais que eventos, histórias reais.</p>
    </section>

    <section aria-label="Resumo" className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, tone }) => <article key={label} className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-soft sm:gap-4 sm:p-4"><div className={`metric-icon tone-${tone}`}><Icon className="h-6 w-6 sm:h-7 sm:w-7" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground sm:text-sm">{label}</p><p className="font-display text-3xl leading-tight sm:text-4xl">{value}</p></div></article>)}</section>

    <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.04fr]">
      <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"><SectionTitle icon={CalendarDays} action="Ver todos" onAction={() => navigate("Eventos")}>Próximos eventos</SectionTitle><div className="px-5">{shownEvents.length ? shownEvents.map((event) => <button key={event.id} className="grid w-full grid-cols-[52px_minmax(0,1fr)] gap-4 border-b border-border py-3 text-left transition-colors hover:bg-muted/45 last:border-0 sm:grid-cols-[58px_minmax(0,1fr)_auto] sm:items-center" onClick={() => announce(`Abrindo ${event.title}`)}><div className="border-r border-border"><div className="font-display text-2xl leading-none">{event.day}</div><div className="mt-1 text-[11px] font-semibold text-muted-foreground">{event.month}</div></div><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${event.status === "Confirmado" ? "bg-success" : "bg-blush-strong"}`} /><p className="truncate text-sm font-medium">{event.title}</p></div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.place}</p></div><span className="col-start-2 sm:col-start-auto"><StatusBadge status={event.status} /></span></button>) : <p className="py-12 text-center text-sm text-muted-foreground">Nenhum evento encontrado.</p>}</div></article>

      <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"><SectionTitle icon={Box} action="Ver estoque" onAction={() => navigate("Estoque")}>Estoque rápido</SectionTitle><div className="overflow-x-auto px-5 pb-2"><table className="w-full min-w-[500px] text-left text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="py-3 font-medium">Item</th><th className="font-medium">Total</th><th className="font-medium">Reservado</th><th className="font-medium">Disponível</th></tr></thead><tbody>{mockInventory.slice(0, 4).map((row) => <tr key={row.id} className="border-t border-border"><td className="py-3 font-medium"><span className="mr-3 inline-grid h-9 w-9 place-items-center rounded-lg bg-sand text-brand"><InventoryIcon kind={row.icon} /></span>{row.item}</td><td>{row.total}</td><td className="text-danger">{row.reserved}</td><td className="font-medium text-success">{row.available}</td></tr>)}</tbody></table></div></article>
    </section>

    <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_.94fr_.72fr]">
      <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"><SectionTitle icon={Zap}>Ações rápidas</SectionTitle><div className="grid grid-cols-2 gap-3 p-4">{[
        { label: "Criar novo evento", icon: CalendarDays, tone: "bg-blush", action: () => openModal("event") },
        { label: "Adicionar item ao estoque", icon: PackageCheck, tone: "bg-sage", action: () => openModal("inventory") },
        { label: "Gerar proposta PDF", icon: FileText, tone: "bg-sand", action: () => openModal("proposal") },
        { label: "Cadastrar cliente", icon: UserPlus, tone: "bg-peach", action: () => openModal("client") },
      ].map(({ label, icon: Icon, tone, action }) => <Button key={label} className={`min-h-[68px] justify-between px-4 text-left text-sm ${tone}`} onClick={action}><span className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-card/75 text-brand shadow-soft"><Icon className="h-5 w-5 stroke-[1.7]" /></span>{label}</span><ArrowRight className="h-4 w-4 shrink-0" /></Button>)}</div></article>

      <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"><SectionTitle icon={ClipboardList} action="Ver todas" onAction={() => navigate("Propostas")}>Propostas recentes</SectionTitle><div className="px-4">{mockProposals.slice(0, 3).map((proposal) => <div key={proposal.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-2.5 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{proposal.client}</p><p className="text-xs text-muted-foreground">{proposal.event}</p></div><div className="flex items-center gap-2"><strong className="hidden text-xs font-semibold sm:block">{proposal.price}</strong><Button className="h-8 bg-sand px-3 text-xs" onClick={() => announce(`Prévia do PDF ${proposal.code}`)}>Gerar PDF</Button></div></div>)}</div></article>

      <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"><SectionTitle icon={Bell}>Alertas importantes</SectionTitle><div className="px-4">{mockAlerts.map((alert) => { const Icon = alert.kind === "danger" ? AlertTriangle : alert.kind === "warning" ? Clock : FileText; const tone = alert.kind === "danger" ? "bg-blush text-danger" : alert.kind === "warning" ? "bg-sand text-brand" : "bg-sage text-success"; return <Button key={alert.id} className="grid min-h-[54px] w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-border px-0 text-left text-xs last:border-0" onClick={() => announce(alert.title)}><span className={`grid h-8 w-8 place-items-center rounded-full ${tone}`}><Icon className="h-4 w-4" /></span><span>{alert.title}</span><ArrowRight className="h-4 w-4" /></Button>; })}</div></article>
    </section>
    <p className="mt-5 text-right font-display text-lg italic text-brand/70">Sonhe. Planeje. Encante.</p>
  </>;
}

function EventsPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const [status, setStatus] = useState("Todos");
  const list = useMemo(() => mockEvents.filter((event) => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    const matchesSearch = !q || `${event.title} ${event.client} ${event.place}`.toLocaleLowerCase("pt-BR").includes(q);
    return matchesSearch && (status === "Todos" || event.status === status);
  }), [query, status]);
  return <><PageHeader eyebrow="Agenda" title="Eventos" description="Acompanhe os próximos eventos e encontre rapidamente o que precisa preparar." action="Novo evento" onAction={() => openModal("event")} />
    <div className="mb-4 flex flex-wrap gap-2">{["Todos", "Confirmado", "Em preparação", "Proposta enviada", "Concluído"].map((item) => <Button key={item} variant={status === item ? "primary" : "outline"} className="h-9 px-3 text-xs" onClick={() => setStatus(item)}>{item}</Button>)}</div>
    <div className="grid gap-3">{list.map((event) => <article key={event.id} className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-soft sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center"><div className="rounded-lg bg-peach py-3 text-center"><div className="font-display text-3xl leading-none">{event.day}</div><div className="mt-1 text-xs font-semibold text-muted-foreground">{event.month}</div></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl font-semibold">{event.title}</h2><StatusBadge status={event.status} /></div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.client}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.place}</span><span>{event.guests} convidados</span><span>{event.items} itens</span></div><p className="mt-2 text-xs text-muted-foreground">Retirada {event.pickup} · Devolução {event.returnDate}</p></div><Button variant="outline" className="h-10 px-4 text-xs" onClick={() => announce(`Detalhes de ${event.title}`)}>Ver evento<ArrowRight className="h-4 w-4" /></Button></article>)}{!list.length && <EmptyOrNotice title="Nenhum evento encontrado" text="Tente remover algum filtro ou buscar por outro cliente, local ou evento." />}</div>
  </>;
}

function InventoryPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...Array.from(new Set(mockInventory.map((item) => item.category)))];
  const list = useMemo(() => mockInventory.filter((item) => { const q = query.trim().toLocaleLowerCase("pt-BR"); return (!q || `${item.item} ${item.category}`.toLocaleLowerCase("pt-BR").includes(q)) && (category === "Todos" || item.category === category); }), [query, category]);
  return <><PageHeader eyebrow="Materiais" title="Estoque" description="Veja o que está disponível, reservado ou em manutenção sem complicação." action="Adicionar item" onAction={() => openModal("inventory")} />
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <Button key={item} variant={category === item ? "primary" : "outline"} className="h-9 shrink-0 px-3 text-xs" onClick={() => setCategory(item)}>{item}</Button>)}</div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{list.map((item) => <article key={item.id} className="rounded-lg border border-border bg-card p-4 shadow-soft"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-sand text-brand"><InventoryIcon kind={item.icon} className="h-6 w-6 stroke-[1.6]" /></div><div><h2 className="font-display text-xl font-semibold">{item.item}</h2><p className="text-xs text-muted-foreground">{item.category}</p></div></div><Button variant="icon" className="h-9 w-9" aria-label={`Opções de ${item.item}`} onClick={() => announce(`Opções de ${item.item}`)}><MoreHorizontal className="h-5 w-5" /></Button></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg bg-muted px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p><p className="mt-1 font-display text-2xl">{item.total}</p></div><div className="rounded-lg bg-blush px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-danger">Reservado</p><p className="mt-1 font-display text-2xl text-danger">{item.reserved}</p></div><div className="rounded-lg bg-sage px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-success">Disponível</p><p className="mt-1 font-display text-2xl text-success">{item.available}</p></div></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs"><span className="text-muted-foreground">Retorno mais próximo</span><strong>{item.nextReturn}</strong></div>{item.maintenance > 0 && <div className="mt-2 flex items-center gap-2 rounded-md bg-sand px-3 py-2 text-xs text-brand"><AlertTriangle className="h-4 w-4" />{item.maintenance} em manutenção</div>}<Button variant="outline" className="mt-3 h-9 w-full text-xs" onClick={() => announce(`Disponibilidade de ${item.item}`)}>Ver disponibilidade</Button></article>)}{!list.length && <div className="sm:col-span-2 xl:col-span-3"><EmptyOrNotice title="Nada por aqui" text="Nenhum item corresponde aos filtros atuais." /></div>}</div>
  </>;
}

function ProposalsPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const [status, setStatus] = useState("Todas");
  const list = useMemo(() => mockProposals.filter((proposal) => { const q = query.trim().toLocaleLowerCase("pt-BR"); return (!q || `${proposal.client} ${proposal.event} ${proposal.code}`.toLocaleLowerCase("pt-BR").includes(q)) && (status === "Todas" || proposal.status === status); }), [query, status]);
  return <><PageHeader eyebrow="Comercial" title="Propostas" description="Organize orçamentos, acompanhe respostas e gere uma prévia do PDF." action="Nova proposta" onAction={() => openModal("proposal")} />
    <div className="mb-4 flex gap-2">{["Todas", "Pendente", "Aprovada", "Rascunho"].map((item) => <Button key={item} variant={status === item ? "primary" : "outline"} className="h-9 px-3 text-xs" onClick={() => setStatus(item)}>{item}</Button>)}</div>
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft"><div className="hidden grid-cols-[90px_minmax(0,1fr)_170px_130px_120px_auto] gap-4 border-b border-border bg-muted/55 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid"><span>Proposta</span><span>Cliente / evento</span><span>Data</span><span>Valor</span><span>Status</span><span /></div>{list.map((proposal) => <div key={proposal.id} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 lg:grid-cols-[90px_minmax(0,1fr)_170px_130px_120px_auto] lg:items-center"><strong className="text-sm text-brand">{proposal.code}</strong><div><p className="text-sm font-semibold">{proposal.client}</p><p className="text-xs text-muted-foreground">{proposal.event}</p></div><p className="text-xs"><CalendarDays className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />{proposal.eventDate}</p><strong className="text-sm">{proposal.price}</strong><StatusBadge status={proposal.status} /><div className="flex gap-2"><Button className="h-9 bg-sand px-3 text-xs" onClick={() => announce(`PDF ${proposal.code} pronto para prévia`)}><FileText className="h-4 w-4" />Gerar PDF</Button><Button variant="icon" className="h-9 w-9" aria-label="Mais opções" onClick={() => announce(`Opções ${proposal.code}`)}><MoreHorizontal className="h-5 w-5" /></Button></div></div>)}{!list.length && <div className="p-5"><EmptyOrNotice title="Nenhuma proposta encontrada" text="Tente outro filtro ou crie uma nova proposta." /></div>}</div>
  </>;
}

function ClientsPage({ query, openModal, announce }: { query: string; openModal: (kind: Exclude<ModalKind, null>) => void; announce: (message: string) => void }) {
  const list = useMemo(() => { const q = query.trim().toLocaleLowerCase("pt-BR"); return mockClients.filter((client) => !q || `${client.name} ${client.phone} ${client.email}`.toLocaleLowerCase("pt-BR").includes(q)); }, [query]);
  return <><PageHeader eyebrow="Relacionamento" title="Clientes" description="Contatos e histórico básico para você encontrar cada cliente rapidamente." action="Novo cliente" actionIcon={UserPlus} onAction={() => openModal("client")} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{list.map((client) => <article key={client.id} className="rounded-lg border border-border bg-card p-4 shadow-soft"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-avatar font-display text-lg font-semibold text-brand">{client.initials}</div><div className="min-w-0"><h2 className="truncate font-display text-xl font-semibold">{client.name}</h2><p className="text-xs text-muted-foreground">{client.events} {client.events === 1 ? "evento" : "eventos"}</p></div></div><div className="mt-4 space-y-2 border-t border-border pt-3 text-xs"><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" />{client.phone}</p><p className="flex min-w-0 items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-brand" /><span className="truncate">{client.email}</span></p><p className="flex items-center justify-between pt-1 text-muted-foreground"><span>Próximo/último evento</span><strong className="text-foreground">{client.lastEvent}</strong></p></div><Button variant="outline" className="mt-4 h-9 w-full text-xs" onClick={() => announce(`Histórico de ${client.name}`)}>Ver histórico</Button></article>)}{!list.length && <div className="sm:col-span-2 xl:col-span-3"><EmptyOrNotice title="Cliente não encontrado" text="Você pode buscar por nome, telefone ou e-mail." /></div>}</div>
  </>;
}

function SettingsPage({ announce }: { announce: (message: string) => void }) {
  return <><PageHeader eyebrow="Preferências" title="Configurações" description="Dados que futuramente poderão aparecer nas propostas e documentos da empresa." />
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><section className="rounded-lg border border-border bg-card p-5 shadow-soft"><h2 className="font-display text-2xl font-semibold">Dados da empresa</h2><p className="mt-1 text-xs text-muted-foreground">Esta tela é apenas visual nesta versão de validação.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nome da empresa" defaultValue="Atelier Priscila Gefune" /><Field label="Responsável" defaultValue="Priscila Gefune" /><Field label="Telefone" defaultValue="(43) 9.9603-7351" /><Field label="E-mail" placeholder="E-mail da empresa" /><div className="sm:col-span-2"><Field label="Endereço" placeholder="Endereço da empresa" /></div><div className="sm:col-span-2"><label className="text-xs font-semibold text-muted-foreground">Mensagem das propostas</label><textarea defaultValue="Criamos eventos com cuidado em cada detalhe para transformar momentos em memórias inesquecíveis." className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></div></div><Button variant="primary" className="mt-5 h-10 px-5" onClick={() => announce("Configurações simuladas salvas")}>Salvar alterações</Button></section>
      <aside className="rounded-lg border border-border bg-card p-5 shadow-soft"><h2 className="font-display text-2xl font-semibold">Identidade da proposta</h2><div className="mt-4 rounded-xl bg-peach p-5"><Brand /><div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-soft"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Proposta comercial</p><h3 className="mt-2 font-display text-2xl">Casamento Ana & Lucas</h3><p className="mt-1 text-xs text-muted-foreground">Uma pequena prévia de como a marca poderá aparecer nos PDFs.</p><div className="mt-5 h-px bg-border" /><div className="mt-4 flex items-end justify-between"><span className="text-xs text-muted-foreground">Investimento</span><strong className="font-display text-2xl">R$ 18.750</strong></div></div></div></aside>
    </div>
  </>;
}

function Field({ label, defaultValue, type = "text", placeholder }: { label: string; defaultValue?: string; type?: string; placeholder?: string }) {
  return <label className="block"><span className="text-xs font-semibold text-muted-foreground">{label}</span><input type={type} defaultValue={defaultValue} placeholder={placeholder} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" /></label>;
}

function MockModal({ kind, onClose, announce }: { kind: Exclude<ModalKind, null>; onClose: () => void; announce: (message: string) => void }) {
  const content = {
    event: { eyebrow: "Novo evento", title: "Vamos organizar o próximo evento", icon: CalendarDays, button: "Salvar evento", fields: ["Cliente", "Nome do evento", "Data do evento", "Local"] },
    inventory: { eyebrow: "Novo item", title: "Adicionar ao estoque", icon: PackageCheck, button: "Adicionar item", fields: ["Nome do item", "Categoria", "Quantidade total", "Valor de locação"] },
    proposal: { eyebrow: "Nova proposta", title: "Criar proposta comercial", icon: FileText, button: "Montar proposta", fields: ["Cliente", "Evento", "Data do evento", "Valor estimado"] },
    client: { eyebrow: "Novo cliente", title: "Cadastrar cliente", icon: UserPlus, button: "Salvar cliente", fields: ["Nome", "Telefone", "E-mail", "Observação"] },
  }[kind];
  const Icon = content.icon;
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay px-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-elevated"><div className="flex items-start justify-between border-b border-border bg-peach px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{content.eyebrow}</p><h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold"><Icon className="h-5 w-5 text-brand" />{content.title}</h2></div><Button variant="icon" className="h-9 w-9" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></Button></div><div className="grid gap-4 p-5 sm:grid-cols-2">{content.fields.map((label, index) => <Field key={label} label={label} type={label.includes("Data") ? "date" : label.includes("Quantidade") || label.includes("Valor") ? "number" : "text"} placeholder={index === 0 ? "Digite ou selecione" : undefined} />)}{kind === "event" && <><Field label="Retirada" type="date" /><Field label="Devolução" type="date" /></>}{kind === "inventory" && <div className="sm:col-span-2 rounded-lg bg-sage px-4 py-3 text-xs text-success"><Check className="mr-2 inline h-4 w-4" />Depois, fotos e detalhes avançados poderão ser adicionados.</div>}</div><div className="flex justify-end gap-2 border-t border-border px-5 py-4"><Button variant="outline" className="h-10 px-4" onClick={onClose}>Cancelar</Button><Button variant="primary" className="h-10 px-5" onClick={() => { announce(`${content.button} — simulação concluída`); onClose(); }}>{content.button}</Button></div></div></div>;
}

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<Page>("Início");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<ModalKind>(null);

  const announce = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const navigate = (page: Page) => { setActive(page); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <div className="min-h-screen bg-background text-foreground">
    <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={active} onSelect={navigate} />
    <div className="lg:pl-[264px]">
      <header className="sticky top-0 z-20 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:px-7"><Button variant="icon" className="h-10 w-10 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button><label className="relative min-w-0 max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" placeholder={active === "Início" ? "Buscar eventos, clientes ou itens..." : `Buscar em ${active.toLocaleLowerCase("pt-BR")}...`} /></label><div className="flex shrink-0 items-center gap-1 sm:gap-3"><Button variant="primary" className="h-10 px-3 sm:px-5" onClick={() => setModal("event")}><Plus className="h-4 w-4" /><span className="hidden sm:inline">Novo evento</span></Button><Button variant="icon" className="relative h-10 w-10" aria-label="Notificações" onClick={() => announce("Você tem 3 alertas importantes")}><Bell className="h-5 w-5" /><span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-danger" /></Button><Button className="mobile-profile h-11 px-2" onClick={() => announce("Perfil de Priscila Gefune — demonstração")}><span className="grid h-8 w-8 place-items-center rounded-full bg-avatar font-display text-sm font-semibold text-primary">PG</span><span>Olá, Priscila Gefune</span><ChevronDown className="h-4 w-4" /></Button></div></header>
      <main className="mx-auto max-w-[1600px] px-4 pb-9 pt-5 sm:px-6 lg:px-7">
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
    {notice && <div role="status" className="fixed bottom-5 right-5 z-[80] flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-md border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-elevated"><Sparkles className="h-4 w-4 shrink-0 text-brand" />{notice}</div>}
  </div>;
}
