import { z } from "zod";

export const quotationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z
    .enum(["DRAFT", "READY", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"])
    .optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type QuotationQueryInput = z.infer<typeof quotationQuerySchema>;
