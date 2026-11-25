// Mock data layer — swap for a real API later without touching the UI.
// Packages, menu library and contact info sourced from the Muqim Caterer's 2024 handbill.

export const CONTACT = {
  name: 'Muqim Caterers',
  phones: ['+91 80042 08938', '+91 78007 25696'],
  email: 'hello@muqimcaterers.in',
  address: 'Hazratganj, Lucknow',
}

export const SERVICES = ['Semi Catering', 'Full Catering', 'Events', 'Theme Parties']

// From the blueprint: catering scope agreed with the customer.
export const CATERING_TYPES = [
  { id: 'full', label: 'Full Catering', desc: 'Complete food & catering scope' },
  { id: 'semi', label: 'Semi Catering', desc: 'Partial scope as agreed' },
  { id: 'service', label: 'Service Catering', desc: 'Service, crockery & agreed items only' },
]

export const cateringTypeById = (id) => CATERING_TYPES.find((c) => c.id === id) ?? CATERING_TYPES[0]

// Event ledger expense categories (blueprint §8).
export const EXPENSE_CATEGORIES = ['Purchases', 'Vendors', 'Labour', 'Transport', 'Service', 'Misc.']

export const BOOKING_STATUSES = [
  { id: 'inquiry', label: 'Inquiry', dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-800' },
  { id: 'quoted', label: 'Quoted', dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-800' },
  { id: 'confirmed', label: 'Confirmed', dot: 'bg-teal-500', badge: 'bg-teal-100 text-teal-800' },
  { id: 'prep', label: 'In Prep', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' },
  { id: 'delivered', label: 'Delivered', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800' },
  { id: 'done', label: 'Done', dot: 'bg-stone-400', badge: 'bg-stone-200 text-stone-700' },
]

export const statusById = (id) => BOOKING_STATUSES.find((s) => s.id === id) ?? BOOKING_STATUSES[0]

export const EVENT_TYPES = ['Wedding', 'Nikkah / Walima', 'Corporate', 'Birthday', 'Theme Party', 'Family Gathering', 'Other']

// Real packages from the handbill. Prices are placeholders — confirm actual rates.
export const PACKAGES = [
  {
    id: 'pkg-normal',
    name: 'Normal Package',
    badge: 'Essential',
    tier: 1,
    tagline: 'A complete spread for intimate functions and family gatherings',
    category: 'Full Catering',
    pricePerHead: 650,
    minGuests: 100,
    servesNote: 'Best for 100–300 guests',
    gradient: 'from-teal-700 via-teal-600 to-teal-400',
    tags: ['Buffet', 'Service included'],
    items: [
      '2 non-veg starters', '4 veg starters', '2 mutton dishes', '2 chicken dishes',
      '2 sweet dishes', '1 dessert', '1 hot drink', '1 cold drink',
      'Salad', 'Limited bottled water', 'Saar water', 'Service staff', 'Crockery',
    ],
  },
  {
    id: 'pkg-standard',
    name: 'Standard Package',
    badge: 'Most Popular',
    tier: 2,
    tagline: 'Our best-selling spread — cafeteria and LED counters included',
    category: 'Full Catering',
    pricePerHead: 900,
    minGuests: 150,
    servesNote: 'Best for 150–500 guests',
    gradient: 'from-teal-800 via-teal-600 to-gold-500',
    tags: ['Buffet', 'Cafeteria', 'LED counters', 'Welcome drink'],
    items: [
      '3 non-veg starters', '6 veg starters', '1 welcome drink', '2 mutton dishes',
      '3 chicken dishes', '2 sweet dishes', '2 desserts', 'Cafeteria',
      'Salad', '2 bottled water', 'Jaar water', 'Service staff', 'Crockery', 'LED counters',
    ],
  },
  {
    id: 'pkg-vip',
    name: 'VIP Package',
    badge: 'Premium',
    tier: 3,
    tagline: 'The full experience — fruit, paan and three salad varieties',
    category: 'Full Catering',
    pricePerHead: 1250,
    minGuests: 200,
    servesNote: 'Best for 200–1000 guests',
    gradient: 'from-stone-800 via-teal-800 to-gold-400',
    tags: ['Premium buffet', 'Fruit & paan', 'LED counters', 'Welcome drink'],
    items: [
      '3 non-veg starters', '7 veg starters', 'Welcome drink', '3 mutton dishes',
      '4 chicken dishes', '3 sweet dishes', '2 desserts', 'Cafeteria',
      'Fresh fruit', 'Paan', '3 types of salad', 'LED counters', 'Service staff', 'Crockery',
    ],
  },
  {
    id: 'pkg-speciality',
    name: 'Zafraan Speciality',
    badge: 'Signature',
    tier: 4,
    tagline: 'Our signature line — raan, musallam, haleem and khichda prepared the Zafraan way',
    category: 'Speciality',
    pricePerHead: 1600,
    minGuests: 250,
    servesNote: 'Made to order · discuss the spread with our head chef',
    gradient: 'from-stone-900 via-stone-800 to-gold-400',
    tags: ['Signature dishes', 'Chef-curated', 'LED counters'],
    items: [
      'Zafraan signature starters', '7 veg starters', 'Welcome drink', '3 mutton dishes',
      '4 chicken dishes', 'Signature mains (raan / musallam / haleem)', '3 sweet dishes',
      '2 desserts', 'Cafeteria', 'Fresh fruit', 'Paan', '3 types of salad',
      'LED counters', 'Service staff', 'Crockery',
    ],
  },
]

export const packageById = (id) => PACKAGES.find((p) => p.id === id)

// Full dish library from the handbill — customers pick within package counts.
export const MENU_LIBRARY = [
  {
    section: 'Zafraan Signature',
    items: [
      'Khichda', 'Tawa Chaap', 'Hyderabadi Haleem', 'Bakre Ki Raan', 'Bakra Musallam',
      'Lagan Bater', 'Bater Fry', 'Bater Musallam', 'Tawa Bheja', 'Tawa Kaleji', 'Qeema Kaju',
      'Soya Chaap Biryani', 'Achari Soya Chaap', 'Malai Soya Chaap', 'Veg Galawati Kebab',
      'Dimsums', 'Momos', 'Potli Samosa', 'Shawarma',
    ],
  },
  {
    section: 'Non-Veg Starters',
    items: [
      'Kakori Seekh Kebab', 'Nargisi Kofta', 'Cheese Kofta', 'Pasanda Kebab', 'Seekh Kaleji',
      'Seekh Boti', 'Kulhad Khichda', 'Chicken Tikka', 'Chicken Seekh Kebab', 'Chicken Tangdi Kebab',
      'Chicken Barra', 'Afghani Murgh Tikka', 'Hariyali Murgh Tikka', 'Chicken Reshmi Kebab',
      'Chicken Malai Tikka', 'Al Baik Chicken', 'Fried Chicken', 'Murgh Tandoori',
      'Chicken Spring Roll', 'Chicken Cutlet', 'Fried Mutton Chaap', 'Mutton Barra',
      'Fish Amritsari', 'Achari Fish Tikka', 'Fish Tikka', 'Fish Al Baik', 'Fish Fry', 'Fish Finger',
    ],
  },
  {
    section: 'Mutton — Main Course',
    items: [
      'Mutton Qourma', 'Mutton Stew', 'Mutton Mughlai', 'Mutton Rizala', 'Mutton Do Pyaza',
      'Mutton Achari', 'Mutton Kadhai', 'Mutton Nihari', 'Tawa Gosht', 'Boti Kebab',
      'Galawati Kebab', 'Mutton Bhuna Gosht', 'Moong Gosht', 'Chana Gosht',
    ],
  },
  {
    section: 'Chicken — Main Course',
    items: [
      'Murgh Qourma', 'Dum Ka Murgh', 'Murgh Do Pyaza', 'Murgh Mahi Tawa', 'Murgh Masala',
      'Murgh Kadhai', 'Chicken Tikka Masala', 'Chicken Chilli', 'Murgh Musallam', 'Butter Chicken',
      'Chicken Kali Mirch', 'Chicken Rizala', 'Chicken Achari', 'Chicken Changezi',
      'Chicken White Qourma', 'Chicken Haleem',
    ],
  },
  {
    section: 'Fish & Prawns',
    items: ['Fish Musallam', 'Fish Mahi Tawa', 'Fish Curry', 'Bengali Fish Curry', 'Prawns Curry'],
  },
  {
    section: 'Shorba',
    items: ['Chicken Shorba', 'Mutton Shorba', 'Paya Shorba', 'Chicken Lemon Coriander', 'Mutton Dhaniya Soup'],
  },
  {
    section: 'Biryani & Rice',
    items: [
      'Lucknowi Mutton Biryani', 'Lucknowi Chicken Biryani', 'Prawns Biryani', 'Fish Biryani',
      'Hyderabadi Mutton Biryani', 'Hyderabadi Chicken Biryani', 'Afghani Pulao',
      'Veg Biryani', 'Veg Pulao', 'Zeera Rice', 'Paneer Pulao', 'Mushroom Biryani',
      'Hyderabadi Veg Biryani', 'Matar Pulao',
    ],
  },
  {
    section: 'Veg Starters & Snacks',
    items: [
      'Paneer Seekh Kebab', 'Afghani Paneer Tikka', 'Achari Paneer Tikka', 'Paneer Chilli Dry',
      'Honey Chilli Potato', 'French Fries', 'Spring Roll', 'Hara Bhara Kebab',
      'Chatpati Chaat (Aloo / Matar)', 'Pyaaz Pakaudi', 'Paani Ke Batashe', 'Hakka Noodles',
      'Veg Fried Rice', 'Manchurian Dry', 'Veg Kofta', 'Pizza', 'Dosa', 'Pav Bhaji', 'Soya Chaap',
    ],
  },
  {
    section: 'Vegetarian — Main Course',
    items: [
      'Shahi Paneer', 'Kadhai Paneer', 'Palak Paneer', 'Paneer Butter Masala', 'Matar Paneer',
      'Paneer Do Pyaza', 'Paneer Bhurji', 'Paneer Korma', 'Kadhai Vegetable', 'Mix Vegetable',
      'Sarson Ka Saag', 'Gobhi Musallam', 'Bhindi Do Pyaza', 'Pindi Chola', 'Baigan Ka Bharta',
      'Zeera Aloo', 'Paneer Tikka Masala', 'Paneer Kali Mirch', 'Paneer Masala', 'Malai Kofta',
      'Chilli Paneer Gravy', 'Veg Manchurian Gravy', 'Dum Aloo Masala', 'Navratan Qourma',
    ],
  },
  {
    section: 'Dal & Tawa',
    items: [
      'Dal Tadka', 'Dal Fry', 'Rajma', 'Dal Makhni', 'Lauki Ka Dalcha', 'Pachmela Dal',
      'Kaddu Ka Dalcha', 'Veg Khichda', 'Bharwa Karela', 'Bharwa Shimla Mirch', 'Bharwa Parwal',
      'Bhindi Fry', 'Karela Fry', 'Tawa Sabzi',
    ],
  },
  {
    section: 'Roti ki Tokri',
    items: [
      'Sheermal', 'Ghilafi Kulcha', 'Dhaniya Roti', 'Peshawari Naan', 'Rumali Roti',
      'Mughlai Paratha', 'Laccha Paratha', 'Khameeri Roti', 'Bhatoora', 'Aloo Kulcha',
      'Paneer Kulcha', 'Makke Ki Roti', 'Butter Garlic Naan', 'Cheese Naan', 'Butter Naan',
      'Plain Naan', 'Tandoori Roti', 'Butter Roti', 'Missi Roti', 'Poori',
    ],
  },
  {
    section: 'Soups',
    items: [
      'Tomato Soup', 'Baby Corn Soup', 'Hot & Sweet Soup', 'Vegetable Soup',
      'Mushroom Soup', 'Cream Broccoli Soup', 'Hot Manchurian Soup',
    ],
  },
  {
    section: 'Desserts',
    items: [
      'Shahi Tukda', 'Zafrani Kheer', 'Akhrot Kheer', 'Gajar Halwa', 'Moong Halwa',
      'Channe Ka Halwa', 'Badaam Halwa', 'Pineapple Zarda', 'Gajar Seb Ki Kheer',
      'Lauki Halwa', 'Zarda', 'Meetha Dahi Bada',
    ],
  },
  {
    section: 'After Dinner',
    items: [
      'Rabdi Jalebi', 'Imarti Rabdi', 'Kesariya Doodh', 'Kesariya Makkhan',
      'Dry Fruit Kulfi', 'Kashmiri Chai', 'Ras Malai', 'Gulab Jamun',
    ],
  },
]

// Vendor master (blueprint §6): supplier categories match the procurement split.
export const VENDOR_CATEGORIES = [
  'Vegetables', 'Grocery', 'Starter Vendor', 'Dairy', 'Non-Veg Material', 'Ice Cream',
  'Drinks & Mocktails', 'Disposables', 'Crockery', 'Transport', 'Labour',
]

export const VENDORS = [
  { id: 'vn-1', name: 'Chowk Sabzi Suppliers', category: 'Vegetables', phone: '+91 94150 11111', items: 'Seasonal vegetables, salad produce', balance: 8500 },
  { id: 'vn-2', name: 'Aminabad Kebab House', category: 'Starter Vendor', phone: '+91 94150 22222', items: 'Kebabs, tikkas — per-piece supply', balance: 0 },
  { id: 'vn-3', name: 'Saras Dairy', category: 'Dairy', phone: '+91 94150 33333', items: 'Milk, cream, paneer, khoya', balance: 12200 },
  { id: 'vn-4', name: 'Fresco Meat Co.', category: 'Non-Veg Material', phone: '+91 94150 44444', items: 'Mutton, chicken, fish — bulk', balance: 28000 },
  { id: 'vn-5', name: 'Kwality Ice Cream', category: 'Ice Cream', phone: '+91 94150 55555', items: 'Kulfi, cassata, bulk tubs', balance: 0 },
  { id: 'vn-6', name: 'Royal Beverages', category: 'Drinks & Mocktails', phone: '+91 94150 66666', items: 'Cold drinks, mocktail setup, soda', balance: 3400 },
  { id: 'vn-7', name: 'Packwell Disposables', category: 'Disposables', phone: '+91 94150 77777', items: 'Plates, cups, boxes, cutlery', balance: 0 },
  { id: 'vn-8', name: 'Sharma Crockery Hire', category: 'Crockery', phone: '+91 94150 88888', items: 'Bone china, steel, chafing dishes', balance: 5600 },
  { id: 'vn-9', name: 'City Tempo Service', category: 'Transport', phone: '+91 94150 99999', items: 'Loading, unloading, event transport', balance: 0 },
  { id: 'vn-10', name: 'Imam Kirana & General Store', category: 'Grocery', phone: '+91 94150 10101', items: 'Dor rashan — rice, atta, oil, spices', balance: 2100 },
]

// Blueprint §7 — service & logistics checklist template (per event).
export const LOGISTICS_CHECKLIST = {
  'Crockery': ['Dinner plates', 'Quarter plates', 'Spoons & forks', 'Serving bowls', 'Chafing dishes', 'Water jugs'],
  'Counters': ['Buffet counters', 'Live counters', 'Chaat counter', 'Dessert counter'],
  'Disposables': ['Paper plates', 'Cups & glasses', 'Napkins', 'Packing boxes & foil', 'Garbage bags'],
  'Water / Gas / Ice': ['Drinking water', 'Gas cylinders', 'Ice blocks', 'Drinking glasses'],
  'Transport': ['Vehicle booked', 'Loading plan', 'Unloading crew'],
  'Equipment': ['Tables & chairs', 'Lighting', 'Handwash station', 'Extension cords'],
}

export const STAFF = [
  { id: 'st-1', name: 'Imran Sheikh', role: 'Head Chef', phone: '+91 80042 11223' },
  { id: 'st-2', name: 'Rafiq Ansari', role: 'Chef — Biryani', phone: '+91 80042 44556' },
  { id: 'st-3', name: 'Salman Qureshi', role: 'Chef — Kebabs', phone: '+91 80042 77889' },
  { id: 'st-4', name: 'Ayesha Khan', role: 'Event Coordinator', phone: '+91 78007 33445' },
  { id: 'st-5', name: 'Bilal Ahmed', role: 'Service Lead', phone: '+91 78007 66778' },
  { id: 'st-6', name: 'Farhan Malik', role: 'Service Staff', phone: '+91 78007 99001' },
  { id: 'st-7', name: 'Naved Ali', role: 'Driver / Logistics', phone: '+91 78007 22334' },
]

const today = new Date()
const d = (offsetDays, h = 12) => {
  const x = new Date(today)
  x.setDate(x.getDate() + offsetDays)
  x.setHours(h, 0, 0, 0)
  return x.toISOString()
}

export const BOOKINGS = [
  {
    id: 'bk-1', ref: 'MQ-2481', status: 'inquiry',
    client: { name: 'Sana Merchant', phone: '+91 98111 20304', email: 'sana.m@gmail.com' },
    eventType: 'Wedding', date: d(24, 18), guests: 400, venue: 'City Banquets, Gomti Nagar',
    packageId: 'pkg-vip', amount: 400 * 1250,
    cateringType: 'full', pax: { veg: 150, nonVeg: 250 }, receipts: [], expenses: [],
    createdAt: d(-1), notes: ['Asked for tasting session next week'],
    statusHistory: [{ status: 'inquiry', at: d(-1) }], staffIds: [],
  },
  {
    id: 'bk-2', ref: 'MQ-2480', status: 'inquiry',
    client: { name: 'TechNova Solutions', phone: '+91 98222 40506', email: 'admin@technova.in' },
    eventType: 'Corporate', date: d(9, 12), guests: 60, venue: 'Office cafeteria, Vibhuti Khand',
    packageId: 'pkg-normal', amount: 60 * 650,
    cateringType: 'semi', pax: { veg: 20, nonVeg: 40 }, receipts: [], expenses: [],
    createdAt: d(-2), notes: [],
    statusHistory: [{ status: 'inquiry', at: d(-2) }], staffIds: [],
  },
  {
    id: 'bk-3', ref: 'MQ-2477', status: 'quoted',
    client: { name: 'Yusuf & Amina', phone: '+91 98333 50607', email: 'yusuf.a@gmail.com' },
    eventType: 'Nikkah / Walima', date: d(17, 19), guests: 250, venue: 'Alambagh Marriage Hall',
    packageId: 'pkg-standard', amount: 250 * 900,
    cateringType: 'full', pax: { veg: 80, nonVeg: 170 }, receipts: [], expenses: [],
    menuItems: [
      { dish: 'Pasanda Kebab', group: 'starterVendor' },
      { dish: 'Seekh Kaleji', group: 'starterVendor' },
      { dish: 'Mutton Nihari', group: 'nonVegChef' },
      { dish: 'Murgh Musallam', group: 'nonVegChef' },
      { dish: 'Lucknowi Chicken Biryani', group: 'nonVegChef' },
      { dish: 'Sheermal', group: 'vegChef' },
      { dish: 'Zafrani Kheer', group: 'vegChef' },
      { dish: 'Kashmiri Chai', group: 'specialSupplier' },
    ],
    createdAt: d(-5), notes: ['Quote sent — includes qahwa service upgrade'],
    statusHistory: [{ status: 'inquiry', at: d(-5) }, { status: 'quoted', at: d(-3) }], staffIds: [],
  },
  {
    id: 'bk-4', ref: 'MQ-2474', status: 'confirmed',
    client: { name: 'Fatima Shaikh', phone: '+91 98444 60708', email: 'fatima.s@gmail.com' },
    eventType: 'Birthday', date: d(3, 17), guests: 45, venue: 'Residence — Aliganj',
    packageId: 'pkg-normal', amount: 45 * 650,
    cateringType: 'semi', pax: { veg: 15, nonVeg: 30 },
    receipts: [{ label: 'Advance', amount: 10000, at: d(-6) }], expenses: [],
    createdAt: d(-8), notes: ['Advance paid. Chaat counter confirmed.'],
    statusHistory: [{ status: 'inquiry', at: d(-8) }, { status: 'quoted', at: d(-7) }, { status: 'confirmed', at: d(-6) }],
    staffIds: ['st-5', 'st-6'],
  },
  {
    id: 'bk-5', ref: 'MQ-2471', status: 'confirmed',
    client: { name: 'Masjid Committee — Chowk', phone: '+91 98555 70809', email: 'committee@masjid.org' },
    eventType: 'Family Gathering', date: d(30, 13), guests: 300, venue: 'Community hall, Chowk',
    packageId: 'pkg-standard', amount: 300 * 900,
    cateringType: 'full', pax: { veg: 120, nonVeg: 180 },
    receipts: [{ label: 'Advance', amount: 80000, at: d(-7) }], expenses: [],
    createdAt: d(-10), notes: [],
    statusHistory: [{ status: 'inquiry', at: d(-10) }, { status: 'quoted', at: d(-9) }, { status: 'confirmed', at: d(-7) }],
    staffIds: ['st-1', 'st-2', 'st-4'],
  },
  {
    id: 'bk-6', ref: 'MQ-2468', status: 'prep',
    client: { name: 'Arjun Mehta', phone: '+91 98666 80910', email: 'arjun.m@gmail.com' },
    eventType: 'Corporate', date: d(1, 12), guests: 80, venue: 'Mehta & Co, Hazratganj',
    packageId: 'pkg-normal', amount: 80 * 650,
    cateringType: 'semi', pax: { veg: 25, nonVeg: 55 },
    receipts: [{ label: 'Advance', amount: 15000, at: d(-10) }],
    expenses: [{ category: 'Purchases', label: 'Raw material — grocery', amount: 18000, at: d(-1) }],
    createdAt: d(-12), notes: ['Buffet line, 12pm sharp. 15 veg boxes separate.'],
    statusHistory: [
      { status: 'inquiry', at: d(-12) }, { status: 'quoted', at: d(-11) },
      { status: 'confirmed', at: d(-10) }, { status: 'prep', at: d(-1) },
    ],
    staffIds: ['st-2', 'st-5', 'st-7'],
  },
  {
    id: 'bk-7', ref: 'MQ-2465', status: 'prep',
    client: { name: 'Zoya Ansari', phone: '+91 98777 90011', email: 'zoya.a@gmail.com' },
    eventType: 'Family Gathering', date: d(0, 19), guests: 30, venue: 'Residence — Indira Nagar',
    packageId: 'pkg-normal', amount: 30 * 650,
    cateringType: 'semi', pax: { veg: 10, nonVeg: 20 },
    receipts: [{ label: 'Advance', amount: 8000, at: d(-12) }], expenses: [],
    createdAt: d(-14), notes: ['Deliver by 7:30pm, no staff needed.'],
    statusHistory: [
      { status: 'inquiry', at: d(-14) }, { status: 'quoted', at: d(-13) },
      { status: 'confirmed', at: d(-12) }, { status: 'prep', at: d(-2) },
    ],
    staffIds: ['st-7'],
  },
  {
    id: 'bk-8', ref: 'MQ-2450', status: 'delivered',
    client: { name: 'Rahman Family', phone: '+91 98888 01112', email: 'rahman.f@gmail.com' },
    eventType: 'Wedding', date: d(-1, 18), guests: 500, venue: 'Grand Lawn, Aminabad',
    packageId: 'pkg-vip', amount: 500 * 1250,
    cateringType: 'full', pax: { veg: 200, nonVeg: 300 },
    receipts: [{ label: 'Advance', amount: 250000, at: d(-25) }],
    expenses: [
      { category: 'Purchases', label: 'Raw material — meat & grocery', amount: 185000, at: d(-3) },
      { category: 'Vendors', label: 'Starter vendors + ice cream', amount: 62000, at: d(-2) },
      { category: 'Labour', label: 'Chefs + service staff', amount: 38000, at: d(-1) },
      { category: 'Transport', label: '2 tempos + fuel', amount: 9000, at: d(-1) },
    ],
    menuItems: [
      { dish: 'Kakori Seekh Kebab', group: 'starterVendor' },
      { dish: 'Chicken Malai Tikka', group: 'starterVendor' },
      { dish: 'Afghani Paneer Tikka', group: 'starterVendor' },
      { dish: 'Hara Bhara Kebab', group: 'starterVendor' },
      { dish: 'Mutton Qourma', group: 'nonVegChef' },
      { dish: 'Butter Chicken', group: 'nonVegChef' },
      { dish: 'Lucknowi Mutton Biryani', group: 'nonVegChef' },
      { dish: 'Shahi Paneer', group: 'vegChef' },
      { dish: 'Dal Makhni', group: 'vegChef' },
      { dish: 'Tandoori Roti', group: 'vegChef' },
      { dish: 'Shahi Tukda', group: 'vegChef' },
      { dish: 'Dry Fruit Kulfi', group: 'specialSupplier' },
      { dish: 'Gulab Jamun', group: 'specialSupplier' },
    ],
    createdAt: d(-30), notes: [],
    statusHistory: [
      { status: 'inquiry', at: d(-30) }, { status: 'quoted', at: d(-28) },
      { status: 'confirmed', at: d(-25) }, { status: 'prep', at: d(-2) },
      { status: 'delivered', at: d(-1) },
    ],
    staffIds: ['st-1', 'st-2', 'st-3', 'st-4', 'st-5', 'st-6', 'st-7'],
  },
  {
    id: 'bk-9', ref: 'MQ-2440', status: 'done',
    client: { name: 'Nikhil Kapoor', phone: '+91 98999 12213', email: 'nikhil.k@gmail.com' },
    eventType: 'Birthday', date: d(-6, 13), guests: 35, venue: 'Terrace — Gomti Nagar',
    packageId: 'pkg-normal', amount: 35 * 650,
    cateringType: 'semi', pax: { veg: 12, nonVeg: 23 },
    receipts: [
      { label: 'Advance', amount: 5000, at: d(-22) },
      { label: 'Final settlement', amount: 17750, at: d(-5) },
    ],
    expenses: [
      { category: 'Purchases', label: 'Raw material', amount: 8500, at: d(-7) },
      { category: 'Labour', label: 'Service staff ×2', amount: 4000, at: d(-6) },
      { category: 'Transport', label: 'Delivery', amount: 1200, at: d(-6) },
      { category: 'Misc.', label: 'Disposables top-up', amount: 800, at: d(-6) },
    ],
    createdAt: d(-25), notes: ['Settled. Left a 5-star review.'],
    statusHistory: [
      { status: 'inquiry', at: d(-25) }, { status: 'quoted', at: d(-24) },
      { status: 'confirmed', at: d(-22) }, { status: 'prep', at: d(-7) },
      { status: 'delivered', at: d(-6) }, { status: 'done', at: d(-5) },
    ],
    staffIds: ['st-5', 'st-6'],
  },
  {
    id: 'bk-10', ref: 'MQ-2433', status: 'done',
    client: { name: 'Hussain Traders', phone: '+91 98000 23314', email: 'orders@hussaintraders.com' },
    eventType: 'Corporate', date: d(-15, 12), guests: 120, venue: 'Office hall, Aminabad',
    packageId: 'pkg-standard', amount: 120 * 900,
    cateringType: 'service', pax: { veg: 40, nonVeg: 80 },
    receipts: [
      { label: 'Advance', amount: 30000, at: d(-33) },
      { label: 'Final settlement', amount: 78000, at: d(-14) },
    ],
    expenses: [
      { category: 'Vendors', label: 'Starters + disposables', amount: 28000, at: d(-16) },
      { category: 'Labour', label: 'Service staff ×6', amount: 15000, at: d(-15) },
      { category: 'Transport', label: 'Tempo + fuel', amount: 4500, at: d(-15) },
      { category: 'Service', label: 'Crockery hire', amount: 6000, at: d(-15) },
    ],
    createdAt: d(-35), notes: [],
    statusHistory: [
      { status: 'inquiry', at: d(-35) }, { status: 'quoted', at: d(-34) },
      { status: 'confirmed', at: d(-33) }, { status: 'prep', at: d(-16) },
      { status: 'delivered', at: d(-15) }, { status: 'done', at: d(-14) },
    ],
    staffIds: ['st-2', 'st-7'],
  },
]

export const CLIENTS = [
  { id: 'cl-1', name: 'Sana Merchant', phone: '+91 98111 20304', email: 'sana.m@gmail.com', since: d(-1) },
  { id: 'cl-2', name: 'TechNova Solutions', phone: '+91 98222 40506', email: 'admin@technova.in', since: d(-2) },
  { id: 'cl-3', name: 'Yusuf & Amina', phone: '+91 98333 50607', email: 'yusuf.a@gmail.com', since: d(-5) },
  { id: 'cl-4', name: 'Fatima Shaikh', phone: '+91 98444 60708', email: 'fatima.s@gmail.com', since: d(-8) },
  { id: 'cl-5', name: 'Masjid Committee — Chowk', phone: '+91 98555 70809', email: 'committee@masjid.org', since: d(-40) },
  { id: 'cl-6', name: 'Arjun Mehta', phone: '+91 98666 80910', email: 'arjun.m@gmail.com', since: d(-12) },
  { id: 'cl-7', name: 'Zoya Ansari', phone: '+91 98777 90011', email: 'zoya.a@gmail.com', since: d(-14) },
  { id: 'cl-8', name: 'Rahman Family', phone: '+91 98888 01112', email: 'rahman.f@gmail.com', since: d(-90) },
  { id: 'cl-9', name: 'Nikhil Kapoor', phone: '+91 98999 12213', email: 'nikhil.k@gmail.com', since: d(-60) },
  { id: 'cl-10', name: 'Hussain Traders', phone: '+91 98000 23314', email: 'orders@hussaintraders.com', since: d(-120) },
]

export const fmtINR = (n) => '₹' + n.toLocaleString('en-IN')
