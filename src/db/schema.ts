import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Products shown on the landing page ("Collection" section).
 * You can edit these later from src/lib/site-content.ts (simple text file).
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  size: text("size").notNull().default(""),
  priceBgn: numeric("price_bgn", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  comparePriceBgn: numeric("compare_price_bgn", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull().default("/images/product-150.jpg"),
  badge: text("badge"),
  highlights: text("highlights").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Every order / question sent through the form is stored here.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().default(""),
  kind: text("kind").notNull().default("order"), // "order" | "question"
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  productId: integer("product_id"),
  productName: text("product_name").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  totalBgn: numeric("total_bgn", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("new"), // new | in_progress | done
  emailStatus: text("email_status").notNull().default("pending"), // pending | sent | skipped | failed
  emailDetail: text("email_detail").notNull().default(""),
  ipHash: text("ip_hash").notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;
