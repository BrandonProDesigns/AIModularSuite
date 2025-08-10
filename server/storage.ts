import { IStorage } from "./types";
import {
  users,
  invoices,
  expenses,
  budgets,
  tips,
  type User,
  type InsertUser,
  type Invoice,
  type Expense,
  type Budget,
  type Tip,
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      createTableIfMissing: true,
      pool: db.$client,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async createInvoice(userId: number, data: Omit<Invoice, "id" | "userId" | "createdAt">): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values({
        ...data,
        userId,
        createdAt: new Date(),
      })
      .returning();
    return invoice;
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return db.select().from(expenses).where(eq(expenses.userId, userId));
  }

  async createExpense(userId: number, data: Omit<Expense, "id" | "userId" | "createdAt">): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        ...data,
        userId,
        createdAt: new Date(),
      })
      .returning();
    return expense;
  }

  async getBudgetsByUserIdAndMonth(userId: number, month: number, year: number): Promise<Budget[]> {
    return db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, month),
          eq(budgets.year, year)
        )
      );
  }

  async createBudget(userId: number, data: Omit<Budget, "id" | "userId">): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values({
        ...data,
        userId,
      })
      .returning();
    return budget;
  }

  async generateInvoiceDescription(details: string): Promise<string> {
    // Simple AI simulation for invoice description generation
    const templates = [
      "Professional services rendered for {details}",
      "Consulting work completed regarding {details}",
      "Project deliverables for {details}"
    ];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace("{details}", details);
  }

  async generateSpendingTip(userId: number, type: string): Promise<Tip> {
    const expenses = await this.getExpensesByUserId(userId);
    const summary = expenses
      .map((e) => `${e.category}: $${e.amount}`)
      .join(", ");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `You are a financial coach. Based on the following spending summary: ${summary}. Provide a ${type}.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const message =
      completion.choices[0]?.message?.content?.trim() ||
      "Keep tracking your expenses consistently.";

    const [tip] = await db
      .insert(tips)
      .values({ type, message })
      .returning();
    return tip;
  }
}

export const storage = new DatabaseStorage();