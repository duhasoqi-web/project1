import { useState, useCallback } from "react";
import { Search, Printer, FileDown, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ===== API Configuration =====
// Replace these with your actual API endpoints
const API_BASE_URL = ""; // e.g. "https://your-api.com/api"
const API_ENDPOINTS = {
  searchBooks: `${API_BASE_URL}/books/search`,        // GET ?type=barcode&query=123 → returns books array
  withdrawBook: `${API_BASE_URL}/books/withdraw`,      // POST { bookId, reason, notes } → moves to withdrawn table & sets state=مخرج
};

interface Book {
  id: number;
  serial: number;
  title: string;
  author: string;
  barcode: string;
  state?: string;
}

// ===== بيانات تجريبية - قم بحذفها بعد ربط الـ API =====
const SAMPLE_BOOKS: Book[] = [
  { id: 1, serial: 102456, title: "مقدمة في علم الحاسوب", author: "أحمد محمد علي", barcode: "9789957001" },
  { id: 2, serial: 203789, title: "أساسيات قواعد البيانات", author: "خالد عبدالله", barcode: "9789957002" },
];

const DeleteBooks = () => {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState("barcode");
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>(SAMPLE_BOOKS);
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const placeholder = searchType === "barcode" ? "أدخل باركود الكتاب" :
    searchType === "title" ? "أدخل عنوان الكتاب" : "أدخل الرقم التسلسلي";

  // ===== Search books via API =====
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast({ title: "تنبيه", description: "الرجاء إدخال قيمة للبحث", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.searchBooks}?type=${searchType}&query=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("فشل في البحث");
      const data: Book[] = await res.json();
      setBooks(data);
      if (data.length === 0) {
        toast({ title: "لا توجد نتائج", description: "لم يتم العثور على كتب مطابقة" });
      }
    } catch (err) {
      console.error("Search error:", err);
      toast({ title: "خطأ", description: "فشل الاتصال بالخادم، تأكد من إعداد الـ API", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchType, searchQuery, toast]);

  // ===== Withdraw book via API =====
  const handleWithdraw = useCallback(async () => {
    if (!selectedBook || !reason) {
      toast({ title: "تنبيه", description: "الرجاء اختيار سبب الإخراج", variant: "destructive" });
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch(API_ENDPOINTS.withdrawBook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook.id,
          serial: selectedBook.serial,
          reason,
          notes,
        }),
      });
      if (!res.ok) throw new Error("فشل في إخراج الكتاب");
      // Update local state: mark as withdrawn
      setBooks(prev => prev.map(b =>
        b.id === selectedBook.id ? { ...b, state: "مخرج" } : b
      ));
      toast({ title: "تم بنجاح", description: `تم إخراج الكتاب "${selectedBook.title}" وتحويله إلى جدول الكتب المخرجة` });
      setConfirmOpen(false);
      setReason("");
      setNotes("");
      setSelectedBook(null);
    } catch (err) {
      console.error("Withdraw error:", err);
      toast({ title: "خطأ", description: "فشل في إخراج الكتاب، تأكد من إعداد الـ API", variant: "destructive" });
    } finally {
      setWithdrawing(false);
    }
  }, [selectedBook, reason, notes, toast]);

  // ===== Export CSV =====
  const handleCSV = useCallback(() => {
    if (books.length === 0) {
      toast({ title: "تنبيه", description: "لا توجد بيانات للتصدير" });
      return;
    }
    const headers = ["رقم التسلسل", "عنوان الكتاب", "المؤلف", "باركود الكتاب", "الحالة"];
    const rows = books.map(b => [b.serial, b.title, b.author, b.barcode, b.state || "فعّال"]);
    const bom = "\uFEFF";
    const csv = bom + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "books_withdraw.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [books, toast]);

  // ===== Print =====
  const handlePrint = useCallback(() => {
    if (books.length === 0) {
      toast({ title: "تنبيه", description: "لا توجد بيانات للطباعة" });
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const tableRows = books.map(b => `
      <tr>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${b.serial}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${b.title}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${b.author}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;font-family:monospace;">${b.barcode}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${b.state || "فعّال"}</td>
      </tr>
    `).join("");
    printWindow.document.write(`
      <html dir="rtl"><head><title>طباعة - إخراج الكتب</title>
      <style>body{font-family:'Cairo',sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background:#1a365d;color:#fff;padding:10px;text-align:right;border:1px solid #ccc}
      h2{color:#1a365d;text-align:center}</style></head>
      <body><h2>تقرير إخراج الكتب</h2>
      <table><thead><tr><th>رقم التسلسل</th><th>عنوان الكتاب</th><th>المؤلف</th><th>باركود الكتاب</th><th>الحالة</th></tr></thead>
      <tbody>${tableRows}</tbody></table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [books, toast]);

  return (
    <div dir="rtl">
      <div className="mb-5">
        <h1 className="page-title flex items-center gap-3">
          إخراج كتاب من النظام
        </h1>
      </div>

      {/* Search Filter */}
      <div className="gov-card mb-6">
        <div className="gov-card-body">
          <h5 className="font-bold text-destructive mb-3">البحث عن كتاب للإخراج</h5>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-end">
            <div>
              <label className="gov-label">طريقة البحث</label>
              <select className="gov-input w-full" value={searchType} onChange={e => setSearchType(e.target.value)}>
                <option value="barcode">باركود</option>
                <option value="title">العنوان</option>
                <option value="serial">الرقم التسلسلي</option>
              </select>
            </div>
            <div>
              <label className="gov-label">القيمة</label>
              <input
                type="text"
                className="gov-input w-full"
                placeholder={placeholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button className="btn-gov-primary px-6 py-3 flex items-center gap-2" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              بحث
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="gov-card overflow-hidden">
        <div className="p-3 flex gap-2">
          <button className="btn-gov-primary px-4 py-2 text-sm flex items-center gap-1" onClick={handleCSV}>
            <FileDown className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground flex items-center gap-1"
            style={{ background: "linear-gradient(135deg, hsl(142, 70%, 45%), hsl(155, 70%, 55%))" }}
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 border-b border-border">
                <th className="px-4 py-3 text-right font-bold">رقم التسلسل</th>
                <th className="px-4 py-3 text-right font-bold">عنوان الكتاب</th>
                <th className="px-4 py-3 text-right font-bold">المؤلف</th>
                <th className="px-4 py-3 text-right font-bold">باركود الكتاب</th>
                <th className="px-4 py-3 text-right font-bold">الحالة</th>
                <th className="px-4 py-3 text-right font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    ابحث عن كتاب لعرض النتائج
                  </td>
                </tr>
              ) : (
                books.map(book => (
                  <tr key={book.id || book.serial} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="px-4 py-3">{book.serial}</td>
                    <td className="px-4 py-3">{book.title}</td>
                    <td className="px-4 py-3">{book.author}</td>
                    <td className="px-4 py-3 font-mono">{book.barcode}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        book.state === "مخرج"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {book.state || "فعّال"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {book.state === "مخرج" ? (
                        <span className="text-xs text-muted-foreground">تم الإخراج</span>
                      ) : (
                        <button
                          onClick={() => { setSelectedBook(book); setConfirmOpen(true); }}
                          className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors"
                        >
                          إخراج
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive font-bold">تأكيد إخراج الكتاب</DialogTitle>
          </DialogHeader>
          <div dir="rtl" className="space-y-4">
            <p>هل أنت متأكد من إخراج الكتاب: <strong>"{selectedBook?.title}"</strong>؟</p>
            <p className="text-sm text-muted-foreground">
              سيتم تغيير حالة الكتاب إلى "مخرج" في جدول الكتب، وسيتم نقله إلى جدول الكتب المخرجة.
            </p>
            <div>
              <label className="gov-label">سبب الإخراج:</label>
              <select className="gov-input w-full" value={reason} onChange={e => setReason(e.target.value)} required>
                <option value="" disabled>اختر السبب</option>
                <option value="damaged">تالف</option>
                <option value="lost">مفقود</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <label className="gov-label">قرار الإخراج:</label>
              <textarea className="gov-input w-full" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="أدخل ملاحظات إضافية..."></textarea>
            </div>
          </div>
          <DialogFooter className="flex justify-center gap-2">
            <button
              onClick={handleWithdraw}
              disabled={withdrawing || !reason}
              className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {withdrawing && <Loader2 className="w-4 h-4 animate-spin" />}
              تأكيد الإخراج
            </button>
            <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition-colors">
              إلغاء
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteBooks;
