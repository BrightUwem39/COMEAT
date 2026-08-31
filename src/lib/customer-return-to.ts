const CUSTOMER_ROUTE_PREFIX = "/profile";

export function getSafeCustomerReturnTo(
  value: string | string[] | undefined,
  fallback = CUSTOMER_ROUTE_PREFIX,
) {
  if (typeof value !== "string") return fallback;

  try {
    const base = new URL("https://comeat.invalid");
    const parsed = new URL(value, base);
    const isCustomerRoute =
      parsed.pathname === CUSTOMER_ROUTE_PREFIX ||
      parsed.pathname.startsWith(`${CUSTOMER_ROUTE_PREFIX}/`);

    if (parsed.origin !== base.origin || !isCustomerRoute) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
