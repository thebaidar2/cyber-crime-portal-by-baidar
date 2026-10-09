import React from 'react';
import { EyeOff, Scale, ShieldCheck, Check, FileCheck, Lock } from 'lucide-react';
import { WebsiteContent } from '../types';

interface AboutSectionProps {
  content: WebsiteContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  return (
    <section id="about" className="border-b border-neutral-800 bg-neutral-900/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-mono text-neutral-400">
            <span>MANDATE &amp; OPERATIONAL DOCTRINE</span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Confidential Cybersecurity Intake &amp; Investigation
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            Engineered to bridge victims of digital crimes with accredited forensic analysis and law enforcement triage.
          </p>
        </div>

        {/* Symmetrical Dual-Column Grid (6-cols / 6-cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Mission Description & Executive Summary */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400 pb-3 border-b border-neutral-800">
                <ShieldCheck className="h-4 w-4 text-neutral-300" />
                <span>EXECUTIVE SUMMARY</span>
              </div>
              
              <div className="mt-5 space-y-4 text-xs sm:text-sm leading-relaxed text-neutral-300">
                <p>{content.aboutText}</p>
                <p>
                  Whether handling unauthorized banking intrusions, corporate email compromise (BEC), ransomware extortion, or digital blackmail, our protocol preserves evidence integrity while isolating user identity from unauthorized scrutiny.
                </p>
                <p className="text-neutral-400 text-xs">
                  Every intake proceeding is handled under strict zero-knowledge confidentiality safeguards, ensuring victims receive structured legal and technical support without compromising sensitive operational intelligence.
                </p>
              </div>
            </div>

            {/* Confidentiality Guarantee */}
            <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs text-neutral-400 flex items-start gap-3">
              <Check className="h-4 w-4 text-neutral-300 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Confidentiality Guarantee:</strong> All filings submitted through this portal undergo immediate transport encryption and zero-knowledge storage.
              </span>
            </div>
          </div>

          {/* Right Column: Operational Pillars & Standards */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 uppercase font-semibold">
                  <FileCheck className="h-4 w-4 text-neutral-400" />
                  <span>CORE INVESTIGATION &amp; TRIAGE PILLARS</span>
                </div>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-200 border border-neutral-700">
                  STANDARD OPERATING PROTOCOL
                </span>
              </div>

              {/* Four Core Forensic Pillars Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
                    <EyeOff className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>Strict Data Isolation</span>
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-400 leading-normal">
                    Incident records are cryptographically partitioned. Cross-user access is completely prevented.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
                    <Scale className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>Legal Admissibility</span>
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-400 leading-normal">
                    Cryptographic hashing and structured timelines ready for formal police filing and court proceedings.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
                    <Lock className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>Victim Shielding</span>
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-400 leading-normal">
                    Zero public exposure. Protected triage channels isolate requester identity from public inspection.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
                    <ShieldCheck className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>Chain of Custody</span>
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-400 leading-normal">
                    Cryptographic timestamping preserves evidence authenticity adhering to RFC 3227 standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
              <span className="text-neutral-500">Intake Framework Alignment:</span>
              <span className="text-neutral-200 font-bold">NIST CSF &amp; ISO 27035</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
