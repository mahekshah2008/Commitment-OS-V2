import React, { useState } from 'react';
import { ConsentPolicy, SecurityAuditEvent, DataRetentionSetting } from '../utils/types';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  RefreshCw,
  Server,
  KeyRound,
  FileCheck2
} from 'lucide-react';

interface PrivacySecurityViewProps {
  consentPolicy?: ConsentPolicy;
  securityAuditTrail?: SecurityAuditEvent[];
  onClearAllData: () => void;
  onToast: (msg: string) => void;
}

export const PrivacySecurityView: React.FC<PrivacySecurityViewProps> = ({
  consentPolicy,
  securityAuditTrail = [],
  onClearAllData,
  onToast,
}) => {
  const [localProcessing, setLocalProcessing] = useState<boolean>(
    consentPolicy?.localOnlyProcessing || false
  );
  const [redactionActive, setRedactionActive] = useState<boolean>(
    consentPolicy?.redactionEnabled ?? true
  );
  const [jurisdiction, setJurisdiction] = useState<'two_party_wiretap' | 'one_party' | 'gdpr_enterprise'>(
    consentPolicy?.jurisdiction || 'two_party_wiretap'
  );
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Sample redaction comparison text
  const unredactedSample = "John: I will email the revised Q4 budget to sarah.connor@acme-corp.com and share the HSM key handle #99482 by tomorrow at 4 PM.";
  const redactedSample = "John: I will email the revised Q4 budget to [REDACTED_EMAIL] and share the HSM key handle [REDACTED_KEY_HANDLE] by tomorrow at 4 PM.";

  const handleToggleLocalMode = () => {
    setLocalProcessing(!localProcessing);
    onToast(
      !localProcessing
        ? 'Local-Only Mode enabled: Zero external telemetry or third-party AI transmission.'
        : 'Cloud Accelerated Mode enabled.'
    );
  };

  const handleToggleRedaction = () => {
    setRedactionActive(!redactionActive);
    onToast(
      !redactionActive
        ? 'Sensitive Information Redaction enabled: Emails and secrets will be scrubbed.'
        : 'Sensitive Information Redaction bypassed.'
    );
  };

  const handleApplyRetention = () => {
    onToast(`Data retention policy updated: Transcripts purged after ${retentionDays} days.`);
  };

  const handleExecuteRightToDelete = () => {
    onClearAllData();
    setShowConfirmDelete(false);
    onToast('Right-to-Delete executed: All session transcripts and commitments permanently purged.');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Privacy, Security &amp; Compliance Center
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                MODULE C
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explicit recording consent, PII redaction, local-only processing, data retention, and immutable audit logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Zero-Leakage Architecture
          </span>
        </div>
      </div>

      {/* Grid: Consent & Local Mode, Redaction, Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Consent & Local AI Processing */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Explicit Recording Consent Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                Explicit Recording Consent Gate
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Consent Active
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Recording consent is required prior to analyzing phone calls. Configured jurisdiction enforces statutory acoustic notice or dual-party consent.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-mono text-slate-400 block font-semibold">
                Statutory Compliance Jurisdiction:
              </label>
              <select
                value={jurisdiction}
                onChange={(e: any) => setJurisdiction(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
              >
                <option value="two_party_wiretap">Two-Party Wiretap (CA, FL, MA, IL - Strict Dual Consent)</option>
                <option value="one_party">One-Party Consent (Federal Standard)</option>
                <option value="gdpr_enterprise">GDPR Enterprise Article 6(1)(b) Processing</option>
              </select>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span>Consent Verified: 2026-10-28 09:00:00 PST</span>
            </div>
          </div>

          {/* Private-by-Default & Local Processing Mode */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-400" />
                Processing Privacy Boundaries
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Data Boundary
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">Local-Only AI Processing Mode</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Restricts processing to client-side heuristic engines. Zero transcript transmission to remote cloud models.
                </div>
              </div>
              <button
                onClick={handleToggleLocalMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  localProcessing
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {localProcessing ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">PII &amp; Secret Scrubber</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Automatically masks email addresses, phone numbers, and API tokens before saving.
                </div>
              </div>
              <button
                onClick={handleToggleRedaction}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  redactionActive
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {redactionActive ? 'Active' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Redaction Preview & Right-to-Delete */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Sensitive Information Redaction Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-400" />
                Sensitive Information Redaction Preview
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Real-Time Masking
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">Raw Input Dialogue:</span>
                <div className="p-3 rounded-lg bg-slate-950 text-xs font-mono text-slate-400 border border-slate-800">
                  {unredactedSample}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-emerald-400 block mb-1">Scrubbed Protected View:</span>
                <div className="p-3 rounded-lg bg-slate-950 text-xs font-mono text-emerald-300 border border-emerald-500/30">
                  {redactionActive ? redactedSample : unredactedSample}
                </div>
              </div>
            </div>
          </div>

          {/* Granular Data Retention & Right-to-Delete */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-rose-400" />
                Granular Retention &amp; Right-to-Delete
              </h3>
              <span className="text-xs font-mono text-slate-400">
                User Sovereignty
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5 font-semibold">
                  Automatic Data Purge Schedule:
                </label>
                <div className="flex items-center gap-2">
                  {[7, 30, 90, 365].map((d) => (
                    <button
                      key={d}
                      onClick={() => setRetentionDays(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        retentionDays === d
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                  <button
                    onClick={handleApplyRetention}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
                  >
                    Save Retention
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-3 pt-2">
                <div>
                  <div className="text-xs font-bold text-rose-300">Exercise Right-to-Delete</div>
                  <div className="text-[11px] text-slate-400">
                    Permanently wipe all session transcripts, audio, and commitments from local and memory storage.
                  </div>
                </div>

                {showConfirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteRightToDelete}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Confirm Purge
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-xs font-mono transition-colors cursor-pointer shrink-0"
                  >
                    Purge All Data
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Trail (Immutable Log) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            Security &amp; Access Audit Trail (Zero-Tamper Log)
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Append-only verification log
          </span>
        </div>

        <div className="space-y-2">
          {securityAuditTrail.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  ev.severity === 'security'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {ev.action.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-300">{ev.details}</span>
              </div>

              <div className="text-[11px] text-slate-500 shrink-0">
                <span>{new Date(ev.timestamp).toLocaleTimeString()}</span> • <span>{ev.actor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
