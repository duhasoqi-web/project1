import { BookOpen, User, Building, Truck } from "lucide-react";

interface ReviewProps {
  formData: Record<string, any>;
}

function ReviewSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: { label: string; value: string | undefined }[];
}) {
  const hasData = items.some((item) => item.value && item.value !== "—");
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        {items.map((item, idex) => (
          <div key={idex} className="flex gap-2">
            <span className="font-medium text-muted-foreground">{item.label}:</span>
            <span className="text-foreground">{item.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Review({ formData }: ReviewProps) {
  const authors = (formData.authors || [])
    .map((a: any) => `${a.name || "—"} (${a.role || "—"}) - ${a.attribute || "—"}`)
    .join("، ");

  const subTitles = (formData.subTitles || [])
    .map((s: any) => `${s.title || "—"} (${s.type || "—"})`)
    .join("، ");

  const pub = formData.publisher_data || {};
  const sup = formData.supplier_data || {};

  return (
    <div className="animate-fade-in space-y-4">
      <h3 className="text-lg font-semibold text-foreground">مراجعة البيانات</h3>
      <p className="text-sm text-muted-foreground">تأكد من صحة جميع البيانات قبل الحفظ</p>

      <div className="space-y-3">
        <ReviewSection
          title="المعلومات الأساسية"
          icon={BookOpen}
          items={[
            { label: "عنوان الكتاب", value: formData.bookTitle },
            { label: "رقم التسلسل", value: formData.serialNumber },
            { label: "رمز التصنيف", value: formData.classificationCode },
            { label: "اللاحقة", value: formData.suffix },
            { label: "نوع المادة", value: formData.bibliographicLevel },
            { label: "الأبعاد", value: formData.dimensions },
            { label: "العناوين الفرعية", value: subTitles || undefined },
            { label: "رأس الموضوع", value: formData.subjectHeading },
            { label: "المستخلص", value: formData.bookAbstract },
            { label: "الإيضاحات", value: formData.explanations },
          ]}
        />

        <ReviewSection
          title="المؤلفون"
          icon={User}
          items={[{ label: "المؤلفون", value: authors || undefined }]}
        />

        <ReviewSection
          title="الناشر"
          icon={Building}
          items={[
            { label: "اسم الناشر", value: pub.name },
            { label: "مكان النشر", value: pub.place },
            { label: "تاريخ النشر", value: pub.date },
            { label: "الطبعة", value: pub.edition },
            { label: "ISBN", value: pub.isbn },
            { label: "رقم الإيداع", value: pub.deposit },
            { label: "عدد الصفحات", value: pub.pages },
            { label: "السلسلة", value: pub.series },
            { label: "الأجزاء", value: pub.parts },
            { label: "السلسلة الفرعية", value: pub.subSeries },
            { label: "ملاحظة بيبليوغرافية", value: pub.bibliography },
          ]}
        />

        <ReviewSection
          title="المزوّد"
          icon={Truck}
          items={[
            { label: "اسم المزود", value: sup.name },
            { label: "تاريخ التزويد", value: sup.date },
            { label: "طريقة التزويد", value: sup.method },
            ...(sup.method === "شراء"
              ? [{ label: "السعر", value: sup.price ? `${sup.price} ${sup.currency || ""}` : undefined }]
              : []),
            { label: "ملاحظات", value: sup.notes },
          ]}
        />
      </div>
    </div>
  );
}
