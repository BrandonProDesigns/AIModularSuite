import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvoiceSchema, Invoice } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, Send, CurrencyIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoicesPage() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      customerName: "",
      description: "",
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending"
    }
  });

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"]
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/invoices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      form.reset();
      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async ({ id, email }: { id: number; email: string }) => {
      const res = await apiRequest("POST", `/api/invoices/${id}/send`, { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice sent successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const handleCurrencyConvert = async (invoiceId: number, currency: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/convert?currency=${currency}`, {
        credentials: 'include'
      });
      const data = await response.json();
      toast({
        title: "Currency Conversion",
        description: `${data.originalAmount} USD = ${data.convertedAmount.toFixed(2)} ${currency}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Currency conversion failed",
        variant: "destructive"
      });
    }
  };

  const generateDescriptionMutation = useMutation({
    mutationFn: async (details: string) => {
      const res = await apiRequest("POST", "/api/ai/generate-description", { invoiceDetails: details });
      return res.json();
    },
    onSuccess: (data) => {
      form.setValue("description", data.description);
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center">
          <Link href="/">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Invoices</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(data => createInvoiceMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Textarea {...field} />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => generateDescriptionMutation.mutate(form.getValues("customerName"))}
                              disabled={generateDescriptionMutation.isPending}
                            >
                              {generateDescriptionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Generate with AI
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createInvoiceMutation.isPending}>
                    {createInvoiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Invoice
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{invoice.customerName}</h3>
                          <p className="text-sm text-slate-500">{invoice.description}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="text-right">
                            <div className="font-bold">${invoice.amount}</div>
                            <div className="text-sm text-slate-500">
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const email = prompt("Enter recipient email:");
                                if (email) {
                                  sendInvoiceMutation.mutate({ id: invoice.id, email });
                                }
                              }}>
                                <Send className="h-4 w-4 mr-2" />
                                Send via Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCurrencyConvert(invoice.id, 'EUR')}>
                                <CurrencyIcon className="h-4 w-4 mr-2" />
                                Convert to EUR
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCurrencyConvert(invoice.id, 'GBP')}>
                                <CurrencyIcon className="h-4 w-4 mr-2" />
                                Convert to GBP
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-slate-500">
                          Created: {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                        <div className="capitalize">{invoice.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}