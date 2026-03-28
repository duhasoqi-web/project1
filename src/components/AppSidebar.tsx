import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookPlus, BookOpen, BarChart3, Trash2, QrCode, Home, LogOut, X,} from "lucide-react";

const navItems = [
  { title: "الرئيسية", path: "/Dashbord", icon: Home },
  { title: "إضافة كتاب جديد", path: "/add-book", icon: BookPlus },
  { title: "عرض وتحديث الكتب", path: "/update-books", icon: BookOpen },
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

  return (
    <motion.aside
      initial={{ x: 300 }}
      animate={{ x: isOpen ? 0 : 300 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className="fixed right-0 top-0 h-screen w-72 flex flex-col z-50 backdrop-blur-lg bg-gradient-to-br from-slate-900/80 to-slate-800/70 shadow-2xl rounded-l-3xl overflow-hidden hover:translate-x-1 hover:shadow-[0_0_12px_rgba(59,130,246,0.6)] hover:text-white"
      dir="rtl"
    >
    
      <div className="flex items-center justify-between p-5 border-b border-white/20">
        <h3 className="text-white font-extrabold text-lg tracking-wide uppercase">
          القائمة
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/20 transition-all duration-300"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

  
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
        <p className="text-xs text-gray-400 px-3 mb-3 uppercase tracking-wider">
          القائمة الرئيسية
        </p>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              onClick={() => handleNav(item.path)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg before:absolute before:top-0 before:right-0 before:h-full before:w-1 before:rounded-l-lg before:bg-blue-400/80"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon
                className={`w-6 h-6 flex-shrink-0 transition-all duration-300 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                }`}
              />
              <span className="relative z-10">{item.title}</span>
              {isActive && (
                <motion.div
                  layoutId="highlight"
                  className="absolute inset-0 rounded-2xl bg-white/10 shadow-inner"
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>


      <div className="p-4 border-t border-white/20">
        <motion.button
          onClick={() => {
            onClose();
            navigate("/");
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/20 shadow-md transition-all duration-300"
        >
          <LogOut className="w-6 h-6 animate-pulse" />
          <span>تسجيل الخروج</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}