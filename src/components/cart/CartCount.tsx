"use client";

import { useCart } from "./CartProvider";

export function CartCount({ compact = false }: { compact?: boolean }) {
  const { itemCount } = useCart();

  if (compact) {
    return itemCount > 0 ? (
      <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold leading-none text-background">
        {itemCount}
      </span>
    ) : null;
  }

  return <span className="text-muted transition-colors duration-300 group-hover/cart:text-gold-light">({itemCount})</span>;
}
