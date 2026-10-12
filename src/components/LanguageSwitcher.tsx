import React from 'react';
import { Language } from '../data/quizConfig';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center p-1 rounded-lg bg-[#F3E2E9]/70 border border-[#E8D2DB] text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => onLanguageChange('kk')}
        aria-pressed={currentLang === 'kk'}
        className={`min-h-[36px] px-3 py-1.5 rounded-md transition-all duration-150 flex items-center justify-center font-mono ${
          currentLang === 'kk'
            ? 'bg-white text-[#B83660] shadow-xs font-semibold'
            : 'text-[#7E5868] hover:text-[#321622]'
        }`}
      >
        ҚАЗ
      </button>
      <span className="text-[#D44A74]/30 px-0.5 select-none font-mono">/</span>
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        aria-pressed={currentLang === 'en'}
        className={`min-h-[36px] px-3 py-1.5 rounded-md transition-all duration-150 flex items-center justify-center font-mono ${
          currentLang === 'en'
            ? 'bg-white text-[#B83660] shadow-xs font-semibold'
            : 'text-[#7E5868] hover:text-[#321622]'
        }`}
      >
        ENG
      </button>
    </div>
  );
};
