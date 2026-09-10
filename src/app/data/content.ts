export type Lang = 'ar' | 'en';
export type L = { ar: string; en: string };

export const site = {
  name: { ar: 'عرين الموارد التجارية', en: 'Arin Almawared Altijaria' } as L,
  shortName: { ar: 'عرين', en: 'Arin' } as L,
  latin: 'ARIN ALMAWARED',
  tagline: { ar: 'نمو. موثوقية. موارد', en: 'Growth. Trust. Resources.' } as L,
  logo: 'assets/images/arin-seal.png',
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
  hero: 'https://images.unsplash.com/photo-1663900108404-a05e8bf82cda?auto=format&fit=crop&w=2560&q=85',
  aboutHero: 'https://images.unsplash.com/photo-1669101564304-1da32c23f8ec?auto=format&fit=crop&w=2560&q=85',
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
  oliveOil:
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1400&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1400&q=80',
  nuts: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1400&q=80',
  cinnamon:
    'https://images.unsplash.com/photo-1606914501449-5a96b6afcc21?auto=format&fit=crop&w=1400&q=80',
  greens:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1400&q=80',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1400&q=80',
  dates: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=1400&q=80',
  perfume:
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1400&q=80',
  lotion:
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=80',
  hamper:
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1400&q=80',
  lantern:
    'https://images.unsplash.com/photo-1578662996442-48f50103cca3?auto=format&fit=crop&w=1400&q=80',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1400&q=80',
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

export type ProductAvailability = 'in-supply' | 'on-demand';

export interface ProductSpec {
  label: L;
  value: L;
}

export interface ProductItem {
  /** Backend product id (GUID) when loaded from API */
  id?: string;
  slug: string;
  category: string;
  name: L;
  origin: L;
  packaging: L;
  image: string;
  images?: string[];
  notes: L;
  description: L;
  moq: L;
  availability: ProductAvailability;
  specs: ProductSpec[];
}

export interface ProductCategory {
  id: string;
  name: L;
}

export const productCategories: ProductCategory[] = [
  { id: 'all', name: { ar: 'الكل', en: 'All' } as L },
  { id: 'food', name: { ar: 'المواد الغذائية', en: 'Food' } as L },
  { id: 'care', name: { ar: 'العناية الشخصية', en: 'Personal care' } as L },
  { id: 'seasonal', name: { ar: 'توزيعات موسمية', en: 'Seasonal packs' } as L },
];

export const products: ProductItem[] = [
  {
    slug: 'olive-oil',
    category: 'food',
    name: { ar: 'زيت زيتون بكر ممتاز', en: 'Extra virgin olive oil' },
    origin: { ar: 'إسبانيا · أندلسيا', en: 'Spain · Andalusia' },
    packaging: { ar: 'عبوات 500 مل / 5 لتر', en: '500 ml / 5 L packs' },
    image: images.oliveOil,
    images: [
      images.oliveOil,
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    ],
    notes: { ar: 'المواصفة تُثبّت قبل إصدار العرض.', en: 'Specification is fixed before the offer.' },
    description: {
      ar: 'زيت زيتون بكر ممتاز من معاصر أندلسية مختارة. نثبّت الحموضة والتعبئة والمنشأ قبل أي عرض توريد، مع خيار التعبئة بعلامة العميل عند الحد الأدنى للطلب.',
      en: 'Extra virgin olive oil from selected Andalusian mills. Acidity, pack size and origin are locked before any supply offer, with client branding available at MOQ.',
    },
    moq: { ar: 'منصة كاملة أو حاوية حسب الاتفاق', en: 'Full pallet or container, by agreement' },
    availability: 'in-supply',
    specs: [
      { label: { ar: 'الحموضة', en: 'Acidity' }, value: { ar: 'أقل من 0.8%', en: 'Under 0.8%' } },
      { label: { ar: 'التغليف الخارجي', en: 'Outer pack' }, value: { ar: 'كراتين تصدير', en: 'Export cartons' } },
    ],
  },
  {
    slug: 'basmati-rice',
    category: 'food',
    name: { ar: 'أرز بسمتي مُعتّق', en: 'Aged basmati rice' },
    origin: { ar: 'الهند · هاريانا', en: 'India · Haryana' },
    packaging: { ar: 'أكياس 5 / 10 / 25 كجم', en: '5 / 10 / 25 kg bags' },
    image: images.rice,
    notes: { ar: 'متاح بعلامة العميل عند الطلب.', en: 'Available under client branding on request.' },
    description: {
      ar: 'أرز بسمتي مُعتّق بدرجة كسر متفق عليها مسبقاً. نراجع الشهادة والمنشأ ونسبة الرطوبة قبل الشحن، ونرتّب التعبئة حسب قناة التوزيع.',
      en: 'Aged basmati with a pre-agreed broken ratio. Certificates, origin and moisture are checked before shipping, with packing matched to the sales channel.',
    },
    moq: { ar: 'حسب حجم الحاوية', en: 'Per container load' },
    availability: 'in-supply',
    specs: [
      { label: { ar: 'نسبة الكسر', en: 'Broken ratio' }, value: { ar: 'حسب المواصفة المطلوبة', en: 'To requested spec' } },
      { label: { ar: 'التعبئة', en: 'Filling' }, value: { ar: 'أكياس بولي بروبيلين', en: 'Polypropylene bags' } },
    ],
  },
  {
    slug: 'dried-nuts',
    category: 'food',
    name: { ar: 'مكسرات وفواكه مجففة', en: 'Nuts and dried fruit' },
    origin: { ar: 'تركيا · إزمير', en: 'Turkey · Izmir' },
    packaging: { ar: 'كراتين 10 كجم', en: '10 kg cartons' },
    image: images.nuts,
    notes: { ar: 'فحص جودة مستقل حسب الطلب.', en: 'Independent QC on request.' },
    description: {
      ar: 'مزيج مكسرات وفواكه مجففة من مصادر تركية مدققة. نثبّت الأصناف ونسبة الرطوبة والتعبئة قبل العرض، مع إمكانية الفرز حسب طلب العميل.',
      en: 'A nuts and dried-fruit mix from verified Turkish sources. Varieties, moisture and packing are fixed before the offer, with sorting to client request.',
    },
    moq: { ar: 'حسب الكمية المطلوبة', en: 'Per requested volume' },
    availability: 'on-demand',
    specs: [
      { label: { ar: 'الأصناف', en: 'Variants' }, value: { ar: 'كاجو، لوز، زبيب، تين', en: 'Cashew, almond, raisin, fig' } },
      { label: { ar: 'التخزين', en: 'Storage' }, value: { ar: 'جاف ومكيّف', en: 'Dry, climate-controlled' } },
    ],
  },
  {
    slug: 'cinnamon-sticks',
    category: 'food',
    name: { ar: 'قرفة أعواد كاملة', en: 'Whole cinnamon sticks' },
    origin: { ar: 'سريلانكا', en: 'Sri Lanka' },
    packaging: { ar: 'أكياس 1 / 5 / 25 كجم', en: '1 / 5 / 25 kg bags' },
    image: images.cinnamon,
    notes: { ar: 'الدرجة تُثبّت بالعينة قبل الشحن.', en: 'Grade is locked by sample before shipping.' },
    description: {
      ar: 'أعواد قرفة كاملة بدرجة تصدير. نراجع الرائحة والكسر والتعبئة على عينة معتمدة، ثم نثبّت الكمية ومسار الشحن البحري.',
      en: 'Whole cinnamon sticks at export grade. Aroma, breakage and pack are confirmed on an approved sample, then volume and sea freight are locked.',
    },
    moq: { ar: 'حسب حجم الحاوية', en: 'Per container load' },
    availability: 'in-supply',
    specs: [
      { label: { ar: 'النوع', en: 'Type' }, value: { ar: 'سيلاني كامل', en: 'Ceylon, whole' } },
      { label: { ar: 'الرطوبة', en: 'Moisture' }, value: { ar: 'ضمن حد التصدير', en: 'Within export limit' } },
    ],
  },
  {
    slug: 'leafy-greens',
    category: 'food',
    name: { ar: 'خضروات ورقية طازجة', en: 'Fresh leafy greens' },
    origin: { ar: 'مصر · الدلتا', en: 'Egypt · Delta' },
    packaging: { ar: 'صنادل مبرّدة حسب الدورة', en: 'Chilled crates per cycle' },
    image: images.greens,
    notes: { ar: 'جدول توريد أسبوعي للمستودعات والسلاسل.', en: 'Weekly supply schedule for warehouses and chains.' },
    description: {
      ar: 'خضروات ورقية من مزارع الدلتا بتوريد مرحلي مبرّد. نثبت الصنف ووزن الصندوق ونافذة التسليم قبل بدء الدورة، مع متابعة درجة التبريد حتى الباب.',
      en: 'Leafy greens from Delta farms on a chilled, phased schedule. Variety, crate weight and delivery window are fixed before the cycle starts.',
    },
    moq: { ar: 'دورة أسبوعية متفق عليها', en: 'Agreed weekly cycle' },
    availability: 'in-supply',
    specs: [
      { label: { ar: 'سلسلة التبريد', en: 'Cold chain' }, value: { ar: 'من الحقل حتى المستودع', en: 'Field to warehouse' } },
      { label: { ar: 'نافذة التسليم', en: 'Delivery window' }, value: { ar: 'فجر اليوم التالي', en: 'Next-morning drop' } },
    ],
  },
  {
    slug: 'blossom-honey',
    category: 'food',
    name: { ar: 'عسل أزهار طبيعي', en: 'Natural blossom honey' },
    origin: { ar: 'مصر · الوادي الجديد', en: 'Egypt · New Valley' },
    packaging: { ar: 'عبوات 500 جم / 1 كجم / دلو 25 كجم', en: '500 g / 1 kg / 25 kg pail' },
    image: images.honey,
    notes: { ar: 'تحليل مختبر يُرفق مع الشحنة عند الطلب.', en: 'Lab analysis attached to the shipment on request.' },
    description: {
      ar: 'عسل أزهار من مناحل مصرية مختارة. نثبت الرطوبة والتعبئة والملصق قبل الإنتاج، مع خيار العلامة الخاصة للدفعات التجارية.',
      en: 'Blossom honey from selected Egyptian apiaries. Moisture, pack and label are fixed before production, with private-label runs available.',
    },
    moq: { ar: 'حسب دفعة التعبئة', en: 'Per filling batch' },
    availability: 'on-demand',
    specs: [
      { label: { ar: 'النوع', en: 'Type' }, value: { ar: 'أزهار متعددة', en: 'Polyfloral' } },
      { label: { ar: 'التعبئة الخاصة', en: 'Private label' }, value: { ar: 'متاح عند الحد الأدنى', en: 'Available at MOQ' } },
    ],
  },
  {
    slug: 'medjool-dates',
    category: 'food',
    name: { ar: 'تمر مجهول فاخر', en: 'Premium Medjool dates' },
    origin: { ar: 'الأردن · الأغوار', en: 'Jordan · Jordan Valley' },
    packaging: { ar: 'كراتين 5 كجم مبرّدة', en: '5 kg chilled cartons' },
    image: images.dates,
    notes: { ar: 'الفرز حسب الحجم يتم قبل التعبئة.', en: 'Size grading is done before packing.' },
    description: {
      ar: 'تمر مجهول بدرجة فاخرة، مفرز حسب الحجم ورطوبة مضبوطة للشحن المبرّد. مناسب للتجزئة والتوزيعات الموسمية.',
      en: 'Premium Medjool dates, size-graded with controlled moisture for chilled freight. Suited to retail and seasonal distribution.',
    },
    moq: { ar: 'منصة كاملة', en: 'Full pallet' },
    availability: 'in-supply',
    specs: [
      { label: { ar: 'الدرجة', en: 'Grade' }, value: { ar: 'جامبو / لارج', en: 'Jumbo / Large' } },
      { label: { ar: 'التخزين', en: 'Storage' }, value: { ar: 'مبرّد 0–4°م', en: 'Chilled 0–4°C' } },
    ],
  },
  {
    slug: 'face-serum',
    category: 'care',
    name: { ar: 'سيروم العناية بالبشرة', en: 'Skin-care serum' },
    origin: { ar: 'كوريا الجنوبية', en: 'South Korea' },
    packaging: { ar: 'زجاج 30 مل', en: '30 ml glass' },
    image: images.cosmetics,
    notes: { ar: 'قابل للتصنيع بعلامتك الخاصة.', en: 'Available as private label.' },
    description: {
      ar: 'سيروم عناية يُصنَّع وفق تركيبة قابلة للتخصيص. نراجع الملصق، العبوة، وفحص الجودة قبل الإنتاج التجاري.',
      en: 'A care serum made to a customisable formula. Label, bottle and QC are reviewed before commercial production.',
    },
    moq: { ar: 'حسب دفعة التصنيع', en: 'Per production batch' },
    availability: 'on-demand',
    specs: [
      { label: { ar: 'العبوة', en: 'Bottle' }, value: { ar: 'زجاج مع قطّارة', en: 'Glass with dropper' } },
      { label: { ar: 'التركيبة', en: 'Formula' }, value: { ar: 'قابلة للتخصيص', en: 'Customisable' } },
    ],
  },
  {
    slug: 'fragrance',
    category: 'care',
    name: { ar: 'مجموعة عطور فاخرة', en: 'Prestige fragrance set' },
    origin: { ar: 'فرنسا · غراس', en: 'France · Grasse' },
    packaging: { ar: '50 / 100 مل', en: '50 / 100 ml' },
    image: images.perfume,
    notes: { ar: 'تعبئة بعلامتك عند الحد الأدنى للطلب.', en: 'Filled under your brand at MOQ.' },
    description: {
      ar: 'مجموعة عطور بتراكيز متفق عليها وتعبئة زجاج فاخر. نثبت الرائحة والحجم والملصق قبل بدء دفعة التعبئة.',
      en: 'A fragrance set at agreed concentrations in prestige glass. Scent, size and label are locked before the fill run.',
    },
    moq: { ar: 'حسب دفعة التعبئة', en: 'Per filling batch' },
    availability: 'on-demand',
    specs: [
      { label: { ar: 'التركيز', en: 'Concentration' }, value: { ar: 'Eau de parfum', en: 'Eau de parfum' } },
      { label: { ar: 'العلبة', en: 'Carton' }, value: { ar: 'حسب هوية العميل', en: 'To client identity' } },
    ],
  },
  {
    slug: 'body-lotion',
    category: 'care',
    name: { ar: 'لوشن مرطّب للجسم', en: 'Moisturising body lotion' },
    origin: { ar: 'تركيا · إسطنبول', en: 'Turkey · Istanbul' },
    packaging: { ar: 'عبوات 200 / 400 مل', en: '200 / 400 ml bottles' },
    image: images.lotion,
    notes: { ar: 'التغليف يُثبّت قبل بدء الإنتاج.', en: 'Packaging is fixed before production begins.' },
    description: {
      ar: 'لوشن جسم بتركيبة مرطّبة قابلة لتعديل الرائحة والكثافة. مناسب لخطوط العناية الخاصة وقنوات التجزئة.',
      en: 'A moisturising body lotion with adjustable scent and viscosity. Suited to private-label care lines and retail channels.',
    },
    moq: { ar: 'حسب دفعة التصنيع', en: 'Per production batch' },
    availability: 'on-demand',
    specs: [
      { label: { ar: 'الروائح', en: 'Fragrance' }, value: { ar: 'حسب الاختيار', en: 'Selected per project' } },
      { label: { ar: 'الملصق', en: 'Label' }, value: { ar: 'بعلامة العميل', en: 'Client branded' } },
    ],
  },
  {
    slug: 'ramadan-hamper',
    category: 'seasonal',
    name: { ar: 'سلال رمضان المؤسسية', en: 'Ramadan institutional hampers' },
    origin: { ar: 'تجميع من مصادر مدققة', en: 'Assembled from verified sources' },
    packaging: { ar: 'سلة مغلقة حسب القائمة', en: 'Sealed basket per list' },
    image: images.lantern,
    notes: { ar: 'القائمة تُغلق قبل موسم الإنتاج.', en: 'The item list is locked before the production season.' },
    description: {
      ar: 'سلال توزيع رمضانية للشركات والجهات. نثبت الأصناف والأوزان والتغليف قبل الموسم، ثم نرتّب التجميع والتسليم على دفعات.',
      en: 'Ramadan distribution hampers for companies and institutions. Items, weights and packing are locked before the season, then assembled and delivered in batches.',
    },
    moq: { ar: 'من 200 سلة', en: 'From 200 hampers' },
    availability: 'on-demand',
    specs: [
      { label: { ar: 'المحتوى', en: 'Contents' }, value: { ar: 'تمر، سكر، زيت، مشروبات', en: 'Dates, sugar, oil, drinks' } },
      { label: { ar: 'التسليم', en: 'Delivery' }, value: { ar: 'مرحلي حتى المستودع', en: 'Phased to warehouse' } },
    ],
  },
  {
    slug: 'eid-gift-boxes',
    category: 'seasonal',
    name: { ar: 'علب هدايا العيد', en: 'Eid gift boxes' },
    origin: { ar: 'تجميع محلي + استيراد', en: 'Local assembly + import' },
    packaging: { ar: 'علبة مطبوعة بعلامتك', en: 'Printed box under your brand' },
    image: images.hamper,
    notes: { ar: 'التصميم يُعتمد قبل الطباعة بثلاثة أسابيع.', en: 'Artwork is approved three weeks before print.' },
    description: {
      ar: 'علب هدايا للعيد بهوية العميل: حلويات، مكسرات، ومشروبات مختارة. نغلق التصميم والمحتوى ثم ننتج دفعة واحدة بجدول تسليم واضح.',
      en: 'Eid gift boxes in the client identity: sweets, nuts and selected drinks. Design and contents are locked, then produced in one run on a clear delivery date.',
    },
    moq: { ar: 'من 150 علبة', en: 'From 150 boxes' },
    availability: 'on-demand',
    specs: [
      { label: { ar: 'الهوية', en: 'Branding' }, value: { ar: 'طباعة كاملة على العلبة', en: 'Full box print' } },
      { label: { ar: 'المهلة', en: 'Lead time' }, value: { ar: '4–6 أسابيع قبل العيد', en: '4–6 weeks before Eid' } },
    ],
  },
  {
    slug: 'hospitality-tea',
    category: 'seasonal',
    name: { ar: 'شاي الضيافة الفاخر', en: 'Premium hospitality tea' },
    origin: { ar: 'سريلانكا · كاندي', en: 'Sri Lanka · Kandy' },
    packaging: { ar: 'علب 250 جم / صناديق 1 كجم', en: '250 g tins / 1 kg chests' },
    image: images.tea,
    notes: { ar: 'خلطة تُثبّت بالعينة قبل الموسم.', en: 'Blend is locked by sample before the season.' },
    description: {
      ar: 'شاي أسود للضيافة والتوزيعات الموسمية. نثبت الخلطة والتعبئة والملصق، مع خيار علب معدنية بعلامة العميل للفنادق والشركات.',
      en: 'Black tea for hospitality and seasonal distribution. Blend, pack and label are fixed, with metal tins under the client brand for hotels and corporates.',
    },
    moq: { ar: 'حسب حجم الحاوية أو الدفعة الموسمية', en: 'Per container or seasonal batch' },
    availability: 'in-supply',
    specs: [
      { label: { ar: 'الدرجة', en: 'Grade' }, value: { ar: 'BOP / OP حسب الطلب', en: 'BOP / OP on request' } },
      { label: { ar: 'التعبئة الخاصة', en: 'Private label' }, value: { ar: 'علب معدنية مطبوعة', en: 'Printed metal tins' } },
    ],
  },
];

export function getProduct(slug: string): ProductItem | undefined {
  return products.find((p) => p.slug === slug);
}

export function relatedProducts(slug: string, limit = 3): ProductItem[] {
  const current = getProduct(slug);
  if (!current) {
    return [];
  }
  return products.filter((p) => p.category === current.category && p.slug !== slug).slice(0, limit);
}

export function categoryName(id: string, lang: Lang): string {
  const found = productCategories.find((c) => c.id === id);
  return found ? found.name[lang] : id;
}

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
    title: { ar: 'الموجز', en: 'Brief' },
    body: {
      ar: 'نثبّت الفئة والجمهور والسعر المستهدف والمواصفة القابلة للتصنيع قبل أي حركة.',
      en: 'We lock category, audience, target price and a manufacturable spec before any move.',
    },
  },
  {
    index: '02',
    title: { ar: 'التركيبة أو المنتج', en: 'Formula or product' },
    body: {
      ar: 'نختار المصدر أو نطور التركيبة، ثم نطلب العينات الأولى للمراجعة.',
      en: 'We select the source or develop the formula, then request first samples for review.',
    },
  },
  {
    index: '03',
    title: { ar: 'الهوية والعبوة', en: 'Identity and pack' },
    body: {
      ar: 'الاسم، الملصق، الخامة، والبيانات الإلزامية لسوق الوجهة — بهوية تقف وحدها على الرف.',
      en: 'Name, label, material and mandatory data for the destination market — an identity that stands alone on the shelf.',
    },
  },
  {
    index: '04',
    title: { ar: 'العينة المعتمدة', en: 'Approved sample' },
    body: {
      ar: 'مراجعة الجودة والمظهر والتعبئة قبل أي إنتاج تجاري. لا دفعة بلا اعتماد.',
      en: 'Quality, appearance and pack reviewed before commercial production. No batch without approval.',
    },
  },
  {
    index: '05',
    title: { ar: 'التصنيع', en: 'Production' },
    body: {
      ar: 'دفعة تحت رقابة، مع نقاط فحص قبل التعبئة وقبل التحميل.',
      en: 'A controlled batch, with checkpoints before filling and before loading.',
    },
  },
  {
    index: '06',
    title: { ar: 'الشحن والتوريد', en: 'Freight and supply' },
    body: {
      ar: 'المستندات، المسار، التسليم إلى المستودع، ثم الدورة التالية حتى لا يفرغ الرف.',
      en: 'Documents, route, warehouse delivery, then the next cycle so the shelf never runs empty.',
    },
  },
];

export const privateLabelStats = [
  {
    value: { ar: '2022', en: '2022' },
    label: { ar: 'إطلاق ذراع التصنيع للغير', en: 'Contract manufacturing launched' },
  },
  {
    value: { ar: 'ملف واحد', en: 'One file' },
    label: { ar: 'من الموجز حتى المستودع', en: 'From brief to warehouse' },
  },
  {
    value: { ar: 'سرية', en: 'Sealed' },
    label: { ar: 'للموجز والتركيبة والهوية', en: 'Brief, formula and identity' },
  },
  {
    value: { ar: '4 قارات', en: '4 continents' },
    label: { ar: 'شبكة مصانع ومصادر مُدققة', en: 'Vetted factories and origins' },
  },
];

export const privateLabelPromises = [
  {
    index: '01',
    title: { ar: 'ملكية الهامش', en: 'Own the margin' },
    body: {
      ar: 'أنت تحدد السعر والقناة والعلاقة مع العميل. نحن نضبط التكلفة والكمية والمهلة داخل عرض واضح.',
      en: 'You set price, channel and the customer relationship. We lock cost, volume and lead time inside a clear offer.',
    },
  },
  {
    index: '02',
    title: { ar: 'هوية مستقلة', en: 'Independent identity' },
    body: {
      ar: 'اسم وعبوة ورسائل تقف وحدها على الرف — لا منتج عام بملصق فوقه.',
      en: 'A name, pack and message that stand alone on the shelf — not a generic product with a sticker on it.',
    },
  },
  {
    index: '03',
    title: { ar: 'سلسلة تحت السيطرة', en: 'A chain under control' },
    body: {
      ar: 'مصنع مختار، نقاط فحص، ومستندات جاهزة للإفراج. جهة واحدة تتحمل الملف.',
      en: 'A chosen factory, inspection points, and documents ready for release. One team owns the file.',
    },
  },
  {
    index: '04',
    title: { ar: 'انطلاق محسوب', en: 'A measured launch' },
    body: {
      ar: 'دفعة تجريبية عند الحاجة، ثم توريد مستمر حسب أداء السوق — لا صفقة تُغلق وتُنسى.',
      en: 'A trial batch where needed, then ongoing supply as the market performs — not a deal that closes and disappears.',
    },
  },
];

export const privateLabelLines = [
  {
    title: { ar: 'العناية الشخصية', en: 'Personal care' },
    body: {
      ar: 'سيروم، عطور، وخطوط يومية تُعبأ بعلامتك وفق مواصفة معتمدة.',
      en: 'Serums, fragrances and daily lines filled under your brand to an approved spec.',
    },
    image: images.lotion,
    index: '01',
  },
  {
    title: { ar: 'المواد الغذائية', en: 'Food' },
    body: {
      ar: 'زيوت، أرز، مكسرات، وتغليف تجزئة أو مؤسسي بمصدر موثّق.',
      en: 'Oils, rice, nuts, and retail or institutional packing from a verified origin.',
    },
    image: images.oliveOil,
    index: '02',
  },
  {
    title: { ar: 'التوريدات المؤسسية', en: 'Institutional' },
    body: {
      ar: 'قوائم أصناف لدورة تسليم ثابتة، بعلامتك أو بمواصفتك الخاصة.',
      en: 'Item lists on a fixed delivery cycle, under your brand or your specification.',
    },
    image: images.hamper,
    index: '03',
  },
  {
    title: { ar: 'التغليف والهوية', en: 'Packaging and identity' },
    body: {
      ar: 'عبوات، ملصقات، وملفات طباعة جاهزة للمصنع ومتوافقة مع سوق الوجهة.',
      en: 'Containers, labels and print files ready for the factory and the destination market.',
    },
    image: images.perfume,
    index: '04',
  },
];

export const privateLabelDeliverables = [
  {
    title: { ar: 'موجز منتج موثّق', en: 'Documented product brief' },
    body: {
      ar: 'مواصفات، جمهور، ونقطة تميز قابلة للقياس قبل أي إنتاج.',
      en: 'Spec, audience and a measurable difference — before any production.',
    },
  },
  {
    title: { ar: 'عينة معتمدة', en: 'Approved sample' },
    body: {
      ar: 'اختبارات جودة ومراجعة مظهر قبل الدفعة التجارية.',
      en: 'Quality checks and appearance review before the commercial batch.',
    },
  },
  {
    title: { ar: 'هوية متماسكة', en: 'Coherent identity' },
    body: {
      ar: 'اسم وعبوة ورسائل تساعد المنتج على الوقوف وحده.',
      en: 'Name, pack and messages that let the product stand alone.',
    },
  },
  {
    title: { ar: 'خطة توريد', en: 'Supply plan' },
    body: {
      ar: 'كميات أولية، مهلات، ومسار شحن حتى المستودع.',
      en: 'Initial volumes, lead times and a freight path through to the warehouse.',
    },
  },
  {
    title: { ar: 'ملف مستندي', en: 'Document file' },
    body: {
      ar: 'شهادات ومتطلبات سوق الوجهة جاهزة للإفراج والشحن.',
      en: 'Certificates and destination requirements ready for release and freight.',
    },
  },
  {
    title: { ar: 'جهة اتصال واحدة', en: 'Single contact' },
    body: {
      ar: 'فريق يتابع من أول موجز حتى الدورة التالية، بلا تحويل بين أقسام.',
      en: 'A team that follows from first brief to the next cycle, with no department hand-offs.',
    },
  },
];

export const privateLabelSeals = [
  {
    icon: 'bi-shield-check',
    title: { ar: 'الجودة قبل الكمية', en: 'Quality before volume' },
    body: {
      ar: 'لا ننتقل إلى الإنتاج التجاري قبل اعتماد العينة ونقاط الفحص.',
      en: 'We do not move to commercial production before sample approval and inspection points.',
    },
  },
  {
    icon: 'bi-globe2',
    title: { ar: 'مطابقة سوق الوجهة', en: 'Destination compliance' },
    body: {
      ar: 'نراجع البيانات الإلزامية والمتطلبات قبل الطباعة والشحن.',
      en: 'Mandatory data and requirements are reviewed before print and freight.',
    },
  },
  {
    icon: 'bi-lock',
    title: { ar: 'سرية الملف', en: 'File confidentiality' },
    body: {
      ar: 'الموجز والتركيبة والهوية تُدار كأصل للعميل، لا كمادة للعرض.',
      en: 'Brief, formula and identity are treated as the client’s asset — not display material.',
    },
  },
  {
    icon: 'bi-layers',
    title: { ar: 'حد أدنى يناسب الفئة', en: 'MOQ by category' },
    body: {
      ar: 'أقل دفعة تُحدد بعد تثبيت المنتج والتغليف، لا كرقم عام على الموقع.',
      en: 'The smallest viable batch is set after product and pack are fixed — not as a generic number on the site.',
    },
  },
];

export const privateLabelFaq: { q: L; a: L }[] = [
  {
    q: { ar: 'ما أقل كمية يمكن البدء بها؟', en: 'What is the minimum starting quantity?' },
    a: {
      ar: 'تختلف حسب الفئة ومصنع التنفيذ. نحدد أقل دفعة ممكنة بعد تثبيت المنتج والتغليف، وتُذكر في العرض لا كرقم عام.',
      en: 'It varies by category and production facility. We define the smallest viable batch once product and packaging are fixed, and state it in the offer — not as a generic number.',
    },
  },
  {
    q: { ar: 'هل تساعدون في تصميم الهوية والتغليف؟', en: 'Do you help with identity and packaging?' },
    a: {
      ar: 'ننسق مواد التغليف والملصقات ومتطلبات البيانات الإلزامية، ونعمل مع مصممكم أو نرشّح بديلًا يفهم سوق الوجهة.',
      en: 'We coordinate packaging materials, labels and mandatory data, working with your designer or recommending one who understands the destination market.',
    },
  },
  {
    q: { ar: 'كم تستغرق دورة المشروع؟', en: 'How long does a project take?' },
    a: {
      ar: 'تُقدَّر المدة بعد تحديد الفئة والكمية وسوق الوجهة، ثم تُثبَّت في العرض التجاري. لا نعد بمهلة قبل تثبيت المواصفة.',
      en: 'Timelines are estimated once category, volume and destination market are set, then fixed in the commercial offer. We do not promise a lead time before the spec is locked.',
    },
  },
  {
    q: { ar: 'ماذا عن المستندات والمطابقة؟', en: 'What about documentation and compliance?' },
    a: {
      ar: 'نراجع متطلبات سوق الوجهة ونجهّز المستندات المطلوبة للشحن والإفراج ضمن الملف نفسه.',
      en: 'We review destination-market requirements and prepare the documents needed for shipping and release inside the same file.',
    },
  },
  {
    q: { ar: 'هل نحتاج مصنعًا خاصًا بنا؟', en: 'Do we need our own factory?' },
    a: {
      ar: 'لا. التصنيع للغير يعني أن المصنع والرقابة والشحن تُدار عبر عرين، وتبقى العلامة والسوق ملكك.',
      en: 'No. Contract manufacturing means factory, quality control and freight are run through Arin — you keep the brand and the market.',
    },
  },
  {
    q: { ar: 'كيف تُحفظ سرية التركيبة والهوية؟', en: 'How is formula and identity kept confidential?' },
    a: {
      ar: 'الملف يُدار داخليًا مع المصنع المختار فقط. لا تُعرض التركيبة أو الهوية كنموذج عام، ولا تُشارك مع عملاء آخرين.',
      en: 'The file is handled internally with the chosen factory only. Formula and identity are not shown as public samples, and are not shared with other clients.',
    },
  },
];

export const privateLabelCategories = [
  { id: 'care', name: { ar: 'العناية الشخصية', en: 'Personal care' } as L },
  { id: 'food', name: { ar: 'المواد الغذائية', en: 'Food' } as L },
  { id: 'institutional', name: { ar: 'توريدات مؤسسية', en: 'Institutional' } as L },
  { id: 'other', name: { ar: 'فئة أخرى', en: 'Other category' } as L },
];

export type MapNode = {
  id: string;
  label: L;
  x: number;
  y: number;
  hub?: boolean;
  role: L;
  note: L;
  days?: L;
};

export const mapNodes: MapNode[] = [
  {
    id: 'rotterdam',
    label: { ar: 'روتردام', en: 'Rotterdam' },
    x: 380,
    y: 95,
    role: { ar: 'بوابة أوروبا', en: 'Europe gateway' },
    note: {
      ar: 'مسار بحري للمصانع والموردين الأوروبيين نحو الموانئ المصرية.',
      en: 'Sea lane linking European plants and suppliers into Egyptian ports.',
    },
    days: { ar: '10–14 يوم', en: '10–14 days' },
  },
  {
    id: 'istanbul',
    label: { ar: 'إسطنبول', en: 'Istanbul' },
    x: 500,
    y: 145,
    role: { ar: 'جسر المتوسط', en: 'Mediterranean bridge' },
    note: {
      ar: 'نقطة وصل سريعة بين تركيا والمنطقة عبر خطوط برية وبحرية.',
      en: 'A fast bridge between Turkey and the region by sea and land.',
    },
    days: { ar: '4–7 أيام', en: '4–7 days' },
  },
  {
    id: 'cairo',
    label: { ar: 'القاهرة', en: 'Cairo' },
    x: 500,
    y: 230,
    hub: true,
    role: { ar: 'مركز العمليات', en: 'Operations hub' },
    note: {
      ar: 'من هنا ننسّق كل مسار: المصدر، التوقيت، والدخول للسوق.',
      en: 'From here we coordinate every lane: origin, timing, and market entry.',
    },
  },
  {
    id: 'jebelali',
    label: { ar: 'جبل علي', en: 'Jebel Ali' },
    x: 640,
    y: 210,
    role: { ar: 'محور الخليج', en: 'Gulf hub' },
    note: {
      ar: 'إعادة شحن وتجميع للبضائع القادمة من آسيا قبل الدخول لمصر.',
      en: 'Transshipment and consolidation for Asia cargo before Egypt entry.',
    },
    days: { ar: '6–9 أيام', en: '6–9 days' },
  },
  {
    id: 'mumbai',
    label: { ar: 'مومباي', en: 'Mumbai' },
    x: 720,
    y: 255,
    role: { ar: 'مصدر الهند', en: 'India origin' },
    note: {
      ar: 'خطوط توريد مباشرة للسلع والمواد عبر شبكة جبل علي أو مباشرة.',
      en: 'Direct sourcing lanes for goods and materials via Jebel Ali or direct.',
    },
    days: { ar: '12–16 يوم', en: '12–16 days' },
  },
  {
    id: 'shanghai',
    label: { ar: 'شنغهاي', en: 'Shanghai' },
    x: 820,
    y: 165,
    role: { ar: 'مصانع آسيا', en: 'Asia manufacturing' },
    note: {
      ar: 'أطول مسار وأكثره كثافة — نضبط التوقيت قبل أن يتحوّل لضغط.',
      en: 'The longest and densest lane — timing is set before it becomes pressure.',
    },
    days: { ar: '14–18 يوم', en: '14–18 days' },
  },
  {
    id: 'santos',
    label: { ar: 'سانتوس', en: 'Santos' },
    x: 200,
    y: 320,
    role: { ar: 'أمريكا الجنوبية', en: 'South America' },
    note: {
      ar: 'مسار متخصص للسلع الزراعية والمواد المختارة من البرازيل.',
      en: 'A focused lane for agricultural goods and selected Brazilian materials.',
    },
    days: { ar: '22–28 يوم', en: '22–28 days' },
  },
  {
    id: 'mombasa',
    label: { ar: 'مومباسا', en: 'Mombasa' },
    x: 560,
    y: 345,
    role: { ar: 'شرق أفريقيا', en: 'East Africa' },
    note: {
      ar: 'امتداد إقليمي للتجارة والتوريد عبر القرن الأفريقي.',
      en: 'A regional extension for trade and supply across East Africa.',
    },
    days: { ar: '8–12 يوم', en: '8–12 days' },
  },
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
