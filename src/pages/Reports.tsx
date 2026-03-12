import { useState } from "react";
import { BarChart3 } from "lucide-react";

const stats = [
  { label: "إجمالي الكتب", value: "1,284", emoji: "📚", gradient: "from-primary-dark to-primary-light", sub: "📊 آخر تحديث: الآن" },
  { label: "الكتب المُعارة", value: "156", emoji: "📖", gradient: "from-accent to-primary", sub: "📊 آخر تحديث: الآن" },
  { label: "كتب جديدة", value: "42", emoji: "✨", gradient: "from-success to-emerald-400", sub: "📊 هذا الشهر" },
  { label: "المراجع المتاحة", value: "328", emoji: "📋", gradient: "from-primary-dark to-primary-light", sub: "📊 آخر تحديث: الآن" },
];

type ReportTab = "classification" | "supply" | "itemType" | "entryDate" | "discarded";

const reportTabs: { key: ReportTab; label: string }[] = [
  { key: "classification", label: "حسب التصنيف" },
  { key: "supply", label: "حسب التزويد" },
  { key: "itemType", label: "حسب نوع المادة" },
  { key: "entryDate", label: "تاريخ الإدخال" },
  { key: "discarded", label: "الكتب المخرجة" },
];

const classificationData = [
  { serial: 1001, title: "مقدمة في البرمجة", author: "أحمد علي", classification: 100, material: "كتاب ورقي", status: "متاح" },
  { serial: 1002, title: "قواعد البيانات", author: "سارة محمود", classification: 200, material: "كتاب إلكتروني", status: "معار" },
  { serial: 1003, title: "هندسة البرمجيات", author: "محمد حسن", classification: 300, material: "كتاب ورقي", status: "متاح" },
  { serial: 1004, title: "مقدمة في البرمجة", author: "أحمد علي", classification: 400, material: "كتاب ورقي", status: "متاح" },
  { serial: 1005, title: "قواعد البيانات", author: "سارة محمود", classification: 500, material: "كتاب إلكتروني", status: "معار" },
  { serial: 1006, title: "هندسة البرمجيات", author: "محمد حسن", classification: 600, material: "كتاب ورقي", status: "متاح" },
  { serial: 1007, title: "مقدمة في البرمجة", author: "أحمد علي", classification: 700, material: "كتاب ورقي", status: "متاح" },
  { serial: 1008, title: "قواعد البيانات", author: "سارة محمود", classification: 800, material: "كتاب إلكتروني", status: "معار" },
];

const supplyData = [
  { serial: 1001, title: "مقدمة في البرمجة", author: "أحمد علي", classification: 133, supplier: "دار الفكر العربي", method: "شراء مباشر", entryDate: "2023-04-10", status: "متاح" },
  { serial: 1002, title: "قواعد البيانات المتقدمة", author: "سارة محمود", classification: 5.74, supplier: "مكتبة النهضة", method: "تبرع", entryDate: "2022-12-01", status: "معار" },
  { serial: 1003, title: "هندسة البرمجيات الحديثة", author: "محمد حسن", classification: 5.1, supplier: "دار التقدم", method: "شراء إلكتروني", entryDate: "2023-01-22", status: "محجوز" },
  { serial: 1004, title: "مفاهيم الشبكات", author: "ليلى خالد", classification: 4.6, supplier: "دار الكتب الوطنية", method: "شراء مباشر", entryDate: "2023-08-05", status: "مخرج" },
];

const itemTypeData = [
  { serial: 1001, title: "مقدمة في البرمجة", author: "أحمد علي", classification: 5.133, material: "كتاب ورقي", status: "متاح" },
  { serial: 1002, title: "قواعد البيانات", author: "سارة محمود", classification: 5.74, material: "كتاب إلكتروني", status: "معار" },
  { serial: 1003, title: "هندسة البرمجيات", author: "محمد حسن", classification: 5.1, material: "كتاب ورقي", status: "متاح" },
];

const entryDateData = [
  { serial: 1001, title: "مقدمة في البرمجة", author: "أحمد علي", entryDate: "2023-08-01", classification: 5.133, material: "كتاب ورقي", status: "متاح" },
  { serial: 1002, title: "قواعد البيانات", author: "سارة محمود", entryDate: "2023-08-02", classification: 5.74, material: "كتاب إلكتروني", status: "معار" },
  { serial: 1003, title: "هندسة البرمجيات", author: "محمد حسن", entryDate: "2023-08-03", classification: 5.1, material: "كتاب ورقي", status: "متاح" },
];

const discardedData = [
  { serial: 1001, title: "مقدمة في البرمجة", author: "أحمد علي", classification: 5.133, status: "مخرج" },
  { serial: 1002, title: "قواعد البيانات", author: "سارة محمود", classification: 5.74, status: "مخرج" },
  { serial: 1003, title: "هندسة البرمجيات", author: "محمد حسن", classification: 5.1, status: "مخرج" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const cls = status === "متاح" ? "bg-success/15 text-success" :
    (status === "معار" || status === "محجوز") ? "bg-warning/15 text-warning" :
    status === "مخرج" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground";
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{status}</span>;
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>("classification");

  return (
    <div dir="rtl">
      <div className="mb-5">
        <h1 className="page-title flex items-center gap-3">
          📈 لوحة التقارير
        </h1>
        <p className="text-muted-foreground text-lg">إدارة وعرض تقارير المكتبة الشاملة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-5 text-primary-foreground bg-gradient-to-br ${stat.gradient} shadow-gov-large`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h6 className="text-sm opacity-80">{stat.label}</h6>
                <h2 className="text-3xl font-extrabold">{stat.value}</h2>
              </div>
              <span className="text-4xl opacity-80">{stat.emoji}</span>
            </div>
            <small className="text-xs opacity-70">{stat.sub}</small>
          </div>
        ))}
      </div>

      {/* Report Filter */}
      <div className="gov-card mb-6">
        <div className="gov-card-header">🎯 خيارات التقرير</div>
        <div className="gov-card-body">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {reportTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "gradient-primary text-primary-foreground shadow-gov-soft"
                    : "bg-surface-alt text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="btn-gov-primary px-4 py-2 text-sm">تصدير CSV</button>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground transition-all" style={{ background: "linear-gradient(135deg, hsl(142, 70%, 45%), hsl(155, 70%, 55%))" }}>طباعة</button>
          </div>

          {/* Tables */}
          <div className="overflow-x-auto border border-border rounded-xl">
            {activeTab === "classification" && (
              <table className="w-full text-sm">
                <thead><tr className="bg-primary/5 border-b border-border">
                  <th className="px-4 py-3 text-right font-bold">رقم التسلسل</th>
                  <th className="px-4 py-3 text-right font-bold">عنوان الكتاب</th>
                  <th className="px-4 py-3 text-right font-bold">المؤلفون</th>
                  <th className="px-4 py-3 text-right font-bold">رقم التصنيف</th>
                  <th className="px-4 py-3 text-right font-bold">نوع المادة</th>
                  <th className="px-4 py-3 text-right font-bold">حالة الكتاب</th>
                </tr></thead>
                <tbody>{classificationData.map(r => (
                  <tr key={r.serial} className="border-b border-border/50 hover:bg-muted/50"><td className="px-4 py-3">{r.serial}</td><td className="px-4 py-3">{r.title}</td><td className="px-4 py-3">{r.author}</td><td className="px-4 py-3">{r.classification}</td><td className="px-4 py-3">{r.material}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td></tr>
                ))}</tbody>
              </table>
            )}

            {activeTab === "supply" && (
              <table className="w-full text-sm">
                <thead><tr className="bg-primary/5 border-b border-border">
                  <th className="px-4 py-3 text-right font-bold">رقم التسلسل</th>
                  <th className="px-4 py-3 text-right font-bold">عنوان الكتاب</th>
                  <th className="px-4 py-3 text-right font-bold">المؤلفون</th>
                  <th className="px-4 py-3 text-right font-bold">رقم التصنيف</th>
                  <th className="px-4 py-3 text-right font-bold">اسم المزود</th>
                  <th className="px-4 py-3 text-right font-bold">طريقة التزويد</th>
                  <th className="px-4 py-3 text-right font-bold">تاريخ الإدخال</th>
                  <th className="px-4 py-3 text-right font-bold">حالة الكتاب</th>
                </tr></thead>
                <tbody>{supplyData.map(r => (
                  <tr key={r.serial} className="border-b border-border/50 hover:bg-muted/50"><td className="px-4 py-3">{r.serial}</td><td className="px-4 py-3">{r.title}</td><td className="px-4 py-3">{r.author}</td><td className="px-4 py-3">{r.classification}</td><td className="px-4 py-3">{r.supplier}</td><td className="px-4 py-3">{r.method}</td><td className="px-4 py-3">{r.entryDate}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td></tr>
                ))}</tbody>
              </table>
            )}

            {activeTab === "itemType" && (
              <table className="w-full text-sm">
                <thead><tr className="bg-primary/5 border-b border-border">
                  <th className="px-4 py-3 text-right font-bold">رقم التسلسل</th>
                  <th className="px-4 py-3 text-right font-bold">عنوان الكتاب</th>
                  <th className="px-4 py-3 text-right font-bold">المؤلفون</th>
                  <th className="px-4 py-3 text-right font-bold">رقم التصنيف</th>
                  <th className="px-4 py-3 text-right font-bold">نوع المادة</th>
                  <th className="px-4 py-3 text-right font-bold">حالة الكتاب</th>
                </tr></thead>
                <tbody>{itemTypeData.map(r => (
                  <tr key={r.serial} className="border-b border-border/50 hover:bg-muted/50"><td className="px-4 py-3">{r.serial}</td><td className="px-4 py-3">{r.title}</td><td className="px-4 py-3">{r.author}</td><td className="px-4 py-3">{r.classification}</td><td className="px-4 py-3">{r.material}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td></tr>
                ))}</tbody>
              </table>
            )}

            {activeTab === "entryDate" && (
              <table className="w-full text-sm">
                <thead><tr className="bg-primary/5 border-b border-border">
                  <th className="px-4 py-3 text-right font-bold">رقم التسلسل</th>
                  <th className="px-4 py-3 text-right font-bold">عنوان الكتاب</th>
                  <th className="px-4 py-3 text-right font-bold">المؤلفون</th>
                  <th className="px-4 py-3 text-right font-bold">تاريخ الإدخال</th>
                  <th className="px-4 py-3 text-right font-bold">رقم التصنيف</th>
                  <th className="px-4 py-3 text-right font-bold">نوع المادة</th>
                  <th className="px-4 py-3 text-right font-bold">حالة الكتاب</th>
                </tr></thead>
                <tbody>{entryDateData.map(r => (
                  <tr key={r.serial} className="border-b border-border/50 hover:bg-muted/50"><td className="px-4 py-3">{r.serial}</td><td className="px-4 py-3">{r.title}</td><td className="px-4 py-3">{r.author}</td><td className="px-4 py-3">{r.entryDate}</td><td className="px-4 py-3">{r.classification}</td><td className="px-4 py-3">{r.material}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td></tr>
                ))}</tbody>
              </table>
            )}

            {activeTab === "discarded" && (
              <table className="w-full text-sm">
                <thead><tr className="bg-primary/5 border-b border-border">
                  <th className="px-4 py-3 text-right font-bold">رقم التسلسل</th>
                  <th className="px-4 py-3 text-right font-bold">عنوان الكتاب</th>
                  <th className="px-4 py-3 text-right font-bold">المؤلفون</th>
                  <th className="px-4 py-3 text-right font-bold">رقم التصنيف</th>
                  <th className="px-4 py-3 text-right font-bold">حالة الكتاب</th>
                </tr></thead>
                <tbody>{discardedData.map(r => (
                  <tr key={r.serial} className="border-b border-border/50 hover:bg-muted/50"><td className="px-4 py-3">{r.serial}</td><td className="px-4 py-3">{r.title}</td><td className="px-4 py-3">{r.author}</td><td className="px-4 py-3">{r.classification}</td><td className="px-4 py-3"><StatusBadge status={r.status} /></td></tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
