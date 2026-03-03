import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SubTitle {
  title: string;
  type: string;
}

interface MaterialType {
  id: number;
  name: string;
}

interface BasicInfoProps {
  formData: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

export default function BasicInfo({ formData, updateData }: BasicInfoProps) {
  const [addedMaterialTypes, setAddedMaterialTypes] = useState<MaterialType[]>([]);
  const [apiMaterialTypes, setApiMaterialTypes] = useState<MaterialType[]>([]);
  
  const subTitles: SubTitle[] = formData.subTitles || [];
  const allMaterialTypes = [...apiMaterialTypes, ...addedMaterialTypes];

  useEffect(() => {
    fetch("/api/material-types")
      .then(res => res.json())
      .then((data: MaterialType[]) => setApiMaterialTypes(data))
      .catch(() => setApiMaterialTypes([]));
  }, []);

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
    const newName = prompt("أدخل نوع المادة الجديد:");
    if (!newName) return;

    if (allMaterialTypes.some(t => t.name === newName)) {
      alert("هذا النوع موجود مسبقاً!");
      return;
    }

    const newType: MaterialType = {
      id: -Date.now(),
      name: newName
    };

    setAddedMaterialTypes(prev => [...prev, newType]);
  };

  return (
    <div className="space-y-5">
     
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="serialNumber">رقم التسلسل</Label>
          <Input
            id="serialNumber"
            placeholder="رقم التسلسل"
            value={formData.serialNumber || ""}
            onChange={e => updateData("serialNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classificationCode">رمز التصنيف</Label>
          <Input
            id="classificationCode"
            placeholder="رمز التصنيف"
            value={formData.classificationCode || ""}
            onChange={e => updateData("classificationCode", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suffix">اللاحقة</Label>
          <Input
            id="suffix"
            placeholder="اللاحقة"
            value={formData.suffix || ""}
            onChange={e => updateData("suffix", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bookTitle">عنوان الكتاب</Label>
          <Input
            id="bookTitle"
            placeholder="أدخل عنوان الكتاب"
            value={formData.bookTitle || ""}
            onChange={e => updateData("bookTitle", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>عناوين فرعية</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSubTitle}>
            <Plus className="h-4 w-4" />
            إضافة عنوان فرعي
          </Button>
        </div>

        {subTitles.map((sub, index) => (
          <div key={index} className="flex items-end gap-3 w-full">
            <Input
              placeholder="العنوان الفرعي"
              value={sub.title}
              onChange={(e) => updateSubTitle(index, "title", e.target.value)}
              className="flex-1"
            />
            <Select 
              value={sub.type}
              onValueChange={(val) => updateSubTitle(index, "type", val)}>
              <SelectTrigger className="w-23">
                <SelectValue placeholder="نوع العنوان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="فرعي">فرعي</SelectItem>
                <SelectItem value="بديل">بديل</SelectItem>
                <SelectItem value="موازي">موازي</SelectItem>
              </SelectContent>
            </Select>
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
              value={formData.materialType?.id?.toString() || ""}
              onValueChange={(val) => {
                const selected = allMaterialTypes.find(t => t.id.toString() === val);
                updateData("materialType", selected || null);
              }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المادة" />
              </SelectTrigger>
              <SelectContent>
                {allMaterialTypes.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addMaterialType}
              title="أضف نوع مادة جديد"
            >
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
          onChange={e => updateData("subjectHeading", e.target.value)}
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
            onChange={e => updateData("bookAbstract", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="explanations">الإيضاحات</Label>
          <Textarea
            id="explanations"
            placeholder="الإيضاحات"
            rows={3}
            value={formData.explanations || ""}
            onChange={e => updateData("explanations", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}