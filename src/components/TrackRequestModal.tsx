import React, { useState, useEffect } from 'react';
import { Search, X, Shield, Clock, AlertTriangle, Send, User, CheckCircle2, MessageSquare, ChevronRight } from 'lucide-react';
import { api, TrackResponse } from '../services/api';
import { RequestStatus } from '../types';

interface TrackRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRequestId?: string;
  initialAccessToken?: string;
}

const STATUS_STAGES: RequestStatus[] = [
  'Submitted',
  'Received',
  'Under Review',
  'Reviewed',
  'Responded',
  'Resolved'
];

export const TrackRequestModal: React.FC<TrackRequestModalProps> = ({
  isOpen,
  onClose,
  initialRequestId = '',
  initialAccessToken = ''
}) => {
  const [requestId, setRequestId] = useState(initialRequestId);
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackResponse | null>(null);

  // Follow-up state
  const [followUpMsg, setFollowUpMsg] = useState('');
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [followUpSuccess, setFollowUpSuccess] = useState(false);

  useEffect(() => {
    if (initialRequestId) {
      setRequestId(initialRequestId);
    }
    if (initialAccessToken) {
      setAccessToken(initialAccessToken);
    }
    if (initialRequestId && initialAccessToken) {
      fetchTracking(initialRequestId, initialAccessToken);
    }
  }, [initialRequestId, initialAccessToken]);

  const fetchTracking = async (reqId: string, token: string) => {
    setError(null);
    setLoading(true);

    try {
      const data = await api.trackRequest(reqId.trim(), token.trim());
      setTrackData(data);
    } catch (err: any) {
      setTrackData(null);
      setError(err.message || 'Unable to retrieve request record. Verify your Reference ID and Secret Access Token.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId.trim()) {
      setError('Please enter a Request Reference ID.');
      return;
    }
    if (!accessToken.trim()) {
      setError('Please enter the Secret Access Token generated upon submission.');
      return;
    }
    fetchTracking(requestId, accessToken);
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackData || !followUpMsg.trim()) return;

    setSendingFollowUp(true);
    setFollowUpSuccess(false);

    try {
      await api.submitFollowUp(trackData.request.requestId, accessToken, followUpMsg.trim());
      setFollowUpMsg('');
      setFollowUpSuccess(true);
      setTimeout(() => setFollowUpSuccess(false), 3000);
      // Re-fetch to display new message in thread
      await fetchTracking(trackData.request.requestId, accessToken);
    } catch (err: any) {
      alert(err.message || 'Failed to submit follow up message.');
    } finally {
      setSendingFollowUp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-neutral-700 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-left my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
              Private Request Tracking Vault
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              ZERO-TRUST INCIDENT LOOKUP & RESPONSE CONSOLE
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3 border-y border-neutral-800 py-4">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
              Request ID (e.g. CCPB-2026-XXXXX)
            </label>
            <input
              type="text"
              required
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="CCPB-2026-..."
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:border-neutral-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
              Secret Access Token (64 chars)
            </label>
            <input
              type="password"
              required
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Paste secret token..."
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:border-neutral-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[36px] rounded-md border border-neutral-200 bg-neutral-100 text-neutral-950 text-xs font-semibold hover:bg-neutral-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 rounded-md border border-neutral-700 bg-neutral-900 p-3.5 text-xs text-neutral-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Access Denied:</span> {error}
            </div>
          </div>
        )}

        {/* Request Details Result */}
        {trackData && (
          <div className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1">
            {/* Status Pipeline Visualizer */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-neutral-400">Current Status</span>
                <span className="rounded border border-neutral-600 bg-neutral-800 px-2.5 py-0.5 text-xs font-mono font-bold text-white uppercase">
                  {trackData.request.status}
                </span>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                {STATUS_STAGES.map((s, idx) => {
                  const currentIdx = STATUS_STAGES.indexOf(trackData.request.status);
                  const isPassed = currentIdx >= idx;
                  const isCurrent = trackData.request.status === s;

                  return (
                    <div
                      key={s}
                      className={`rounded p-1.5 text-center border text-[10px] font-mono ${
                        isCurrent
                          ? 'border-neutral-300 bg-neutral-100 text-neutral-950 font-bold'
                          : isPassed
                          ? 'border-neutral-700 bg-neutral-800 text-neutral-300'
                          : 'border-neutral-900 bg-neutral-950 text-neutral-600'
                      }`}
                    >
                      {s}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Request Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3.5">
                <div className="text-[11px] font-mono text-neutral-400">INCIDENT REFERENCE</div>
                <div className="mt-1 font-mono text-sm font-bold text-white">{trackData.request.requestId}</div>
                <div className="mt-2 text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300">Category:</span> {trackData.request.category}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  <span className="font-semibold text-neutral-300">Urgency:</span> {trackData.request.urgency}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3.5">
                <div className="text-[11px] font-mono text-neutral-400">INTAKE METADATA</div>
                <div className="mt-1 text-xs text-neutral-300">
                  <span className="font-semibold text-neutral-400">Submitted:</span> {new Date(trackData.request.createdAt).toLocaleString()}
                </div>
                {trackData.request.updatedAt && (
                  <div className="mt-1 text-xs text-neutral-300">
                    <span className="font-semibold text-neutral-400">Updated:</span> {new Date(trackData.request.updatedAt).toLocaleString()}
                  </div>
                )}
                <div className="mt-1 text-xs text-neutral-400 truncate">
                  <span className="font-semibold text-neutral-300">Complainant:</span> {trackData.request.fullName} ({trackData.request.email})
                </div>
              </div>
            </div>

            {/* Incident Description */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
                Subject: {trackData.request.subject}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {trackData.request.message}
              </p>
            </div>

            {/* Responses Timeline (Chronological Thread) */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 uppercase font-semibold">
                  <MessageSquare className="h-4 w-4 text-neutral-400" />
                  <span>Administrative Response Log ({trackData.responses.length})</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">AUDITED THREAD</span>
              </div>

              <div className="mt-4 space-y-3.5">
                {trackData.responses.map((resp) => (
                  <div
                    key={resp.responseId}
                    className={`rounded-lg border p-3.5 text-xs ${
                      resp.senderRole === 'admin'
                        ? 'border-neutral-700 bg-neutral-900 text-neutral-200'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-2 border-b border-neutral-800/80">
                      <span className="font-bold text-white">
                        {resp.senderName} ({resp.senderRole.toUpperCase()})
                      </span>
                      <span>{new Date(resp.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-xs leading-relaxed whitespace-pre-wrap text-neutral-300">
                      {resp.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Post Follow-Up Clarification Box */}
              <form onSubmit={handleSendFollowUp} className="mt-5 pt-4 border-t border-neutral-800">
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1.5">
                  Submit Follow-Up or Supplementary Evidence
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={followUpMsg}
                    onChange={(e) => setFollowUpMsg(e.target.value)}
                    placeholder="Provide additional details, updated transaction hashes, or respond to the administrator..."
                    className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white placeholder-neutral-600 focus:border-neutral-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingFollowUp || !followUpMsg.trim()}
                    className="px-4 rounded-md border border-neutral-200 bg-neutral-100 text-neutral-950 text-xs font-bold hover:bg-neutral-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-1 self-end h-[38px]"
                  >
                    {sendingFollowUp ? (
                      <span className="h-3 w-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
                {followUpSuccess && (
                  <p className="mt-2 text-xs text-neutral-300 font-mono">
                    ✓ Follow-up registered and appended to case thread.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Footer info if no search yet */}
        {!trackData && !loading && !error && (
          <div className="mt-8 text-center text-xs text-neutral-500 font-mono py-8">
            ENTER YOUR ASSIGNED REFERENCE ID AND SECRET ACCESS TOKEN TO ACCESS ENCRYPTED CASE RECORDS.
          </div>
        )}
      </div>
    </div>
  );
};
