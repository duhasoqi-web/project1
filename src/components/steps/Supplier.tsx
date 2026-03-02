import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface SupplierData {
  name: string;
  date: string;
  method: string;
  price: string;
  currency: string;
  notes: string;
}

interface SupplierProps {
  formData: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

const defaultSupplier: SupplierData = {
  name: "",
  date: "",
  method: "",
  price: "",
  currency: "",
  notes: "",
};

export default function Supplier({ formData, updateData }: SupplierProps) {
  const supplier: SupplierData =
    formData.supplier_data || defaultSupplier;
 // const [apiCurrencies, setApiCurrencies] = useState<string[]>([]);

 // useEffect(() => {
    //fetch("/api/currencies") 
    //  .then((res) => res.json())
     // .then((data) => setApiCurrencies(data))
     // .catch(() => setApiCurrencies([]));
 // }, []);

  const [customSuppliers, setCustomSuppliers] = useState<string[]>([]);

  const updateField = (
    key: keyof SupplierData,
    value: string
  ) => {
    updateData("supplier_data", {
      ...supplier,
      [key]: value,
    });
  };

  const addSupplierOption = () => {
    const newSupplier = prompt("أدخل اسم المزود الجديد:");
    if (!newSupplier) return;

    if (customSuppliers.includes(newSupplier)) {
      alert("هذا المزود موجود مسبقاً!");
      return;
    }

    setCustomSuppliers((prev) => [
      ...prev,
      newSupplier,
    ]);

    updateField("name", newSupplier);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <h3 className="text-lg font-semibold text-foreground">
        بيانات المزوّد
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <div className="space-y-2">
          <Label>اسم المزود</Label>
          <div className="flex gap-2">
            <Select value={supplier.name} onValueChange={(val) => updateField("name", val)}>
            <SelectTrigger className="flex-1">
                <SelectValue placeholder="اختر مزود" />
              </SelectTrigger>
              <SelectContent>
                {customSuppliers.map((name) => (
                  <SelectItem key={name} value={name} >{name} </SelectItem>))}
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" size="icon" onClick={addSupplierOption} 
            title="أضف مزود جديد">
            <Plus className="h-4 w-4" /> </Button>
             </div>
        </div>   
           
        <div className="space-y-2">
          <Label htmlFor="supplierDate">
            تاريخ التزويد
          </Label>
           <Input id="supplierDate" type="date" value={supplier.date} 
           onChange={(e) =>updateField("date", e.target.value)} />
        </div> 
         
        <div className="space-y-2">
          <Label>طريقة التزويد</Label>
          <Select value={supplier.method} onValueChange={(val) =>  updateField("method", val) } >
            <SelectTrigger>
              <SelectValue placeholder="اختر طريقة التزويد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="شراء">
                شراء
              </SelectItem>
              <SelectItem value="إهداء">
                إهداء
              </SelectItem>
              <SelectItem value="تبادل">
                تبادل
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {supplier.method === "شراء" && (
          <div className="space-y-2 animate-fade-in">
            <Label>السعر والعملة</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="السعر" className="flex-1"
                value={supplier.price}
                onChange={(e) =>updateField("price",e.target.value)}/>
                <Select value={supplier.currency} onValueChange={(val) => updateField("currency", val)}>
                   <SelectTrigger className="w-32">
                   <SelectValue placeholder="العملة" /> 
                   </SelectTrigger> 
                   <SelectContent> 
                    <SelectItem value="شيكل">شيكل</SelectItem> 
                    <SelectItem value="دينار">دينار</SelectItem> 
                    <SelectItem value="دولار">دولار</SelectItem> 
                    </SelectContent> 
                    </Select>
              
              </div>
          </div>)}
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierNotes">
          ملاحظات
        </Label>
        <Textarea id="supplierNotes" rows={3} placeholder="ملاحظات إضافية"
  value={supplier.notes} onChange={(e) => updateField("notes", e.target.value )} />
      </div>
    </div>
  );
}