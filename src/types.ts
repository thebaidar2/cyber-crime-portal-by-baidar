/**
 * CYBER CRIME PORTAL BY BAIDAR
 * Type Definitions & Data Contracts
 */

export type RequestStatus = 
  | 'Submitted'
  | 'Received'
  | 'Under Review'
  | 'Reviewed'
  | 'Responded'
  | 'Resolved'
  | 'Closed';

export type IncidentCategory =
  | 'Financial Fraud & Phishing'
  | 'Identity Theft & Impersonation'
  | 'Unauthorized Access & Account Takeover'
  | 'Ransomware & Malware Extortion'
  | 'Cyber Harassment & Blackmail'
  | 'Data Leak & Corporate Espionage'
  | 'Other Cybersecurity Inquiry';

export type UrgencyLevel = 'Standard' | 'High Priority' | 'Critical Incident';

export interface UserRequest {
  id: string; // Internal ID or Firestore doc ID
  requestId: string; // Public reference ID (e.g., CCPB-2026-78921)
  accessTokenHash?: string; // Salted hash of tracking secret
  accessToken?: string; // Plaintext token returned only once on submission
  userId: string; // Creator user ID or 'guest-submitted'
  fullName: string;
  email: string;
  phone?: string;
  category: IncidentCategory;
  urgency: UrgencyLevel;
  subject: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  isFlagged?: boolean;
}

export interface ResponseMessage {
  id: string;
  responseId: string;
  requestId: string;
  senderRole: 'admin' | 'user';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  categoryTag: string;
  protocolBadge: string;
  slaTime: string;
  enabled: boolean;
}

export interface LandingTheme {
  type: 'default' | 'image' | 'video';
  mediaUrl: string; // Base64 data URL or external URL
  mediaName?: string;
  overlayOpacity?: number; // 0 to 1 (e.g. 0.7 for 70% dark overlay)
  blurAmount?: number; // 0 to 20 px
  playbackSpeed?: number;
  loop?: boolean;
  muted?: boolean;
  updatedAt?: string;
}

export interface UserActivityRecord {
  id: string;
  requestId: string;
  accessToken: string;
  subject: string;
  category: IncidentCategory | string;
  status: RequestStatus | string;
  createdAt: string;
  savedAt: string;
  notes?: string;
}

export interface BackupSnapshotRecord {
  id: string;
  filename: string;
  timestamp: string;
  sizeBytes: number;
  recordsCount: {
    requests: number;
    responses: number;
    blockedIps: number;
    securityLogs: number;
    auditLogs: number;
    cookies?: number;
  };
  isAuto: boolean;
  notes?: string;
}

export interface CookieItemInfo {
  name: string;
  value: string;
  purpose: string;
  expires: string;
}

export interface CookieConsentRecord {
  id: string;
  visitorId: string;
  consentStatus: 'allowed' | 'essential_only' | 'custom' | 'declined';
  preferences: {
    essential: boolean;
    security: boolean;
    analytics: boolean;
    functional: boolean;
  };
  cookiesSet: CookieItemInfo[];
  ipAddress: string;
  userAgent: string;
  device?: string;
  browser?: string;
  referrer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteContent {
  siteTitle: string;
  heroHeading: string;
  heroSubheading: string;
  aboutText: string;
  ctaText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  pgpKeyFingerprint: string;
  footerText: string;
  services: ServiceItem[];
  theme?: LandingTheme;
  updatedAt?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  handle: string;
  enabled: boolean;
  order: number;
}

export interface BlockedIpRecord {
  ipAddress: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
}

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  eventType: 'SUBMISSION' | 'STATUS_CHECK' | 'ADMIN_LOGIN' | 'LOGIN_FAILURE' | 'WAF_TRIGGER' | 'RATE_LIMIT' | 'IP_BLOCKED';
  actionTaken: 'ALLOW' | 'BLOCK' | 'THROTTLE' | 'REJECT';
  details: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  metadata?: Record<string, unknown>;
}

export interface AdminSession {
  token: string;
  username: string;
  role: 'superadmin' | 'incident_officer';
  expiresAt: number;
}
