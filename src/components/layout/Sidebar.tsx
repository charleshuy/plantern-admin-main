import React from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  FileText,
  ListCheck,
  Box,
} from "lucide-react";
import Logo from "../../assets/LOGO-GREEN.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: Props) {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    {
      name: "Tree Management",
      icon: <Box size={20} />,
      path: "/admin/trees",
    },
    {
      name: "Plans Management",
      icon: <FileText size={20} />,
      path: "/admin/plans",
    },
    {
      name: "User Management",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      name: "Order Management",
      icon: <ListCheck size={20} />,
      path: "/admin/orders",
    },
  ];

  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div
      className={`relative bg-white h-full shadow-md transition-all duration-300
      ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* HEADER: Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-4">
        {!isCollapsed && (
          <span className="text-lime-500 font-bold text-xl hover:cursor-pointer">
            <img src={Logo} alt="Plantern Logo" className="h-6 w-auto" onClick={() => navigate("/admin")} />
          </span>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      {/* MENU */}
      <div className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
        ${
          isActive
            ? "bg-[#BDFF66] text-black font-medium"
            : "hover:bg-[#BDFF66]/40"
        }`
            }
          >
            {item.icon}
            {!isCollapsed && <span className="text-sm">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-0 w-full p-4 space-y-3">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition
     ${
       isActive
         ? "bg-[#BDFF66] text-black font-medium"
         : "hover:bg-[#BDFF66]/40"
     }`
          }
        >
          <Settings size={20} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-100 text-red-500 transition w-full text-left"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
