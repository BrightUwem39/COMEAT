export type MenuCategory = {
  id: string;
  name: string;
  items: readonly string[];
};

export const menuCategories: readonly MenuCategory[] = [
  {
    id: "rice-and-mains",
    name: "Rice & Mains",
    items: ["Jollof Rice", "Fried Rice", "Local Rice", "Asaro", "Ikokore", "Imoyo"],
  },
  {
    id: "soups-and-sauces",
    name: "Soups & Sauces",
    items: ["Egusi", "Efo Riro", "Ayamase", "Ata Dindin", "Pepper Soup", "Spaghetti Bolognese"],
  },
  {
    id: "sides-and-snacks",
    name: "Sides & Snacks",
    items: ["Asun", "Naija Buns", "Puff-Puff", "Moi-Moi", "Ewa Agoyin"],
  },
] as const;
