/**
 * CYBER CRIME PORTAL BY BAIDAR
 * Frontend API Service Layer
 */

import { WebsiteContent, SocialLink, UserRequest, ResponseMessage, SecurityEventLog, BlockedIpRecord, AuditLogRecord, LandingTheme, BackupSnapshotRecord, CookieConsentRecord } from '../types';

const API_BASE = '/api';

export interface SubmitRequestPayload {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
  urgency?: string;
  userId?: string;
  honeypot?: string;
}

export interface SubmitResponse {
  success: boolean;
  requestId: string;
  accessToken: string;
  status: string;
  createdAt: string;
  message: string;
}

export interface TrackResponse {
  request: UserRequest;
  responses: ResponseMessage[];
}

export const api = {
  // Public Content
  async getContent(): Promise<{ content: WebsiteContent; socialLinks: SocialLink[] }> {
    const res = await fetch(`${API_BASE}/content`);
    if (!res.ok) throw new Error('Failed to load portal configuration.');
    return res.json();
  },

  // Submit Request
  async submitRequest(payload: SubmitRequestPayload): Promise<SubmitResponse> {
    const res = await fetch(`${API_BASE}/requests/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit incident request.');
    }
    return data;
  },

  // Track Request Privately (Strict Data Isolation)
  async trackRequest(requestId: string, accessToken?: string, userEmail?: string): Promise<TrackResponse> {
    const res = await fetch(`${API_BASE}/requests/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, accessToken, userEmail })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Unable to retrieve request record.');
    }
    return data;
  },

  // User Post Follow-Up
  async submitFollowUp(requestId: string, accessToken: string, message: string, senderName?: string) {
    const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(requestId)}/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, message, senderName })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit follow-up message.');
    }
    return data;
  },

  // Admin Auth
  async adminLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Admin authentication failed.');
    }
    return data;
  },

  async adminLogout(token: string) {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  },

  async checkAdminSession(token: string) {
    const res = await fetch(`${API_BASE}/admin/session`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  },

  // Admin Operations
  async getAdminStats(token: string) {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats.');
    return res.json();
  },

  async getAdminRequests(token: string, query?: { status?: string; search?: string; page?: number }) {
    const params = new URLSearchParams();
    if (query?.status) params.set('status', query.status);
    if (query?.search) params.set('search', query.search);
    if (query?.page) params.set('page', String(query.page));

    const res = await fetch(`${API_BASE}/admin/requests?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load incident requests.');
    return res.json();
  },

  async getAdminRequestDetail(token: string, requestId: string) {
    const res = await fetch(`${API_BASE}/admin/requests/${encodeURIComponent(requestId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load request details.');
    return res.json();
  },

  async updateRequestStatus(token: string, requestId: string, status: string) {
    const res = await fetch(`${API_BASE}/admin/requests/${encodeURIComponent(requestId)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status.');
    return data;
  },

  async sendAdminResponse(token: string, requestId: string, message: string, newStatus?: string) {
    const res = await fetch(`${API_BASE}/admin/requests/${encodeURIComponent(requestId)}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message, newStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch response.');
    return data;
  },

  async deleteRequest(token: string, requestId: string) {
    const res = await fetch(`${API_BASE}/admin/requests/${encodeURIComponent(requestId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete request.');
    return data;
  },

  async clearAllRequests(token: string) {
    const res = await fetch(`${API_BASE}/admin/requests/clear-all`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to purge requests.');
    return data;
  },

  async seedDemoCases(token: string) {
    const res = await fetch(`${API_BASE}/admin/requests/seed-demo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to seed demo cases.');
    return data;
  },

  async clearDemoCases(token: string) {
    const res = await fetch(`${API_BASE}/admin/requests/clear-demo`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear demo cases.');
    return data;
  },

  async masterReset(token: string) {
    const res = await fetch(`${API_BASE}/admin/system/master-reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to execute master reset.');
    return data;
  },

  // Admin CMS & Social Links
  async updateWebsiteContent(token: string, updates: Partial<WebsiteContent>) {
    const res = await fetch(`${API_BASE}/admin/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update website content.');
    return data;
  },

  async getAdminSocialLinks(token: string): Promise<{ socialLinks: SocialLink[] }> {
    const res = await fetch(`${API_BASE}/admin/social-links`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch social links.');
    return res.json();
  },

  async addSocialLink(token: string, link: Partial<SocialLink>) {
    const res = await fetch(`${API_BASE}/admin/social-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(link)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add social link.');
    return data;
  },

  async updateSocialLink(token: string, id: string, link: Partial<SocialLink>) {
    const res = await fetch(`${API_BASE}/admin/social-links/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(link)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update social link.');
    return data;
  },

  async deleteSocialLink(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/social-links/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete social link.');
    return data;
  },

  // Admin Security & IP Blocking
  async getSecurityLogs(token: string): Promise<{ logs: SecurityEventLog[] }> {
    const res = await fetch(`${API_BASE}/admin/security/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load security logs.');
    return res.json();
  },

  async clearSecurityLogs(token: string) {
    const res = await fetch(`${API_BASE}/admin/security/logs/clear`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear security logs.');
    return data;
  },

  async getBlockedIps(token: string): Promise<{ blockedIps: BlockedIpRecord[] }> {
    const res = await fetch(`${API_BASE}/admin/security/blocked-ips`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load blocked IP addresses.');
    return res.json();
  },

  async blockIp(token: string, ipAddress: string, reason: string) {
    const res = await fetch(`${API_BASE}/admin/security/block-ip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ipAddress, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to block IP.');
    return data;
  },

  async unblockIp(token: string, ip: string) {
    const res = await fetch(`${API_BASE}/admin/security/unblock-ip/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to unblock IP.');
    return data;
  },

  async getAuditLogs(token: string): Promise<{ logs: AuditLogRecord[] }> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load audit trail.');
    return res.json();
  },

  async clearAuditLogs(token: string) {
    const res = await fetch(`${API_BASE}/admin/audit-logs/clear`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear audit logs.');
    return data;
  },

  async changeAdminPassword(token: string, currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/admin/settings/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update administrative password.');
    return data;
  },

  // Backups & Snapshots Management
  async getBackups(token: string): Promise<{
    success: boolean;
    status: string;
    totalBackups: number;
    lastBackupTimestamp: string;
    backups: BackupSnapshotRecord[];
    liveRecordCounts: {
      requests: number;
      responses: number;
      blockedIps: number;
      securityLogs: number;
      auditLogs: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/admin/backups`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load backup repository status.');
    return res.json();
  },

  async createBackupSnapshot(token: string, notes?: string): Promise<{ success: boolean; message: string; snapshot: BackupSnapshotRecord }> {
    const res = await fetch(`${API_BASE}/admin/backups/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create backup snapshot.');
    return data;
  },

  async downloadFullBackup(token: string) {
    const res = await fetch(`${API_BASE}/admin/backups/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to download system backup.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async restoreBackup(token: string, snapshotId?: string, backupPayload?: any) {
    const res = await fetch(`${API_BASE}/admin/backups/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ snapshotId, backupPayload })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore backup snapshot.');
    return data;
  },

  // Landing Page Theme Management
  async updateLandingTheme(token: string, theme: LandingTheme): Promise<{ success: boolean; message: string; theme: LandingTheme }> {
    const res = await fetch(`${API_BASE}/admin/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(theme)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update landing page theme.');
    return data;
  },

  async resetLandingTheme(token: string): Promise<{ success: boolean; message: string; theme: LandingTheme }> {
    const res = await fetch(`${API_BASE}/admin/theme`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset landing theme.');
    return data;
  },

  // Cookie Consent & Visitor Tracking Management
  async submitCookieConsent(payload: {
    visitorId: string;
    consentStatus: 'allowed' | 'essential_only' | 'custom' | 'declined';
    preferences: { essential: boolean; security: boolean; analytics: boolean; functional: boolean };
    cookiesSet?: any[];
    device?: string;
    browser?: string;
    referrer?: string;
  }): Promise<{ success: boolean; message: string; record: CookieConsentRecord }> {
    const res = await fetch(`${API_BASE}/cookies/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record cookie consent.');
    return data;
  },

  async getAdminCookies(token: string): Promise<{
    success: boolean;
    cookies: CookieConsentRecord[];
    stats: {
      total: number;
      allowed: number;
      essentialOnly: number;
      custom: number;
      declined: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/admin/cookies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to retrieve cookie records.');
    return res.json();
  },

  async deleteAdminCookie(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/cookies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete cookie record.');
    return data;
  },

  async clearAdminCookies(token: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/cookies/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear cookie logs.');
    return data;
  }
};
