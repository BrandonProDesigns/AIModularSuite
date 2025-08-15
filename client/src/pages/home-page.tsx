import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PlusCircle, Receipt, Wallet, LineChart, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Invoice, Expense } from "@shared/schema";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"]
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"]
  });

  const totalInvoices = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvoices.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {invoices.length} invoice(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {expenses.length} expense(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalInvoices - totalExpenses).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Current balance
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/invoices">
            <Button className="w-full h-32">
              <PlusCircle className="h-6 w-6 mr-2" />
              Create New Invoice
            </Button>
          </Link>
          <Link href="/budget">
            <Button className="w-full h-32" variant="outline">
              <Wallet className="h-6 w-6 mr-2" />
              Manage Budget
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
