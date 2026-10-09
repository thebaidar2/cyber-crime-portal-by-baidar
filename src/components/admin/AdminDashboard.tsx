import React, { useState, useEffect } from 'react';
import {
  Shield, LayoutDashboard, Inbox, FileText, Share2, ShieldAlert,
  History, Settings, LogOut, Search, Filter, RefreshCw, Send,
  Trash2, Plus, CheckCircle2, AlertTriangle, Eye, ArrowUpDown, X,
  ExternalLink, Lock, Check, Edit2, Activity, Globe, Key, UserCheck,
  Palette, HardDrive, Cookie
} from 'lucide-react';
import { api } from '../../services/api';
import {
  UserRequest, ResponseMessage, WebsiteContent, SocialLink,
  SecurityEventLog, BlockedIpRecord, AuditLogRecord, RequestStatus, ServiceItem
} from '../../types';
import { ThemeManagerTab } from './ThemeManagerTab';
import { BackupsHubTab } from './BackupsHubTab';
import { CookieManagerTab } from './CookieManagerTab';

interface AdminDashboardProps {
  token: string;
  adminUsername: string;
  onLogout: () => void;
  onRefreshPublicContent: () => void;
}

type AdminTab = 'overview' | 'requests' | 'content' | 'theme' | 'backups' | 'cookies' | 'social' | 'security' | 'audit' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminUsername,
  onLogout,
  onRefreshPublicContent
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [requestResponses, setRequestResponses] = useState<ResponseMessage[]>([]);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [newStatusSelect, setNewStatusSelect] = useState<RequestStatus>('Under Review');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Content CMS state
  const [cmsContent, setCmsContent] = useState<WebsiteContent | null>(null);
  const [savingCms, setSavingCms] = useState(false);
  const [cmsSuccess, setCmsSuccess] = useState(false);

  // Social Links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newHandle, setNewHandle] = useState('');

  // Security & IP state
  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIpRecord[]>([]);
  const [newBlockIp, setNewBlockIp] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // Purge & Erasure modals state
  const [showPurgeAllRequestsModal, setShowPurgeAllRequestsModal] = useState(false);
  const [showPurgeDemoModal, setShowPurgeDemoModal] = useState(false);
  const [showPurgeSecLogsModal, setShowPurgeSecLogsModal] = useState(false);
  const [showPurgeAuditLogsModal, setShowPurgeAuditLogsModal] = useState(false);
  const [showMasterResetModal, setShowMasterResetModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // Fetch Stats & Initial Data
  const loadStatsAndRequests = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAdminStats(token);
      setStats(statsData);

      const reqData = await api.getAdminRequests(token, { status: statusFilter, search: searchQuery });
      setRequests(reqData.requests || []);

      const contentData = await api.getContent();
      setCmsContent(contentData.content);

      const socialData = await api.getAdminSocialLinks(token);
      setSocialLinks(socialData.socialLinks || []);

      const secData = await api.getSecurityLogs(token);
      setSecurityLogs(secData.logs || []);

      const ipData = await api.getBlockedIps(token);
      setBlockedIps(ipData.blockedIps || []);

      const auditData = await api.getAuditLogs(token);
      setAuditLogs(auditData.logs || []);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatsAndRequests();
  }, [token]);

  // Request Selection
  const openRequestDetail = async (req: UserRequest) => {
    setSelectedRequest(req);
    setNewStatusSelect(req.status);
    try {
      const detail = await api.getAdminRequestDetail(token, req.requestId);
      setRequestResponses(detail.responses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: RequestStatus) => {
    if (!selectedRequest) return;
    try {
      await api.updateRequestStatus(token, selectedRequest.requestId, status);
      setSelectedRequest({ ...selectedRequest, status });
      setRequests(requests.map(r => r.requestId === selectedRequest.requestId ? { ...r, status } : r));
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !adminResponseText.trim()) return;

    setSendingResponse(true);
    try {
      const res = await api.sendAdminResponse(token, selectedRequest.requestId, adminResponseText.trim(), newStatusSelect);
      setRequestResponses([...requestResponses, res.response]);
      setSelectedRequest({ ...selectedRequest, status: res.currentStatus });
      setAdminResponseText('');
      setRequests(requests.map(r => r.requestId === selectedRequest.requestId ? { ...r, status: res.currentStatus } : r));
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to send response');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await api.deleteRequest(token, requestId);
      setDeleteConfirmId(null);
      if (selectedRequest?.requestId === requestId) {
        setSelectedRequest(null);
      }
      setRequests(requests.filter(r => r.requestId !== requestId));
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to delete request');
    }
  };

  const handlePurgeAllRequests = async () => {
    try {
      await api.clearAllRequests(token);
      setShowPurgeAllRequestsModal(false);
      setSelectedRequest(null);
      setRequests([]);
      setActionNotice('Successfully purged all incident cases.');
      setTimeout(() => setActionNotice(null), 3500);
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to purge cases');
    }
  };

  const handleSeedDemoCases = async () => {
    try {
      setLoading(true);
      const res = await api.seedDemoCases(token);
      setActionNotice(res.message || 'Seeded 3 realistic demo cyber cases into portal.');
      setTimeout(() => setActionNotice(null), 4000);
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to seed demo cases');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDemoCases = async () => {
    try {
      setLoading(true);
      const res = await api.clearDemoCases(token);
      setShowPurgeDemoModal(false);
      setActionNotice(res.message || 'Removed demo cases.');
      setTimeout(() => setActionNotice(null), 3500);
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to remove demo cases');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeSecLogs = async () => {
    try {
      await api.clearSecurityLogs(token);
      setShowPurgeSecLogsModal(false);
      setSecurityLogs([]);
      setActionNotice('Security and WAF logs erased.');
      setTimeout(() => setActionNotice(null), 3500);
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to purge security logs');
    }
  };

  const handlePurgeAuditLogs = async () => {
    try {
      await api.clearAuditLogs(token);
      setShowPurgeAuditLogsModal(false);
      setAuditLogs([]);
      setActionNotice('Audit ledger erased.');
      setTimeout(() => setActionNotice(null), 3500);
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to purge audit logs');
    }
  };

  const handleMasterReset = async () => {
    try {
      setLoading(true);
      const res = await api.masterReset(token);
      setShowMasterResetModal(false);
      setSelectedRequest(null);
      setRequests([]);
      setSecurityLogs([]);
      setAuditLogs([]);
      setActionNotice(res.message || 'Master system reset completed successfully.');
      setTimeout(() => setActionNotice(null), 5000);
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to perform master reset');
    } finally {
      setLoading(false);
    }
  };

  // CMS Content Saving
  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsContent) return;
    setSavingCms(true);
    setCmsSuccess(false);

    try {
      await api.updateWebsiteContent(token, cmsContent);
      setCmsSuccess(true);
      setTimeout(() => setCmsSuccess(false), 3000);
      onRefreshPublicContent();
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to save CMS updates');
    } finally {
      setSavingCms(false);
    }
  };

  // Social Links management
  const handleAddSocialLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.trim() || !newUrl.trim()) return;
    try {
      const res = await api.addSocialLink(token, {
        platform: newPlatform.trim(),
        url: newUrl.trim(),
        handle: newHandle.trim() || `@${newPlatform.trim()}`,
        enabled: true,
        order: socialLinks.length + 1
      });
      setSocialLinks([...socialLinks, res.link]);
      setNewPlatform('');
      setNewUrl('');
      setNewHandle('');
      onRefreshPublicContent();
    } catch (err: any) {
      alert(err.message || 'Failed to add link');
    }
  };

  const handleToggleSocialLink = async (link: SocialLink) => {
    try {
      const updated = await api.updateSocialLink(token, link.id, { enabled: !link.enabled });
      setSocialLinks(socialLinks.map(l => l.id === link.id ? updated.link : l));
      onRefreshPublicContent();
    } catch (err: any) {
      alert(err.message || 'Failed to update link');
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    try {
      await api.deleteSocialLink(token, id);
      setSocialLinks(socialLinks.filter(l => l.id !== id));
      onRefreshPublicContent();
    } catch (err: any) {
      alert(err.message || 'Failed to delete link');
    }
  };

  // IP Block / Unblock
  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockIp.trim()) return;
    try {
      const res = await api.blockIp(token, newBlockIp.trim(), newBlockReason.trim() || 'Manual administrator block');
      setBlockedIps([res.block, ...blockedIps]);
      setNewBlockIp('');
      setNewBlockReason('');
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to block IP');
    }
  };

  const handleUnblockIp = async (ip: string) => {
    try {
      await api.unblockIp(token, ip);
      setBlockedIps(blockedIps.filter(b => b.ipAddress !== ip));
      loadStatsAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to unblock IP');
    }
  };

  // Password update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await api.changeAdminPassword(token, currentPassword, newPassword);
      setPasswordMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg(`Error: ${err.message}`);
    }
  };

  // Helper for Status Badge Styling (Rich Colorful)
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Received':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Under Review':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Reviewed':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Responded':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Closed':
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  // Helper for Urgency Badge Styling
  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'Critical Incident') {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    if (urgency === 'High Priority') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Colorful SOC Bar */}
      <header className="border-b border-indigo-500/20 bg-neutral-950/95 px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-600/30 to-blue-700/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-extrabold tracking-wider uppercase text-white flex items-center gap-2">
              <span>CYBER CRIME PORTAL BY BAIDAR</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>COMMAND SOC ACTIVE</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400/80">
              INCIDENT RESPONSE OPERATIONS &amp; FORENSICS ENGINE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono border border-emerald-500/40 rounded-lg px-2.5 py-1.5 bg-emerald-950/40 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BACKUP: SECURED</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono border border-cyan-500/30 rounded-lg px-3 py-1.5 bg-cyan-950/30 text-cyan-200">
            <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>OFFICER:</span>
            <span className="text-white font-bold">{adminUsername}</span>
          </div>

          <button
            onClick={loadStatsAndRequests}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors shadow-sm"
            title="Refresh All Records"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3.5 py-1.5 text-xs font-mono text-rose-300 hover:bg-rose-900/50 hover:text-white transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-bold">Terminate Session</span>
          </button>
        </div>
      </header>

      {/* Main Symmetrical Dashboard Grid */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Symmetrical Colorful Sidebar */}
        <aside className="w-full md:w-64 border-r border-indigo-500/20 bg-neutral-950/90 p-4 space-y-1.5 shrink-0">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400/70 px-3 py-2 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>COMMAND MODULES</span>
          </div>

          {/* Overview Tab */}
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'overview'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-cyan-300'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </button>

          {/* Requests Tab */}
          <button
            onClick={() => setCurrentTab('requests')}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'requests'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="h-4 w-4" />
              <span>User Requests</span>
            </div>
            {stats && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentTab === 'requests' ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {stats.total}
              </span>
            )}
          </button>

          {/* Website Content CMS Tab */}
          <button
            onClick={() => setCurrentTab('content')}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'content'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-emerald-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Website Content CMS</span>
          </button>

          {/* Landing Page Theme & Media Studio Tab */}
          <button
            onClick={() => setCurrentTab('theme')}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'theme'
                ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(217,70,239,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-fuchsia-300'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Theme &amp; Media Studio</span>
          </button>

          {/* System Backups Hub Tab */}
          <button
            onClick={() => setCurrentTab('backups')}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'backups'
                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-emerald-300'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>System Backups Hub</span>
          </button>

          {/* Cookies & Consent Vault Tab */}
          <button
            onClick={() => setCurrentTab('cookies')}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'cookies'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Cookie className="h-4 w-4" />
              <span>Cookies &amp; Consent</span>
            </div>
            {stats?.cookieCount !== undefined && stats.cookieCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentTab === 'cookies' ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {stats.cookieCount}
              </span>
            )}
          </button>

          {/* Social Links Tab */}
          <button
            onClick={() => setCurrentTab('social')}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'social'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-violet-300'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>Social Links Manager</span>
          </button>

          {/* WAF & IP Defense Tab */}
          <button
            onClick={() => setCurrentTab('security')}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'security'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4" />
              <span>WAF &amp; IP Defense</span>
            </div>
            {blockedIps.length > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentTab === 'security' ? 'bg-black text-rose-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {blockedIps.length}
              </span>
            )}
          </button>

          {/* Audit Logs Tab */}
          <button
            onClick={() => setCurrentTab('audit')}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'audit'
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-indigo-300'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Audit Trail Logs</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-mono transition-all text-left ${
              currentTab === 'settings'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Access Settings</span>
          </button>
        </aside>

        {/* Tab Main Content (Symmetrical, Structured & Colorful) */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto bg-gradient-to-b from-neutral-950 via-slate-950 to-neutral-950">
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
                  <span className="text-cyan-400">//</span>
                  <span>Operational Incident Command Overview</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-mono">
                  Live metrics across incoming incident complaints, active containment queues, and automated security events.
                </p>
              </div>

              {/* 4 Symmetrical Glowing Stat Cards (Equal Widths & Heights) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {/* Total Intake (Cyan) */}
                <div className="h-full flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-neutral-900/60 to-neutral-950 p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)] hover:border-cyan-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        TOTAL INTAKE
                      </span>
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                        <Inbox className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 text-4xl font-black text-white font-mono">{stats?.total || 0}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-cyan-500/20 text-[11px] text-cyan-300/80 font-mono">
                    All recorded submissions
                  </div>
                </div>

                {/* Pending Triage (Amber) */}
                <div className="h-full flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-neutral-900/60 to-neutral-950 p-6 shadow-[0_0_25px_rgba(245,158,11,0.1)] hover:border-amber-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                        PENDING TRIAGE
                      </span>
                      <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                        <Activity className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 text-4xl font-black text-white font-mono">{stats?.submitted || 0}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-amber-500/20 text-[11px] text-amber-300/80 font-mono">
                    Awaiting officer assignment
                  </div>
                </div>

                {/* Under Review (Violet) */}
                <div className="h-full flex flex-col justify-between rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-neutral-900/60 to-neutral-950 p-6 shadow-[0_0_25px_rgba(168,85,247,0.1)] hover:border-purple-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                        INVESTIGATION
                      </span>
                      <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                        <Search className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 text-4xl font-black text-white font-mono">{stats?.underReview || 0}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-purple-500/20 text-[11px] text-purple-300/80 font-mono">
                    Forensic analysis active
                  </div>
                </div>

                {/* Resolved & Closed (Emerald) */}
                <div className="h-full flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-neutral-900/60 to-neutral-950 p-6 shadow-[0_0_25px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        RESOLVED CASES
                      </span>
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4 text-4xl font-black text-white font-mono">{stats?.resolved || 0}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-300/80 font-mono">
                    Successful containment
                  </div>
                </div>
              </div>

              {/* 4 Symmetrical Secondary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-rose-300 font-bold uppercase">BLOCKED THREAT IPS</span>
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black font-mono text-white">{stats?.blockedIpsCount || 0}</div>
                  <p className="mt-1 text-[11px] text-rose-200/60 font-mono">Actively quarantined addresses</p>
                </div>

                <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-sky-300 font-bold uppercase">WAF SECURITY TELEMETRY</span>
                    <Activity className="h-4 w-4 text-sky-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black font-mono text-white">{stats?.recentEventsCount || 0}</div>
                  <p className="mt-1 text-[11px] text-sky-200/60 font-mono">Evaluated request cycles</p>
                </div>

                <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-teal-300 font-bold uppercase">INTAKE SERVICE MODULES</span>
                    <Globe className="h-4 w-4 text-teal-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black font-mono text-white">{stats?.activeServicesCount || 0}</div>
                  <p className="mt-1 text-[11px] text-teal-200/60 font-mono">Available specialized offerings</p>
                </div>

                <div
                  onClick={() => setCurrentTab('cookies')}
                  className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 shadow-sm cursor-pointer hover:border-amber-500/60 transition-all hover:bg-amber-950/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">COOKIE CONSENT VAULT</span>
                    <Cookie className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-2 text-2xl font-black font-mono text-white">{stats?.cookieCount || 0}</div>
                  <p className="mt-1 text-[11px] text-amber-200/60 font-mono">Managed authorizations &rarr;</p>
                </div>
              </div>

              {/* Recent Requests Symmetrical Table */}
              <div className="rounded-2xl border border-slate-800 bg-neutral-900/40 p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="font-mono text-sm font-extrabold uppercase text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Recent Incident Cases</span>
                  </div>
                  <button
                    onClick={() => setCurrentTab('requests')}
                    className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    Open Case Desk &rarr;
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 pr-4">REFERENCE ID</th>
                        <th className="py-3 pr-4">COMPLAINANT</th>
                        <th className="py-3 pr-4">CATEGORY</th>
                        <th className="py-3 pr-4">STATUS</th>
                        <th className="py-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {requests.slice(0, 5).map((req) => (
                        <tr key={req.requestId} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-cyan-300">{req.requestId}</td>
                          <td className="py-3.5 pr-4 text-slate-200">{req.fullName}</td>
                          <td className="py-3.5 pr-4 text-slate-400">{req.category}</td>
                          <td className="py-3.5 pr-4">
                            <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold border ${getStatusBadge(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                setCurrentTab('requests');
                                openRequestDetail(req);
                              }}
                              className="rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition-colors"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}

                      {requests.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                            No incident requests recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REQUESTS MANAGER */}
          {currentTab === 'requests' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
                    <span className="text-amber-400">//</span>
                    <span>Incident Case Intake Manager</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                    Inspect, reassign statuses, and issue official encrypted responses.
                  </p>
                </div>

                {/* Symmetrical Search & Filter Row */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search ID, name, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Received">Received</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Responded">Responded</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button
                    onClick={handleSeedDemoCases}
                    className="h-9 px-3 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Generate 3 realistic sample cases for demonstration"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Seed Demo Cases</span>
                  </button>

                  <button
                    onClick={() => setShowPurgeDemoModal(true)}
                    className="h-9 px-3 rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Remove only demo cases"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span>Erase Demo Cases</span>
                  </button>

                  <button
                    onClick={() => setShowPurgeAllRequestsModal(true)}
                    className="h-9 px-3 rounded-lg border border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Erase all cases including demo records"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Erase All Cases</span>
                  </button>
                </div>
              </div>

              {/* Action Feedback Notice */}
              {actionNotice && (
                <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-3.5 text-xs font-mono text-cyan-200 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Requests Table */}
              <div className="rounded-2xl border border-slate-800 bg-neutral-900/50 p-5 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 pr-4">REFERENCE ID</th>
                        <th className="py-3 pr-4">COMPLAINANT</th>
                        <th className="py-3 pr-4">CONTACT</th>
                        <th className="py-3 pr-4">SUBJECT &amp; CATEGORY</th>
                        <th className="py-3 pr-4">PRIORITY</th>
                        <th className="py-3 pr-4">STATUS</th>
                        <th className="py-3 pr-4">DATE</th>
                        <th className="py-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {requests.map((req) => (
                        <tr key={req.requestId} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-cyan-300 whitespace-nowrap">
                            {req.requestId}
                          </td>
                          <td className="py-3.5 pr-4 text-white whitespace-nowrap font-semibold">
                            {req.fullName}
                          </td>
                          <td className="py-3.5 pr-4 text-slate-300 text-[11px]">
                            <div>{req.email}</div>
                            {req.phone && <div className="text-slate-500">{req.phone}</div>}
                          </td>
                          <td className="py-3.5 pr-4 max-w-xs truncate text-slate-300">
                            <div className="font-semibold text-white truncate">{req.subject}</div>
                            <div className="text-[10px] text-slate-400">{req.category}</div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${getUrgencyBadge(req.urgency)}`}>
                              {req.urgency}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-slate-400 text-[10px] whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openRequestDetail(req)}
                                className="px-3 py-1 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 text-[11px] font-bold transition-colors"
                              >
                                Review Case
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(req.requestId)}
                                className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 text-rose-400 hover:bg-rose-900/40 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {requests.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-slate-500 font-mono">
                            No incident records matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Individual Request Detail Modal */}
              {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
                  <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-neutral-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-left my-8 max-h-[90vh] flex flex-col">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                      <div>
                        <div className="text-xs font-mono text-cyan-400 uppercase">CASE DOSSIER:</div>
                        <h3 className="text-xl font-bold font-mono text-white">
                          {selectedRequest.requestId}
                        </h3>
                      </div>

                      {/* Status Transition Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">STATUS:</span>
                        <select
                          value={selectedRequest.status}
                          onChange={(e) => handleUpdateStatus(e.target.value as RequestStatus)}
                          className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Received">Received</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Responded">Responded</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-y-auto pr-1 flex-1 space-y-6 mt-4">
                      {/* Complainant Metadata (Symmetrical 3-Cols) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-500">COMPLAINANT:</span>
                          <div className="text-white font-bold text-sm mt-0.5">{selectedRequest.fullName}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">COMMUNICATION:</span>
                          <div className="text-cyan-300 mt-0.5">{selectedRequest.email}</div>
                          <div className="text-slate-400">{selectedRequest.phone || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">INCIDENT PROFILE:</span>
                          <div className="text-white mt-0.5">{selectedRequest.category}</div>
                          <div className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getUrgencyBadge(selectedRequest.urgency)}`}>
                            {selectedRequest.urgency}
                          </div>
                        </div>
                      </div>

                      {/* Subject & Detailed Message */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
                        <div className="text-xs font-mono text-cyan-400 uppercase font-bold">SUBJECT:</div>
                        <div className="text-base font-bold text-white mt-1">{selectedRequest.subject}</div>

                        <div className="text-xs font-mono text-cyan-400 uppercase font-bold mt-4">COMPLAINT NARRATIVE:</div>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {selectedRequest.message}
                        </p>
                      </div>

                      {/* Response Timeline History */}
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                        <div className="text-xs font-mono uppercase font-bold text-white mb-3 flex items-center justify-between">
                          <span>Case Communication Thread ({requestResponses.length})</span>
                          <span className="text-[10px] text-cyan-400">ENCRYPTED ARCHIVE</span>
                        </div>

                        <div className="space-y-3.5">
                          {requestResponses.map((r) => (
                            <div
                              key={r.responseId}
                              className={`rounded-xl p-4 text-xs border ${
                                r.senderRole === 'admin'
                                  ? 'border-cyan-500/40 bg-cyan-950/20 text-slate-200 shadow-sm'
                                  : 'border-slate-800 bg-neutral-950 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-mono text-[11px] pb-2 border-b border-slate-800">
                                <span className={r.senderRole === 'admin' ? 'font-bold text-cyan-300' : 'font-bold text-white'}>
                                  {r.senderName} [{r.senderRole.toUpperCase()}]
                                </span>
                                <span className="text-slate-400">{new Date(r.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="mt-2.5 text-xs leading-relaxed whitespace-pre-wrap text-slate-200">
                                {r.message}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Dispatch Response Form */}
                        <form onSubmit={handleSendResponse} className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                          <label className="block text-xs font-mono uppercase text-white font-bold">
                            Dispatch Official Response / Remediation Directive
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={adminResponseText}
                            onChange={(e) => setAdminResponseText(e.target.value)}
                            placeholder="Draft incident instructions, evidentiary requests, or resolution notice..."
                            className="w-full rounded-lg border border-slate-700 bg-neutral-950 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                          />

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-400">UPDATE STATUS TO:</span>
                              <select
                                value={newStatusSelect}
                                onChange={(e) => setNewStatusSelect(e.target.value as RequestStatus)}
                                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-white"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Responded">Responded</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>

                            <button
                              type="submit"
                              disabled={sendingResponse || !adminResponseText.trim()}
                              className="px-5 py-2.5 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold font-mono uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            >
                              {sendingResponse ? (
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5" />
                                  <span>Dispatch to User</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Delete Dialog */}
              {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                  <div className="rounded-2xl border border-rose-500/40 bg-neutral-950 p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_40px_rgba(244,63,94,0.25)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/40 mx-auto text-rose-400">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold uppercase font-mono text-white">
                      Confirm Case Erasure
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Permanently erase record <strong className="text-white">{deleteConfirmId}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-mono text-slate-300 hover:bg-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(deleteConfirmId)}
                        className="rounded-lg border border-rose-500/50 bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-mono font-bold text-white hover:brightness-110 shadow-md"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEBSITE CONTENT CMS */}
          {currentTab === 'content' && cmsContent && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
                  <span className="text-emerald-400">//</span>
                  <span>Website Content Management (CMS)</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  Modify live landing page copy, hero text, specialized services, and emergency hotline.
                </p>
              </div>

              {cmsSuccess && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-mono text-emerald-200 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Landing page content updated and synchronized in real-time!</span>
                </div>
              )}

              <form onSubmit={handleSaveCms} className="space-y-6">
                {/* Brand & Hero (Symmetrical 2-Column Inputs) */}
                <div className="rounded-2xl border border-cyan-500/20 bg-neutral-900/50 p-6 space-y-5">
                  <div className="font-mono text-xs font-bold uppercase text-cyan-400 pb-3 border-b border-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>Primary Hero Section Settings</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300">Portal Main Title</label>
                      <input
                        type="text"
                        value={cmsContent.siteTitle}
                        onChange={(e) => setCmsContent({ ...cmsContent, siteTitle: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300">CTA Button Text</label>
                      <input
                        type="text"
                        value={cmsContent.ctaText}
                        onChange={(e) => setCmsContent({ ...cmsContent, ctaText: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300">Hero Main Heading</label>
                    <input
                      type="text"
                      value={cmsContent.heroHeading}
                      onChange={(e) => setCmsContent({ ...cmsContent, heroHeading: e.target.value })}
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300">Hero Subheading Description</label>
                    <textarea
                      rows={3}
                      value={cmsContent.heroSubheading}
                      onChange={(e) => setCmsContent({ ...cmsContent, heroSubheading: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-neutral-950 p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* About Section */}
                <div className="rounded-2xl border border-amber-500/20 bg-neutral-900/50 p-6 space-y-4">
                  <div className="font-mono text-xs font-bold uppercase text-amber-400 pb-3 border-b border-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>Mandate &amp; Mission Narrative</span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300">About Mandate Copy</label>
                    <textarea
                      rows={4}
                      value={cmsContent.aboutText}
                      onChange={(e) => setCmsContent({ ...cmsContent, aboutText: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-neutral-950 p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Helpline & Contact (Symmetrical 2-Column Inputs) */}
                <div className="rounded-2xl border border-emerald-500/20 bg-neutral-900/50 p-6 space-y-5">
                  <div className="font-mono text-xs font-bold uppercase text-emerald-400 pb-3 border-b border-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Emergency Hotline &amp; Verification Keys</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300">Official Intake Email</label>
                      <input
                        type="email"
                        value={cmsContent.contactEmail}
                        onChange={(e) => setCmsContent({ ...cmsContent, contactEmail: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300">Hotline Phone</label>
                      <input
                        type="text"
                        value={cmsContent.contactPhone}
                        onChange={(e) => setCmsContent({ ...cmsContent, contactPhone: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300">Jurisdiction Address</label>
                      <input
                        type="text"
                        value={cmsContent.contactAddress}
                        onChange={(e) => setCmsContent({ ...cmsContent, contactAddress: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300">Administrative PGP Key</label>
                      <input
                        type="text"
                        value={cmsContent.pgpKeyFingerprint}
                        onChange={(e) => setCmsContent({ ...cmsContent, pgpKeyFingerprint: e.target.value })}
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300">Footer Disclaimer</label>
                    <input
                      type="text"
                      value={cmsContent.footerText}
                      onChange={(e) => setCmsContent({ ...cmsContent, footerText: e.target.value })}
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Services Configurator (Symmetrical 2-Column Cards) */}
                <div className="rounded-2xl border border-violet-500/20 bg-neutral-900/50 p-6 space-y-5">
                  <div className="font-mono text-xs font-bold uppercase text-violet-400 pb-3 border-b border-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    <span>Specialized Forensic Services ({cmsContent.services?.length || 0})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cmsContent.services?.map((svc, idx) => (
                      <div key={svc.id} className="rounded-xl border border-slate-800 bg-neutral-950 p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={svc.title}
                            onChange={(e) => {
                              const updated = [...cmsContent.services];
                              updated[idx].title = e.target.value;
                              setCmsContent({ ...cmsContent, services: updated });
                            }}
                            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-white flex-1 mr-2 focus:border-violet-400 focus:outline-none"
                          />
                          <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={svc.enabled}
                              onChange={(e) => {
                                const updated = [...cmsContent.services];
                                updated[idx].enabled = e.target.checked;
                                setCmsContent({ ...cmsContent, services: updated });
                              }}
                              className="accent-violet-500"
                            />
                            <span>Active</span>
                          </label>
                        </div>

                        <textarea
                          rows={2}
                          value={svc.description}
                          onChange={(e) => {
                            const updated = [...cmsContent.services];
                            updated[idx].description = e.target.value;
                            setCmsContent({ ...cmsContent, services: updated });
                          }}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-300 focus:border-violet-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCms}
                    className="h-12 px-8 rounded-xl border border-emerald-400/50 bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold font-mono uppercase tracking-wider text-white hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    {savingCms ? 'Publishing Updates...' : 'Publish Content Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3B: LANDING PAGE THEME & MEDIA STUDIO */}
          {currentTab === 'theme' && (
            <ThemeManagerTab
              token={token}
              cmsContent={cmsContent}
              onRefreshPublicContent={onRefreshPublicContent}
            />
          )}

          {/* TAB 3C: SYSTEM BACKUPS & RECOVERY HUB */}
          {currentTab === 'backups' && (
            <BackupsHubTab
              token={token}
              onRefreshAllData={loadStatsAndRequests}
            />
          )}

          {/* TAB 3D: COOKIE MANAGEMENT & CONSENT VAULT */}
          {currentTab === 'cookies' && (
            <CookieManagerTab
              token={token}
              onRefreshAllData={loadStatsAndRequests}
            />
          )}

          {/* TAB 4: SOCIAL MEDIA MANAGER */}
          {currentTab === 'social' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
                  <span className="text-violet-400">//</span>
                  <span>Social Media Links Manager</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  Manage public verified channels, social links, and broadcast links.
                </p>
              </div>

              {/* Add New Link Card (Symmetrical 3-Cols) */}
              <form onSubmit={handleAddSocialLink} className="rounded-2xl border border-violet-500/30 bg-neutral-900/50 p-6 space-y-4 shadow-xl">
                <div className="font-mono text-xs font-bold uppercase text-violet-300 pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-violet-400" />
                  <span>Register New Social Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300">Platform</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GitHub, X, LinkedIn"
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-violet-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300">Profile URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-violet-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300">Handle / Title</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={newHandle}
                      onChange={(e) => setNewHandle(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-violet-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-lg border border-violet-400/40 bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-xs font-mono font-bold text-white hover:brightness-110 shadow-md"
                >
                  Add Social Profile
                </button>
              </form>

              {/* Existing Links List */}
              <div className="rounded-2xl border border-slate-800 bg-neutral-900/40 p-6 space-y-3">
                <div className="font-mono text-xs font-bold uppercase text-white pb-3 border-b border-slate-800">
                  Configured Social Profiles ({socialLinks.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-neutral-950 p-4 text-xs font-mono shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{link.platform}</span>
                        <span className="text-violet-300 text-[11px]">{link.handle}</span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-cyan-300 flex items-center gap-1 mt-1 truncate max-w-[200px]"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSocialLink(link)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${
                            link.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                          }`}
                        >
                          {link.enabled ? 'ACTIVE' : 'MUTED'}
                        </button>
                        <button
                          onClick={() => handleDeleteSocialLink(link.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                          title="Delete link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & WAF */}
          {currentTab === 'security' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
                  <span className="text-rose-400">//</span>
                  <span>Server-Side WAF &amp; IP Quarantine</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  Inspect observed IP traffic, exploit attempts, and administer blacklisted IP ranges.
                </p>
              </div>

              {/* Manual IP Block Form (Rose Glow) */}
              <form onSubmit={handleBlockIp} className="rounded-2xl border border-rose-500/30 bg-neutral-900/50 p-6 space-y-4 shadow-[0_0_25px_rgba(244,63,94,0.1)]">
                <div className="font-mono text-xs font-bold uppercase text-rose-300 pb-3 border-b border-slate-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>Immediate IP Quarantine Rule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300">Target IP Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 198.51.100.42"
                      value={newBlockIp}
                      onChange={(e) => setNewBlockIp(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300">Security Incident Justification</label>
                    <input
                      type="text"
                      placeholder="e.g. Scanning for directory traversal patterns"
                      value={newBlockReason}
                      onChange={(e) => setNewBlockReason(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-lg border border-rose-500/40 bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs font-mono font-bold text-white hover:brightness-110 shadow-md"
                >
                  Apply IP Restriction
                </button>
              </form>

              {/* Blocked IP Table */}
              <div className="rounded-2xl border border-slate-800 bg-neutral-900/40 p-6 shadow-xl">
                <div className="font-mono text-xs font-bold uppercase text-white pb-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-rose-300">Blacklisted IP Addresses ({blockedIps.length})</span>
                  <span className="text-[10px] text-slate-500">ENFORCED AT GATEWAY</span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 pr-4">IP ADDRESS</th>
                        <th className="py-2.5 pr-4">JUSTIFICATION</th>
                        <th className="py-2.5 pr-4">BLOCKED AT</th>
                        <th className="py-2.5 pr-4">AUTHORITY</th>
                        <th className="py-2.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {blockedIps.map((b) => (
                        <tr key={b.ipAddress} className="hover:bg-slate-900/40">
                          <td className="py-3 pr-4 font-bold text-rose-300">{b.ipAddress}</td>
                          <td className="py-3 pr-4 text-slate-200">{b.reason}</td>
                          <td className="py-3 pr-4 text-slate-400 text-[11px]">{new Date(b.blockedAt).toLocaleString()}</td>
                          <td className="py-3 pr-4 text-slate-400">{b.blockedBy}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleUnblockIp(b.ipAddress)}
                              className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-emerald-300 hover:bg-emerald-900/60 text-[11px] font-bold transition-colors"
                            >
                              Unblock IP
                            </button>
                          </td>
                        </tr>
                      ))}
                      {blockedIps.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 font-mono">
                            No IP addresses actively quarantined.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Security Telemetry Table */}
              <div className="rounded-2xl border border-slate-800 bg-neutral-900/40 p-6 shadow-xl">
                <div className="font-mono text-xs font-bold uppercase text-white pb-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-cyan-300">WAF Real-Time Telemetry &amp; Signatures ({securityLogs.length})</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPurgeSecLogsModal(true)}
                      className="px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 text-[11px] font-mono font-bold flex items-center gap-1 transition-colors"
                      title="Erase all security telemetry logs"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Erase Logs</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 pr-4">TIME</th>
                        <th className="py-2.5 pr-4">OBSERVED IP</th>
                        <th className="py-2.5 pr-4">EVENT TYPE</th>
                        <th className="py-2.5 pr-4">ACTION</th>
                        <th className="py-2.5">DETAILS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {securityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40">
                          <td className="py-3 pr-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-3 pr-4 text-cyan-300 font-bold">{log.ipAddress}</td>
                          <td className="py-3 pr-4 text-white">{log.eventType}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.actionTaken === 'BLOCK' ? 'border-rose-500/40 bg-rose-950/40 text-rose-300' :
                              log.actionTaken === 'THROTTLE' ? 'border-amber-500/40 bg-amber-950/40 text-amber-300' :
                              'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                            }`}>
                              {log.actionTaken}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300 text-[11px] truncate max-w-xs">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {currentTab === 'audit' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
                  <span className="text-indigo-400">//</span>
                  <span>Administrative Action Audit Trail</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  Cryptographically signed audit records of operator logins, status changes, and CMS alterations.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-neutral-900/40 p-6 shadow-xl">
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="font-mono text-xs font-bold uppercase text-white">
                    Audit Ledger Records ({auditLogs.length})
                  </div>
                  <button
                    onClick={() => setShowPurgeAuditLogsModal(true)}
                    className="px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 text-[11px] font-mono font-bold flex items-center gap-1 transition-colors"
                    title="Erase all audit trail records"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Erase Audit Logs</span>
                  </button>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 pr-4">TIMESTAMP</th>
                        <th className="py-3 pr-4">ACTOR / OFFICER</th>
                        <th className="py-3 pr-4">ACTION</th>
                        <th className="py-3 pr-4">TARGET</th>
                        <th className="py-3 pr-4">STATUS</th>
                        <th className="py-3">IP ADDRESS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {auditLogs.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-900/40">
                          <td className="py-3.5 pr-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(a.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3.5 pr-4 font-bold text-indigo-300">{a.actor}</td>
                          <td className="py-3.5 pr-4 text-white font-semibold">{a.action}</td>
                          <td className="py-3.5 pr-4 text-slate-300">{a.target}</td>
                          <td className="py-3.5 pr-4">
                            <span className="rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-400 text-[11px]">{a.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & DATA MANAGEMENT */}
          {currentTab === 'settings' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
                  <span className="text-slate-400">//</span>
                  <span>Administrative Control &amp; Data Operations</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  Configure administrative credentials, manage case lifecycles, and purge logs or demo data.
                </p>
              </div>

              {actionNotice && (
                <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-4 text-xs font-mono text-cyan-200 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {passwordMsg && (
                <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-4 text-xs font-mono text-cyan-200 shadow-md">
                  {passwordMsg}
                </div>
              )}

              {/* Symmetrical Dual-Column Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Column 1: Password Credentials */}
                <div className="h-full flex flex-col justify-between rounded-2xl border border-cyan-500/20 bg-neutral-900/50 p-6 sm:p-7 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 pb-3 border-b border-slate-800">
                      <Lock className="h-4 w-4" />
                      <span>Administrative Vault Credentials</span>
                    </div>

                    <p className="mt-3 text-xs text-slate-400 leading-relaxed font-mono">
                      Update your master administrative password. Passwords are protected using PBKDF2 with 100,000 SHA-512 iterations and cryptographic salt.
                    </p>

                    <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300">Current Administrative Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                          placeholder="Current passphrase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300">New Administrative Password (min 8 chars)</label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-neutral-950 px-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                          placeholder="New secure passphrase"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="h-10 w-full rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-mono font-bold uppercase text-white hover:brightness-110 shadow-lg transition-all"
                        >
                          Update Passphrase
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>SECURITY STATUS: ACTIVE</span>
                    <span>ALGORITHM: PBKDF2-HMAC-SHA512</span>
                  </div>
                </div>

                {/* Column 2: Data, Logs & Cases Erasure Center */}
                <div className="h-full flex flex-col justify-between rounded-2xl border border-rose-500/20 bg-neutral-900/50 p-6 sm:p-7 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-rose-400 pb-3 border-b border-slate-800">
                      <Trash2 className="h-4 w-4" />
                      <span>Data, Cases &amp; Logs Erasure Operations</span>
                    </div>

                    <p className="mt-3 text-xs text-slate-400 leading-relaxed font-mono">
                      Execute granular or full erasures of portal cases, demo records, security logs, or the audit trail.
                    </p>

                    <div className="mt-5 space-y-3 font-mono">
                      {/* Seed Demo Cases */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                        <div>
                          <div className="text-xs font-bold text-cyan-300">Seed Realistic Demo Cases</div>
                          <div className="text-[11px] text-cyan-400/70">Injects 3 sample cyber incident cases</div>
                        </div>
                        <button
                          onClick={handleSeedDemoCases}
                          className="px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-900/40 text-cyan-200 hover:bg-cyan-800 text-xs font-bold transition-colors"
                        >
                          Seed Cases
                        </button>
                      </div>

                      {/* Erase Demo Cases */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-950/20">
                        <div>
                          <div className="text-xs font-bold text-amber-300">Erase Demo Cases Only</div>
                          <div className="text-[11px] text-amber-400/70">Purges only sample/test filings</div>
                        </div>
                        <button
                          onClick={() => setShowPurgeDemoModal(true)}
                          className="px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-900/40 text-amber-200 hover:bg-amber-800 text-xs font-bold transition-colors"
                        >
                          Erase Demo
                        </button>
                      </div>

                      {/* Erase All Cases */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/30 bg-rose-950/20">
                        <div>
                          <div className="text-xs font-bold text-rose-300">Erase All Cases ({stats?.total || 0})</div>
                          <div className="text-[11px] text-rose-400/70">Purges all case complaints &amp; replies</div>
                        </div>
                        <button
                          onClick={() => setShowPurgeAllRequestsModal(true)}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/50 bg-rose-900/40 text-rose-200 hover:bg-rose-800 text-xs font-bold transition-colors"
                        >
                          Erase All
                        </button>
                      </div>

                      {/* Erase Security & WAF Logs */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                        <div>
                          <div className="text-xs font-bold text-slate-200">Erase Security &amp; WAF Logs ({securityLogs.length})</div>
                          <div className="text-[11px] text-slate-400">Clears IP mitigation &amp; WAF telemetry</div>
                        </div>
                        <button
                          onClick={() => setShowPurgeSecLogsModal(true)}
                          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-colors"
                        >
                          Erase WAF Logs
                        </button>
                      </div>

                      {/* Erase Audit Trail */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                        <div>
                          <div className="text-xs font-bold text-slate-200">Erase Audit Trail Ledger ({auditLogs.length})</div>
                          <div className="text-[11px] text-slate-400">Clears administrative action logs</div>
                        </div>
                        <button
                          onClick={() => setShowPurgeAuditLogsModal(true)}
                          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-colors"
                        >
                          Erase Audit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Master System Reset Button */}
                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setShowMasterResetModal(true)}
                      className="w-full h-10 rounded-lg border border-rose-500/60 bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Master Reset (Purge Everything)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Purge All Requests Modal */}
      {showPurgeAllRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="rounded-2xl border border-rose-500/40 bg-neutral-950 p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/40 mx-auto text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold uppercase font-mono text-white">
              Purge All Cases &amp; Replies
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Permanently erase all {requests.length} incident filings and response histories? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPurgeAllRequestsModal(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-mono text-slate-300 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAllRequests}
                className="rounded-lg border border-rose-500/50 bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-mono font-bold text-white hover:brightness-110 shadow-md"
              >
                Confirm Erase All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Demo Cases Modal */}
      {showPurgeDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="rounded-2xl border border-amber-500/40 bg-neutral-950 p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/40 mx-auto text-amber-400">
              <Filter className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold uppercase font-mono text-white">
              Erase Demo Cases
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Remove all generated demonstration and sample cases from the portal queue?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPurgeDemoModal(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-mono text-slate-300 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleClearDemoCases}
                className="rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-xs font-mono font-bold text-white hover:brightness-110 shadow-md"
              >
                Confirm Erase Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Security Logs Modal */}
      {showPurgeSecLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="rounded-2xl border border-rose-500/40 bg-neutral-950 p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/40 mx-auto text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold uppercase font-mono text-white">
              Erase All Security Logs
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Are you sure you want to clear all {securityLogs.length} recorded WAF signatures, IP rate limits, and telemetry events?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPurgeSecLogsModal(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-mono text-slate-300 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeSecLogs}
                className="rounded-lg border border-rose-500/50 bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-mono font-bold text-white hover:brightness-110 shadow-md"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Audit Logs Modal */}
      {showPurgeAuditLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="rounded-2xl border border-rose-500/40 bg-neutral-950 p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/40 mx-auto text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold uppercase font-mono text-white">
              Erase All Audit Records
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Are you sure you want to erase all {auditLogs.length} administrative audit ledger entries?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPurgeAuditLogsModal(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-mono text-slate-300 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAuditLogs}
                className="rounded-lg border border-rose-500/50 bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-mono font-bold text-white hover:brightness-110 shadow-md"
              >
                Confirm Erase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master System Reset Modal */}
      {showMasterResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <div className="rounded-2xl border-2 border-red-500 bg-neutral-950 p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-[0_0_60px_rgba(239,68,68,0.4)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/50 bg-red-950/50 mx-auto text-red-400">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
            <h4 className="text-lg font-black uppercase font-mono text-white">
              MASTER SYSTEM RESET
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              DANGER: This will permanently erase ALL cases, ALL responses, ALL security telemetry logs, and ALL audit ledger records, resetting the portal to a blank pristine slate.
            </p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setShowMasterResetModal(false)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-xs font-mono text-slate-300 hover:bg-slate-900"
              >
                Abort
              </button>
              <button
                onClick={handleMasterReset}
                className="rounded-lg border border-red-500 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 py-2.5 text-xs font-mono font-bold text-white hover:brightness-110 shadow-lg"
              >
                Execute Master Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
