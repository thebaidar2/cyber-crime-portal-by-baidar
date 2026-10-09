import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Shield, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  Download, 
  Plus, 
  AlertCircle, 
  Lock, 
  LogIn, 
  LogOut,
  FolderLock
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserActivityRecord } from '../types';
import { userActivitiesService } from '../services/userActivities';

interface UserProfileActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onTrackCase: (requestId: string, token: string) => void;
}

export const UserProfileActivitiesModal: React.FC<UserProfileActivitiesModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  onTrackCase
}) => {
  const [activities, setActivities] = useState<UserActivityRecord[]>([]);
  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualId, setManualId] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [manualSubject, setManualSubject] = useState('');
  const [manualError, setManualError] = useState('');

  const loadActivities = () => {
    setActivities(userActivitiesService.getActivities());
  };

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadActivities();
    window.addEventListener('ccpb_activities_updated', handleUpdate);
    return () => window.removeEventListener('ccpb_activities_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = (text: string, type: 'id' | 'token', key: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedToken(key);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const handleRemove = (requestId: string) => {
    if (window.confirm(`Remove case ${requestId} from your saved activities? (You can re-add it anytime with your secret key).`)) {
      userActivitiesService.removeActivity(requestId);
      loadActivities();
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    if (!manualId.trim() || !manualToken.trim()) {
      setManualError('Please provide both Case Reference ID and Secret Access Token.');
      return;
    }

    userActivitiesService.saveActivity({
      requestId: manualId.trim(),
      accessToken: manualToken.trim(),
      subject: manualSubject.trim() || 'Imported Incident Reference',
      category: 'Saved Activity',
      status: 'Submitted',
      createdAt: new Date().toISOString()
    });

    setManualId('');
    setManualToken('');
    setManualSubject('');
    setShowAddManual(false);
    loadActivities();
  };

  const handleDownloadAll = () => {
    if (activities.length === 0) return;
    const content = `=====================================================
CYBER CRIME PORTAL BY BAIDAR - SAVED CASE ACTIVITIES
USER IDENTITY : ${user ? user.email : 'Client Session Vault'}
EXPORTED AT   : ${new Date().toISOString()}
TOTAL CASES   : ${activities.length}
=====================================================

` + activities.map((a, idx) => `
[CASE ${idx + 1}]
REFERENCE ID  : ${a.requestId}
ACCESS TOKEN  : ${a.accessToken}
SUBJECT       : ${a.subject}
CATEGORY      : ${a.category}
STATUS        : ${a.status}
SAVED DATE    : ${new Date(a.savedAt).toLocaleString()}
-----------------------------------------------------`).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const elem = document.createElement('a');
    elem.href = url;
    elem.download = `CCPB-My-Activities-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(elem);
    elem.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(elem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-left my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          title="Close Profile"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-5 border-b border-neutral-800">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 text-cyan-400 shadow-inner">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <UserIcon className="h-7 w-7 text-neutral-200" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide truncate">
                {user ? (user.displayName || user.email?.split('@')[0]) : 'User Profile & Activity Vault'}
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>VAULT ACTIVE</span>
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 truncate mt-0.5">
              {user ? user.email : 'Client-Side Encrypted Device Storage'}
            </p>
          </div>

          <div className="flex items-center gap-2 pr-8">
            {user ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                title="Sign out of Google"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-xs font-mono text-cyan-300 hover:bg-cyan-900/50 transition-colors"
                title="Sign in with Google"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Google Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation & Action Bar */}
        <div className="flex items-center justify-between py-4 border-b border-neutral-900 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5">
              <FolderLock className="h-4 w-4 text-cyan-400" />
              <span>My Saved Incident Activities</span>
            </span>
            <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-mono font-bold text-neutral-400 border border-neutral-800">
              {activities.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 px-2.5 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 transition-colors"
                title="Download all passkeys as text file"
              >
                <Download className="h-3 w-3" />
                <span>Export Passkeys</span>
              </button>
            )}
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddManual ? 'Cancel' : 'Add Case Key'}</span>
            </button>
          </div>
        </div>

        {/* Manual Add Case Drawer */}
        {showAddManual && (
          <form onSubmit={handleAddManual} className="p-4 my-3 rounded-xl border border-cyan-500/30 bg-neutral-900/90 space-y-3">
            <div className="text-xs font-mono font-bold text-cyan-300">
              Save An Existing Case & Secret Key To Your Vault
            </div>
            {manualError && (
              <div className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{manualError}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Case Reference ID</label>
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="CCPB-2026-XXXXX"
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-mono text-white placeholder-neutral-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Secret Access Token</label>
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="sec_tok_..."
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-mono text-white placeholder-neutral-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase">Case Subject (Optional)</label>
              <input
                type="text"
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
                placeholder="Brief description / subject"
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-mono text-white placeholder-neutral-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddManual(false)}
                className="px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-600 text-white text-xs font-mono font-bold hover:bg-cyan-500 transition-colors"
              >
                Save to Vault
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Activities List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
          {activities.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-800 rounded-xl p-6">
              <Shield className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-neutral-300">No Saved Activities Yet</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
                When you submit an incident consultation request, tap <strong>"Save Key & ID to Profile"</strong> on the confirmation screen to store your credentials securely here.
              </p>
            </div>
          ) : (
            activities.map((act) => {
              const isVisible = visibleTokens[act.id] || false;
              const isIdCopied = copiedId === act.id;
              const isTokenCopied = copiedToken === act.id;

              return (
                <div
                  key={act.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3 hover:border-neutral-700 transition-all text-left"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-white tracking-wider">
                          {act.requestId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-neutral-700 bg-neutral-800 text-neutral-300">
                          {act.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-1">
                        {act.subject}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Saved: {new Date(act.savedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{act.category}</span>
                      </div>
                    </div>

                    {/* Quick Track Button */}
                    <button
                      onClick={() => {
                        onClose();
                        onTrackCase(act.requestId, act.accessToken);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-colors"
                      title="Inspect live case progress and investigator replies"
                    >
                      <span>Track Now</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Secret Token Field */}
                  <div className="rounded-lg border border-neutral-800/80 bg-neutral-950 p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Lock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                      <div className="font-mono text-xs text-neutral-300 truncate">
                        {isVisible ? act.accessToken : '••••••••••••••••••••••••••••••••••••'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleTokenVisibility(act.id)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
                        title={isVisible ? 'Hide token' : 'Show token'}
                      >
                        {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => copyText(act.accessToken, 'token', act.id)}
                        className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                        title="Copy Secret Token"
                      >
                        {isTokenCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => userActivitiesService.downloadCredentialsTxt(act.requestId, act.accessToken, act.subject, act.category)}
                        className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                        title="Download Passkey TXT"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemove(act.requestId)}
                        className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                        title="Remove from saved activities"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Zero-Knowledge Device Storage</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
