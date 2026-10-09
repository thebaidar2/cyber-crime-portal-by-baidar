import React from 'react';
import { Send, CheckCircle2, Search, MessageSquareCode, ShieldCheck } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      icon: Send,
      title: "Submit Incident",
      desc: "Complete the confidential intake form. A unique Request Reference ID and private 64-character Access Secret are generated."
    },
    {
      number: "02",
      icon: CheckCircle2,
      title: "Case Queued",
      desc: "The system runs anti-abuse inspection, encrypts evidence artifacts, and securely routes the filing for triage."
    },
    {
      number: "03",
      icon: Search,
      title: "Forensic Review",
      desc: "An incident officer reviews attack vectors, technical logs, financial transactions, and extortion threats."
    },
    {
      number: "04",
      icon: MessageSquareCode,
      title: "Officer Responds",
      desc: "An official analysis report, containment strategy, and legal advisories are issued directly into your private case thread."
    },
    {
      number: "05",
      icon: ShieldCheck,
      title: "Private Tracking",
      desc: "Authenticate using your Reference ID and Access Secret anytime to review answers or submit supplementary evidence."
    }
  ];

  return (
    <section id="how-it-works" className="border-b border-neutral-800 bg-neutral-900/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-mono text-neutral-400">
            <span>INTAKE &amp; RESPONSE PROTOCOL</span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Operational 5-Stage Protocol
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            A transparent, auditable process engineered for maximum privacy and rapid incident containment.
          </p>
        </div>

        {/* Symmetrical Process Flow Container */}
        <div className="relative">
          {/* Symmetrical 5-Step Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm hover:border-neutral-700 transition-colors h-full"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                      <span className="font-mono text-xs font-bold text-neutral-400 tracking-wider">
                        STEP {step.number}
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-200">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-white uppercase tracking-wide">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase">
                    <span>STAGE {idx + 1} OF 5</span>
                    <span className="text-neutral-400">ENCRYPTED</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
