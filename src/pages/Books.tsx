import { useState, useRef, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { Eye, Pencil, Copy, LibraryBig, Search , Printer,FileDown, } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import BasicInfo from "@/components/steps/BasicInfo";
import Authors from "@/components/steps/Authors";
import Publishers from "@/components/steps/Publishers";
import Supplier from "@/components/steps/Supplier";
import Review from "@/components/steps/Review";
import type { ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import ass from "@/components/assest/Logo.jpeg"
import * as XLSX from "xlsx";

ModuleRegistry.registerModules([AllCommunityModule]);

const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

interface BookResponse {
  bookId: number;
  serialNumber: string;
  title: string;
  classificationCode: string;
  numberOfPages: number;
  suffix: string;
  status: string;
  bookType: string;
  dimensions: string;
  authors: string | { authorID: number | null; name: string; authorTypeID: number | null; authorRoleID: number | null }[];
  parentTitle: string;
  createdBy: string;
}

interface AuthorDetail {
  authorId: number;
  name: string;
  authorTypeId: number | null;
  authorTypeName: string | null;
  authorRoleId: number | null;
  authorRoleName: string | null;
}

interface PublisherDetail {
  publisherId: number;
  name: string;
  place: string;
  year: number;
  edition: string;
  depositNumber: string;
}

interface SeriesDetail {
  seriesId: number;
  title: string;
  partCount: number | null;
  partNumber: string;
  note: string | null;
  subSeriesTitle: string;
  subSeriesPartNumber: string;
}

interface SupplyDetail {
  supplierId: number;
  supplierName: string;
  supplyDate: string | null;
  supplyMethodName: string;
  price: number | null;
  currency: string | null;
  note: string | null;
}

interface SubtitleDetail {
  subtitleId: number;
  subtitle: string;
  subtitleTypeId: number | null;
  subtitleTypeName: string | null;
}

interface BookDetailsResponse {
  bookId: number;
  parentBookId: number | null;
  bookType: string;
  serialNumber: string;
  classificationCode: string;
  suffix: string;
  title: string;
  dimensions: string;
  numberOfPages: number;
  isbn: string;
  subjectHeading: string;
  abstract: string;
  illustrations: string;
  bibliographicNote: string;
  bookStatus: string;
  materialTypeId: number | null;
  materialTypeName: string | null;
  subtitles: SubtitleDetail[];
  authors: AuthorDetail[];
  publishers: PublisherDetail | null;
  series: SeriesDetail | null;
  supply: SupplyDetail | null;
  createdBy: string;
}

interface BookData {
  bookID: number | null;
  parentBookID: number | null;
  bookType: string | null;
  serialNumber: string | null;
  classificationCode: string | null;
  suffix: string | null;
  title: string | null;
  dimensions: string | null;
  materialTypeID: any;
  subjectHeading: string | null;
  abstract: string | null;
  illustrations: string | null;
  isbn: string | null;
  numberOfPages: number | null;
  bibliographicNote: string | null;
  subtitles: { subtitleID: number | null; subtitle: string | null; subtitleTypeID: number | null }[];
  authors: { authorID: number | null; name: string | null; authorTypeID: number | null; authorTypeName?: string | null; authorRoleID: number | null; authorRoleName?: string | null }[];
  publishers: { publisherID: number | null; name: string | null; place: string | null; year: number | null; edition: string | null; depositNumber: string | null };
  series: { seriesID: number | null; title: string | null; partCount: string | null; note: string | null; partNumber: string | null; subSeriesTitle: string | null; subSeriesPartNumber: string | null };
  supplies: { supplyID: number | null; name: string | null; supplyDate: string | null; supplyMethod: string | null; price: number | null; currency: string | null; note: string | null };
  status: string;
}

interface LookupItem {
  id: number;
  name: string;
}

const SEARCH_TYPES = [
  { value: "title", label: "العنوان" },
  { value: "authorName", label: "المؤلف" },
  { value: "publisherName", label: "الناشر" },
  { value: "supplierName", label: "المزود" },
  { value: "serialNumber", label: "رقم التسلسل" },
  { value: "classificationCode", label: "رمز التصنيف" },
  { value: "isbn", label: "ISBN" },
];

const statusMap: Record<string, string> = {
  "Available": "متوفر",
  "Borrowed": "معار",
  "Reserved": "محجوز",
  "Removed": "مخرج",
};

const emptyBook = (): Partial<BookData> => ({
  bookID: null, parentBookID: null, bookType: null, serialNumber: null, classificationCode: null,
  suffix: null, title: null, dimensions: null, materialTypeID: null, subjectHeading: null,
  abstract: null, illustrations: null, isbn: null, numberOfPages: null, bibliographicNote: null,
  subtitles: [], authors: [],
  publishers: { publisherID: null, name: null, place: null, year: null, edition: null, depositNumber: null },
  series: { seriesID: null, title: null, partCount: null, note: null, partNumber: null, subSeriesTitle: null, subSeriesPartNumber: null },
  supplies: { supplyID: null, name: null, supplyDate: null, supplyMethod: null, price: null, currency: null, note: null },
});

const mapDetailsToBookData = (full: BookDetailsResponse): BookData => ({
  bookID: full.bookId,
  parentBookID: full.parentBookId ?? null,
  bookType: full.bookType ?? null,
  serialNumber: full.serialNumber ?? null,
  classificationCode: full.classificationCode ?? null,
  suffix: full.suffix ?? null,
  title: full.title ?? null,
  dimensions: full.dimensions ?? null,
  materialTypeID: full.materialTypeId ?? null,
  subjectHeading: full.subjectHeading ?? null,
  abstract: full.abstract ?? null,
  illustrations: full.illustrations ?? null,
  isbn: full.isbn ?? null,
  numberOfPages: full.numberOfPages ?? null,
  bibliographicNote: full.bibliographicNote ?? null,
  status: full.bookStatus ?? "",
  subtitles: (full.subtitles ?? []).map(s => ({
    subtitleID: s.subtitleId,
    subtitle: s.subtitle,
    subtitleTypeID: s.subtitleTypeId,
  })),
  authors: (full.authors ?? []).map(a => ({
    authorID: a.authorId ?? null,
    name: a.name ?? "",
    authorTypeID: a.authorTypeId ?? null,
    authorTypeName: a.authorTypeName ?? null,
    authorRoleID: a.authorRoleId ?? null,
    authorRoleName: a.authorRoleName ?? null,
  })),
  publishers: full.publishers ? {
    publisherID: full.publishers.publisherId,
    name: full.publishers.name,
    place: full.publishers.place,
    year: full.publishers.year,
    edition: full.publishers.edition,
    depositNumber: full.publishers.depositNumber,
  } : emptyBook().publishers!,
  series: full.series ? {
    seriesID: full.series.seriesId,
    title: full.series.title,
    partCount: full.series.partCount != null ? String(full.series.partCount) : null,
    note: full.series.note ?? null,
    partNumber: full.series.partNumber,
    subSeriesTitle: full.series.subSeriesTitle,
    subSeriesPartNumber: full.series.subSeriesPartNumber,
  } : emptyBook().series!,
  supplies: full.supply ? {
    supplyID: full.supply.supplierId,
    name: full.supply.supplierName,
    supplyDate: full.supply.supplyDate ?? null,
    supplyMethod: full.supply.supplyMethodName,
    price: full.supply.price ?? null,
    currency: full.supply.currency ?? null,
    note: full.supply.note ?? null,
  } : emptyBook().supplies!,
});

const cleanBookBody = (data: any): any => {
  if (Array.isArray(data)) {
    return data
      .map(item => cleanBookBody(item))
      .filter(item => item !== null && item !== undefined);
  }

  if (typeof data === "object" && data !== null) {
    const cleaned: any = {};

    Object.keys(data).forEach((key) => {
      let value = data[key];
      if (typeof value === "string") {
        value = value.trim();
        if (value === "") value = null;
      }
      if (key.toLowerCase().endsWith("id") && value != null) {
        if (typeof value === "string") {
          const parsed = parseInt(value.split("-").pop() || "");
          value = isNaN(parsed) ? null : parsed;
        }
      }
      value = cleanBookBody(value);
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === "object" && Object.keys(value).length === 0)
      ) {
        cleaned[key] = value;
      }
    });

    return cleaned;
  }

  return data;
};

const StatusBadge = ({ status }: { status: string }) => {
  const label = statusMap[status] ?? status;
  let cls = "bg-muted text-muted-foreground";
  if (status === "Available") cls = "bg-green-100 text-green-700";
  else if (status === "Borrowed") cls = "bg-yellow-100 text-yellow-700";
  else if (status === "Reserved") cls = "bg-orange-100 text-orange-700";
  else if (status === "Removed") cls = "bg-red-100 text-red-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label || "—"}</span>;
};

export default function UpdateBooks() {
  const gridRef = useRef<any>(null);
  const [rowData, setRowData] = useState<BookResponse[]>([]);
  const [activeBook, setActiveBook] = useState<BookData | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [mode, setMode] = useState<"view" | "edit" | "copy" | "part" | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("title");

  const [materialTypes, setMaterialTypes] = useState<LookupItem[]>([]);
  const [authorRoles, setAuthorRoles] = useState<LookupItem[]>([]);
  const [authorTypes, setAuthorTypes] = useState<LookupItem[]>([]);
  const [subtitleTypes, setSubtitleTypes] = useState<LookupItem[]>([]);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch("https://localhost:8080/api/Book/search", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRowData(data.data ?? data);
    } catch {
      toast.error("فشل تحميل البيانات");
    }
  }, []);

 const updateData = (key: string, value: any) => {
  setActiveBook(prev => {
    if (!prev) return prev;

    return {
      ...prev,
      [key]: typeof value === "object" && !Array.isArray(value)
        ? {
            ...(prev[key] || {}), 
            ...value           
          }
        : value
    };
  });
};

  const openBookDialog = async (row: BookResponse, dialogMode: "view" | "edit" | "copy" | "part") => {
    try {
      const id = row.bookId;
      const res = await fetch(`https://localhost:8080/api/Book/details/${id}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      const full: BookDetailsResponse = await res.json();
      const mapped = mapDetailsToBookData(full);
      setActiveBook(mapped);
    } catch {
      const base = emptyBook();
      setActiveBook({
        ...base,
        bookID: row.bookId,
        title: row.title ?? null,
        serialNumber: row.serialNumber ?? null,
        classificationCode: row.classificationCode ?? null,
        suffix: row.suffix ?? null,
        dimensions: row.dimensions ?? null,
        numberOfPages: row.numberOfPages ?? null,
        status: row.status ?? "",
        authors: Array.isArray(row.authors)
          ? row.authors.map((a: any) => ({ authorID: a.authorID ?? null, name: a.name ?? "", authorTypeID: a.authorTypeID ?? null, authorRoleID: a.authorRoleID ?? null }))
          : [],
      } as BookData);
    }
    setMode(dialogMode);
    setActiveTab("basic");
  };

  const handleSave = async () => {
    if (!activeBook) return;
    setSaving(true);
    try {
      let response: Response;

      if (mode === "edit") {
        const body = cleanBookBody(activeBook);
        response = await fetch("https://localhost:8080/api/Book/update", {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
      } else if (mode === "copy" || mode === "part") {
        const { bookID, ...rest } = activeBook as any;
        const body = cleanBookBody({
          ...rest,
          bookID: null,
          parentBookID: activeBook.bookID,
          bookType: mode,
          serialNumber: activeBook.serialNumber ? String(activeBook.serialNumber) : null,
        });
        response = await fetch("https://localhost:8080/api/Book/create", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
      } else {
        return;
      }

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.message || "حدث خطأ أثناء الحفظ");
        return;
      }

      if (searchValue.trim()) {
  await onSearch(searchValue);
} else {
  await fetchBooks();
}
      toast.success(
        mode === "edit" ? "تم التعديل بنجاح" :
        mode === "copy" ? "تمت إضافة النسخة بنجاح" : "تمت إضافة الجزء بنجاح"
      );
      setMode(null);
      setActiveBook(null);
    } catch {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };
const onSearch = useCallback(async (value: string) => {
  setSearchValue(value);

  if (!value.trim()) {
    setRowData([]); 
    return;
  }

  try {
    const res = await fetch("https://localhost:8080/api/Book/search", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        [searchType]: value
      }),
    });

    const data = await res.json();
    setRowData(data.data ?? []);
  } catch {
    toast.error("فشل البحث");
  }
}, [searchType]);

const handleExportExcel = () => {
  if (!gridRef.current) return;

  const api = gridRef.current.api;
  const data: any[] = [];

  api.forEachNodeAfterFilterAndSort((node: any) => {
    data.push({
      "رقم التسلسل": node.data.serialNumber,
      "رمز التصنيف": node.data.classificationCode,
      "لاحقة": node.data.suffix,
      "العنوان": node.data.title,
      "المؤلف": Array.isArray(node.data.authors)
        ? node.data.authors.map((a: any) => a.name).join(", ")
        : node.data.authors,
      "عدد الصفحات": node.data.numberOfPages,
      "الأبعاد": node.data.dimensions,
      "الحالة": node.data.status,
    });
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Books");
  XLSX.writeFile(wb, "books_data.xlsx");
};
const handlePrint = () => {
  if (!gridRef.current) return;

  const api = gridRef.current.api;
  const data: any[] = [];

  api.forEachNodeAfterFilterAndSort((node) => {
    data.push(node.data);
  });

  const win = window.open("", "", "width=1200,height=800");
  if (!win) return;

  const today = new Date();
  const date = today.toLocaleDateString("ar-EG");
  const day = today.toLocaleDateString("ar-EG", { weekday: "long" });

  win.document.write(`
    <html dir="rtl">
      <head>
        <title>تقرير قائمة الكتب</title>

        <style>
          @page {
            size: A4;
            margin: 20mm;
          }

          body {
            font-family: "Cairo", Arial, sans-serif;
            direction: rtl;
            color: #2c3e50;
          }

          /* HEADER */
          .header {
            text-align: center;
            margin-bottom: 20px;
            position: relative;
          }

          .top-info {
            position: absolute;
            top: 0;
            right: 0;
            text-align: right;
            font-size: 13px;
            color: #555;
          }

          .logos {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
          }

          .logos img {
            width: 75px;
            height: 75px;
            object-fit: contain;
          }

          .divider {
            width: 2px;
            height: 55px;
            background-color: #999;
          }

          .header-title h1 {
            margin: 0;
            font-size: 26px;
            font-weight: bold;
          }

          .header-title h2 {
            margin: 5px 0;
            font-size: 17px;
            color: #666;
          }

          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            font-size: 14px;
          }

          th {
            background-color: #1f2937;
            color: white;
            padding: 12px;
            font-weight: bold;
          }

          td {
            padding: 10px;
            border: 1px solid #ddd;
          }

          tr:nth-child(even) {
            background-color: #f9fafb;
          }

          /* STATUS */
          .status {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }

          .available {
            background: #eafaf1;
            color: #27ae60;
          }

          .borrowed {
            background: #fff4e5;
            color: #f39c12;
          }

          .reserved {
            background: #fff0f6;
            color: #e67e22;
          }

          .removed {
            background: #fdecea;
            color: #c0392b;
          }

          /* FOOTER */
          .footer {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
            font-size: 12px;
            text-align: center;
            color: #777;
          }

          tr {
            page-break-inside: avoid;
          }
        </style>
      </head>

      <body>

        <div class="header">

          <div class="top-info">
            <div>اليوم: ${day}</div>
            <div>التاريخ: ${date}</div>
          </div>

          <div class="logos">
            <img src="/Logo.jpeg" />
            <div class="divider"></div>
            <img src="/slogan.png" />
          </div>

          <div class="header-title">
            <h1>📚 مكتبة البلدية</h1>
            <h2>تقرير قائمة الكتب</h2>
          </div>

        </div>

        <table>
          <thead>
            <tr>
              <th>رقم التسلسل</th>
              <th>رمز التصنيف</th>
              <th>اللاحقة</th>
              <th>العنوان</th>
              <th>المؤلف</th>
              <th>عدد الصفحات</th>
              <th>الأبعاد</th>
              <th>الحالة</th>
            </tr>
          </thead>

          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.serialNumber ?? ""}</td>
                <td>${row.classificationCode ?? ""}</td>
                <td>${row.suffix ?? ""}</td>
                <td>${row.title ?? ""}</td>

                <td>
                  ${
                    Array.isArray(row.authors)
                      ? row.authors.map((a: any) => a.name).join(", ")
                      : row.authors ?? ""
                  }
                </td>

                <td>${row.numberOfPages ?? ""}</td>
                <td>${row.dimensions ?? ""}</td>

                <td>
                  <span class="status ${
                    row.status === "Available" ? "available" :
                    row.status === "Borrowed" ? "borrowed" :
                    row.status === "Reserved" ? "reserved" :
                    "removed"
                  }">
                    ${statusMap[row.status] ?? row.status ?? ""}
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          نظام إدارة المكتبة © ${today.getFullYear()}
        </div>

      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
};
  const columnDefs: ColDef[] = [
    { headerName: "رقم التسلسل", field: "serialNumber" },
    { headerName: "رمز التصنيف", field: "classificationCode" },
    { headerName: "اللاحقة", field: "suffix" },
    { headerName: "عنوان الكتاب", field: "title" },
    {
      headerName: "اسم المؤلف",
      valueGetter: (params) => {
        const authors = params.data?.authors;
        if (typeof authors === "string") return authors;
        if (Array.isArray(authors)) return authors.map((a: any) => a.name).join(", ");
        return "";
      },
    },
    { headerName: "عدد الصفحات", field: "numberOfPages" },
    { headerName: "الأبعاد", field: "dimensions" },
    {
      headerName: "الحالة",
      field: "status",
      cellRenderer: (params: any) => <StatusBadge status={params.value || ""} />,
    },
    {
  headerName: "إجراءات",
  width: 200,
  sortable: false,
  filter: false,
  cellRenderer: (params: any) => {
    const removed =
      params.data?.status === "Removed" ||
      params.data?.status === "مخرج";

    const disabledClass = removed
      ? "opacity-40 pointer-events-none"
      : "";

    return (
      <div className="flex items-center gap-0.5 py-1">
        <button
          onClick={() => openBookDialog(params.data, "view")}
          className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
          title="عرض"
        >
          <Eye className="h-4 w-4" />
        </button>
       
<div className={`${disabledClass}`}>
        <button
          onClick={() => openBookDialog(params.data, "edit")}
          className="p-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100"
          title={removed ? "غير مسموح" : "تعديل"}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          onClick={() => openBookDialog(params.data, "copy")}
          className="p-1 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100"
          title={removed ? "غير مسموح" : "نسخة"}
        >
          <Copy className="h-4 w-4" />
        </button>

        <button
          onClick={() => openBookDialog(params.data, "part")}
          className="p-1 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100"
          title={removed ? "غير مسموح" : "جزء"}
        >
          <LibraryBig className="h-4 w-4" />
        </button>
      </div> 
      </div>
    );
  },
}];
 


return (
  <div className="p-4 md:p-8" dir="rtl">

    <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground">إدارة الكتب</h2>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة وتحديث بيانات الكتب والبحث المتقدم
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-muted/40 p-4 rounded-xl border border-border">

        <Select value={searchType} onValueChange={(val) => { setSearchType(val); setSearchValue(""); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="نوع البحث" />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`ابحث بـ ${SEARCH_TYPES.find(t => t.value === searchType)?.label}...`}
            className="pr-9 bg-background"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(searchValue);
              }
            }}
          />
        </div>

       <Button
          onClick={handleExportExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <FileDown className="w-4 h-4 ml-1" />
          تصدير
        </Button>

        <Button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
        >
          <Printer className="w-4 h-4 ml-1" />
          طباعة
        </Button>
      
      </div>

      <div className="ag-theme-alpine rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: 520 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          enableRtl={true}
          pagination={true}
          paginationPageSize={20}
           defaultColDef = 
           {{flex: 1, resizable: true, sortable: true, filter: true }}
        />
      </div>

    </div>

    <Dialog open={!!mode} onOpenChange={() => { setMode(null); setActiveBook(null); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl">

        <DialogHeader>
          <DialogTitle>
            {mode === "view" && "📖 عرض بيانات الكتاب"}
            {mode === "edit" && "✏️ تعديل الكتاب"}
            {mode === "copy" && "➕ إضافة نسخة"}
            {mode === "part" && "📚 إضافة جزء"}
          </DialogTitle>
        </DialogHeader>

        {mode === "view" && activeBook && (
          <Review
            formData={activeBook}
            materialTypes={materialTypes}
            authorRoles={authorRoles}
            authorTypes={authorTypes}
            subtitleTypes={subtitleTypes}
          />
        )}

        {(mode === "edit" || mode === "copy" || mode === "part") && activeBook && (
          <div className="space-y-4">

            <div className="flex flex-wrap gap-2">
              {[
                { key: "basic", label: "المعلومات الأساسية" },
                { key: "authors", label: "المؤلفون" },
                { key: "publishers", label: "الناشرون" },
                { key: "supplier", label: "المزوّد" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${activeTab === tab.key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted hover:bg-accent"}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "basic" && (
              <BasicInfo formData={activeBook} updateData={updateData}
                onMaterialTypesLoaded={setMaterialTypes}
                onSubtitleTypesLoaded={setSubtitleTypes}
              />
            )}

            {activeTab === "authors" && (
              <Authors formData={activeBook} updateData={updateData}
                onRolesLoaded={setAuthorRoles}
                onTypesLoaded={setAuthorTypes}
              />
            )}

            {activeTab === "publishers" && (
              <Publishers formData={activeBook} updateData={updateData} />
            )}

            {activeTab === "supplier" && (
              <Supplier formData={activeBook} updateData={updateData} />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setMode(null); setActiveBook(null); }}>
                إلغاء
              </Button>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : "💾 حفظ"}
              </Button>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>

  </div>
);
}