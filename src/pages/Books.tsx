import { useState, useRef, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { Eye, Pencil, Copy, LibraryBig, Search } from "lucide-react";
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

 useEffect(() => {
  const delay = setTimeout(() => {
    if (searchValue.trim()) {
      onSearch(searchValue);
    }
  }, 300);

  return () => clearTimeout(delay);
}, [searchValue]);

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

      await fetchBooks();
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

  const handleExportCSV = () => {
    gridRef.current?.api.exportDataAsCsv({ fileName: "books_data.csv" });
  };

const handlePrint = () => {
  if (!gridRef.current) return;

  const api = gridRef.current.api;

  const data: any[] = [];

  api.forEachNodeAfterFilterAndSort((node) => {
    data.push(node.data);
  });

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html dir="rtl">
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h2>📚 قائمة الكتب</h2>

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
                <td>${statusMap[row.status] ?? row.status ?? ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
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
  const defaultColDef = { flex: 1, resizable: true, sortable: true, filter: true };

  return (
    <div className="p-4 md:p-8 space-y-4" dir="rtl">
      <h2 className="text-2xl font-bold">📖 إدارة الكتب</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={searchType} onValueChange={(val) => { setSearchType(val); setSearchValue(""); }}>
          <SelectTrigger className="w-[150px]">
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
            className="pr-9"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={handleExportCSV}>تصدير CSV</Button>
        <Button variant="outline" onClick={handlePrint}>طباعة</Button>
      </div>

      <div className="ag-theme-alpine w-full" style={{ height: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          enableRtl={true}
          pagination={true}
          paginationPageSize={20}
        />
      </div>

      <Dialog open={!!mode} onOpenChange={() => { setMode(null); setActiveBook(null); }}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"
                    }`}
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
              {activeTab === "publishers" && <Publishers formData={activeBook} updateData={updateData} />}
              {activeTab === "supplier" && <Supplier formData={activeBook} updateData={updateData} />}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setMode(null); setActiveBook(null); }}>إلغاء</Button>
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