-- ==============================================================================
-- SCOATEM3D - SUPABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Acest script configurează complet tabelele, tipurile ENUM, politicile RLS
-- și storage bucket-urile pentru magazinul online de produse imprimate 3D.
-- Copiază și execută în Supabase > SQL Editor.
-- ==============================================================================

-- 1. TIP ENUM PENTRU STATUSUL COMENZILOR
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('noua', 'in_productie', 'printata', 'expediata');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABEL PRODUCTS (Produse 3D configurabile)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL DEFAULT 'Diverse',
    image_url TEXT,
    badge TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pentru performanță la filtrare după produse active și categorie
CREATE INDEX IF NOT EXISTS idx_products_active_category ON public.products(active, category);

-- 2.1 TABEL CATEGORIES (Categorii dinamice de produse)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order ASC);

-- 3. TABEL ORDERS (Comenzi plasate de clienți)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_email TEXT,
    customer_notes TEXT,
    status order_status NOT NULL DEFAULT 'noua',
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pentru listare cronologică a comenzilor și filtrare după status
CREATE INDEX IF NOT EXISTS idx_orders_created_status ON public.orders(created_at DESC, status);

-- 4. TABEL ORDER_ITEMS (Articole comandate cu personalizări)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    customization JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 5. TABEL REVIEWS (Recenzii și evaluări lăsate de clienți)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_location TEXT DEFAULT 'România',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN NOT NULL DEFAULT true,
    helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Activare RLS pe toate tabelele
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Reguli RLS pentru PRODUCTS:
-- - Citire publică: oricine poate citi produsele active. Utilizatorii autentificați pot citi tot.
-- - Scriere (insert, update, delete): DOAR utilizatorii autentificați (admin)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" 
    ON public.products 
    FOR SELECT 
    USING (active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products" 
    ON public.products 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products" 
    ON public.products 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products" 
    ON public.products 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- Reguli RLS pentru CATEGORIES:
-- - Citire publică: oricine poate citi categoriile
-- - Scriere (insert, update, delete): DOAR admin autentificat
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" 
    ON public.categories 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admin can insert categories" ON public.categories;
CREATE POLICY "Admin can insert categories" 
    ON public.categories 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can update categories" ON public.categories;
CREATE POLICY "Admin can update categories" 
    ON public.categories 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete categories" ON public.categories;
CREATE POLICY "Admin can delete categories" 
    ON public.categories 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Inserare categorii inițiale dacă tabela e goală
INSERT INTO public.categories (name, display_order)
VALUES 
    ('Lămpi Litofanie', 1),
    ('Brelocuri', 2),
    ('Rame & Cadouri', 3),
    ('Bucătărie & Evenimente', 4),
    ('Diverse', 5)
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- Reguli RLS pentru ORDERS:
-- - Inserare publică: oricine (client fără cont) poate plasa o comandă
-- - Citire și actualizare: DOAR admin autentificat
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" 
    ON public.orders 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view orders" ON public.orders;
CREATE POLICY "Admin can view orders" 
    ON public.orders 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders" 
    ON public.orders 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders" 
    ON public.orders 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- Reguli RLS pentru ORDER_ITEMS:
-- - Inserare publică: oricine poate adăuga articole în comandă la plasare
-- - Citire și actualizare: DOAR admin autentificat
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" 
    ON public.order_items 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view order items" ON public.order_items;
CREATE POLICY "Admin can view order items" 
    ON public.order_items 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can update order items" ON public.order_items;
CREATE POLICY "Admin can update order items" 
    ON public.order_items 
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin can delete order items" ON public.order_items;
CREATE POLICY "Admin can delete order items" 
    ON public.order_items 
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- Reguli RLS pentru REVIEWS:
-- - Citire publică: oricine poate citi recenziile produselor
-- - Inserare publică: clienții pot adăuga recenzii noi
-- - Actualizare like-uri: oricine poate vota utilitatea recenziilor
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" 
    ON public.reviews 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert reviews" ON public.reviews;
CREATE POLICY "Public can insert reviews" 
    ON public.reviews 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update review helpful votes" ON public.reviews;
CREATE POLICY "Public can update review helpful votes" 
    ON public.reviews 
    FOR UPDATE 
    USING (true);

-- ==============================================================================
-- 7. STORAGE BUCKETS (customer-uploads & product-images)
-- ==============================================================================

-- Creare bucket 'customer-uploads' dacă nu există
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'customer-uploads',
    'customer-uploads',
    true,
    20971520, -- limită 20MB per fișier foto la calitate originală
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/bmp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 20971520;

-- Creare bucket 'product-images' pentru admin
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true;

-- Politici de stocare pentru customer-uploads:
-- Upload public (oricine poate încărca poze la personalizare)
DROP POLICY IF EXISTS "Public can upload to customer-uploads" ON storage.objects;
CREATE POLICY "Public can upload to customer-uploads"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'customer-uploads');

-- Citire publică directă (prin link direct)
DROP POLICY IF EXISTS "Public can view customer-uploads" ON storage.objects;
CREATE POLICY "Public can view customer-uploads"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'customer-uploads');

-- Politici de stocare pentru product-images:
DROP POLICY IF EXISTS "Public can view product-images" ON storage.objects;
CREATE POLICY "Public can view product-images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can upload product-images" ON storage.objects;
CREATE POLICY "Admin can upload product-images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 7. SEED DATA - PRODUSE INIȚIALE CU CÂMPURI DINAMICE DE PERSONALIZARE
-- ==============================================================================

INSERT INTO public.products (id, name, description, price, category, image_url, badge, active, fields)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Lampă Litofanie Curbată cu Bază din Lemn',
    'O amintire unică transformată în lumină caldă. Poza ta preferată este sculptată în relief 3D micrometric și devine vizibilă la aprinderea luminii LED din spate. Bază elegantă din lemn natural cu alimentare USB.',
    189.00,
    'Lămpi Litofanie',
    '/images/products/lampa-litofanie.jpg',
    'Bestseller',
    true,
    '[
        {
            "key": "photo",
            "label": "Fotografia ta pentru litofanie (calitate cât mai clară)",
            "type": "image",
            "required": true
        },
        {
            "key": "dedication",
            "label": "Text scurt gravat pe bază (opțional)",
            "type": "text",
            "required": false,
            "max_length": 35
        },
        {
            "key": "light_temp",
            "label": "Nuanță lumină LED",
            "type": "select",
            "required": true,
            "options": ["Alb Cald Romantic (2700K)", "Alb Neutru Natural (4000K)"]
        }
    ]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222222',
    'Breloc Auto 3D Personalizat cu Număr sau Nume',
    'Breloc rezistent imprimat 3D în relief, perfect pentru cheile mașinii sau ale casei tale. Design modern bi-color, finisaj catifelat și inel metalic inclus.',
    39.00,
    'Brelocuri',
    '/images/products/breloc-personalizat.jpg',
    'Nou',
    true,
    '[
        {
            "key": "custom_text",
            "label": "Nume sau număr înmatriculare (ex: B 123 ABC)",
            "type": "text",
            "required": true,
            "max_length": 14
        },
        {
            "key": "color_primary",
            "label": "Culoare text 3D",
            "type": "select",
            "required": true,
            "options": ["Cupru / Teracotă Metalizat", "Auriu Regal Mătăsos", "Alb Mat", "Verde Salvie"]
        },
        {
            "key": "color_base",
            "label": "Culoare bază breloc",
            "type": "select",
            "required": true,
            "options": ["Negru Mat Texturat", "Gri Titan Ardezie", "Albastru Marin"]
        }
    ]'::jsonb
),
(
    '33333333-3333-3333-3333-333333333333',
    'Ramă Foto 3D Litofanie cu Șevalet de Birou',
    'O reinterpretare modernă a ramelor foto clasice. Rama 3D în stil vintage art nouveau înrămează o litofanie translucidă ce dezvăluie detaliile fețelor celor dragi. Include șevalet minimalist din lemn.',
    145.00,
    'Rame & Cadouri',
    '/images/products/rama-litofanie.jpg',
    'Emoționant',
    true,
    '[
        {
            "key": "photo",
            "label": "Fotografia de înrămat",
            "type": "image",
            "required": true
        },
        {
            "key": "frame_style",
            "label": "Stil ramă sculptată",
            "type": "select",
            "required": true,
            "options": ["Clasic Art Nouveau (Crem Fildeș)", "Modern Minimalist (Alb Mat)", "Vintage Romantic"]
        },
        {
            "key": "back_message",
            "label": "Mesaj cu dedicație (gravat pe spatele ramei)",
            "type": "text",
            "required": false,
            "max_length": 50
        }
    ]'::jsonb
),
(
    '44444444-4444-4444-4444-444444444444',
    'Formă Prăjituri Personalizată cu Nume & Eveniment',
    'Adaugă un detaliu memorabil la nunți, botezuri, aniversări sau în bucătăria ta. Imprimată din filament certificat alimentar (Food-Safe PLA), creează fursecuri crocante cu litere bine conturate.',
    49.00,
    'Bucătărie & Evenimente',
    '/images/products/forma-biscuiti.jpg',
    'Cadou Dulce',
    true,
    '[
        {
            "key": "cookie_text",
            "label": "Textul ștampilei (ex: MARIA & ANDREI)",
            "type": "text",
            "required": true,
            "max_length": 20
        },
        {
            "key": "cookie_shape",
            "label": "Formă tăietor",
            "type": "select",
            "required": true,
            "options": ["Dreptunghi rotunjit (7x5 cm)", "Cerc clasic (diametru 6.5 cm)", "Inimioară dulce"]
        },
        {
            "key": "color_choice",
            "label": "Culoare formă",
            "type": "select",
            "required": true,
            "options": ["Verde Salvie Pastel", "Roz Pudră Cald", "Galben Vanilie"]
        }
    ]'::jsonb
),
(
    '55555555-5555-5555-5555-555555555555',
    'Veioză Sferică Lună 3D cu Siluetă de Familie',
    'Glob sferic 3D cu textura reală a craterelor selenare conform hărților NASA, personalizat cu silueta familiei sau a cuplului tău și o dedicație secretă. Stand geometric din lemn masiv inclus.',
    219.00,
    'Lămpi Litofanie',
    '/images/products/lampa-luna.jpg',
    'Top Cadou',
    true,
    '[
        {
            "key": "silhouette_photo",
            "label": "Fotografie cu persoanele pentru siluetă",
            "type": "image",
            "required": true
        },
        {
            "key": "engraving",
            "label": "Text dedicat (opțional)",
            "type": "text",
            "required": false,
            "max_length": 40
        },
        {
            "key": "diameter",
            "label": "Dimensiune sferă",
            "type": "select",
            "required": true,
            "options": ["15 cm (Recomandat - Stand Inclus)", "18 cm Grande (+35 Lei)"]
        }
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    badge = EXCLUDED.badge,
    active = EXCLUDED.active,
    fields = EXCLUDED.fields;

-- ==============================================================================
-- SFÂRȘIT CONFIGURARE SCHEMA SUPABASE
-- ==============================================================================
