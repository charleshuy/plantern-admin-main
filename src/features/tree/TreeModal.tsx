import { X } from "lucide-react";
import { useRef, useState } from "react";
import { plantsService } from "../../services/plants";
import type { PlantWithSales } from "../../types/database";

interface Props {
  onClose: () => void;
  tree?: PlantWithSales;
}

export default function TreeModal({ onClose, tree }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [name, setName] = useState(tree?.name || "");
  const [description, setDescription] = useState(tree?.description || "");
  const [price, setPrice] = useState(tree?.price || 0);
  const [isPremium, setIsPremium] = useState(tree?.is_premium || false);
  const [requiredLevel, setRequiredLevel] = useState(tree?.required_level || 1);
  const [modelUrl, setModelUrl] = useState(tree?.model_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(tree?.thumbnail_url || "");
  const [loading, setLoading] = useState(false);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!name || !modelUrl) {
      alert("Please fill in all required fields (Name and Model URL)");
      return;
    }

    try {
      setLoading(true);
      const plantData = {
        name,
        description: description || null,
        model_url: modelUrl,
        thumbnail_url: thumbnailUrl || null,
        price,
        is_premium: isPremium,
        required_level: requiredLevel,
        max_level: 3, // Default value
        water_needed_per_level: 60, // Default value
      };

      if (tree) {
        await plantsService.update(tree.id, plantData);
      } else {
        await plantsService.create(plantData);
      }

      onClose();
    } catch (error) {
      console.error("Error saving tree:", error);
      alert("Failed to save tree. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[800px] rounded-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-xl hover:text-red-500">
          <X size={32} />
        </button>

        <h2 className="text-2xl font-bold mb-8">{tree ? "Edit Tree" : "Add New Tree"}</h2>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-sm">Tree Name *</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="New Tree"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm">Description</label>
              <textarea
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="Tree description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm">Price (đ)</label>
              <input
                type="number"
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm">Required Level</label>
              <input
                type="number"
                className="w-full border rounded-lg px-4 py-2 mt-1"
                value={requiredLevel}
                onChange={(e) => setRequiredLevel(Number(e.target.value))}
                min={1}
              />
            </div>

            <div>
              <label className="text-sm">Model URL *</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="https://..."
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm">Thumbnail URL</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="https://..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                />
                <span className="text-sm">Premium Tree</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm">3D Model Upload</label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="
              mt-2 border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer
              hover:border-lime-400 hover:bg-lime-50 transition-all duration-200">
              {files ? (
                <div className="text-sm text-gray-600">
                  {files.length} file(s) selected
                </div>
              ) : (
                <>
                  <p className="text-gray-500">Drag folder here</p>
                  <p className="text-xs text-gray-400 mt-2">
                    or click to choose
                  </p>
                </>
              )}
            </div>

            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              webkitdirectory="true"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-10">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
            CANCEL
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-black text-[#BDFF66] rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "SAVING..." : (tree ? "UPDATE" : "ADD")}
          </button>
        </div>
      </div>
    </div>
  );
}
