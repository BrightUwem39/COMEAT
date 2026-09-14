export const inquiryStatusLabels = {
  NEW: "New",
  IN_REVIEW: "In review",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
} as const;

export type AdminInquiryStatus = keyof typeof inquiryStatusLabels;
export type AdminInquiryType = "CATERING" | "CONTACT";

export const inquiryStatuses = Object.keys(inquiryStatusLabels) as AdminInquiryStatus[];
export const inquiryTypes = ["CONTACT", "CATERING"] as const;
