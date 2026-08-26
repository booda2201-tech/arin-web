export type Lang = 'ar' | 'en';
export type L = { ar: string; en: string };

export const site = {
  name: { ar: 'عرين الموارد التجارية', en: 'Arin Almawared Altijaria' } as L,
  shortName: { ar: 'عرين', en: 'Arin' } as L,
  latin: 'ARIN ALMAWARED',
  tagline: { ar: 'نمو. موثوقية. موارد', en: 'Growth. Trust. Resources.' } as L,
  logo: 'assets/images/logo.png',
  contact: {
    phone: '+20 122 555 0180',
    phoneSecondary: '+20 100 774 2213',
    whatsapp: '+201225550180',
    email: 'trade@arin-resources.com',
    address: {
      ar: 'الحي الأول، المهندسين، الجيزة، جمهورية مصر العربية',
      en: '1st District, Mohandessin, Giza, Egypt',
    } as L,
    hours: {
      ar: 'الأحد – الخميس، 9:00 ص – 6:00 م',
      en: 'Sun – Thu, 09:00 – 18:00 EET',
    } as L,
  },
};

export const images = {
  hero: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1920&q=80',
  house: 'assets/images/house.jpg',
  boardroom:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
  logistics:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
  sea: 'assets/images/port.jpg',
  truck: 'assets/images/truck.jpg',
  warehouse:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
  cosmetics:
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  fmcg: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
  food: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  care: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80',
  packaging:
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
};

export interface NavItem {
  path: string;
  label: L;
}

export const navItems: NavItem[] = [
  { path: '/', label: { ar: 'الرئيسية', en: 'Home' } },
  { path: '/about', label: { ar: 'من نحن', en: 'About' } },
  { path: '/services', label: { ar: 'خدماتنا', en: 'Services' } },
  { path: '/products', label: { ar: 'المنتجات', en: 'Products' } },
  { path: '/private-label', label: { ar: 'علامتك التجارية', en: 'Private Label' } },
  { path: '/projects', label: { ar: 'مشاريعنا', en: 'Projects' } },
  { path: '/contact', label: { ar: 'تواصل معنا', en: 'Contact' } },
];

export interface ServiceItem {
  slug: string;
  index: string;
  icon: string;
  image: string;
  title: L;
  subtitle: L;
  short: L;
  body: L;
  points: L[];
}

export const services: ServiceItem[] = [
  {
    slug: 'import-export',
    index: '01',
    icon: 'bi-arrow-left-right',
    image: images.boardroom,
    title: { ar: 'الاستيراد والتصدير', en: 'Import & Export' },
    subtitle: { ar: 'من المستند إلى الإفراج', en: 'From documents to release' },
    short: {
      ar: 'ندير دورة التجارة كاملة: عقود، اعتمادات، شهادات منشأ، ومتابعة حتى التسليم.',
      en: 'End-to-end trade cycle: contracts, LCs, certificates of origin, and follow-up through delivery.',
    },
    body: {
      ar: 'نساعد الشركات تجيب بضائع من خارج مصر أو تصدّر منتجاتها للأسواق الخارجية بملف مستندي واحد ومسؤولية واضحة.',
      en: 'We help companies bring goods into Egypt or export products abroad with one document file and clear accountability.',
    },
    points: [
      { ar: 'عقود واعتمادات مستندية', en: 'Contracts and letters of credit' },
      { ar: 'شهادات منشأ ومطابقة', en: 'Origin and conformity certificates' },
      { ar: 'تنسيق التخليص والإفراج', en: 'Clearance and release coordination' },
    ],
  },
  {
    slug: 'shipping',
    index: '02',
    icon: 'bi-ship',
    image: images.sea,
    title: { ar: 'الشحن الدولي', en: 'International Shipping' },
    subtitle: { ar: 'بحري وبري بمسار محسوب', en: 'Sea and land, route by design' },
    short: {
      ar: 'شحن بحري وبري بأسعار تعاقدية، مع تتبع حتى باب المستودع.',
      en: 'Contracted sea and land freight, tracked through warehouse delivery.',
    },
    body: {
      ar: 'نختار المسار الأنسب للتكلفة والوقت: حاويات FCL/LCL عبر الموانئ المصرية، أو شحن بري عبر المعابر الإقليمية.',
      en: 'We pick the route that fits cost and time: FCL/LCL via Egyptian ports, or land freight across regional crossings.',
    },
    points: [
      { ar: 'شحن بحري FCL / LCL', en: 'Sea freight FCL / LCL' },
      { ar: 'شحن بري إقليمي', en: 'Regional land freight' },
      { ar: 'تتبع لحظي للحاوية والشاحنة', en: 'Live container and truck tracking' },
    ],
  },
  {
    slug: 'agencies',
    index: '03',
    icon: 'bi-handshake',
    image: images.cosmetics,
    title: { ar: 'التوكيلات التجارية', en: 'Commercial Agencies' },
    subtitle: { ar: 'تمثيل منظم في السوق المحلي', en: 'Structured local representation' },
    short: {
      ar: 'نمثّل علامات وشركات أجنبية في السوق المصري بخطة إطلاق وقنوات توزيع.',
      en: 'We represent foreign brands in Egypt with a launch plan and distribution channels.',
    },
    body: {
      ar: 'من قراءة السوق إلى هيكل التمثيل ومتابعة الأداء، ندخل العلامة السوق بشكل صحيح لا كصفقة عابرة.',
      en: 'From market reading to representation structure and performance follow-up, we enter the market properly — not as a one-off deal.',
    },
    points: [
      { ar: 'تقييم السوق والقنوات', en: 'Market and channel assessment' },
      { ar: 'هيكل التمثيل والاتفاق', en: 'Representation structure and terms' },
      { ar: 'خطة إطلاق ومتابعة', en: 'Launch plan and follow-up' },
    ],
  },
  {
    slug: 'supply-chain',
    index: '04',
    icon: 'bi-diagram-3',
    image: images.logistics,
    title: { ar: 'حلول سلاسل الإمداد', en: 'Supply Chain Solutions' },
    subtitle: { ar: 'من المصدر حتى التوزيع', en: 'From origin to distribution' },
    short: {
      ar: 'ننظم النقل والتخزين والتوزيع من البداية للنهاية تحت جهة اتصال واحدة.',
      en: 'We organise transport, warehousing and distribution end to end under one contact.',
    },
    body: {
      ar: 'سلسلة واحدة تربط المصنع، الشحنة، المخزن، والتسليم المرحلي حتى يصل المنتج إلى السوق بانتظام.',
      en: 'One chain links factory, shipment, warehouse and phased delivery so product reaches the market steadily.',
    },
    points: [
      { ar: 'تخزين ومناولة منظمة', en: 'Organised storage and handling' },
      { ar: 'توزيع مرحلي حسب الطلب', en: 'Phased distribution on demand' },
      { ar: 'تقارير حركة المخزون', en: 'Stock movement reporting' },
    ],
  },
  {
    slug: 'consulting',
    index: '05',
    icon: 'bi-compass',
    image: images.boardroom,
    title: { ar: 'الاستشارات التجارية', en: 'Trade Consulting' },
    subtitle: { ar: 'دخول أسواق بقرار أوضح', en: 'Enter markets with clearer decisions' },
    short: {
      ar: 'نصائح وحلول للشركات اللي عايزة تدخل أسواق جديدة أو تحسّن عملياتها التجارية.',
      en: 'Advice and solutions for companies entering new markets or improving their trade operations.',
    },
    body: {
      ar: 'ندرس المنتج والسوق والمتطلبات قبل أي حركة، ونبني خطة توريد أو تصدير قابلة للتنفيذ لا عرضًا عامًا.',
      en: 'We study product, market and requirements before any move, then build an executable supply or export plan — not a generic pitch.',
    },
    points: [
      { ar: 'دراسة السوق ومتطلبات الوجهة', en: 'Market and destination requirements' },
      { ar: 'هيكلة عملية الاستيراد/التصدير', en: 'Import/export process design' },
      { ar: 'تحسين التكلفة وزمن الدورة', en: 'Cost and cycle-time improvement' },
    ],
  },
];

export const telemetry = [
  { value: '+18', label: { ar: 'دولة نصل إليها', en: 'Markets reached' } },
  { value: '+500', label: { ar: 'شريك تجاري', en: 'Trade partners' } },
  { value: '24/7', label: { ar: 'متابعة للشحنات', en: 'Shipment visibility' } },
];

export const signalBoard = [
  { key: { ar: 'حالة سلسلة الإمداد', en: 'Supply chain status' }, value: { ar: 'مستقرة / نشطة', en: 'Stable / active' } },
  { key: { ar: 'متوسط زمن الاستجابة', en: 'Typical first reply' }, value: { ar: 'يوم عمل واحد', en: 'One business day' } },
  { key: { ar: 'تغطية المنشأ', en: 'Origin coverage' }, value: { ar: '4 قارات', en: '4 continents' } },
  { key: { ar: 'نمط الشراكة', en: 'Partnership model' }, value: { ar: 'طويل المدى', en: 'Long-term' } },
];

export const processSteps = [
  {
    index: '01',
    title: { ar: 'شارك احتياجك', en: 'Share the need' },
    body: {
      ar: 'المنتج أو الخدمة، الكمية التقديرية، والسوق المستهدف.',
      en: 'Product or service, estimated volume, and target market.',
    },
    image: images.boardroom,
  },
  {
    index: '02',
    title: { ar: 'نراجع المنتج والسوق', en: 'Review product and market' },
    body: {
      ar: 'نتحقق من المواصفة والبدائل ومتطلبات الوجهة قبل أي عرض.',
      en: 'We verify spec, alternatives and destination requirements before any offer.',
    },
    image: images.fmcg,
  },
  {
    index: '03',
    title: { ar: 'نحدد المصدر والمسار', en: 'Fix source and route' },
    body: {
      ar: 'ترشيح مصادر قادرة، واختيار الشحن البحري أو البري الأنسب.',
      en: 'Shortlisting capable sources and choosing sea or land freight.',
    },
    image: images.logistics,
  },
  {
    index: '04',
    title: { ar: 'ننسق التسليم ونتابع', en: 'Coordinate and follow up' },
    body: {
      ar: 'المستندات، التتبع، والتوريد التالي حتى لا يتوقف المنتج عن السوق.',
      en: 'Documents, tracking, and the next cycle so the product never leaves the shelf.',
    },
    image: images.warehouse,
  },
];

export const pillars = [
  {
    title: { ar: 'الوضوح أولاً', en: 'Clarity first' },
    body: {
      ar: 'نثبّت المواصفة والكمية والمدة في العرض، ولا نعد بما لا يمكن تنفيذه.',
      en: 'Spec, volume and lead time are fixed in the offer. We do not promise what cannot be delivered.',
    },
  },
  {
    title: { ar: 'مسؤولية واحدة', en: 'Single accountability' },
    body: {
      ar: 'جهة واحدة تتابع الطلب من أول سؤال حتى التسليم، بدون تحويل بين أقسام.',
      en: 'One team follows the order from first question to delivery, with no department hand-offs.',
    },
  },
  {
    title: { ar: 'استمرارية التوريد', en: 'Continuity of supply' },
    body: {
      ar: 'نبني الدورة التالية أثناء تنفيذ الحالية حتى لا يتوقف المنتج عن السوق.',
      en: 'The next cycle is planned while the current one runs.',
    },
  },
];

export const milestones = [
  {
    year: '2014',
    title: { ar: 'التأسيس في الجيزة', en: 'Founded in Giza' },
    body: {
      ar: 'انطلقنا بمكتب واحد وتوريد منظم للسوق المحلي.',
      en: 'Started with one office and structured supply for the local market.',
    },
  },
  {
    year: '2017',
    title: { ar: 'خطوط استيراد مباشرة', en: 'Direct import lanes' },
    body: {
      ar: 'فتح قنوات توريد مع مصانع في آسيا وتركيا.',
      en: 'Opened supply channels with factories in Asia and Turkey.',
    },
  },
  {
    year: '2020',
    title: { ar: 'حضور في الموانئ', en: 'Port presence' },
    body: {
      ar: 'فريق يتابع الإفراج والشحن البحري في الإسكندرية والدخيلة.',
      en: 'A team following sea freight and release in Alexandria and Dekheila.',
    },
  },
  {
    year: '2022',
    title: { ar: 'العلامات الخاصة', en: 'Private label' },
    body: {
      ar: 'إطلاق ذراع التصنيع للغير للمنتجات الغذائية والعناية.',
      en: 'Launched contract manufacturing for food and personal-care lines.',
    },
  },
  {
    year: '2026',
    title: { ar: 'شبكة أوسع', en: 'Wider network' },
    body: {
      ar: 'حضور توريدي عبر أسواق متعددة مع شركاء تشغيل نشطين.',
      en: 'Supply presence across multiple markets with active operating partners.',
    },
  },
];

export const partners = [
  'ORIENT FOODS',
  'NILE DISTRIBUTION',
  'GULF RETAIL GROUP',
  'MEDITERRA TRADE',
  'ASIA MILL CO.',
  'CAIRO WHOLESALE',
  'LEVANT BEAUTY',
  'PORT SAID LOGISTICS',
];

export interface ProductItem {
  slug: string;
  category: string;
  name: L;
  origin: L;
  packaging: L;
  image: string;
  notes: L;
}

export const productCategories = [
  { id: 'all', name: { ar: 'الكل', en: 'All' } as L },
  { id: 'food', name: { ar: 'المواد الغذائية', en: 'Food' } as L },
  { id: 'care', name: { ar: 'العناية الشخصية', en: 'Personal care' } as L },
  { id: 'institutional', name: { ar: 'توريدات مؤسسية', en: 'Institutional' } as L },
];

export const products: ProductItem[] = [
  {
    slug: 'olive-oil',
    category: 'food',
    name: { ar: 'زيت زيتون بكر ممتاز', en: 'Extra virgin olive oil' },
    origin: { ar: 'إسبانيا · أندلسيا', en: 'Spain · Andalusia' },
    packaging: { ar: 'عبوات 500 مل / 5 لتر', en: '500 ml / 5 L packs' },
    image: images.fmcg,
    notes: { ar: 'المواصفة تُثبّت قبل إصدار العرض.', en: 'Specification is fixed before the offer.' },
  },
  {
    slug: 'basmati-rice',
    category: 'food',
    name: { ar: 'أرز بسمتي مُعتّق', en: 'Aged basmati rice' },
    origin: { ar: 'الهند · هاريانا', en: 'India · Haryana' },
    packaging: { ar: 'أكياس 5 / 10 / 25 كجم', en: '5 / 10 / 25 kg bags' },
    image: images.food,
    notes: { ar: 'متاح بعلامة العميل عند الطلب.', en: 'Available under client branding on request.' },
  },
  {
    slug: 'dried-nuts',
    category: 'food',
    name: { ar: 'مكسرات وفواكه مجففة', en: 'Nuts and dried fruit' },
    origin: { ar: 'تركيا · إزمير', en: 'Turkey · Izmir' },
    packaging: { ar: 'كراتين 10 كجم', en: '10 kg cartons' },
    image: images.fmcg,
    notes: { ar: 'فحص جودة مستقل حسب الطلب.', en: 'Independent QC on request.' },
  },
  {
    slug: 'face-serum',
    category: 'care',
    name: { ar: 'سيروم العناية بالبشرة', en: 'Skin-care serum' },
    origin: { ar: 'كوريا الجنوبية', en: 'South Korea' },
    packaging: { ar: 'زجاج 30 مل', en: '30 ml glass' },
    image: images.cosmetics,
    notes: { ar: 'قابل للتصنيع بعلامتك الخاصة.', en: 'Available as private label.' },
  },
  {
    slug: 'fragrance',
    category: 'care',
    name: { ar: 'مجموعة عطور فاخرة', en: 'Prestige fragrance set' },
    origin: { ar: 'فرنسا · غراس', en: 'France · Grasse' },
    packaging: { ar: '50 / 100 مل', en: '50 / 100 ml' },
    image: images.care,
    notes: { ar: 'تعبئة بعلامتك عند الحد الأدنى للطلب.', en: 'Filled under your brand at MOQ.' },
  },
  {
    slug: 'institutional-pack',
    category: 'institutional',
    name: { ar: 'قوائم توريد مؤسسية', en: 'Institutional supply lists' },
    origin: { ar: 'مصادر متعددة مُدققة', en: 'Verified multi-origin' },
    packaging: { ar: 'حسب دورة التسليم', en: 'Per delivery cycle' },
    image: images.warehouse,
    notes: { ar: 'عرض موحد لقائمة أصناف متنوعة.', en: 'A single offer covering mixed item lists.' },
  },
];

export const projects = [
  {
    id: 'p1',
    category: { ar: 'الشحن البحري', en: 'Sea freight' },
    image: images.sea,
    caption: {
      ar: 'تجميع الحاويات في الميناء قبل الإبحار.',
      en: 'Container consolidation at port before sailing.',
    },
  },
  {
    id: 'p2',
    category: { ar: 'الشحن البري', en: 'Land freight' },
    image: images.truck,
    caption: {
      ar: 'مسارات برية إقليمية بتسليم حتى باب المستودع.',
      en: 'Regional land routes with warehouse-door delivery.',
    },
  },
  {
    id: 'p3',
    category: { ar: 'سلاسل الإمداد', en: 'Supply chain' },
    image: images.warehouse,
    caption: {
      ar: 'ترتيب المخزون على منصات جاهزة للتوزيع المرحلي.',
      en: 'Palletised stock ready for phased distribution.',
    },
  },
  {
    id: 'p4',
    category: { ar: 'التوكيلات', en: 'Agencies' },
    image: images.cosmetics,
    caption: {
      ar: 'إدخال علامة عناية إلى قنوات التجزئة المحلية.',
      en: 'Introducing a care brand into local retail channels.',
    },
  },
  {
    id: 'p5',
    category: { ar: 'الاستيراد', en: 'Import' },
    image: images.food,
    caption: {
      ar: 'توريد أساسيات غذائية بجدول شحن ثابت.',
      en: 'Food staples on a fixed shipping schedule.',
    },
  },
  {
    id: 'p6',
    category: { ar: 'العلامات الخاصة', en: 'Private label' },
    image: images.packaging,
    caption: {
      ar: 'تنسيق التغليف والهوية قبل الإنتاج التجاري.',
      en: 'Packaging and identity coordination before commercial production.',
    },
  },
];

export const labSteps = [
  {
    index: '01',
    title: { ar: 'الفكرة', en: 'Brief' },
    body: {
      ar: 'دراسة الفئة والسعر المستهدف وتحديد المواصفة.',
      en: 'Category, target price and specification.',
    },
  },
  {
    index: '02',
    title: { ar: 'التصميم', en: 'Design' },
    body: {
      ar: 'هوية العلامة والعبوة وملفات الطباعة.',
      en: 'Brand identity, pack and print files.',
    },
  },
  {
    index: '03',
    title: { ar: 'التصنيع', en: 'Make' },
    body: {
      ar: 'اختيار المصنع، عينات، ثم إنتاج تحت رقابة جودة.',
      en: 'Factory selection, samples, then QC-controlled production.',
    },
  },
  {
    index: '04',
    title: { ar: 'الشحن', en: 'Ship' },
    body: {
      ar: 'التغليف والتحميل والتخليص حتى مستودعك.',
      en: 'Pack, load, clear and deliver to your warehouse.',
    },
  },
];

export const mapNodes = [
  { id: 'rotterdam', label: { ar: 'روتردام', en: 'Rotterdam' }, x: 470, y: 128 },
  { id: 'istanbul', label: { ar: 'إسطنبول', en: 'Istanbul' }, x: 540, y: 178 },
  { id: 'cairo', label: { ar: 'القاهرة', en: 'Cairo' }, x: 528, y: 236, hub: true },
  { id: 'jebelali', label: { ar: 'جبل علي', en: 'Jebel Ali' }, x: 640, y: 250 },
  { id: 'mumbai', label: { ar: 'مومباي', en: 'Mumbai' }, x: 706, y: 268 },
  { id: 'shanghai', label: { ar: 'شنغهاي', en: 'Shanghai' }, x: 850, y: 218 },
  { id: 'santos', label: { ar: 'سانتوس', en: 'Santos' }, x: 250, y: 352 },
  { id: 'mombasa', label: { ar: 'مومباسا', en: 'Mombasa' }, x: 570, y: 340 },
];

export const mapRoutes: [string, string][] = [
  ['cairo', 'rotterdam'],
  ['cairo', 'istanbul'],
  ['cairo', 'jebelali'],
  ['cairo', 'shanghai'],
  ['cairo', 'santos'],
  ['cairo', 'mombasa'],
  ['jebelali', 'mumbai'],
];

export function t(copy: L, lang: Lang): string {
  return copy[lang];
}

export function telHref(): string {
  return `tel:${site.contact.phone.replace(/\s/g, '')}`;
}

export function mailHref(): string {
  return `mailto:${site.contact.email}`;
}

export function whatsappHref(): string {
  return `https://wa.me/${site.contact.whatsapp.replace(/[^0-9]/g, '')}`;
}
