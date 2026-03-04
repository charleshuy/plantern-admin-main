import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect to admin if already logged in
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Outlet />
    </div>
  )
}
