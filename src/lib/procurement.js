import { MENU_LIBRARY } from '@/data/mock'

// Blueprint §4 — menu segregation into prep groups.
export const PREP_GROUPS = [
  { id: 'vegChef', label: 'Veg Chef', desc: 'Veg mains, dal, breads, desserts' },
  { id: 'nonVegChef', label: 'Non-Veg Chef', desc: 'Mutton/chicken mains, biryani, signature' },
  { id: 'starterVendor', label: 'Starter Vendors', desc: 'Sourced externally, per agreed unit' },
  { id: 'specialSupplier', label: 'Special Suppliers', desc: 'Ice cream, drinks, mocktails' },
]

export const prepGroupById = (id) => PREP_GROUPS.find((g) => g.id === id) ?? PREP_GROUPS[0]

export const SECTION_TO_GROUP = {
  'Zafraan Signature': 'nonVegChef',
  'Non-Veg Starters': 'starterVendor',
  'Mutton — Main Course': 'nonVegChef',
  'Chicken — Main Course': 'nonVegChef',
  'Fish & Prawns': 'nonVegChef',
  'Shorba': 'nonVegChef',
  'Biryani & Rice': 'nonVegChef',
  'Veg Starters & Snacks': 'starterVendor',
  'Vegetarian — Main Course': 'vegChef',
  'Dal & Tawa': 'vegChef',
  'Roti ki Tokri': 'vegChef',
  'Soups': 'vegChef',
  'Desserts': 'vegChef',
  'After Dinner': 'specialSupplier',
}

export const groupForSection = (section) => SECTION_TO_GROUP[section] ?? 'vegChef'

// Flat dish index for pickers and import matching.
export const ALL_DISHES = MENU_LIBRARY.flatMap((s) =>
  s.items.map((dish) => ({ dish, section: s.section, group: groupForSection(s.section) }))
)

// Blueprint §5 — raw material / procurement estimation.
// Quantities are rough per-guest estimates — replace with the real standard-quantity DB later.
export function generateProcurement(booking) {
  const g = booking.guests ?? 0
  const vg = booking.pax?.veg ?? Math.round(g * 0.35)
  const nvg = Math.max(g - vg, 0)
  const menu = booking.menuItems ?? []
  const byGroup = (id) => menu.filter((m) => m.group === id)
  const kg = (x) => `${Math.round(x * 10) / 10} kg`
  const L = (x) => `${Math.round(x)} L`
  const pcs = (x) => `${Math.ceil(x)} pcs`

  const hasDessert = menu.some((m) => /kheer|halwa|tukda|zarda|doodh|rabdi/i.test(m.dish))
  const hasPaneer = menu.some((m) => /paneer/i.test(m.dish))
  const hasBiryani = menu.some((m) => /biryani|pulao|pulav/i.test(m.dish))

  const nonVegDishes = byGroup('nonVegChef')
  const starters = byGroup('starterVendor')
  const specials = byGroup('specialSupplier')

  return [
    // Dish-level vendor orders — actual menu items routed to the supplying vendor.
    ...(starters.length ? [{
      id: 'starter-order',
      label: 'Starter Order — vendor',
      category: 'Starter Vendor',
      items: starters.map((m) => ({ label: m.dish, qty: pcs(g) })),
    }] : []),
    ...(specials.length ? [{
      id: 'special-order',
      label: 'Special Supplier Order',
      category: 'Special Supplier',
      items: specials.map((m) => ({ label: m.dish, qty: pcs(g) })),
    }] : []),
    {
      id: 'nonveg',
      label: 'Non-Veg Material',
      category: 'Non-Veg Material',
      items: [
        ...nonVegDishes.map((m) => ({
          label: `${m.dish} — raw material`,
          qty: kg(Math.max(nvg, 10) * 0.12 / Math.max(nonVegDishes.length, 1)),
        })),
        { label: 'Marinade & whole spices', qty: 'per menu' },
      ],
    },
    {
      id: 'grocery',
      label: 'Dor Rashan / Grocery',
      category: 'Grocery',
      items: [
        ...(hasBiryani ? [{ label: 'Basmati rice', qty: kg(g * 0.08) }] : []),
        { label: 'Atta / maida (breads)', qty: kg(g * 0.05) },
        { label: 'Cooking oil + ghee', qty: L(g * 0.05) },
        { label: 'Dal & staples', qty: kg(g * 0.04) },
        { label: 'Spices, sugar, salt', qty: 'per menu' },
      ],
    },
    {
      id: 'dairy',
      label: 'Dairy',
      category: 'Dairy',
      items: [
        ...(hasDessert ? [{ label: 'Milk (kheer / halwa / doodh)', qty: L(g * 0.08) }] : [{ label: 'Milk', qty: L(g * 0.03) }]),
        { label: 'Khoya / cream', qty: kg(g * 0.02) },
        ...(hasPaneer ? [{ label: 'Paneer', qty: kg(vg * 0.08) }] : []),
        { label: 'Dahi / curd', qty: kg(g * 0.03) },
      ],
    },
    {
      id: 'veg-vegchef',
      label: 'Vegetables — Pack 1: Veg Chef',
      category: 'Vegetables',
      items: [
        { label: 'Onion', qty: kg(vg * 0.10) },
        { label: 'Tomato', qty: kg(vg * 0.08) },
        { label: 'Potato & seasonal veg', qty: kg(vg * 0.10) },
        { label: 'Ginger-garlic, green chilli, coriander', qty: 'per menu' },
      ],
    },
    {
      id: 'veg-nonvegchef',
      label: 'Vegetables — Pack 2: Non-Veg Chef',
      category: 'Vegetables',
      items: [
        { label: 'Onion (gravies)', qty: kg(nvg * 0.10) },
        { label: 'Tomato', qty: kg(nvg * 0.06) },
        { label: 'Ginger-garlic paste', qty: kg(nvg * 0.03) },
        { label: 'Coriander, mint, lemon', qty: 'per menu' },
      ],
    },
    {
      id: 'veg-salad',
      label: 'Vegetables — Pack 3: Salad',
      category: 'Vegetables',
      items: [
        { label: 'Cucumber', qty: pcs(g * 0.3) },
        { label: 'Tomato (salad)', qty: kg(g * 0.04) },
        { label: 'Onion (salad)', qty: kg(g * 0.04) },
        { label: 'Lemon, green chilli, chaat masala', qty: 'per counter' },
      ],
    },
    {
      id: 'icecream',
      label: 'Ice Cream',
      category: 'Ice Cream',
      items: specials.length
        ? specials.map((m) => ({ label: m.dish, qty: pcs(g) }))
        : [{ label: 'Ice cream / kulfi (if on menu)', qty: pcs(g) }],
    },
    {
      id: 'drinks',
      label: 'Drinks & Mocktails',
      category: 'Drinks & Mocktails',
      items: [
        { label: 'Cold drinks (assorted)', qty: `${Math.ceil(g / 3)} bottles` },
        { label: 'Welcome drink / mocktail setup', qty: 'per package' },
        { label: 'Saar / jaar water, jaljeera', qty: 'per counter' },
        { label: 'Drinking water', qty: `${Math.ceil(g * 0.5)} bottles` },
      ],
    },
    {
      id: 'disposables',
      label: 'Disposables',
      category: 'Disposables',
      items: [
        { label: 'Plates', qty: pcs(g * 1.2) },
        { label: 'Glasses & cups', qty: pcs(g * 1.5) },
        { label: 'Napkins, toothpicks', qty: 'per counter' },
        { label: 'Packing boxes & foil', qty: 'as needed' },
        { label: 'Garbage bags', qty: pcs(20) },
      ],
    },
  ]
}

// Blueprint §6 — WhatsApp dispatch.
export const waNumber = (phone) => (phone || '').replace(/\D/g, '')

export function procurementMessage(booking, group) {
  const lines = [
    `*Muqim Caterer's — ${booking.ref}*`,
    `*${group.label}*`,
    `Event: ${booking.eventType} · ${new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${booking.guests} pax`,
    `Venue: ${booking.venue}`,
    '',
    ...group.items.map((i) => `• ${i.label} — ${i.qty}`),
    '',
    'Please confirm availability & rates. — Muqim',
  ]
  return lines.join('\n')
}

export const waLink = (phone, text) => `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`

// Blueprint §3 — menu import: simulated OCR output for the review step.
export const MOCK_OCR_RESULT = [
  { raw: 'Kakori Seekh Kebab', dish: 'Kakori Seekh Kebab', confidence: 'high' },
  { raw: 'Mutton Korma', dish: 'Mutton Qourma', confidence: 'medium' },
  { raw: 'Chiken Biryani', dish: 'Lucknowi Chicken Biryani', confidence: 'medium' },
  { raw: 'Sheermal', dish: 'Sheermal', confidence: 'high' },
  { raw: 'Gulab Jamun', dish: 'Gulab Jamun', confidence: 'high' },
  { raw: 'Paneer item — unclear', dish: null, confidence: 'low' },
]
