import { X } from "lucide-react";
import { useState } from "react";
import { profilesService } from "../../services/profiles";
import type { UserWithStats } from "../../types/database";

interface Props {
  onClose: () => void;
  user?: UserWithStats;
  onSuccess: () => void;
}

export default function UserModal({ onClose, user, onSuccess }: Props) {
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [isPremium, setIsPremium] = useState(user?.is_premium || false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState(
    user?.premium_expires_at ? new Date(user.premium_expires_at).toISOString().split('T')[0] : ""
  );
  const [waterBalance, setWaterBalance] = useState(user?.water_balance || 0);
  const [currentLevel, setCurrentLevel] = useState(user?.current_level || 1);
  const [currentXp, setCurrentXp] = useState(user?.current_xp || 0);
  const [gold, setGold] = useState(user?.gold || 0);
  const [isAdmin, setIsAdmin] = useState(user?.is_admin || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!displayName && !email) {
      alert("Please enter at least a display name or email");
      return;
    }

    try {
      setLoading(true);
      const updates = {
        display_name: displayName || null,
        email: email || null,
        avatar_url: avatarUrl || null,
        is_premium: isPremium,
        premium_expires_at: premiumExpiresAt ? new Date(premiumExpiresAt).toISOString() : null,
        water_balance: waterBalance,
        current_level: currentLevel,
        current_xp: currentXp,
        gold: gold,
        is_admin: isAdmin,
      };

      if (user) {
        // Update existing user
        await profilesService.update(user.id, updates);
      } else {
        // Note: Creating new users requires creating auth.users first
        // This would need Supabase Admin API
        alert("Creating new users requires admin API access. Please create users through Supabase Dashboard.");
        return;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert(error.message || "Failed to save user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[800px] rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-xl hover:text-red-500">
          <X size={32} />
        </button>

        <h2 className="text-2xl font-bold mb-8">
          {user ? "Edit User" : "Add New User"}
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!user} // Can't change email for existing users
              />
            </div>

            <div>
              <label className="text-sm font-medium">Avatar URL</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Water Balance</label>
              <input
                type="number"
                className="w-full border rounded-lg px-4 py-2 mt-1"
                value={waterBalance}
                onChange={(e) => setWaterBalance(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Current Level</label>
              <input
                type="number"
                className="w-full border rounded-lg px-4 py-2 mt-1"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current XP</label>
              <input
                type="number"
                className="w-full border rounded-lg px-4 py-2 mt-1"
                value={currentXp}
                onChange={(e) => setCurrentXp(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Gold</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg px-4 py-2 mt-1"
                value={gold}
                onChange={(e) => setGold(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                />
                <span className="text-sm font-medium">Premium User</span>
              </label>
            </div>

            {isPremium && (
              <div>
                <label className="text-sm font-medium">Premium Expires At</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                  value={premiumExpiresAt}
                  onChange={(e) => setPremiumExpiresAt(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <span className="text-sm font-medium">Admin User</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
            CANCEL
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-black text-[#BDFF66] rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "SAVING..." : (user ? "UPDATE" : "ADD")}
          </button>
        </div>
      </div>
    </div>
  );
}
