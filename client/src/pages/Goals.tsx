import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema, Goal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
export default function GoalsPage() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: "0",
      deadline: new Date().toISOString().split("T")[0],
      breakdown: {},
    },
  });

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoal = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      form.reset({
        name: "",
        targetAmount: "0",
        deadline: new Date().toISOString().split("T")[0],
        breakdown: {},
      });
      toast({ title: "Success", description: "Goal added" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Goal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(values => createGoal.mutate(values))}
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
                <Button type="submit" className="w-full" disabled={createGoal.isPending}>
                  {createGoal.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Goal
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/goals/${goal.id}`}>{goal.name}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm">
                    ${goal.currentAmount} / ${goal.targetAmount}
                  </div>
                  <Progress value={progress} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
