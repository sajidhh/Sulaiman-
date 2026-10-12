import React, { useState, useEffect, useCallback } from 'react';
import { Language, QUESTIONS_CONFIG } from './data/quizConfig';
import { AnswerState } from './types';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ProgressIndicator } from './components/ProgressIndicator';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { FreeResponseScreen } from './components/FreeResponseScreen';
import { EndingScreen } from './components/EndingScreen';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { adminFetch } from './utils/adminAuth';

type ScreenState = 'welcome' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'free_response' | 'ending';

export default function App() {
  // Language state (default Kazakh)
  const [lang, setLang] = useState<Language>('kk');

  // Screen state
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('welcome');

  // Session ID for response tracking
  const [sessionId, setSessionId] = useState<string>(() => {
    return 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  });

  // Collected answers dictionary
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Admin routing state
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Check admin session if on admin route
  useEffect(() => {
    const handleLocationChange = () => {
      const onAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setIsAdminRoute(onAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (isAdminRoute) {
      adminFetch('/api/admin/check')
        .then((res) => res.json())
        .then((data) => {
          setIsAdminAuthenticated(Boolean(data.authenticated));
        })
        .catch(() => setIsAdminAuthenticated(false));
    }
  }, [isAdminRoute]);

  // Sync answers to backend helper
  const syncAnswersToBackend = useCallback(
    async (
      updatedAnswers: Record<string, AnswerState>,
      completed = false
    ) => {
      try {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            answers: updatedAnswers,
            completed,
            language: lang,
          }),
        });
      } catch (err) {
        console.error('Failed to sync answer in background:', err);
      }
    },
    [sessionId, lang]
  );

  // Save single question answer
  const handleSaveAnswer = (answer: AnswerState) => {
    setAnswers((prev) => {
      const next = { ...prev, [answer.questionId]: answer };
      syncAnswersToBackend(next, false);
      return next;
    });
  };

  // Submit final free response & finish
  const handleFinalSaveAndFinish = async (text: string, skipped: boolean) => {
    setIsSaving(true);
    setSaveError(null);

    const freeAnswer: AnswerState = {
      questionId: 'free_response',
      questionText: 'Final Free Response',
      selectedOptionId: null,
      selectedOptionText: null,
      customText: text.trim().length > 0 ? text : null,
      skipped,
      answeredAt: new Date().toISOString(),
    };

    const finalAnswers = { ...answers, free_response: freeAnswer };
    setAnswers(finalAnswers);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers: finalAnswers,
          completed: true,
          language: lang,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save your response.');
      }

      setCurrentScreen('ending');
    } catch (err: unknown) {
      console.error(err);
      setSaveError(
        lang === 'kk'
          ? 'Жауапты сақтау кезінде қате орын алды. Қайта көріңіз.'
          : 'Could not save response to server. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Screen transition handlers
  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminRoute(true);
  };

  const navigateToPublic = () => {
    window.history.pushState(null, '', '/');
    setIsAdminRoute(false);
  };

  // Replay without wiping previously recorded submission
  const handleReplay = () => {
    setCurrentScreen('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Admin View
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#FAF5F5] text-[#321622] py-6 selection:bg-[#F2BAC9]">
        {isAdminAuthenticated ? (
          <AdminDashboard
            onLogout={() => setIsAdminAuthenticated(false)}
            onExit={navigateToPublic}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
            onExit={navigateToPublic}
          />
        )}
      </div>
    );
  }

  // Calculate current step number for progress indicator (1 to 6)
  let currentStepNumber = 0;
  if (currentScreen === 'q1') currentStepNumber = 1;
  else if (currentScreen === 'q2') currentStepNumber = 2;
  else if (currentScreen === 'q3') currentStepNumber = 3;
  else if (currentScreen === 'q4') currentStepNumber = 4;
  else if (currentScreen === 'q5') currentStepNumber = 5;
  else if (currentScreen === 'free_response') currentStepNumber = 6;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF5F5] text-[#321622] selection:bg-[#F2BAC9]">
      {/* ======================= TOP BAR CONTRACT ======================= */}
      <header className="sticky top-0 z-30 bg-[#FAF5F5]/85 backdrop-blur-md border-b border-[#E8D2DB]/70 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setCurrentScreen('welcome')}
            className="text-left font-serif text-lg sm:text-xl font-bold tracking-tight text-[#321622] hover:text-[#B83660] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Saltanat <span>💗</span>
          </button>

          {/* Zone 2: Progress or Subtle Center Note */}
          <div className="hidden sm:block text-xs font-mono text-[#7E5868] whitespace-nowrap shrink-0">
            {currentScreen === 'welcome' && (
              <span>Almaty · Special Postcard</span>
            )}
            {currentScreen === 'ending' && (
              <span>Completed With Warmth</span>
            )}
            {currentStepNumber > 0 && (
              <span>Step 0{currentStepNumber} of 06</span>
            )}
          </div>

          {/* Zone 3: Language Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />
          </div>
        </div>
      </header>

      {/* Optional Progress Track for Quiz Steps */}
      {currentStepNumber > 0 && currentScreen !== 'ending' && (
        <div className="pt-2">
          <ProgressIndicator
            currentStep={currentStepNumber}
            totalSteps={6}
            lang={lang}
          />
        </div>
      )}

      {/* ======================= MAIN EXPERIENCE VIEWPORT ======================= */}
      <main className="flex-1 flex flex-col justify-center py-4 sm:py-8">
        {currentScreen === 'welcome' && (
          <WelcomeScreen lang={lang} onStart={() => setCurrentScreen('q1')} />
        )}

        {currentScreen === 'q1' && (
          <QuestionScreen
            question={QUESTIONS_CONFIG[0]}
            lang={lang}
            currentAnswer={answers['q1_missing_amount']}
            onSaveAnswer={handleSaveAnswer}
            onNext={() => setCurrentScreen('q2')}
            onBack={() => setCurrentScreen('welcome')}
            isFirstQuestion={true}
          />
        )}

        {currentScreen === 'q2' && (
          <QuestionScreen
            question={QUESTIONS_CONFIG[1]}
            lang={lang}
            currentAnswer={answers['q2_why_missed']}
            onSaveAnswer={handleSaveAnswer}
            onNext={() => setCurrentScreen('q3')}
            onBack={() => setCurrentScreen('q1')}
            isFirstQuestion={false}
          />
        )}

        {currentScreen === 'q3' && (
          <QuestionScreen
            question={QUESTIONS_CONFIG[2]}
            lang={lang}
            currentAnswer={answers['q3_reels']}
            onSaveAnswer={handleSaveAnswer}
            onNext={() => setCurrentScreen('q4')}
            onBack={() => setCurrentScreen('q2')}
            isFirstQuestion={false}
          />
        )}

        {currentScreen === 'q4' && (
          <QuestionScreen
            question={QUESTIONS_CONFIG[3]}
            lang={lang}
            currentAnswer={answers['q4_opinion']}
            onSaveAnswer={handleSaveAnswer}
            onNext={() => setCurrentScreen('q5')}
            onBack={() => setCurrentScreen('q3')}
            isFirstQuestion={false}
          />
        )}

        {currentScreen === 'q5' && (
          <QuestionScreen
            question={QUESTIONS_CONFIG[4]}
            lang={lang}
            currentAnswer={answers['q5_dramatic']}
            onSaveAnswer={handleSaveAnswer}
            onNext={() => setCurrentScreen('free_response')}
            onBack={() => setCurrentScreen('q4')}
            isFirstQuestion={false}
          />
        )}

        {currentScreen === 'free_response' && (
          <FreeResponseScreen
            lang={lang}
            currentAnswer={answers['free_response']}
            onSaveAndFinish={handleFinalSaveAndFinish}
            onBack={() => setCurrentScreen('q5')}
            isSaving={isSaving}
            saveError={saveError}
          />
        )}

        {currentScreen === 'ending' && (
          <EndingScreen lang={lang} onReplay={handleReplay} />
        )}
      </main>

      {/* ======================= MINIMAL FOOTER ======================= */}
      <footer className="py-4 px-6 border-t border-[#E8D2DB]/40 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#A67E8E]">
          <div>
            A gentle surprise for Saltanat · 2026
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={navigateToAdmin}
              className="text-[#B83660] hover:underline cursor-pointer"
            >
              🔒 Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
