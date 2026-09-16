export type EventStatus = "Confirmado" | "Em preparação" | "Proposta enviada" | "Concluído";
export type ProposalStatus = "Pendente" | "Aprovada" | "Rascunho";

export const mockEvents = [
  { id: "evt-001", date: "2026-09-20", day: "20", month: "SET", title: "Casamento Ana & Lucas", client: "Ana Souza", type: "Casamento", place: "Espaço Villa Garden", status: "Confirmado" as EventStatus, guests: 160, pickup: "18/09/2026", returnDate: "21/09/2026", items: 243 },
  { id: "evt-002", date: "2026-09-27", day: "27", month: "SET", title: "15 anos Beatriz", client: "Beatriz Lima", type: "Aniversário", place: "Buffet Saint Claire", status: "Em preparação" as EventStatus, guests: 120, pickup: "25/09/2026", returnDate: "28/09/2026", items: 186 },
  { id: "evt-003", date: "2026-10-03", day: "03", month: "OUT", title: "Evento Corporativo TechSul", client: "TechSul Inc.", type: "Corporativo", place: "Centro de Convenções", status: "Confirmado" as EventStatus, guests: 220, pickup: "01/10/2026", returnDate: "04/10/2026", items: 315 },
  { id: "evt-004", date: "2026-10-10", day: "10", month: "OUT", title: "Noivado Carla & Bruno", client: "Carla Mendes", type: "Noivado", place: "Casa Oliva Eventos", status: "Proposta enviada" as EventStatus, guests: 80, pickup: "09/10/2026", returnDate: "11/10/2026", items: 96 },
  { id: "evt-005", date: "2026-08-29", day: "29", month: "AGO", title: "Casamento Júlia & Pedro", client: "Júlia Costa", type: "Casamento", place: "Quinta das Flores", status: "Concluído" as EventStatus, guests: 190, pickup: "27/08/2026", returnDate: "30/08/2026", items: 278 },
];

export const mockInventory = [
  { id: "inv-001", item: "Mesas redondas", category: "Mobiliário", total: 200, reserved: 20, maintenance: 0, available: 180, price: 40, nextReturn: "21/09/2026", icon: "table" },
  { id: "inv-002", item: "Cadeiras Tiffany", category: "Mobiliário", total: 500, reserved: 80, maintenance: 0, available: 420, price: 18, nextReturn: "21/09/2026", icon: "chair" },
  { id: "inv-003", item: "Toalhas brancas", category: "Têxteis", total: 300, reserved: 30, maintenance: 12, available: 258, price: 22, nextReturn: "18/09/2026", icon: "linen" },
  { id: "inv-004", item: "Vasos decorativos", category: "Decoração", total: 150, reserved: 12, maintenance: 5, available: 133, price: 35, nextReturn: "22/09/2026", icon: "vase" },
  { id: "inv-005", item: "Sousplats dourados", category: "Mesa posta", total: 420, reserved: 160, maintenance: 0, available: 260, price: 9, nextReturn: "21/09/2026", icon: "plate" },
  { id: "inv-006", item: "Painéis ripados", category: "Estruturas", total: 12, reserved: 4, maintenance: 1, available: 7, price: 280, nextReturn: "28/09/2026", icon: "panel" },
  { id: "inv-007", item: "Casticais altos", category: "Decoração", total: 96, reserved: 24, maintenance: 0, available: 72, price: 16, nextReturn: "21/09/2026", icon: "decor" },
  { id: "inv-008", item: "Guardanapos rosé", category: "Têxteis", total: 360, reserved: 120, maintenance: 0, available: 240, price: 6, nextReturn: "28/09/2026", icon: "linen" },
];

export const mockProposals = [
  { id: "prop-1025", code: "#1025", client: "Carla Mendes", event: "Casamento", eventDate: "18/10/2026", price: "R$ 18.750", status: "Pendente" as ProposalStatus, updatedAt: "Hoje, 14:32" },
  { id: "prop-1024", code: "#1024", client: "Ricardo Almeida", event: "Evento Corporativo", eventDate: "25/10/2026", price: "R$ 12.400", status: "Aprovada" as ProposalStatus, updatedAt: "Ontem, 17:10" },
  { id: "prop-1023", code: "#1023", client: "Juliana Costa", event: "15 anos", eventDate: "01/11/2026", price: "R$ 9.800", status: "Pendente" as ProposalStatus, updatedAt: "12/09, 09:20" },
  { id: "prop-1022", code: "#1022", client: "Fernanda Rocha", event: "Noivado", eventDate: "08/11/2026", price: "R$ 7.600", status: "Rascunho" as ProposalStatus, updatedAt: "10/09, 16:45" },
];

export const mockClients = [
  { id: "cli-001", name: "Ana Souza", phone: "(11) 98840-2231", email: "ana.souza@email.com", events: 2, lastEvent: "20/09/2026", initials: "AS" },
  { id: "cli-002", name: "Beatriz Lima", phone: "(11) 99621-4480", email: "beatriz@email.com", events: 1, lastEvent: "27/09/2026", initials: "BL" },
  { id: "cli-003", name: "Carla Mendes", phone: "(11) 99108-3112", email: "carla.mendes@email.com", events: 3, lastEvent: "18/10/2026", initials: "CM" },
  { id: "cli-004", name: "Ricardo Almeida", phone: "(11) 98220-7318", email: "ricardo@techcorp.com", events: 4, lastEvent: "25/10/2026", initials: "RA" },
  { id: "cli-005", name: "Juliana Costa", phone: "(11) 99774-5589", email: "juliana.costa@email.com", events: 2, lastEvent: "01/11/2026", initials: "JC" },
  { id: "cli-006", name: "Fernanda Rocha", phone: "(11) 98431-9072", email: "fernanda.rocha@email.com", events: 1, lastEvent: "08/11/2026", initials: "FR" },
];

export const mockAlerts = [
  { id: "alert-1", kind: "danger", title: "Faltam 40 cadeiras Tiffany para 20/09", detail: "Evento: Casamento Ana & Lucas" },
  { id: "alert-2", kind: "warning", title: "12 toalhas retornam em 18/09", detail: "Entrada prevista antes do próximo evento" },
  { id: "alert-3", kind: "success", title: "1 proposta aguarda resposta", detail: "Carla Mendes · há 4 dias" },
];
