# 🌟 Scoatem3D — Magazin Online Produse Personalizate Imprimate 3D

Aplicație completă de comerț electronic dedicată produselor personalizate imprimate 3D (lămpi litofanie din fotografii, brelocuri, rame sculptate, decorațiuni, matrițe de prăjituri food-safe), cu flux complet de configurare dinamică, coș, checkout și un panou de administrare separat pentru atelierul de producție 3D.

Construit cu **React + Vite**, stil artizanal cald în **Vanilla CSS**, și integrat nativ cu **Supabase** (Bază de date PostgreSQL, Autentificare Admin, Row Level Security și Supabase Storage).

---

## 🚀 Pornire Rapidă Locală

Proiectul include deja un set bogat de produse și comenzi demo, putând fi rulat și testat **imediat**, chiar și înainte de a configura un cont Supabase:

```bash
# 1. Navighează în folderul proiectului
cd c:\Learn\site3DMagazin

# 2. Instalează dependențele (dacă nu au fost deja instalate)
npm install

# 3. Pornește serverul de dezvoltare
npm run dev
```

Deschide în browser: `http://localhost:5173`

---

## 🗄️ Structură Bază de Date & Supabase SQL

În rădăcina proiectului găsești fișierul complet [supabase_schema.sql](file:///c:/Learn/site3DMagazin/supabase_schema.sql).

### Tabele Create:
1. **`products`**:
   - `id` (UUID PRIMARY KEY)
   - `name` (TEXT), `description` (TEXT), `price` (NUMERIC), `category` (TEXT), `image_url` (TEXT), `badge` (TEXT), `active` (BOOLEAN), `created_at` (TIMESTAMPTZ)
   - `fields` (**JSONB**) — Colecție de câmpuri configurabile dinamic pentru fiecare produs:
     ```json
     [
       { "key": "photo", "label": "Fotografia ta pentru litofanie", "type": "image", "required": true },
       { "key": "dedication", "label": "Text gravat pe suport", "type": "text", "required": false, "max_length": 35 },
       { "key": "light_temp", "label": "Nuanță lumină LED", "type": "select", "required": true, "options": ["Alb Cald Romantic (2700K)", "Alb Neutru Natural (4000K)"] }
     ]
     ```

2. **`orders`**:
   - `id` (UUID PRIMARY KEY), `customer_name`, `customer_phone`, `customer_address`, `customer_email`, `customer_notes`
   - `status` (ENUM: `'noua'`, `'in_productie'`, `'printata'`, `'expediata'`)
   - `total` (NUMERIC), `created_at` (TIMESTAMPTZ)

3. **`order_items`**:
   - `id` (UUID PRIMARY KEY), `order_id` (FK `orders`), `product_id` (FK `products`), `product_name`, `price`, `quantity`
   - `customization` (**JSONB**) — Valorile exacte completate de client (textul introdus sau URL-ul din Supabase Storage pentru fotografii)

4. **Storage Buckets**:
   - `customer-uploads`: Fișierele foto încărcate de clienți, păstrate în calitate originală, cu nume unic (`timestamp_random_nume.jpg`), protejate împotriva suprascrierii.
   - `product-images`: Pentru imaginile produselor adăugate de administrator.

---

## 🛡️ Politici RLS (Row Level Security)

Securitatea este configurată riguros conform specificațiilor:
- **`products`**:
  - `SELECT`: Public pentru produsele cu `active = true`; utilizatorii autentificați (admin) le pot citi pe toate.
  - `INSERT / UPDATE / DELETE`: Doar utilizatorii autentificați (`auth.role() = 'authenticated'`).
- **`orders` & `order_items`**:
  - `INSERT`: Public (oricine poate plasa o comandă fără să fie nevoit să își creeze cont).
  - `SELECT / UPDATE / DELETE`: **Strict interzis publicului**, permis **doar administratorului autentificat**.
- **`customer-uploads` (Storage)**:
  - `INSERT`: Public (oricine poate atașa poze la comenzi).
  - `SELECT`: Public prin URL direct securizat (nu listabil public).

---

## ⚙️ Conectare la Proiectul Tău Supabase

1. Creează un proiect pe [supabase.com](https://supabase.com).
2. Mergi în **SQL Editor** &gt; **New Query**, lipește tot codul din [supabase_schema.sql](file:///c:/Learn/site3DMagazin/supabase_schema.sql) și apasă **Run**.
3. În **Authentication** &gt; **Users** &gt; **Add user**, creează contul tău de administrator (email + parolă).
4. Creează fișierul `.env` în rădăcina proiectului cu cheile din **Project Settings** &gt; **API**:
   ```env
   VITE_SUPABASE_URL=https://proiectul-tau.supabase.co
   VITE_SUPABASE_ANON_KEY=cheia-ta-anon-public
   ```
5. Repornește `npm run dev`. Aplicația va comuta automat pe baza ta de date Supabase live!

---

## 🎨 Funcționalități Realizate

### 🛍️ Magazin Public (`/`):
- **Aesthetic cald & artizanal**: Tonuri crem, teracotă, auriu cald, colțuri rotunjite, spațiere generoasă, tipografie modernă (*Outfit* & *Plus Jakarta Sans*).
- **Filtrare pe categorii**: Lămpi Litofanie, Brelocuri, Rame & Cadouri, Bucătărie & Evenimente.
- **Configurator dinamic de produs**:
  - Câmp text cu limită și **contor live de caractere**.
  - Câmp imagine cu previzualizare instantanee și încărcare directă în bucket-ul `customer-uploads`.
  - Câmp select stilizat cu opțiunile definite.
  - Card de **Previzualizare Personalizare Live**.
  - Validare strictă pentru câmpurile obligatorii.
- **Coș persistent în LocalStorage**:
  - Prezentare clară a fiecărui produs cu toate detaliile personalizate și miniaturi ale pozelor încărcate.
  - Calculator cost livrare (Gratuit la comenzi de peste 200 Lei).
- **Checkout rapid**:
  - Nume, telefon validat, adresă completă de livrare, notă comandă.
  - Salvare în `orders` și `order_items` cu tranzacție sigură.
  - Ecran de confirmare cu ID comandă și efect festiv de confetti 🎉.

### 🛠️ Dashboard Admin (`#/admin`):
- **Ruta protejată**: Ecran dedicat de autentificare (Supabase Auth sau buton demo 1-click pentru testare).
- **Tab 1: Comenzi**:
  - Filtrare după status (`Toate`, `Noi`, `În Producție`, `Printate`, `Expediate`) și căutare rapidă.
  - Detalii client cu apelare directă `tel:`.
  - Texte de gravat afișate în casete dedicate cu buton **"Copiază"** cu un click (ușor de inserat în softurile CAD / Slicere: Bambu Studio, Cura, PrusaSlicer).
  - Fotografii clienți cu Lightbox mărit și descărcare la rezoluție originală.
  - Buton **"Descarcă toate imaginile (.ZIP)"** care împachetează automat fotografiile comenzii într-o arhivă ZIP cu un singur click folosind `JSZip`.
  - Selector de status pe fiecare comandă cu salvare imediată în baza de date.
- **Tab 2: Comenzi de printat azi**:
  - Coadă de producție FIFO pentru atelierul 3D, axată pe comenzi noi sau în lucru, cu acțiuni rapide de avansare a stadiului de print.
- **Tab 3: Produse & Personalizări**:
  - Activare/dezactivare produse, ștergere, editare.
  - **Constructor Vizual de Câmpuri de Personalizare**: Adminul poate adăuga câmpuri noi de personalizare (etichetă, tip: text/imagine/select, opțiuni, obligatoriu, limită caractere) **fără să scrie o singură linie de cod**!
- **Tab 4: Ghid Supabase & RLS**:
  - Indicator status conexiune, asistent configurare și buton de copiere a scriptului SQL în clipboard.

---

## 🔔 Notificări Email Comandă Nouă (Opțional)

În fișierul [supabase_edge_function_notification.ts](file:///c:/Learn/site3DMagazin/supabase_edge_function_notification.ts) este inclus codul pentru o funcție Edge Supabase (folosind Resend API) care poate trimite automat un email pe adresa de admin imediat ce un client plasează o nouă comandă.
