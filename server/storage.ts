import { IStorage } from "./types";
import { 
  User, InsertUser,
  Invoice, expenses, budgets,
  Expense, Budget
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private invoices: Map<number, Invoice>;
  private expenses: Map<number, Expense>;
  private budgets: Map<number, Budget>;
  private currentId: { [key: string]: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
    this.expenses = new Map();
    this.budgets = new Map();
    this.currentId = {
      users: 1,
      invoices: 1,
      expenses: 1,
      budgets: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.userId === userId
    );
  }

  async createInvoice(userId: number, data: Omit<Invoice, "id" | "userId" | "createdAt">): Promise<Invoice> {
    const id = this.currentId.invoices++;
    const invoice = {
      ...data,
      id,
      userId,
      createdAt: new Date()
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId
    );
  }

  async createExpense(userId: number, data: Omit<Expense, "id" | "userId" | "createdAt">): Promise<Expense> {
    const id = this.currentId.expenses++;
    const expense = {
      ...data,
      id,
      userId,
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getBudgetsByUserIdAndMonth(userId: number, month: number, year: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => 
        budget.userId === userId && 
        budget.month === month &&
        budget.year === year
    );
  }

  async createBudget(userId: number, data: Omit<Budget, "id" | "userId">): Promise<Budget> {
    const id = this.currentId.budgets++;
    const budget = {
      ...data,
      id,
      userId
    };
    this.budgets.set(id, budget);
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

export const storage = new MemStorage();
