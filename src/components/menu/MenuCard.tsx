"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import type { MenuItem, MenuPrice } from "@/data/menu";
import { menuCardVariants, menuImageVariants } from "@/lib/animations";

type MenuCardProps = {
  item: MenuItem;
  href?: string;
  size?: "default" | "tall";
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function MenuCard({ item, href, size = "default" }: MenuCardProps) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [selectedSizeId, setSelectedSizeId] = useState(item.pricing?.[0]?.id ?? "");
  const [selectedProteinId, setSelectedProteinId] = useState("");
  const [selectedGrainId, setSelectedGrainId] = useState("");
  const [pepperTolerance, setPepperTolerance] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (href) return <PreviewCard href={href} item={item} reduceMotion={Boolean(reduceMotion)} size={size} />;

  const selectedSize = item.pricing?.find((option) => option.id === selectedSizeId);
  const selectedProtein = item.proteins?.find((protein) => protein.id === selectedProteinId);
  const selectedGrain = item.grainOptions?.find((grain) => grain.id === selectedGrainId);
  const unitPrice = getUnitPrice(selectedSize, selectedProteinId);

  const addConfiguredItem = () => {
    if (!selectedSize || unitPrice === undefined || pepperTolerance === null) return;
    if (item.proteins && !selectedProtein) return;
    if (item.grainOptions && !selectedGrain) return;

    addItem({
      itemId: item.id,
      name: item.name,
      image: item.image,
      sizeId: selectedSize.id,
      sizeLabel: selectedSize.label,
      proteinId: selectedProtein?.id,
      proteinLabel: selectedProtein?.label,
      grainId: selectedGrain?.id,
      grainLabel: selectedGrain?.label,
      pepperTolerance,
      unitPrice,
    });
    setAdded(true);
    setPanelOpen(false);
  };

  return (
    <>
      <motion.article
        className="group grid h-full grid-cols-[7rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_14px_36px_rgba(0,0,0,0.24)] transition-[border-color,box-shadow] duration-300 hover:border-gold/30 hover:shadow-[0_22px_48px_rgba(0,0,0,0.4)] sm:flex sm:flex-col"
        variants={reduceMotion ? undefined : menuCardVariants}
        whileHover={reduceMotion ? undefined : "hover"}
      >
        <div className="relative min-h-full overflow-hidden bg-surface-elevated sm:aspect-[5/4] sm:min-h-0">
          <motion.div className="absolute inset-0" variants={reduceMotion ? undefined : menuImageVariants}>
            <Image alt={item.name} className="object-cover" fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" src={item.image} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl leading-none tracking-[-0.03em] text-foreground sm:text-3xl">{item.name}</h3>
            {unitPrice !== undefined ? <strong className="shrink-0 text-base text-gold sm:text-lg">{currency.format(unitPrice)}</strong> : null}
          </div>

          {item.pricing ? (
            <div className="mt-5 hidden sm:block">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Select size</p>
              <div className={`grid gap-2 ${item.pricing.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                {item.pricing.map((option) => (
                  <button
                    aria-pressed={selectedSizeId === option.id}
                    className={`min-h-10 rounded-lg border px-2 text-[11px] font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] ${selectedSizeId === option.id ? "border-gold bg-gold text-background" : "border-border bg-background text-muted hover:border-gold/60 hover:text-foreground"}`}
                    key={option.id}
                    onClick={() => { setSelectedSizeId(option.id); setAdded(false); }}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted sm:mt-5 sm:text-sm">Price awaiting confirmation.</p>
          )}

          <button
            className="mt-4 min-h-10 w-full rounded-lg border border-gold bg-transparent px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-gold transition-[background-color,color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-background hover:shadow-[0_10px_28px_rgba(230,165,26,0.2)] disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:shadow-none sm:mt-5 sm:min-h-12 sm:px-5 sm:text-xs sm:tracking-[0.14em]"
            disabled={!selectedSize}
            onClick={() => setPanelOpen(true)}
            type="button"
          >
            <span className="sm:hidden">{selectedSize ? added ? "Add another" : "Order" : "Unavailable"}</span>
            <span className="hidden sm:inline">{selectedSize ? added ? "Add another" : "Customize order" : "Unavailable"}</span>
          </button>
        </div>
      </motion.article>

      <AnimatePresence>
        {panelOpen && selectedSize ? (
          <OrderPanel
            item={item}
            onAdd={addConfiguredItem}
            onClose={() => setPanelOpen(false)}
            pepperTolerance={pepperTolerance}
            reduceMotion={Boolean(reduceMotion)}
            selectedProteinId={selectedProteinId}
            selectedGrainId={selectedGrainId}
            selectedSize={selectedSize}
            setPepperTolerance={setPepperTolerance}
            setSelectedProteinId={setSelectedProteinId}
            setSelectedGrainId={setSelectedGrainId}
            setSelectedSizeId={setSelectedSizeId}
            unitPrice={unitPrice}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function OrderPanel({ item, onAdd, onClose, pepperTolerance, reduceMotion, selectedGrainId, selectedProteinId, selectedSize, setPepperTolerance, setSelectedGrainId, setSelectedProteinId, setSelectedSizeId, unitPrice }: {
  item: MenuItem;
  onAdd: () => void;
  onClose: () => void;
  pepperTolerance: number | null;
  reduceMotion: boolean;
  selectedGrainId: string;
  selectedProteinId: string;
  selectedSize: MenuPrice;
  setPepperTolerance: (level: number) => void;
  setSelectedGrainId: (id: string) => void;
  setSelectedProteinId: (id: string) => void;
  setSelectedSizeId: (id: string) => void;
  unitPrice: number | undefined;
}) {
  const ready = pepperTolerance !== null
    && (!item.proteins || Boolean(selectedProteinId))
    && (!item.grainOptions || Boolean(selectedGrainId));

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] grid place-items-end bg-black/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-6"
      exit={{ opacity: 0 }}
      initial={reduceMotion ? false : { opacity: 0 }}
      role="presentation"
    >
      <motion.section
        aria-labelledby={`${item.id}-order-title`}
        aria-modal="true"
        className="max-h-[92svh] w-full overflow-y-auto rounded-t-2xl border border-border bg-surface p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:max-w-lg sm:rounded-2xl sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        role="dialog"
        transition={{ duration: 0.28 }}
      >
        <div className="flex items-start justify-between gap-5 border-b border-border pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Customize order</p>
            <h3 className="mt-2 font-display text-4xl leading-none text-foreground" id={`${item.id}-order-title`}>{item.name}</h3>
            <p className="mt-2 text-sm text-muted">{selectedSize.label}</p>
          </div>
          <button aria-label="Close order panel" className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-xl text-muted transition-colors hover:border-gold hover:text-foreground" onClick={onClose} type="button">×</button>
        </div>

        {item.pricing ? (
          <fieldset className="mt-6 sm:hidden">
            <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Choose size</legend>
            <div className={`grid gap-2 ${item.pricing.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {item.pricing.map((option) => (
                <button
                  aria-pressed={selectedSize.id === option.id}
                  className={`min-h-11 rounded-lg border px-2 text-[11px] font-semibold transition-colors ${selectedSize.id === option.id ? "border-gold bg-gold text-background" : "border-border bg-background text-muted"}`}
                  key={option.id}
                  onClick={() => setSelectedSizeId(option.id)}
                  type="button"
                >{option.label}</button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {item.grainOptions ? (
          <fieldset className="mt-6">
            <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Choose rice type <span className="text-gold">Required</span></legend>
            <div className="grid grid-cols-2 gap-2">
              {item.grainOptions.map((grain) => (
                <button
                  aria-pressed={selectedGrainId === grain.id}
                  className={`min-h-12 rounded-lg border px-3 text-sm font-semibold transition-[background-color,border-color,color,transform] active:scale-[0.98] ${selectedGrainId === grain.id ? "border-gold bg-gold text-background" : "border-border bg-background text-muted hover:border-gold/60 hover:text-foreground"}`}
                  key={grain.id}
                  onClick={() => setSelectedGrainId(grain.id)}
                  type="button"
                >{grain.label}</button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {item.proteins ? (
          <label className="mt-6 block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Choose protein</span>
            <select className="min-h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-gold" onChange={(event) => setSelectedProteinId(event.target.value)} required value={selectedProteinId}>
              <option value="">Select a protein</option>
              {item.proteins.map((protein) => <option key={protein.id} value={protein.id}>{protein.label}</option>)}
            </select>
          </label>
        ) : null}

        <fieldset className="mt-6">
          <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Pepper tolerance <span className="text-orange">Required</span></legend>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                aria-label={`Pepper tolerance ${level} of 5`}
                aria-pressed={pepperTolerance === level}
                className={`grid min-h-11 place-items-center rounded-lg border text-sm font-bold transition-[background-color,border-color,color,transform] active:scale-95 ${pepperTolerance === level ? "border-orange bg-orange text-white" : "border-border bg-background text-muted hover:border-orange/70 hover:text-foreground"}`}
                key={level}
                onClick={() => setPepperTolerance(level)}
                type="button"
              >{level}</button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted"><span>Mild</span><span>Hot</span></div>
        </fieldset>

        <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
          <span className="text-sm text-muted">Order total</span>
          <strong className="font-display text-4xl leading-none text-gold">{unitPrice === undefined ? "—" : currency.format(unitPrice)}</strong>
        </div>
        <button className="mt-5 min-h-12 w-full rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-[0.14em] text-background transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-border disabled:text-muted" disabled={!ready || unitPrice === undefined} onClick={onAdd} type="button">Add to cart</button>
      </motion.section>
    </motion.div>
  );
}

function getUnitPrice(selectedSize: MenuPrice | undefined, selectedProteinId: string) {
  if (!selectedSize) return undefined;
  if (selectedSize.proteinPrices && selectedProteinId) return selectedSize.proteinPrices[selectedProteinId];
  return selectedSize.price;
}

function PreviewCard({ href, item, reduceMotion, size }: { href: string; item: MenuItem; reduceMotion: boolean; size: "default" | "tall" }) {
  const heightClass = size === "tall" ? "min-h-[390px] md:min-h-[360px]" : "min-h-[320px] sm:min-h-[360px]";

  return (
    <motion.article className={`group relative overflow-hidden rounded-xl border border-white/10 bg-surface shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-shadow duration-200 hover:shadow-[0_18px_42px_rgba(0,0,0,0.38)] ${heightClass}`} variants={reduceMotion ? undefined : menuCardVariants} whileHover={reduceMotion ? undefined : "hover"} whileTap={reduceMotion ? undefined : "tap"}>
      <Link aria-label={`View ${item.name} on the menu`} className="absolute inset-0" href={href}>
        <motion.div className="absolute inset-0" variants={reduceMotion ? undefined : menuImageVariants}>
          <Image alt={item.name} className="object-cover" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" src={item.image} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6"><h3 className="font-display text-3xl leading-none tracking-[-0.03em] text-foreground sm:text-4xl">{item.name}</h3></div>
      </Link>
    </motion.article>
  );
}
