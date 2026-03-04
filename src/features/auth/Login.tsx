import React, { useState } from "react";
import loginImg from "../../assets/LoginImg.png";
import logo from "../../assets/LOGO.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await signIn(email, password);
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate("/admin");
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Failed to login. Please check your credentials.");
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* LEFT IMAGE */}
      <div className="w-1/2 h-full">
        <img
          src={loginImg}
          alt="Plant background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT FORM */}
      <div className="w-1/2 bg-[#2E7D4F] flex items-center justify-center">
        <div className="w-[380px]">
          {/* LOGO + TITLE */}
          <form onSubmit={handleLogin} className="w-[380px]">
            <div className="mb-10">
              <img src={logo} alt="Plantern Logo" className="h-12 mb-4" />
              <p className="text-white text-lg opacity-80">Admin login</p>
            </div>

            {/* FORM */}
            <div className="space-y-5">
              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-700 outline-none"
                required
              />

              {/* Password */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-700 outline-none"
                required
              />

              {/* Remember */}
              <div className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" className="accent-lime-400" />
                <span>Remember password</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-lime-400 hover:bg-lime-300 transition py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
