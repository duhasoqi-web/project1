

import { useState, useMemo, useRef } from "react";
import { Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const sampleDeleteBooks = [
  { serial: 123456, title: "بيانات قواعد البيانات", author: "جوزيف ميرفي", barcode: "123456789" },
  { serial: 987654, title: "نظام إدارة قواعد البيانات", author: "جوزيف ميرفي", barcode: "987654321" },
];

const DeleteBooks = () => {
  const [books, setBooks] = useState(sampleDeleteBooks);
  const [searchType, setSearchType] = useState("barcode");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<typeof sampleDeleteBooks[0] | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const tableRef = useRef<HTMLDivElement>(null);

  // ✅ البحث الفعلي
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;

    return books.filter(book => {
      if (searchType === "barcode")
        return book.barcode.includes(searchQuery);
      if (searchType === "title")
        return book.title.includes(searchQuery);
      if (searchType === "serial")
        return book.serial.toString().includes(searchQuery);
      return false;
    });
  }, [books, searchQuery, searchType]);

  // ✅ حذف فعلي
  const handleDelete = () => {
    if (!selectedBook) return;
    setBooks(prev => prev.filter(b => b.serial !== selectedBook.serial));
    setConfirmOpen(false);
    setReason("");
    setNotes("");
  };


const handlePrint = () => {
  const rows = filteredBooks
    .map(
      (b) => `
        <tr>
          <td>${b.serial}</td>
          <td>${b.title}</td>
          <td>${b.author}</td>
          <td>${b.barcode}</td>
        </tr>
      `
    )
    .join("");

  const printWindow = window.open("", "", "width=900,height=700");

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>تقرير الكتب</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              direction: rtl;
              padding: 40px;
            }
            h2 {
              text-align: center;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 10px;
              text-align: center;
              font-size: 14px;
            }
            th {
              background: #f2f2f2;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h2>تقرير إخراج الكتب</h2>
          <table>
            <thead>
              <tr>
                <th>رقم التسلسل</th>
                <th>عنوان الكتاب</th>
                <th>المؤلف</th>
                <th>باركود الكتاب</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }
};



  const handleExportCSV = () => {
    const headers = ["رقم التسلسل", "عنوان الكتاب", "المؤلف", "باركود"];
    const rows = filteredBooks.map(b =>
      [b.serial, b.title, b.author, b.barcode].join(",")
    );

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "books.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const placeholder =
    searchType === "barcode"
      ? "أدخل باركود الكتاب"
      : searchType === "title"
      ? "أدخل عنوان الكتاب"
      : "أدخل الرقم التسلسلي";

  return (
    <div dir="rtl">
      <div className="mb-5">
        <h1 className="page-title flex items-center gap-3">
          إخراج كتاب من النظام
        </h1>
      </div>

   
      <div className="gov-card mb-6">
        <div className="gov-card-body">
          <h5 className="font-bold text-destructive mb-3">البحث عن كتاب للحذف</h5>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-end">
            <div>
              <label className="gov-label">طريقة البحث</label>
              <select
                className="gov-input w-full"
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
              >
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
              />
            </div>
            <button className="btn-gov-primary px-6 py-3">
              بحث
            </button>
          </div>
        </div>
      </div>


      <div className="gov-card overflow-hidden" ref={tableRef}>
        <div className="p-3 flex gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-gov-primary px-4 py-2 text-sm"
          >
            CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, hsl(142, 70%, 45%), hsl(155, 70%, 55%))",
            }}
          >
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
                <th className="px-4 py-3 text-right font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr
                  key={book.serial}
                  className="border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="px-4 py-3">{book.serial}</td>
                  <td className="px-4 py-3">{book.title}</td>
                  <td className="px-4 py-3">{book.author}</td>
                  <td className="px-4 py-3 font-mono">{book.barcode}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        setConfirmOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors"
                    >
                      إخراج
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

  
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive font-bold">
              تأكيد إخراج الكتاب
            </DialogTitle>
          </DialogHeader>

          <div dir="rtl" className="space-y-4">
            <p>
              هل أنت متأكد من إخراج الكتاب:
              <strong> "{selectedBook?.title}"</strong>؟
            </p>

            <div>
              <label className="gov-label">سبب الإخراج:</label>
              <select
                className="gov-input w-full"
                value={reason}
                onChange={e => setReason(e.target.value)}
              >
                <option value="" disabled>
                  اختر السبب
                </option>
                <option value="damaged">تالف</option>
                <option value="lost">مفقود</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="gov-label">قرار الإخراج:</label>
              <textarea
                className="gov-input w-full"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <DialogFooter className="flex justify-center gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors"
            >
              تأكيد الإخراج
            </button>

            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteBooks;
