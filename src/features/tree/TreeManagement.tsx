import { Search, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import TreeModal from "./TreeModal";
import { plantsService } from "../../services/plants";
import type { PlantWithSales } from "../../types/database";

const PAGE_SIZE = 9;

export default function TreeManagement() {
  const [trees, setTrees] = useState<PlantWithSales[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTree, setEditingTree] = useState<PlantWithSales | null>(null);

  useEffect(() => {
    async function fetchTrees() {
      try {
        setLoading(true);
        setError(null);
        const debouncedSearch = search; // You might want to add debouncing
        const result = await plantsService.getWithSales(
          currentPage,
          PAGE_SIZE,
          debouncedSearch || undefined
        );
        setTrees(result.data);
        setTotalCount(result.count);
      } catch (err) {
        console.error("Error fetching trees:", err);
        setError("Failed to load trees. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrees();
  }, [currentPage, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleDelete = async (treeId: number) => {
    if (!confirm("Are you sure you want to delete this tree?")) return;
    
    try {
      await plantsService.delete(treeId);
      // Refresh the list
      const result = await plantsService.getWithSales(
        currentPage,
        PAGE_SIZE,
        search || undefined
      );
      setTrees(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error("Error deleting tree:", err);
      alert("Failed to delete tree. Please try again.");
    }
  };

  const handleEdit = (tree: PlantWithSales) => {
    setEditingTree(tree);
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setEditingTree(null);
    // Refresh the list
    plantsService.getWithSales(currentPage, PAGE_SIZE, search || undefined)
      .then(result => {
        setTrees(result.data);
        setTotalCount(result.count);
      });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tree Management</h1>

        <div className="flex gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search tree"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-full pl-9 pr-4 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-black text-[#BDFF66] px-5 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 active:scale-95">
            ADD TREE
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black text-[#BDFF66] text-sm">
            <tr>
              <th className="p-4">IMAGE</th>
              <th>TREE NAME</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>SALES</th>
              <th>UPLOAD DATE</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Loading trees...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : trees.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No trees found
                </td>
              </tr>
            ) : (
              trees.map((tree) => (
                <tr key={tree.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img 
                      src={tree.thumbnail_url || "https://via.placeholder.com/32"} 
                      className="w-12 h-12 rounded-lg"
                      alt={tree.name}
                    />
                  </td>
                  <td>{tree.name}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      tree.is_premium ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {tree.is_premium ? "Premium" : "Basic"}
                    </span>
                  </td>
                  <td>{tree.price.toLocaleString('vi-VN')} đ</td>
                  <td>{tree.sales || 0}</td>
                  <td>{new Date(tree.created_at).toLocaleDateString()}</td>
                  <td className="space-x-2">
                    <button 
                      onClick={() => handleEdit(tree)}
                      className="px-2 py-1 border rounded hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95">
                      <SquarePen size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(tree.id)}
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

      {/* Modal Add tree or Update tree */}
      {isOpen && <TreeModal onClose={handleModalClose} tree={editingTree || undefined} />}
    </div>
  );
}
