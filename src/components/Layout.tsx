import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TopHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
