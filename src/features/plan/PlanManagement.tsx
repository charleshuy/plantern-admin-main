import { useState } from "react";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionModal from "./SubscriptionModal";

export default function PlanManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subcription Management</h1>
      </div>

      <div className="flex gap-8 justify-center">
        <SubscriptionCard
          title="Basic"
          price="FREE"
          subscribers={1253}
          features={[
            "Basic Pomodoro Timer",
            "Advanced Timer Settings",
            "Limited Statistics",
          ]}
          onEdit={() => setIsModalOpen(true)}
        />

        <SubscriptionCard
          title="Premium"
          price="49.000 Đ"
          subscribers={192}
          features={[
            "Premium AR Trees",
            "Detailed Analytics",
            "Premium Badge",
            "Faster Tree Growth",
            "Priority Support",
            "Premium VIP Badge",
          ]}
          onEdit={() => setIsModalOpen(true)}
        />

        <SubscriptionCard
          title="Yearly Premium"
          price="45.000 Đ"
          subscribers={52}
          features={[
            "Premium AR Trees",
            "Advanced Timer Settings",
            "Detailed Analytics",
            "Premium Badge",
            "Faster Tree Growth",
            "Priority Support",
            "Premium VIP Badge",
            "Extreme Rare Tree (1 Year Subscription only)",
          ]}
          onEdit={() => setIsModalOpen(true)}
        />

        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
