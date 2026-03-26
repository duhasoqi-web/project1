import { useState, useCallback, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Search,
  Printer,
  FileDown,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import type { ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Book {
  bookID: number;
  barcode: string;
  serialNumber: string;
  title: string;
  authors: string;
  status?: string; 
}

interface RemoveReason {
  id: number;
  name: string;
}

const API_BASE = "https://localhost:8080/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const SEARCH_TYPES = [
  { value: "title", label: "العنوان" },
  { value: "authorName", label: "المؤلف" },
  { value: "serialNumber", label: "رقم التسلسل" },
  { value: "classificationCode", label: "رمز التصنيف" },
  { value: "isbn", label: "ISBN" },
  { value: "barcode", label: "باركود" },
];

const DeleteBooks = () => {
  const gridRef = useRef<any>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [searchType, setSearchType] = useState("title");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [reasonId, setReasonId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [withdrawing, setWithdrawing] = useState(false);

  const [reasons, setReasons] = useState<RemoveReason[]>([]);

  const fetchReasons = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/RemoveReason`, {
        method: "GET",
        headers: authHeaders(),
      });

      const data = await res.json();

      const mapped = (data ?? []).map((r: any) => ({
        id: r.removeReasonID,
        name: r.removeReasonName,
      }));

      setReasons(mapped);
    } catch {
      toast.error("فشل تحميل أسباب الإخراج");
    }
  }, []);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  const doSearch = useCallback(async (query: string, type: string) => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/Book/search`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ [type]: query }),
      });

      const data = await res.json();

      const result = (data.data ?? data ?? []).map((b: any) => ({
        bookID: b.bookID ?? b.bookId,
        barcode: b.barcode ?? (b.serialNumber ? `0000${b.serialNumber}00001` : ""),
        serialNumber: b.serialNumber ?? "",
        title: b.title ?? "",
        authors: b.authors ?? "",
        status: b.status ?? b.bookStatus, 
      }));

      setBooks(result);
    } catch {
      toast.error("فشل البحث");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.warning("أدخل قيمة البحث");
      return;
    }
    doSearch(searchQuery, searchType);
  };

  const handleWithdraw = useCallback(async () => {
    if (!selectedBook || !reasonId) {
      toast.warning("اختر سبب الإخراج");
      return;
    }

    setWithdrawing(true);

    try {
      const res = await fetch(`${API_BASE}/Book`, {
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
        prev.map((b) =>
          b.bookID === selectedBook.bookID
            ? { ...b, status: "Removed" } 
            : b
        )
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

  const handleExportCSV = () => {
    if (!gridRef.current) return;

    gridRef.current.api.exportDataAsCsv({
      fileName: "books.csv",
      columnKeys: [
        "barcode",
        "serialNumber",
        "classificationCode",
        "title",
        "authors",
      ],
    });
  };

  const handlePrint = () => {
    if (!gridRef.current) return;

    const api = gridRef.current.api;
    const data: Book[] = [];

    api.forEachNodeAfterFilterAndSort((node: any) => {
      data.push(node.data);
    });

    const win = window.open("", "", "width=1100,height=700");
    if (!win) return;

    win.document.write(`
      <html dir="rtl">
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
          th { background: #eee; }
        </style>
      </head>
      <body>
        <h2>قائمة الكتب المخرجة</h2>
        <table>
          <tr>
            <th>باركود</th>
            <th>رقم التسلسل</th>
            <th>عنوان الكتاب</th>
            <th> اسم المؤلف</th>
            <th>الاجراء</th>
          </tr>
          ${data.map(r => `
            <tr>
              <td>${r.barcode}</td>
              <td>${r.serialNumber}</td>
              <td>${r.title}</td>
              <td>${r.authors}</td>
              <td>${r.status}</td>
            </tr>
          `).join("")}
        </table>
      </body>
      </html>
    `);

    win.document.close();
    win.print();
  };
const columnDefs: ColDef[] = [
  {
    headerName: "باركود",
    field: "barcode",
    width: 160,
    minWidth: 140,
  },
  {
    headerName: "رقم التسلسل",
    field: "serialNumber",
    width: 160,
    minWidth: 140,
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
    width: 140,
    minWidth: 120,
    
    sortable: false,
    filter: false,
    cellRenderer: (p: any) => {
      const removed =
        p.data?.status === "Removed" ||
        p.data?.status === "مخرج";

      return removed ? (
        <span className="text-gray-500 text-xs">تم الإخراج</span>
      ) : (
        <button
          onClick={() => {
            setSelectedBook(p.data);
            setConfirmOpen(true);
          }}
          className="text-red-600 bg-red-50 p-1 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      );
    },
  },
];
  return (
    <div className="p-6 space-y-4" dir="rtl">
      <h2 className="text-2xl font-bold">إخراج كتاب</h2>

      <div className="flex gap-2">
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <Button variant="outline" onClick={handleExportCSV}>
          <FileDown className="w-4 h-4 ml-1" />
          تصدير
        </Button>

        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 ml-1" />
          طباعة
        </Button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 600 }}>
        <AgGridReact
          ref={gridRef}
          rowData={books}
          columnDefs={columnDefs}
          enableRtl={true}
          pagination
        />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الإخراج</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p>الكتاب: {selectedBook?.title}</p>

            <Select
              value={reasonId?.toString()}
              onValueChange={(v) => setReasonId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر السبب" />
              </SelectTrigger>

              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              إلغاء
            </Button>

            <Button onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ?"التاكيد جاري..." : "تأكيد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteBooks;