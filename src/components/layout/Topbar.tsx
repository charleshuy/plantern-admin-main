import { Bell, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Topbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const displayName = user?.profile?.display_name || user?.email || 'Admin';
  const avatarUrl = user?.profile?.avatar_url || 'https://i.pravatar.cc/40';

  return (
    <div className="h-16 bg-white shadow-sm flex items-center justify-end px-6">
      <div className="flex items-center gap-6">
        <Bell size={20} />

        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full"
            />
            <div className="text-sm">
              <p className="font-medium">{displayName}</p>
              <p className="text-gray-400 text-xs">Admin</p>
            </div>
          </div>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
