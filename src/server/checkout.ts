import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { requireCurrentCustomer } from "@/server/auth-session";
import { db } from "@/server/db";

const DEFAULT_RULES = {
  minimumAdvanceHours: 48,
  deliveryWindowStart: "09:00",
  deliveryWindowEnd: "15:00",
  outOfStateShippingDays: ["MONDAY", "TUESDAY", "WEDNESDAY"],
  weeklyShippingCutoffDay: "FRIDAY",
} as const;

export type CheckoutAddressDTO = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  streetLine1: string;
  streetLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  isDefault: boolean;
};

export type CheckoutRulesDTO = {
  orderingAvailable: boolean;
  minimumAdvanceHours: number;
  earliestFulfillmentDate: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  outOfStateShippingDays: string[];
  weeklyShippingCutoffDay: string;
};

export async function getCheckoutEntryData() {
  const customer = await requireCurrentCustomer("/checkout");
  const [account, rules] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: customer.userId },
      select: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
          select: {
            id: true,
            label: true,
            recipientName: true,
            phone: true,
            streetLine1: true,
            streetLine2: true,
            city: true,
            state: true,
            postalCode: true,
            countryCode: true,
            isDefault: true,
          },
        },
      },
    }),
    getCheckoutRules(),
  ]);

  return {
    customer: {
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    },
    addresses: account.addresses,
    rules,
  };
}

export async function getCheckoutRules(
  client: Prisma.TransactionClient | typeof db = db,
  now = new Date(),
): Promise<CheckoutRulesDTO> {
  const settings = await client.operationalSetting.findMany({
      where: {
        key: {
          in: [
            "minimum_advance_order_hours",
            "local_delivery_window",
            "out_of_state_shipping_days",
            "weekly_shipping_cutoff",
            "ordering_available",
          ],
        },
      },
      select: { key: true, value: true },
    });

  const settingsByKey = new Map(settings.map((setting) => [setting.key, setting.value]));
  const minimumAdvanceHours = positiveNumber(
    settingsByKey.get("minimum_advance_order_hours"),
    DEFAULT_RULES.minimumAdvanceHours,
  );
  const deliveryWindow = stringRecord(settingsByKey.get("local_delivery_window"));
  const shippingCutoff = stringRecord(settingsByKey.get("weekly_shipping_cutoff"));
  const configuredShippingDays = settingsByKey.get("out_of_state_shipping_days");
  const outOfStateShippingDays = Array.isArray(configuredShippingDays)
    ? configuredShippingDays.filter((day): day is string => typeof day === "string")
    : [...DEFAULT_RULES.outOfStateShippingDays];
  const deliveryWindowStart = validTime(deliveryWindow?.start)
    ? deliveryWindow.start
    : DEFAULT_RULES.deliveryWindowStart;
  const deliveryWindowEnd = validTime(deliveryWindow?.end)
    ? deliveryWindow.end
    : DEFAULT_RULES.deliveryWindowEnd;

  const rules: CheckoutRulesDTO = {
    orderingAvailable: settingsByKey.get("ordering_available") !== false,
    minimumAdvanceHours,
    earliestFulfillmentDate: getEarliestFulfillmentDate(minimumAdvanceHours, deliveryWindowStart, now),
    deliveryWindowStart,
    deliveryWindowEnd,
    outOfStateShippingDays,
    weeklyShippingCutoffDay: typeof shippingCutoff?.day === "string"
      ? shippingCutoff.day
      : DEFAULT_RULES.weeklyShippingCutoffDay,
  };

  return rules;
}

export function getFulfillmentWindow(requestedDate: string, rules: CheckoutRulesDTO) {
  return {
    start: zonedDateTimeToUtc(requestedDate, rules.deliveryWindowStart, "America/New_York"),
    end: zonedDateTimeToUtc(requestedDate, rules.deliveryWindowEnd, "America/New_York"),
  };
}

export function getShippingCutoff(requestedDate: string, rules: CheckoutRulesDTO) {
  const weekday = new Date(`${requestedDate}T12:00:00Z`).getUTCDay();
  const cutoffWeekday = weekdayNameToNumber(rules.weeklyShippingCutoffDay);
  const daysSinceCutoff = (weekday - cutoffWeekday + 7) % 7 || 7;
  const cutoffDate = addCalendarDays(requestedDate, -daysSinceCutoff);
  return zonedDateTimeToUtc(cutoffDate, "23:59", "America/New_York");
}

function positiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function stringRecord(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function validTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function getEarliestFulfillmentDate(minimumAdvanceHours: number, windowStart: string, now: Date) {
  const threshold = now.getTime() + minimumAdvanceHours * 60 * 60 * 1000;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = formatter.format(now);

  for (let offset = 0; offset < 370; offset += 1) {
    const candidate = addCalendarDays(today, offset);
    if (zonedDateTimeToUtc(candidate, windowStart, "America/New_York").getTime() >= threshold) {
      return candidate;
    }
  }

  throw new Error("Unable to calculate the earliest fulfillment date.");
}

function addCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}

function zonedDateTimeToUtc(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]),
    );
    const rendered = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    guess += target - rendered;
  }

  return new Date(guess);
}

function weekdayNameToNumber(day: string) {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const index = days.indexOf(day.toUpperCase());
  return index >= 0 ? index : 5;
}
