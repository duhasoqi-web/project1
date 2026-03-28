import { useState, useCallback, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { Search, Printer, FileDown, Trash2, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import * as XLSX from "xlsx";

ModuleRegistry.registerModules([AllCommunityModule]);

const PAGE_SIZE = 20;

interface Book {
  bookID: number;
  barcode: string;
  serialNumber: string;
  title: string;
  authors: string;
  status?: string;
}

interface PagedResult<T> {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  data: T[];
}

interface RemoveReason {
  id: number;
  name: string;
}

const authHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "/login";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const SEARCH_TYPES = [
  { value: "title", label: "العنوان" },
  { value: "authorName", label: "المؤلف" },
  { value: "serialNumber", label: "رقم التسلسل" },
  { value: "barcode", label: "باركود" },
];

interface PaginationBarProps {
  currentPage: number;
  totalRecords: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const PaginationBar = ({ currentPage, totalRecords, pageSize, loading, onPageChange }: PaginationBarProps) => {
  const totalPages = Math.ceil(totalRecords / pageSize);
  if (totalPages <= 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalRecords);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1 select-none" dir="rtl">
      <span className="text-sm text-muted-foreground">
        عرض <span className="font-semibold text-foreground">{from}–{to}</span> من{" "}
        <span className="font-semibold text-foreground">{totalRecords.toLocaleString("ar-EG")}</span> سجل
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1 || loading}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="الأولى">
          <ChevronsRight className="h-4 w-4" />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || loading}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="السابقة">
          <ChevronRight className="h-4 w-4" />
        </button>
        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p as number)} disabled={loading}
              className={`min-w-[36px] h-9 px-2 rounded-lg border text-sm font-medium transition-colors
                ${currentPage === p
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border bg-background hover:bg-muted text-foreground"
                } disabled:cursor-not-allowed`}>
              {(p as number).toLocaleString("ar-EG")}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || loading}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="التالية">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || loading}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="الأخيرة">
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const DeleteBooks = () => {
  const gridRef = useRef<any>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [searchType, setSearchType] = useState("title");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [reasons, setReasons] = useState<RemoveReason[]>([]);

  const fetchReasons = useCallback(async () => {
    try {
      const res = await fetch("https://localhost:8080/api/RemoveReason", {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      setReasons((data ?? []).map((r: any) => ({ id: r.removeReasonID, name: r.removeReasonName })));
    } catch {
      toast.error("فشل تحميل أسباب الإخراج");
    }
  }, []);

  useEffect(() => { fetchReasons(); }, [fetchReasons]);

  const doSearch = useCallback(async (query: string, type: string, page: number) => {
    if (!query.trim()) {
      setBooks([]);
      setTotalRecords(0);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://localhost:8080/api/Book/search", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          [type]: query,
          pageNumber: page,
          pageSize: PAGE_SIZE,
        }),
      });

      const data: PagedResult<any> = await res.json();

      const result = (data.data ?? []).map((b: any) => ({
        bookID: b.bookID ?? b.bookId,
        barcode: b.barcode ?? (b.serialNumber ? `0000${b.serialNumber}00001` : ""),
        serialNumber: b.serialNumber ?? "",
        title: b.title ?? "",
        authors: b.authors ?? "",
        status: b.status ?? b.bookStatus,
      }));

      setBooks(result);
      setTotalRecords(data.totalRecords ?? 0);
      setCurrentPage(data.pageNumber ?? page);
    } catch {
      toast.error("فشل البحث");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) { toast.warning("أدخل قيمة البحث"); return; }
    doSearch(searchQuery, searchType, 1);
  };

  const handlePageChange = useCallback(
    (page: number) => { doSearch(searchQuery, searchType, page); },
    [doSearch, searchQuery, searchType]
  );

  const handleWithdraw = useCallback(async () => {
    if (!selectedBook || !reasonId) { toast.warning("اختر سبب الإخراج"); return; }

    setWithdrawing(true);
    try {
      const res = await fetch("https://localhost:8080/api/Book", {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({
          bookID: selectedBook.bookID,
          removeReasonID: reasonId,
          decisionNote: notes || "",
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "فشل الحذف");

      setBooks((prev) =>
        prev.map((b) => b.bookID === selectedBook.bookID ? { ...b, status: "Removed" } : b)
      );

      toast.success("تم إخراج الكتاب");
      setConfirmOpen(false);
      setSelectedBook(null);
      setReasonId(null);
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "خطأ");
    } finally {
      setWithdrawing(false);
    }
  }, [selectedBook, reasonId, notes]);

  const handleExportExcel = () => {
    if (!gridRef.current) return;
    const data: any[] = [];
    gridRef.current.api.forEachNodeAfterFilterAndSort((node: any) => {
      data.push({
        "باركود": node.data.barcode ?? "",
        "رقم التسلسل": node.data.serialNumber ?? "",
        "عنوان الكتاب": node.data.title ?? "",
        "المؤلف": Array.isArray(node.data.authors) ? node.data.authors.map((a: any) => a.name).join(", ") : node.data.authors ?? "",
        "الحالة": node.data.status === "Removed" ? "مخرج" : "متوفر",
      });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الكتب");
    XLSX.writeFile(wb, "books_data.xlsx");
  };

  const handlePrint = () => {
    if (!gridRef.current) return;
    const data: Book[] = [];
    gridRef.current.api.forEachNodeAfterFilterAndSort((node: any) => { data.push(node.data); });

    const win = window.open("", "", "width=1200,height=800");
    if (!win) return;

    const today = new Date();
    const date = today.toLocaleDateString("ar-EG");
    const day = today.toLocaleDateString("ar-EG", { weekday: "long" });

    win.document.write(`
      <html dir="rtl"><head><title>تقرير إخراج الكتب</title>
      <style>
        @page{size:A4;margin:20mm}
        body{font-family:"Cairo",Arial,sans-serif;direction:rtl;color:#2c3e50}
        .header{text-align:center;margin-bottom:20px;position:relative}
        .top-info{position:absolute;top:0;right:0;text-align:right;font-size:13px;color:#555}
        .logos{display:flex;justify-content:center;align-items:center;gap:15px;margin-bottom:10px}
        .logos img{width:70px;height:70px;object-fit:contain}
        .divider{width:2px;height:50px;background-color:#999}
        .header-title h1{margin:0;font-size:26px;font-weight:bold}
        .header-title h2{margin:5px 0;font-size:17px;color:#666}
        table{width:100%;border-collapse:collapse;margin-top:20px;font-size:14px}
        th{background-color:#1f2937;color:white;padding:12px}
        td{padding:10px;border:1px solid #ddd}
        tr:nth-child(even){background-color:#f9fafb}
        .status{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold}
        .removed{background:#fdecea;color:#c0392b}
        .available{background:#eafaf1;color:#27ae60}
        .footer{margin-top:40px;border-top:1px solid #ccc;padding-top:10px;font-size:12px;text-align:center;color:#777}
        tr{page-break-inside:avoid}
      </style></head><body>
      <div class="header">
        <div class="top-info"><div>اليوم: ${day}</div><div>التاريخ: ${date}</div></div>
        <div class="logos"><img src="Logo.jpeg"/><div class="divider"></div><img src="slogan.png"/></div>
        <div class="header-title"><h1>📚 مكتبة البلدية</h1><h2>تقرير إخراج الكتب</h2></div>
      </div>
      <table><thead><tr>
        <th>باركود</th><th>رقم التسلسل</th><th>عنوان الكتاب</th><th>المؤلف</th><th>الحالة</th>
      </tr></thead><tbody>
      ${data.map((row) => `<tr>
        <td>${row.barcode??""}</td>
        <td>${row.serialNumber??""}</td>
        <td>${row.title??""}</td>
        <td>${row.authors??""}</td>
        <td><span class="status ${row.status==="Removed"?"removed":"available"}">
          ${row.status==="Removed"?"مخرج":"متوفر"}
        </span></td>
      </tr>`).join("")}
      </tbody></table>
      <div class="footer">نظام إدارة المكتبة © ${today.getFullYear()}</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "باركود",
      field: "barcode",
      width: 160,
      minWidth: 140,
      tooltipField: "barcode"
    },
    {
      headerName: "رقم التسلسل",
      field: "serialNumber",
      width: 160,
      minWidth: 140,
      tooltipField: "serialNumber"
    },
    {
      headerName: "عنوان الكتاب",
      field: "title",
      flex: 2,
      minWidth: 250,
      tooltipField: "title",
    },
    {
      headerName: "اسم المؤلف",
      field: "authors",
      flex: 2,
      tooltipField: "authors",
      minWidth: 220,
      valueGetter: (params) => {
        const authors = params.data?.authors;
        if (typeof authors === "string") return authors;
        if (Array.isArray(authors)) return authors.map((a: any) => a.name).join(", ");
        return "";
      },
      tooltipValueGetter: (params) => {
        const authors = params.data?.authors;
        if (Array.isArray(authors)) return authors.map((a: any) => a.name).join(", ");
        return "";
      },
    },
    {
      headerName: "إجراء",
      width: 130,
      minWidth: 110,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      cellRenderer: (p: any) => {
        const removed = p.data?.status === "Removed" || p.data?.status === "مخرج";
        return removed ? (
          <span className="text-gray-400 text-xs">تم الإخراج</span>
        ) : (
          <button
            onClick={() => { setSelectedBook(p.data); setConfirmOpen(true); }}
            className="text-red-600 bg-red-50 p-1 rounded hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-foreground">إخراج كتاب</h2>
            <p className="text-muted-foreground text-sm mt-1">البحث عن الكتب وإخراجها من النظام</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-muted/40 p-4 rounded-xl border border-border">
          <Select value={searchType} onValueChange={(val) => { setSearchType(val); setSearchQuery(""); setBooks([]); setTotalRecords(0); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 bg-background"
              placeholder="اكتب قيمة البحث..."
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
          </div>

          <Button onClick={handleExportExcel} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <FileDown className="w-4 h-4 ml-1" /> تصدير
          </Button>
          <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
            <Printer className="w-4 h-4 ml-1" /> طباعة
          </Button>
        </div>

        <div className="space-y-0">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              جاري التحميل...
            </div>
          )}

          <div className="ag-theme-custom rounded-xl overflow-hidden shadow-gov-soft" style={{ height: 480 }}>
            <AgGridReact
              ref={gridRef}
              rowData={books}
              columnDefs={columnDefs}
              enableRtl={true}
              pagination={false}
              enableBrowserTooltips={true}
              suppressMovableColumns={true}
              suppressColumnMoveAnimation={true}
              defaultColDef={{
                flex: 1,
                resizable: true,
                sortable: true,
                filter: true,
                suppressMovable: true,
              }}
            />
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalRecords={totalRecords}
            pageSize={PAGE_SIZE}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>تأكيد الإخراج</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              الكتاب: <span className="font-semibold text-foreground">{selectedBook?.title}</span>
            </p>

            <Select value={reasonId?.toString()} onValueChange={(v) => setReasonId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="اختر السبب" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
              className="bg-background"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>إلغاء</Button>
            <Button onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? "جاري التأكيد..." : "تأكيد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteBooks;