"use client";

export function PrintReceiptButton() {
  return <button className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold px-5 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-300 hover:bg-gold-light active:scale-[0.98] motion-reduce:transform-none print:hidden" onClick={() => window.print()} type="button">Print receipt</button>;
}
