export type Audience = "men" | "women";

export type Category = {
  slug: string;
  title: string;
  description: string;
  audience: Audience;
  heroCopy: string;
  features: string[];
};

export type Product = {
  slug: string;
  title: string;
  description: string;
  audience: Audience;
  category: string;
  price: number;
  status?: "new" | "sale";
  specs: string[];
  colors: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  minutesToRead: number;
  sections: { heading?: string; body: string }[];
};

export type Faq = {
  question: string;
  answer: string;
};

export type ContactChannel = {
  label: string;
  value: string;
  description: string;
};

export type AdminModule = {
  slug: string;
  title: string;
  description: string;
  metrics: string[];
  cta: string;
};

export const categories: Category[] = [
  {
    slug: "sneakers",
    title: "Sneakers",
    description:
      "Street-ready silhouettes with breathable knit uppers and responsive midsoles.",
    audience: "men",
    heroCopy: "Built for downtown commutes and late-night sessions.",
    features: [
      "Recycled Flyknit",
      "BubbleSoft cushioning",
      "Grippy city tread",
    ],
  },
  {
    slug: "running",
    title: "Running",
    description:
      "Distance-tuned foams and rocker geometry for personal best pacing.",
    audience: "men",
    heroCopy: "Trim grams, add miles, keep energy high.",
    features: ["NitroVault midsole", "Stability rails", "Four-foot strike map"],
  },
  {
    slug: "sandals",
    title: "Sandals",
    description:
      "Water-friendly straps with plush cushioning for post-session recovery.",
    audience: "men",
    heroCopy: "Slip on comfort that still looks intentional.",
    features: ["Ripple traction", "MemoryCloud footbed", "Salt & sun proof"],
  },
  {
    slug: "lifestyle",
    title: "Lifestyle",
    description:
      "Soft leathers and tonal palettes that elevate everyday looks.",
    audience: "women",
    heroCopy: "City tailoring meets lounge-level comfort.",
    features: ["Foam-wrapped collar", "CloudFlex outsole", "Stain guard upper"],
  },
  {
    slug: "training",
    title: "Training",
    description:
      "Low-to-ground stability and wraparound support for everything studio.",
    audience: "women",
    heroCopy: "Dialed for HIIT, reformer, and every hybrid workout in between.",
    features: ["Tri-anchored lacing", "Stability chassis", "360° rubber wraps"],
  },
  {
    slug: "heels",
    title: "Heels",
    description:
      "Statement heels with dual-density cushioning and slip-resistant rubber.",
    audience: "women",
    heroCopy: "All-day poise with midnight durability.",
    features: ["Anti-sway shank", "Sculpted arch support", "Softskn straps"],
  },
];

export const products: Product[] = [
  {
    slug: "kinetic-air-runner",
    title: "Kinetic Air Runner",
    description:
      "Featherweight trainer with lateral carbon rods to return more energy every stride.",
    audience: "men",
    category: "running",
    price: 195,
    status: "new",
    specs: ["6 mm drop", "248 g", "NitroVault + Pebax plate"],
    colors: ["Obsidian", "Solar Burst", "Glacier"],
  },
  {
    slug: "orbit-city-sneaker",
    title: "Orbit City Sneaker",
    description:
      "Minimal leather upper paired with sculpted BubbleSoft cushioning for the commute.",
    audience: "men",
    category: "sneakers",
    price: 165,
    specs: ["Recycled leather", "BubbleSoft midsole", "CityGrip outsole"],
    colors: ["Stone", "Indigo"],
  },
  {
    slug: "shoreline-relief-sandal",
    title: "Shoreline Relief Sandal",
    description:
      "Recovery slide with dual-density memory foam and drainage grooves.",
    audience: "men",
    category: "sandals",
    price: 95,
    status: "sale",
    specs: ["HydroSafe straps", "MemoryCloud footbed", "Ripple traction"],
    colors: ["Deep Sea", "Signal Orange"],
  },
  {
    slug: "aura-lift-lifestyle",
    title: "Aura Lift Lifestyle",
    description:
      "Tone-on-tone leather sneaker with Softskn lining and hidden wedge lift.",
    audience: "women",
    category: "lifestyle",
    price: 178,
    status: "new",
    specs: ["Softskn leather", "CloudFlex outsole", "Hidden 20 mm lift"],
    colors: ["Ivory", "Wild Berry"],
  },
  {
    slug: "pulse-sync-trainer",
    title: "Pulse Sync Trainer",
    description:
      "Studio sneaker with 360° rubber wraps and tri-anchored lacing for explosive sets.",
    audience: "women",
    category: "training",
    price: 162,
    specs: ["Tri-anchored lacing", "Low 3 mm drop", "Stability chassis"],
    colors: ["Lilac", "Storm"],
  },
  {
    slug: "zenith-form-heel",
    title: "Zenith Form Heel",
    description:
      "12-hour heel featuring anti-sway shank and sculpted arch cushioning.",
    audience: "women",
    category: "heels",
    price: 210,
    status: "sale",
    specs: ["Anti-sway shank", "Softskn straps", "Slip-resistant rubber"],
    colors: ["Amber", "Noir"],
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "elevate-the-daily-commute",
    title: "Elevate the Daily Commute",
    excerpt:
      "Layer breathable knits with waterproof protection for the sprint between meetings.",
    author: "Lina Ortega",
    publishedAt: "2025-08-12",
    minutesToRead: 6,
    sections: [
      {
        body: "Commuting shoes need to move fast between climates. The Orbit City Sneaker uses coated leather on high splash zones and perforations elsewhere to breathe.",
      },
      {
        heading: "Layered Cushioning",
        body: "Stacking BubbleSoft foam over a firm crash pad stops heel drag on subway platforms while keeping your stride crisp on sidewalks.",
      },
      {
        heading: "Styling cues",
        body: "Monochrome palettes lengthen the leg line—pair Stone with crisp tailoring for instant polish.",
      },
    ],
  },
  {
    slug: "tempo-training-reset",
    title: "Tempo Training Reset",
    excerpt:
      "Rebuild stability after a heavy season with functional drills and the Pulse Sync Trainer.",
    author: "Coach Milo",
    publishedAt: "2025-06-05",
    minutesToRead: 8,
    sections: [
      {
        body: "Training plates should match the workout. Pulse Sync keeps you low to the ground so you can load glutes without rolling ankles.",
      },
      {
        heading: "Anchor points matter",
        body: "Tri-anchored lacing pulls from the arch, instep, and collar to wrap the foot evenly without hot spots.",
      },
    ],
  },
  {
    slug: "heels-that-go-the-distance",
    title: "Heels That Go the Distance",
    excerpt:
      "Zenith Form brings runway lines with commuter-level cushioning for 12-hour wear.",
    author: "Editorial Team",
    publishedAt: "2025-04-18",
    minutesToRead: 5,
    sections: [
      {
        heading: "Support without compromise",
        body: "An anti-sway shank resists torsion so you can sprint for the elevator without wobble.",
      },
      {
        heading: "Grip in disguise",
        body: "A micro-lug rubber forefoot disappears visually but locks in on slick lobby marble.",
      },
    ],
  },
];

export const faqs: Faq[] = [
  {
    question: "What is the delivery timeline?",
    answer:
      "Domestic orders ship within 24 hours and arrive in 2-4 business days. Express shipping is available at checkout.",
  },
  {
    question: "How do I start a return?",
    answer:
      "Initiate a return through your dashboard. Print the prepaid label and drop the parcel at any courier partner within 30 days.",
  },
  {
    question: "Do you offer product care guides?",
    answer:
      "Yes, every order includes a QR code linking to material-specific cleaning steps and storage tips.",
  },
];

export const contactChannels: ContactChannel[] = [
  {
    label: "Customer Care",
    value: "support@kimistore.com",
    description: "For order updates, returns, or account assistance.",
  },
  {
    label: "Flagship Studio",
    value: "+1 (646) 555-0147",
    description: "Mon–Sat, 9a–7p EST.",
  },
  {
    label: "Press",
    value: "press@kimistore.com",
    description: "Collaborations, editorials, and media requests.",
  },
];

export const aboutContent = {
  hero: "We design footwear that keeps up with life in constant motion.",
  pillars: [
    {
      title: "Human-Centered",
      detail:
        "Fits are drafted from 3D scans collected across three continents for inclusive sizing.",
    },
    {
      title: "Materially Responsible",
      detail:
        "71% of our line uses recycled or bio-based textiles without compromising longevity.",
    },
    {
      title: "Service Obsessed",
      detail:
        "We pair each launch with concierge services—text, chat, or video fittings on demand.",
    },
  ],
};

export const contentNav = {
  primary: [
    { label: "Men", href: "/men" },
    { label: "Women", href: "/women" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Sale", href: "/sale" },
    { label: "Blog", href: "/blog" },
  ],
  secondary: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
};

export const adminModules: AdminModule[] = [
  {
    slug: "products",
    title: "Product Management",
    description:
      "Launch new SKUs, sync inventory, and update merchandising badges in one board.",
    metrics: ["62 live styles", "18 low-stock alerts"],
    cta: "Open product board",
  },
  {
    slug: "categories",
    title: "Category Management",
    description:
      "Drag-and-drop categories, rename navigation labels, and define featured tiles.",
    metrics: ["6 live categories", "3 scheduled"],
    cta: "Edit taxonomy",
  },
  {
    slug: "orders",
    title: "Order Management",
    description:
      "Monitor fulfillment, fraud checks, and shipment statuses in real time.",
    metrics: ["128 open orders", "4 flagged"],
    cta: "Review pipeline",
  },
  {
    slug: "customers",
    title: "Customer Management",
    description:
      "Segment VIPs, resend invites, and export lifetime value reports.",
    metrics: ["41k profiles", "1.2k active today"],
    cta: "View segments",
  },
  {
    slug: "blog",
    title: "Blog Post Management",
    description:
      "Draft, schedule, and localize editorial stories powering the blog.",
    metrics: ["3 upcoming", "7 live"],
    cta: "Manage stories",
  },
  {
    slug: "cms",
    title: "CMS Page Management",
    description: "Edit About, Contact, and FAQ blocks with instant preview.",
    metrics: ["9 blocks", "2 drafts"],
    cta: "Edit content",
  },
  {
    slug: "discounts",
    title: "Discount Management",
    description:
      "Spin up limited codes, tiered promotions, and endpoints for loyalty partners.",
    metrics: ["4 active promos", "12 archived"],
    cta: "Create offer",
  },
  {
    slug: "admin-users",
    title: "Admin User Management",
    description: "Invite teammates, assign roles, and review security events.",
    metrics: ["8 active admins", "2 pending"],
    cta: "Manage access",
  },
];

export const dashboardOverview = {
  stats: [
    { label: "Revenue (7d)", value: "$482K", trend: "+12%" },
    { label: "Orders", value: "1,284", trend: "+6%" },
    { label: "Returning Customers", value: "48%", trend: "+3.2%" },
  ],
  highlights: [
    "Pulse Sync Trainer sold out of Storm size 8",
    "Zenith Form Heel waitlist crossed 2,300",
    "APAC launch scheduled for Dec 4",
  ],
};

export const wishlistCopy = {
  empty: "Your wishlist is waiting for fresh drops.",
  actions: [
    "Tap the heart icon on any product to pin it here.",
    "We’ll email restock alerts automatically.",
    "Sync across devices by signing in.",
  ],
};

export const checkoutSteps = ["Shipping", "Delivery", "Payment", "Review"];

export const dashboardTimeline = [
  {
    title: "Order #KS-10492",
    detail: "Kinetic Air Runner · Preparing label",
    timestamp: "2 min ago",
  },
  {
    title: "Refund approved",
    detail: "Shoreline Relief Sandal · $95",
    timestamp: "14 min ago",
  },
  {
    title: "Wishlist restock",
    detail: "Zenith Form Heel · Size 38",
    timestamp: "1 hr ago",
  },
];

export const cmsPages = {
  contact: {
    hero: "We’re here across chat, phone, and DM.",
    channels: contactChannels,
  },
  faq: faqs,
  about: aboutContent,
};

export const storefrontCollections = {
  men: categories.filter((category) => category.audience === "men"),
  women: categories.filter((category) => category.audience === "women"),
  newArrivals: products.filter((product) => product.status === "new"),
  sale: products.filter((product) => product.status === "sale"),
};

export const storefrontNavLinks = contentNav;

export const getCategoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const getProductsByCategory = (slug: string) =>
  products.filter((product) => product.category === slug);

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const getBlogPostBySlug = (slug: string) =>
  blogPosts.find((post) => post.slug === slug);

export const getAdminModuleBySlug = (slug: string) =>
  adminModules.find((module) => module.slug === slug);
