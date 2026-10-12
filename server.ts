import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Admin Passcode Configuration
// Initial code requested: 3595. Can be overridden by ADMIN_ACCESS_CODE env var.
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || '3595';

// Session & Rate Limiting Storage
interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

const activeSessions = new Map<string, AdminSession>();
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Persistent Storage for Submissions
const DATA_DIR = path.resolve(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  customText: string | null;
  skipped: boolean;
  answeredAt: string;
}

export interface Submission {
  id: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  completedAt: string | null;
  language: 'kk' | 'en';
  answers: Record<string, QuestionAnswer>;
}

function loadSubmissions(): Submission[] {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    return JSON.parse(data) as Submission[];
  } catch (err) {
    console.error('Error reading submissions file:', err);
    return [];
  }
}

function saveSubmissions(submissions: Submission[]): void {
  try {
    const tempFile = `${SUBMISSIONS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(submissions, null, 2), 'utf-8');
    fs.renameSync(tempFile, SUBMISSIONS_FILE);
  } catch (err) {
    console.error('Error writing submissions file:', err);
  }
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Rate Limiting Helper
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number; attemptsLeft: number } {
  const record = failedLoginAttempts.get(ip);
  const now = Date.now();

  if (!record) {
    return { allowed: true, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }

  if (record.lockedUntil > now) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds, attemptsLeft: 0 };
  }

  // If lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    failedLoginAttempts.delete(ip);
    return { allowed: true, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }

  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { allowed: attemptsLeft > 0, attemptsLeft };
}

function recordFailedAttempt(ip: string): { locked: boolean; waitSeconds?: number; attemptsLeft: number } {
  const now = Date.now();
  const record = failedLoginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    failedLoginAttempts.set(ip, record);
    return { locked: true, waitSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000), attemptsLeft: 0 };
  }

  failedLoginAttempts.set(ip, record);
  return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - record.count };
}

function resetFailedAttempts(ip: string): void {
  failedLoginAttempts.delete(ip);
}

// Helper to extract session token from Authorization header, query parameter, or cookie
function extractAdminToken(req: express.Request): string | null {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  // 2. Check query parameter: ?token=<token> (useful for direct file downloads like CSV export)
  if (typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }
  // 3. Check cookie
  if (req.cookies && req.cookies.admin_session) {
    return req.cookies.admin_session;
  }
  return null;
}

// Authentication Middleware for Admin Endpoints
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = extractAdminToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Admin session required.' });
  }

  const session = activeSessions.get(token);
  if (!session) {
    res.clearCookie('admin_session');
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    res.clearCookie('admin_session');
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  next();
}

/* =========================================================
   PUBLIC SUBMISSION ENDPOINTS
   ========================================================= */

// Submit / update Saltanat's responses
app.post('/api/submissions', (req, res) => {
  try {
    const { sessionId, answers, completed, language } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers payload.' });
    }

    const submissions = loadSubmissions();
    const now = new Date().toISOString();

    let targetSubmission: Submission | undefined;

    if (sessionId && typeof sessionId === 'string') {
      targetSubmission = submissions.find((s) => s.id === sessionId);
    }

    if (!targetSubmission) {
      targetSubmission = {
        id: sessionId && typeof sessionId === 'string' ? sessionId : crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        completed: Boolean(completed),
        completedAt: completed ? now : null,
        language: language === 'en' ? 'en' : 'kk',
        answers: {},
      };
      submissions.push(targetSubmission);
    } else {
      targetSubmission.updatedAt = now;
      if (completed) {
        targetSubmission.completed = true;
        targetSubmission.completedAt = targetSubmission.completedAt || now;
      }
      if (language) {
        targetSubmission.language = language === 'en' ? 'en' : 'kk';
      }
    }

    // Merge sanitized answers
    const allowedKeys = ['q1_missing_amount', 'q2_why_missed', 'q3_reels', 'q4_opinion', 'q5_dramatic', 'free_response'];

    for (const key of allowedKeys) {
      if (answers[key]) {
        const item = answers[key];
        targetSubmission.answers[key] = {
          questionId: key,
          questionText: typeof item.questionText === 'string' ? item.questionText.slice(0, 300) : '',
          selectedOptionId: typeof item.selectedOptionId === 'string' ? item.selectedOptionId.slice(0, 100) : null,
          selectedOptionText: typeof item.selectedOptionText === 'string' ? item.selectedOptionText.slice(0, 300) : null,
          customText: typeof item.customText === 'string' ? item.customText.slice(0, 3000) : null,
          skipped: Boolean(item.skipped),
          answeredAt: typeof item.answeredAt === 'string' ? item.answeredAt : now,
        };
      }
    }

    saveSubmissions(submissions);

    return res.json({
      success: true,
      sessionId: targetSubmission.id,
      completed: targetSubmission.completed,
    });
  } catch (err) {
    console.error('Error saving submission:', err);
    return res.status(500).json({ error: 'Server failed to save response.' });
  }
});

/* =========================================================
   ADMIN AUTHENTICATION & MANAGEMENT ENDPOINTS
   ========================================================= */

// Check current admin session
app.get('/api/admin/check', (req, res) => {
  const token = extractAdminToken(req);
  if (!token) {
    return res.json({ authenticated: false });
  }

  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    return res.json({ authenticated: false });
  }

  return res.json({ authenticated: true });
});

// Admin Passcode Login
app.post('/api/admin/login', (req, res) => {
  const ip = getClientIp(req);
  const rateLimitStatus = checkRateLimit(ip);

  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      error: `Too many failed attempts. Locked out for ${rateLimitStatus.waitSeconds} seconds.`,
      locked: true,
      waitSeconds: rateLimitStatus.waitSeconds,
    });
  }

  const { passcode } = req.body;
  const rawCode = passcode !== undefined && passcode !== null ? String(passcode).trim() : '';

  if (rawCode === '') {
    return res.status(400).json({ error: 'Passcode is required.' });
  }

  // Constant-time comparison to prevent timing attacks
  const inputBuffer = Buffer.from(rawCode);
  const targetBuffer = Buffer.from(ADMIN_ACCESS_CODE.trim());

  let isMatch = false;
  if (inputBuffer.length === targetBuffer.length) {
    isMatch = crypto.timingSafeEqual(inputBuffer, targetBuffer);
  }

  if (!isMatch) {
    const failResult = recordFailedAttempt(ip);
    if (failResult.locked) {
      return res.status(429).json({
        error: `Incorrect passcode. Too many failed attempts. Locked for ${failResult.waitSeconds}s.`,
        locked: true,
        waitSeconds: failResult.waitSeconds,
      });
    }

    return res.status(401).json({
      error: `Incorrect passcode. ${failResult.attemptsLeft} attempt(s) remaining.`,
      attemptsLeft: failResult.attemptsLeft,
    });
  }

  // Login successful
  resetFailedAttempts(ip);

  const token = crypto.randomBytes(32).toString('hex');
  const session: AdminSession = {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  activeSessions.set(token, session);

  // Set secure cookie (SameSite=None; Secure=true works in iframes and standalone)
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: SESSION_DURATION_MS,
  });

  return res.json({
    success: true,
    token, // Provided so the frontend can send Authorization: Bearer <token> even when third-party cookies are blocked by browsers in iframes
    message: 'Authenticated successfully.',
  });
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const token = extractAdminToken(req);
  if (token) {
    activeSessions.delete(token);
  }
  res.clearCookie('admin_session');
  return res.json({ success: true, message: 'Logged out.' });
});

// Admin: Get all submissions
app.get('/api/admin/submissions', requireAdminAuth, (_req, res) => {
  try {
    const submissions = loadSubmissions();
    // Sort newest first
    submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCount = submissions.length;
    const completedCount = submissions.filter((s) => s.completed).length;

    return res.json({
      submissions,
      totalCount,
      completedCount,
    });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
});

// Admin: Delete a submission
app.delete('/api/admin/submissions/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    let submissions = loadSubmissions();
    const initialLength = submissions.length;
    submissions = submissions.filter((s) => s.id !== id);

    if (submissions.length === initialLength) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    saveSubmissions(submissions);
    return res.json({ success: true, message: 'Submission deleted.' });
  } catch (err) {
    console.error('Error deleting submission:', err);
    return res.status(500).json({ error: 'Failed to delete submission.' });
  }
});

// Admin: Export CSV
app.get('/api/admin/export-csv', requireAdminAuth, (_req, res) => {
  try {
    const submissions = loadSubmissions();
    submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const headers = [
      'Submission ID',
      'Created At',
      'Last Updated',
      'Status',
      'Language',
      'Q1 (Missing Amount) Choice',
      'Q2 (Why Missed) Choice / Custom',
      'Q3 (Reels) Choice / Custom',
      'Q4 (Opinion About Me) Choice / Custom',
      'Q5 (Who Is Dramatic) Choice / Custom',
      'Free Response (Her Turn)',
    ];

    const escapeCsv = (val: string | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = submissions.map((sub) => {
      const q1 = sub.answers['q1_missing_amount'];
      const q2 = sub.answers['q2_why_missed'];
      const q3 = sub.answers['q3_reels'];
      const q4 = sub.answers['q4_opinion'];
      const q5 = sub.answers['q5_dramatic'];
      const free = sub.answers['free_response'];

      const formatAnswer = (ans?: QuestionAnswer) => {
        if (!ans) return 'Not answered';
        if (ans.skipped) return '[Skipped]';
        if (ans.customText) return `[Custom]: ${ans.customText}`;
        if (ans.selectedOptionText) return ans.selectedOptionText;
        return 'No response';
      };

      return [
        escapeCsv(sub.id),
        escapeCsv(sub.createdAt),
        escapeCsv(sub.updatedAt),
        escapeCsv(sub.completed ? 'Completed' : 'In Progress'),
        escapeCsv(sub.language === 'kk' ? 'Kazakh' : 'English'),
        escapeCsv(formatAnswer(q1)),
        escapeCsv(formatAnswer(q2)),
        escapeCsv(formatAnswer(q3)),
        escapeCsv(formatAnswer(q4)),
        escapeCsv(formatAnswer(q5)),
        escapeCsv(formatAnswer(free)),
      ].join(',');
    });

    // UTF-8 BOM (\uFEFF) ensures Excel and spreadsheets properly render Kazakh Cyrillic and emojis
    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="saltanat_surprise_responses.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error generating CSV export:', err);
    return res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

/* =========================================================
   DEV / PRODUCTION ASSET HANDLING
   ========================================================= */

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode.`);
  });
}

startServer();
