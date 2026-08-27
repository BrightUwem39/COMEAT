export type MenuItem = {
  id: string;
  name: string;
  image: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  shortName: string;
  items: readonly MenuItem[];
};

export const menuCategories: readonly MenuCategory[] = [
  {
    id: "rice-and-mains",
    name: "Rice & Mains",
    shortName: "Rice",
    items: [
      { id: "jollof-rice", name: "Jollof Rice", image: "/images/hero.jpg" },
      { id: "fried-rice", name: "Fried Rice", image: "/images/menu/fried-rice.webp" },
      { id: "local-rice", name: "Local Rice", image: "/images/menu/local-rice.webp" },
      { id: "asaro", name: "Asaro", image: "/images/menu/asaro.webp" },
      { id: "ikokore", name: "Ikokore", image: "/images/menu/ikokore.webp" },
      { id: "imoyo", name: "Imoyo", image: "/images/menu/imoyo.webp" },
    ],
  },
  {
    id: "soups-and-sauces",
    name: "Soups & Sauces",
    shortName: "Soups",
    items: [
      { id: "egusi", name: "Egusi", image: "/images/menu/egusi.webp" },
      { id: "efo-riro", name: "Efo Riro", image: "/images/menu/efo-riro.webp" },
      { id: "ayamase", name: "Ayamase", image: "/images/menu/ayamase.webp" },
      { id: "ata-dindin", name: "Ata Dindin", image: "/images/menu/ata-dindin.webp" },
      { id: "pepper-soup", name: "Pepper Soup", image: "/images/menu/pepper-soup.webp" },
      { id: "spaghetti-bolognese", name: "Spaghetti Bolognese", image: "/images/menu/spaghetti-bolognese.webp" },
    ],
  },
  {
    id: "sides-and-snacks",
    name: "Sides & Snacks",
    shortName: "Sides",
    items: [
      { id: "asun", name: "Asun", image: "/images/menu/asun.webp" },
      { id: "naija-buns", name: "Naija Buns", image: "/images/menu/naija-buns.webp" },
      { id: "puff-puff", name: "Puff-Puff", image: "/images/menu/puff-puff.webp" },
      { id: "moi-moi", name: "Moi-Moi", image: "/images/menu/moi-moi.webp" },
      { id: "ewa-agoyin", name: "Ewa Agoyin", image: "/images/menu/ewa-agoyin.webp" },
    ],
  },
] as const;

export const allMenuItems = menuCategories.flatMap((category) => category.items);
