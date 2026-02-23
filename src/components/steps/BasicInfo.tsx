import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface SubTitle {
  title: string;
  type: string;
}

interface BasicInfoProps {
  formData: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

const defaultMaterialTypes = [
  "كتاب", "مرجع", "مجموعة", "رسالة جامعية",
  "كتب أطفال", "قصة", "دورية", "سمعيات-بصريات",
];

export default function BasicInfo({ formData, updateData }: BasicInfoProps) {
  const subTitles: SubTitle[] = formData.subTitles || [];
  const [customMaterialTypes, setCustomMaterialTypes] = useState<string[]>([]);

  const allMaterialTypes = [...defaultMaterialTypes, ...customMaterialTypes];

  const addSubTitle = () => {
    updateData("subTitles", [...subTitles, { title: "", type: "" }]);
  };

  const updateSubTitle = (index: number, key: keyof SubTitle, value: string) => {
    const updated = [...subTitles];
    updated[index] = { ...updated[index], [key]: value };
    updateData("subTitles", updated);
  };

  const removeSubTitle = (index: number) => {
    updateData("subTitles", subTitles.filter((_, i) => i !== index));
  };

  const addMaterialType = () => {
    const newType = prompt("أدخل نوع المادة الجديد:");
    if (!newType) return;
    if (allMaterialTypes.includes(newType)) {
      alert("هذا النوع موجود مسبقاً!");
      return;
    }
    setCustomMaterialTypes((prev) => [...prev, newType]);
    updateData("bibliographicLevel", newType);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="serialNumber">رقم التسلسل</Label>
          <Input
            id="serialNumber"
            placeholder="رقم التسلسل"
            value={formData.serialNumber || ""}
            onChange={(e) => updateData("serialNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classificationCode">
            رمز التصنيف <span className="text-destructive">*</span>
          </Label>
          <Input
            id="classificationCode"
            placeholder="رمز التصنيف"
            value={formData.classificationCode || ""}
            onChange={(e) => updateData("classificationCode", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suffix">
            اللاحقة <span className="text-destructive">*</span>
          </Label>
          <Input
            id="suffix"
            placeholder="اللاحقة"
            value={formData.suffix || ""}
            onChange={(e) => updateData("suffix", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bookTitle">
            عنوان الكتاب <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bookTitle"
            placeholder="أدخل عنوان الكتاب"
            value={formData.bookTitle || ""}
            onChange={(e) => updateData("bookTitle", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>عناوين فرعية</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSubTitle} className="gap-1.5">
            <Plus className="h-4 w-4" />
            إضافة عنوان فرعي
          </Button>
        </div>
        {subTitles.map((sub, index) => (
          <div key={index} className="flex items-end gap-3 animate-scale-in">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="العنوان الفرعي"
                value={sub.title}
                onChange={(e) => updateSubTitle(index, "title", e.target.value)}
              />
            </div>
            <div className="w-36">
              <Select
                value={sub.type}
                onValueChange={(val) => updateSubTitle(index, "type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="نوع العنوان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="فرعي">فرعي</SelectItem>
                  <SelectItem value="بديل">بديل</SelectItem>
                  <SelectItem value="موازي">موازي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSubTitle(index)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive mb-0.5"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dimensions">الأبعاد</Label>
          <Input
            id="dimensions"
            placeholder="الأبعاد"
            value={formData.dimensions || ""}
            onChange={(e) => updateData("dimensions", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>نوع المادة</Label>
          <div className="flex gap-2">
            <Select
              value={formData.bibliographicLevel || ""}
              onValueChange={(val) => updateData("bibliographicLevel", val)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="اختر نوع المادة" />
              </SelectTrigger>
              <SelectContent>
                {allMaterialTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={addMaterialType} title="أضف نوع مادة جديد">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subjectHeading">رأس الموضوع</Label>
        <Textarea
          id="subjectHeading"
          placeholder="رأس الموضوع"
          rows={3}
          value={formData.subjectHeading || ""}
          onChange={(e) => updateData("subjectHeading", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bookAbstract">المستخلص</Label>
          <Textarea
            id="bookAbstract"
            placeholder="المستخلص"
            rows={3}
            value={formData.bookAbstract || ""}
            onChange={(e) => updateData("bookAbstract", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="explanations">الإيضاحات</Label>
          <Textarea
            id="explanations"
            placeholder="الإيضاحات"
            rows={3}
            value={formData.explanations || ""}
            onChange={(e) => updateData("explanations", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
