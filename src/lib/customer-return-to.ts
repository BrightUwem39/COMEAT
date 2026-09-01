const CUSTOMER_ROUTE_PREFIXES = ["/profile", "/checkout"] as const;

export function getSafeCustomerReturnTo(
  value: string | string[] | undefined,
  fallback = "/profile",
) {
  if (typeof value !== "string") return fallback;

  try {
    const base = new URL("https://comeat.invalid");
    const parsed = new URL(value, base);
    const isCustomerRoute = CUSTOMER_ROUTE_PREFIXES.some((prefix) =>
      parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
    );

    if (parsed.origin !== base.origin || !isCustomerRoute) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
