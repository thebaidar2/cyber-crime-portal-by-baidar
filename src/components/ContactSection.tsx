import React, { useState } from 'react';
import { Mail, Phone, MapPin, KeyRound, Copy, Check } from 'lucide-react';
import { WebsiteContent } from '../types';

interface ContactSectionProps {
  content: WebsiteContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content }) => {
  const [copiedPgp, setCopiedPgp] = useState(false);

  const copyPgp = () => {
    if (!content.pgpKeyFingerprint) return;
    navigator.clipboard.writeText(content.pgpKeyFingerprint);
    setCopiedPgp(true);
    setTimeout(() => setCopiedPgp(false), 2000);
  };

  return (
    <section id="contact" className="border-b border-neutral-800 bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-mono text-neutral-400">
            <span>OFFICIAL EMERGENCY CONTACT</span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Emergency Helpline &amp; Direct Intake
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            Reach out via verified communication channels. Submissions can also be encrypted using our administrative PGP fingerprint.
          </p>
        </div>

        {/* Symmetrical 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Email */}
          <div className="h-full flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950 text-white">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Official Intake Email
              </h3>
              <p className="mt-2 text-sm sm:text-base font-mono font-semibold text-white break-all">
                {content.contactEmail}
              </p>
            </div>
            <p className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-500 font-mono">
              ACTIVE 24/7 ENCRYPTED QUEUE
            </p>
          </div>

          {/* Card 2: Phone */}
          <div className="h-full flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950 text-white">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Hotline &amp; Rapid Response
              </h3>
              <p className="mt-2 text-sm sm:text-base font-mono font-semibold text-white">
                {content.contactPhone}
              </p>
            </div>
            <p className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-500 font-mono">
              FOR ONGOING CRITICAL BREACHES
            </p>
          </div>

          {/* Card 3: Jurisdiction */}
          <div className="h-full flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950 text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Forensics Jurisdiction
              </h3>
              <p className="mt-2 text-sm sm:text-base font-semibold text-white">
                {content.contactAddress}
              </p>
            </div>
            <p className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-500 font-mono">
              GLOBAL TRIAGE DESK
            </p>
          </div>
        </div>

        {/* PGP Fingerprint Card (Balanced & Centered) */}
        {content.pgpKeyFingerprint && (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <KeyRound className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                  Administrative PGP Master Fingerprint
                </span>
                <p className="mt-1 font-mono text-xs sm:text-sm text-neutral-400 break-all">
                  {content.pgpKeyFingerprint}
                </p>
              </div>
            </div>

            <button
              onClick={copyPgp}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-mono font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors shrink-0"
            >
              {copiedPgp ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedPgp ? 'COPIED' : 'COPY KEY'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
