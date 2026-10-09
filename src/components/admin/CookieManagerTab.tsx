import React, { useState, useEffect } from 'react';
import {
  Cookie,
  RefreshCw,
  Trash2,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Monitor,
  X,
  FileJson,
  Layers,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { CookieConsentRecord } from '../../types';

interface CookieManagerTabProps {
  token: string;
  onRefreshAllData: () => void;
}

export const CookieManagerTab: React.FC<CookieManagerTabProps> = ({
  token,
  onRefreshAllData
}) => {
  const [cookies, setCookies] = useState<CookieConsentRecord[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    allowed: number;
    essentialOnly: number;
    custom: number;
    declined: number;
  }>({
    total: 0,
    allowed: 0,
    essentialOnly: 0,
    custom: 0,
    declined: 0
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<CookieConsentRecord | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchCookieRecords = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCookies(token);
      setCookies(res.cookies || []);
      setStats(res.stats || {
        total: (res.cookies || []).length,
        allowed: (res.cookies || []).filter(c => c.consentStatus === 'allowed').length,
        essentialOnly: (res.cookies || []).filter(c => c.consentStatus === 'essential_only').length,
        custom: (res.cookies || []).filter(c => c.consentStatus === 'custom').length,
        declined: (res.cookies || []).filter(c => c.consentStatus === 'declined').length
      });
    } catch (err: any) {
      console.error('Failed to load cookie records:', err);
      setActionNotice({ text: err.message || 'Failed to retrieve cookie records.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCookieRecords();
  }, [token]);

  const handleDeleteRecord = async (id: string, visitorId: string) => {
    if (!confirm(`Are you sure you want to remove the cookie record for visitor "${visitorId}"?`)) {
      return;
    }

    try {
      await api.deleteAdminCookie(token, id);
      setActionNotice({ text: `Cookie record for ${visitorId} deleted successfully.`, type: 'success' });
      if (selectedRecord?.id === id) setSelectedRecord(null);
      fetchCookieRecords();
      onRefreshAllData();
    } catch (err: any) {
      setActionNotice({ text: err.message || 'Failed to delete cookie record.', type: 'error' });
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      const res = await api.clearAdminCookies(token);
      setActionNotice({ text: res.message || 'All cookie records cleared successfully.', type: 'success' });
      setShowClearModal(false);
      setSelectedRecord(null);
      fetchCookieRecords();
      onRefreshAllData();
    } catch (err: any) {
      setActionNotice({ text: err.message || 'Failed to clear cookies.', type: 'error' });
    } finally {
      setClearing(false);
    }
  };

  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cookies, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `cookie-vault-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setActionNotice({ text: 'Exported cookie records to JSON.', type: 'success' });
    } catch (err) {
      setActionNotice({ text: 'Failed to export cookie records.', type: 'error' });
    }
  };

  // Filtered Records
  const filteredRecords = cookies.filter(rec => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'ALLOWED' && rec.consentStatus === 'allowed') ||
      (statusFilter === 'ESSENTIAL' && rec.consentStatus === 'essential_only') ||
      (statusFilter === 'CUSTOM' && rec.consentStatus === 'custom') ||
      (statusFilter === 'DECLINED' && rec.consentStatus === 'declined');

    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchVisitor = rec.visitorId?.toLowerCase().includes(query);
    const matchIp = rec.ipAddress?.toLowerCase().includes(query);
    const matchUa = rec.userAgent?.toLowerCase().includes(query);
    const matchCookieName = rec.cookiesSet?.some(c => c.name.toLowerCase().includes(query));

    return matchVisitor || matchIp || matchUa || matchCookieName;
  });

  const allowedPercent = stats.total > 0 ? Math.round((stats.allowed / stats.total) * 100) : 0;
  const totalCookiesSet = cookies.reduce((acc, curr) => acc + (curr.cookiesSet?.length || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-mono ${
            actionNotice.type === 'success'
              ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300'
              : 'border-red-800/80 bg-red-950/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
            <Cookie className="h-4 w-4 text-amber-400" />
            <span>COOKIE CONSENT &amp; VISITOR VAULT</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white uppercase">
            Cookie Management &amp; Sessions
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Centralized registry of user cookie permissions, browser signatures, cryptographic session tokens, and compliance audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchCookieRecords}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-mono font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={cookies.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-mono font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            disabled={cookies.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/30 px-3.5 py-2 text-xs font-mono font-semibold text-red-400 hover:bg-red-900/40 hover:text-red-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Cookie Logs</span>
          </button>
        </div>
      </div>

      {/* 4 Symmetrical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Consents */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>TOTAL VISITOR CONSENTS</span>
            <Cookie className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-white">
            {stats.total}
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 font-mono">
            Recorded in local database
          </div>
        </div>

        {/* Card 2: Allowed Rate */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>FULL CONSENT GRANTED</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-emerald-400">
            {stats.allowed}
            <span className="text-xs text-neutral-500 font-normal ml-2">({allowedPercent}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 font-mono">
            Allowed all security &amp; session cookies
          </div>
        </div>

        {/* Card 3: Essential & Restricted */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>ESSENTIAL / CUSTOM</span>
            <Lock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-amber-400">
            {stats.essentialOnly + stats.custom}
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 font-mono">
            {stats.essentialOnly} Essential, {stats.custom} Custom
          </div>
        </div>

        {/* Card 4: Active Tokens in Circulation */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>ACTIVE COOKIE TOKENS</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-white">
            {totalCookiesSet}
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 font-mono">
            Cryptographic tokens issued
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Visitor ID, IP address, user agent, or cookie key..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2 pl-10 pr-4 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none"
          >
            <option value="ALL">All Statuses ({cookies.length})</option>
            <option value="ALLOWED">Allowed Only ({stats.allowed})</option>
            <option value="ESSENTIAL">Essential Only ({stats.essentialOnly})</option>
            <option value="CUSTOM">Custom ({stats.custom})</option>
            <option value="DECLINED">Declined ({stats.declined})</option>
          </select>
        </div>
      </div>

      {/* Table of Cookie Records */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Visitor &amp; Device</th>
                <th className="px-5 py-3.5 font-semibold">Consent Status</th>
                <th className="px-5 py-3.5 font-semibold">Client IP</th>
                <th className="px-5 py-3.5 font-semibold">Active Cookies</th>
                <th className="px-5 py-3.5 font-semibold">Preferences</th>
                <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Cookie className="h-8 w-8 text-neutral-700" />
                      <p className="text-xs">No cookie consent records match the active criteria.</p>
                      <p className="text-[11px] text-neutral-600">
                        When visitors enter the website and interact with the cookie popup, their records will appear here in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-neutral-900/40 transition-colors">
                      {/* Visitor & Device */}
                      <td className="px-5 py-3.5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{rec.visitorId}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-sans mt-0.5 truncate max-w-[180px]">
                          {rec.device || 'Desktop'} • {rec.browser || 'Browser'}
                        </div>
                      </td>

                      {/* Consent Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold border ${
                            rec.consentStatus === 'allowed'
                              ? 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
                              : rec.consentStatus === 'essential_only'
                              ? 'border-blue-800 bg-blue-950/60 text-blue-300'
                              : rec.consentStatus === 'custom'
                              ? 'border-amber-800 bg-amber-950/60 text-amber-300'
                              : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {rec.consentStatus.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>

                      {/* Client IP */}
                      <td className="px-5 py-3.5 text-neutral-300">
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{rec.ipAddress}</span>
                        </div>
                      </td>

                      {/* Active Cookies */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(rec.cookiesSet || []).map((ck, i) => (
                            <span
                              key={i}
                              className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300"
                              title={`${ck.name}: ${ck.purpose}`}
                            >
                              {ck.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Preferences */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              rec.preferences?.security
                                ? 'bg-neutral-800 text-neutral-200'
                                : 'bg-neutral-900 text-neutral-600 line-through'
                            }`}
                            title="Security tokens"
                          >
                            Sec
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              rec.preferences?.analytics
                                ? 'bg-neutral-800 text-neutral-200'
                                : 'bg-neutral-900 text-neutral-600 line-through'
                            }`}
                            title="Analytics"
                          >
                            Analytics
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              rec.preferences?.functional
                                ? 'bg-neutral-800 text-neutral-200'
                                : 'bg-neutral-900 text-neutral-600 line-through'
                            }`}
                            title="Functional"
                          >
                            Func
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-3.5 text-neutral-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-neutral-500" />
                          <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {new Date(rec.createdAt).toLocaleTimeString()}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
                            title="Inspect cookie record details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.visitorId)}
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-950/50 hover:text-red-400 transition-colors"
                            title="Delete this record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal (Inspector) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-amber-400">
                  <Cookie className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-mono">
                    Cookie Record Inspector
                  </h3>
                  <div className="text-xs text-neutral-400 font-mono">
                    ID: {selectedRecord.visitorId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <span className="text-neutral-500 text-[10px] block">CONSENT STATUS</span>
                <span className="text-white font-bold">{selectedRecord.consentStatus.toUpperCase()}</span>
              </div>
              <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <span className="text-neutral-500 text-[10px] block">CLIENT IP</span>
                <span className="text-white font-bold">{selectedRecord.ipAddress}</span>
              </div>
              <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <span className="text-neutral-500 text-[10px] block">FIRST SEEN</span>
                <span className="text-white font-bold">{new Date(selectedRecord.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* User Agent & Origin */}
            <div className="mt-4 p-3 rounded-xl border border-neutral-800 bg-neutral-900/40 text-xs font-mono space-y-1.5">
              <div className="text-[10px] text-neutral-500 uppercase">User-Agent Header</div>
              <div className="text-neutral-300 break-all">{selectedRecord.userAgent}</div>
              {selectedRecord.referrer && (
                <div className="pt-1.5 border-t border-neutral-800 text-[11px] text-neutral-400">
                  Referrer: <span className="text-neutral-200">{selectedRecord.referrer}</span>
                </div>
              )}
            </div>

            {/* Cookie List Table */}
            <div className="mt-5">
              <div className="text-xs font-mono uppercase text-neutral-400 font-semibold mb-2">
                Active Cookies Attached ({selectedRecord.cookiesSet?.length || 0})
              </div>
              <div className="space-y-2">
                {(selectedRecord.cookiesSet || []).map((ck, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/30 text-xs font-mono flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">{ck.name}</span>
                      <span className="text-[10px] text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                        Expires: {ck.expires}
                      </span>
                    </div>
                    <div className="text-neutral-400 text-[11px]">{ck.purpose}</div>
                    <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                      Value: <code className="text-neutral-300">{ck.value}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON View */}
            <div className="mt-5">
              <div className="text-xs font-mono uppercase text-neutral-400 font-semibold mb-2">
                Raw Compliance Record (JSON)
              </div>
              <pre className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 text-[10px] font-mono text-neutral-300 max-h-40 overflow-y-auto">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-center">
              <button
                onClick={() => handleDeleteRecord(selectedRecord.id, selectedRecord.visitorId)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-2 text-xs font-mono text-red-400 hover:bg-red-900/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Record</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-neutral-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Modal Confirmation */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-900/80 bg-neutral-950 p-6 shadow-2xl text-neutral-100">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold uppercase font-mono">
                Purge All Cookie Records?
              </h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              This will permanently delete all <strong className="text-white">{cookies.length}</strong> visitor cookie consent and tracking records from the server storage.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowClearModal(false)}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-mono text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                disabled={clearing}
                onClick={handleClearAll}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-mono font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
