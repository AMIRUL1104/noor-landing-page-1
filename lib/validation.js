// Server-side request schema (Zod). Unknown keys are rejected.
import { z } from "zod";
import { COLOR_IDS, SIZE_IDS, PRODUCT } from "./products.js";
import { LIMITS, PHONE_RE, cleanText, normalizePhone } from "./rules.js";

const text = (min, max) =>
  z
    .string()
    .max(max * 4)
    .transform(cleanText)
    .pipe(z.string().min(min).max(max));

export const orderSchema = z.strictObject({
  colorId: z.enum(COLOR_IDS),
  sizeId: z.enum(SIZE_IDS),
  quantity: z.number().int().min(1).max(PRODUCT.maxQty),
  name: text(...LIMITS.name),
  phone: z
    .string()
    .max(30)
    .transform(normalizePhone)
    .pipe(z.string().regex(PHONE_RE)),
  address: text(...LIMITS.address),
  lang: z.enum(["bn", "en"]),
  idempotencyKey: z.uuid(),
  website: z.string().max(200).optional().default(""), // honeypot
});
