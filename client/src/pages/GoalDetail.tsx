import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Goal, insertGoalSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useParams } from "wouter";
import { differenceInMonths } from "date-fns";
import { z } from "zod";
import { useEffect } from "react";

const editSchema = insertGoalSchema.extend({
  currentAmount: z.string(),
});

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const goalId = Number(id);
  const { toast } = useToast();

  const { data: goal, isLoading } = useQuery<Goal>({
    queryKey: [`/api/goals/${goalId}`],
  });

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      targetAmount: "0",
      currentAmount: "0",
      deadline: new Date().toISOString().split("T")[0],
      breakdown: {},
    },
  });

  useEffect(() => {
    if (goal) {
      form.reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline.split("T")[0],
        breakdown: goal.breakdown,
      });
    }
  }, [goal, form]);

  const updateGoal = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/goals/${goalId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${goalId}`] });
      toast({ title: "Success", description: "Goal updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading || !goal) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
  const monthsLeft = Math.max(1, differenceInMonths(new Date(goal.deadline), new Date()));
  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
  const monthlySave = remaining > 0 ? remaining / monthsLeft : 0;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{goal.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-sm">
            ${goal.currentAmount} / ${goal.targetAmount}
          </div>
          <Progress value={progress} />
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Breakdown</h2>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(goal.breakdown).map(([item, amount]) => (
                <li key={item}>
                  {item}: ${amount}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 text-sm">
            You need to save ${monthlySave.toFixed(2)} per month to reach your goal.
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4">Edit Goal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Goal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(values => updateGoal.mutate(values))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="breakdown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Breakdown (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            value={JSON.stringify(field.value)}
                            onChange={e => {
                              try {
                                field.onChange(JSON.parse(e.target.value || "{}"));
                              } catch {
                                field.onChange({});
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={updateGoal.isPending}>
                    {updateGoal.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
