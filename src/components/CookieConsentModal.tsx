import React, { useState, useEffect } from 'react';
import { Cookie, Shield, ShieldCheck, Check, Settings2, X, ChevronDown, ChevronUp, Lock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { CookieItemInfo } from '../types';

interface CookieConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentRecorded?: () => void;
}

export const CookieConsentModal: React.FC<CookieConsentModalProps> = ({
  isOpen,
  onClose,
  onConsentRecorded
}) => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [saving, setSaving] = useState(false);

  // Granular Cookie Preferences
  const [prefs, setPrefs] = useState({
    essential: true, // Always locked to true
    security: true,
    analytics: true,
    functional: true
  });

  // Generate or retrieve visitor ID
  const getVisitorId = (): string => {
    let vid = localStorage.getItem('ccpb_visitor_id');
    if (!vid) {
      vid = `vis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('ccpb_visitor_id', vid);
    }
    return vid;
  };

  const getDeviceSignature = (): { device: string; browser: string } => {
    const ua = navigator.userAgent;
    let browser = 'Modern Browser';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome')) browser = 'Google Chrome';
    else if (ua.includes('Safari')) browser = 'Apple Safari';

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const device = isMobile ? 'Mobile Device' : 'Desktop Workstation';

    return { device, browser };
  };

  const setBrowserCookie = (name: string, value: string, maxAgeSecs = 31536000) => {
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSecs}; SameSite=Lax`;
    } catch (e) {
      console.warn('Cookie writing error:', e);
    }
  };

  const generateSecurityToken = () => {
    return 'sec_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleRecordConsent = async (status: 'allowed' | 'essential_only' | 'custom' | 'declined') => {
    setSaving(true);
    const visitorId = getVisitorId();
    const { device, browser } = getDeviceSignature();
    const secToken = generateSecurityToken();

    // Determine finalized preferences based on choice
    const finalizedPrefs = status === 'allowed'
      ? { essential: true, security: true, analytics: true, functional: true }
      : status === 'essential_only'
      ? { essential: true, security: false, analytics: false, functional: false }
      : prefs;

    // Real browser cookies array to register
    const cookiesToSet: CookieItemInfo[] = [
      {
        name: '_ccpb_consent',
        value: status,
        purpose: 'Stores user cookie authorization state and preferences',
        expires: '1 Year'
      },
      {
        name: '_ccpb_session_id',
        value: visitorId,
        purpose: 'Zero-trust incident intake session verification',
        expires: '1 Year'
      }
    ];

    if (finalizedPrefs.security) {
      cookiesToSet.push({
        name: '_ccpb_sec_token',
        value: secToken,
        purpose: 'Cryptographic CSRF and anti-tamper security token',
        expires: '1 Year'
      });
      cookiesToSet.push({
        name: '_ccpb_csrf_gate',
        value: 'verified_' + Date.now().toString(36),
        purpose: 'Gateway request validation token',
        expires: 'Session / 24 Hours'
      });
    }

    if (finalizedPrefs.analytics) {
      cookiesToSet.push({
        name: '_ccpb_threat_telemetry',
        value: 'active_' + Math.random().toString(36).substring(2, 8),
        purpose: 'Anti-abuse traffic analysis & incident surge detection',
        expires: '90 Days'
      });
    }

    // Set real browser cookies
    cookiesToSet.forEach(c => {
      setBrowserCookie(c.name, c.value);
    });

    // Save in localStorage for immediate client hydration
    const consentPayload = {
      visitorId,
      consentStatus: status,
      preferences: finalizedPrefs,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('ccpb_cookie_consent', JSON.stringify(consentPayload));

    // Submit to server backend to save in Admin Panel & database
    try {
      await api.submitCookieConsent({
        visitorId,
        consentStatus: status,
        preferences: finalizedPrefs,
        cookiesSet: cookiesToSet,
        device,
        browser,
        referrer: document.referrer || 'Direct Entry'
      });
    } catch (err) {
      console.warn('Backend consent logging notice:', err);
    } finally {
      setSaving(false);
      if (onConsentRecorded) onConsentRecorded();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-neutral-100 flex flex-col max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
      >
        {/* Top Header Strip */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-amber-400 shrink-0">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Cookie &amp; Security Policy
                </span>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                  Zero-Trust
                </span>
              </div>
              <h2 id="cookie-modal-title" className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight mt-0.5">
                Allow this website to manage cookies?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-900 hover:text-white transition-colors"
            title="Dismiss popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informative Body Text */}
        <div className="mt-4 space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <p>
            The <strong className="text-white">Cyber Crime Portal by Baidar</strong> uses cookies to maintain secure authenticated sessions, safeguard incident reports, prevent CSRF exploits, and preserve evidence continuity.
          </p>
          <p className="text-neutral-400 text-xs">
            By allowing cookie management, you enable cryptographic token verification, protected case follow-up inquiries, and real-time defense against automated malicious requests.
          </p>
        </div>

        {/* Expandable Preferences Accordion */}
        {showCustomize && (
          <div className="mt-5 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3 text-xs font-mono">
            <div className="text-[11px] uppercase text-neutral-400 font-bold tracking-wider mb-2">
              Granular Cookie Authorization
            </div>

            {/* Essential Cookies */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Lock className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Essential Security Tokens</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-sans">
                  Mandatory CSRF validation and incident session identity. Cannot be disabled.
                </div>
              </div>
              <span className="shrink-0 px-2 py-1 text-[10px] bg-neutral-800 text-neutral-300 rounded border border-neutral-700">
                LOCKED ON
              </span>
            </div>

            {/* Incident Tracking & Security */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Incident Tracking &amp; Continuity</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-sans">
                  Maintains secret reference lookup tokens without requiring repeated logins.
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.security}
                onChange={(e) => setPrefs({ ...prefs, security: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Threat Defense & Analytics */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Shield className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Threat Intelligence Telemetry</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-sans">
                  Anonymized anomaly and brute-force intrusion detection signals.
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Functional Experience */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Settings2 className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Theme &amp; UI Preferences</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-sans">
                  Retains client-side display parameters, contrast choices, and local state.
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.functional}
                onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Cookie Manifest Preview Toggle */}
        <div className="mt-4 pt-3 border-t border-neutral-900">
          <button
            type="button"
            onClick={() => setShowManifest(!showManifest)}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <span>{showManifest ? 'Hide' : 'View'} Managed Cookie Manifest</span>
            {showManifest ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showManifest && (
            <div className="mt-2.5 max-h-40 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 text-[11px] font-mono space-y-2">
              <div className="flex items-start justify-between border-b border-neutral-800/60 pb-1.5">
                <div>
                  <span className="text-white font-bold">_ccpb_consent</span>
                  <div className="text-neutral-400 text-[10px]">Records cookie authorization state</div>
                </div>
                <span className="text-neutral-500">1 Year</span>
              </div>
              <div className="flex items-start justify-between border-b border-neutral-800/60 pb-1.5">
                <div>
                  <span className="text-white font-bold">_ccpb_session_id</span>
                  <div className="text-neutral-400 text-[10px]">Unique cryptographic session identifier</div>
                </div>
                <span className="text-neutral-500">1 Year</span>
              </div>
              <div className="flex items-start justify-between border-b border-neutral-800/60 pb-1.5">
                <div>
                  <span className="text-white font-bold">_ccpb_sec_token</span>
                  <div className="text-neutral-400 text-[10px]">CSRF &amp; anti-tamper security token</div>
                </div>
                <span className="text-neutral-500">1 Year</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-white font-bold">_ccpb_threat_telemetry</span>
                  <div className="text-neutral-400 text-[10px]">Rate limit &amp; DDoS anomaly mitigation</div>
                </div>
                <span className="text-neutral-500">90 Days</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowCustomize(!showCustomize)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Settings2 className="h-4 w-4" />
            <span>{showCustomize ? 'Hide Preferences' : 'Manage Preferences'}</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleRecordConsent('essential_only')}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Essential Only
            </button>

            {showCustomize ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleRecordConsent('custom')}
                className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-neutral-950 hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Save Preferences</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleRecordConsent('allowed')}
                className="rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-neutral-950 hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                <Check className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Allow All Cookies'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
