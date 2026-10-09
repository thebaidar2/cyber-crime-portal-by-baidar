import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { SocialLink } from '../types';

interface SocialLinksSectionProps {
  socialLinks: SocialLink[];
}

export const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({ socialLinks }) => {
  const activeLinks = (socialLinks || []).filter(l => l.enabled);

  if (activeLinks.length === 0) return null;

  return (
    <section className="border-b border-neutral-800 bg-neutral-900/20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400">
              OFFICIAL VERIFIED BROADCAST & SOCIAL CHANNELS
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Verify cybersecurity alerts, advisories, and public notifications from Baidar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white transition-all group"
              >
                <Globe className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                <span>{link.platform}</span>
                <span className="font-mono text-[11px] text-neutral-500">({link.handle})</span>
                <ExternalLink className="h-3 w-3 text-neutral-500 group-hover:text-neutral-300" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
