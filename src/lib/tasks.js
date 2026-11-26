// Task engine, readiness and estimate helpers — per the functional blueprint.
// Tasks live inside the booking object (jsonb) so no schema change is needed.

// ─── Task templates — spawn on status transitions ───────────────────────────
// dueInDays: offset from the transition date (negative = days before event date)
export const TASK_TEMPLATES = {
  inquiry: [
    { tpl: 'assign', title: 'Assign lead to a staff member', role: 'sales', dueInDays: 0 },
    { tpl: 'contact', title: 'Contact customer — record requirements', role: 'sales', dueInDays: 1 },
    { tpl: 'followup', title: 'Follow-up call / message', role: 'sales', dueInDays: 3 },
  ],
  quoted: [
    { tpl: 'quote-followup', title: 'Follow up on quotation approval', role: 'sales', dueInDays: 2 },
    { tpl: 'advance', title: 'Collect advance on approval', role: 'accounts', dueInDays: 4 },
  ],
  confirmed: [
    { tpl: 'coordinator', title: 'Assign event coordinator', role: 'coordinator', dueInDays: 0 },
    { tpl: 'menu-approve', title: 'Finalise and approve menu version', role: 'coordinator', dueInDays: 2 },
    { tpl: 'segregate', title: 'Review menu segregation groups', role: 'coordinator', dueInDays: 2 },
    { tpl: 'procure', title: 'Generate & review procurement lists', role: 'procurement', dueInDays: 3 },
    { tpl: 'manpower', title: 'Confirm manpower count & roles', role: 'service', dueInDays: 4 },
  ],
  prep: [
    { tpl: 'vendor-confirm', title: 'Confirm all vendor acknowledgments', role: 'procurement', dueInDays: 0 },
    { tpl: 'veg-packs', title: 'Verify 3 vegetable packs (veg / non-veg / salad)', role: 'procurement', dueInDays: 1 },
    { tpl: 'logistics', title: 'Complete logistics checklist', role: 'service', dueInDays: 1 },
    { tpl: 'readiness', title: 'Readiness review — clear blockers', role: 'coordinator', dueInDays: 1 },
  ],
  delivered: [
    { tpl: 'leftover-exp', title: 'Next-day: collect leftover/unrecorded expenses', role: 'accounts', dueInDays: 1 },
    { tpl: 'vendor-payments', title: 'Verify vendor payments & balances', role: 'accounts', dueInDays: 1 },
    { tpl: 'customer-balance', title: 'Collect remaining customer balance', role: 'accounts', dueInDays: 1 },
    { tpl: 'reconcile', title: 'Reconcile event — generate closing report', role: 'accounts', dueInDays: 2 },
  ],
}

export const spawnTasks = (status, b) => {
  const existing = new Set((b.tasks ?? []).map((t) => t.tpl))
  return (TASK_TEMPLATES[status] ?? [])
    .filter((t) => !existing.has(t.tpl))
    .map((t) => ({
      id: `${status}-${t.tpl}`,
      tpl: t.tpl,
      title: t.title,
      role: t.role,
      status: 'open',
      due: new Date(Date.now() + t.dueInDays * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    }))
}

// ─── Lead statuses (inquiry-stage pipeline) ─────────────────────────────────
export const LEAD_STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'menu_sent', label: 'Menu sent' },
  { id: 'selection', label: 'Selection received' },
  { id: 'quote_pending', label: 'Quotation pending' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'no_response', label: 'No response' },
  { id: 'lost', label: 'Lost' },
]
export const LEAD_SOURCES = ['Website / QR', 'WhatsApp', 'Instagram', 'Facebook', 'Referral', 'Walk-in / Call', 'Staff entry']

// ─── Readiness — computed from the event file ───────────────────────────────
export const EXPENSE_CATEGORIES = [
  { id: 'rawMaterial', label: 'Raw material' },
  { id: 'chefs', label: 'Chefs / preparation' },
  { id: 'starterVendors', label: 'Starter vendors' },
  { id: 'iceCream', label: 'Ice cream' },
  { id: 'drinks', label: 'Drinks / mocktails' },
  { id: 'manpower', label: 'Manpower' },
  { id: 'crockery', label: 'Crockery / counters' },
  { id: 'disposables', label: 'Disposables' },
  { id: 'gasWaterIce', label: 'Gas / water / ice' },
  { id: 'transport', label: 'Transport' },
  { id: 'misc', label: 'Miscellaneous' },
]

export const readiness = (b) => {
  const proc = b.procurement ?? []
  const sent = proc.filter((g) => ['sent', 'confirmed'].includes(g.status))
  const confirmed = proc.filter((g) => g.status === 'confirmed')
  const logisticsDone = (b.logistics ?? []).length
  const vegPacks = proc.filter((g) => g.id.startsWith('veg-'))
  const tasks = b.tasks ?? []
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const overdue = openTasks.filter((t) => new Date(t.due) < new Date())

  const rows = [
    { key: 'menu', label: 'Approved menu', ok: (b.menuItems ?? []).length > 0 && !!b.menuApproved, detail: b.menuApproved ? `v${b.menuVersions?.length ?? 1} approved` : `${(b.menuItems ?? []).length} dishes — not approved` },
    { key: 'segregation', label: 'Menu segregation', ok: (b.menuItems ?? []).every((m) => m.group) && (b.menuItems ?? []).length > 0, detail: `${new Set((b.menuItems ?? []).map((m) => m.group)).size} groups` },
    { key: 'coordinator', label: 'Coordinator assigned', ok: (b.staffIds ?? []).length > 0, detail: `${(b.staffIds ?? []).length} staff` },
    { key: 'procurement', label: 'Procurement generated', ok: proc.length > 0, detail: `${proc.length} lists` },
    { key: 'dispatch', label: 'Lists dispatched', ok: proc.length > 0 && sent.length === proc.length, detail: `${sent.length}/${proc.length} sent` },
    { key: 'ack', label: 'Vendor confirmations', ok: proc.length > 0 && confirmed.length === proc.length, detail: `${confirmed.length}/${proc.length} confirmed` },
    { key: 'vegPacks', label: 'Vegetable packs (3)', ok: vegPacks.length === 3 && vegPacks.every((p) => p.status === 'confirmed'), detail: `${vegPacks.filter((p) => p.status === 'confirmed').length}/3 confirmed` },
    { key: 'logistics', label: 'Service & logistics', ok: logisticsDone >= 20, detail: `${logisticsDone} items checked` },
    { key: 'tasks', label: 'Tasks clear', ok: overdue.length === 0, detail: overdue.length ? `${overdue.length} overdue` : `${openTasks.length} open` },
  ]
  const done = rows.filter((r) => r.ok).length
  return { rows, done, total: rows.length, pct: Math.round((done / rows.length) * 100), overdue }
}

// map legacy expense category strings → estimate category ids
const LEGACY_CAT_MAP = {
  Purchases: 'rawMaterial', Vendors: 'starterVendors', Labour: 'manpower',
  Transport: 'transport', Service: 'crockery', 'Misc.': 'misc',
}

// ─── Estimate vs actual ──────────────────────────────────────────────────────
export const actualByCategory = (b) => {
  const map = {}
  EXPENSE_CATEGORIES.forEach((c) => { map[c.id] = 0 })
  ;(b.expenses ?? []).forEach((e) => {
    const k = LEGACY_CAT_MAP[e.category] ?? e.category
    map[k] = (map[k] ?? 0) + e.amount
  })
  return map
}
export const estimateTotal = (b) => Object.values(b.estimate ?? {}).reduce((a, v) => a + (v || 0), 0)
export const actualTotal = (b) => (b.expenses ?? []).reduce((a, e) => a + e.amount, 0)
export const receiptsTotal = (b) => (b.receipts ?? []).reduce((a, r) => a + r.amount, 0)
