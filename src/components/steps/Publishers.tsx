import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Publisher {
  name: string;
  place: string;
  date: string;
  edition: string;
  isbn: string;
  deposit: string;
  pages: string;
  series: string;
  parts: string;
  subSeries: string;
  parts2:string;
  bibliography: string;
}

interface PublishersProps {
  formData: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

const defaultPublisher: Publisher = {
  name: "", place: "", date: "", edition: "", isbn: "",
  deposit: "", pages: "", series: "", parts: "", subSeries: "", parts2:"", bibliography: "",
};

const defaultPublisherNames = ["دار المعارف", "مكتبة الأسرة", "المؤسسة العربية"];

export default function Publishers({ formData, updateData }: PublishersProps) {
  const pub: Publisher = formData.publisher_data || defaultPublisher;
  const [customPublishers, setCustomPublishers] = useState<string[]>([]);

  const allPublishers = [...defaultPublisherNames, ...customPublishers];

  const updateField = (key: keyof Publisher, value: string) => {
    updateData("publisher_data", { ...pub, [key]: value });
  };

  const addPublisherOption = () => {
    const newPublisher = prompt("أدخل اسم الناشر الجديد:");
    if (!newPublisher) return;
    if (allPublishers.includes(newPublisher)) {
      alert("هذا الناشر موجود مسبقاً!");
      return;
    }
    setCustomPublishers((prev) => [...prev, newPublisher]);
    updateField("name", newPublisher);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <h3 className="text-lg font-semibold text-foreground">بيانات الناشر</h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <Label>اسم الناشر</Label>
          <div className="flex gap-2">
            <Select value={pub.name} onValueChange={(val) => updateField("name", val)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="اختر ناشر" />
              </SelectTrigger>
              <SelectContent>
                {allPublishers.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={addPublisherOption} title="أضف ناشر جديد">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publisherPlace">مكان النشر</Label>
          <Input
            id="publisherPlace"
            placeholder="مكان النشر"
            value={pub.place}
            onChange={(e) => updateField("place", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publisherDate">تاريخ النشر</Label>
          <Input
            id="publisherDate"
            type="number"
            placeholder="مثال: 2024"
            value={pub.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edition">الطبعة</Label>
          <Input id="edition" placeholder="رقم الطبعة" value={pub.edition} onChange={(e) => updateField("edition", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="isbn">رقم ISBN</Label>
          <Input id="isbn" placeholder="978-xxx-xxx-xxx-x" value={pub.isbn} onChange={(e) => updateField("isbn", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit">رقم الإيداع</Label>
          <Input id="deposit" placeholder="رقم الإيداع" value={pub.deposit} onChange={(e) => updateField("deposit", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pages">عدد الصفحات</Label>
          <Input id="pages" type="number" placeholder="عدد الصفحات" value={pub.pages} onChange={(e) => updateField("pages", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="series">السلسلة</Label>
          <Input id="series" placeholder="اسم السلسلة" value={pub.series} onChange={(e) => updateField("series", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parts">الأجزاء</Label>
          <Input id="parts" type="number" placeholder="عدد الأجزاء" value={pub.parts} onChange={(e) => updateField("parts", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subSeries">السلسلة الفرعية</Label>
          <Input id="subSeries" placeholder="السلسلة الفرعية" value={pub.subSeries} onChange={(e) => updateField("subSeries", e.target.value)} />
        </div>
     
      <div className="space-y-2">
          <Label htmlFor="parts2">الأجزاء</Label>
          <Input id="parts2" type="number" placeholder="عدد الأجزاء" value={pub.parts} onChange={(e) => updateField("parts", e.target.value)} />
        </div>
         </div>

      <div className="space-y-2">
        <Label htmlFor="bibliography">ملاحظة بيبليوغرافية</Label>
        <Textarea
          id="bibliography"
          rows={3}
          placeholder="اكتب هنا الملاحظة البيبليوغرافية..."
          value={pub.bibliography}
          onChange={(e) => updateField("bibliography", e.target.value)}
        />
      </div>
    </div>
  );
}
