import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import {
  insertInvoiceSchema,
  insertExpenseSchema,
  insertBudgetSchema,
  insertCategorySchema
} from "@shared/schema";
import { z } from "zod";
import { generateInvoicePDF } from './services/pdf-generator';
import { convertCurrency } from './services/currency';
import { sendInvoiceEmail } from './services/email';

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

  // Download invoice as PDF
  app.get("/api/invoices/:id/pdf", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const invoices = await storage.getInvoicesByUserId(req.user.id);
    const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    try {
      const pdfBuffer = await generateInvoicePDF(invoice);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.id}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Convert invoice amount to different currency
  app.get("/api/invoices/:id/convert", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { currency } = z.object({
      currency: z.string().length(3)
    }).parse(req.query);

    const invoices = await storage.getInvoicesByUserId(req.user.id);
    const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    try {
      const convertedAmount = await convertCurrency(Number(invoice.amount), 'USD', currency);
      res.json({
        originalAmount: invoice.amount,
        convertedAmount,
        currency
      });
    } catch (error) {
      res.status(500).json({ message: "Currency conversion failed" });
    }
  });

  // Send invoice via email
  app.post("/api/invoices/:id/send", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { email } = z.object({
      email: z.string().email()
    }).parse(req.body);

    const invoices = await storage.getInvoicesByUserId(req.user.id);
    const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    try {
      const pdfBuffer = await generateInvoicePDF(invoice);
      await sendInvoiceEmail(invoice, email, pdfBuffer);
      res.json({ message: "Invoice sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send invoice" });
    }
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

  // Categories
  app.get("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const categories = await storage.getCategoriesByUserId(req.user.id);
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(req.user.id, data);
    res.status(201).json(category);
  });

  // Budgets
  app.get("/api/budgets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Get current month and year as defaults
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const query = z.object({
      month: z.string().optional().transform(x => parseInt(x || currentMonth.toString())),
      year: z.string().optional().transform(x => parseInt(x || currentYear.toString())),
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