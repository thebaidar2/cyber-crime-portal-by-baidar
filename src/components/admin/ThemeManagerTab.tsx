import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Sliders, 
  Play, 
  ShieldCheck, 
  AlertCircle, 
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { WebsiteContent, LandingTheme } from '../../types';

interface ThemeManagerTabProps {
  token: string;
  cmsContent: WebsiteContent | null;
  onRefreshPublicContent: () => void;
}

export const ThemeManagerTab: React.FC<ThemeManagerTabProps> = ({
  token,
  cmsContent,
  onRefreshPublicContent
}) => {
  const currentTheme = cmsContent?.theme || {
    type: 'default',
    mediaUrl: '',
    mediaName: 'Default Dark Cyber',
    overlayOpacity: 0.7,
    blurAmount: 0,
    loop: true,
    muted: true
  };

  const [themeType, setThemeType] = useState<'default' | 'image' | 'video'>(currentTheme.type || 'default');
  const [mediaUrl, setMediaUrl] = useState(currentTheme.mediaUrl || '');
  const [mediaName, setMediaName] = useState(currentTheme.mediaName || 'Default Theme');
  const [overlayOpacity, setOverlayOpacity] = useState(currentTheme.overlayOpacity ?? 0.7);
  const [blurAmount, setBlurAmount] = useState(currentTheme.blurAmount ?? 0);
  const [loop, setLoop] = useState(currentTheme.loop !== false);
  const [muted, setMuted] = useState(currentTheme.muted !== false);
  
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Handle local storage file upload (Picture or Video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setStatusMsg({
        text: 'Unsupported file format. Please select an image (PNG, JPG, WebP) or video (MP4, WebM).',
        type: 'error'
      });
      return;
    }

    // Check size limit: 40MB
    if (file.size > 40 * 1024 * 1024) {
      setStatusMsg({
        text: 'File size exceeds 40MB limit. Please choose a smaller optimized media file.',
        type: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setMediaUrl(result);
      setThemeType(isVideo ? 'video' : 'image');
      setMediaName(file.name);
      setStatusMsg({
        text: `Loaded ${isVideo ? 'video' : 'image'} "${file.name}" from local storage. Preview ready below.`,
        type: 'success'
      });
    };
    reader.onerror = () => {
      setStatusMsg({ text: 'Failed to read media from local storage.', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const themePayload: LandingTheme = {
        type: themeType,
        mediaUrl: themeType === 'default' ? '' : mediaUrl,
        mediaName,
        overlayOpacity,
        blurAmount,
        loop,
        muted,
        updatedAt: new Date().toISOString()
      };

      await api.updateLandingTheme(token, themePayload);
      setStatusMsg({
        text: 'Theme successfully saved and published to the live landing page!',
        type: 'success'
      });
      onRefreshPublicContent();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to save theme.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset landing page theme to default dark cybersecurity grid?')) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      await api.resetLandingTheme(token);
      setThemeType('default');
      setMediaUrl('');
      setMediaName('Default Dark Cyber');
      setOverlayOpacity(0.7);
      setBlurAmount(0);
      setStatusMsg({
        text: 'Theme reset to default minimalist cybersecurity interface.',
        type: 'success'
      });
      onRefreshPublicContent();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to reset theme.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Presets
  const applyPreset = (preset: { name: string; type: 'image' | 'video'; url: string; opacity: number }) => {
    setThemeType(preset.type);
    setMediaUrl(preset.url);
    setMediaName(preset.name);
    setOverlayOpacity(preset.opacity);
    setStatusMsg({ text: `Applied preset "${preset.name}". Click 'Publish Theme' to save.`, type: 'success' });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fuchsia-500/20 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase font-mono text-white flex items-center gap-2.5">
            <Palette className="h-6 w-6 text-fuchsia-400" />
            <span>Landing Page Theme &amp; Media Studio</span>
          </h2>
          <p className="text-xs font-mono text-fuchsia-300/80 mt-1">
            Upload custom background images or looping videos directly from your local storage to customize the portal aesthetic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-xs font-mono text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Default</span>
          </button>
          <button
            onClick={handleSaveTheme}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-fuchsia-500/50 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.35)] hover:from-fuchsia-500 hover:to-pink-500 transition-all"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Publish Theme to Website</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
          statusMsg.type === 'success'
            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
            : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
        }`}>
          {statusMsg.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Symmetrical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Local Storage Upload & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Upload from Local Storage Card */}
          <div className="rounded-2xl border border-fuchsia-500/30 bg-neutral-900/60 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload Media from Local Storage</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Pictures (PNG, JPG) or Videos (MP4, WebM)
              </span>
            </div>

            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-fuchsia-500/40 hover:border-fuchsia-400 rounded-xl p-8 cursor-pointer bg-neutral-950/60 transition-all group hover:bg-neutral-950">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/30 text-fuchsia-400 group-hover:scale-105 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-white">Click to browse your local storage</p>
                <p className="text-xs font-mono text-neutral-400 mt-1">Select an Image or Video file (Max 40MB)</p>
              </div>
              {mediaName && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/30 px-3 py-1 text-xs font-mono text-fuchsia-200">
                  {themeType === 'video' ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  <span>Selected: {mediaName}</span>
                </div>
              )}
            </label>

            {/* Quick Cyber Presets */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">
                Or Choose Curated Cyber Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset({
                    name: 'Cyber Sentinel Mesh',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80',
                    opacity: 0.75
                  })}
                  className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-left hover:border-cyan-500/40 transition-colors"
                >
                  <div className="text-xs font-bold text-white">Matrix Matrix</div>
                  <div className="text-[10px] font-mono text-cyan-400">Green Data Stream</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset({
                    name: 'SOC Command Grid',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80',
                    opacity: 0.7
                  })}
                  className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-left hover:border-indigo-500/40 transition-colors"
                >
                  <div className="text-xs font-bold text-white">Cyber Command</div>
                  <div className="text-[10px] font-mono text-indigo-400">Defense HUD</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset({
                    name: 'Deep Forensics Network',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80',
                    opacity: 0.72
                  })}
                  className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-left hover:border-violet-500/40 transition-colors"
                >
                  <div className="text-xs font-bold text-white">Network Core</div>
                  <div className="text-[10px] font-mono text-violet-400">Fiber Optics</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeType('default');
                    setMediaUrl('');
                    setMediaName('Default Minimalist Dark');
                    setOverlayOpacity(0.7);
                  }}
                  className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-left hover:border-neutral-500 transition-colors"
                >
                  <div className="text-xs font-bold text-white">Default Dark</div>
                  <div className="text-[10px] font-mono text-neutral-400">Zero Distraction</div>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Visual Calibration Sliders */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Display Calibration &amp; Readability Settings</span>
            </span>

            <div className="space-y-4">
              {/* Overlay Opacity Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Dark Contrast Overlay (Ensures text is 100% readable)</span>
                  <span className="text-fuchsia-300 font-bold">{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.95"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-fuchsia-500 cursor-pointer"
                />
              </div>

              {/* Blur Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Backdrop Blur Softening</span>
                  <span className="text-cyan-300 font-bold">{blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="1"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Video Toggles */}
              {themeType === 'video' && (
                <div className="pt-3 border-t border-neutral-800 flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-mono text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      className="accent-fuchsia-500"
                    />
                    <span>Continuous Video Loop</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-mono text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={muted}
                      onChange={(e) => setMuted(e.target.checked)}
                      className="accent-fuchsia-500"
                    />
                    <span>Muted Audio (Required for Autoplay)</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>Real-Time Website Simulation Preview</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
              {themeType.toUpperCase()} MODE
            </span>
          </div>

          {/* Device Mockup Preview Window */}
          <div className="relative rounded-2xl border border-neutral-700 bg-black overflow-hidden shadow-2xl h-[440px] flex flex-col">
            {/* Mock Browser Header */}
            <div className="h-8 bg-neutral-900 border-b border-neutral-800 flex items-center px-3 gap-1.5 shrink-0 z-20">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <div className="ml-2 flex-1 max-w-[200px] h-4 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400 px-2 flex items-center">
                cyberportal-baidar.org
              </div>
            </div>

            {/* Media Background Canvas */}
            <div className="absolute inset-0 top-8 z-0 overflow-hidden">
              {themeType === 'video' && mediaUrl ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop={loop}
                  muted={muted}
                  playsInline
                  style={{ filter: `blur(${blurAmount}px)` }}
                  className="w-full h-full object-cover"
                />
              ) : themeType === 'image' && mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt="Theme Preview"
                  style={{ filter: `blur(${blurAmount}px)` }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
                  <div className="w-full h-full bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                </div>
              )}

              {/* Dynamic Overlay */}
              <div
                className="absolute inset-0 bg-neutral-950 transition-opacity"
                style={{ opacity: overlayOpacity }}
              />
            </div>

            {/* Foreground Live Portal Content Overlay */}
            <div className="relative z-10 p-6 flex flex-col justify-center items-center text-center h-full">
              <span className="text-[10px] font-mono tracking-widest text-neutral-300 uppercase px-2.5 py-1 rounded border border-neutral-700 bg-neutral-900/80 backdrop-blur-sm">
                OFFICIAL INCIDENT GATEWAY
              </span>
              <h3 className="mt-3 text-lg font-black uppercase text-white tracking-tight drop-shadow-md">
                CYBER CRIME PORTAL BY BAIDAR
              </h3>
              <p className="mt-2 text-xs text-neutral-300 max-w-xs drop-shadow leading-relaxed">
                Confidential zero-trust digital forensics and cyber threat intake platform.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-white text-neutral-950 text-[11px] font-bold">
                  Submit Incident
                </div>
                <div className="px-3 py-1.5 rounded-lg border border-neutral-600 bg-neutral-900/80 text-white text-[11px]">
                  Track Status
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 text-xs text-neutral-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-fuchsia-400 shrink-0 mt-0.5" />
            <span>
              Themes are applied securely across the public landing page with zero disruption to core triage services.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
