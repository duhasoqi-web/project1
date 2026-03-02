import { useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Eye, Pencil, Copy, LibraryBig } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import BasicInfo from "@/components/steps/BasicInfo";
import Authors from "@/components/steps/Authors";
import Publishers from "@/components/steps/Publishers";
import Supplier from "@/components/steps/Supplier";

import type { ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const sampleBooks = [
  {
    id: 1,
    serial: "1001",
    classification: "001.1",
    suffix: "A",
    title: "العقل الباطن",
    author: "جوزيف ميرفي",
    publisher: "دار الشروق",
    publisherPlace: "القاهرة",
    publishDate: "2020",
    edition: "3",
    isbn: "1234567890",
    pages: "250",
    supplierName: "المكتبة الوطنية",
    supplyDate: "2020-05-10",
    price: "50 شيكل",
    status: "متوفر",
  },
];

export default function BooksAGGrid() {
  const gridRef = useRef<any>(null);

  const [rowData, setRowData] = useState(sampleBooks);
  const [mode, setMode] = useState<"view" | "edit" | "copy" | "part" | null>(null);
  const [activeBook, setActiveBook] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const updateData = (key: string, value: any) => {
    setActiveBook((prev: any) => ({ ...prev, [key]: value }));
  };


  const handleSave = () => {
    if (!activeBook) return;

    if (mode === "edit") {
      setRowData((prev) =>
        prev.map((b) => (b.id === activeBook.id ? activeBook : b))
      );
    } else {
      setRowData((prev) => [
        ...prev,
        { ...activeBook, id: Date.now() },
      ]);
    }

    setMode(null);
  };

  const columnDefs: ColDef[] = [
    { headerName: "#", valueGetter: "node.rowIndex + 1", width: 60 },

    { headerName: "رقم التسلسل", field: "serial" },
    { headerName: "رمز التصنيف", field: "classification" },
    { headerName: "عنوان الكتاب", field: "title" },
    { headerName: "المؤلف", field: "author" },
    { headerName: "الناشر", field: "publisher" },
    { headerName: "المزوّد", field: "supplierName" },
    { headerName: "الحالة", field: "status" },

    {
      headerName: "إجراءات",
      width: 160,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center gap-2">

          <button
            onClick={() => {
              setActiveBook({ ...params.data });
              setMode("view");
            }}
            className="icon-style bg-blue-50 text-blue-600"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => {
              setActiveBook({ ...params.data });
              setMode("edit");
              setActiveTab("basic");
            }}
            className="icon-style bg-green-50 text-green-600"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => {
              setActiveBook({
                ...params.data,
                serial: params.data.serial + "-C",
              });
              setMode("copy");
              setActiveTab("basic");
            }}
            className="icon-style bg-purple-50 text-purple-600"
          >
            <Copy size={16} />
          </button>

          <button
            onClick={() => {
              setActiveBook({
                ...params.data,
                serial: params.data.serial + "-P",
              });
              setMode("part");
              setActiveTab("basic");
            }}
            className="icon-style bg-orange-50 text-orange-600"
          >
            <LibraryBig size={16} />
          </button>
        </div>
      ),
    },
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
    filter: true,
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">

      <style>{`
        .icon-style {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: 0.2s;
        }
        .icon-style:hover {
          transform: scale(1.08);
        }
      `}</style>

      <h1 className="text-2xl font-bold text-right">📖 إدارة الكتب</h1>

      <div className="ag-theme-alpine rounded-2xl shadow-lg border h-[550px] overflow-hidden">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={10}
          enableRtl={true}
        />
      </div>

      <Dialog open={!!mode} onOpenChange={() => setMode(null)}>
        <DialogContent dir="rtl" className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">

          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {mode === "view" && "📖 عرض بيانات الكتاب"}
              {mode === "edit" && "✏️ تعديل الكتاب"}
              {mode === "copy" && "➕ إضافة نسخة"}
              {mode === "part" && "📚 إضافة جزء"}
            </DialogTitle>
          </DialogHeader>
       {mode === "view" && activeBook && (
  <div className="space-y-6">

    {/* ================= المعلومات الأساسية ================= */}
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h3 className="font-bold text-base mb-4 border-b pb-2">
        📘 المعلومات الأساسية
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">

        <div><strong>رقم التسلسل:</strong> {activeBook.serial}</div>
        <div><strong>رمز التصنيف:</strong> {activeBook.classification}</div>
        <div><strong>العنوان:</strong> {activeBook.title}</div>
        <div><strong>الطبعة:</strong> {activeBook.edition}</div>
        <div><strong>ISBN:</strong> {activeBook.isbn}</div>
        <div><strong>عدد الصفحات:</strong> {activeBook.pages}</div>
        <div><strong>الحالة:</strong> {activeBook.status}</div>

      </div>
    </div>

    {/* ================= المؤلفون ================= */}
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h3 className="font-bold text-base mb-4 border-b pb-2">
        ✍️ المؤلفون
      </h3>

      <div className="text-sm">
        {activeBook.author
          ? activeBook.author
          : "لا يوجد مؤلف مسجل"}
      </div>
    </div>

    {/* ================= الناشرون ================= */}
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h3 className="font-bold text-base mb-4 border-b pb-2">
        🏢 الناشرون
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><strong>اسم الناشر:</strong> {activeBook.publisher}</div>
        <div><strong>مكان النشر:</strong> {activeBook.publisherPlace}</div>
        <div><strong>تاريخ النشر:</strong> {activeBook.publishDate}</div>
      </div>
    </div>

    {/* ================= المزوّد ================= */}
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h3 className="font-bold text-base mb-4 border-b pb-2">
        🚚 بيانات المزوّد
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><strong>اسم المزوّد:</strong> {activeBook.supplierName}</div>
        <div><strong>تاريخ التوريد:</strong> {activeBook.supplyDate}</div>
        <div><strong>السعر:</strong> {activeBook.price}</div>
      </div>
    </div>

  </div>
)}
          {(mode === "edit" || mode === "copy" || mode === "part") && activeBook && (
            <div className="space-y-6">
              <div className="flex gap-2 border-b pb-3">
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
                      activeTab === tab.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "basic" && (
                <BasicInfo formData={activeBook} updateData={updateData} />
              )}
              {activeTab === "authors" && (
                <Authors formData={activeBook} updateData={updateData} />
              )}
              {activeTab === "publishers" && (
                <Publishers formData={activeBook} updateData={updateData} />
              )}
              {activeTab === "supplier" && (
                <Supplier formData={activeBook} updateData={updateData} />
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMode(null)}
                  className="px-4 py-2 rounded-xl border bg-gray-100"
                >
                  إلغاء
                </button>

                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                >
                  💾 حفظ
                </button>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}