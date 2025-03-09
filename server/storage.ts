import { IStorage } from "./types";
import { 
  users, invoices, expenses, budgets,
  type User, type InsertUser,
  type Invoice, type Expense, type Budget
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();