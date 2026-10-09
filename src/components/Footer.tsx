import React from 'react';
import { Shield } from 'lucide-react';
import { WebsiteContent } from '../types';

interface FooterProps {
  content: WebsiteContent;
  onOpenTrack: () => void;
  onOpenCookieSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ content, onOpenTrack, onOpenCookieSettings }) => {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-16 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Brand Info (Symmetrical 6-cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-wider uppercase font-mono">
                {content.siteTitle || 'CYBER CRIME PORTAL BY BAIDAR'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
              {content.footerText || 'Confidential cyber threat intake, incident triage, and digital forensics portal. All transactions and submissions protected under zero-trust authorization protocols.'}
            </p>
          </div>

          {/* Quick Links (Symmetrical 3-cols) */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <div className="font-mono uppercase font-bold text-neutral-200 tracking-wider">
              Navigation
            </div>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#about" className="hover:text-white transition-colors">About Mandate</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Forensic Services</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Incident Protocol</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Emergency Helpline</a></li>
            </ul>
          </div>

          {/* Incident Portal Actions (Symmetrical 3-cols) */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <div className="font-mono uppercase font-bold text-neutral-200 tracking-wider">
              Case Operations
            </div>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={onOpenTrack} className="hover:text-white transition-colors text-left">
                  Private Case Lookup
                </button>
              </li>
              <li>
                <a href="#submit-request" className="hover:text-white transition-colors">
                  Submit New Incident
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  PGP Key Verification
                </a>
              </li>
              {onOpenCookieSettings && (
                <li>
                  <button
                    onClick={onOpenCookieSettings}
                    className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>Manage Cookies &amp; Privacy</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer Strip (Fully Hidden Admin - No Lock Icon) */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>CONFIDENTIALITY LEVEL: ZERO-TRUST RESTRICTED | FORENSIC INTAKE DESK</span>
            {onOpenCookieSettings && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenCookieSettings}
                  className="hover:text-neutral-300 underline underline-offset-2 transition-colors"
                >
                  Cookie Policy &amp; Permissions
                </button>
              </>
            )}
          </div>

          <div 
            className="select-none tracking-widest text-[11px] text-neutral-600"
          >
            STATION ID: CCPB-SEC-01
          </div>
        </div>
      </div>
    </footer>
  );
};
