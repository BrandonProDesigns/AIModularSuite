import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Tip } from "@shared/schema";

export default function TipsPage() {
  const { data: daily } = useQuery<Tip>({ queryKey: ["/api/tips?type=daily"] });
  const { data: weekly } = useQuery<Tip>({ queryKey: ["/api/tips?type=weekly"] });
  const { data: challenge } = useQuery<Tip>({ queryKey: ["/api/tips?type=challenge"] });

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily Quote</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Tip</TabsTrigger>
          <TabsTrigger value="challenge">Money Habit Challenge</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <p>{daily?.message ?? "Loading..."}</p>
        </TabsContent>
        <TabsContent value="weekly">
          <p>{weekly?.message ?? "Loading..."}</p>
        </TabsContent>
        <TabsContent value="challenge">
          <p>{challenge?.message ?? "Loading..."}</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
