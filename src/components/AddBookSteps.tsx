import { useState } from "react";
import { BookOpen, Users, Building, Truck, ClipboardCheck,Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepNumber from "./StepNumber";
import BasicInfo from "./steps/BasicInfo";
import Authors from "./steps/Authors";
import Publishers from "./steps/Publishers";
import Supplier from "./steps/Supplier";
import Review from "./steps/Review";
import { toast } from "sonner";


const steps = [
  { label: "المعلومات", icon: <BookOpen className="h-4 w-4"/> },
  { label: "المؤلفون", icon: <Users className="h-4 w-4" /> },
  { label: "الناشر", icon: <Building className="h-4 w-4" /> },
  { label: "المزوّد", icon: <Truck className="h-4 w-4" /> },
  { label: "المراجعة", icon: <ClipboardCheck className="h-4 w-4" /> },
];

export default function AddBookSteps() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const updateData = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

 
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw Error("فشل الحفظ");

      toast.success("تم حفظ الكتاب بنجاح!");
      setFormData({});
      setCurrentStep(1);
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
     
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="wizard-shadow rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="mb-2 text-center">
          <h2 className="text-2xl font-bold text-foreground">إضافة كتاب جديد</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            الخطوة {currentStep} من {steps.length}
          </p>
        </div>

        <StepNumber currentStep={currentStep} steps={steps} />

        <div className="my-6 h-px bg-border" />

        <div className="min-h-[280px]">
          {currentStep === 1 && <BasicInfo formData={formData} updateData={updateData} />}
          {currentStep === 2 && <Authors formData={formData} updateData={updateData} />}
          {currentStep === 3 && <Publishers formData={formData} updateData={updateData} />}
          {currentStep === 4 && <Supplier formData={formData} updateData={updateData} />}
          {currentStep === 5 && <Review formData={formData} />}
        </div>

        <div className="my-6 h-px bg-border" />

        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} className="gap-2">
              
                السابق
              </Button>
            )}
          </div>
          <div>
            {currentStep < steps.length ? (
              <Button onClick={nextStep} className="gap-2"> التالي</Button> ) : (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2">
                <Save className="h-4 w-4" />
               حفظ الكتاب 
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
