import { useEffect, useState } from "react";
import MemberCard from "@/components/MemberCard";
import { getMembers, addMember, Member } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async () => {
    const name = prompt("Enter member name");
    if (!name) return;
    try {
      await addMember(name);
      fetchMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const wallet = { total: 5000, income: 3000, expenses: 2000 };
  const health = 70;
  const pieData = [
    { name: "Rent", value: 800 },
    { name: "Groceries", value: 400 },
    { name: "Utilities", value: 300 },
    { name: "Fun", value: 200 },
  ];

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center gap-4 overflow-x-auto">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
        <Button
          onClick={handleAddMember}
          className="h-16 w-16 rounded-full text-xl"
        >
          +
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h2 className="text-sm font-medium">Wallet Snapshot</h2>
          <div className="mt-2 space-y-1 text-sm">
            <div>Total Balance: ${wallet.total}</div>
            <div>Income: ${wallet.income}</div>
            <div>Expenses: ${wallet.expenses}</div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-medium mb-2">Health Meter</h2>
          <Progress value={health} />
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-medium mb-4">Spending Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
