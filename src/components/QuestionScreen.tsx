import React, { useState } from 'react';
import { QuestionConfig, Language, UI_TEXT } from '../data/quizConfig';
import { AnswerState } from '../types';

interface QuestionScreenProps {
  question: QuestionConfig;
  lang: Language;
  currentAnswer?: AnswerState;
  onSaveAnswer: (answer: AnswerState) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstQuestion: boolean;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  lang,
  currentAnswer,
  onSaveAnswer,
  onNext,
  onBack,
  isFirstQuestion,
}) => {
  const isQ1 = question.id === 'q1_missing_amount';

  // Selected option state
  const [selectedOptId, setSelectedOptId] = useState<string | null>(
    currentAnswer?.selectedOptionId || null
  );

  // Custom text state
  const [customText, setCustomText] = useState<string>(
    currentAnswer?.customText || ''
  );

  // For Q1 reveal state
  const [revealedQ1, setRevealedQ1] = useState<boolean>(Boolean(currentAnswer?.selectedOptionId));

  // Current selected option config
  const selectedOptionConfig = question.options.find((o) => o.id === selectedOptId);
  const isCustomSelected = selectedOptionConfig?.isCustom;

  // Handle option selection
  const handleSelectOption = (optId: string) => {
    setSelectedOptId(optId);
    const opt = question.options.find((o) => o.id === optId);

    if (isQ1) {
      setRevealedQ1(true);
    }

    const updated: AnswerState = {
      questionId: question.id,
      questionText: question.title[lang],
      selectedOptionId: optId,
      selectedOptionText: opt ? opt.label[lang] : null,
      customText: opt?.isCustom ? customText : null,
      skipped: false,
      answeredAt: new Date().toISOString(),
    };
    onSaveAnswer(updated);
  };

  // Handle custom text change
  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCustomText(text);

    const updated: AnswerState = {
      questionId: question.id,
      questionText: question.title[lang],
      selectedOptionId: selectedOptId,
      selectedOptionText: selectedOptionConfig?.label[lang] || null,
      customText: text,
      skipped: false,
      answeredAt: new Date().toISOString(),
    };
    onSaveAnswer(updated);
  };

  // Can advance?
  const canProceed = Boolean(
    selectedOptId && (!isCustomSelected || customText.trim().length > 0)
  );

  return (
    <div className="flex flex-col justify-between max-w-xl mx-auto px-4 py-4 min-h-[68vh] animate-fade-in">
      {/* Top Question Header */}
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-[#B83660] font-medium mb-2">
          {UI_TEXT.common.questionOf[lang](question.number, 5)}
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#321622] leading-snug mb-6 text-balance">
          {question.title[lang]}
        </h2>

        {/* ======================= QUESTION 1 SPECIAL FLOW ======================= */}
        {isQ1 ? (
          <div className="space-y-4">
            {/* Options list */}
            <div className="grid gap-3">
              {question.options.map((opt) => {
                const isSelected = selectedOptId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`min-h-[52px] w-full px-5 py-3.5 rounded-xl text-left text-sm sm:text-base font-medium transition-all duration-200 border cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FBE6ED] border-[#D44A74] text-[#321622] shadow-xs'
                        : 'bg-white hover:bg-[#FAF0F4] border-[#E8D2DB] text-[#472230]'
                    }`}
                  >
                    <span>{opt.label[lang]}</span>
                    {isSelected && (
                      <span className="text-[#D44A74] text-xs font-mono font-bold shrink-0 ml-2">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dramatic cute reveal for Question 1 */}
            {revealedQ1 && question.forcedReveal && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-[#FFF2F6] to-[#FCE7EF] border border-[#F0B8CA] shadow-sm animate-scale-up text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#D44A74]/10 text-[#D44A74] mb-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#B83660] tracking-wide mb-1">
                  {question.forcedReveal[lang]}
                </div>
                <div className="text-xs text-[#7E5868] font-sans">
                  {lang === 'kk'
                    ? 'Қай нұсқаны таңдасаң да, шындық осы 🤭'
                    : 'No matter what you picked, this is the official truth 🤭'}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================= QUESTIONS 2 TO 5 FLOW ======================= */
          <div className="space-y-4">
            {/* Options list */}
            <div className="grid gap-2.5">
              {question.options.map((opt) => {
                const isSelected = selectedOptId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`min-h-[50px] w-full px-4 py-3 rounded-xl text-left text-sm sm:text-base font-medium transition-all duration-200 border cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FBE6ED] border-[#D44A74] text-[#321622] shadow-xs'
                        : 'bg-white hover:bg-[#FAF0F4] border-[#E8D2DB] text-[#472230]'
                    }`}
                  >
                    <span>{opt.label[lang]}</span>
                    {isSelected && (
                      <span className="text-[#D44A74] text-xs font-mono font-bold shrink-0 ml-2">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Input Box if chosen */}
            {isCustomSelected && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-[#D44A74]/50 shadow-xs animate-fade-in">
                <label
                  htmlFor={`custom-input-${question.id}`}
                  className="block text-xs font-mono text-[#B83660] font-medium mb-1.5"
                >
                  {lang === 'kk' ? 'Өз жауабың:' : 'Your custom answer:'}
                </label>
                <textarea
                  id={`custom-input-${question.id}`}
                  value={customText}
                  onChange={handleCustomTextChange}
                  placeholder={UI_TEXT.common.customPlaceholder[lang]}
                  rows={3}
                  className="w-full p-3 text-sm sm:text-base text-[#321622] placeholder-[#A67E8E] bg-[#FFF8FA] rounded-lg border border-[#E8D2DB] focus:border-[#D44A74] focus:outline-none focus:ring-1 focus:ring-[#D44A74] transition-all resize-none"
                />
                <div className="text-right text-[11px] font-mono text-[#7E5868] mt-1">
                  {customText.length} / 500
                </div>
              </div>
            )}

            {/* Reaction badge if regular option chosen */}
            {!isCustomSelected && selectedOptionConfig?.reaction && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#FFF5F8] border border-[#F0B8CA] text-xs sm:text-sm font-medium text-[#B83660] flex items-center gap-2 animate-fade-in">
                <span className="shrink-0 text-base">💬</span>
                <span>{selectedOptionConfig.reaction[lang]}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-8 border-t border-[#E8D2DB]/60 mt-8">
        {!isFirstQuestion ? (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium text-[#7E5868] hover:text-[#321622] hover:bg-[#F3E2E9]/50 rounded-lg transition-colors cursor-pointer"
          >
            {UI_TEXT.common.back[lang]}
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`min-h-[46px] px-6 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            canProceed
              ? 'bg-[#D44A74] hover:bg-[#B83660] text-white shadow-sm shadow-[#D44A74]/20 active:scale-[0.98]'
              : 'bg-[#E8D2DB] text-[#9A7585] cursor-not-allowed opacity-70'
          }`}
        >
          <span>{UI_TEXT.common.continue[lang]}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
};
