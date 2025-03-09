import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertInvoiceSchema, 
  insertExpenseSchema, 
  insertBudgetSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const invoices = await storage.getInvoicesByUserId(req.user.id);
    res.json(invoices);
  });

  app.post("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertInvoiceSchema.parse(req.body);
    const invoice = await storage.createInvoice(req.user.id, data);
    res.status(201).json(invoice);
  });

  // Expenses
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const expenses = await storage.getExpensesByUserId(req.user.id);
    res.json(expenses);
  });

  app.post("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertExpenseSchema.parse(req.body);
    const expense = await storage.createExpense(req.user.id, data);
    res.status(201).json(expense);
  });

  // Budgets
  app.get("/api/budgets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const query = z.object({
      month: z.string().transform(x => parseInt(x)),
      year: z.string().transform(x => parseInt(x)),
    }).parse(req.query);
    
    const budgets = await storage.getBudgetsByUserIdAndMonth(
      req.user.id, 
      query.month,
      query.year
    );
    res.json(budgets);
  });

  app.post("/api/budgets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertBudgetSchema.parse(req.body);
    const budget = await storage.createBudget(req.user.id, data);
    res.status(201).json(budget);
  });

  // AI Assistance
  app.post("/api/ai/generate-description", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { invoiceDetails } = z.object({
      invoiceDetails: z.string()
    }).parse(req.body);

    try {
      const description = await storage.generateInvoiceDescription(invoiceDetails);
      res.json({ description });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate description" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
