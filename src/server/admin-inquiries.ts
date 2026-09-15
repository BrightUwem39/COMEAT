import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import {
  inquiryStatusLabels,
  inquiryStatuses,
  inquiryTypes,
  type AdminInquiryStatus,
  type AdminInquiryType,
} from "@/lib/admin-inquiry";
import { assertCurrentAdmin } from "@/server/admin-auth";
import { db } from "@/server/db";

const PAGE_SIZE = 12;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getAdminInquiries = cache(async (input: { page?: number; query?: string; status?: string; type?: string }) => {
  await assertCurrentAdmin("INQUIRIES_MANAGE");
  const query = input.query?.trim().slice(0, 80) ?? "";
  const status = inquiryStatuses.includes(input.status as AdminInquiryStatus) ? input.status as AdminInquiryStatus : null;
  const type = inquiryTypes.includes(input.type as AdminInquiryType) ? input.type as AdminInquiryType : null;
  const page = Number.isSafeInteger(input.page) && (input.page ?? 0) > 0 ? Math.min(input.page as number, 50) : 1;
  const take = page * PAGE_SIZE;

  const contactWhere: Prisma.ContactMessageWhereInput = {
    ...(status ? { status } : {}),
    ...(query ? { OR: [
      { customerName: { contains: query, mode: "insensitive" } },
      { customerEmail: { contains: query, mode: "insensitive" } },
      { customerPhone: { contains: query, mode: "insensitive" } },
      { subject: { contains: query, mode: "insensitive" } },
    ] } : {}),
  };
  const cateringWhere: Prisma.CateringInquiryWhereInput = {
    ...(status ? { status } : {}),
    ...(query ? { OR: [
      { customerName: { contains: query, mode: "insensitive" } },
      { customerEmail: { contains: query, mode: "insensitive" } },
      { customerPhone: { contains: query, mode: "insensitive" } },
      { eventType: { contains: query, mode: "insensitive" } },
      { venue: { contains: query, mode: "insensitive" } },
    ] } : {}),
  };

  const includeContact = type !== "CATERING";
  const includeCatering = type !== "CONTACT";
  const [contactCount, cateringCount, contacts, catering] = await Promise.all([
    includeContact ? db.contactMessage.count({ where: contactWhere }) : Promise.resolve(0),
    includeCatering ? db.cateringInquiry.count({ where: cateringWhere }) : Promise.resolve(0),
    includeContact ? db.contactMessage.findMany({
      where: contactWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        assignedUser: { select: { firstName: true, lastName: true } },
        createdAt: true,
        customerEmail: true,
        customerName: true,
        id: true,
        status: true,
        subject: true,
      },
    }) : Promise.resolve([]),
    includeCatering ? db.cateringInquiry.findMany({
      where: cateringWhere,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        assignedUser: { select: { firstName: true, lastName: true } },
        createdAt: true,
        customerEmail: true,
        customerName: true,
        eventDate: true,
        eventType: true,
        id: true,
        status: true,
      },
    }) : Promise.resolve([]),
  ]);

  const merged = [
    ...contacts.map((item) => ({
      assignedName: item.assignedUser ? `${item.assignedUser.firstName} ${item.assignedUser.lastName}` : null,
      createdAt: item.createdAt.toISOString(),
      customerEmail: item.customerEmail,
      customerName: item.customerName,
      eventDate: null,
      id: item.id,
      status: item.status,
      statusLabel: inquiryStatusLabels[item.status],
      title: item.subject,
      type: "CONTACT" as const,
    })),
    ...catering.map((item) => ({
      assignedName: item.assignedUser ? `${item.assignedUser.firstName} ${item.assignedUser.lastName}` : null,
      createdAt: item.createdAt.toISOString(),
      customerEmail: item.customerEmail,
      customerName: item.customerName,
      eventDate: item.eventDate?.toISOString() ?? null,
      id: item.id,
      status: item.status,
      statusLabel: inquiryStatusLabels[item.status],
      title: item.eventType,
      type: "CATERING" as const,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = contactCount + cateringCount;
  const offset = (page - 1) * PAGE_SIZE;
  return {
    page,
    pageSize: PAGE_SIZE,
    query,
    status,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    type,
    inquiries: merged.slice(offset, offset + PAGE_SIZE),
  };
});

export const getAdminInquiryDetail = cache(async (type: string, id: string) => {
  await assertCurrentAdmin("INQUIRIES_MANAGE");
  if (!UUID_PATTERN.test(id)) return null;
  if (type === "contact") {
    const message = await db.contactMessage.findUnique({
      where: { id },
      select: {
        assignedUser: { select: { firstName: true, id: true, lastName: true } },
        createdAt: true,
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        id: true,
        internalNote: true,
        message: true,
        status: true,
        subject: true,
        updatedAt: true,
      },
    });
    if (!message) return null;
    return {
      ...message,
      assignedName: message.assignedUser ? `${message.assignedUser.firstName} ${message.assignedUser.lastName}` : null,
      createdAt: message.createdAt.toISOString(),
      eventDate: null,
      eventType: null,
      guestCount: null,
      statusLabel: inquiryStatusLabels[message.status],
      title: message.subject,
      type: "CONTACT" as const,
      updatedAt: message.updatedAt.toISOString(),
      venue: null,
    };
  }
  if (type === "catering") {
    const inquiry = await db.cateringInquiry.findUnique({
      where: { id },
      select: {
        assignedUser: { select: { firstName: true, id: true, lastName: true } },
        createdAt: true,
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        eventDate: true,
        eventType: true,
        guestCount: true,
        id: true,
        internalNote: true,
        message: true,
        status: true,
        updatedAt: true,
        venue: true,
      },
    });
    if (!inquiry) return null;
    return {
      ...inquiry,
      assignedName: inquiry.assignedUser ? `${inquiry.assignedUser.firstName} ${inquiry.assignedUser.lastName}` : null,
      createdAt: inquiry.createdAt.toISOString(),
      eventDate: inquiry.eventDate?.toISOString() ?? null,
      statusLabel: inquiryStatusLabels[inquiry.status],
      subject: null,
      title: inquiry.eventType,
      type: "CATERING" as const,
      updatedAt: inquiry.updatedAt.toISOString(),
    };
  }
  return null;
});
