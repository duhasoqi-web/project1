import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookPlus,
  BookOpen,
  Search,
  BarChart3,
  Trash2,
  QrCode,
  Home,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { title: "الرئيسية", path: "/", icon: Home },
  { title: "إضافة كتاب جديد", path: "/add-book", icon: BookPlus },
  { title: "عرض وتحديث الكتب", path: "/books", icon: BookOpen },
  { title: "بحث عن كتاب", path: "/Search", icon: Search },
  { title: "التقارير", path: "/reports", icon: BarChart3 },
  { title: "إخراج كتاب", path: "/delete", icon: Trash2 },
  { title: "باركود", path: "/barcode", icon: QrCode },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    // Clear session
    onClose();
    navigate("/");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-0 right-0 z-50 h-full w-72 flex flex-col shadow-2xl"
          style={{ background: "var(--gradient-sidebar)" }}
          dir="rtl"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
            <h3 className="text-sidebar-primary font-bold text-lg">القائمة</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "sidebar-link-active"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
