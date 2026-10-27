import { createClient } from "@supabase/supabase-js";

// ==============================================================================
// INITIALIZARE SUPABASE
// ==============================================================================

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!envUrl || !envKey) {
  console.error("[Supabase] VITE_SUPABASE_URL sau VITE_SUPABASE_ANON_KEY lipsesc din .env!");
}

export const supabase = createClient(envUrl, envKey);

export const isSupabaseConfigured = () => Boolean(envUrl && envKey);

// ==============================================================================
// AUTH HELPERS & ADMIN ROLE
// ==============================================================================

const ADMIN_EMAILS = [
  "ciocan_george97@yahoo.com",
  ...(import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(",") : []),
  ...(import.meta.env.VITE_ADMIN_EMAIL ? import.meta.env.VITE_ADMIN_EMAIL.split(",") : [])
].map(e => e.trim().toLowerCase()).filter(Boolean);

export function isUserAdmin(user) {
  if (!user) return false;
  const email = (user.email || "").trim().toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) return true;
  const meta = user.user_metadata || {};
  const role = user.app_metadata?.role || meta.role;
  return role === "admin";
}

export async function claimAdminRole() {
  const { data, error } = await supabase.auth.updateUser({
    data: { role: "admin" }
  });
  if (error) throw error;
  return data.user;
}

export async function getSupabaseUser() {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return null;
  const user = data.user;
  const meta = user.user_metadata || {};
  const isAdmin = isUserAdmin(user);
  const role = isAdmin ? "admin" : (user.app_metadata?.role || meta.role || "customer");
  return {
    id: user.id,
    name: meta.name || user.email.split("@")[0],
    email: user.email,
    phone: meta.phone || user.phone || "",
    // Câmpuri structurate adresă livrare
    county: meta.county || "",
    city: meta.city || "",
    address_street: meta.address_street || meta.address || "",
    postal_code: meta.postal_code || "",
    loyalty_points: meta.loyalty_points || 0,
    role,
    isAdmin
  };
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export function getCustomerSession() {
  return null;
}

// ==============================================================================
// AUTENTIFICARE
// ==============================================================================

export async function customerSignUp({ name, email, password, phone = "", address = "" }) {
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: { 
      data: { name: name.trim(), phone: phone.trim(), address: address.trim() },
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined
    }
  });
  if (error) throw error;

  // Supabase Security: Când confirmarea pe email e activă și utilizatorul există deja,
  // Supabase nu returnează eroare, ci returnează data.user cu identities = []
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('Există deja un cont înregistrat cu această adresă de email. Te rugăm să te conectezi.');
  }

  const meta = data.user?.user_metadata || {};
  return {
    success: true,
    requiresConfirmation: !data.session,
    user: {
      id: data.user?.id,
      name: meta.name || name.trim(),
      email: cleanEmail,
      phone: meta.phone || "",
      address: meta.address || "",
      role: "customer",
      isAdmin: false
    }
  };
}

export async function customerSignIn(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) throw error;
  const meta = data.user?.user_metadata || {};
  const isAdmin = isUserAdmin(data.user);
  const role = isAdmin ? "admin" : (data.user?.app_metadata?.role || meta.role || "customer");
  return {
    success: true,
    user: {
      id: data.user?.id,
      name: meta.name || cleanEmail.split("@")[0],
      email: cleanEmail,
      phone: meta.phone || data.user?.phone || "",
      county: meta.county || "",
      city: meta.city || "",
      address_street: meta.address_street || meta.address || "",
      postal_code: meta.postal_code || "",
      loyalty_points: meta.loyalty_points || 50,
      role,
      isAdmin
    }
  };
}

export async function customerSignOut() {
  await supabase.auth.signOut();
}

export async function adminSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ==============================================================================
// PROFIL CLIENT
// ==============================================================================

export async function updateCustomerProfile(updatedData) {
  const { data, error } = await supabase.auth.updateUser({ data: updatedData });
  if (error) throw error;
  const meta = data.user?.user_metadata || {};
  const isAdmin = isUserAdmin(data.user);
  const role = isAdmin ? "admin" : (data.user?.app_metadata?.role || meta.role || "customer");
  return {
    id: data.user?.id,
    name: meta.name || data.user?.email?.split("@")[0],
    email: data.user?.email,
    phone: meta.phone || data.user?.phone || "",
    county: meta.county || "",
    city: meta.city || "",
    address_street: meta.address_street || meta.address || "",
    postal_code: meta.postal_code || "",
    loyalty_points: meta.loyalty_points || 0,
    role,
    isAdmin
  };
}

// ==============================================================================
// PRODUSE
// ==============================================================================

export async function fetchActiveProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAllProductsAdmin() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveProduct(product) {
  const isNew = !product.id;
  const payload = {
    name: product.name,
    description: product.description || "",
    price: Number(product.price) || 0,
    category: product.category || "Diverse",
    image_url: product.image_url || "",
    badge: product.badge || null,
    active: product.active !== undefined ? product.active : true,
    fields: product.fields || []
  };
  if (isNew) {
    const { data, error } = await supabase.from("products").insert([payload]).select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from("products").update(payload).eq("id", product.id).select().single();
    if (error) throw error;
    return data;
  }
}

export async function toggleProductActiveState(productId, newActiveState) {
  const { error } = await supabase.from("products").update({ active: newActiveState }).eq("id", productId);
  if (error) throw error;
}

export async function deleteProduct(productId) {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

// ==============================================================================
// CATEGORII
// ==============================================================================

export const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Lămpi Litofanie", display_order: 1 },
  { id: "cat-2", name: "Brelocuri", display_order: 2 },
  { id: "cat-3", name: "Rame & Cadouri", display_order: 3 },
  { id: "cat-4", name: "Bucătărie & Evenimente", display_order: 4 },
  { id: "cat-5", name: "Diverse", display_order: 5 }
];

export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.warn("[Categories] Tabela 'categories' nu este inca creata in Supabase, incercam fallback din produse:", error.message);
      try {
        const { data: prods } = await supabase.from("products").select("category");
        if (prods && prods.length > 0) {
          const names = Array.from(new Set(prods.map(p => p.category).filter(Boolean)));
          return names.map((name, i) => ({ id: `cat-prod-${i}`, name, display_order: i + 1 }));
        }
      } catch {}
      return DEFAULT_CATEGORIES;
    }

    if (!data || data.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return data;
  } catch (err) {
    console.warn("[Categories] Exceptie la citire categorii:", err);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategory(category) {
  const isNew = !category.id || String(category.id).startsWith("cat-");
  const payload = {
    name: category.name.trim(),
    ...(category.icon && { icon: category.icon.trim() }),
    ...(category.display_order !== undefined ? { display_order: Number(category.display_order) } : { display_order: 0 })
  };

  if (isNew) {
    const { data, error } = await supabase
      .from("categories")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", category.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

// ==============================================================================
// UPLOAD FISIERE (Supabase Storage)
// ==============================================================================

export async function uploadCustomerFile(file) {
  if (!file) return null;
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanName}`;
  const { error } = await supabase.storage.from("customer-uploads").upload(uniqueFileName, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from("customer-uploads").getPublicUrl(uniqueFileName);
  return { url: publicUrlData.publicUrl, filename: file.name, storagePath: uniqueFileName };
}

export async function uploadProductImage(file) {
  if (!file) return null;
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFileName = `product_${Date.now()}_${cleanName}`;
  const { error } = await supabase.storage.from("product-images").upload(uniqueFileName, file, { cacheControl: "3600", upsert: true });
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(uniqueFileName);
  return publicUrlData.publicUrl;
}

// ==============================================================================
// COMENZI
// ==============================================================================

export async function placeOrder({ customer_name, customer_phone, customer_address, customer_email = "", customer_notes = "", total, items = [] }) {
  const { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .insert([{ customer_name, customer_phone, customer_address, customer_email, customer_notes, status: "noua", total: Number(total) }])
    .select()
    .single();
  if (orderErr) throw orderErr;

  if (items && items.length > 0) {
    const orderItemsPayload = items.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id?.length === 36 ? item.product_id : null,
      product_name: item.product_name,
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
      customization: item.customization || {}
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsPayload);
    if (itemsErr) console.warn("Atentie: eroare la inserarea articolelor comenzii:", itemsErr);
  }

  return { success: true, order: orderData };
}

const ORDER_SELECT = `
  id,
  customer_name,
  customer_phone,
  customer_address,
  customer_email,
  customer_notes,
  status,
  total,
  created_at,
  items:order_items (
    id,
    order_id,
    product_id,
    product_name,
    price,
    quantity,
    customization
  )
`;

export async function fetchOrdersAdmin(statusFilter = "toate") {
  let query = supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
  if (statusFilter && statusFilter !== "toate") {
    query = query.eq("status", statusFilter);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId, newStatus) {
  const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  if (error) throw error;
}

export async function fetchCustomerOrders(customerEmail) {
  if (!customerEmail) return [];
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .ilike("customer_email", customerEmail.trim().toLowerCase())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ==============================================================================
// RECENZII
// ==============================================================================

export async function fetchProductReviews(productId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveProductReview({ product_id, author_name, author_location = "Romania", rating = 5, title, comment }) {
  const { data, error } = await supabase
    .from("reviews")
    .insert([{
      product_id,
      author_name: author_name.trim(),
      author_location: (author_location || "Romania").trim(),
      rating: Number(rating),
      title: title ? title.trim() : "Recomand cu incredere!",
      comment: comment.trim(),
      verified_purchase: true,
      helpful_count: 0
    }])
    .select()
    .single();
  if (error) throw error;
  return { success: true, review: data };
}

/**
 * Apreciere recenzie - necesita functie RPC in Supabase SQL Editor:
 * CREATE OR REPLACE FUNCTION increment_review_helpful(review_id uuid)
 * RETURNS void LANGUAGE sql AS
 * $$ UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = review_id; $$;
 */
export async function likeProductReview(reviewId) {
  const { error } = await supabase.rpc("increment_review_helpful", { review_id: reviewId });
  if (error) console.warn("likeProductReview RPC error:", error);
}

// ==============================================================================
// WISHLIST - Salvare în Supabase (user_wishlist table, per utilizator autentificat)
// ==============================================================================

/**
 * Preia lista de favorite a utilizatorului curent din baza de date.
 * Returnează un array de product_id-uri (string/uuid).
 */
export async function getCustomerWishlist() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('user_wishlist')
    .select('product_id')
    .eq('user_id', user.id);
  if (error) {
    console.warn('getCustomerWishlist error:', error.message);
    return [];
  }
  return (data || []).map(row => row.product_id);
}

/**
 * Adaugă sau șterge un produs din favoritele utilizatorului curent.
 * Returnează { wishlist: string[], isAdded: boolean }.
 */
export async function toggleCustomerWishlist(productId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { wishlist: [], isAdded: false };

  // Verifică dacă există deja
  const { data: existing } = await supabase
    .from('user_wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  let isAdded;
  if (existing) {
    // Șterge din favorite
    await supabase
      .from('user_wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
    isAdded = false;
  } else {
    // Adaugă la favorite
    await supabase
      .from('user_wishlist')
      .insert({ user_id: user.id, product_id: productId });
    isAdded = true;
  }

  const wishlist = await getCustomerWishlist();
  return { wishlist, isAdded };
}

// ==============================================================================
// ANALYTICS - TRACKING VIZITATORI
// ==============================================================================

/**
 * Înregistrează o vizită nouă în tabela page_visits.
 * @param {Object} opts - { platform, referrer, page, session_id }
 */
export async function trackPageVisit({ platform = null, referrer = null, page = '/', session_id = null } = {}) {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('page_visits').insert({
      platform: platform || null,
      referrer: referrer || null,
      page: page || '/',
      session_id: session_id || null,
      user_agent: navigator?.userAgent?.substring(0, 300) || null,
    });
  } catch (e) {
    // Silențios – nu blocăm UI-ul pentru tracking
    console.debug('[Analytics] Eroare track vizită:', e.message);
  }
}

/**
 * Returnează statistici agregate pentru admin.
 */
export async function fetchVisitStats() {
  if (!isSupabaseConfigured()) return null;
  try {
    // Total vizite
    const { count: total } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true });

    // Vizite azi
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: today } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());

    // Vizite ultima săptămână
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const { count: thisWeek } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString());

    // Distribuție per platformă
    const { data: byPlatform } = await supabase
      .from('page_visits')
      .select('platform')
      .not('platform', 'is', null);

    const platformMap = {};
    (byPlatform || []).forEach(row => {
      const key = row.platform || 'direct';
      platformMap[key] = (platformMap[key] || 0) + 1;
    });

    // Vizite pe ultimele 14 zile (pentru grafic)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
    twoWeeksAgo.setHours(0, 0, 0, 0);
    const { data: recentRows } = await supabase
      .from('page_visits')
      .select('created_at, platform')
      .gte('created_at', twoWeeksAgo.toISOString())
      .order('created_at', { ascending: true });

    // Grupare pe zi
    const dailyMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = 0;
    }
    (recentRows || []).forEach(row => {
      const key = row.created_at.split('T')[0];
      if (key in dailyMap) dailyMap[key]++;
    });

    return {
      total: total || 0,
      today: today || 0,
      thisWeek: thisWeek || 0,
      byPlatform: platformMap,
      dailyChart: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
    };
  } catch (e) {
    console.error('[Analytics] Eroare fetchVisitStats:', e);
    return null;
  }
}

/**
 * Returnează ultimele N vizite (detaliate) pentru tabelul din admin.
 */
export async function fetchRecentVisits(limit = 100) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('page_visits')
    .select('id, created_at, platform, referrer, page, session_id, user_agent')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[Analytics] Eroare fetchRecentVisits:', error);
    return [];
  }
  return data || [];
}
