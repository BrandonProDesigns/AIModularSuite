import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  userId: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
