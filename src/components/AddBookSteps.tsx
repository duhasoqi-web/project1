import { useState } from "react";
import { Button } from "@/components/ui/button";
import StepNumber from "./StepNumber";
import BasicInfo from "./steps/BasicInfo";
import Authors from "./steps/Authors";
import Publishers from "./steps/Publishers";
import Supplier from "./steps/Supplier";
import Review from "./steps/Review";
import { toast } from "sonner";

const steps = [
  { label: "المعلومات" },
  { label: "المؤلفون" },
  { label: "الناشر" },
  { label: "المزوّد" },
  { label: "المراجعة" },
];

export default function AddBookSteps() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [Saving, setSaving] = useState(false);


  const nextStep = () => setCurrentStep((e) => Math.min(e + 1, steps.length));
  const prevStep = () => setCurrentStep((e) => Math.max(e - 1, 1));
  const updateData = (key: string, value: any) =>
    setFormData((e) => ({ ...e, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
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
    } 
    finally {
    setSaving(false);
    }
  };

  return (
    
      <div className="mx-auto max-w-3xl mt-2 px-4 py-8 rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-2 text-center">
          <h2 className="text-2xl font-bold">إضافة كتاب جديد</h2>
          <p className="mt-1 text-sm">
            الخطوة {currentStep} من {steps.length}
          </p>
        </div>

       <StepNumber currentStep={currentStep} steps={steps} />

        <div>
          {currentStep === 1 && <BasicInfo formData={formData} updateData={updateData} />}
          {currentStep === 2 && <Authors formData={formData} updateData={updateData} />}
          {currentStep === 3 && <Publishers formData={formData} updateData={updateData} />}
          {currentStep === 4 && <Supplier formData={formData} updateData={updateData} />}
          {currentStep === 5 && <Review formData={formData} />}
        </div>

     <div className="flex items-center justify-between my-4">
          <div>
            {currentStep > 1 && (
              <Button onClick={prevStep} >
                السابق
              </Button>
            )}
          </div>
          <div>
  {currentStep < steps.length ? (
    <Button onClick={nextStep}>التالي</Button>
  ) : (
  <div className="gap-2 ">
      <Button className="mx-1 bg-blue-800">اضافة نسخة</Button>
       <Button className="mx-1 bg-blue-800" >اضافة جزء</Button>
      
    <div className="flex mr-14 my-4 ">
      <Button className="bg-green-600" onClick={handleSave} disabled={Saving}>حفظ الكتاب</Button>
       </div>
    </div>
  )}
</div>
          </div>
        </div>
 );}