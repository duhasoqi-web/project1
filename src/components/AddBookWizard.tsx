import { useState } from "react";
import { BookOpen, Users, Building, Truck, ClipboardCheck, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepIndicator from "./StepIndicator";
import BasicInfo from "./steps/BasicInfo";
import Authors from "./steps/Authors";
import Publishers from "./steps/Publishers";
import Supplier from "./steps/Supplier";
import Review from "./steps/Review";
import { toast } from "sonner";

const steps = [
  { label: "المعلومات", icon: <BookOpen className="h-4 w-4" /> },
  { label: "المؤلفون", icon: <Users className="h-4 w-4" /> },
  { label: "الناشر", icon: <Building className="h-4 w-4" /> },
  { label: "المزوّد", icon: <Truck className="h-4 w-4" /> },
  { label: "المراجعة", icon: <ClipboardCheck className="h-4 w-4" /> },
];

export default function AddBookWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const updateData = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    toast.success("تم حفظ الكتاب بنجاح!", {
      description: formData.bookTitle || "كتاب جديد",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="wizard-shadow rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="mb-2 text-center">
          <h2 className="text-2xl font-bold text-foreground">إضافة كتاب جديد</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            الخطوة {currentStep} من {steps.length}
          </p>
        </div>

        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="my-6 h-px bg-border" />

        <div className="min-h-[280px]">
          {currentStep === 1 && (
            <BasicInfo formData={formData} updateData={updateData} />
          )}
          {currentStep === 2 && (
            <Authors formData={formData} updateData={updateData} />
          )}
          {currentStep === 3 && (
            <Publishers formData={formData} updateData={updateData} />
          )}
          {currentStep === 4 && (
            <Supplier formData={formData} updateData={updateData} />
          )}
          {currentStep === 5 && <Review formData={formData} />}
        </div>

        <div className="my-6 h-px bg-border" />

        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
            )}
          </div>
          <div>
            {currentStep < 5 ? (
              <Button onClick={nextStep} className="gap-2">
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="gap-2 bg-wizard-done hover:bg-wizard-done/90"
              >
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
