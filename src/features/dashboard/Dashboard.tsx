import { Box, Clock, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "./components/StatCard";
import RevenueChart from "./components/RevenueChart";
import DealsTable from "./components/DealsTable";
import { statsService } from "../../services/stats";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: { value: 0, change: "", isPositive: true },
    totalPremium: { value: 0, change: "", isPositive: true },
    totalTreeSales: { value: 0, change: "", isPositive: true },
    totalNewUsers: { value: 0, change: "", isPositive: true },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const dashboardStats = await statsService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total User"
          value={stats.totalUsers.value}
          change={stats.totalUsers.change}
          isPositive={stats.totalUsers.isPositive}
          icon={<Users />}
        />
        <StatCard
          title="Total Premium Upgrade"
          value={stats.totalPremium.value}
          change={stats.totalPremium.change}
          isPositive={stats.totalPremium.isPositive}
          icon={<Box />}
        />
        <StatCard
          title="Total Tree Sales"
          value={stats.totalTreeSales.value}
          prefix=""
          suffix=" đ"
          change={stats.totalTreeSales.change}
          isPositive={stats.totalTreeSales.isPositive}
          icon={<TrendingUp />}
        />
        <StatCard
          title="Total New User"
          value={stats.totalNewUsers.value}
          change={stats.totalNewUsers.change}
          isPositive={stats.totalNewUsers.isPositive}
          icon={<Clock />}
        />
      </div>

      <RevenueChart />
      <DealsTable />
    </div>
  );
}
