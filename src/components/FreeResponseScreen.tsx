import React, { useState } from 'react';
import { Language, UI_TEXT } from '../data/quizConfig';
import { AnswerState } from '../types';

interface FreeResponseScreenProps {
  lang: Language;
  currentAnswer?: AnswerState;
  onSaveAndFinish: (text: string, skipped: boolean) => void;
  onBack: () => void;
  isSaving: boolean;
  saveError: string | null;
}

export const FreeResponseScreen: React.FC<FreeResponseScreenProps> = ({
  lang,
  currentAnswer,
  onSaveAndFinish,
  onBack,
  isSaving,
  saveError,
}) => {
  const content = UI_TEXT.freeResponse;
  const [text, setText] = useState<string>(currentAnswer?.customText || '');

  const handleFinish = (skipped = false) => {
    onSaveAndFinish(text, skipped);
  };

  return (
    <div className="flex flex-col justify-between max-w-xl mx-auto px-4 py-4 min-h-[68vh] animate-fade-in">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-[#B83660] font-medium mb-2">
          {lang === 'kk' ? 'Соңғы қадам · 06' : 'Final Step · 06'}
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#321622] leading-tight mb-3 text-balance">
          {content.heading[lang]}
        </h2>

        <p className="text-sm sm:text-base text-[#7E5868] mb-6 leading-relaxed">
          {content.subtext[lang]}
        </p>

        {/* Free text input container */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8D2DB] shadow-xs focus-within:border-[#D44A74] focus-within:ring-1 focus-within:ring-[#D44A74] transition-all">
          <label htmlFor="saltanat-free-response" className="sr-only">
            {content.heading[lang]}
          </label>
          <textarea
            id="saltanat-free-response"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={content.placeholder[lang]}
            rows={5}
            className="w-full text-sm sm:text-base text-[#321622] placeholder-[#A67E8E] bg-transparent border-0 focus:outline-none resize-none leading-relaxed"
            disabled={isSaving}
          />
          <div className="flex items-center justify-between pt-2 border-t border-[#F3E2E9] text-[11px] font-mono text-[#7E5868]">
            <span>Kazakh Cyrillic, emojis & line breaks welcome</span>
            <span>{text.length} / 1500</span>
          </div>
        </div>

        {/* Transparent notice */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#FAF0F4] border border-[#E8D2DB] text-xs text-[#7E5868] leading-relaxed flex items-start gap-2.5">
          <span className="shrink-0 text-sm mt-0.5">💌</span>
          <p>{UI_TEXT.notice[lang]}</p>
        </div>

        {/* Save error message if any */}
        {saveError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {saveError}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#E8D2DB]/60 mt-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBack}
            disabled={isSaving}
            className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium text-[#7E5868] hover:text-[#321622] hover:bg-[#F3E2E9]/50 rounded-lg transition-colors cursor-pointer"
          >
            {UI_TEXT.common.back[lang]}
          </button>

          <button
            type="button"
            onClick={() => handleFinish(true)}
            disabled={isSaving}
            className="min-h-[44px] px-3 py-2 text-xs text-[#A67E8E] hover:text-[#7E5868] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            {content.skipButton[lang]}
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleFinish(false)}
          disabled={isSaving}
          className="min-h-[48px] w-full sm:w-auto px-7 py-3 rounded-xl bg-[#D44A74] hover:bg-[#B83660] active:scale-[0.98] text-white font-semibold text-sm sm:text-base shadow-sm shadow-[#D44A74]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSaving ? (
            <span>{UI_TEXT.common.saving[lang]}</span>
          ) : (
            <>
              <span>{content.saveButton[lang]}</span>
              <span aria-hidden="true">✨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
