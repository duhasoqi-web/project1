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

const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

const emptyBook = (): Partial<BookData> => ({
  bookID: null, parentBookID: null, bookType: null, serialNumber: null, classificationCode: null,
  suffix: null, title: null, dimensions: null, materialTypeID: null, subjectHeading: null,
  abstract: null, illustrations: null, isbn: null, numberOfPages: null, bibliographicNote: null,
  subtitles: [], authors: [],
  publishers: { publisherID: null, name: null, place: null, year: null, edition: null, depositNumber: null },
  series: { seriesID: null, title: null, partCount: null, note: null, partNumber: null, subSeriesTitle: null, subSeriesPartNumber: null },
  supplies: { supplyID: null, name: null, supplyDate: null, supplyMethod: null, price: null, currency: null, note: null },
});

const cleanBookBody = (book: any) => {
  const {
    createdBy, bookId, status, parentTitle,
    bookStatus, materialTypeId, materialTypeName,
    parentBookId, supply, Title,
    ...clean
  } = book;

  return {
    ...clean,
    bookID: book.bookID ?? book.bookId ?? null,
    title: clean.title ?? Title ?? null, 
    numberOfPages: clean.numberOfPages || null,
    dimensions: clean.dimensions || null,
    suffix: clean.suffix || null,
    subtitles: (clean.subtitles ?? [])
      .filter((s: any) => s.subtitle)
      .map(({ subtitleID, ...s }: any) => s),
   authors:
  (clean.authors ?? []).filter((a: any) => a.name).length > 0
    ? clean.authors
        .filter((a: any) => a.name)
        .map((a: any) => ({
          authorID: a.authorID > 0 ? a.authorID : null,
          name: a.name,
          authorTypeID: a.authorTypeID ?? null,
          authorRoleID: a.authorRoleID ?? null,
        }))
    : null,
    publishers: clean.publishers?.name ? clean.publishers : null,
    series: clean.series?.title ? clean.series : null,
    supplies: clean.supplies?.name ? clean.supplies : null,
  };
};

const StatusBadge = ({ status }: { status: string }) => {
  let cls = "bg-green-100 text-green-700";
  if (status === "معار") cls = "bg-yellow-100 text-yellow-700";
  else if (status === "محجوز") cls = "bg-orange-100 text-orange-700";
  else if (status === "مخرج") cls = "bg-red-100 text-red-700";
  else if (status !== "متوفر") cls = "bg-muted text-muted-foreground";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
};

export default function UpdateBooks() {
  const gridRef = useRef<any>(null);
  const [rowData, setRowData] = useState<BookData[]>([]);
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
      setRowData(data);
    } catch {
      toast.error("فشل تحميل البيانات");
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const updateData = (key: string, value: any) => {
    setActiveBook((prev: any) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
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
          body: JSON.stringify( body),
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
          body: JSON.stringify( body),
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

  const handleExportCSV = () => {
    if (!gridRef.current) return;
    gridRef.current.api.exportDataAsCsv({ fileName: "books_data.csv" });
  };

  const handlePrint = () => {
    if (!gridRef.current) return;
    const api = gridRef.current.api;
    const data: any[] = [];
    api.forEachNodeAfterFilterAndSort((node: any) => data.push(node.data));
    const printWindow = window.open("", "", "width=1000,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl"><head><style>
        table { border-collapse:collapse; width:100%; }
        th, td { border:1px solid #ddd; padding:8px; text-align:right; }
        th { background:#f5f5f5; }
      </style></head><body>
        <h2>قائمة الكتب</h2>
        <table>
          <thead><tr><th>رقم التسلسل</th><th>رمز التصنيف</th><th>اللاحقة</th><th>عنوان الكتاب</th><th>الحالة</th></tr></thead>
          <tbody>${data.map((row) => `<tr><td>${row.serialNumber || ""}</td><td>${row.classificationCode || ""}</td><td>${row.suffix || ""}</td><td>${row.title || ""}</td><td>${row.status || ""}</td></tr>`).join("")}</tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const openBookDialog = async (data: any, dialogMode: "view" | "edit" | "copy" | "part") => {
    try {
      const id = data.bookId ?? data.bookID;
      const res = await fetch(`https://localhost:8080/api/Book/details/${id}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const full = await res.json();
        data = {
          ...full,
          bookID: full.bookId,
          title: full.title ?? null, // ✅ مباشرة من full
          materialTypeID: full.materialTypeId,
          subtitles: (full.subtitles ?? []).map((s: any) => ({
            subtitleID: s.subtitleId,
            subtitle: s.subtitle,
            subtitleTypeID: s.subtitleTypeId,
          })),
          authors: (full.authors ?? []).map((a: any) => ({
            authorID: a.authorId ?? null,
            name: a.name ?? "",
            authorTypeID: a.authorTypeId,
            authorRoleID: a.authorRoleId,
          })),
          publishers: full.publishers ? {
            publisherID: full.publishers.publisherId,
            name: full.publishers.name,
            place: full.publishers.place,
            year: full.publishers.year,
            edition: full.publishers.edition,
            depositNumber: full.publishers.depositNumber,
          } : null,
          series: full.series ? {
            seriesID: full.series.seriesId,
            title: full.series.title,
            partCount: full.series.partCount,
            note: full.series.note,
            partNumber: full.series.partNumber,
            subSeriesTitle: full.series.subSeriesTitle,
            subSeriesPartNumber: full.series.subSeriesPartNumber,
          } : null,
          supplies: full.supply ? {
            supplyID: full.supply.supplierId,
            name: full.supply.supplierName,
            supplyDate: full.supply.supplyDate,
            supplyMethod: full.supply.supplyMethodName,
            price: full.supply.price,
            currency: full.supply.currency,
            note: full.supply.note,
          } : null,
        };
      }
    } catch {}

    const base = emptyBook();
    const book: BookData = {
      ...base,
      ...data,
      bookID: data.bookID ?? data.bookId ?? null,
      subtitles: Array.isArray(data.subtitles) ? data.subtitles : [],
      authors: Array.isArray(data.authors) ? data.authors.map((a: any) => ({
        authorID: a.authorID ?? null,
        name: a.name ?? "",
        authorTypeID: a.authorTypeID ?? null,
        authorRoleID: a.authorRoleID ?? null,
      })) : [],
      publishers: data.publishers ?? base.publishers,
      series: data.series ?? base.series,
      supplies: data.supplies ?? base.supplies,
    } as BookData;

    setActiveBook(book);
    setMode(dialogMode);
    setActiveTab("basic");
  };

  const onSearch = useCallback(async (value: string) => {
    setSearchValue(value);
    if (!value.trim()) {
      fetchBooks();
      return;
    }
    try {
      const res = await fetch("https://localhost:8080/api/Book/search", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ [searchType]: value }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRowData(data);
    } catch {
      toast.error("فشل البحث");
    }
  }, [fetchBooks, searchType]);

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
      cellRenderer: (params: any) => <StatusBadge status={params.value || "—"} />,
    },
    {
      headerName: "إجراءات",
      width: 200,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-0.5 py-1">
          <button onClick={() => openBookDialog(params.data, "view")} className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100" title="عرض">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => openBookDialog(params.data, "edit")} className="p-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100" title="تعديل">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => openBookDialog(params.data, "copy")} className="p-1 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100" title="نسخة">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={() => openBookDialog(params.data, "part")} className="p-1 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100" title="جزء">
            <LibraryBig className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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

      <div className="ag-theme-alpine w-full" style={{ height: 600 }}>
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