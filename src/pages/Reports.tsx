import { motion } from "framer-motion";
import { Construction, Wrench, Settings, ShieldCheck } from "lucide-react";

const Reports = () => {
  return (
    <div dir="rtl" className="min-h-[70vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 150 }}
          className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 border-2 border-amber-500/30 flex items-center justify-center"
        >
          <Construction className="w-12 h-12 text-amber-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          صفحة التقارير تحت الصيانة
        </h1>
        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          يعمل فريق الدعم الفني حالياً على تطوير وتحسين نظام التقارير لتقديم تجربة أفضل وأكثر دقة.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Wrench, label: "تحسين الأداء", color: "text-primary" },
            { icon: Settings, label: "تحديث البيانات", color: "text-amber-500" },
            { icon: ShieldCheck, label: "تعزيز الأمان", color: "text-emerald-500" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
              <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>

      
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">جارٍ العمل على التحديثات</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
