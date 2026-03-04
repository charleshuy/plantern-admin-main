import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500 mr-5">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-200">
          <ChevronLeft />
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-200">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
