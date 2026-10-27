// SUPABASE EDGE FUNCTION: notify-new-order
// Deploy: npx supabase functions deploy notify-new-order
// Sau copiaza continutul direct in Supabase Dashboard > Edge Functions > notify-new-order
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'ciocangeorge97@gmail.com';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://scoatem3d.ro';

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      Authorization: 'Bearer ' + RESEND_API_KEY 
    },
    body: JSON.stringify({
      from: 'Scoatem3D <onboarding@resend.dev>',
      reply_to: ['ciocangeorge97@gmail.com'],
      to: [to],
      subject,
      html
    }),
  });
  const data = await res.json();
  console.log('Resend response for', to, ':', JSON.stringify(data));
  return data;
}

function formatCustomization(cust: any) {
  if (!cust || typeof cust !== 'object') return '';
  const entries = Object.entries(cust).filter(([k]) => !k.endsWith('_filename'));
  if (!entries.length) return '';
  
  return '<div style="margin-top:6px;font-size:0.83rem;color:#7A6560;background:#F8F4EE;padding:6px 10px;border-radius:6px;display:inline-block;max-width:100%">' +
    entries.map(([k, v]) => {
      const label = k.replace(/_/g, ' ');
      if (typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'))) {
        return '<div style="margin:2px 0"><strong>' + label + ':</strong> <a href="' + v + '" target="_blank" style="color:#C85A32;text-decoration:underline">Fișier atașat</a></div>';
      }
      return '<div style="margin:2px 0"><strong>' + label + ':</strong> ' + String(v) + '</div>';
    }).join('') +
    '</div>';
}

function customerEmail(order: any, items: any[]) {
  const rows = (items || []).map(i => {
    const name = i.product_name || i.name || 'Produs';
    const custHtml = formatCustomization(i.customization);
    const qty = i.quantity || 1;
    const price = Number(i.price) || 0;
    const lineTotal = (price * qty).toFixed(2);

    return '<tr>' +
      '<td style="padding:12px 8px;border-bottom:1px solid #EFE9DF">' +
        '<div style="font-weight:700;color:#2B2118">' + name + '</div>' +
        custHtml +
      '</td>' +
      '<td style="padding:12px 8px;border-bottom:1px solid #EFE9DF;text-align:center;color:#5A4A42">' + qty + 'x</td>' +
      '<td style="padding:12px 8px;border-bottom:1px solid #EFE9DF;text-align:right;font-weight:700;color:#2B2118">' + lineTotal + ' Lei</td>' +
    '</tr>';
  }).join('');

  return '<!DOCTYPE html><html lang="ro"><body style="margin:0;padding:0;background:#FAF6F0;font-family:Arial,sans-serif">' +
    '<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EFE9DF;box-shadow:0 4px 16px rgba(0,0,0,0.04)">' +
      '<div style="background:linear-gradient(135deg,#C85A32,#D4785A);padding:32px 24px;text-align:center">' +
        '<h1 style="color:#fff;margin:0;font-size:1.5rem">Comanda ta a fost primită!</h1>' +
        '<p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:0.95rem">Scoatem3D &mdash; Obiecte 3D & Lumânări Artizanale</p>' +
      '</div>' +
      '<div style="padding:28px 24px">' +
        '<p style="font-size:1rem;color:#2B2118">Bună, <strong>' + (order.customer_name || 'Client') + '</strong>!</p>' +
        '<p style="color:#5A4A42;line-height:1.6">Îți mulțumim pentru comanda plasată. Ne-am apucat deja de pregătirea produselor tale.</p>' +
        '<div style="background:#FBF8F4;border-radius:12px;padding:16px;margin:20px 0;border:1px solid #EFE9DF">' +
          '<p style="margin:0 0 10px;font-weight:700;color:#C85A32;font-size:0.95rem">Comanda #' + (order.id || '').slice(0,8).toUpperCase() + '</p>' +
          '<p style="margin:4px 0;color:#4B3F38"><strong>Adresă de livrare:</strong> ' + (order.customer_address || '—') + '</p>' +
          '<p style="margin:4px 0;color:#4B3F38"><strong>Telefon:</strong> ' + (order.customer_phone || '—') + '</p>' +
          (order.customer_notes ? '<p style="margin:4px 0;color:#4B3F38"><strong>Mențiuni:</strong> ' + order.customer_notes + '</p>' : '') +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse;margin-top:16px">' +
          '<thead>' +
            '<tr>' +
              '<th style="padding:10px 8px;text-align:left;border-bottom:2px solid #EFE9DF;color:#7A6560;font-size:0.85rem">PRODUS</th>' +
              '<th style="padding:10px 8px;text-align:center;border-bottom:2px solid #EFE9DF;color:#7A6560;font-size:0.85rem">CANT.</th>' +
              '<th style="padding:10px 8px;text-align:right;border-bottom:2px solid #EFE9DF;color:#7A6560;font-size:0.85rem">TOTAL</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + rows + '</tbody>' +
          '<tfoot>' +
            '<tr>' +
              '<td colspan="2" style="padding:14px 8px;font-weight:700;font-size:1.05rem;color:#2B2118">TOTAL COMANDĂ:</td>' +
              '<td style="padding:14px 8px;font-weight:800;color:#C85A32;font-size:1.15rem;text-align:right">' + Number(order.total || 0).toFixed(2) + ' Lei</td>' +
            '</tr>' +
          '</tfoot>' +
        '</table>' +
        '<div style="background:#ECFDF5;border-radius:10px;padding:14px;border-left:4px solid #10B981;margin:24px 0">' +
          '<p style="margin:0;color:#065F46;font-size:0.9rem"><strong>Timp estimat:</strong> Producție 1-2 zile + livrare 24-48h. <strong>Plată:</strong> Ramburs la curier.</p>' +
        '</div>' +
        '<p style="color:#7A6560;font-size:0.88rem">Ai întrebări? Ne găsești oricând pe WhatsApp: <a href="https://wa.me/40763409836" style="color:#C85A32;font-weight:700;text-decoration:none">0763 409 836</a></p>' +
      '</div>' +
      '<div style="background:#FBF8F4;padding:16px 24px;text-align:center;border-top:1px solid #EFE9DF">' +
        '<p style="margin:0;font-size:0.8rem;color:#A08878">Scoatem3D România &mdash; <a href="' + SITE_URL + '" style="color:#C85A32;text-decoration:none">' + SITE_URL + '</a></p>' +
      '</div>' +
    '</div>' +
  '</body></html>';
}

function adminEmail(order: any, items: any[]) {
  const rows = (items || []).map(i => {
    const name = i.product_name || i.name || 'Produs';
    const custHtml = formatCustomization(i.customization);
    const qty = i.quantity || 1;
    const price = Number(i.price) || 0;
    const lineTotal = (price * qty).toFixed(2);

    return '<div style="background:#F9FAFB;border-radius:10px;padding:14px;margin-bottom:12px;border:1px solid #E5E7EB">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<strong style="font-size:1rem;color:#111827">' + qty + 'x ' + name + '</strong>' +
        '<span style="color:#C85A32;font-weight:700">' + lineTotal + ' Lei</span>' +
      '</div>' +
      (custHtml ? '<div style="margin-top:8px">' + custHtml + '</div>' : '<div style="margin-top:6px;font-size:0.82rem;color:#9CA3AF">Fără personalizare specifică</div>') +
    '</div>';
  }).join('');

  return '<!DOCTYPE html><html lang="ro"><body style="margin:0;padding:16px;background:#F3F4F6;font-family:Arial,sans-serif">' +
    '<div style="max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB">' +
      '<div style="background:#1F2937;padding:20px 24px">' +
        '<h2 style="color:#fff;margin:0;font-size:1.25rem">Comandă Nouă pe Scoatem3D</h2>' +
        '<p style="color:#9CA3AF;margin:4px 0 0;font-size:0.85rem">ID: #' + (order.id || '').slice(0,8).toUpperCase() + ' &bull; ' + new Date().toLocaleString('ro-RO') + '</p>' +
      '</div>' +
      '<div style="padding:20px 24px">' +
        '<div style="background:#FEF3C7;border-radius:8px;padding:14px;margin-bottom:16px;border-left:4px solid #F59E0B">' +
          '<p style="margin:0;font-weight:700;color:#92400E;font-size:1.1rem">Total Comandă: ' + Number(order.total || 0).toFixed(2) + ' Lei</p>' +
        '</div>' +
        '<h4 style="margin:0 0 10px;color:#374151;text-transform:uppercase;font-size:0.8rem;letter-spacing:0.5px">Date Client</h4>' +
        '<div style="background:#F9FAFB;padding:12px 16px;border-radius:8px;margin-bottom:20px;border:1px solid #E5E7EB">' +
          '<p style="margin:4px 0;color:#374151"><strong>Nume:</strong> ' + (order.customer_name || '—') + '</p>' +
          '<p style="margin:4px 0;color:#374151"><strong>Telefon:</strong> <a href="tel:' + order.customer_phone + '" style="color:#C85A32;font-weight:700">' + (order.customer_phone || '—') + '</a></p>' +
          '<p style="margin:4px 0;color:#374151"><strong>Email:</strong> ' + (order.customer_email || '—') + '</p>' +
          '<p style="margin:4px 0;color:#374151"><strong>Adresă:</strong> ' + (order.customer_address || '—') + '</p>' +
          (order.customer_notes ? '<p style="margin:6px 0 0;color:#374151;background:#fff;padding:6px 10px;border-radius:4px;border:1px dashed #D1D5DB"><strong>Mențiuni:</strong> ' + order.customer_notes + '</p>' : '') +
        '</div>' +
        '<h4 style="margin:0 0 10px;color:#374151;text-transform:uppercase;font-size:0.8rem;letter-spacing:0.5px">Produse Comandate (' + (items ? items.length : 0) + ')</h4>' +
        rows +
        '<div style="margin-top:20px;text-align:center">' +
          '<a href="' + SITE_URL + '/#/admin" style="display:inline-block;background:#C85A32;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem">Deschide Panoul Admin</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</body></html>';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
      } 
    });
  }

  try {
    const body = await req.json();
    const order = body.order || body.record;
    const items = body.items || [];

    if (!order) {
      return new Response(JSON.stringify({ error: 'Datele comenzii lipsesc' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: true, message: 'Email omis (fără RESEND_API_KEY)' }), { 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      });
    }

    const results = [];

    // 1. Email confirmare către client
    if (order.customer_email) {
      const custSubject = 'Comanda ta Scoatem3D #' + (order.id || '').slice(0,8).toUpperCase() + ' a fost primită!';
      const custRes = await sendEmail(order.customer_email, custSubject, customerEmail(order, items));
      results.push({ type: 'customer', result: custRes });
    }

    // 2. Email notificare către admin
    const adminSubject = 'Comandă nouă #' + (order.id || '').slice(0,8).toUpperCase() + ' - ' + order.customer_name + ' (' + Number(order.total || 0).toFixed(2) + ' Lei)';
    const adminRes = await sendEmail(ADMIN_EMAIL, adminSubject, adminEmail(order, items));
    results.push({ type: 'admin', result: adminRes });

    return new Response(JSON.stringify({ success: true, results }), { 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }
});
