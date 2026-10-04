export type MenuItem = {
  id: string;
  name: string;
  image: string;
  pricing?: readonly MenuPrice[];
  priceNote?: string;
  proteins?: readonly MenuProtein[];
  proteinOptionName?: string;
  grainOptions?: readonly MenuGrain[];
  grainOptionName?: string;
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
      {
        id: "coconut-rice", name: "Coconut Rice", image: "/images/menu/coconut-rice.jpeg", grainOptions: riceGrainOptions,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 100 }, { id: "24-tray", label: "24″ tray", price: 200 }],
      },
      {
        id: "local-rice", name: "Local Rice / Village Rice", image: "/images/menu/native-rice.jpeg", grainOptions: riceGrainOptions,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 125 }, { id: "24-tray", label: "24″ tray", price: 250 }],
      },
      {
        id: "ofada-rice", name: "Ofada Rice", image: "/images/menu/ofada-rice.jpeg",
        pricing: [{ id: "12-tray", label: "12″ tray", price: 60 }, { id: "24-tray", label: "24″ tray", price: 120 }],
      },
      {
        id: "white-rice", name: "White Rice", image: "/images/menu/white-rice.jpeg", grainOptions: riceGrainOptions,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 40 }, { id: "24-tray", label: "24″ tray", price: 80 }],
      },
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
      {
        id: "chicken", name: "Chicken", image: "/images/menu/chicken.webp", priceNote: "Choose chicken type and preparation.",
        pricing: [{ id: "2l", label: "2L", price: 80 }, { id: "12-tray", label: "12″ tray", price: 120 }, { id: "24-tray", label: "24″ tray", price: 240 }],
        grainOptionName: "Chicken type",
        grainOptions: [{ id: "hard", label: "Hard" }, { id: "soft", label: "Soft" }],
        proteinOptionName: "Preparation",
        proteins: [{ id: "fried", label: "Fried" }, { id: "peppered", label: "Peppered" }],
      },
      {
        id: "goat-meat", name: "Goat Meat", image: "/images/menu/goat-meat.webp", priceNote: "Choose preparation.",
        pricing: [{ id: "2l", label: "2L", price: 140 }, { id: "12-tray", label: "12″ tray", price: 180 }, { id: "24-tray", label: "24″ tray", price: 360 }],
        proteinOptionName: "Preparation",
        proteins: [{ id: "fried", label: "Fried" }, { id: "peppered", label: "Peppered" }],
      },
      {
        id: "gizzard", name: "Gizzard", image: "/images/menu/gizzard.webp", priceNote: "Choose preparation.",
        pricing: [{ id: "2l", label: "2L", price: 60 }, { id: "12-tray", label: "12″ tray", price: 80 }, { id: "24-tray", label: "24″ tray", price: 160 }],
        proteinOptionName: "Preparation",
        proteins: [{ id: "fried", label: "Fried" }, { id: "peppered", label: "Peppered" }],
      },
      {
        id: "fish", name: "Fish", image: "/images/menu/fish.webp", priceNote: "Choose fish type and preparation.",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 140 }, { id: "24-tray", label: "24″ tray", price: 280 }],
        grainOptionName: "Fish type",
        grainOptions: [{ id: "croaker", label: "Croaker" }, { id: "tilapia", label: "Tilapia" }, { id: "whiting", label: "Whiting" }],
        proteinOptionName: "Preparation",
        proteins: [{ id: "fried", label: "Fried" }, { id: "peppered", label: "Peppered" }],
      },
      {
        id: "chicken-drumsticks", name: "Chicken Drumsticks", image: "/images/menu/chicken-drumsticks.webp",
        pricing: [{ id: "2l", label: "2L", price: 60 }, { id: "12-tray", label: "12″ tray", price: 100 }, { id: "24-tray", label: "24″ tray", price: 200 }],
      },
      {
        id: "beef-mixed-offal", name: "Beef / Mixed Offal", image: "/images/menu/beef-mixed-offal.webp", priceNote: "Choose a meat option.",
        pricing: [{ id: "2l", label: "2L", price: 60 }, { id: "12-tray", label: "12″ tray", price: 120 }, { id: "24-tray", label: "24″ tray", price: 240 }],
        proteinOptionName: "Meat option",
        proteins: [{ id: "beef", label: "Beef" }, { id: "mixed-offal", label: "Mixed offal" }],
      },
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
      {
        id: "ogbono-soup", name: "Ogbono Soup", image: "/images/menu/ogbono-soup.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 120 }, { id: "12-tray", label: "12″ tray", price: 150 }, { id: "24-tray", label: "24″ tray", price: 300 }],
      },
      {
        id: "okro-soup", name: "Okro Soup", image: "/images/menu/okro-soup.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 130 }, { id: "24-tray", label: "24″ tray", price: 260 }],
      },
      {
        id: "ayamase", name: "Ayamase", image: "/images/menu/ayamase-new.jpeg", priceNote: "Made with seafood and assorted meat.",
        pricing: [{ id: "2l", label: "2L", price: 120 }, { id: "12-tray", label: "12″ tray", price: 150 }, { id: "24-tray", label: "24″ tray", price: 300 }],
      },
      {
        id: "ata-dindin", name: "Ata Dindin", image: "/images/menu/ata-dindin-new.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 120 }, { id: "12-tray", label: "12″ tray", price: 150 }, { id: "24-tray", label: "24″ tray", price: 300 }],
      },
      {
        id: "buka-stew", name: "Buka Stew", image: "/images/menu/buka-stew.jpeg", priceNote: "Made with mixed beef and offal.",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 120 }, { id: "24-tray", label: "24″ tray", price: 240 }],
      },
      {
        id: "turkey-stew", name: "Turkey Stew", image: "/images/menu/turkey-stew.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 130 }, { id: "24-tray", label: "24″ tray", price: 260 }],
      },
      {
        id: "chicken-stew", name: "Chicken Stew", image: "/images/menu/chicken-stew.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 90 }, { id: "12-tray", label: "12″ tray", price: 120 }, { id: "24-tray", label: "24″ tray", price: 240 }],
      },
      {
        id: "goat-meat-stew", name: "Goat Meat Stew", image: "/images/menu/goat-meat-stew.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 175 }, { id: "12-tray", label: "12″ tray", price: 200 }, { id: "24-tray", label: "24″ tray", price: 400 }],
      },
      {
        id: "seafood-okro", name: "Seafood Okro", image: "/images/menu/seafood-okro.jpeg",
        pricing: [{ id: "2l", label: "2L", price: 150 }, { id: "12-tray", label: "12″ tray", price: 180 }, { id: "24-tray", label: "24″ tray", price: 360 }],
      },
      {
        id: "imoyo", name: "Imoyo", image: "/images/menu/imoyo.webp",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 125 }, { id: "24-tray", label: "24″ tray", price: 250 }],
      },
      {
        id: "pepper-soup", name: "Pepper Soup", image: "/images/menu/pepper-soup.webp", priceNote: "Yam, plantain, or potato add-ons are available.",
        pricing: [
          { id: "12-tray", label: "12″ tray", price: 150, proteinPrices: { fish: 150, assorted: 150, goat: 150 } },
          { id: "24-tray", label: "24″ tray", price: 300, proteinPrices: { fish: 300, assorted: 300, goat: 300 } },
        ],
        proteins: [{ id: "fish", label: "Fish" }, { id: "assorted", label: "Assorted meat" }, { id: "goat", label: "Goat meat" }],
      },
    ],
  },
  {
    id: "swallows",
    name: "Swallows",
    shortName: "Swallows",
    note: "Available by the piece or in trays of 20.",
    items: [
      {
        id: "poundo-yam", name: "Pounded Yam", image: "/images/menu/poundo-yam.jpeg", requiresPepperTolerance: false,
        pricing: [{ id: "piece", label: "1 piece", price: 5 }, { id: "20-pieces", label: "Tray of 20", price: 100 }],
      },
      {
        id: "amala", name: "Amala", image: "/images/menu/amala.jpeg", requiresPepperTolerance: false,
        pricing: [{ id: "piece", label: "1 piece", price: 5 }, { id: "20-pieces", label: "Tray of 20", price: 100 }],
      },
      {
        id: "semo", name: "Semo", image: "/images/menu/semo.jpeg", requiresPepperTolerance: false,
        pricing: [{ id: "piece", label: "1 piece", price: 5 }, { id: "20-pieces", label: "Tray of 20", price: 100 }],
      },
    ],
  },
  {
    id: "sides",
    name: "Sides",
    shortName: "Sides",
    items: [
      {
        id: "moi-moi", name: "Moi Moi", image: "/images/menu/moi-moi-new.webp",
        pricing: [{ id: "12-pieces", label: "12 pieces", price: 60 }, { id: "24-pieces", label: "24 pieces", price: 120 }],
      },
      {
        id: "gizdodo", name: "Gizdodo", image: "/images/menu/gizdodo.webp",
        pricing: [{ id: "12-tray", label: "12″ tray", price: 120 }, { id: "24-tray", label: "24″ tray", price: 240 }],
      },
      {
        id: "plantains", name: "Plantain", image: "/images/menu/plantain.webp", requiresPepperTolerance: false,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 60 }, { id: "24-tray", label: "24″ tray", price: 120 }],
      },
      {
        id: "asun", name: "Asun", image: "/images/menu/asun.webp",
        pricing: [{ id: "12-tray", label: "12″ tray", price: 60 }, { id: "24-tray", label: "24″ tray", price: 120 }],
      },
      {
        id: "puff-puff", name: "Puff-Puff", image: "/images/menu/puff-puff.webp", requiresPepperTolerance: false,
        pricing: [{ id: "12-tray", label: "12″ tray", price: 50 }, { id: "24-tray", label: "24″ tray", price: 100 }],
      },
      {
        id: "masa-bowl", name: "Masa Bowl", image: "/images/menu/masa-bowl.webp", requiresPepperTolerance: false,
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
        id: "asaro", name: "Asaro (Yam Porridge)", image: "/images/menu/asaro.webp",
        pricing: [{ id: "12-tray", label: "12″ tray", price: 110 }, { id: "24-tray", label: "24″ tray", price: 220 }],
      },
      {
        id: "ikokore", name: "Iwuk Edesi (Water Yam Porridge)", image: "/images/menu/ikokore.webp",
        pricing: [{ id: "2l", label: "2L", price: 100 }, { id: "12-tray", label: "12″ tray", price: 125 }, { id: "24-tray", label: "24″ tray", price: 250 }],
      },
      {
        id: "ewa-agoyin", name: "Ewa Agoyin", image: "/images/menu/ewa-agoyin.webp",
        pricing: [{ id: "2l", label: "2L", price: 60 }, { id: "12-tray", label: "12″ tray", price: 75 }, { id: "24-tray", label: "24″ tray", price: 150 }],
      },
      {
        id: "ewa-agoyin-sauce", name: "Ewa Agoyin Sauce", image: "/images/menu/ewa-agoyin-sauce.webp",
        pricing: [{ id: "2l", label: "2L", price: 100 }],
      },
    ],
  },
] as const;

export const allMenuItems = menuCategories.flatMap((category) => category.items);
