export type MenuItem = {
  id: string;
  name: string;
  image: string;
  pricing?: readonly MenuPrice[];
  priceNote?: string;
  proteins?: readonly MenuProtein[];
  grainOptions?: readonly MenuGrain[];
  requiresPepperTolerance?: boolean;
};

export type MenuPrice = {
  id: string;
  label: string;
  price: number;
  proteinPrices?: Readonly<Record<string, number>>;
};

export type MenuProtein = { id: string; label: string };
export type MenuGrain = { id: string; label: string };

const riceGrainOptions: readonly MenuGrain[] = [
  { id: "basmati", label: "Basmati" },
  { id: "long-grain", label: "Long-grain" },
];

const logoPlaceholder = "/images/comeat-logo.png";

export type MenuCategory = {
  id: string;
  name: string;
  shortName: string;
  note?: string;
  items: readonly MenuItem[];
};

export const menuCategories: readonly MenuCategory[] = [
  {
    id: "rice-and-pasta",
    name: "Rice & Pasta",
    shortName: "Rice & Pasta",
    note: "Rice can be made with basmati or long-grain on request.",
    items: [
      {
        id: "jollof-rice", name: "Jollof Rice", image: "/images/hero.jpg", grainOptions: riceGrainOptions,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 60 }, { id: "24-tray", label: "24″ tray", price: 120 }],
      },
      {
        id: "fried-rice", name: "Fried Rice", image: "/images/menu/fried-rice.webp", grainOptions: riceGrainOptions,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 60 }, { id: "24-tray", label: "24″ tray", price: 120 }],
      },
      { id: "coconut-rice", name: "Coconut Rice", image: "/images/menu/coconut-rice.jpeg" },
      {
        id: "local-rice", name: "Local Rice / Village Rice", image: "/images/menu/native-rice.jpeg", grainOptions: riceGrainOptions,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 125 }, { id: "24-tray", label: "24″ tray", price: 250 }],
      },
      { id: "ofada-rice", name: "Ofada Rice", image: "/images/menu/ofada-rice.jpeg" },
      { id: "white-rice", name: "White Rice", image: "/images/menu/white-rice.jpeg" },
      {
        id: "jollof-spaghetti", name: "Jollof Spaghetti", image: "/images/menu/spaghetti-bolognese.webp",
        pricing: [{ id: "2l", label: "2L", price: 60 }, { id: "12-tray", label: "12″ tray", price: 80 }, { id: "24-tray", label: "24″ tray", price: 160 }],
      },
    ],
  },
  {
    id: "proteins",
    name: "Proteins",
    shortName: "Proteins",
    note: "Preparation choices are confirmed when your order is placed.",
    items: [
      { id: "chicken", name: "Chicken", image: logoPlaceholder, priceNote: "Hard or soft; fried or peppered." },
      { id: "goat-meat", name: "Goat Meat", image: logoPlaceholder, priceNote: "Fried or peppered." },
      { id: "gizzard", name: "Gizzard", image: logoPlaceholder, priceNote: "Fried or peppered." },
      { id: "fish", name: "Fish", image: logoPlaceholder, priceNote: "Croaker, tilapia, or whiting; fried or peppered." },
      { id: "chicken-drumsticks", name: "Chicken Drumsticks", image: logoPlaceholder },
      { id: "beef", name: "Beef", image: logoPlaceholder },
      { id: "mixed-offal", name: "Mixed Offal", image: logoPlaceholder },
    ],
  },
  {
    id: "soups-and-stews",
    name: "Soups & Stews",
    shortName: "Soups & Stews",
    note: "Soups and stews are prepared to order; available sizes appear on each dish.",
    items: [
      {
        id: "efo-riro", name: "Vegetable Soup (Efo Riro)", image: "/images/menu/efo-riro.webp", priceNote: "Made with assorted meat.",
        pricing: [{ id: "2l", label: "2L", price: 125 }, { id: "12-tray", label: "12″ tray", price: 155 }, { id: "24-tray", label: "24″ tray", price: 310 }],
      },
      {
        id: "egusi", name: "Egusi Soup", image: "/images/menu/egusi.webp", priceNote: "Made with assorted meat.",
        pricing: [{ id: "2l", label: "2L", price: 120 }, { id: "12-tray", label: "12″ tray", price: 150 }, { id: "24-tray", label: "24″ tray", price: 300 }],
      },
      { id: "ogbono-soup", name: "Ogbono Soup", image: "/images/menu/ogbono-soup.jpeg" },
      { id: "okro-soup", name: "Okro Soup", image: "/images/menu/okro-soup.jpeg" },
      {
        id: "ayamase", name: "Ayamase", image: "/images/menu/ayamase-new.jpeg", priceNote: "Made with seafood and assorted meat.",
        pricing: [{ id: "2l", label: "2L", price: 120 }, { id: "12-tray", label: "12″ tray", price: 150 }, { id: "24-tray", label: "24″ tray", price: 300 }],
      },
      {
        id: "ata-dindin", name: "Ata Dindin", image: "/images/menu/ata-dindin-new.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 120 }, { id: "12-tray", label: "12″ tray", price: 150 }, { id: "24-tray", label: "24″ tray", price: 300 }],
      },
      { id: "buka-stew", name: "Buka Stew", image: "/images/menu/buka-stew.jpeg" },
      { id: "turkey-stew", name: "Turkey Stew", image: "/images/menu/turkey-stew.jpeg" },
      { id: "chicken-stew", name: "Chicken Stew", image: "/images/menu/chicken-stew.jpeg" },
      { id: "goat-meat-stew", name: "Goat Meat Stew", image: "/images/menu/goat-meat-stew.jpeg" },
      { id: "seafood-okro", name: "Seafood Okro", image: "/images/menu/seafood-okro.jpeg" },
      {
        id: "imoyo", name: "Imoyo", image: "/images/menu/imoyo.webp",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 125 }, { id: "24-tray", label: "24″ tray", price: 250 }],
      },
      {
        id: "pepper-soup", name: "Pepper Soup", image: "/images/menu/pepper-soup.webp", priceNote: "Yam, plantain, or potato add-ons are available.",
        pricing: [
          { id: "12-tray", label: "12″ tray", price: 150, proteinPrices: { fish: 150, assorted: 150, goat: 180 } },
          { id: "24-tray", label: "24″ tray", price: 300, proteinPrices: { fish: 300, assorted: 300, goat: 360 } },
        ],
        proteins: [{ id: "fish", label: "Fish" }, { id: "assorted", label: "Assorted meat" }, { id: "goat", label: "Goat meat" }],
      },
    ],
  },
  {
    id: "swallows",
    name: "Swallows",
    shortName: "Swallows",
    note: "Available by the pot or in trays of 20.",
    items: [
      { id: "poundo-yam", name: "Poundo Yam", image: "/images/menu/poundo-yam.jpeg" },
      { id: "amala", name: "Amala", image: "/images/menu/amala.jpeg" },
      { id: "semo", name: "Semo", image: "/images/menu/semo.jpeg" },
    ],
  },
  {
    id: "sides",
    name: "Sides",
    shortName: "Sides",
    items: [
      {
        id: "moi-moi", name: "Moi Moi", image: "/images/menu/moi-moi.webp",
        pricing: [{ id: "12-pieces", label: "12 pieces", price: 60 }, { id: "24-pieces", label: "24 pieces", price: 120 }],
      },
      { id: "gizdodo", name: "Gizdodo", image: logoPlaceholder },
      { id: "plantains", name: "Plantains", image: logoPlaceholder },
      {
        id: "asun", name: "Asun", image: "/images/menu/asun.webp",
        pricing: [{ id: "12-tray", label: "12″ tray", price: 200 }, { id: "24-tray", label: "24″ tray", price: 400 }],
      },
      {
        id: "puff-puff", name: "Puff-Puff", image: "/images/menu/puff-puff.webp", requiresPepperTolerance: false,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 50 }, { id: "24-tray", label: "24″ tray", price: 100 }],
      },
      {
        id: "naija-buns", name: "Naija Buns", image: "/images/menu/naija-buns.webp", requiresPepperTolerance: false,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 50 }, { id: "24-tray", label: "24″ tray", price: 100 }],
      },
    ],
  },
  {
    id: "specialties",
    name: "Specialties",
    shortName: "Specialties",
    items: [
      {
        id: "asaro", name: "Asaro", image: "/images/menu/asaro.webp",
        pricing: [{ id: "12-tray", label: "12″ tray", price: 110 }, { id: "24-tray", label: "24″ tray", price: 220 }],
      },
      {
        id: "ikokore", name: "Ikokore", image: "/images/menu/ikokore.webp",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 125 }, { id: "24-tray", label: "24″ tray", price: 250 }],
      },
      {
        id: "ewa-agoyin", name: "Ewa Agoyin with Agoyin Sauce", image: "/images/menu/ewa-agoyin.webp",
        pricing: [{ id: "2l", label: "2L", price: 60 }, { id: "12-tray", label: "12″ tray", price: 75 }, { id: "24-tray", label: "24″ tray", price: 150 }],
      },
    ],
  },
] as const;

export const allMenuItems = menuCategories.flatMap((category) => category.items);
