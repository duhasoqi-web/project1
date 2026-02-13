import { Link } from "react-router-dom";
import {
  BookPlus,
  BookOpen,
  Search,
  FileText,
  Trash2,
  Barcode,
} from "lucide-react";

const sections = [
  {
    label: "إضافة كتاب جديد",
    description: "أضف كتاباً جديداً إلى قاعدة بيانات المكتبة",
    icon: BookPlus,
    path: "/add-book",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "عرض وتحديث الكتب",
    description: "استعرض جميع الكتب وعدّل بياناتها",
    icon: BookOpen,
    path: "/books",
    color: "bg-accent/10 text-accent",
  },
  {
    label: "بحث عن كتاب",
    description: "ابحث في المكتبة حسب العنوان أو المؤلف أو التصنيف",
    icon: Search,
    path: "/search",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "التقارير",
    description: "تقارير إحصائية عن الكتب والمؤلفين والتصنيفات",
    icon: FileText,
    path: "/reports",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    label: "حذف كتاب",
    description: "حذف كتاب من قاعدة البيانات",
    icon: Trash2,
    path: "/delete",
    color: "bg-destructive/10 text-destructive",
  },
  {
    label: "باركود",
    description: "إنشاء وطباعة باركود للكتب",
    icon: Barcode,
    path: "/barcode",
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">لوحة التحكم</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          مرحباً بك في نظام إدارة مكتبة البلدية
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.path}
              to={section.path}
              className="group wizard-shadow rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${section.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {section.label}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
