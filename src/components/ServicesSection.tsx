import React from 'react';
import { Clock, Award, ArrowRight } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService: (categoryTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService
}) => {
  const activeServices = (services || []).filter(s => s.enabled);

  return (
    <section id="services" className="border-b border-neutral-800 bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-mono text-neutral-400">
            <span>SPECIALIZED CAPABILITIES</span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Forensic Consultation &amp; Incident Triage
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            Select a specialized incident domain to request confidential triage, forensics, or defense strategy.
          </p>
        </div>

        {/* Symmetrical 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {activeServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-7 transition-all hover:border-neutral-700 hover:bg-neutral-900 shadow-md h-full"
            >
              <div>
                {/* Badges Row (Symmetrical Header) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-[11px] font-mono font-semibold text-neutral-200">
                    {service.categoryTag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.slaTime}</span>
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="mt-5 text-base sm:text-lg font-bold text-white leading-snug">
                  {service.title}
                </h3>

                {/* Service Description */}
                <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Symmetrical Card Footer */}
              <div className="mt-8 pt-5 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                  <Award className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{service.protocolBadge}</span>
                </div>

                <button
                  onClick={() => onSelectService(service.title)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:border-neutral-500 hover:text-white transition-colors"
                >
                  <span>Select</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
