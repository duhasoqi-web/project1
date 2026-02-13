import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface Author {
  role: string;
  name: string;
  attribute: string;
}

interface AuthorsProps {
  formData: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

const defaultNames = ["نجيب محفوظ", "غسان كنفاني", "طه حسين"];

export default function Authors({ formData, updateData }: AuthorsProps) {
  const authors: Author[] = formData.authors || [{ role: "", name: "", attribute: "" }];
  const [customNames, setCustomNames] = useState<string[]>([]);

  const allNames = [...defaultNames, ...customNames];

  const addAuthorRow = () => {
    updateData("authors", [...authors, { role: "", name: "", attribute: "" }]);
  };

  const removeAuthorRow = (index: number) => {
    const updated = authors.filter((_, i) => i !== index);
    updateData("authors", updated.length ? updated : [{ role: "", name: "", attribute: "" }]);
  };

  const updateAuthorField = (index: number, key: keyof Author, value: string) => {
    const updated = [...authors];
    updated[index] = { ...updated[index], [key]: value };
    updateData("authors", updated);
  };

  const addAuthorName = (index: number) => {
    const newName = prompt("أدخل اسم المؤلف الجديد:");
    if (!newName) return;
    if (allNames.includes(newName)) {
      alert("الاسم موجود مسبقاً!");
      return;
    }
    setCustomNames((prev) => [...prev, newName]);
    updateAuthorField(index, "name", newName);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">المؤلفون</h3>
        <Button type="button" variant="outline" size="sm" onClick={addAuthorRow} className="gap-1.5">
          <Plus className="h-4 w-4" />
          إضافة صف جديد
        </Button>
      </div>

      <div className="space-y-4">
        {authors.map((author, index) => (
          <div
            key={index}
            className="animate-scale-in rounded-lg border border-border bg-secondary/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">مؤلف {index + 1}</span>
              {authors.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAuthorRow(index)}
                  className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select
                  value={author.role}
                  onValueChange={(val) => updateAuthorField(index, "role", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="رئيسي">رئيسي</SelectItem>
                    <SelectItem value="مساعد مشارك">مساعد مشارك</SelectItem>
                    <SelectItem value="مترجم">مترجم</SelectItem>
                    <SelectItem value="محقق">محقق</SelectItem>
                    <SelectItem value="مدقق">مدقق</SelectItem>
                    <SelectItem value="مراجع">مراجع</SelectItem>
                    <SelectItem value="محرر">محرر</SelectItem>
                    <SelectItem value="معد">معد</SelectItem>
                    <SelectItem value="مقدّم">مقدّم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>اسم المؤلف</Label>
                <div className="flex gap-2">
                  <Select
                    value={author.name}
                    onValueChange={(val) => updateAuthorField(index, "name", val)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر مؤلف" />
                    </SelectTrigger>
                    <SelectContent>
                      {allNames.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addAuthorName(index)}
                    title="أضف اسم مؤلف جديد"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>صفة المؤلف</Label>
                <Select
                  value={author.attribute}
                  onValueChange={(val) => updateAuthorField(index, "attribute", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="صفة المؤلف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="شخص">شخص</SelectItem>
                    <SelectItem value="ملتقى">ملتقى</SelectItem>
                    <SelectItem value="هيئة">هيئة</SelectItem>
                    <SelectItem value="عنوان">عنوان</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
