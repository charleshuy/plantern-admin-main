import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { transactionsService } from "../../services/transactions";
import type { TransactionWithUser } from "../../types/database";

const PAGE_SIZE = 9;

export default function OrderManagement() {
  const [dateFilter, setDateFilter] = useState<"week" | "month" | "year" | "all">("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortNewest, setSortNewest] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<TransactionWithUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const result = await transactionsService.getAll(
          currentPage,
          PAGE_SIZE,
          {
            dateFilter,
            type: selectedTypes.length > 0 ? selectedTypes : undefined,
            status: selectedStatus.length > 0 ? selectedStatus : undefined,
          },
          sortNewest
        );
        setOrders(result.data);
        setTotalCount(result.count);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentPage, dateFilter, selectedTypes, selectedStatus, sortNewest]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Map transaction to order display format
  const getOrderType = (productId: string | null) => {
    if (!productId) return "Unknown";
    if (productId.includes("premium_monthly")) return "Premium Monthly";
    if (productId.includes("premium_annually")) return "Premium Annually";
    if (productId.includes("plant")) return "Premium Tree";
    return "Premium Tree";
  };

  const getOrderStatus = (transaction: TransactionWithUser) => {
    // Transactions are typically completed, but you might have status logic
    return "Completed";
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
      </div>

      {/* Filter and Sorting */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200/70 inline-flex items-center text-sm shadow-sm">
        <div className="px-4 py-3 border-r bg-gray-50">
          <Filter size={16} />
        </div>
        <div className="px-4 py-3 border-r text-gray-500">Filter By</div>

        {/* FILTER DATE */}
        <div className="relative border-r">
          <button
            onClick={() => setOpen(open === "date" ? null : "date")}
            className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50">
            Date <ChevronDown size={14} />
          </button>

          {open === "date" && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border rounded-lg shadow-lg z-50">
              {[
                { label: "Last week", value: "week" },
                { label: "Last month", value: "month" },
                { label: "Last year", value: "year" },
              ].map((item) => (
                <div
                  key={item.value}
                  onClick={() => {
                    setDateFilter(item.value);
                    setCurrentPage(1);
                    setOpen(null);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FILTER ORDER TYPE */}
        <div className="relative border-r">
          <button
            onClick={() => setOpen(open === "type" ? null : "type")}
            className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50">
            Order Type <ChevronDown size={14} />
          </button>

          {open === "type" && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-lg shadow-lg z-50 p-3 space-y-2">
              {["Premium Monthly", "Premium Annually", "Premium Tree"].map(
                (item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(item)}
                      onChange={() => {
                        setSelectedTypes((prev) =>
                          prev.includes(item)
                            ? prev.filter((t) => t !== item)
                            : [...prev, item],
                        );
                        setCurrentPage(1);
                      }}
                    />
                    {item}
                  </label>
                ),
              )}
            </div>
          )}
        </div>

        {/* FILTER ORDER STATUS - Removed as transactions don't have status field */}

        {/* SORT */}
        <button
          onClick={() => setSortNewest(!sortNewest)}
          className="px-4 py-3 border-r hover:bg-gray-50">
          Sort by Date {sortNewest ? "↓" : "↑"}
        </button>

        {/* RESET */}
        <button
          onClick={() => {
            setDateFilter("all");
            setSelectedTypes([]);
            setSelectedStatus([]);
            setSortNewest(true);
            setCurrentPage(1);
          }}
          className="px-4 py-3 text-red-500 flex items-center gap-2 hover:bg-red-50">
          <RotateCcw size={14} />
          Reset Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black text-[#BDFF66] text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th>NAME</th>
              <th>ADDRESS</th>
              <th>DATE</th>
              <th>TYPE</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderType = getOrderType(order.product_id);
                const orderStatus = getOrderStatus(order);
                const userName = (order.user as any)?.display_name || (order.user as any)?.email || "Unknown";
                
                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{String(order.id).padStart(5, "0")}</td>
                    <td>{userName}</td>
                    <td>-</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{orderType}</td>
                    <td>
                      <span
                        className={`inline-flex items-center justify-center w-24 h-7 text-xs rounded-md font-medium ${
                          orderStatus === "Completed"
                            ? "bg-black text-lime-400"
                            : orderStatus === "Processing"
                              ? "bg-purple-200 text-purple-700"
                              : "bg-red-200 text-red-600"
                        }`}>
                        {orderStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer and Pagination */}
      <div className="flex justify-between items-center p-4 text-sm">
        <span>
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, totalCount)} of{" "}
          {totalCount}
        </span>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
