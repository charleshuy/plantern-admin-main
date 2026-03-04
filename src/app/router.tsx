import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../features/auth/Login";
import Dashboard from "../features/dashboard/Dashboard";
import TreeManagement from "../features/tree/TreeManagement";
import PlanManagement from "../features/plan/PlanManagement";
import UserManagement from "../features/user/UserManagement";
import OrderManagement from "../features/order/OrderManagement";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to={"/admin"} replace />
    },
    {
        element: <AuthLayout />,
        children: [
            {path: "/login", element: <Login />},
        ]
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                    {index: true, element: <Dashboard />},
                    {path: "trees", element: <TreeManagement />},
                    {path: "plans", element: <PlanManagement />},
                    {path: "users", element: <UserManagement />},
                    {path: "orders", element: <OrderManagement />}
                ]
            }
        ]
    }
])