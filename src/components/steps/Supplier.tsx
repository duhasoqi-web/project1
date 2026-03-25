import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import SearchableSelect from "@/components/ui/searchable-select";

interface SupplierOption {
  id: number;
  name: string;
}

interface SupplierProps {
  formData: any;
  updateData: (key: string, value: any) => void;
}

export default function Supplier({ formData, updateData }: SupplierProps) {
  const supplies = formData.supplies ?? {
    supplyID: null,
    name: null,
    supplyDate: null,
    supplyMethod: null,
    price: null,
    currency: null,
    note: null,
  };

  const [localSuppliers, setLocalSuppliers] = useState<SupplierOption[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierOption | null>(
    supplies.name ? { id: supplies.supplyID ?? 0, name: supplies.name } : null
  );

  const updateField = (key: string, value: any) => {
    updateData("supplies", { ...supplies, [key]: value });
  };

  const handleSupplierSelect = (option: SupplierOption | null) => {
    setSelectedSupplier(option);
    if (!option) {
      updateData("supplies", { ...supplies, name: null, supplyID: null });
      return;
    }
    const patch: any = { name: option.name, supplyID: option.id ?? 0 };
    updateData("supplies", { ...supplies, ...patch });

    if (!localSuppliers.find(s => s.name === option.name)) {
      setLocalSuppliers(prev => [...prev, { id: option.id ?? 0, name: option.name }]);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">بيانات المزوّد</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       
        <div className="space-y-2">
          <Label>اسم المزود</Label>
          <SearchableSelect
            searchEndpoint="https://localhost:8080/api/Book/suppliers/names" 
            searchParam="supplierName"
            value={selectedSupplier}
            onSelect={(opt) => handleSupplierSelect(opt as SupplierOption | null)}
            placeholder="ابحث عن المزود..."
            addPromptLabel="أدخل اسم المزود الجديد:"
            localOptions={localSuppliers}
            onAdd={(name) => {
              const newSupplier: SupplierOption = { id: 0, name };
              setLocalSuppliers(prev => [...prev, newSupplier]);
              handleSupplierSelect(newSupplier);
              return newSupplier;
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>تاريخ التزويد</Label>
          <Input
            type="date"
            value={supplies.supplyDate ?? ""}
            onChange={(e) => updateField("supplyDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>طريقة التزويد</Label>
          <Select
            value={supplies.supplyMethod ?? ""}
            onValueChange={(val) => updateField("supplyMethod", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الطريقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="شراء">شراء</SelectItem>
              <SelectItem value="إهداء">إهداء</SelectItem>
              <SelectItem value="تبادل">تبادل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {supplies.supplyMethod === "شراء" && (
          <div className="space-y-2">
            <Label>السعر والعملة</Label>
            <div className="flex gap-2">
              <Input
                placeholder="السعر"
                type="number"
                value={supplies.price ?? ""}
                onChange={(e) =>updateField("price", e.target.value ? Number(e.target.value) : null)
}
              />
              <Select
                value={supplies.currency ?? ""}
                onValueChange={(val) => updateField("currency", val)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="العملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="شيكل">شيكل</SelectItem>
                  <SelectItem value="دينار">دينار</SelectItem>
                  <SelectItem value="دولار">دولار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>ملاحظات</Label>
        <Textarea
          rows={3}
          value={supplies.note ?? ""}
          onChange={(e) => updateField("note", e.target.value)}
        />
      </div>
    </div>
  );
}