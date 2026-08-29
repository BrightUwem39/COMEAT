"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  key: string;
  itemId: string;
  name: string;
  image: string;
  sizeId: string;
  sizeLabel: string;
  proteinId?: string;
  proteinLabel?: string;
  grainId?: string;
  grainLabel?: string;
  pepperTolerance: number;
  unitPrice: number;
  quantity: number;
};

export type AllergyInfo = {
  status: "unanswered" | "none" | "has-allergies";
  details: string;
  acknowledged: boolean;
};

type NewCartItem = Omit<CartItem, "key" | "quantity">;

type CartContextValue = {
  items: readonly CartItem[];
  itemCount: number;
  subtotal: number;
  allergyInfo: AllergyInfo;
  addItem: (item: NewCartItem) => void;
  clearCart: () => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateAllergyInfo: (allergyInfo: AllergyInfo) => void;
};

const STORAGE_KEY = "comeat-cart";
const ALLERGY_STORAGE_KEY = "comeat-allergy-info";
const CartContext = createContext<CartContextValue | null>(null);

const defaultAllergyInfo: AllergyInfo = {
  status: "unanswered",
  details: "",
  acknowledged: false,
};

function buildCartKey(item: NewCartItem) {
  return [item.itemId, item.sizeId, item.proteinId ?? "none", item.grainId ?? "none", item.pepperTolerance].join(":");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [allergyInfo, setAllergyInfo] = useState<AllergyInfo>(defaultAllergyInfo);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let savedItems: CartItem[] = [];
    let savedAllergyInfo = defaultAllergyInfo;
    try {
      const savedCart = window.localStorage.getItem(STORAGE_KEY);
      if (savedCart) savedItems = JSON.parse(savedCart) as CartItem[];
      const savedAllergies = window.localStorage.getItem(ALLERGY_STORAGE_KEY);
      if (savedAllergies) savedAllergyInfo = JSON.parse(savedAllergies) as AllergyInfo;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ALLERGY_STORAGE_KEY);
    }

    const frame = window.requestAnimationFrame(() => {
      setItems(savedItems);
      setAllergyInfo(savedAllergyInfo);
      setStorageReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.localStorage.setItem(ALLERGY_STORAGE_KEY, JSON.stringify(allergyInfo));
  }, [allergyInfo, items, storageReady]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    allergyInfo,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    addItem: (newItem) => {
      const key = buildCartKey(newItem);
      setItems((currentItems) => {
        const existing = currentItems.find((item) => item.key === key);
        if (existing) {
          return currentItems.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...currentItems, { ...newItem, key, quantity: 1 }];
      });
    },
    clearCart: () => setItems([]),
    removeItem: (key) => setItems((currentItems) => currentItems.filter((item) => item.key !== key)),
    updateQuantity: (key, quantity) => {
      if (quantity < 1) {
        setItems((currentItems) => currentItems.filter((item) => item.key !== key));
        return;
      }
      setItems((currentItems) => currentItems.map((item) => item.key === key ? { ...item, quantity } : item));
    },
    updateAllergyInfo: setAllergyInfo,
  }), [allergyInfo, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
