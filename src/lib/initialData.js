// Date inițiale extinse pentru catalogul de produse 3D personalizate
export const INITIAL_PRODUCTS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Lampă Litofanie Curbată cu Bază din Lemn",
    description: "O amintire unică transformată în lumină caldă. Poza ta preferată este sculptată în relief 3D micrometric și devine vizibilă la aprinderea luminii LED din spate. Bază elegantă din lemn natural cu alimentare USB.",
    long_description: "Lampa Litofanie Curbată este una dintre cele mai spectaculoase creații ale atelierului nostru. Tehnica litofaniei folosește grosimi variabile de material translucid: zonele mai groase blochează parțial lumina creând umbre adânci, în timp ce zonele subțiri permit luminii să treacă cu generozitate, formând tonurile luminoase ale imaginii tale. Rezultatul este o fotografie 3D sculptată ce prinde viață imediat ce aprinzi lumina LED caldă din interior.\n\nFiecare piesă este modelată individual pe baza fotografiei încărcate de tine, printată la o rezoluție micrometrică de 0.12mm (peste 14 ore de lucru continuu) și montată manual pe o bază artizanală din lemn natural tratat cu uleiuri ecologice.",
    price: 189.00,
    category: "Lămpi Litofanie",
    image_url: "/images/products/lampa-litofanie.jpg",
    gallery: [
      "/images/products/lampa-litofanie.jpg",
      "/images/products/lampa-litofanie-2.jpg",
      "/images/products/rama-litofanie.jpg"
    ],
    badge: "Bestseller",
    active: true,
    specs: {
      "Material sculptură": "PLA Organic translucid de înaltă densitate",
      "Bază lampă": "Lemn natural de fag finisat manual",
      "Dimensiuni": "18.5 cm (lățime) x 14.5 cm (înălțime) x 8 cm (adâncime)",
      "Rezoluție printare": "0.12 mm per strat (Fine Craft Quality)",
      "Timp producție": "14 - 18 ore de imprimare continuă",
      "Iluminare": "Modul LED economic de durată lungă (>35.000 ore)",
      "Alimentare": "Cablu USB 5V de 1.2m cu comutator On/Off inclus",
      "Garanție": "24 luni pentru modulul LED și structură"
    },
    highlights: [
      "Gravură personalizată opțională pe baza din lemn masiv",
      "Două opțiuni de nuanță LED: Cald Romantic sau Neutru Natural",
      "Ambalat în cutie de cadou ecologică cu protecție antishoc",
      "Cablu USB inclus compatibil cu orice încărcător de telefon sau laptop"
    ],
    package_contents: [
      "Panou litofanie curbat personalizat cu fotografia ta",
      "Bază din lemn natural cu modul LED integrat",
      "Cablu de alimentare USB cu comutator On/Off (1.2m)",
      "Ghid de îngrijire & certificat artizanal de autenticitate"
    ],
    care_instructions: "Pentru curățare, șterge ușor cu o lavetă uscată sau ușor umedă din microfibră. Evită expunerea directă la soare arzător de vară sau temperaturi de peste 55°C.",
    faq: [
      {
        q: "Ce fel de fotografie trebuie să încarc?",
        a: "Orice fotografie clară funcționează excelent: portrete de familie, cupluri, animale de companie sau peisaje. Echipa noastră optimizează contrastul fotografiei înainte de imprimare pentru a asigura detalii maxime."
      },
      {
        q: "Cum se alimentează lampa?",
        a: "Prin cablul USB inclus. O poți conecta la orice încărcător clasic de telefon, la o baterie externă sau la portul USB al calculatorului."
      },
      {
        q: "Cât durează realizarea și expedierea?",
        a: "Modelarea și imprimarea durează 1-2 zile lucrătoare, iar livrarea prin curier rapid ajunge la ușa ta în 24-48h oriunde în România."
      }
    ],
    fields: [
      {
        key: "photo",
        label: "Fotografia ta pentru litofanie (calitate cât mai clară)",
        type: "image",
        required: true
      },
      {
        key: "dedication",
        label: "Text scurt gravat pe bază (opțional)",
        type: "text",
        required: false,
        max_length: 35
      },
      {
        key: "light_temp",
        label: "Nuanță lumină LED",
        type: "select",
        required: true,
        options: ["Alb Cald Romantic (2700K)", "Alb Neutru Natural (4000K)"]
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Breloc Auto 3D Personalizat cu Număr sau Nume",
    description: "Breloc rezistent imprimat 3D în relief, perfect pentru cheile mașinii sau ale casei tale. Design modern bi-color, finisaj catifelat și inel metalic inclus.",
    long_description: "Un accesoriu modern și rezistent ce adaugă o notă distinctivă cheilor tale. Imprimat prin tehnologie FDM multi-material de înaltă rezoluție, brelocul combină o bază solidă texturată cu litere 3D în relief proeminent.\n\nMaterialul folosit este un compozit PLA+ cu rezistență mecanică sporită la uzură zilnică, zgârieturi și șocuri ușoare. Inelul metalic plat din oțel inoxidabil este inclus și deja montat.",
    price: 39.00,
    category: "Brelocuri",
    image_url: "/images/products/breloc-personalizat.jpg",
    gallery: [
      "/images/products/breloc-personalizat.jpg",
      "/images/products/breloc-personalizat-2.jpg"
    ],
    badge: "Nou",
    active: true,
    specs: {
      "Material": "PLA+ compozit armat de înaltă durabilitate",
      "Dimensiuni corp": "6.8 cm x 2.8 cm x 0.5 cm (fără inel)",
      "Inel chei": "Oțel inoxidabil plat lustruit (diametru 28 mm)",
      "Tehnologie": "Imprimare 3D bi-strat fără lipire (strat fuzionat)",
      "Greutate": "Doar 14 grame - nu îngreunează butucul de contact"
    },
    highlights: [
      "Text 3D proeminent rezistent la frecare în buzunar",
      "Paletă elegantă de culori metalizate și mate",
      "Inel din oțel inoxidabil premium inclus",
      "Personalizabil cu orice număr auto sau nume (până la 14 caractere)"
    ],
    package_contents: [
      "Breloc 3D personalizat cu textul ales",
      "Inel metalic din oțel inoxidabil montat",
      "Pliculeț artizanal din hârtie kraft gata de oferit cadou"
    ],
    care_instructions: "Rezistent la apă și stropi. Se curăță cu apă și săpun obișnuit dacă este nevoie.",
    faq: [
      {
        q: "Se șterg literele în timp?",
        a: "Nu! Literele nu sunt vopsite sau lipite, ci sunt imprimate ca un strat solid de material 3D fuzionat direct cu baza brelocului."
      },
      {
        q: "Pot pune spațiu sau liniuță între litere?",
        a: "Da, poți introduce orice combinație de litere mari, cifre, spații sau cratime."
      }
    ],
    fields: [
      {
        key: "custom_text",
        label: "Nume sau număr înmatriculare",
        type: "text",
        required: true,
        max_length: 14
      },
      {
        key: "color_primary",
        label: "Culoare text 3D",
        type: "select",
        required: true,
        options: ["Cupru / Teracotă Metalizat", "Auriu Regal Mătăsos", "Alb Mat", "Verde Salvie"]
      },
      {
        key: "color_base",
        label: "Culoare bază breloc",
        type: "select",
        required: true,
        options: ["Negru Mat Texturat", "Gri Titan Ardezie", "Albastru Marin"]
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Ramă Foto 3D Litofanie cu Șevalet de Birou",
    description: "O reinterpretare modernă a ramelor foto clasice. Rama 3D în stil vintage art nouveau înrămează o litofanie translucidă ce dezvăluie detaliile fețelor celor dragi. Include șevalet minimalist din lemn.",
    long_description: "O piesă de decor romantică și plină de nostalgie. Rama exterioară este sculptată cu motive filigranate elegante, evocând măiestria atelierelor europene de la începutul secolului XX. În interior, litofania din material compozit redă fidel fotografia ta dragă cu o finețe remarcabilă.\n\nPlasată lângă o fereastră sau o sursă de lumină, poza prinde viață imediat. Șevaletul pliabil din lemn natural permite așezarea pe birou, noptieră sau consolă.",
    price: 145.00,
    category: "Rame & Cadouri",
    image_url: "/images/products/rama-litofanie.jpg",
    gallery: [
      "/images/products/rama-litofanie.jpg",
      "/images/products/lampa-litofanie-2.jpg"
    ],
    badge: "Emoționant",
    active: true,
    specs: {
      "Material ramă": "Filament sculptat fin (nuanță Crem Fildeș sau Alb Mat)",
      "Panou foto": "Litofanie 3D de precizie micrometrică",
      "Șevalet": "Lemn natural de mesteacăn pliabil inclus",
      "Dimensiuni ramă": "16 cm x 13 cm x 2.2 cm",
      "Dimensiune foto activă": "11.5 cm x 8.5 cm",
      "Personalizare spate": "Mesaj text gravat pe spatele ramei inclus"
    },
    highlights: [
      "Șevalet din lemn natural inclus în pachet",
      "Mesaj sau dată aniversară gravată discret pe spatele ramei",
      "Finisaj catifelat mat fără reflexii deranjante",
      "Cadoul ideal pentru aniversări, bunici, nași sau părinți"
    ],
    package_contents: [
      "Ramă sculptată 3D cu litofanie personalizată montată",
      "Șevalet de birou din lemn natural",
      "Cutie de protecție căptușită"
    ],
    care_instructions: "Ștergeți cu lavetă uscată din microfibră. Nu spălați în mașina de spălat vase.",
    faq: [
      {
        q: "Trebuie să stea mereu la lumină?",
        a: "Litofania are farmec și privită normal, dar efectul magic 3D apare când în spatele ei pătrunde lumină naturală de la fereastră sau lumina unei lămpi de birou."
      },
      {
        q: "Ce text pot grava pe spate?",
        a: "Oricare: de la o urare caldă ('Pentru cei mai dragi părinți'), la o dată importantă ('14 Octombrie 2026') sau un citat drag."
      }
    ],
    fields: [
      {
        key: "photo",
        label: "Fotografia de înrămat",
        type: "image",
        required: true
      },
      {
        key: "frame_style",
        label: "Stil ramă sculptată",
        type: "select",
        required: true,
        options: ["Clasic Art Nouveau (Crem Fildeș)", "Modern Minimalist (Alb Mat)", "Vintage Romantic"]
      },
      {
        key: "back_message",
        label: "Mesaj cu dedicație (gravat pe spatele ramei)",
        type: "text",
        required: false,
        max_length: 50
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Formă Prăjituri Personalizată cu Nume & Eveniment",
    description: "Adaugă un detaliu memorabil la nunți, botezuri, aniversări sau în bucătăria ta. Imprimată din filament certificat alimentar (Food-Safe PLA), creează fursecuri crocante cu litere bine conturate.",
    long_description: "Transformă fiecare prăjitură într-o amintire dulce și spectaculoasă! Forma noastră personalizată include două componente ingenioase: un contur de tăiere cu margine ascuțită pentru decuparea aluatului și o ștampilă embosată cu numele, data sau mesajul tău.\n\nFabricată exclusiv din filament certificat Food-Safe (PLA alimentar), testat pentru contact direct cu ingredientele de patiserie. Literele adânci garantează că mesajul va rămâne clar vizibil și după coacerea prăjiturilor în cuptor.",
    price: 49.00,
    category: "Bucătărie & Evenimente",
    image_url: "/images/products/forma-biscuiti.jpg",
    gallery: [
      "/images/products/forma-biscuiti.jpg"
    ],
    badge: "Popular",
    active: true,
    specs: {
      "Material": "Food-Safe PLA certificat (aprobat pentru contact alimentar)",
      "Sistem": "2 piese: Inel tăietor exterior + Ștampilă embosare cu mâner",
      "Dimensiuni": "Dreptunghi: 7x5 cm | Cerc: diametru 6.5 cm | Inimă: 7x6.5 cm",
      "Adâncime ștanțare": "2.5 mm pentru contur impecabil după coacere",
      "Grosime perete tăiere": "0.8 mm pentru o tăiere curată fără destrămarea aluatului"
    },
    highlights: [
      "Filament 100% sigur pentru contactul cu alimentele",
      "Include rețeta noastră secretă de aluat care nu se deformează la copt",
      "Litere adânci și clare ideale pentru fondanți sau biscuiți clasici",
      "Ușor de utilizat chiar și de către copii"
    ],
    package_contents: [
      "Formă exterioară de tăiere aluat",
      "Ștampilă de presare cu mâner ergonomic și text personalizat",
      "Fișă laminată cu instrucțiuni și rețetă testată de biscuiți artizanali"
    ],
    care_instructions: "Spălați doar manual cu apă călduță și detergent lichid de vase. NU introduceți în mașina de spălat vase sau în apă fierbinte (>50°C).",
    faq: [
      {
        q: "Aluatul nu se lipește în litere?",
        a: "Secretul este să presari puțină făină sau amidon pe ștampilă înainte de presare și să folosești un aluat rece de la frigider fără praf de copt în exces."
      },
      {
        q: "Este sigură pentru mâncare?",
        a: "Absolut da. Folosim filamente speciale certificate food-grade, produse în Uniunea Europeană special pentru ustensile de cofetărie."
      }
    ],
    fields: [
      {
        key: "cookie_text",
        label: "Textul ștampilei",
        type: "text",
        required: true,
        max_length: 20
      },
      {
        key: "cookie_shape",
        label: "Formă tăietor",
        type: "select",
        required: true,
        options: ["Dreptunghi rotunjit (7x5 cm)", "Cerc clasic (diametru 6.5 cm)", "Inimioară dulce"]
      },
      {
        key: "color_choice",
        label: "Culoare formă",
        type: "select",
        required: true,
        options: ["Verde Salvie Pastel", "Roz Pudră Cald", "Galben Vanilie"]
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Veioză Sferică Lună 3D cu Siluetă de Familie",
    description: "Glob sferic 3D cu textura reală a craterelor selenare conform hărților NASA, personalizat cu silueta familiei sau a cuplului tău și o dedicație secretă. Stand geometric din lemn masiv inclus.",
    long_description: "O capodoperă a modelării 3D care combină astronomia de precizie cu cele mai intime amintiri de familie. Textura exterioară a lunii reproduce fidel craterele și mările selenare după scanările topografice NASA. La pornirea luminii, pe suprafața translucidă a lunii se dezvăluie silueta în relief a celor dragi și mesajul tău.\n\nGlobul sferic este imprimat într-o singură bucată fără îmbinări inestetice (peste 26 de ore de print continuu). Standul geometric din lemn masiv oferă stabilitate perfectă și o estetică scandinavă deosebită.",
    price: 219.00,
    category: "Lămpi Litofanie",
    image_url: "/images/products/lampa-luna.jpg",
    gallery: [
      "/images/products/lampa-luna.jpg",
      "/images/products/lampa-luna-2.jpg",
      "/images/products/lampa-litofanie-2.jpg"
    ],
    badge: "Top Cadou",
    active: true,
    specs: {
      "Diametru sferă": "15 cm (standard) sau 18 cm (Grande)",
      "Bază": "Stand geometric din lemn masiv de stejar/frasin",
      "Cartografie": "Replică 1:1 a reliefului lunar NASA",
      "Iluminare": "LED dual cu nuanță caldă relaxantă",
      "Timp imprimare": "26 - 32 ore neîntrerupte de printare FDM",
      "Alimentare": "Cablu USB inclus (5V, consum ultra-redus)",
      "Garanție": "24 luni"
    },
    highlights: [
      "Topografie selenară autentică NASA imprimată 3D fără lipituri",
      "Siluetă de cuplu sau familie sculptată în stratul translucid",
      "Stand geometric din lemn masiv nobil inclus",
      "Lumină difuză ideală ca lampă de veghe pentru dormitor sau living"
    ],
    package_contents: [
      "Glob sferic lună 3D personalizat",
      "Stand geometric din lemn masiv",
      "Cablu USB de alimentare de calitate superioară",
      "Cutie căptușită cu spumă de protecție pentru transport"
    ],
    care_instructions: "Ștergeți praful cu un pămătuf moale sau o lavetă uscată. Nu folosiți solvenți chimici.",
    faq: [
      {
        q: "Cum trimit poza pentru siluetă?",
        a: "Încarcă o poză clară cu profilul sau silueta persoanelor dragi în formularul de comandă. Designerii noștri conturează manual silueta pentru a se potrivi perfect pe curbura sferei."
      },
      {
        q: "Se încălzește globul la funcționare prelungită?",
        a: "Nu! Folosim becuri LED profesionale de joasă tensiune care rămân reci la atingere chiar și după 24 de ore de funcționare continuă."
      }
    ],
    fields: [
      {
        key: "silhouette_photo",
        label: "Fotografie cu persoanele pentru siluetă",
        type: "image",
        required: true
      },
      {
        key: "engraving",
        label: "Text dedicat (opțional)",
        type: "text",
        required: false,
        max_length: 40
      },
      {
        key: "diameter",
        label: "Dimensiune sferă",
        type: "select",
        required: true,
        options: ["15 cm (Recomandat - Stand Inclus)", "18 cm Grande (+35 Lei)"]
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

// Recenzii produse
export const INITIAL_REVIEWS = [];

// Comenzi
export const INITIAL_ORDERS = [];
