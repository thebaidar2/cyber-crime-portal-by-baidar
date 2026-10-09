import React, { useState } from 'react';
import { Send, AlertCircle, Shield, Info } from 'lucide-react';
import { api, SubmitResponse } from '../services/api';
import { IncidentCategory, UrgencyLevel } from '../types';

interface RequestFormSectionProps {
  initialCategory?: string;
  onSuccess: (data: SubmitResponse) => void;
  userId?: string;
}

const CATEGORIES: IncidentCategory[] = [
  'Financial Fraud & Phishing',
  'Identity Theft & Impersonation',
  'Unauthorized Access & Account Takeover',
  'Ransomware & Malware Extortion',
  'Cyber Harassment & Blackmail',
  'Data Leak & Corporate Espionage',
  'Other Cybersecurity Inquiry'
];

export const RequestFormSection: React.FC<RequestFormSectionProps> = ({
  initialCategory,
  onSuccess,
  userId
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<IncidentCategory>(
    (initialCategory as IncidentCategory) || 'Other Cybersecurity Inquiry'
  );
  const [urgency, setUrgency] = useState<UrgencyLevel>('Standard');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide a valid full name (at least 2 characters).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 6) {
      setError('Please provide a valid contact phone number.');
      return;
    }

    if (!subject.trim() || subject.trim().length < 3) {
      setError('Please provide a descriptive subject (at least 3 characters).');
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setError('Please provide a detailed incident message (at least 10 characters).');
      return;
    }

    setLoading(true);

    try {
      const response = await api.submitRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category,
        urgency,
        subject: subject.trim(),
        message: message.trim(),
        userId: userId || 'guest-submitted',
        honeypot
      });

      // Clear Form
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');

      onSuccess(response);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="submit-request" className="border-b border-neutral-800 bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-mono text-neutral-400">
            <Shield className="h-3.5 w-3.5 text-neutral-400" />
            <span>CONFIDENTIAL INCIDENT INTAKE</span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Submit a Help / Consultation Request
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Provide the technical details of the security incident. All submissions are encrypted in transit and protected by strict zero-trust user data isolation.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 rounded-xl border border-neutral-700 bg-neutral-900/90 p-4 text-neutral-200 shadow-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-neutral-300 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-white">Validation Notice:</span> {error}
              </div>
            </div>
          </div>
        )}

        {/* Symmetrical Form Container */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Honeypot hidden input */}
          <input
            type="text"
            name="security_token_hp"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Row 1: Full Name & Email (50% / 50% Symmetrical Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Full Name <span className="text-neutral-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alexander Vance"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Email Address <span className="text-neutral-500">*</span>
              </label>
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. secure.contact@domain.com"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
          </div>

          {/* Row 2: Contact Phone & Urgency Level (50% / 50% Symmetrical Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Contact Phone <span className="text-neutral-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 019-2834"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="mt-2 h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-xs sm:text-sm text-white focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              >
                <option value="Standard">Standard Triage (&lt; 24h SLA)</option>
                <option value="High Priority">High Priority (&lt; 6h SLA)</option>
                <option value="Critical Incident">Critical Ongoing Breach (&lt; 2h SLA)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Incident Category & Subject Summary (50% / 50% Symmetrical Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Incident Category <span className="text-neutral-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="mt-2 h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-xs sm:text-sm text-white focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Subject Summary <span className="text-neutral-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Unauthorized access to account"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
          </div>

          {/* Row 5: Detailed Message */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Detailed Incident Message <span className="text-neutral-500">*</span>
              </label>
              <span className="text-xs font-mono text-neutral-500">
                {message.length} / 4000
              </span>
            </div>
            <textarea
              required
              rows={6}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe chronological events, suspicious IP addresses, transaction hashes, sender headers, affected endpoints, or ransom demands..."
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 leading-relaxed"
            />
          </div>

          {/* Symmetrical Privacy Advisory Box */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-400 leading-normal">
              Upon submission, our system will issue a <strong className="text-white">Unique Request Reference ID</strong> and a <strong className="text-white">Secret Access Token</strong>. Retain both securely. You will use them to access the status of this request privately.
            </p>
          </div>

          {/* Form Actions (Symmetrical Button) */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full sm:w-auto px-8 rounded-lg border border-neutral-200 bg-neutral-100 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Encrypting &amp; Registering...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Transmit Incident Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
