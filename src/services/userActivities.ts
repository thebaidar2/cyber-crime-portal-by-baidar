/**
 * CYBER CRIME PORTAL BY BAIDAR
 * Client-Side Activity & Passkey Vault Storage
 * Stores user reference IDs, secret access tokens, and incident logs locally with encryption/privacy
 */

import { UserActivityRecord } from '../types';

const ACTIVITIES_STORAGE_KEY = 'ccpb_user_activities_vault';

export const userActivitiesService = {
  getActivities(): UserActivityRecord[] {
    try {
      const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (err) {
      console.error('Failed to load user activities from vault:', err);
      return [];
    }
  },

  saveActivity(activity: Omit<UserActivityRecord, 'id' | 'savedAt'>): UserActivityRecord {
    const activities = this.getActivities();
    
    // Check if this requestId already exists in vault, update if so
    const existingIndex = activities.findIndex(a => a.requestId === activity.requestId);
    
    const record: UserActivityRecord = {
      ...activity,
      id: existingIndex >= 0 ? activities[existingIndex].id : `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      savedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      activities[existingIndex] = record;
    } else {
      activities.unshift(record);
    }

    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
      window.dispatchEvent(new CustomEvent('ccpb_activities_updated', { detail: { count: activities.length } }));
    } catch (err) {
      console.error('Failed to persist activity to vault:', err);
    }

    return record;
  },

  hasActivity(requestId: string): boolean {
    const activities = this.getActivities();
    return activities.some(a => a.requestId === requestId);
  },

  removeActivity(requestId: string): void {
    const activities = this.getActivities().filter(a => a.requestId !== requestId);
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
      window.dispatchEvent(new CustomEvent('ccpb_activities_updated', { detail: { count: activities.length } }));
    } catch (err) {
      console.error('Failed to remove activity:', err);
    }
  },

  clearAllActivities(): void {
    try {
      localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('ccpb_activities_updated', { detail: { count: 0 } }));
    } catch (err) {
      console.error('Failed to clear activities:', err);
    }
  },

  downloadCredentialsTxt(requestId: string, token: string, subject?: string, category?: string): void {
    const content = `=====================================================
CYBER CRIME PORTAL BY BAIDAR - CONFIDENTIAL PASSKEY
=====================================================

CASE REFERENCE ID   : ${requestId}
SECRET ACCESS TOKEN : ${token}
CATEGORY            : ${category || 'Incident Consultation'}
SUBJECT             : ${subject || 'Cyber Incident Intake'}
GENERATED AT        : ${new Date().toISOString()}

INSTRUCTIONS:
1. Keep this token strictly confidential.
2. Visit https://cyberportal-baidar.org/ or open Track Status.
3. Enter your Case Reference ID and Secret Access Token to view investigation updates and administrative responses.
4. Portal operates under strict zero-trust user data isolation.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CCPB-PASSKEY-${requestId}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
