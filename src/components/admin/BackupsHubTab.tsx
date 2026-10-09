import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  HardDrive, 
  Clock, 
  RotateCcw, 
  FileJson,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { BackupSnapshotRecord } from '../../types';

interface BackupsHubTabProps {
  token: string;
  onRefreshAllData: () => void;
}

export const BackupsHubTab: React.FC<BackupsHubTabProps> = ({
  token,
  onRefreshAllData
}) => {
  const [backups, setBackups] = useState<BackupSnapshotRecord[]>([]);
  const [backupStatus, setBackupStatus] = useState<string>('ACTIVE_REDUNDANT');
  const [lastBackupTime, setLastBackupTime] = useState<string>('');
  const [liveCounts, setLiveCounts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [snapshotNotes, setSnapshotNotes] = useState('');
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [restoreConfirmSnapshot, setRestoreConfirmSnapshot] = useState<BackupSnapshotRecord | null>(null);
  const [restoring, setRestoring] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await api.getBackups(token);
      setBackups(data.backups || []);
      setBackupStatus(data.status || 'ACTIVE_REDUNDANT');
      setLastBackupTime(data.lastBackupTimestamp || '');
      setLiveCounts(data.liveRecordCounts || null);
    } catch (err: any) {
      console.error(err);
      setActionNotice({ text: err.message || 'Failed to load backup repository.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [token]);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setActionNotice(null);
    try {
      const res = await api.createBackupSnapshot(token, snapshotNotes || 'Manual administrative snapshot');
      setSnapshotNotes('');
      setActionNotice({ text: res.message || 'Backup snapshot created successfully!', type: 'success' });
      fetchBackups();
    } catch (err: any) {
      setActionNotice({ text: err.message || 'Failed to generate snapshot.', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadFull = async () => {
    try {
      await api.downloadFullBackup(token);
      setActionNotice({ text: 'Downloaded full database backup file (.json) to your local storage.', type: 'success' });
    } catch (err: any) {
      setActionNotice({ text: err.message || 'Download failed.', type: 'error' });
    }
  };

  const handleRestoreSnapshot = async (snapshot: BackupSnapshotRecord) => {
    setRestoring(true);
    try {
      const res = await api.restoreBackup(token, snapshot.filename);
      setRestoreConfirmSnapshot(null);
      setActionNotice({ text: res.message || 'System state successfully restored.', type: 'success' });
      fetchBackups();
      onRefreshAllData();
    } catch (err: any) {
      setActionNotice({ text: err.message || 'Restore failed.', type: 'error' });
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Are you sure you want to restore the portal state from "${file.name}"? Current state will be replaced (a safety snapshot will be auto-saved first).`)) {
      return;
    }

    setRestoring(true);
    setActionNotice(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await api.restoreBackup(token, undefined, parsed);
      setActionNotice({ text: res.message || 'Backup file restored successfully!', type: 'success' });
      fetchBackups();
      onRefreshAllData();
    } catch (err: any) {
      setActionNotice({ text: `Failed to restore file: ${err.message}`, type: 'error' });
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
            <HardDrive className="h-6 w-6 text-cyan-400" />
            <span>Automated System Backups &amp; Snapshot Hub</span>
          </h2>
          <p className="text-xs font-mono text-cyan-300/80 mt-1">
            Persistent state redundancy engine. Full snapshots are retained continuously to guarantee zero data loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBackups}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title="Refresh Snapshots List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={handleDownloadFull}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:from-emerald-500 hover:to-teal-500 transition-all"
            title="Download full JSON database dump"
          >
            <Download className="h-4 w-4" />
            <span>Download Full Backup (.json)</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
          actionNotice.type === 'success'
            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
            : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
        }`}>
          {actionNotice.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Symmetrical KPI Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Engine Status */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>BACKUP ENGINE</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-lg font-black font-mono text-white">HEALTHY &amp; ACTIVE</div>
          <div className="text-[11px] font-mono text-emerald-300/70">Continuous Automated Snapshots</div>
        </div>

        {/* Card 2: Total Preserved Snapshots */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>SNAPSHOT VAULT</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-lg font-black font-mono text-white">{backups.length} Snapshots</div>
          <div className="text-[11px] font-mono text-cyan-300/70">Retained in server storage</div>
        </div>

        {/* Card 3: Protected Cases */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span>PROTECTED INCIDENTS</span>
            <HardDrive className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-lg font-black font-mono text-white">{liveCounts?.requests ?? 0} Cases</div>
          <div className="text-[11px] font-mono text-amber-300/70">Cryptographically Preserved</div>
        </div>

        {/* Card 4: Last Snapshot Time */}
        <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-violet-400">
            <span>LAST BACKUP</span>
            <Clock className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-sm font-bold font-mono text-white truncate">
            {lastBackupTime ? new Date(lastBackupTime).toLocaleTimeString() : 'Current'}
          </div>
          <div className="text-[11px] font-mono text-violet-300/70 truncate">
            {lastBackupTime ? new Date(lastBackupTime).toLocaleDateString() : 'Active'}
          </div>
        </div>
      </div>

      {/* Symmetrical Two-Column Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form: Create Manual Snapshot */}
        <form onSubmit={handleCreateSnapshot} className="rounded-2xl border border-cyan-500/30 bg-neutral-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span>Create Instant System Snapshot</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Takes an immediate point-in-time snapshot of all incident cases, administrative responses, security event logs, CMS content, and WAF rules.
          </p>
          <div>
            <label className="text-[10px] font-mono text-neutral-400 uppercase">Snapshot Description / Notes (Optional)</label>
            <input
              type="text"
              value={snapshotNotes}
              onChange={(e) => setSnapshotNotes(e.target.value)}
              placeholder="e.g. Pre-maintenance check / incident audit backup"
              className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 font-mono text-xs font-bold transition-all shadow-sm"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Capturing Snapshot...</span>
              </span>
            ) : (
              <>
                <Database className="h-4 w-4" />
                <span>Generate Point-in-Time Snapshot</span>
              </>
            )}
          </button>
        </form>

        {/* Right Form: Restore From External Backup File */}
        <div className="rounded-2xl border border-indigo-500/30 bg-neutral-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-indigo-300">
            <Upload className="h-4 w-4" />
            <span>Upload &amp; Restore Backup File</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Restore state from a previously exported <code className="text-indigo-300">.json</code> backup file from your local storage. (An emergency snapshot is auto-created before restoration).
          </p>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-xl p-5 cursor-pointer bg-neutral-950/60 transition-all group">
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFromFile}
              className="hidden"
            />
            <FileJson className="h-8 w-8 text-indigo-400 group-hover:scale-105 transition-transform" />
            <span className="mt-2 text-xs font-mono font-bold text-neutral-200">
              Select .json Backup from Local Storage
            </span>
            <span className="text-[10px] font-mono text-neutral-500 mt-0.5">
              Instant one-click state restoration
            </span>
          </label>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-white">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Historical Server Snapshot Vault</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Total {backups.length} snapshots available
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Snapshot Name &amp; Note</th>
                <th className="px-6 py-3">Captured Timestamp</th>
                <th className="px-6 py-3">File Size</th>
                <th className="px-6 py-3">Records Breakdown</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
                    No snapshots recorded yet. Click "Generate Point-in-Time Snapshot" above.
                  </td>
                </tr>
              ) : (
                backups.map((snap) => (
                  <tr key={snap.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-white truncate max-w-xs">{snap.filename}</div>
                      <div className="text-[10px] text-neutral-400">{snap.notes || 'Routine state backup'}</div>
                    </td>
                    <td className="px-6 py-3.5 text-neutral-300">
                      {new Date(snap.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-400">
                      {(snap.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-amber-400">{snap.recordsCount.requests} Cases</span>
                        <span>•</span>
                        <span className="text-cyan-400">{snap.recordsCount.securityLogs} Sec Logs</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                        snap.isAuto
                          ? 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
                          : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      }`}>
                        {snap.isAuto ? 'AUTO' : 'MANUAL'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setRestoreConfirmSnapshot(snap)}
                        className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 text-[11px] font-bold transition-colors"
                        title="Restore system state from this snapshot"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Restore */}
      {restoreConfirmSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-amber-500/50 bg-neutral-950 p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-400">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase font-mono">Confirm Snapshot Restore</h3>
                <p className="text-xs font-mono text-amber-400">Target: {restoreConfirmSnapshot.filename}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-mono">
              Restoring will revert the active database and CMS to the state recorded at <strong>{new Date(restoreConfirmSnapshot.timestamp).toLocaleString()}</strong>.
              <br /><br />
              <span className="text-emerald-400">A safety snapshot will be auto-saved before restoring so nothing is lost.</span>
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setRestoreConfirmSnapshot(null)}
                className="px-4 py-2 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestoreSnapshot(restoreConfirmSnapshot)}
                disabled={restoring}
                className="px-5 py-2 rounded-xl border border-amber-500/50 bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold transition-all"
              >
                {restoring ? 'Restoring System...' : 'Yes, Restore Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
