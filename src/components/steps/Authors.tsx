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
import { useState, useEffect } from "react";

interface Author {
  roleId: number | null;
  authorId: number | null;
  attribute: string;
}

interface AuthorOption {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface AuthorsProps {
  formData: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

export default function Authors({ formData, updateData }: AuthorsProps) {
  const authors: Author[] =
    formData.authors || [{ roleId: null, authorId: null, attribute: "" }];

 
  const [apiAuthors, setApiAuthors] = useState<AuthorOption[]>([]);
  const [apiRoles, setApiRoles] = useState<Role[]>([]);
  const [localAuthors, setLocalAuthors] = useState<AuthorOption[]>([]);

 
  useEffect(() => {
    fetch("/api/Author")
      .then((res) => res.json())
      .then((data) => setApiAuthors(data))
      .catch(() => setApiAuthors([]));
  }, []);

  
  useEffect(() => {
    fetch("/api/role")
      .then((res) => res.json())
      .then((data) => setApiRoles(data))
      .catch(() => setApiRoles([]));
  }, []);


  const allAuthors = [...apiAuthors, ...localAuthors];

  const addAuthorRow = () => {
    updateData("authors", [
      ...authors,
      { roleId: null, authorId: null, attribute: "" },
    ]);
  };

  const removeAuthorRow = (index: number) => {
    const updated = authors.filter((_, i) => i !== index);
    updateData(
      "authors",
      updated.length
        ? updated
        : [{ roleId: null, authorId: null, attribute: "" }]
    );
  };

  const updateAuthor = (
    index: number,
    key: keyof Author,
    value: number | string | null
  ) => {
    const updated = [...authors];
    updated[index] = { ...updated[index], [key]: value };
    updateData("authors", updated);
  };

  
  const addAuthorName = (index: number) => {
    const newName = prompt("أدخل اسم المؤلف الجديد:");
    if (!newName) return;

    const exists = allAuthors.some(
      (author) => author.name.trim() === newName.trim()
    );

    if (exists) {
      alert("الاسم موجود مسبقاً!");
      return;
    }

 
    const tempId = -Date.now();

    const newAuthor: AuthorOption = {
      id: tempId,
      name: newName,
    };

    setLocalAuthors((prev) => [...prev, newAuthor]);

    updateAuthor(index, "authorId", tempId);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">المؤلفون</h3>
        <Button type="button" variant="outline" size="sm" onClick={addAuthorRow}>
          <Plus className="h-4 w-4" />
          إضافة صف جديد
        </Button>
      </div>

      <div className="space-y-4">
        {authors.map((author, index) => (
          <div
            key={index}
            className="rounded-lg border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span>مؤلف {index + 1}</span>
              {authors.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAuthorRow(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select
                  value={author.roleId?.toString()}
                  onValueChange={(val) =>
                    updateAuthor(index, "roleId", Number(val))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiRoles.map((role) => (
                      <SelectItem
                        key={role.id}
                        value={role.id.toString()}
                      >
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>اسم المؤلف</Label>
                <div className="flex gap-2">
                  <Select
                    value={author.authorId?.toString()}
                    onValueChange={(val) =>
                      updateAuthor(index, "authorId", Number(val))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر مؤلف" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAuthors.map((authorOption) => (
                        <SelectItem
                          key={authorOption.id}
                          value={authorOption.id.toString()}
                        >
                          {authorOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addAuthorName(index)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* الصفة */}
              <div className="space-y-2">
                <Label>صفة المؤلف</Label>
                <Select
                  value={author.attribute}
                  onValueChange={(val) =>
                    updateAuthor(index, "attribute", val)
                  }
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