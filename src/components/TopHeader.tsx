import Logo from "./assest/Logo.jpeg"
import { Menu } from "lucide-react";

interface TopHeaderProps {
  onToggleSidebar: () => void;
}


export function TopHeader({ onToggleSidebar }: TopHeaderProps) {

  return (
    <header className="h-20 border-b border-border bg-card shadow-gov-soft sticky top-0 z-50">
      <div className="h-full flex items-center justify-between px-4 md:px-8">
    
        <div className="flex-1 text-left hidden sm:block">
          <h2 className="text-sm md:text-base font-bold text-primary-dark tracking-wide">
            Tulkarm Municipality
          </h2>
          <p className="text-xs text-muted-foreground">Public Library</p>
        </div>

      
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-muted transition-colors duration-200 ml-2 sm:ml-0 lg:mr-4"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6 text-primary" />
        </button>

    
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="شعار مكتبة بلدية طولكرم"
            className="w-14 h-14 rounded-full border-2 border-primary/20 shadow-gov-soft object-contain bg-card"
          />
        </div>

     
        <div className="flex-1 text-right hidden sm:block">
          <h2 className="text-sm md:text-base font-bold text-primary-dark">
            بلدية طولكرم
          </h2>
          <p className="text-xs text-muted-foreground">المكتبة العامة</p>
        </div>

      </div>
    
    </header>
    
  );
}
