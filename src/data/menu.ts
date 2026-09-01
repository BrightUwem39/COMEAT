export type MenuItem = {
  id: string;
  name: string;
  image: string;
  pricing?: readonly MenuPrice[];
  priceNote?: string;
  proteins?: readonly MenuProtein[];
  grainOptions?: readonly MenuGrain[];
};

export type MenuPrice = {
  id: string;
  label: string;
  price: number;
  proteinPrices?: Readonly<Record<string, number>>;
};

export type MenuProtein = {
  id: string;
  label: string;
};

export type MenuGrain = {
  id: string;
  label: string;
};

const riceGrainOptions: readonly MenuGrain[] = [
  { id: "basmati", label: "Basmati" },
  { id: "long-grain", label: "Long-grain" },
];

export type MenuCategory = {
  id: string;
  name: string;
  shortName: string;
  note?: string;
  items: readonly MenuItem[];
};

export const menuCategories: readonly MenuCategory[] = [
  {
    id: "rice-and-mains",
    name: "Rice & Mains",
    shortName: "Rice",
    note: "Rice can be made with basmati or long-grain on request.",
    items: [
      {
        id: "jollof-rice",
        name: "Jollof Rice",
        image: "/images/hero.jpg",
        grainOptions: riceGrainOptions,
        pricing: [
          { id: "12-tray", label: "12\u2033 tray", price: 60 },
          { id: "24-tray", label: "24\u2033 tray", price: 120 },
        ],
      },
      {
        id: "fried-rice",
        name: "Fried Rice",
        image: "/images/menu/fried-rice.webp",
        grainOptions: riceGrainOptions,
        pricing: [
          { id: "12-tray", label: "12\u2033 tray", price: 60 },
          { id: "24-tray", label: "24\u2033 tray", price: 120 },
        ],
      },
      {
        id: "local-rice",
        name: "Local Rice",
        image: "/images/menu/local-rice.webp",
        grainOptions: riceGrainOptions,
        pricing: [
          { id: "12-tray", label: "12\u2033 tray", price: 125 },
          { id: "24-tray", label: "24\u2033 tray", price: 250 },
        ],
      },
      {
        id: "asaro",
        name: "Asaro",
        image: "/images/menu/asaro.webp",
        pricing: [
          { id: "12-tray", label: "12\u2033 tray", price: 110 },
          { id: "24-tray", label: "24\u2033 tray", price: 220 },
        ],
      },
      {
        id: "ikokore",
        name: "Ikokore",
        image: "/images/menu/ikokore.webp",
        pricing: [
          { id: "2l", label: "2L", price: 100 },
          { id: "12-tray", label: "12\u2033 tray", price: 125 },
          { id: "24-tray", label: "24\u2033 tray", price: 250 },
        ],
      },
      {
        id: "imoyo",
        name: "Imoyo",
        image: "/images/menu/imoyo.webp",
        pricing: [
          { id: "2l", label: "2L", price: 100 },
          { id: "12-tray", label: "12\u2033 tray", price: 125 },
          { id: "24-tray", label: "24\u2033 tray", price: 250 },
        ],
      },
    ],
  },
  {
    id: "soups-and-sauces",
    name: "Soups & Sauces",
    shortName: "Soups",
    note: "Soups are made with assorted meat. Local sauces are made with seafood and assorted meat.",
    items: [
      {
        id: "egusi",
        name: "Egusi",
        image: "/images/menu/egusi.webp",
        pricing: [
          { id: "2l", label: "2L", price: 120 },
          { id: "12-tray", label: "12\u2033 tray", price: 150 },
          { id: "24-tray", label: "24\u2033 tray", price: 300 },
        ],
        priceNote: "Made with assorted meat.",
      },
      {
        id: "efo-riro",
        name: "Efo Riro",
        image: "/images/menu/efo-riro.webp",
        pricing: [
          { id: "2l", label: "2L", price: 125 },
          { id: "12-tray", label: "12\u2033 tray", price: 155 },
          { id: "24-tray", label: "24\u2033 tray", price: 310 },
        ],
        priceNote: "Made with assorted meat.",
      },
      {
        id: "ayamase",
        name: "Ayamase",
        image: "/images/menu/ayamase.webp",
        pricing: [
          { id: "2l", label: "2L", price: 120 },
          { id: "12-tray", label: "12\u2033 tray", price: 150 },
          { id: "24-tray", label: "24\u2033 tray", price: 300 },
        ],
        priceNote: "Made with seafood and assorted meat.",
      },
      {
        id: "ata-dindin",
        name: "Ata Dindin",
        image: "/images/menu/ata-dindin.webp",
        pricing: [
          { id: "2l", label: "2L", price: 120 },
          { id: "12-tray", label: "12\u2033 tray", price: 150 },
          { id: "24-tray", label: "24\u2033 tray", price: 300 },
        ],
      },
      {
        id: "ewa-agoyin-sauce",
        name: "Ewa Agoyin Sauce",
        image: "/images/menu/ewa-agoyin-sauce.webp",
        pricing: [{ id: "2l", label: "2L", price: 100 }],
      },
      {
        id: "pepper-soup",
        name: "Pepper Soup",
        image: "/images/menu/pepper-soup.webp",
        pricing: [
          {
            id: "12-tray",
            label: "12\u2033 tray",
            price: 150,
            proteinPrices: { fish: 150, assorted: 150, goat: 180 },
          },
          {
            id: "24-tray",
            label: "24\u2033 tray",
            price: 300,
            proteinPrices: { fish: 300, assorted: 300, goat: 360 },
          },
        ],
        proteins: [
          { id: "fish", label: "Fish" },
          { id: "assorted", label: "Assorted meat" },
          { id: "goat", label: "Goat meat" },
        ],
        priceNote: "Yam, plantain, or potato add-ons are available.",
      },
      {
        id: "jollof-spaghetti",
        name: "Jollof Spaghetti",
        image: "/images/menu/spaghetti-bolognese.webp",
        pricing: [
          { id: "2l", label: "2L", price: 60 },
          { id: "12-tray", label: "12\u2033 tray", price: 80 },
          { id: "24-tray", label: "24\u2033 tray", price: 160 },
        ],
      },
    ],
  },
  {
    id: "sides-and-snacks",
    name: "Sides & Snacks",
    shortName: "Sides",
    note: "Choose the available tray or piece count shown on each dish.",
    items: [
      {
        id: "asun",
        name: "Asun",
        image: "/images/menu/asun.webp",
        pricing: [
          { id: "12-tray", label: "12\u2033 tray", price: 200 },
          { id: "24-tray", label: "24\u2033 tray", price: 400 },
        ],
      },
      {
        id: "naija-buns",
        name: "Naija Buns",
        image: "/images/menu/naija-buns.webp",
        pricing: [
          { id: "12-tray", label: "12\u2033 tray", price: 50 },
          { id: "24-tray", label: "24\u2033 tray", price: 100 },
        ],
      },
      {
        id: "puff-puff",
        name: "Puff-Puff",
        image: "/images/menu/puff-puff.webp",
        pricing: [
          { id: "12-tray", label: "12\u2033 tray", price: 50 },
          { id: "24-tray", label: "24\u2033 tray", price: 100 },
        ],
      },
      {
        id: "moi-moi",
        name: "Moi-Moi",
        image: "/images/menu/moi-moi.webp",
        pricing: [
          { id: "12-pieces", label: "12 pieces", price: 60 },
          { id: "24-pieces", label: "24 pieces", price: 120 },
        ],
      },
      {
        id: "ewa-agoyin",
        name: "Ewa Agoyin",
        image: "/images/menu/ewa-agoyin.webp",
        pricing: [
          { id: "2l", label: "2L", price: 60 },
          { id: "12-tray", label: "12\u2033 tray", price: 75 },
          { id: "24-tray", label: "24\u2033 tray", price: 150 },
        ],
      },
    ],
  },
] as const;

export const allMenuItems = menuCategories.flatMap((category) => category.items);
