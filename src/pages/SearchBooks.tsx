import { useState } from "react";

const allColumns = [
  { key: "serial", label: "رقم تسلسل" },
  { key: "classification", label: "رقم تصنيف" },
  { key: "suffix", label: "اللاحقة" },
  { key: "title", label: "العنوان" },
  { key: "subtitle", label: "عنوان فرعي" },
  { key: "author", label: "المؤلف" },
  { key: "edition", label: "الطبعة" },
  { key: "publisher", label: "الناشر" },
  { key: "place", label: "مكان النشر" },
  { key: "year", label: "تاريخ النشر" },
  { key: "subject", label: "رأس الموضوع" },
  { key: "status", label: "حالة الكتاب" },
];

const bookData = [
  { serial: 1, classification: "1.1", suffix: "A", title: "العقل الباطن", subtitle: "", author: "جوزيف ميرفي", edition: "3", publisher: "دار الشروق", place: "القاهرة", year: 2010, subject: "علم النفس", status: "متاح" },
  { serial: 2, classification: "2.2", suffix: "B", title: "قواعد العشق الأربعون", subtitle: "", author: "إليف شافاق", edition: "1", publisher: "دار العلم", place: "دمشق", year: 2009, subject: "روايات", status: "متاح" },
  { serial: 3, classification: "3.3", suffix: "C", title: "فن اللامبالاة", subtitle: "", author: "مارك مانسون", edition: "2", publisher: "دار الفكر", place: "بيروت", year: 2018, subject: "تنمية ذاتية", status: "متاح" },
  { serial: 4, classification: "4.4", suffix: "D", title: "الأب الغني والأب الفقير", subtitle: "", author: "روبرت كيوساكي", edition: "5", publisher: "دار المدى", place: "عمان", year: 2000, subject: "مالية", status: "محجوز" },
  { serial: 5, classification: "5.5", suffix: "E", title: "موسم الهجرة إلى الشمال", subtitle: "", author: "الطيب صالح", edition: "1", publisher: "دار الكتاب", place: "الخرطوم", year: 1966, subject: "روايات", status: "محجوز" },
  { serial: 6, classification: "6.6", suffix: "F", title: "الخيميائي", subtitle: "رحلة الروح", author: "باولو كويلو", edition: "10", publisher: "دار النهضة", place: "الرياض", year: 1988, subject: "روايات", status: "معار" },
];

const StatusBadge = ({ status }: { status: string }) => {
  let cls = "bg-gray-100 text-gray-600";

  if (status === "متاح") cls = "bg-green-100 text-green-700";
  else if (status === "معار") cls = "bg-yellow-100 text-yellow-700";
  else if (status === "محجوز") cls = "bg-orange-100 text-orange-700";
  else if (status === "مخرج") cls = "bg-red-100 text-red-700";

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cls}`}>
      {status}
    </span>
  );
};

const Search = () => {
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(
    Object.fromEntries(allColumns.map(c => [c.key, true]))
  );
  const [filter, setFilter] = useState("");

  const filteredData = bookData.filter(book =>
    !filter || Object.values(book).some(v => String(v).includes(filter))
  );

  const activeColumns = allColumns.filter(c => visibleCols[c.key]);

  // ✅ طباعة احترافية
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    const headers = activeColumns.map(col => `<th>${col.label}</th>`).join("");
    const rows = filteredData.map(book => `
      <tr>
        ${activeColumns.map(col =>
          `<td>${book[col.key as keyof typeof book] ?? ""}</td>`
        ).join("")}
      </tr>
    `).join("");

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة البيانات</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">جدول بيانات الكتب</h2>
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  // ✅ تصدير CSV
  const handleExportCSV = () => {
    const headers = activeColumns.map(col => col.label).join(",");
    const rows = filteredData.map(book =>
      activeColumns.map(col =>
        `"${book[col.key as keyof typeof book] ?? ""}"`
      ).join(",")
    ).join("\n");

    const csvContent = "\uFEFF" + headers + "\n" + rows; // UTF-8 Arabic support
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "books_data.csv";
    link.click();
  };

  return (
    <div dir="rtl">
      <div className="mb-5">
        <h1 className="page-title flex items-center gap-3">
          🔍 البحث المتقدم
        </h1>
        <p className="text-muted-foreground text-lg">
          ابحث عن الكتب باستخدام معايير متعددة
        </p>
      </div>

      <div className="gov-card">
        <div className="gov-card-body">

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleExportCSV}
              className="btn-gov-primary px-4 py-2 text-sm"
            >
              تصدير CSV
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, hsl(142, 70%, 45%), hsl(155, 70%, 55%))" }}
            >
              طباعة
            </button>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 border-b border-border">
                  {activeColumns.map(col => (
                    <th key={col.key} className="px-4 py-3 text-right font-bold">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(book => (
                  <tr key={book.serial} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    {activeColumns.map(col => (
                      <td key={col.key} className="px-4 py-3">
                        {col.key === "status"
                          ? <StatusBadge status={book[col.key as keyof typeof book] as string} />
                          : String(book[col.key as keyof typeof book] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Search;
