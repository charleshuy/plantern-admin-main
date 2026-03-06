import { Trash2 } from "lucide-react";

interface SubscriptionCardProps {
  title: string;
  price: string;
  subscribers: number;
  features: string[];
  onEdit: () => void;
}

export default function SubscriptionCard({
  title,
  price,
  subscribers,
  features, onEdit
}: SubscriptionCardProps) {
  return (
    <div
      className="
      bg-white rounded-2xl p-8 
      w-80 border border-gray-200
      transition-all duration-300
      hover:border-lime-400 hover:shadow-lg hover:scale-[1.02]
      relative flex flex-col
    ">
      <div className="flex-1">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">Monthly Charge</p>
          <h2 className="text-3xl font-bold mt-1">{price}</h2>
          <p className="text-sm text-gray-600 mt-2">
            {subscribers} subscribers
          </p>
        </div>

        <div className="my-6 border-t"></div>

        {/* Features */}
        <ul className="space-y-3 text-sm text-gray-600 text-center">
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
      {/* Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          className="
          bg-black text-lime-400 
          px-5 py-2 rounded-full
          transition-all duration-200
          hover:scale-105 active:scale-95"
          onClick={onEdit}
          >
          Edit
        </button>

        <button
          className="
          border border-gray-400
          px-5 py-2 rounded-full
          hover:bg-gray-100
          transition
        ">
          Disable
        </button>

        <button
          className="
          bg-red-500 text-white
          p-3 rounded-full
          hover:scale-110
          transition
        ">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
