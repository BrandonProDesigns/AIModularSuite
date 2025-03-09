import { User, InsertUser, Invoice, Expense, Budget } from "@shared/schema";
import { Store } from "express-session";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Invoice management
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  createInvoice(userId: number, data: Omit<Invoice, "id" | "userId" | "createdAt">): Promise<Invoice>;

  // Expense management
  getExpensesByUserId(userId: number): Promise<Expense[]>;
  createExpense(userId: number, data: Omit<Expense, "id" | "userId" | "createdAt">): Promise<Expense>;

  // Budget management
  getBudgetsByUserIdAndMonth(userId: number, month: number, year: number): Promise<Budget[]>;
  createBudget(userId: number, data: Omit<Budget, "id" | "userId">): Promise<Budget>;

  // AI features
  generateInvoiceDescription(details: string): Promise<string>;

  // Session store
  sessionStore: Store;
}
