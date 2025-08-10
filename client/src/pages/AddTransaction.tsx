import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  insertTransactionSchema,
  type User,
} from '@shared/schema';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Utensils,
  Car,
  ShoppingBag,
  Plane,
} from 'lucide-react';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { useOcrInput } from '@/hooks/use-ocr-input';

const categories = [
  { name: 'Food', icon: Utensils },
  { name: 'Travel', icon: Plane },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Transport', icon: Car },
];

const formSchema = insertTransactionSchema
  .extend({ receipt: z.any().optional() })
  .omit({ receiptUrl: true });

type FormValues = z.infer<typeof formSchema>;

export default function AddTransaction() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  useVoiceInput();
  useOcrInput();

  useEffect(() => {
    supabase
      .from('users')
      .select('id, username')
      .then(({ data }) => {
        if (data) setUsers(data as unknown as User[]);
      });
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payerId: undefined,
      category: '',
      amount: 0,
      note: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      let receiptUrl: string | undefined;
      const file = (values as any).receipt?.[0] as File | undefined;
      if (file) {
        const filename = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('receipts')
          .upload(filename, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(data.path);
        receiptUrl = urlData.publicUrl;
      }
      const { error: insertError } = await supabase.from('transactions').insert({
        payer_id: values.payerId,
        category: values.category,
        amount: values.amount,
        note: values.note,
        receipt_url: receiptUrl,
      });
      if (insertError) throw insertError;
      toast({ title: 'Success', description: 'Transaction recorded.' });
      form.reset();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="payerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payer</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded p-2"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  >
                    <option value="">Select user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const selected = field.value === cat.name;
                      return (
                        <button
                          type="button"
                          key={cat.name}
                          onClick={() => field.onChange(cat.name)}
                          className={cn(
                            'p-2 border rounded flex flex-col items-center',
                            selected && 'bg-primary text-primary-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span className="text-xs">{cat.name}</span>
                        </button>
                      );
                    })}
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
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receipt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receipt</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Add Transaction'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
