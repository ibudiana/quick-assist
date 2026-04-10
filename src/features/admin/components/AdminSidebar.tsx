"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiMessageSquare, FiUsers, FiList, FiMail, FiSettings, FiMoon, FiSun, FiX } from "react-icons/fi";
import { AuthService } from "@/features/auth/services/auth.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "next-themes";

export function AdminSidebar({ isMobileOpen, closeMobile }: { isMobileOpen?: boolean; closeMobile?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const isSuperadmin = userProfile?.role === "superadmin";

  const handleLogout = async () => {
    try {
      await AuthService.logout(userProfile?.email); // Or pass userId here instead
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/admin/login");
    }
  };

  const navLinks = [
    { href: "/admin/chats", icon: FiMessageSquare, title: "Chats" },
    ...(isSuperadmin ? [
      { href: "/admin/team", icon: FiUsers, title: "Team Management" },
      { href: "/admin/audit", icon: FiList, title: "Audit Logs" },
      { href: "/admin/crm", icon: FiMail, title: "CRM & Promos" },
    ] : [])
  ];

  return (
    <>
    {/* Mobile Overlay */}
    {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMobile} />
    )}
    
    <div className={`w-16 bg-gray-900 flex flex-col items-center py-6 shrink-0 z-50 justify-between h-full fixed md:relative transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col items-center w-full relative">
        {/* Mobile close button */}
        <button onClick={closeMobile} className="absolute -right-10 top-2 p-2 bg-gray-900 text-white rounded-r-xl md:hidden">
            <FiX size={20} />
        </button>

        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mb-8 shadow-lg">
          Q
        </div>
        
        <div className="flex flex-col gap-4 w-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`w-full py-3 flex justify-center border-l-4 transition-all ${isActive ? 'border-blue-500 text-white bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-300'} `}
                title={link.title}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="pb-2 flex flex-col items-center gap-4 w-full">
        <button
           onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
           className="text-gray-400 hover:text-yellow-400 transition-colors p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl"
           title="Toggle Theme"
        >
           {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
        <Link 
          href="/admin/profile" 
          className={`w-full py-3 flex justify-center border-l-4 transition-all ${pathname === '/admin/profile' ? 'border-blue-500 text-white bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-300'} `}
          title="Profile Settings"
        >
          <FiSettings size={20} />
        </Link>
        <button 
          onClick={handleLogout} 
          className="text-gray-400 hover:text-red-400 transition-colors p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl" 
          title="Logout"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </div>
    </>
  );
}
