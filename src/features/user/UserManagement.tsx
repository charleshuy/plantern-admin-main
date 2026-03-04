import { Search, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/Pagination";
import UserFeedbackModal from "./UserFeedbackModal";
import { profilesService } from "../../services/profiles";
import type { UserWithStats } from "../../types/database";

const PAGE_SIZE = 9;

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        const debouncedSearch = search; // You might want to add debouncing
        const result = await profilesService.getWithStats(
          currentPage,
          PAGE_SIZE,
          debouncedSearch || undefined
        );
        setUsers(result.data);
        setTotalCount(result.count);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [currentPage, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await profilesService.delete(userId);
      // Refresh the list
      const result = await profilesService.getWithStats(
        currentPage,
        PAGE_SIZE,
        search || undefined
      );
      setUsers(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search users"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-full pl-9 pr-4 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black text-[#BDFF66] text-sm">
            <tr>
              <th className="p-4">IMAGE</th>
              <th>USERNAME</th>
              <th>SUBSCRIPTION</th>
              <th>STATUS</th>
              <th>BOUGHT TREE</th>
              <th>JOIN DATE</th>
              <th>FEEDBACK</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img 
                      src={user.avatar_url || "https://via.placeholder.com/32"} 
                      className="w-12 h-12 rounded-lg"
                      alt={user.display_name || "User"}
                    />
                  </td>
                  <td>{user.display_name || user.email || "Unknown"}</td>
                  <td>
                    <span
                      className={`inline-flex items-center justify-center w-30 h-7 text-xs rounded-md font-medium ${
                        {
                          Free: "bg-black text-white",
                          "Premium Monthly": "bg-green-200 text-green-800",
                          "Premium Annually": "bg-lime-400 text-black",
                        }[user.subscription || "Free"] || "bg-gray-200 text-gray-700"
                      }`}>
                      {user.subscription || "Free"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center justify-center w-24 h-7 text-xs rounded-md font-medium ${
                        user.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                      {user.status ? "active" : "suspended"}
                    </span>
                  </td>
                  <td>{user.bought_trees || 0}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    {(user.feedback_count || 0) > 0 && (
                      <span
                        onClick={() => setSelectedUser(user)}
                        className={`inline-flex items-center justify-center w-7 h-7 text-xs font-semibold rounded-md cursor-pointer hover:opacity-80 
                          transition-all duration-200 hover:scale-105 active:scale-95 ${
                            (user.feedback_count || 0) === 1
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600"
                          }`}>
                        {user.feedback_count}
                      </span>
                    )}
                  </td>
                  <td className="space-x-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95">
                      <SquarePen size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="px-2 py-1 border rounded hover:bg-red-200 transition-all duration-200 hover:scale-105 active:scale-95">
                      <Trash2 size={20} color="tomato" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {selectedUser && (
        <UserFeedbackModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
