-- Muqim Caterers — seed data (mirrors the app's mock data)
-- Run AFTER schema.sql.

insert into packages (id, name, badge, tier, tagline, category, price_per_head, min_guests, serves_note, gradient, tags, items) values
('pkg-normal', 'Normal Package', 'Essential', 1, 'A complete spread for intimate functions and family gatherings', 'Full Catering', 650, 100, 'Best for 100–300 guests', 'from-teal-700 via-teal-600 to-teal-400',
 '["Buffet","Service included"]',
 '["2 non-veg starters","4 veg starters","2 mutton dishes","2 chicken dishes","2 sweet dishes","1 dessert","1 hot drink","1 cold drink","Salad","Limited bottled water","Saar water","Service staff","Crockery"]'),
('pkg-standard', 'Standard Package', 'Most Popular', 2, 'Our best-selling spread — cafeteria and LED counters included', 'Full Catering', 900, 150, 'Best for 150–500 guests', 'from-teal-800 via-teal-600 to-gold-500',
 '["Buffet","Cafeteria","LED counters","Welcome drink"]',
 '["3 non-veg starters","6 veg starters","1 welcome drink","2 mutton dishes","3 chicken dishes","2 sweet dishes","2 desserts","Cafeteria","Salad","2 bottled water","Jaar water","Service staff","Crockery","LED counters"]'),
('pkg-vip', 'VIP Package', 'Premium', 3, 'The full experience — fruit, paan and three salad varieties', 'Full Catering', 1250, 200, 'Best for 200–1000 guests', 'from-stone-800 via-teal-800 to-gold-400',
 '["Premium buffet","Fruit & paan","LED counters","Welcome drink"]',
 '["3 non-veg starters","7 veg starters","Welcome drink","3 mutton dishes","4 chicken dishes","3 sweet dishes","2 desserts","Cafeteria","Fresh fruit","Paan","3 types of salad","LED counters","Service staff","Crockery"]'),
('pkg-speciality', 'Zafraan Speciality', 'Signature', 4, 'Our signature line — raan, musallam, haleem and khichda prepared the Zafraan way', 'Speciality', 1600, 250, 'Made to order · discuss the spread with our head chef', 'from-stone-900 via-stone-800 to-gold-400',
 '["Signature dishes","Chef-curated","LED counters"]',
 '["Zafraan signature starters","7 veg starters","Welcome drink","3 mutton dishes","4 chicken dishes","Signature mains (raan / musallam / haleem)","3 sweet dishes","2 desserts","Cafeteria","Fresh fruit","Paan","3 types of salad","LED counters","Service staff","Crockery"]')
on conflict (id) do nothing;

insert into vendors (id, name, category, phone, items, balance) values
('vn-1', 'Chowk Sabzi Suppliers', 'Vegetables', '+91 94150 11111', 'Seasonal vegetables, salad produce', 8500),
('vn-2', 'Aminabad Kebab House', 'Starter Vendor', '+91 94150 22222', 'Kebabs, tikkas — per-piece supply', 0),
('vn-3', 'Saras Dairy', 'Dairy', '+91 94150 33333', 'Milk, cream, paneer, khoya', 12200),
('vn-4', 'Fresco Meat Co.', 'Non-Veg Material', '+91 94150 44444', 'Mutton, chicken, fish — bulk', 28000),
('vn-5', 'Kwality Ice Cream', 'Ice Cream', '+91 94150 55555', 'Kulfi, cassata, bulk tubs', 0),
('vn-6', 'Royal Beverages', 'Drinks & Mocktails', '+91 94150 66666', 'Cold drinks, mocktail setup, soda', 3400),
('vn-7', 'Packwell Disposables', 'Disposables', '+91 94150 77777', 'Plates, cups, boxes, cutlery', 0),
('vn-8', 'Sharma Crockery Hire', 'Crockery', '+91 94150 88888', 'Bone china, steel, chafing dishes', 5600),
('vn-9', 'City Tempo Service', 'Transport', '+91 94150 99999', 'Loading, unloading, event transport', 0),
('vn-10', 'Imam Kirana & General Store', 'Grocery', '+91 94150 10101', 'Dor rashan — rice, atta, oil, spices', 2100)
on conflict (id) do nothing;

insert into staff (id, name, role, phone) values
('st-1', 'Imran Sheikh', 'Head Chef', '+91 80042 11223'),
('st-2', 'Rafiq Ansari', 'Chef — Biryani', '+91 80042 44556'),
('st-3', 'Salman Qureshi', 'Chef — Kebabs', '+91 80042 77889'),
('st-4', 'Ayesha Khan', 'Event Coordinator', '+91 78007 33445'),
('st-5', 'Bilal Ahmed', 'Service Lead', '+91 78007 66778'),
('st-6', 'Farhan Malik', 'Service Staff', '+91 78007 99001'),
('st-7', 'Naved Ali', 'Driver / Logistics', '+91 78007 22334')
on conflict (id) do nothing;

insert into bookings (id, ref, status, customer, event_type, catering_type, event_date, guests, pax, venue, package_id, amount, notes, status_history, receipts, expenses, menu_items) values
('bk-1', 'MQ-2481', 'inquiry', '{"name":"Sana Merchant","phone":"+91 98111 20304","email":"sana.m@gmail.com"}',
 'Wedding', 'full', now() + interval '24 days' + interval '6 hours', 400, '{"veg":150,"nonVeg":250}',
 'City Banquets, Gomti Nagar', 'pkg-vip', 500000,
 '["Asked for tasting session next week"]', '[{"status":"inquiry","at":"2026-11-24T12:00:00Z"}]', '[]', '[]', '[]'),
('bk-3', 'MQ-2477', 'quoted', '{"name":"Yusuf & Amina","phone":"+91 98333 50607","email":"yusuf.a@gmail.com"}',
 'Nikkah / Walima', 'full', now() + interval '17 days' + interval '7 hours', 250, '{"veg":80,"nonVeg":170}',
 'Alambagh Marriage Hall', 'pkg-standard', 225000,
 '["Quote sent — includes qahwa service upgrade"]',
 '[{"status":"inquiry","at":"2026-11-20T12:00:00Z"},{"status":"quoted","at":"2026-11-22T12:00:00Z"}]', '[]', '[]',
 '[{"dish":"Pasanda Kebab","group":"starterVendor"},{"dish":"Seekh Kaleji","group":"starterVendor"},{"dish":"Mutton Nihari","group":"nonVegChef"},{"dish":"Murgh Musallam","group":"nonVegChef"},{"dish":"Lucknowi Chicken Biryani","group":"nonVegChef"},{"dish":"Sheermal","group":"vegChef"},{"dish":"Zafrani Kheer","group":"vegChef"},{"dish":"Kashmiri Chai","group":"specialSupplier"}]')
on conflict (id) do nothing;
