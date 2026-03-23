interface ReviewProps {
  formData: Record<string, any>;
  // ✅ مضاف: تمرير الأسماء من الصفحات الثانية
  materialTypes?: { id: number; name: string }[];
  authorRoles?: { id: number; name: string }[];
  authorTypes?: { id: number; name: string }[];
  subtitleTypes?: { id: number; name: string }[];
}

export default function Review({
  formData,
  materialTypes = [],
  authorRoles = [],
  authorTypes = [],
  subtitleTypes = [],
}: ReviewProps) {
  const pub = formData.publishers || {};
  const series = formData.series || {};
  const supplies = formData.supplies || {};
  const authors = formData.authors || [];
  const subtitles = formData.subtitles || [];

  // ✅ Helper للبحث عن الاسم بالـ ID
  const getName = (list: { id: number; name: string }[], id: number | null) =>
    list.find((item) => item.id === id)?.name || id || "—";

  return (
    <div className="space-y-6" dir="rtl">
      <h3 className="text-lg font-semibold">مراجعة البيانات</h3>

      {/* 📘 المعلومات الأساسية */}
      <div className="border rounded-xl p-4 space-y-2 bg-blue-100">
        <h4 className="font-semibold text-primary">📘 المعلومات الأساسية</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>رقم التسلسل:</strong> {formData.serialNumber || "—"}</p>
          <p><strong>رمز التصنيف:</strong> {formData.classificationCode || "—"}</p>
          <p><strong>اللاحقة:</strong> {formData.suffix || "—"}</p>
          <p><strong>عنوان الكتاب:</strong> {formData.title || "—"}</p>
          <p><strong>الأبعاد:</strong> {formData.dimensions || "—"}</p>
          {/* ✅ كان بيعرض الـ ID، هلأ بيعرض الاسم */}
          <p><strong>نوع المادة:</strong> {getName(materialTypes, formData.materialTypeID)}</p>
          <p><strong>رأس الموضوع:</strong> {formData.subjectHeading || "—"}</p>
          <p><strong>ISBN:</strong> {formData.isbn || "—"}</p>
          <p><strong>عدد الصفحات:</strong> {formData.numberOfPages || "—"}</p>
          <p><strong>المستخلص:</strong> {formData.abstract || "—"}</p>
          <p><strong>الإيضاحات:</strong> {formData.illustrations || "—"}</p>
          <p><strong>الملاحظة البيبليوغرافية:</strong> {formData.bibliographicNote || "—"}</p>
          {/* ✅ مضاف */}
          {formData.bookType && (
            <p><strong>نوع الكتاب:</strong> {formData.bookType}</p>
          )}
          {formData.parentBookID && (
            <p><strong>الكتاب الأب:</strong> {formData.parentBookID}</p>
          )}
        </div>

        {subtitles.length > 0 && (
          <div className="mt-2">
            <strong className="text-sm">العناوين الفرعية:</strong>
            <ul className="list-disc list-inside mt-1">
              {subtitles.map((s: any, i: number) => (
                <li key={i} className="text-sm">
                  {s.subtitle || "—"}
                  {/* ✅ مضاف: عرض نوع العنوان الفرعي */}
                  {s.subtitleTypeID && (
                    <span className="text-muted-foreground mr-1">
                      ({getName(subtitleTypes, s.subtitleTypeID)})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ✍️ المؤلفون */}
      <div className="border rounded-xl p-4 space-y-2 bg-blue-100">
        <h4 className="font-semibold text-primary">✍️ المؤلفون</h4>
        {authors.length > 0 ? (
          authors.map((a: any, i: number) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-sm">
              <p><strong>مؤلف {i + 1}:</strong> {a.name || "—"}</p>
              {/* ✅ كان بيعرض الـ ID، هلأ بيعرض الاسم */}
              <p><strong>الدور:</strong> {getName(authorRoles, a.authorRoleID)}</p>
              <p><strong>الصفة:</strong> {getName(authorTypes, a.authorTypeID)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">لا يوجد مؤلفون</p>
        )}
      </div>

      {/* 🏢 الناشر */}
      <div className="border rounded-xl p-4 space-y-2 bg-blue-100">
        <h4 className="font-semibold text-primary">🏢 الناشر</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>اسم الناشر:</strong> {pub.name || "—"}</p>
          <p><strong>مكان النشر:</strong> {pub.place || "—"}</p>
          <p><strong>سنة النشر:</strong> {pub.year || "—"}</p>
          <p><strong>الطبعة:</strong> {pub.edition || "—"}</p>
          <p><strong>رقم الإيداع:</strong> {pub.depositNumber || "—"}</p>
        </div>
      </div>

      {/* 📚 السلسلة */}
      <div className="border rounded-xl p-4 space-y-2 bg-blue-100">
        <h4 className="font-semibold text-primary">📚 السلسلة</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>السلسلة:</strong> {series.title || "—"}</p>
          <p><strong>رقم الجزء:</strong> {series.partNumber || "—"}</p>
          <p><strong>عدد الأجزاء:</strong> {series.partCount || "—"}</p>
          <p><strong>ملاحظة:</strong> {series.note || "—"}</p>
          <p><strong>السلسلة الفرعية:</strong> {series.subSeriesTitle || "—"}</p>
          <p><strong>رقم جزء السلسلة الفرعية:</strong> {series.subSeriesPartNumber || "—"}</p>
        </div>
      </div>

      {/* 🚚 المزوّد */}
      <div className="border rounded-xl p-4 space-y-2 bg-blue-100">
        <h4 className="font-semibold text-primary">🚚 المزوّد</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>الاسم:</strong> {supplies.name || "—"}</p>
          <p><strong>التاريخ:</strong> {supplies.supplyDate || "—"}</p>
          <p><strong>الطريقة:</strong> {supplies.supplyMethod || "—"}</p>
          <p><strong>السعر:</strong> {supplies.price || "—"}</p>
          <p><strong>العملة:</strong> {supplies.currency || "—"}</p>
          <p><strong>ملاحظات:</strong> {supplies.note || "—"}</p>
        </div>
      </div>
    </div>
  );
}