export interface AnswerState {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  customText: string | null;
  skipped: boolean;
  answeredAt: string;
}

export interface SubmissionData {
  id: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  completedAt: string | null;
  language: 'kk' | 'en';
  answers: Record<string, AnswerState>;
}
