import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import SearchableSelect from "@/components/ui/searchable-select";
// ✅ حذف: import { number } from "framer-motion" — كان غلط

interface PublisherOption {
  id: number;
  name: string;
  place?: string;
}

interface SeriesOption {
  id: number;
  name: string;
}

interface PublishersProps {
  formData: any;
  updateData: (key: string, value: any) => void;
}

export default function Publishers({ formData, updateData }: PublishersProps) {
  const pub = formData.publishers ?? { name: null, place: null, year: null, edition: null, depositNumber: null };
  const series = formData.series ?? { title: null, partCount: null, note: null, partNumber: null, subSeriesTitle: null, subSeriesPartNumber: null };

  const [localPublishers, setLocalPublishers] = useState<PublisherOption[]>([]);
  const [localSeries, setLocalSeries] = useState<SeriesOption[]>([]);
  const [publisherPlaceMap, setPublisherPlaceMap] = useState<Record<string, string>>({});

  const [selectedPublisher, setSelectedPublisher] = useState<PublisherOption | null>(
    pub.name ? { id: pub.publisherID ?? 0, name: pub.name, place: pub.place } : null
  );

  const [selectedSeries, setSelectedSeries] = useState<SeriesOption | null>(
    series.title ? { id: series.seriesID ?? 0, name: series.title } : null
  );

  const updatePub = (key: string, value: any) => {
    updateData("publishers", { ...pub, [key]: value });
  };

  const updateSeries = (key: string, value: any) => {
    updateData("series", { ...series, [key]: value });
  };

  const handlePublisherSelect = (option: PublisherOption | null) => {
    setSelectedPublisher(option);
    if (!option) {
      updateData("publishers", { ...pub, name: null, place: null });
      return;
    }
    const patch: any = { name: option.name };
    if (option.place) {
      patch.place = option.place;
      setPublisherPlaceMap((prev) => ({ ...prev, [option.name]: option.place! }));
    } else if (publisherPlaceMap[option.name]) {
      patch.place = publisherPlaceMap[option.name];
    }
    updateData("publishers", { ...pub, ...patch });
  };

  const handlePlaceChange = (place: string) => {
    updatePub("place", place);
    if (pub.name) {
      setPublisherPlaceMap((prev) => ({ ...prev, [pub.name]: place }));
    }
  };

  const handleSeriesSelect = (option: SeriesOption | null) => {
    setSelectedSeries(option);
    updateData("series", { ...series, title: option?.name ?? null });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">بيانات الناشر</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>اسم الناشر</Label>
          <SearchableSelect
            searchEndpoint="https://localhost:8080/api/Book/publishers/names" // ✅ endpoint صح
            searchParam="publisherName" // ✅ query param صح
            value={selectedPublisher}
            onSelect={(opt) => handlePublisherSelect(opt as PublisherOption | null)}
            placeholder="ابحث عن الناشر..."
            addPromptLabel="أدخل اسم الناشر الجديد:"
            localOptions={localPublishers}
            onAdd={(name) => {
              const newPub: PublisherOption = { id: 0, name };
              setLocalPublishers((prev) => [...prev, newPub]);
              return newPub;
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>مكان النشر</Label>
          <Input
            value={pub.place ?? ""}
            onChange={(e) => handlePlaceChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>سنة النشر</Label>
          <Input
            type="number"
            value={pub.year ?? ""}
            onChange={(e) => updatePub("year", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>الطبعة</Label>
          <Input value={pub.edition ?? ""} onChange={(e) => updatePub("edition", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>رقم الإيداع</Label>
          <Input value={pub.depositNumber ?? ""} onChange={(e) => updatePub("depositNumber", e.target.value)} />
        </div>
      </div>

      <h3 className="text-lg font-semibold">بيانات السلسلة</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>السلسلة</Label>
          <SearchableSelect
            searchEndpoint="https://localhost:8080/api/Book/series/titles" // ✅ endpoint صح
            searchParam="seriesName" // ✅ query param صح
            value={selectedSeries}
            onSelect={(opt) => handleSeriesSelect(opt as SeriesOption | null)}
            placeholder="ابحث عن السلسلة..."
            addPromptLabel="أدخل اسم السلسلة الجديدة:"
            localOptions={localSeries}
            onAdd={(name) => {
              const newSeries: SeriesOption = { id: 0, name };
              setLocalSeries((prev) => [...prev, newSeries]);
              return newSeries;
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>عدد الأجزاء</Label>
          <Input value={series.partCount ?? ""} onChange={(e) => updateSeries("partCount", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>السلسلة الفرعية</Label>
          <Input value={series.subSeriesTitle ?? ""} onChange={(e) => updateSeries("subSeriesTitle", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>أجزاء السلسلة الفرعية</Label>
          <Input value={series.subSeriesPartNumber ?? ""} onChange={(e) => updateSeries("subSeriesPartNumber", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>رقم الجزء</Label>
          <Input value={series.partNumber ?? ""} onChange={(e) => updateSeries("partNumber", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>ملاحظة السلسلة</Label>
          <Textarea
            rows={2}
            value={series.note ?? ""}
            onChange={(e) => updateSeries("note", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}