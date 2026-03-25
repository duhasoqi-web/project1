import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StepNumber from "./StepNumber";
import BasicInfo from "./steps/BasicInfo";
import Authors from "./steps/Authors";
import Publishers from "./steps/Publishers";
import Supplier from "./steps/Supplier";
import Review from "./steps/Review";
import { toast } from "sonner";
import Login from "@/pages/Login";

interface BookAuthor {
  name: string;
  authorTypeID: number | null;
  authorRoleID: number | null;
}

interface Book {
  parentBookID: number | null;
  bookType: string | null;
  serialNumber: string;
  classificationCode: string;
  suffix: string | null;
  title: string;
  dimensions: string | null;
  materialTypeID: number | null;
  subjectHeading: string | null;
  abstract: string | null;
  illustrations: string | null;
  isbn: string | null;
  numberOfPages: number | null;
  bibliographicNote: string | null;
  subtitles: { subtitle: string | null; subtitleTypeID: number | null }[];
  authors: BookAuthor[];
  publishers: {
    name: string | null;
    place: string | null;
    year: number | null;
    edition: string | null;
    depositNumber: string | null;
  };
  series: {
    title: string | null;
    partCount: string | null;
    note: string | null;
    partNumber: string | null;
    subSeriesTitle: string | null;
    subSeriesPartNumber: string | null;
  };
  supplies: {
    name: string | null;
    supplyDate: string | null;
    supplyMethod: string | null;
    price: number | null;
    currency: string | null;
    note: string | null;
  };
}

interface LookupItem {
  id: number;
  name: string;
}

const steps = [
  { label: "المعلومات" },
  { label: "المؤلفون" },
  { label: "الناشر" },
  { label: "المزوّد" },
  { label: "المراجعة" },
];

const initialForm: Book = {
  parentBookID: null,
  bookType: null,
  serialNumber: "",
  classificationCode: "",
  suffix: null,
  title: "",
  dimensions: null,
  materialTypeID: null,
  subjectHeading: null,
  abstract: null,
  illustrations: null,
  isbn: null,
  numberOfPages: null,
  bibliographicNote: null,
  subtitles: [],
  authors: [{ name: "", authorTypeID: null, authorRoleID: null }],
  publishers: { name: null, place: null, year: null, edition: null, depositNumber: null },
  series: { title: null, partCount: null, note: null, partNumber: null, subSeriesTitle: null, subSeriesPartNumber: null },
  supplies: { name: null, supplyDate: null, supplyMethod: null, price: null, currency: null, note: null },
};

export default function AddBookSteps() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Book>(initialForm);
  const [saving, setSaving] = useState(false);

  const [materialTypes, setMaterialTypes] = useState<LookupItem[]>([]);
  const [authorRoles, setAuthorRoles] = useState<LookupItem[]>([]);
  const [authorTypes, setAuthorTypes] = useState<LookupItem[]>([]);
  const [subtitleTypes, setSubtitleTypes] = useState<LookupItem[]>([]);

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.serialNumber) { toast.error("الرجاء تعبئة رقم التسلسل"); return; }
      if (!formData.classificationCode) { toast.error("الرجاء تعبئة رمز التصنيف"); return; }
      if (!formData.title) { toast.error("الرجاء تعبئة عنوان الكتاب"); return; }
      if (!formData.materialTypeID) { toast.error("الرجاء تعبئة نوع المادة"); return; }
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

const updateData = (key: string, value: any) => {
  setFormData(prev => {
    if (!prev) return prev;

    return {
      ...prev,
      [key]: value
    };
  });
};
 const handleSave = async () => {
  setSaving(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/Login");
      return;
    }

    const body = {
      ...formData,
      serialNumber: formData.serialNumber?.toString(),

      authors: formData.authors
        .filter((a) => a.name?.trim())
        .map(({ ...rest }: any) => {
          const { authorID, ...author } = rest;
          return author;
        }),

      ...(formData.authors.filter((a) => a.name?.trim()).length === 0 && {
        authors: [{ name: null, authorTypeID: null, authorRoleID: null }],
      }),

      subtitles: formData.subtitles.length
        ? formData.subtitles
        : [{ subtitle: null, subtitleTypeID: null }],

      supplies: (() => {
        const { supplyID, ...rest } = formData.supplies as any;
        return rest;
      })(),
    };

    const response = await fetch("https://localhost:8080/api/Book/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      toast.error("انتهت الجلسة، الرجاء تسجيل الدخول مجددًا");
      navigate("/login");
      return;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.message || "حدث خطأ أثناء الحفظ");
      return;
    }

    toast.success("تم حفظ الكتاب بنجاح!");
    navigate("/update-books");

  } catch (error) {
    toast.error("فشل الاتصال بالخادم");
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="border rounded-2xl p-6 bg-card space-y-6">

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">إضافة كتاب جديد</h2>
          <p className="text-sm text-muted-foreground">
            الخطوة {currentStep} من {steps.length}
          </p>
          <StepNumber steps={steps} currentStep={currentStep} />
        </div>

        {currentStep === 1 && (
          <BasicInfo
            formData={formData}
            updateData={updateData}
            onMaterialTypesLoaded={setMaterialTypes}
            onSubtitleTypesLoaded={setSubtitleTypes}
          />
        )}
        {currentStep === 2 && (
          <Authors
            formData={formData}
            updateData={updateData}
            onRolesLoaded={setAuthorRoles}
            onTypesLoaded={setAuthorTypes}
          />
        )}
        {currentStep === 3 && <Publishers formData={formData} updateData={updateData} />}
        {currentStep === 4 && <Supplier formData={formData} updateData={updateData} />}
        {currentStep === 5 && (
          <Review
            formData={formData}
            materialTypes={materialTypes}
            authorRoles={authorRoles}
            authorTypes={authorTypes}
            subtitleTypes={subtitleTypes}
          />
        )}

        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>السابق</Button>
            )}
          </div>
          <div>
            {currentStep < steps.length ? (
              <Button onClick={nextStep}>التالي</Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : "حفظ الكتاب"}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}