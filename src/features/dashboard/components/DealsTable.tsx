import { useEffect, useState } from "react";
import { statsService } from "../../../services/stats";

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("en-US", { month: "long" }),
);

export default function DealsTable() {
  const [month, setMonth] = useState(
    new Date().toLocaleString("en-US", { month: "long" }),
  );
  const [open, setOpen] = useState(false);
  const [deals, setDeals] = useState<Array<{
    tree: string;
    user: string;
    date: string;
    amount: string;
    status: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true);
        const recentDeals = await statsService.getRecentDeals(10);
        setDeals(recentDeals);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Deals Details</h3>

        <div className="relative w-40">
          <button
            onClick={() => setOpen(!open)}
            className="w-full text-sm border rounded-md px-3 py-1 bg-white flex justify-between items-center">
            {month}
          </button>

          {open && (
            <div className="absolute z-50 mt-0.5 w-full bg-white border rounded-md shadow-md max-h-24 overflow-y-auto">
              {months.map((m) => (
                <div
                  key={m}
                  onClick={() => {
                    setMonth(m);
                    setOpen(false);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <table className="w-full text-left">
        <thead className="bg-black text-[#BDFF66]">
          <tr>
            <th className="p-3">Tree Name</th>
            <th className="p-3">User</th>
            <th className="p-3">Date - Time</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-500">
                Loading deals...
              </td>
            </tr>
          ) : deals.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-500">
                No deals found
              </td>
            </tr>
          ) : (
            deals.map((deal, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{deal.tree}</td>
                <td className="p-3">{deal.user}</td>
                <td className="p-3">{deal.date}</td>
                <td className="p-3">{deal.amount}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {deal.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
