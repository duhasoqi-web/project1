import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; icon: React.ReactNode }[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isDone = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  isDone
                    ? "bg-wizard-done text-primary-foreground shadow-md"
                    : isActive
                    ? "bg-wizard-active text-primary-foreground shadow-lg ring-4 ring-wizard-active/20 scale-110"
                    : "bg-wizard-pending text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                  isActive
                    ? "text-wizard-active"
                    : isDone
                    ? "text-wizard-done"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="mx-3 mt-[-20px] h-0.5 w-16 rounded-full transition-colors duration-300">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone ? "bg-wizard-done" : "bg-wizard-connector"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
