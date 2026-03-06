import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  "Premium AR Trees",
  "Advanced Timer Settings",
  "Detailed Analytics",
  "Premium Badge",
  "Faster Tree Growth",
  "Priority Support",
  "Premium Vip Badge",
  "Extreme Rare Tree (1 Year Subscription only)",
];

export default function SubscriptionModal({ isOpen, onClose }: ModalProps) {
  // Close when press ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative bg-white w-[800px] rounded-2xl p-10 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-black">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-8">Edit plan</h2>

        <div className="grid grid-cols-2 gap-12">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-500">Plan Name</label>
              <input
                type="text"
                defaultValue="Premium"
                className="w-full mt-2 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-lime-400 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Price</label>
              <input
                type="text"
                defaultValue="49.000"
                className="w-full mt-2 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-lime-400 outline-none"
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4">
            {features.map((feature, i) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{feature}</span>

                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={i !== 1 && i !== 7}
                    className="sr-only peer"
                  />
                  <div
                    className="
                    w-11 h-6 
                    bg-gray-300 
                    rounded-full 
                    peer 
                    peer-checked:bg-lime-400
                    after:content-['']
                    after:absolute
                    after:top-[2px] after:left-[2px]
                    after:bg-white
                    after:border
                    after:rounded-full
                    after:h-5 after:w-5
                    after:transition-all
                    peer-checked:after:translate-x-5
                  "></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-6 mt-12">
          <button
            onClick={onClose}
            className="px-8 py-2 border rounded-lg hover:bg-gray-100 transition">
            CANCEL
          </button>

          <button
            className="
            px-8 py-2 
            bg-black text-lime-400 
            rounded-lg
            transition-all duration-200
            hover:scale-105 active:scale-95
          ">
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
