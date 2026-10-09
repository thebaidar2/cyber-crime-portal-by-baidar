import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy, Check, ShieldCheck, X, ExternalLink, Bookmark, BookmarkCheck, Download, Sparkles } from 'lucide-react';
import { SubmitResponse } from '../services/api';
import { userActivitiesService } from '../services/userActivities';

interface RequestConfirmationModalProps {
  data: SubmitResponse & { subject?: string; category?: string };
  onClose: () => void;
  onTrackNow: (requestId: string, token: string) => void;
}

export const RequestConfirmationModal: React.FC<RequestConfirmationModalProps> = ({
  data,
  onClose,
  onTrackNow
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if already in vault
    if (userActivitiesService.hasActivity(data.requestId)) {
      setIsSaved(true);
    }
  }, [data.requestId]);

  const copyToClipboard = (text: string, type: 'id' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleSaveToProfile = () => {
    userActivitiesService.saveActivity({
      requestId: data.requestId,
      accessToken: data.accessToken,
      subject: data.subject || 'Cyber Incident Consultation',
      category: data.category || 'Incident Inquiry',
      status: data.status || 'Submitted',
      createdAt: data.createdAt || new Date().toISOString()
    });
    setIsSaved(true);
  };

  const handleDownloadPasskey = () => {
    userActivitiesService.downloadCredentialsTxt(
      data.requestId,
      data.accessToken,
      data.subject,
      data.category
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-xl border border-neutral-700 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-left my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          title="Close Dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-white">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
              Request Successfully Registered
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              STATUS: SUBMITTED | REPUTATION VAULT LOGGED
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5 text-sm text-neutral-300 leading-relaxed border-t border-neutral-800 pt-4">
          Your cybersecurity assistance consultation has been received and encrypted. Because this portal enforces <strong className="text-white">strict zero-trust user data isolation</strong>, save your credentials below to inspect live progress anytime.
        </div>

        {/* Credentials Box */}
        <div className="mt-6 space-y-4">
          {/* Request Reference ID */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-neutral-400">
                Request Reference ID
              </span>
              <button
                onClick={() => copyToClipboard(data.requestId, 'id')}
                className="inline-flex items-center gap-1 text-xs font-mono text-neutral-300 hover:text-white transition-colors"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <div className="mt-1.5 font-mono text-base font-bold text-white tracking-wider">
              {data.requestId}
            </div>
          </div>

          {/* Secret Access Token */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-neutral-400">
                Secret Access Token (One-Time Display)
              </span>
              <button
                onClick={() => copyToClipboard(data.accessToken, 'token')}
                className="inline-flex items-center gap-1 text-xs font-mono text-neutral-300 hover:text-white transition-colors"
              >
                {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedToken ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <div className="mt-1.5 font-mono text-xs text-neutral-300 break-all bg-neutral-950 p-2.5 rounded border border-neutral-800">
              {data.accessToken}
            </div>
          </div>
        </div>

        {/* Save to Profile Vault & Download Buttons (User Requirement) */}
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              onClick={handleSaveToProfile}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-mono font-bold transition-all ${
                isSaved
                  ? 'border border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border border-cyan-500/50 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/60 hover:text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                  <span>SAVED TO MY PROFILE VAULT</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 text-cyan-400" />
                  <span>SAVE KEY & ID TO PROFILE</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPasskey}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-xs font-mono text-neutral-200 hover:text-white transition-colors"
              title="Download Passkey file as .txt"
            >
              <Download className="h-3.5 w-3.5 text-neutral-400" />
              <span>DOWNLOAD .TXT</span>
            </button>
          </div>

          {isSaved && (
            <p className="text-[11px] font-mono text-emerald-400/90 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Saved! Tap your <strong>Profile</strong> in the top navigation bar anytime to view all your case activities.</span>
            </p>
          )}
        </div>

        {/* Security Warning Notice */}
        <div className="mt-4 rounded-md border border-neutral-800 bg-neutral-900/40 p-3 text-xs text-neutral-400 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-neutral-300 shrink-0 mt-0.5" />
          <span>
            <strong className="text-neutral-200">Zero-Trust Notice:</strong> Your Secret Access Token is never retained in plaintext on our backend servers. Store it in your profile vault or download the passkey.
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            I Have Saved Credentials
          </button>
          <button
            onClick={() => onTrackNow(data.requestId, data.accessToken)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-xs font-bold text-neutral-950 hover:bg-neutral-300 transition-colors"
          >
            <span>Proceed to Track Request</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
