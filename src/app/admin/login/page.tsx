"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail } from "react-icons/fi";
import { AuthService } from "@/features/auth/services/auth.service";
import { set } from "firebase/database";

export default function AdminLogin() {
  const DEMO_EMAIL = "superadmin@demo.com";
  const DEMO_PASSWORD = "password123";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleUseDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  const handleCopyDemoCredentials = async () => {
    const text = `Superadmin: ${DEMO_EMAIL} | Password: ${DEMO_PASSWORD}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Failed to copy credentials. Please copy manually.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthService.login(email, password);
      router.push("/admin");
    } catch (err: unknown) {
      // setError("Failed to login. Please check your credentials.");
      setError(
        "Failed to login. " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthService.register(email, password, "customer");
      router.push("/admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError("Failed to register. " + message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 text-sm mt-2">
              Sign in or Register to your account
            </p>
          </div>

          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-900">Demo Account</p>
            <p className="mt-1 text-xs text-blue-800 break-all">
              Superadmin: {DEMO_EMAIL} | Password: {DEMO_PASSWORD}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleUseDemoCredentials}
                className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200 hover:bg-blue-100"
              >
                Use Demo
              </button>
              <button
                type="button"
                onClick={handleCopyDemoCredentials}
                className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                {copied ? "Copied" : "Copy Credentials"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? "..." : "Sign In"}
              </button>
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Create a new account with these credentials"
              >
                {loading ? "..." : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            For demo purposes, you can create a new account directly here using
            Register.
          </div>
        </div>
      </div>
    </div>
  );
}
