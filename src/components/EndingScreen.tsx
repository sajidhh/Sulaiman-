import React from 'react';
import { Language, SIGNATURE_TEXT, UI_TEXT } from '../data/quizConfig';
import { PostageStamp } from './PostcardDecor';

interface EndingScreenProps {
  lang: Language;
  onReplay: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ lang, onReplay }) => {
  const content = UI_TEXT.ending;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[72vh] max-w-xl mx-auto px-4 py-8 animate-fade-in">
      {/* Postcard Frame container */}
      <div className="relative w-full p-6 sm:p-10 rounded-3xl bg-white border border-[#E8D2DB] shadow-md shadow-[#D44A74]/5">
        {/* Subtle decorative postmark stamp */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <PostageStamp />
        </div>

        {/* Small greeting label */}
        <div className="font-mono text-[11px] uppercase tracking-widest text-[#B83660] font-semibold mb-6">
          {lang === 'kk' ? 'ХАТ СОҢЫ · POSTCARD ENDING' : 'SIGNED & DELIVERED · POSTCARD'}
        </div>

        {/* Main message */}
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#321622] leading-snug mb-4 max-w-md text-balance">
          {content.heading[lang]}
        </h2>

        {/* Supporting text */}
        <p className="text-base sm:text-lg text-[#7E5868] mb-8 leading-relaxed max-w-md">
          {content.subtext[lang]}
        </p>

        {/* Divider hairline */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E8D2DB] to-transparent my-6" />

        {/* Required Signature */}
        <div className="text-right">
          <span className="font-serif italic text-xl sm:text-2xl font-bold text-[#B83660] select-none tracking-wide">
            {SIGNATURE_TEXT}
          </span>
        </div>
      </div>

      {/* Replay Button */}
      <div className="mt-8 flex items-center justify-center">
        <button
          type="button"
          onClick={onReplay}
          className="min-h-[46px] px-6 py-2.5 rounded-xl bg-white hover:bg-[#FAF0F4] border border-[#E8D2DB] text-[#7E5868] hover:text-[#321622] text-sm font-medium transition-all duration-200 shadow-2xs active:scale-[0.98] flex items-center gap-2 cursor-pointer"
        >
          <span>{content.replayButton[lang]}</span>
        </button>
      </div>
    </div>
  );
};
