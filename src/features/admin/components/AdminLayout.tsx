"use client";

import { useState, ReactNode, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { ModalProvider } from "@/features/core/components/ModalProvider";
import { usePathname, useRouter } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && pathname !== "/admin/login") {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      if (
        !userProfile ||
        !["agent", "admin", "superadmin"].includes(userProfile.role)
      ) {
        router.push("/"); // atau halaman customer
      }
    }
  }, [user, userProfile, loading, pathname, router]);

  // Global loading state while checking Firebase Auth
  if (loading && pathname !== "/admin/login") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prevent flashing of admin layout before redirect completes
  if (
    pathname !== "/admin/login" &&
    (!user ||
      !userProfile ||
      !["agent", "admin", "superadmin"].includes(userProfile.role))
  ) {
    return null;
  }

  if (pathname === "/admin/login") {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <ModalProvider>{children}</ModalProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
            Q
          </div>
          Quick Assist Admin
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-600"
        >
          <FiMenu size={20} />
        </button>
      </div>

      <AdminSidebar
        isMobileOpen={isSidebarOpen}
        closeMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-h-0 overflow-hidden">
        <ModalProvider>{children}</ModalProvider>
      </div>
    </div>
  );
}
