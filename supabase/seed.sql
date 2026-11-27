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
 '["3 non-veg starters","7 veg starters","Welcome drink","3 mutton dishes","4 chicken dishes","3 sweet dishes","2 desserts","Cafeteria","Fresh fruit","Paan","3 types of salad","LED counters","Service staff","Crockery"]')
on conflict (id) do nothing;

insert into vendors (id, name, category, sub, phone, items, balance) values
('vn-1', 'Imran — Barbeque Vendor', 'Starter Vendor', 'barbeque', '9793036973', 'Barbeque starters — kebabs, tikkas', 0),
('vn-2', 'Umrao Cook', 'Cook', 'main', '8127443820', 'Main cooking — non-veg mains', 0),
('vn-3', 'Vishal Cook', 'Cook', 'veg', '8303459494', 'Vegetarian cooking', 0),
('vn-4', 'Pandit', 'Vegetables', NULL, '7317832014', 'Sabzi — all three veg packs', 0),
('vn-5', 'Aslam Mutton Shop', 'Non-Veg Material', 'mutton', '9793863654', 'Mutton — bulk', 0),
('vn-6', 'Hussain Chicken Shop', 'Non-Veg Material', 'chicken', '8869665417', 'Chicken — bulk', 0),
('vn-7', 'Sanjay Fish Shop', 'Non-Veg Material', 'fish', '8840492888', 'Fish, prawns', 0),
('vn-8', 'Meenu Bhai', 'Non-Veg Material', 'beef', '9335045999', 'Beef, keema', 0),
('vn-9', 'Mushtafa', 'Ice Cream', NULL, '6382901588', 'Ice cream, kulfi, tubs', 0),
('vn-10', 'Ramesh Water Service', 'Drinks & Mocktails', 'water', '9621736786', 'Cold drinks, jar water', 0),
('vn-11', 'Siraj Bhai — Amul Agency', 'Dairy', 'milk', '7863248186', 'Milk & dairy — Amul agency', 0),
('vn-12', 'Raziya Phuppu', 'Fuel', NULL, '9651853274', 'Lakdi & koyla — firewood and coal', 0),
('vn-13', 'Dairy Products Vendor', 'Dairy', 'cream', '7805793247', 'Cream, butter, cheese', 0),
('vn-14', 'Syrup & Beverage Vendor', 'Drinks & Mocktails', 'syrup', '7805783247', 'Coffee, chocolate syrup, mocktail syrup & crush', 0),
('vn-15', 'Nadeem', 'Disposables', NULL, '7883899206', 'Plates, cups, packing', 0),
('vn-16', 'Nadeem — Counters', 'Special Supplier', NULL, '7883899206', 'Pan counter, cafeteria, fruit counter', 0),
('vn-17', 'Shu Gupta Banya Store', 'Grocery', NULL, '7267031850', 'Rashan — veg & non-veg', 0),
('vn-18', 'Sharma Crockery Hire', 'Crockery', NULL, '9415088888', 'Bone china, steel, chafing dishes', 0),
('vn-19', 'City Tempo Service', 'Transport', NULL, '9415099999', 'Loading, unloading, event transport', 0)
on conflict (id) do nothing;

insert into staff (id, name, role, perm_role, phone) values
('st-1', 'Imran Sheikh', 'Head Chef', 'chef', '+91 80042 11223'),
('st-2', 'Rafiq Ansari', 'Chef — Biryani', 'chef', '+91 80042 44556'),
('st-3', 'Salman Qureshi', 'Chef — Kebabs', 'chef', '+91 80042 77889'),
('st-4', 'Ayesha Khan', 'Event Coordinator', 'coordinator', '+91 78007 33445'),
('st-5', 'Bilal Ahmed', 'Service Lead', 'service', '+91 78007 66778'),
('st-6', 'Farhan Malik', 'Service Staff', 'service', '+91 78007 99001'),
('st-7', 'Naved Ali', 'Driver / Logistics', 'service', '+91 78007 22334')
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
