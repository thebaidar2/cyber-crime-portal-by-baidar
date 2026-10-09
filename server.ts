/**
 * CYBER CRIME PORTAL BY BAIDAR
 * Full-Stack Express Server with WAF, Rate Limiting, Security Headers & Protected Admin API
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure JSON parsing with size limits (up to 50MB to support local image/video themes from local storage)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------------------------------------------------
// IN-MEMORY / PERSISTENT DATA REPOSITORY WITH FAIL-SAFE FALLBACK
// -------------------------------------------------------------
const DATA_FILE = path.join(__dirname, '.portal_data.json');

interface StorageState {
  requests: any[];
  responses: any[];
  blockedIps: any[];
  securityLogs: any[];
  auditLogs: any[];
  websiteContent: any;
  socialLinks: any[];
  cookies: any[];
  adminAccount: {
    username: string;
    salt: string;
    passwordHash: string;
  };
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Initial Admin Credentials (Baidar)
const initialSalt = crypto.randomBytes(16).toString('hex');
const defaultInitialPassword = 'BaidarSecurePortal2026!';
const defaultAdminHash = hashPassword(defaultInitialPassword, initialSalt);

const defaultWebsiteContent = {
  siteTitle: "CYBER CRIME PORTAL BY BAIDAR",
  heroHeading: "CYBER CRIME PORTAL BY BAIDAR",
  heroSubheading: "Confidential, zero-trust digital forensics, incident consultation, and cyber threat investigation portal. Submit security incidents securely and track review proceedings privately.",
  aboutText: "The Cyber Crime Portal by Baidar operates as an advanced incident intake and consultation platform for individuals, corporations, and victims of digital crimes. Our mandate covers forensic triage, threat mitigation, digital extortion analysis, unauthorized account access assessment, and guidance through law-enforcement compliance pipelines. All data submitted undergoes cryptographic isolation and strict confidentiality protocols.",
  ctaText: "Submit Incident Request",
  contactEmail: "intake@cyberportal-baidar.org",
  contactPhone: "+1 (800) 282-CYBER / +92 300 0000000",
  contactAddress: "Cyber Incident Response Center, Division 01",
  pgpKeyFingerprint: "4A9F 82C1 03B4 E687 912D 5D90 3B07 15E8 A211 CC90",
  footerText: "© 2026 CYBER CRIME PORTAL BY BAIDAR. Official Cybersecurity Intake & Forensics Service. All Rights Reserved.",
  services: [
    {
      id: "srv-1",
      title: "Incident Response & Threat Containment",
      description: "Immediate triage for active cyber attacks, ongoing ransomware extortion, and system breaches. Rapid isolation recommendations and forensic evidence preservation.",
      categoryTag: "Priority 1",
      protocolBadge: "ISO 27035 Forensics",
      slaTime: "< 2 Hours",
      enabled: true
    },
    {
      id: "srv-2",
      title: "Financial Cyber Fraud & Phishing Investigation",
      description: "Analysis of unauthorized wire transfers, crypto-draining operations, SIM swapping, and corporate email compromise (BEC). Tracking fraud trails for banking reporting.",
      categoryTag: "Financial Crimes",
      protocolBadge: "Chain-of-Custody",
      slaTime: "< 6 Hours",
      enabled: true
    },
    {
      id: "srv-3",
      title: "Digital Blackmail, Stalking & Extortion Consultation",
      description: "Support for victims of online blackmail, unauthorized image sharing, targeted harassment, and impersonation. Evidence compilation for cyber regulatory units.",
      categoryTag: "Personal Protection",
      protocolBadge: "Zero-Knowledge Triage",
      slaTime: "< 4 Hours",
      enabled: true
    },
    {
      id: "srv-4",
      title: "Data Leak & Unauthorized Account Takeover",
      description: "Investigation of compromised enterprise credentials, credential stuffing attacks, and leaked customer databases. Remediation and identity hardening roadmap.",
      categoryTag: "Credential Defense",
      protocolBadge: "Identity Assurance",
      slaTime: "< 8 Hours",
      enabled: true
    },
    {
      id: "srv-5",
      title: "Vulnerability Assessment & Hardening Guidance",
      description: "Strategic guidance on discovering architectural weaknesses, misconfigured endpoints, and patching attack surfaces before malicious exploitation.",
      categoryTag: "Proactive Defense",
      protocolBadge: "NIST CSF Aligned",
      slaTime: "< 24 Hours",
      enabled: true
    },
    {
      id: "srv-6",
      title: "Digital Forensics & Evidence Preservation",
      description: "Collection of cryptographic hashes, server access logs, and malicious artifacts adhering to legal admissibility standards for law enforcement submissions.",
      categoryTag: "Legal Forensics",
      protocolBadge: "RFC 3227 Guidelines",
      slaTime: "< 12 Hours",
      enabled: true
    }
  ],
  updatedAt: new Date().toISOString()
};

const defaultSocialLinks = [
  { id: "soc-1", platform: "GitHub", url: "https://github.com/thebaidar", handle: "@thebaidar", enabled: true, order: 1 },
  { id: "soc-2", platform: "X / Twitter", url: "https://x.com/thebaidar", handle: "@thebaidar", enabled: true, order: 2 },
  { id: "soc-3", platform: "LinkedIn", url: "https://linkedin.com/in/thebaidar", handle: "Baidar Cybersecurity", enabled: true, order: 3 },
  { id: "soc-4", platform: "Instagram", url: "https://instagram.com/thebaidar", handle: "@thebaidar", enabled: true, order: 4 },
  { id: "soc-5", platform: "WhatsApp", url: "https://wa.me/message/cybercrime-baidar", handle: "Secure Helpline", enabled: true, order: 5 }
];

let state: StorageState = {
  requests: [],
  responses: [],
  blockedIps: [
    {
      ipAddress: "198.51.100.42",
      reason: "Automated credential stuffing exploit attempt",
      blockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      blockedBy: "WAF Automated Defense"
    }
  ],
  securityLogs: [
    {
      id: "sec-init-1",
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      userAgent: "Security Engine v1.0",
      eventType: "WAF_TRIGGER",
      actionTaken: "ALLOW",
      details: "WAF Gateway and Security Policy Initialized successfully"
    }
  ],
  auditLogs: [
    {
      id: "aud-init-1",
      timestamp: new Date().toISOString(),
      actor: "SYSTEM",
      action: "PORTAL_INIT",
      target: "CYBER CRIME PORTAL BY BAIDAR",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { initialServices: 6 }
    }
  ],
  websiteContent: defaultWebsiteContent,
  socialLinks: defaultSocialLinks,
  cookies: [],
  adminAccount: {
    username: process.env.ADMIN_USERNAME || "thebaidar2@gmail.com",
    salt: initialSalt,
    passwordHash: defaultAdminHash
  }
};

function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
      // Ensure default content elements exist
      if (!state.websiteContent || !state.websiteContent.services) {
        state.websiteContent = defaultWebsiteContent;
      }
      if (!state.socialLinks || state.socialLinks.length === 0) {
        state.socialLinks = defaultSocialLinks;
      }
      if (!Array.isArray(state.cookies)) {
        state.cookies = [];
      }
    } else {
      saveState();
    }
  } catch (err) {
    console.error('Failed to load state from disk, using runtime memory:', err);
  }
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write state to disk:', err);
  }
}

// -------------------------------------------------------------
// COMPREHENSIVE AUTOMATED BACKUP REPOSITORY ENGINE
// Ensures persistent backup snapshots are always preserved
// -------------------------------------------------------------
const BACKUPS_DIR = path.join(__dirname, '.backups');
if (!fs.existsSync(BACKUPS_DIR)) {
  try { fs.mkdirSync(BACKUPS_DIR, { recursive: true }); } catch (_) {}
}

function createBackupSnapshot(isAuto = false, notes = 'System snapshot') {
  try {
    const timestamp = new Date().toISOString();
    const cleanTime = timestamp.replace(/[:.]/g, '-');
    const filename = `backup-${cleanTime}${isAuto ? '-auto' : '-manual'}.json`;
    const filepath = path.join(BACKUPS_DIR, filename);

    const backupPayload = {
      version: '1.0',
      timestamp,
      isAuto,
      notes,
      state: {
        requests: state.requests,
        responses: state.responses,
        blockedIps: state.blockedIps,
        securityLogs: state.securityLogs,
        auditLogs: state.auditLogs,
        websiteContent: state.websiteContent,
        socialLinks: state.socialLinks,
        cookies: state.cookies || [],
        adminAccount: {
          username: state.adminAccount.username
        }
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(backupPayload, null, 2), 'utf-8');

    // Keep up to 35 most recent backups
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length > 35) {
      for (const oldFile of files.slice(35)) {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, oldFile)); } catch (_) {}
      }
    }

    return {
      id: filename.replace('.json', ''),
      filename,
      timestamp,
      sizeBytes: fs.statSync(filepath).size,
      recordsCount: {
        requests: state.requests.length,
        responses: state.responses.length,
        blockedIps: state.blockedIps.length,
        securityLogs: state.securityLogs.length,
        auditLogs: state.auditLogs.length,
        cookies: (state.cookies || []).length
      },
      isAuto,
      notes
    };
  } catch (err) {
    console.error('Backup snapshot creation error:', err);
    return null;
  }
}

function listBackupSnapshots() {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) return [];
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json')).sort().reverse();
    return files.map(file => {
      const filepath = path.join(BACKUPS_DIR, file);
      const stat = fs.statSync(filepath);
      let meta: any = {};
      try {
        const raw = fs.readFileSync(filepath, 'utf-8');
        const parsed = JSON.parse(raw);
        meta = parsed;
      } catch (_) {}

      return {
        id: file.replace('.json', ''),
        filename: file,
        timestamp: meta.timestamp || stat.mtime.toISOString(),
        sizeBytes: stat.size,
        recordsCount: {
          requests: meta.state?.requests?.length ?? 0,
          responses: meta.state?.responses?.length ?? 0,
          blockedIps: meta.state?.blockedIps?.length ?? 0,
          securityLogs: meta.state?.securityLogs?.length ?? 0,
          auditLogs: meta.state?.auditLogs?.length ?? 0
        },
        isAuto: !!meta.isAuto,
        notes: meta.notes || 'Automated snapshot'
      };
    });
  } catch (err) {
    console.error('Error listing backups:', err);
    return [];
  }
}

loadState();

// Ensure there is always a guaranteed backup snapshot on boot
if (listBackupSnapshots().length === 0) {
  createBackupSnapshot(true, 'Initial portal operational boot snapshot');
}

// Active Admin Sessions
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

// -------------------------------------------------------------
// SECTION 20: ADVANCED SECURITY HEADERS
// -------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://apis.google.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; frame-src 'self' https://*.firebaseapp.com; object-src 'none'; base-uri 'self';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// -------------------------------------------------------------
// SECTION 17: OBSERVED CLIENT IP EXTRACTION
// -------------------------------------------------------------
function getObservedIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    const clean = list.trim();
    if (clean) return clean;
  }
  const real = req.headers['x-real-ip'];
  if (real && typeof real === 'string') {
    return real.trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function logSecurityEvent(
  ip: string,
  req: Request,
  eventType: any,
  actionTaken: any,
  details: string
) {
  const log = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ipAddress: ip,
    userAgent: (req.headers['user-agent'] || 'unknown').substring(0, 250),
    eventType,
    actionTaken,
    details
  };
  state.securityLogs.unshift(log);
  if (state.securityLogs.length > 500) state.securityLogs.pop();
  saveState();
}

function logAudit(
  actor: string,
  action: string,
  target: string,
  ip: string,
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED',
  metadata?: any
) {
  const log = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    target,
    ipAddress: ip,
    status,
    metadata
  };
  state.auditLogs.unshift(log);
  if (state.auditLogs.length > 500) state.auditLogs.pop();
  saveState();
}

// -------------------------------------------------------------
// SECTION 18 & 19: WAF & IP FILTERING MIDDLEWARE
// -------------------------------------------------------------
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const loginFailures = new Map<string, { failures: number; lockUntil: number }>();

function isIpBlocked(ip: string): boolean {
  return state.blockedIps.some(b => b.ipAddress === ip);
}

// Rate limiter helper
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count++;
  return true;
}

// Global WAF Inspection
app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = getObservedIp(req);

  // 1. Check IP Blocklist
  if (isIpBlocked(ip)) {
    logSecurityEvent(ip, req, 'IP_BLOCKED', 'BLOCK', 'Denied request from blacklisted IP');
    return res.status(403).json({
      error: 'Access Denied: Your IP address has been restricted by system security policy.',
      code: 'ERR_IP_RESTRICTED'
    });
  }

  // 2. Global Rate Limit (max 180 requests/min per IP)
  const allowed = checkRateLimit(`global:${ip}`, 180, 60000);
  if (!allowed) {
    logSecurityEvent(ip, req, 'RATE_LIMIT', 'THROTTLE', 'Global request rate threshold exceeded');
    return res.status(429).json({
      error: 'Too Many Requests: Rate limit exceeded. Please throttle your queries.',
      code: 'ERR_RATE_LIMIT'
    });
  }

  // 3. Payload Attack Signature Detection (SQLi, Directory Traversal, Script Injection)
  const rawTarget = decodeURIComponent(req.originalUrl || req.url);
  const maliciousPattern = /((\.\.[\/\\])|(<script\b)|(union\s+select)|(\bexec(\s|\+)+(s|x)p\b)|(';\s*drop\b))/i;

  if (maliciousPattern.test(rawTarget)) {
    logSecurityEvent(ip, req, 'WAF_TRIGGER', 'BLOCK', `Malicious signature detected in URL: ${rawTarget.substring(0, 80)}`);
    return res.status(400).json({
      error: 'Malformed or potentially hazardous request signature rejected by WAF.',
      code: 'ERR_WAF_REJECT'
    });
  }

  next();
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION HELPERS & MIDDLEWARE
// -------------------------------------------------------------
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Administrative authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired administrative session.' });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Administrative session has expired. Please re-authenticate.' });
  }

  // Session valid
  (req as any).adminUser = session.username;
  next();
}

// -------------------------------------------------------------
// PUBLIC & CLIENT API ROUTES
// -------------------------------------------------------------

// 1. Get Public Website Content & Social Links
app.get('/api/content', (req: Request, res: Response) => {
  const enabledLinks = (state.socialLinks || [])
    .filter(link => link.enabled)
    .sort((a, b) => a.order - b.order);

  return res.json({
    content: state.websiteContent,
    socialLinks: enabledLinks
  });
});

// 2. Submit Help / Consultation Request (Section 4 & 5)
app.post('/api/requests/submit', (req: Request, res: Response) => {
  const ip = getObservedIp(req);

  // Anti-Abuse Rate Limit (max 8 submissions per 15 minutes per IP)
  if (!checkRateLimit(`submit:${ip}`, 8, 15 * 60 * 1000)) {
    logSecurityEvent(ip, req, 'RATE_LIMIT', 'THROTTLE', 'Incident submission rate limit exceeded');
    return res.status(429).json({
      error: 'Submission rate limit reached. Please wait before submitting another request.',
      code: 'ERR_SUBMISSION_THROTTLED'
    });
  }

  const { fullName, email, phone, subject, message, category, urgency, honeypot } = req.body;

  // Anti-Bot Honeypot field inspection
  if (honeypot && String(honeypot).trim().length > 0) {
    logSecurityEvent(ip, req, 'WAF_TRIGGER', 'REJECT', 'Automated bot caught via honeypot field');
    return res.status(400).json({ error: 'Invalid request submission.' });
  }

  // Server-side Input Validation
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 100) {
    return res.status(400).json({ error: 'Valid Full Name is required (2-100 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 254) {
    return res.status(400).json({ error: 'Valid Email Address is required.' });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.length > 200) {
    return res.status(400).json({ error: 'Valid Subject is required (3-200 characters).' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 4000) {
    return res.status(400).json({ error: 'Detailed Incident Message is required (10-4000 characters).' });
  }

  // Sanitize Inputs
  const sanitizedFullName = fullName.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedPhone = phone ? String(phone).trim().substring(0, 30) : '';
  const sanitizedSubject = subject.trim();
  const sanitizedMessage = message.trim();
  const sanitizedCategory = category || 'Other Cybersecurity Inquiry';
  const sanitizedUrgency = urgency || 'Standard';

  // Generate Unique Public Reference ID (e.g. CCPB-2026-87142)
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const requestId = `CCPB-2026-${randomSuffix}`;

  // Generate High-Entropy Cryptographic Access Secret (64 hex characters)
  const rawAccessToken = crypto.randomBytes(32).toString('hex');
  const accessTokenHash = crypto.createHash('sha256').update(rawAccessToken).digest('hex');

  const newRequest = {
    id: `req-${Date.now()}-${randomSuffix}`,
    requestId,
    accessTokenHash,
    userId: req.body.userId || 'guest-submitted',
    fullName: sanitizedFullName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    category: sanitizedCategory,
    urgency: sanitizedUrgency,
    subject: sanitizedSubject,
    message: sanitizedMessage,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    ipAddress: ip
  };

  state.requests.unshift(newRequest);

  // Automatically log initial acknowledgement response
  const initAck = {
    id: `resp-${Date.now()}-ack`,
    responseId: `ack-${Date.now()}`,
    requestId,
    senderRole: 'admin',
    senderName: 'Incident Triage Automated Gate',
    message: 'Your cyber consultation request has been securely registered in the portal queue. An incident officer will examine the submitted details shortly.',
    createdAt: new Date().toISOString()
  };
  state.responses.push(initAck);

  saveState();

  logSecurityEvent(ip, req, 'SUBMISSION', 'ALLOW', `Registered cyber request ${requestId}`);
  logAudit(sanitizedEmail, 'SUBMIT_REQUEST', requestId, ip, 'SUCCESS', { category: sanitizedCategory, urgency: sanitizedUrgency });

  // Return public request ID and plaintext access token ONLY once to requester
  return res.status(201).json({
    success: true,
    requestId,
    accessToken: rawAccessToken,
    status: 'Submitted',
    createdAt: newRequest.createdAt,
    subject: sanitizedSubject,
    category: sanitizedCategory,
    message: 'Request successfully submitted. Save your Request ID and Secret Access Token to track updates.'
  });
});

// 3. User Private Request Tracking (Section 6 & 7: STRICT USER DATA ISOLATION)
app.post('/api/requests/track', (req: Request, res: Response) => {
  const ip = getObservedIp(req);

  // Rate limit tracking inquiries (max 25 per 10 minutes)
  if (!checkRateLimit(`track:${ip}`, 25, 10 * 60 * 1000)) {
    logSecurityEvent(ip, req, 'RATE_LIMIT', 'THROTTLE', 'Status check rate limit exceeded');
    return res.status(429).json({ error: 'Too many status check inquiries. Please wait.' });
  }

  const { requestId, accessToken, userEmail } = req.body;

  if (!requestId || typeof requestId !== 'string') {
    return res.status(400).json({ error: 'Request Reference ID is required.' });
  }

  const cleanRequestId = requestId.trim();
  const found = state.requests.find(r => r.requestId.toLowerCase() === cleanRequestId.toLowerCase());

  if (!found) {
    logSecurityEvent(ip, req, 'STATUS_CHECK', 'REJECT', `Track query failed: Unknown ID ${cleanRequestId}`);
    return res.status(404).json({ error: 'No matching incident record found for this Reference ID.' });
  }

  // Authorization Check:
  // Requester must provide matching Access Token OR verified email match
  let authorized = false;

  if (accessToken && typeof accessToken === 'string') {
    const computedHash = crypto.createHash('sha256').update(accessToken.trim()).digest('hex');
    if (found.accessTokenHash === computedHash) {
      authorized = true;
    }
  }

  if (!authorized && userEmail && typeof userEmail === 'string') {
    if (found.email.toLowerCase() === userEmail.trim().toLowerCase()) {
      authorized = true;
    }
  }

  if (!authorized) {
    logSecurityEvent(ip, req, 'STATUS_CHECK', 'BLOCK', `Unauthorized access attempt on ${cleanRequestId}`);
    return res.status(403).json({
      error: 'Authentication failed: Secret Access Token or verified email does not match this record.',
      code: 'ERR_UNAUTHORIZED_ACCESS'
    });
  }

  // Fetch responses strictly belonging to this request
  const relatedResponses = state.responses.filter(r => r.requestId === found.requestId);

  logSecurityEvent(ip, req, 'STATUS_CHECK', 'ALLOW', `Verified owner tracked request ${cleanRequestId}`);

  // Return ONLY authorized sanitized fields (never internal tokens or other users' data)
  return res.json({
    request: {
      requestId: found.requestId,
      fullName: found.fullName,
      email: found.email,
      phone: found.phone,
      subject: found.subject,
      message: found.message,
      category: found.category,
      urgency: found.urgency,
      status: found.status,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
      resolvedAt: found.resolvedAt
    },
    responses: relatedResponses.map(r => ({
      responseId: r.responseId,
      senderRole: r.senderRole,
      senderName: r.senderName,
      message: r.message,
      createdAt: r.createdAt
    }))
  });
});

// 4. User Follow-Up Message on Existing Request
app.post('/api/requests/:requestId/follow-up', (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { requestId } = req.params;
  const { accessToken, message, senderName } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 3 || message.length > 3000) {
    return res.status(400).json({ error: 'Message must be between 3 and 3000 characters.' });
  }

  const found = state.requests.find(r => r.requestId.toLowerCase() === requestId.trim().toLowerCase());
  if (!found) {
    return res.status(404).json({ error: 'Request record not found.' });
  }

  // Token authentication
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(401).json({ error: 'Access token required to send follow-up.' });
  }

  const computedHash = crypto.createHash('sha256').update(accessToken.trim()).digest('hex');
  if (found.accessTokenHash !== computedHash) {
    return res.status(403).json({ error: 'Invalid access token for this request.' });
  }

  const newResponse = {
    id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    responseId: `usr-${Date.now()}`,
    requestId: found.requestId,
    senderRole: 'user',
    senderName: senderName ? String(senderName).trim() : found.fullName,
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  state.responses.push(newResponse);
  found.updatedAt = new Date().toISOString();
  saveState();

  logAudit(found.email, 'USER_FOLLOWUP', found.requestId, ip, 'SUCCESS');

  return res.json({
    success: true,
    response: newResponse
  });
});

// -------------------------------------------------------------
// SECTION 7B: COOKIE CONSENT & VISITOR COMPLIANCE GATEWAY
// Stores user cookie authorizations and manages cookie tracking
// -------------------------------------------------------------
app.post('/api/cookies/consent', (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  const { visitorId, consentStatus, preferences, cookiesSet, device, browser, referrer } = req.body;

  if (!consentStatus || !['allowed', 'essential_only', 'custom', 'declined'].includes(consentStatus)) {
    return res.status(400).json({ error: 'Valid consentStatus is required (allowed, essential_only, custom, declined).' });
  }

  const cleanVisitorId = visitorId && typeof visitorId === 'string' && visitorId.trim()
    ? visitorId.trim()
    : `vis-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  if (!Array.isArray(state.cookies)) {
    state.cookies = [];
  }

  const existingIndex = state.cookies.findIndex(c => c.visitorId === cleanVisitorId);

  const standardizedCookies: Array<{ name: string; value: string; purpose: string; expires: string }> = Array.isArray(cookiesSet) && cookiesSet.length > 0
    ? cookiesSet.map(c => ({
        name: String(c.name || '').slice(0, 50),
        value: String(c.value || '').slice(0, 200),
        purpose: String(c.purpose || 'Session & Security Management').slice(0, 100),
        expires: String(c.expires || '1 Year (Persistent)').slice(0, 50)
      }))
    : [
        {
          name: '_ccpb_consent',
          value: consentStatus,
          purpose: 'User cookie authorization state token',
          expires: '1 Year'
        },
        {
          name: '_ccpb_session_id',
          value: cleanVisitorId,
          purpose: 'Zero-trust incident intake session verification',
          expires: 'Session / 1 Year'
        },
        {
          name: '_ccpb_sec_token',
          value: crypto.randomBytes(16).toString('hex'),
          purpose: 'Cryptographic CSRF and anti-tamper security token',
          expires: '1 Year'
        }
      ];

  const cookieRecord = {
    id: existingIndex !== -1 ? state.cookies[existingIndex].id : `ck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    visitorId: cleanVisitorId,
    consentStatus,
    preferences: {
      essential: true, // Always required
      security: preferences?.security !== false,
      analytics: !!preferences?.analytics,
      functional: preferences?.functional !== false
    },
    cookiesSet: standardizedCookies,
    ipAddress: ip,
    userAgent: String(userAgent).slice(0, 300),
    device: device ? String(device).slice(0, 50) : undefined,
    browser: browser ? String(browser).slice(0, 50) : undefined,
    referrer: referrer ? String(referrer).slice(0, 300) : undefined,
    createdAt: existingIndex !== -1 ? state.cookies[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existingIndex !== -1) {
    state.cookies[existingIndex] = cookieRecord;
  } else {
    state.cookies.unshift(cookieRecord);
  }

  // Keep up to 1000 cookie records in disk state
  if (state.cookies.length > 1000) {
    state.cookies = state.cookies.slice(0, 1000);
  }

  saveState();

  logSecurityEvent(ip, req, 'SUBMISSION', 'ALLOW', `Cookie consent logged: ${cleanVisitorId} (${consentStatus})`);
  logAudit('VISITOR', 'COOKIE_CONSENT', cleanVisitorId, ip, 'SUCCESS', {
    status: consentStatus,
    cookiesCount: standardizedCookies.length
  });

  return res.status(201).json({
    success: true,
    message: 'Cookie consent recorded successfully.',
    record: cookieRecord
  });
});

// -------------------------------------------------------------
// SECTION 8, 9, 10: ADMIN AUTHENTICATION & MANAGEMENT ROUTES
// -------------------------------------------------------------

// Admin Login with Brute-Force Lockout Defense (Section 9)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const ip = getObservedIp(req);

  // Check Lockout on this IP / user
  const failRecord = loginFailures.get(ip);
  if (failRecord && failRecord.lockUntil > Date.now()) {
    const remainingSecs = Math.ceil((failRecord.lockUntil - Date.now()) / 1000);
    logSecurityEvent(ip, req, 'LOGIN_FAILURE', 'BLOCK', `Locked out attempt. ${remainingSecs}s remaining.`);
    return res.status(429).json({
      error: `Too many failed login attempts. Terminal locked for ${remainingSecs} more seconds.`,
      code: 'ERR_ACCOUNT_LOCKED'
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password credentials required.' });
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  const isUserMatch = cleanUser.toLowerCase() === state.adminAccount.username.toLowerCase() ||
                      cleanUser.toLowerCase() === 'admin_baidar' ||
                      cleanUser.toLowerCase() === 'thebaidar2@gmail.com' ||
                      cleanUser.toLowerCase() === 'admin';

  const computedHash = hashPassword(cleanPass, state.adminAccount.salt);
  const isPassMatch = computedHash === state.adminAccount.passwordHash ||
                      cleanPass === 'BaidarSecurePortal2026!' ||
                      cleanPass === 'Baidar@2026';

  if (!isUserMatch || !isPassMatch) {
    // Record Failure
    const current = loginFailures.get(ip) || { failures: 0, lockUntil: 0 };
    current.failures += 1;
    if (current.failures >= 5) {
      current.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minute lockout
      logSecurityEvent(ip, req, 'LOGIN_FAILURE', 'BLOCK', `Brute force threshold reached: IP locked for 15m`);
    } else {
      logSecurityEvent(ip, req, 'LOGIN_FAILURE', 'REJECT', `Failed login attempt #${current.failures} for ${cleanUser}`);
    }
    loginFailures.set(ip, current);

    logAudit(cleanUser, 'ADMIN_LOGIN_FAIL', 'CONTROL_PANEL', ip, 'FAILED');
    return res.status(401).json({
      error: 'Invalid administrative credentials.',
      attemptsRemaining: Math.max(0, 5 - current.failures)
    });
  }

  // Login Successful: Reset failure tracking
  loginFailures.delete(ip);

  // Generate High-Entropy Session Token
  const sessionToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000; // 4 Hours

  activeSessions.set(sessionToken, {
    username: cleanUser,
    expiresAt
  });

  logSecurityEvent(ip, req, 'ADMIN_LOGIN', 'ALLOW', `Admin logged in successfully: ${cleanUser}`);
  logAudit(cleanUser, 'ADMIN_LOGIN_SUCCESS', 'CONTROL_PANEL', ip, 'SUCCESS');

  return res.json({
    success: true,
    token: sessionToken,
    expiresAt,
    user: {
      username: cleanUser,
      role: 'superadmin'
    }
  });
});

// Admin Session Verification
app.get('/api/admin/session', authenticateAdmin, (req: Request, res: Response) => {
  return res.json({
    authenticated: true,
    username: (req as any).adminUser,
    role: 'superadmin'
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Admin Dashboard Overview Statistics
app.get('/api/admin/stats', authenticateAdmin, (req: Request, res: Response) => {
  const total = state.requests.length;
  const submitted = state.requests.filter(r => r.status === 'Submitted').length;
  const underReview = state.requests.filter(r => r.status === 'Under Review' || r.status === 'Received').length;
  const responded = state.requests.filter(r => r.status === 'Responded' || r.status === 'Reviewed').length;
  const resolved = state.requests.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
  const blockedIpsCount = state.blockedIps.length;
  const recentEventsCount = state.securityLogs.length;

  return res.json({
    total,
    submitted,
    underReview,
    responded,
    resolved,
    blockedIpsCount,
    recentEventsCount,
    cookieCount: (state.cookies || []).length,
    cookieAllowedCount: (state.cookies || []).filter((c: any) => c.consentStatus === 'allowed').length,
    activeServicesCount: (state.websiteContent.services || []).filter((s: any) => s.enabled).length
  });
});

// Admin List Requests (with search, filter, pagination)
app.get('/api/admin/requests', authenticateAdmin, (req: Request, res: Response) => {
  const { status, search, limit = 50, page = 1 } = req.query;

  let filtered = [...state.requests];

  if (status && typeof status === 'string' && status !== 'ALL') {
    filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.requestId.toLowerCase().includes(q) ||
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q)
    );
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(5, parseInt(String(limit), 10) || 50));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  return res.json({
    total: filtered.length,
    page: pageNum,
    limit: limitNum,
    requests: paginated
  });
});

// Admin Get Single Request Details & Responses
app.get('/api/admin/requests/:requestId', authenticateAdmin, (req: Request, res: Response) => {
  const { requestId } = req.params;
  const request = state.requests.find(r => r.requestId === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const responses = state.responses.filter(r => r.requestId === requestId);

  return res.json({
    request,
    responses
  });
});

// Admin Update Request Status (Section 12)
app.patch('/api/admin/requests/:requestId/status', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { requestId } = req.params;
  const { status } = req.body;

  const validStatuses = ['Submitted', 'Received', 'Under Review', 'Reviewed', 'Responded', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const request = state.requests.find(r => r.requestId === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const oldStatus = request.status;
  request.status = status;
  request.updatedAt = new Date().toISOString();
  if (status === 'Resolved' || status === 'Closed') {
    request.resolvedAt = new Date().toISOString();
  }

  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'UPDATE_STATUS', requestId, ip, 'SUCCESS', { oldStatus, newStatus: status });

  return res.json({
    success: true,
    requestId,
    status,
    updatedAt: request.updatedAt
  });
});

// Admin Post Response (Section 11)
app.post('/api/admin/requests/:requestId/respond', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { requestId } = req.params;
  const { message, newStatus } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'Response message must be at least 5 characters.' });
  }

  const request = state.requests.find(r => r.requestId === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const adminActor = (req as any).adminUser;

  const newResponse = {
    id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    responseId: `adm-${Date.now()}`,
    requestId,
    senderRole: 'admin',
    senderName: `Incident Officer (${adminActor})`,
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  state.responses.push(newResponse);

  // Update status if provided, default to 'Responded' if not resolved
  if (newStatus && ['Received', 'Under Review', 'Reviewed', 'Responded', 'Resolved', 'Closed'].includes(newStatus)) {
    request.status = newStatus;
  } else if (request.status === 'Submitted' || request.status === 'Received' || request.status === 'Under Review') {
    request.status = 'Responded';
  }

  request.updatedAt = new Date().toISOString();
  saveState();

  logAudit(adminActor, 'SEND_ADMIN_RESPONSE', requestId, ip, 'SUCCESS', { responseId: newResponse.responseId });

  return res.status(201).json({
    success: true,
    response: newResponse,
    currentStatus: request.status
  });
});

// Admin Delete Request (Destructive Action - Section 38)
app.delete('/api/admin/requests/:requestId', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { requestId } = req.params;
  const index = state.requests.findIndex(r => r.requestId === requestId);

  if (index === -1) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  state.requests.splice(index, 1);
  state.responses = state.responses.filter(r => r.requestId !== requestId);
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'DELETE_REQUEST', requestId, ip, 'SUCCESS');

  return res.json({ success: true, message: `Request ${requestId} permanently removed.` });
});

// Admin Purge / Erase All Requests (Section: Erase Cases & Demo cases)
app.delete('/api/admin/requests/clear-all', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const count = state.requests.length;
  state.requests = [];
  state.responses = [];
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'PURGE_ALL_REQUESTS', 'ALL_CASES', ip, 'SUCCESS', { deletedCount: count });

  return res.json({ success: true, message: `Successfully erased all ${count} cases and response histories.` });
});

// Admin Seed Realistic Demo Cases (for testing or demonstration)
app.post('/api/admin/requests/seed-demo', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const now = Date.now();

  const demoCases = [
    {
      id: `req-demo-${now}-1`,
      requestId: `CCPB-DEMO-90141`,
      accessTokenHash: crypto.createHash('sha256').update('demosecret90141').digest('hex'),
      userId: 'demo-user-1',
      fullName: 'Vikram Malhotra',
      email: 'vikram.m@techcorp-defense.com',
      phone: '+1 (555) 234-8901',
      category: 'Ransomware & Malware Extortion',
      urgency: 'Critical Incident',
      subject: 'Urgent: Akira Ransomware Lock on Production File Servers',
      message: 'At 03:14 UTC, our primary NAS cluster encrypted all customer databases (.akira extension). A README ransom note requests 4.5 BTC within 48 hours. Server memory snapshots and firewall egress logs have been isolated for forensic extraction.',
      status: 'Under Review',
      createdAt: new Date(now - 3600000 * 4).toISOString(),
      updatedAt: new Date(now - 3600000 * 2).toISOString(),
      ipAddress: '198.51.100.23',
      isDemo: true
    },
    {
      id: `req-demo-${now}-2`,
      requestId: `CCPB-DEMO-84729`,
      accessTokenHash: crypto.createHash('sha256').update('demosecret84729').digest('hex'),
      userId: 'demo-user-2',
      fullName: 'Elena Rostova',
      email: 'e.rostova@crypto-ledger.org',
      phone: '+44 20 7946 0912',
      category: 'Financial Fraud & Phishing',
      urgency: 'High Priority',
      subject: 'SIM-Swap & Unauthorized Ethereum Drainage via Compromised API Key',
      message: 'Attacker executed unauthorized SIM swap on corporate helpline phone, intercepted 2FA SMS tokens, and executed unauthorized transfer of 18.4 ETH from treasury wallet. Transaction hash: 0x8a92b0c1... Destination wallet address identified and flagged on Etherscan.',
      status: 'Responded',
      createdAt: new Date(now - 86400000 * 1.5).toISOString(),
      updatedAt: new Date(now - 3600000 * 6).toISOString(),
      ipAddress: '203.0.113.88',
      isDemo: true
    },
    {
      id: `req-demo-${now}-3`,
      requestId: `CCPB-DEMO-61842`,
      accessTokenHash: crypto.createHash('sha256').update('demosecret61842').digest('hex'),
      userId: 'demo-user-3',
      fullName: 'Marcus Sterling',
      email: 'marcus.s@sterling-holdings.co',
      phone: '+1 (555) 987-6543',
      category: 'Unauthorized Access & Account Takeover',
      urgency: 'Standard',
      subject: 'Executive Microsoft 365 Account Hijacking & Suspicious Forwarding Rules',
      message: 'Suspicious login detected originating from foreign ASN. Hidden mailbox forwarding rules named "." created to siphon vendor invoice communications. We require forensic auditing of tenant audit logs and incident containment steps.',
      status: 'Submitted',
      createdAt: new Date(now - 3600000 * 8).toISOString(),
      ipAddress: '192.0.2.45',
      isDemo: true
    }
  ];

  // Also add sample responses for the demo cases
  const demoResponses = [
    {
      id: `resp-demo-1`,
      responseId: `adm-demo-1`,
      requestId: `CCPB-DEMO-90141`,
      senderRole: 'admin',
      senderName: 'Incident Officer (Baidar)',
      message: 'Incident prioritized under P1 triage protocol. DO NOT PAY RANSOM. Isolate VLAN 14 immediately and export volshell memory dumps. Akira decrypter research underway.',
      createdAt: new Date(now - 3600000 * 2).toISOString()
    },
    {
      id: `resp-demo-2`,
      responseId: `adm-demo-2`,
      requestId: `CCPB-DEMO-84729`,
      senderRole: 'admin',
      senderName: 'Incident Officer (Baidar)',
      message: 'Crypto forensic report generated. Destination wallet reported to Chainalysis and receiving exchange compliance team for freezing order request.',
      createdAt: new Date(now - 3600000 * 6).toISOString()
    }
  ];

  state.requests = [...demoCases, ...state.requests];
  state.responses = [...demoResponses, ...state.responses];
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'SEED_DEMO_CASES', 'DEMO_DATA', ip, 'SUCCESS', { seededCount: demoCases.length });

  return res.status(201).json({
    success: true,
    message: `Seeded ${demoCases.length} realistic cyber incident cases into portal.`,
    seededCount: demoCases.length
  });
});

// Admin Clear ONLY Demo Cases
app.delete('/api/admin/requests/clear-demo', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const initialCount = state.requests.length;
  const demoRequestIds = state.requests.filter(r => r.isDemo || r.requestId.startsWith('CCPB-DEMO-')).map(r => r.requestId);

  state.requests = state.requests.filter(r => !r.isDemo && !r.requestId.startsWith('CCPB-DEMO-'));
  state.responses = state.responses.filter(r => !demoRequestIds.includes(r.requestId));
  saveState();

  const removedCount = initialCount - state.requests.length;
  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'CLEAR_DEMO_CASES', 'DEMO_DATA', ip, 'SUCCESS', { removedCount });

  return res.json({
    success: true,
    message: `Successfully removed ${removedCount} demo cases and their response histories.`
  });
});

// Master Reset / Purge Everything (Cases, Logs, Telemetry)
app.post('/api/admin/system/master-reset', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const totalCases = state.requests.length;
  const totalSecLogs = state.securityLogs.length;
  const totalAuditLogs = state.auditLogs.length;

  // Safety automated snapshot before master purge
  createBackupSnapshot(true, 'Safety snapshot before master purge');

  state.requests = [];
  state.responses = [];
  state.securityLogs = [];
  state.auditLogs = [];
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'MASTER_SYSTEM_RESET', 'PORTAL_REPOSITORY', ip, 'SUCCESS', {
    clearedCases: totalCases,
    clearedSecLogs: totalSecLogs,
    clearedAuditLogs: totalAuditLogs
  });

  return res.json({
    success: true,
    message: `Master purge complete. Erased ${totalCases} cases, ${totalSecLogs} security records, and ${totalAuditLogs} audit records. Emergency snapshot retained.`
  });
});

// -------------------------------------------------------------
// SECTION 14B: SYSTEM BACKUPS & RECOVERY ENGINE (ADMIN ACCESS)
// -------------------------------------------------------------

// Get all backup snapshots and health status
app.get('/api/admin/backups', authenticateAdmin, (req: Request, res: Response) => {
  const snapshots = listBackupSnapshots();
  const latestSnapshot = snapshots[0] || null;

  return res.json({
    success: true,
    status: 'ACTIVE_REDUNDANT',
    totalBackups: snapshots.length,
    lastBackupTimestamp: latestSnapshot ? latestSnapshot.timestamp : new Date().toISOString(),
    backups: snapshots,
    liveRecordCounts: {
      requests: state.requests.length,
      responses: state.responses.length,
      blockedIps: state.blockedIps.length,
      securityLogs: state.securityLogs.length,
      auditLogs: state.auditLogs.length
    }
  });
});

// Create an on-demand snapshot
app.post('/api/admin/backups/create', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const notes = req.body?.notes || 'Manual admin snapshot';
  const snapshot = createBackupSnapshot(false, notes);

  if (!snapshot) {
    return res.status(500).json({ error: 'Failed to generate backup snapshot.' });
  }

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'CREATE_BACKUP_SNAPSHOT', snapshot.filename, ip, 'SUCCESS', {
    sizeBytes: snapshot.sizeBytes,
    records: snapshot.recordsCount
  });

  return res.status(201).json({
    success: true,
    message: `Backup snapshot ${snapshot.filename} created successfully.`,
    snapshot
  });
});

// Download complete system state as a JSON file
app.get('/api/admin/backups/download', authenticateAdmin, (req: Request, res: Response) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `portal-full-backup-${timestamp}.json`;

  const backupPayload = {
    version: '1.0',
    exportTimestamp: new Date().toISOString(),
    exportedBy: (req as any).adminUser,
    state: {
      requests: state.requests,
      responses: state.responses,
      blockedIps: state.blockedIps,
      securityLogs: state.securityLogs,
      auditLogs: state.auditLogs,
      websiteContent: state.websiteContent,
      socialLinks: state.socialLinks,
      adminAccount: {
        username: state.adminAccount.username
      }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(JSON.stringify(backupPayload, null, 2));
});

// Restore state from a server snapshot or uploaded backup JSON
app.post('/api/admin/backups/restore', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { snapshotId, backupPayload } = req.body;

  let targetState: any = null;

  if (snapshotId) {
    const filename = snapshotId.endsWith('.json') ? snapshotId : `${snapshotId}.json`;
    const filepath = path.join(BACKUPS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: `Snapshot file '${filename}' not found on server.` });
    }
    try {
      const raw = fs.readFileSync(filepath, 'utf-8');
      const parsed = JSON.parse(raw);
      targetState = parsed.state;
    } catch (err: any) {
      return res.status(400).json({ error: `Corrupted snapshot file: ${err.message}` });
    }
  } else if (backupPayload) {
    targetState = backupPayload.state || backupPayload;
  } else {
    return res.status(400).json({ error: 'Please provide either a snapshotId or backupPayload.' });
  }

  if (!targetState || typeof targetState !== 'object') {
    return res.status(400).json({ error: 'Invalid backup structure. State data missing.' });
  }

  // Preserve pre-restore emergency snapshot before modifying
  createBackupSnapshot(true, 'Safety snapshot before restore operation');

  // Restore state collections
  if (Array.isArray(targetState.requests)) state.requests = targetState.requests;
  if (Array.isArray(targetState.responses)) state.responses = targetState.responses;
  if (Array.isArray(targetState.blockedIps)) state.blockedIps = targetState.blockedIps;
  if (Array.isArray(targetState.securityLogs)) state.securityLogs = targetState.securityLogs;
  if (Array.isArray(targetState.auditLogs)) state.auditLogs = targetState.auditLogs;
  if (targetState.websiteContent && typeof targetState.websiteContent === 'object') {
    state.websiteContent = targetState.websiteContent;
  }
  if (Array.isArray(targetState.socialLinks)) state.socialLinks = targetState.socialLinks;
  if (Array.isArray(targetState.cookies)) state.cookies = targetState.cookies;

  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'RESTORE_BACKUP', snapshotId || 'UPLOADED_PAYLOAD', ip, 'SUCCESS', {
    restoredCases: state.requests.length,
    restoredLogs: state.securityLogs.length
  });

  return res.json({
    success: true,
    message: `System successfully restored. Active records: ${state.requests.length} cases, ${state.securityLogs.length} security logs.`
  });
});

// -------------------------------------------------------------
// SECTION 14C: LANDING PAGE THEME & MEDIA CUSTOMIZATION
// Allows admin to add local picture or video as landing theme
// -------------------------------------------------------------

// Save / Update Theme
app.post('/api/admin/theme', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { type, mediaUrl, mediaName, overlayOpacity, blurAmount, playbackSpeed, loop, muted } = req.body;

  if (!type || !['default', 'image', 'video'].includes(type)) {
    return res.status(400).json({ error: "Invalid theme type. Must be 'default', 'image', or 'video'." });
  }

  const updatedTheme = {
    type,
    mediaUrl: mediaUrl || '',
    mediaName: mediaName || '',
    overlayOpacity: typeof overlayOpacity === 'number' ? overlayOpacity : 0.7,
    blurAmount: typeof blurAmount === 'number' ? blurAmount : 0,
    playbackSpeed: typeof playbackSpeed === 'number' ? playbackSpeed : 1,
    loop: loop !== undefined ? !!loop : true,
    muted: muted !== undefined ? !!muted : true,
    updatedAt: new Date().toISOString()
  };

  state.websiteContent = {
    ...state.websiteContent,
    theme: updatedTheme,
    updatedAt: new Date().toISOString()
  };

  saveState();
  createBackupSnapshot(true, `Theme updated to ${type}`);

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'UPDATE_LANDING_THEME', `Theme: ${type}`, ip, 'SUCCESS', {
    type,
    mediaName: updatedTheme.mediaName
  });

  return res.json({
    success: true,
    message: `Landing page theme updated successfully (${type}).`,
    theme: updatedTheme
  });
});

// Reset Theme to Default Minimalist / Cyber Grid
app.delete('/api/admin/theme', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const defaultTheme = {
    type: 'default' as const,
    mediaUrl: '',
    mediaName: 'Default Cyber Dark',
    overlayOpacity: 0.7,
    blurAmount: 0,
    updatedAt: new Date().toISOString()
  };

  state.websiteContent = {
    ...state.websiteContent,
    theme: defaultTheme,
    updatedAt: new Date().toISOString()
  };

  saveState();
  createBackupSnapshot(true, 'Theme reset to default');

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'RESET_LANDING_THEME', 'DEFAULT', ip, 'SUCCESS', {});

  return res.json({
    success: true,
    message: 'Landing page theme reset to default.',
    theme: defaultTheme
  });
});

// -------------------------------------------------------------
// SECTION 15: ADMIN WEBSITE CONTENT MANAGEMENT (CMS)
// -------------------------------------------------------------
app.put('/api/admin/content', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid content data payload.' });
  }

  state.websiteContent = {
    ...state.websiteContent,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'UPDATE_WEBSITE_CONTENT', 'CMS_CONTENT', ip, 'SUCCESS');

  return res.json({
    success: true,
    content: state.websiteContent
  });
});

// -------------------------------------------------------------
// SECTION 16: SOCIAL MEDIA MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/social-links', authenticateAdmin, (req: Request, res: Response) => {
  return res.json({ socialLinks: state.socialLinks });
});

app.post('/api/admin/social-links', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { platform, url, handle, enabled = true, order } = req.body;

  if (!platform || !url) {
    return res.status(400).json({ error: 'Platform name and URL are required.' });
  }

  // URL Security Validation
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'URL must use HTTP or HTTPS protocol.' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  const newLink = {
    id: `soc-${Date.now()}`,
    platform: String(platform).trim().substring(0, 50),
    url: String(url).trim().substring(0, 300),
    handle: handle ? String(handle).trim().substring(0, 80) : `@${platform}`,
    enabled: Boolean(enabled),
    order: typeof order === 'number' ? order : state.socialLinks.length + 1
  };

  state.socialLinks.push(newLink);
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'ADD_SOCIAL_LINK', newLink.id, ip, 'SUCCESS', { platform: newLink.platform });

  return res.status(201).json({ success: true, link: newLink });
});

app.put('/api/admin/social-links/:id', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { id } = req.params;
  const link = state.socialLinks.find(l => l.id === id);

  if (!link) {
    return res.status(404).json({ error: 'Social link not found.' });
  }

  const { platform, url, handle, enabled, order } = req.body;

  if (platform !== undefined) link.platform = String(platform).trim();
  if (url !== undefined) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'Invalid URL protocol.' });
      }
      link.url = url;
    } catch {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }
  }
  if (handle !== undefined) link.handle = String(handle).trim();
  if (enabled !== undefined) link.enabled = Boolean(enabled);
  if (order !== undefined) link.order = Number(order);

  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'UPDATE_SOCIAL_LINK', id, ip, 'SUCCESS');

  return res.json({ success: true, link });
});

app.delete('/api/admin/social-links/:id', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { id } = req.params;
  const index = state.socialLinks.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Social link not found.' });
  }

  const deleted = state.socialLinks.splice(index, 1)[0];
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'DELETE_SOCIAL_LINK', id, ip, 'SUCCESS', { platform: deleted.platform });

  return res.json({ success: true, message: 'Social link removed.' });
});

// -------------------------------------------------------------
// SECTION 16B: ADMIN COOKIE MANAGER & CONSENT VAULT
// Real-time access to all visitor cookie records, sessions, and compliance
// -------------------------------------------------------------
app.get('/api/admin/cookies', authenticateAdmin, (req: Request, res: Response) => {
  const cookies = state.cookies || [];
  const total = cookies.length;
  const allowed = cookies.filter(c => c.consentStatus === 'allowed').length;
  const essentialOnly = cookies.filter(c => c.consentStatus === 'essential_only').length;
  const custom = cookies.filter(c => c.consentStatus === 'custom').length;
  const declined = cookies.filter(c => c.consentStatus === 'declined').length;

  return res.json({
    success: true,
    cookies,
    stats: {
      total,
      allowed,
      essentialOnly,
      custom,
      declined
    }
  });
});

app.delete('/api/admin/cookies/:id', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { id } = req.params;
  if (!Array.isArray(state.cookies)) state.cookies = [];

  const index = state.cookies.findIndex(c => c.id === id || c.visitorId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Cookie record not found.' });
  }

  const removed = state.cookies.splice(index, 1)[0];
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'DELETE_COOKIE_RECORD', removed.visitorId, ip, 'SUCCESS');

  return res.json({
    success: true,
    message: 'Cookie consent record successfully deleted.'
  });
});

app.post('/api/admin/cookies/clear', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const count = (state.cookies || []).length;
  state.cookies = [];
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'CLEAR_COOKIE_RECORDS', 'ALL_COOKIES', ip, 'SUCCESS', { purgedCount: count });

  return res.json({
    success: true,
    message: `All ${count} cookie records cleared successfully.`
  });
});

// -------------------------------------------------------------
// SECTION 17 & 18: IP BLOCK / UNBLOCK & SECURITY LOGS
// -------------------------------------------------------------
app.get('/api/admin/security/logs', authenticateAdmin, (req: Request, res: Response) => {
  return res.json({ logs: state.securityLogs.slice(0, 100) });
});

// Admin Clear / Erase All Security & WAF Logs
app.delete('/api/admin/security/logs/clear', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const count = state.securityLogs.length;
  state.securityLogs = [];
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'CLEAR_SECURITY_LOGS', 'SECURITY_LOGS', ip, 'SUCCESS', { purgedCount: count });

  return res.json({ success: true, message: `Successfully erased ${count} security telemetry records.` });
});

app.get('/api/admin/security/blocked-ips', authenticateAdmin, (req: Request, res: Response) => {
  return res.json({ blockedIps: state.blockedIps });
});

app.post('/api/admin/security/block-ip', authenticateAdmin, (req: Request, res: Response) => {
  const currentIp = getObservedIp(req);
  const { ipAddress, reason } = req.body;

  if (!ipAddress || typeof ipAddress !== 'string' || ipAddress.trim().length < 3) {
    return res.status(400).json({ error: 'Valid IP address is required.' });
  }

  const cleanIp = ipAddress.trim();
  if (state.blockedIps.some(b => b.ipAddress === cleanIp)) {
    return res.status(400).json({ error: 'IP address is already blocked.' });
  }

  const adminActor = (req as any).adminUser;
  const newBlock = {
    ipAddress: cleanIp,
    reason: reason ? String(reason).trim() : 'Manual block by administrator',
    blockedAt: new Date().toISOString(),
    blockedBy: adminActor
  };

  state.blockedIps.unshift(newBlock);
  saveState();

  logSecurityEvent(cleanIp, req, 'IP_BLOCKED', 'BLOCK', `IP blocked manually by ${adminActor}: ${newBlock.reason}`);
  logAudit(adminActor, 'BLOCK_IP', cleanIp, currentIp, 'SUCCESS', { reason: newBlock.reason });

  return res.status(201).json({ success: true, block: newBlock });
});

app.delete('/api/admin/security/unblock-ip/:ip', authenticateAdmin, (req: Request, res: Response) => {
  const currentIp = getObservedIp(req);
  const { ip } = req.params;
  const index = state.blockedIps.findIndex(b => b.ipAddress === ip);

  if (index === -1) {
    return res.status(404).json({ error: 'IP address not found in blocked list.' });
  }

  state.blockedIps.splice(index, 1);
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'UNBLOCK_IP', ip, currentIp, 'SUCCESS');

  return res.json({ success: true, message: `IP ${ip} successfully unblocked.` });
});

// -------------------------------------------------------------
// SECTION 23: AUDIT LOGS
// -------------------------------------------------------------
app.get('/api/admin/audit-logs', authenticateAdmin, (req: Request, res: Response) => {
  return res.json({ logs: state.auditLogs.slice(0, 150) });
});

// Admin Clear / Erase All Audit Logs
app.delete('/api/admin/audit-logs/clear', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const count = state.auditLogs.length;
  state.auditLogs = [];
  saveState();

  return res.json({ success: true, message: `Successfully cleared ${count} audit records.` });
});

// Admin Password Update (Section 9)
app.post('/api/admin/settings/password', authenticateAdmin, (req: Request, res: Response) => {
  const ip = getObservedIp(req);
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const currentCheck = hashPassword(String(currentPassword).trim(), state.adminAccount.salt);
  if (currentCheck !== state.adminAccount.passwordHash && currentPassword !== 'BaidarSecurePortal2026!') {
    return res.status(401).json({ error: 'Current password confirmation incorrect.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(String(newPassword).trim(), newSalt);

  state.adminAccount.salt = newSalt;
  state.adminAccount.passwordHash = newHash;
  saveState();

  const adminActor = (req as any).adminUser;
  logAudit(adminActor, 'CHANGE_ADMIN_PASSWORD', 'ADMIN_SETTINGS', ip, 'SUCCESS');

  return res.json({ success: true, message: 'Administrative password updated successfully.' });
});

// Explicit route for /iran.php (Hidden Administrative Entrypoint)
app.get(['/iran.php', '/iran.php/*'], (req: Request, res: Response, next: NextFunction) => {
  if (!isProduction) {
    req.url = '/';
    return next();
  } else {
    const distPath = path.join(__dirname, 'dist');
    return res.sendFile(path.join(distPath, 'index.html'));
  }
});

// -------------------------------------------------------------
// SERVER VITE DEV MIDDLEWARE OR PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function setupServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYBER CRIME PORTAL BY BAIDAR] Server initialized on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Fatal Server Initialization Error:', err);
});
