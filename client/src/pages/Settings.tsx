import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema, Category, Expense, Budget } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();

  // Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  const categoryForm = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: { name: "" }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      categoryForm.reset();
      toast({ title: "Success", description: "Category added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Data sets
  const { data: expenses = [] } = useQuery<Expense[]>({ queryKey: ["/api/expenses"] });
  const { data: budgets = [] } = useQuery<Budget[]>({ queryKey: ["/api/budgets"] });

  const handleExportCSV = () => {
    const csv = Papa.unparse({ categories, expenses, budgets });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(categories), "Categories");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expenses), "Expenses");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(budgets), "Budgets");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: async (results: any) => {
        const rows = results.data as any[];
        for (const row of rows) {
          if (row.name) {
            await apiRequest("POST", "/api/categories", { name: row.name });
          }
        }
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      }
    });
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data as any, { type: "binary" });
      const sheet = workbook.Sheets["Categories"];
      if (sheet) {
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);
        for (const row of rows) {
          if (row.name) {
            await apiRequest("POST", "/api/categories", { name: row.name });
          }
        }
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBackup = async () => {
    const payload = { categories, expenses, budgets };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const { error } = await supabase.storage.from("backups").upload(`backup-${Date.now()}.json`, blob);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Backup uploaded" });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage your profile information.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage team members.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(data => createCategoryMutation.mutate(data))} className="flex space-x-2 mb-4">
              <FormField control={categoryForm.control} name="name" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="New category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add
              </Button>
            </form>
          </Form>
          <ul className="list-disc pl-6 space-y-1">
            {categories.map(cat => (
              <li key={cat.id}>{cat.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportCSV}>Export CSV</Button>
            <Button onClick={handleExportExcel}>Export Excel</Button>
            <Button variant="secondary" onClick={handleBackup}>Backup to Cloud</Button>
          </div>
          <div className="space-y-2">
            <div>
              <FormLabel>Import CSV</FormLabel>
              <Input type="file" accept=".csv" onChange={handleImportCSV} />
            </div>
            <div>
              <FormLabel>Import Excel</FormLabel>
              <Input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
