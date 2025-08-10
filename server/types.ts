import { User, InsertUser, Invoice, Expense, Budget, Category, InsertCategory } from "@shared/schema";
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

  // Category management
  getCategoriesByUserId(userId: number): Promise<Category[]>;
  createCategory(userId: number, data: InsertCategory): Promise<Category>;

  // AI features
  generateInvoiceDescription(details: string): Promise<string>;

  // Session store
  sessionStore: Store;
}
