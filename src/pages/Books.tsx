import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const sampleBooks = [
  { id: 1, serial: "1001", classification: "001.1", suffix: "A", title: "العقل الباطن", material: "كتاب", dimensions: "20x15 سم", authors: [{ name: "جوزيف ميرفي", role: "رئيسي", type: "شخص" }], titles: [{ title: "العنوان الرئيسي", type: "رئيسي" }, { title: "العنوان الفرعي", type: "فرعي" }], publishers: [{ name: "دار الشروق", place: "القاهرة", publishDate: "2020", edition: "3", isbn: "1234567890", deposit: "123", pages: "250", series: "سلسلة التنمية البشرية", seriesPart: "3", subSeries: "سلسلة التنمية البشرية", subSeriesPart: "3" }], supplier: { name: "المكتبة الوطنية", supplyDate: "2020-05-10", supplyMethod: "شراء", price: "50", currency: "شيكل", notes: "نسخة أصلية بحالة ممتازة" }, status: "متوفر" },
  // إضافة كتب إضافية حسب الحاجة
];

const BookEditPage = () => {
  const [viewBook, setViewBook] = useState<any>(null);
  const [editBook, setEditBook] = useState<any>(null);
  const [editTab, setEditTab] = useState("basic");

  // القوائم
  const [materials, setMaterials] = useState(["كتاب", "مرجع", "مجموعة"]);
  const [suppliers, setSuppliers] = useState(["المكتبة الوطنية", "دار الشروق", "مكتبة الكتب"]);

  // دالة لإضافة عنصر لقائمة مع منع التكرار
  const addToList = (list: string[], setList: any, message: string) => {
    const value = prompt(message);
    if (!value) return;
    if (list.includes(value)) {
      alert("القيمة موجودة مسبقاً!");
      return;
    }
    setList([...list, value]);
  };

  return (
    <div dir="rtl" className="p-4 space-y-6">

      <h1 className="text-2xl font-bold mb-4">📖 إدارة الكتب</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th>#</th><th>رقم التسلسل</th><th>رمز التصنيف</th><th>عنوان الكتاب</th><th>الحالة</th><th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sampleBooks.map((book, i) => (
              <tr key={book.id} className="border-b hover:bg-gray-50">
                <td>{i + 1}</td>
                <td>{book.serial}</td>
                <td>{book.classification}</td>
                <td>{book.title}</td>
                <td>{book.status}</td>
                <td className="flex gap-2">
                  <button onClick={() => setViewBook(book)} title="عرض"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => { setEditBook(book); setEditTab("basic"); }} title="تعديل"><Pencil className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Dialog open={!!viewBook} onOpenChange={() => setViewBook(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>📖 عرض تفاصيل الكتاب</DialogTitle></DialogHeader>
          {viewBook && (
            <div className="space-y-4">
              <div><strong>رقم التسلسل:</strong> {viewBook.serial}</div>
              <div><strong>رمز التصنيف:</strong> {viewBook.classification}</div>
              <div><strong>عنوان الكتاب:</strong> {viewBook.title}</div>
              <div><strong>نوع المادة:</strong> {viewBook.material}</div>
              <div><strong>المؤلفون:</strong> {viewBook.authors.map((a:any)=>a.name).join(", ")}</div>
              <div><strong>العناوين:</strong> {viewBook.titles.map((t:any)=>`${t.title} (${t.type})`).join(", ")}</div>
              <div><strong>الناشرون:</strong> {viewBook.publishers.map((p:any)=>p.name).join(", ")}</div>
              <div><strong>المزود:</strong> {viewBook.supplier.name} - {viewBook.supplier.supplyMethod} - {viewBook.supplier.price && `${viewBook.supplier.price} ${viewBook.supplier.currency}`}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editBook} onOpenChange={() => setEditBook(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>✏️ تعديل الكتاب</DialogTitle></DialogHeader>
          {editBook && (
            <div dir="rtl" className="space-y-4">

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {["basic","authors","publishers","supplier","review"].map(tab => (
                  <button key={tab} className={`px-3 py-1 rounded ${editTab===tab?'bg-blue-500 text-white':'bg-gray-200'}`} onClick={()=>setEditTab(tab)}>
                    {tab==="basic"?"المعلومات الأساسية":tab==="authors"?"المؤلفون":tab==="publishers"?"الناشرون":tab==="supplier"?"المزوّد":"مراجعة"}
                  </button>
                ))}
              </div>

              {/* Basic Info */}
              {editTab==="basic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="رقم التسلسل" className="gov-input" value={editBook.serial} onChange={(e)=>setEditBook({...editBook, serial:e.target.value})}/>
                  <input type="text" placeholder="رمز التصنيف" className="gov-input" value={editBook.classification} onChange={(e)=>setEditBook({...editBook, classification:e.target.value})}/>
                  <input type="text" placeholder="اللاحقة" className="gov-input" value={editBook.suffix} onChange={(e)=>setEditBook({...editBook, suffix:e.target.value})}/>
                  <input type="text" placeholder="عنوان الكتاب" className="gov-input md:col-span-2" value={editBook.title} onChange={(e)=>setEditBook({...editBook, title:e.target.value})}/>

                  <label>نوع المادة</label>
                  <div className="flex gap-2">
                    <select className="gov-input flex-1" value={editBook.material} onChange={(e)=>setEditBook({...editBook, material:e.target.value})}>
                      {materials.map(m=><option key={m}>{m}</option>)}
                    </select>
                    <button onClick={()=>addToList(materials,setMaterials,"أدخل نوع مادة جديد")}>+</button>
                  </div>
                </div>
              )}

              {/* Authors Tab */}
              {editTab==="authors" && (
                <div>
                  {editBook.authors.map((a:any,i:number)=>(
                    <div key={i} className="flex gap-2 mb-2">
                      <select value={a.role} onChange={(e)=>{const newA=[...editBook.authors]; newA[i].role=e.target.value; setEditBook({...editBook, authors:newA});}}>
                        <option>رئيسي</option><option>مساعد</option><option>مترجم</option>
                      </select>
                      <input className="gov-input flex-1" value={a.name} onChange={(e)=>{const newA=[...editBook.authors]; newA[i].name=e.target.value; setEditBook({...editBook, authors:newA});}}/>
                      <select value={a.type} onChange={(e)=>{const newA=[...editBook.authors]; newA[i].type=e.target.value; setEditBook({...editBook, authors:newA});}}>
                        <option>شخص</option><option>هيئة</option><option>ملتقى</option>
                      </select>
                    </div>
                  ))}
                  <button onClick={()=>setEditBook({...editBook, authors:[...editBook.authors,{name:"",role:"رئيسي",type:"شخص"}]})}>+ إضافة مؤلف</button>
                </div>
              )}

              {/* Publishers Tab */}
              {editTab==="publishers" && (
                <div>
                  {editBook.publishers.map((p:any,i:number)=>(
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 border p-2 rounded">
                      <input type="text" placeholder="اسم الناشر" className="gov-input" value={p.name} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].name=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="مكان النشر" className="gov-input" value={p.place} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].place=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="تاريخ النشر" className="gov-input" value={p.publishDate} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].publishDate=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="الطبعة" className="gov-input" value={p.edition} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].edition=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="ISBN" className="gov-input" value={p.isbn} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].isbn=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="رقم الإيداع" className="gov-input" value={p.deposit} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].deposit=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="عدد الصفحات" className="gov-input" value={p.pages} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].pages=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="السلسلة" className="gov-input" value={p.series} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].series=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="الجزء" className="gov-input" value={p.seriesPart} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].seriesPart=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="السلسلة الفرعية" className="gov-input" value={p.subSeries} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].subSeries=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                      <input type="text" placeholder="الجزء الفرعي" className="gov-input" value={p.subSeriesPart} onChange={(e)=>{const newP=[...editBook.publishers]; newP[i].subSeriesPart=e.target.value; setEditBook({...editBook, publishers:newP});}}/>
                    </div>
                  ))}
                  <button onClick={()=>setEditBook({...editBook, publishers:[...editBook.publishers,{name:"",place:"",publishDate:"",edition:"",isbn:"",deposit:"",pages:"",series:"",seriesPart:"",subSeries:"",subSeriesPart:""}]})}>+ إضافة ناشر</button>
                </div>
              )}

              {/* Supplier Tab */}
              {editTab==="supplier" && (
                <div>
                  <div className="flex gap-2 mb-2">
                    <select value={editBook.supplier.name} onChange={(e)=>setEditBook({...editBook, supplier:{...editBook.supplier,name:e.target.value}})}>
                      {suppliers.map(s=><option key={s}>{s}</option>)}
                    </select>
                    <button onClick={()=>addToList(suppliers,setSuppliers,"أدخل اسم مزود جديد")}>+</button>
                  </div>
                  <input type="date" className="gov-input mb-2" value={editBook.supplier.supplyDate} onChange={(e)=>setEditBook({...editBook,supplier:{...editBook.supplier,supplyDate:e.target.value}})}/>
                  <select className="gov-input mb-2" value={editBook.supplier.supplyMethod} onChange={(e)=>setEditBook({...editBook,supplier:{...editBook.supplier,supplyMethod:e.target.value}})}>
                    <option>شراء</option><option>إهداء</option><option>تبادل</option>
                  </select>
                  {editBook.supplier.supplyMethod==="شراء" && (
                    <div className="flex gap-2 mb-2">
                      <input type="number" className="gov-input flex-1" value={editBook.supplier.price} onChange={(e)=>setEditBook({...editBook,supplier:{...editBook.supplier,price:e.target.value}})}/>
                      <select className="gov-input" value={editBook.supplier.currency} onChange={(e)=>setEditBook({...editBook,supplier:{...editBook.supplier,currency:e.target.value}})}>
                        {["شيكل","دينار","دولار"].map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <textarea className="gov-input w-full" rows={3} placeholder="ملاحظات" value={editBook.supplier.notes} onChange={(e)=>setEditBook({...editBook,supplier:{...editBook.supplier,notes:e.target.value}})}></textarea>
                </div>
              )}

              {/* Review Tab */}
              {editTab==="review" && (
                <div className="text-center py-8 text-gray-500">راجع البيانات ثم اضغط حفظ</div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button className="gov-input" onClick={()=>setEditBook(null)}>إغلاق</button>
                <button className="btn-gov-primary">💾 حفظ التعديلات</button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BookEditPage;
