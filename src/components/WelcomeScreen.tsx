import React from 'react';
import { Language, UI_TEXT } from '../data/quizConfig';
import { PostageStamp, EnvelopeIllustration } from './PostcardDecor';

interface WelcomeScreenProps {
  lang: Language;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ lang, onStart }) => {
  const content = UI_TEXT.welcome;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[72vh] max-w-xl mx-auto px-4 py-8 text-center animate-fade-in">
      {/* Decorative top-right postage stamp */}
      <div className="absolute -top-2 right-2 sm:right-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
        <PostageStamp />
      </div>

      {/* Envelope motif */}
      <div className="mb-6 transform -rotate-1 hover:rotate-1 transition-transform duration-300">
        <EnvelopeIllustration />
      </div>

      {/* Editorial eyebrow label */}
      <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-[#B83660] font-semibold">
        {content.badge[lang]}
      </div>

      {/* Main Greeting */}
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#321622] mb-4 text-balance leading-tight">
        {content.greeting[lang]}
      </h1>

      {/* Supporting text */}
      <p className="text-base sm:text-lg text-[#7E5868] max-w-md mx-auto mb-8 font-normal leading-relaxed">
        {content.subtext[lang]}
      </p>

      {/* Primary CTA */}
      <div className="w-full max-w-xs mx-auto">
        <button
          type="button"
          onClick={onStart}
          className="group relative w-full min-h-[52px] px-8 py-3.5 rounded-xl bg-[#D44A74] hover:bg-[#B83660] active:scale-[0.98] text-white text-base font-semibold shadow-md shadow-[#D44A74]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{content.button[lang]}</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {/* Tiny handcrafted footer note */}
      <div className="mt-12 text-[11px] text-[#A67E8E] font-mono flex items-center gap-2">
        <span>Handcrafted with warmth</span>
        <span aria-hidden="true">·</span>
        <span>Almaty Time</span>
      </div>
    </div>
  );
};
