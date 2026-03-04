import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: string;
  isPositive?: boolean;
  icon: ReactNode;
}
export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  change,
  isPositive = true,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-[#BDFF66] rounded-2xl p-5 flex justify-between items-start shadow-sm">
      <div>
        <p className="text-sm text-gray-700">{title}</p>
        <h2 className="text-2xl font-bold mt-2">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </h2>

        <p
          className={`text-sm mt-2 ${
            isPositive ? "text-green-700" : "text-red-600"
          }`}
        >
          {isPositive ? <TrendingUp size={14} color="green" /> : <TrendingDown size={10} color="red" /> }{change}
        </p>
      </div>

      <div className="bg-black/10 p-3 rounded-xl">{icon}</div>
    </div>
  );
}
