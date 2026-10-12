import React, { useState, useEffect } from 'react';
import { SubmissionData } from '../types';
import { QUESTIONS_CONFIG, UI_TEXT } from '../data/quizConfig';
import { adminFetch, getAdminToken, clearAdminToken } from '../utils/adminAuth';

interface AdminDashboardProps {
  onLogout: () => void;
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onExit }) => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected session for detailed drawer / modal view
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy feedback state
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/submissions');
      if (res.status === 401) {
        clearAdminToken();
        onLogout();
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load submissions.');
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setTotalCount(data.totalCount || 0);
      setCompletedCount(data.completedCount || 0);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
        setDeletingId(null);
      } else {
        alert('Failed to delete submission.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyAnswers = (sub: SubmissionData) => {
    let text = `💌 Saltanat's Quiz Responses\n`;
    text += `Submitted: ${new Date(sub.createdAt).toLocaleString()}\n`;
    text += `Status: ${sub.completed ? 'Completed' : 'In Progress'}\n`;
    text += `Language: ${sub.language === 'kk' ? 'Kazakh' : 'English'}\n\n`;

    QUESTIONS_CONFIG.forEach((q) => {
      const ans = sub.answers[q.id];
      text += `${q.number}. ${q.title.en} (${q.title.kk})\n`;
      if (!ans) {
        text += `   [Not answered]\n\n`;
      } else if (ans.skipped) {
        text += `   [Skipped]\n\n`;
      } else if (ans.customText) {
        text += `   Custom Answer: ${ans.customText}\n\n`;
      } else {
        text += `   Selected: ${ans.selectedOptionText || 'None'}\n\n`;
      }
    });

    const free = sub.answers['free_response'];
    text += `6. Free Response (Her Turn):\n`;
    if (!free) {
      text += `   [Not answered]\n`;
    } else if (free.skipped) {
      text += `   [Skipped]\n`;
    } else {
      text += `   ${free.customText || 'No text'}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedSessionId(sub.id);
    setTimeout(() => setCopiedSessionId(null), 2500);
  };

  const handleDownloadCsv = () => {
    const token = getAdminToken();
    const url = token
      ? `/api/admin/export-csv?token=${encodeURIComponent(token)}`
      : '/api/admin/export-csv';
    window.location.href = url;
  };

  const handleSignOut = async () => {
    try {
      await adminFetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    clearAdminToken();
    onLogout();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in text-[#321622]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8D2DB]">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-[#B83660] font-semibold mb-1">
            SECRET ADMIN DASHBOARD
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#321622]">
            Saltanat's Responses
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[40px] px-3.5 py-2 text-xs font-mono text-[#7E5868] hover:text-[#321622] hover:bg-[#FAF0F4] rounded-lg transition-colors border border-[#E8D2DB] cursor-pointer"
          >
            ← Public View
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-[#321622] bg-white hover:bg-[#FAF0F4] border border-[#E8D2DB] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥 Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-5 rounded-2xl bg-white border border-[#E8D2DB] shadow-2xs">
          <div className="text-xs font-mono text-[#7E5868] uppercase tracking-wider mb-1">
            Total Submissions
          </div>
          <div className="font-serif text-3xl font-bold text-[#321622] tabular-nums">
            {totalCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8D2DB] shadow-2xs">
          <div className="text-xs font-mono text-[#7E5868] uppercase tracking-wider mb-1">
            Fully Completed
          </div>
          <div className="font-serif text-3xl font-bold text-[#D44A74] tabular-nums">
            {completedCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8D2DB] shadow-2xs">
          <div className="text-xs font-mono text-[#7E5868] uppercase tracking-wider mb-1">
            Latest Activity
          </div>
          <div className="text-sm font-mono text-[#321622] truncate">
            {submissions[0]
              ? new Date(submissions[0].updatedAt).toLocaleString()
              : 'No activity yet'}
          </div>
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#7E5868]">
          Loading responses...
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={fetchSubmissions}
            className="ml-4 font-bold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : submissions.length === 0 ? (
        /* Honest Empty State */
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E8D2DB] shadow-2xs my-4">
          <div className="text-4xl mb-3">💌</div>
          <h3 className="font-serif text-xl font-bold text-[#321622] mb-1">
            No Submissions Yet
          </h3>
          <p className="text-xs text-[#7E5868] max-w-sm mx-auto">
            When Saltanat opens the link and interacts with the quiz, her answers will be safely saved and presented right here.
          </p>
        </div>
      ) : (
        /* Submissions Table / Cards */
        <div className="space-y-4">
          <div className="text-xs font-mono text-[#7E5868] flex items-center justify-between">
            <span>SHOWING {submissions.length} RESPONSE SESSION(S)</span>
            <button
              type="button"
              onClick={fetchSubmissions}
              className="text-[#D44A74] hover:underline cursor-pointer"
            >
              ↻ Refresh
            </button>
          </div>

          <div className="grid gap-3">
            {submissions.map((sub) => {
              const free = sub.answers['free_response'];
              const hasFreeText = Boolean(free?.customText);

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-white border border-[#E8D2DB] shadow-2xs hover:border-[#D44A74]/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F3E2E9]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#B83660]">
                        {sub.id.slice(0, 8)}...
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-semibold uppercase ${
                          sub.completed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub.completed ? 'Finished' : 'In Progress'}
                      </span>
                      <span className="text-[11px] font-mono text-[#7E5868]">
                        Lang: {sub.language.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-[#7E5868]">
                      {new Date(sub.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  <div className="py-3 text-xs sm:text-sm text-[#472230] space-y-1.5">
                    <div>
                      <span className="font-medium text-[#7E5868]">Q1 Missed: </span>
                      <span>
                        {sub.answers['q1_missing_amount']?.selectedOptionText || '—'}
                      </span>
                    </div>
                    {hasFreeText && (
                      <div className="p-2.5 rounded-lg bg-[#FAF0F4] border border-[#F0D5DF] text-xs font-sans text-[#321622] italic">
                        "{free?.customText}"
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#F3E2E9]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 rounded-lg bg-[#FBE6ED] hover:bg-[#F8D4E1] text-[#B83660] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View Full Details →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyAnswers(sub)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF0F4] border border-[#E8D2DB] text-xs text-[#7E5868] transition-colors cursor-pointer"
                      >
                        {copiedSessionId === sub.id ? '✓ Copied!' : 'Copy Formatted'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeletingId(sub.id)}
                      className="px-2.5 py-1 text-xs text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= DETAILED MODAL / DRAWER ======================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-[#E8D2DB] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E8D2DB] bg-[#FAF5F5]">
              <div>
                <div className="font-mono text-xs text-[#B83660] font-semibold uppercase">
                  SUBMISSION DETAILS
                </div>
                <div className="font-mono text-xs text-[#7E5868]">
                  ID: {selectedSubmission.id} · Created:{' '}
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#F3E2E9] border border-[#E8D2DB] text-[#7E5868] hover:text-[#321622] flex items-center justify-center text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Ordered questions */}
            <div className="p-6 overflow-y-auto space-y-6">
              {QUESTIONS_CONFIG.map((q) => {
                const ans = selectedSubmission.answers[q.id];
                return (
                  <div key={q.id} className="pb-4 border-b border-[#F3E2E9]">
                    <div className="text-xs font-mono text-[#B83660] font-semibold mb-1">
                      QUESTION {q.number}
                    </div>
                    <div className="text-sm font-medium text-[#321622] mb-2 font-serif text-lg">
                      {q.title.en} <span className="text-sm text-[#7E5868] font-sans">({q.title.kk})</span>
                    </div>

                    {!ans ? (
                      <div className="text-xs text-[#A67E8E] font-mono">[Not answered]</div>
                    ) : ans.skipped ? (
                      <div className="text-xs text-amber-700 font-mono">[Skipped by user]</div>
                    ) : ans.customText ? (
                      <div className="p-3 rounded-xl bg-[#FFF8FA] border border-[#E8D2DB] text-sm text-[#321622] whitespace-pre-wrap leading-relaxed font-sans">
                        <span className="text-xs font-mono text-[#D44A74] block mb-1">Custom typed answer:</span>
                        {ans.customText}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#FBF0F4] border border-[#F0D5DF] text-sm text-[#321622] font-medium">
                        {ans.selectedOptionText}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Free Response */}
              <div className="pt-2">
                <div className="text-xs font-mono text-[#B83660] font-semibold mb-1">
                  FINAL FREE RESPONSE (HER TURN TO TALK)
                </div>
                <div className="text-sm font-medium text-[#321622] mb-2 font-serif text-lg">
                  {UI_TEXT.freeResponse.heading.en}{' '}
                  <span className="text-sm text-[#7E5868] font-sans">
                    ({UI_TEXT.freeResponse.heading.kk})
                  </span>
                </div>

                {(() => {
                  const free = selectedSubmission.answers['free_response'];
                  if (!free) {
                    return <div className="text-xs text-[#A67E8E] font-mono">[Not answered]</div>;
                  }
                  if (free.skipped) {
                    return <div className="text-xs text-amber-700 font-mono">[Skipped by user]</div>;
                  }
                  return (
                    <div className="p-4 rounded-xl bg-[#FFF8FA] border border-[#E8D2DB] text-sm text-[#321622] whitespace-pre-wrap leading-relaxed">
                      {free.customText || '(Empty)'}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E8D2DB] bg-[#FAF5F5] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopyAnswers(selectedSubmission)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF0F4] border border-[#E8D2DB] text-xs font-medium text-[#321622] cursor-pointer"
              >
                {copiedSessionId === selectedSubmission.id ? '✓ Copied to clipboard!' : 'Copy all to clipboard'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 rounded-xl bg-[#321622] hover:bg-[#472230] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE CONFIRMATION MODAL ======================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E8D2DB] shadow-xl text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="font-serif text-lg font-bold text-[#321622] mb-1">
              Delete Submission?
            </h3>
            <p className="text-xs text-[#7E5868] mb-6">
              Are you sure you want to delete this submission session? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium text-[#321622] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
