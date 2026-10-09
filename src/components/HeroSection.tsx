import React from 'react';
import { ShieldAlert, ArrowRight, Search, FileCheck2, Lock, Terminal } from 'lucide-react';
import { WebsiteContent } from '../types';

interface HeroSectionProps {
  content: WebsiteContent;
  onOpenSubmit: () => void;
  onOpenTrack: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  onOpenSubmit,
  onOpenTrack
}) => {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 py-20 sm:py-28">
      {/* Background Subtle Grid Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Security Badge (Symmetrical Centered Pill) */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-800 bg-neutral-900/90 px-4 py-1.5 text-xs font-mono text-neutral-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-neutral-300 animate-pulse" />
            <span>CONFIDENTIAL FORENSIC INTAKE PLATFORM</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">ACTIVE 24/7</span>
          </div>

          {/* Main Title (Balanced Leading and Proportions) */}
          <h1 className="mt-7 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight sm:leading-tight">
            {content.heroHeading || 'CYBER CRIME PORTAL BY BAIDAR'}
          </h1>

          {/* Subheading (Carefully measured line-height & width) */}
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-neutral-400 max-w-2xl mx-auto">
            {content.heroSubheading}
          </p>

          {/* Primary Action Buttons (Identical Heights & Symmetrical Spacing) */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenSubmit}
              className="w-full sm:w-64 h-12 inline-flex items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-100 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 shadow-lg"
            >
              <span>{content.ctaText || 'Submit Incident Request'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenTrack}
              className="w-full sm:w-64 h-12 inline-flex items-center justify-center gap-2.5 rounded-lg border border-neutral-700 bg-neutral-900 px-6 text-xs sm:text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-500 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 shadow-lg"
            >
              <Search className="h-4 w-4 text-neutral-400" />
              <span>Track Existing Case</span>
            </button>
          </div>
        </div>

        {/* 4 Security Architecture Cards (Strict 4-Column Symmetry) */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          <div className="h-full flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm hover:border-neutral-700 transition-colors">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200">
                <Lock className="h-4 w-4 text-neutral-300" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-neutral-100">Zero-Trust Isolation</h3>
              <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                Cryptographic 64-character tokens shield every filing against unauthorized discovery.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 font-mono text-[10px] text-neutral-500 uppercase">
              SPEC: RFC 7519
            </div>
          </div>

          <div className="h-full flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm hover:border-neutral-700 transition-colors">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200">
                <FileCheck2 className="h-4 w-4 text-neutral-300" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-neutral-100">Chain of Custody</h3>
              <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                Evidentiary metadata and tamper-evident timestamps suitable for legal escalation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 font-mono text-[10px] text-neutral-500 uppercase">
              SPEC: ISO 27037
            </div>
          </div>

          <div className="h-full flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm hover:border-neutral-700 transition-colors">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200">
                <ShieldAlert className="h-4 w-4 text-neutral-300" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-neutral-100">Emergency Triage</h3>
              <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                Critical breaches and ongoing extortion receive prioritized incident officer response.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 font-mono text-[10px] text-neutral-500 uppercase">
              SLA: &lt; 2 HOURS
            </div>
          </div>

          <div className="h-full flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm hover:border-neutral-700 transition-colors">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200">
                <Terminal className="h-4 w-4 text-neutral-300" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-neutral-100">Server-Side WAF</h3>
              <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                Dynamic signature filtering and IP mitigation defending the intake gateway.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800/80 font-mono text-[10px] text-neutral-500 uppercase">
              POLICY: ACTIVE FILTER
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
