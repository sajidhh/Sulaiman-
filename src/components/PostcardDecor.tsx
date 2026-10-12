import React from 'react';

export const PostageStamp: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center p-2 bg-[#FBF0F4] border-2 border-dashed border-[#D44A74]/40 rounded-sm select-none ${className}`}
      style={{
        boxShadow: '0 2px 8px rgba(212, 74, 116, 0.08)',
      }}
    >
      <div className="flex flex-col items-center justify-center px-2 py-1 border border-[#D44A74]/20 bg-white/80">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#B83660]/70 font-semibold">
          KAZAKHSTAN
        </span>
        <div className="my-1 text-[#D44A74]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <span className="font-mono text-[8px] text-[#7E5868]">SPECIAL DELIVERY</span>
      </div>
      {/* Postal cancellation mark lines */}
      <svg
        className="absolute -right-7 top-1 text-[#D44A74]/25 pointer-events-none w-10 h-7"
        viewBox="0 0 60 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M 0 10 Q 15 5 30 10 T 60 10" />
        <path d="M 0 20 Q 15 15 30 20 T 60 20" />
        <path d="M 0 30 Q 15 25 30 30 T 60 30" />
      </svg>
    </div>
  );
};

export const EnvelopeIllustration: React.FC<{ isOpen?: boolean; className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <svg width="84" height="64" viewBox="0 0 84 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Envelope Body */}
        <rect x="2" y="10" width="80" height="52" rx="4" fill="#FFF7F9" stroke="#E8D2DB" strokeWidth="2" />
        {/* Envelope bottom flap folds */}
        <path d="M2 62L42 36L82 62" stroke="#E8D2DB" strokeWidth="1.5" strokeLinejoin="round" fill="#FDF0F4" fillOpacity="0.5" />
        {/* Envelope side folds */}
        <path d="M2 12L34 38L2 62" stroke="#E8D2DB" strokeWidth="1" />
        <path d="M82 12L50 38L82 62" stroke="#E8D2DB" strokeWidth="1" />
        {/* Letter paper peeking out */}
        <rect x="14" y="2" width="56" height="36" rx="2" fill="#FFFFFF" stroke="#F0D5DF" strokeWidth="1.5" />
        <line x1="22" y1="12" x2="62" y2="12" stroke="#E8D2DB" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="18" x2="52" y2="18" stroke="#E8D2DB" strokeWidth="1.5" strokeLinecap="round" />
        {/* Little heart seal on paper */}
        <circle cx="42" cy="24" r="5" fill="#FBE6ED" />
        <path
          d="M42 27.2l-.5-.45C39.7 25.1 38.5 24 38.5 22.7c0-1.1.9-2 2-2 .6 0 1.2.3 1.5.8.3-.5.9-.8 1.5-.8 1.1 0 2 .9 2 2 0 1.3-1.2 2.4-3 4.05l-.5.45z"
          fill="#D44A74"
        />
        {/* Top flap */}
        <path d="M2 10L42 36L82 10" stroke="#D44A74" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.6" />
      </svg>
    </div>
  );
};
