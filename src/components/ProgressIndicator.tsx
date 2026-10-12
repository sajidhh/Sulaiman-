import React from 'react';
import { Language, UI_TEXT } from '../data/quizConfig';

interface ProgressIndicatorProps {
  currentStep: number; // 1 to 6 (1-5 are questions, 6 is free response)
  totalSteps: number;
  lang: Language;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  lang,
}) => {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto px-1 py-2 text-xs text-[#7E5868]">
      <div className="font-mono tracking-wider text-[11px] font-medium text-[#B83660]">
        {lang === 'kk'
          ? `${currentStep} / ${totalSteps} қадам`
          : `Step ${currentStep} of ${totalSteps}`}
      </div>

      {/* Progress track */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCurrent = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isCurrent
                  ? 'w-6 bg-[#D44A74]'
                  : isCompleted
                  ? 'w-2 bg-[#D44A74]/50'
                  : 'w-2 bg-[#E8D2DB]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
