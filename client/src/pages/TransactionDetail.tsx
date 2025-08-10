import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  category: string;
  amount: number;
  date: string;
  payer: string;
  notes?: string;
  receipt?: string;
}

export default function TransactionDetail() {
  const [match, params] = useRoute("/transactions/:id");
  const id = params?.id as string;
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    date: "",
    payer: "",
    notes: "",
    receipt: ""
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data) {
        setTransaction(data as Transaction);
        setForm({
          category: data.category || "",
          amount: String(data.amount ?? ""),
          date: data.date ? data.date.slice(0, 10) : "",
          payer: data.payer || "",
          notes: data.notes || "",
          receipt: data.receipt || ""
        });
      }
      setLoading(false);
    };
    load();
  }, [id, toast]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("transactions")
      .update({
        category: form.category,
        amount: parseFloat(form.amount),
        date: form.date,
        payer: form.payer,
        notes: form.notes,
        receipt: form.receipt
      })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Transaction updated" });
      setTransaction({
        id,
        category: form.category,
        amount: parseFloat(form.amount),
        date: form.date,
        payer: form.payer,
        notes: form.notes,
        receipt: form.receipt
      });
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Transaction deleted" });
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!transaction) {
    return <div className="p-4">Transaction not found.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Category</label>
            <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium">Amount</label>
            <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium">Payer</label>
            <Input value={form.payer} onChange={e => setForm({ ...form, payer: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium">Receipt URL</label>
            <Input value={form.receipt} onChange={e => setForm({ ...form, receipt: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleUpdate}>Save</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div><strong>Category:</strong> {transaction.category}</div>
          <div><strong>Amount:</strong> {transaction.amount}</div>
          <div><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</div>
          <div><strong>Payer:</strong> {transaction.payer}</div>
          {transaction.notes && <div><strong>Notes:</strong> {transaction.notes}</div>}
          {transaction.receipt && (
            <div>
              <strong>Receipt:</strong> <a className="text-blue-500 underline" href={transaction.receipt} target="_blank" rel="noopener noreferrer">View</a>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      )}
    </div>
  );
}
