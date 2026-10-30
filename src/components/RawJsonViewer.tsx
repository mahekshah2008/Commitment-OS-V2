import React, { useState } from 'react';
import { CommitmentResponse } from '../utils/types';
import { downloadJsonFile } from '../utils/calendar';
import { Copy, Check, Download, Terminal, ShieldCheck, Code2 } from 'lucide-react';

interface RawJsonViewerProps {
  data: CommitmentResponse | null;
  onToast: (msg: string) => void;
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({ data, onToast }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const formattedJson = data ? JSON.stringify(data, null, 2) : '{\n  "commitments": []\n}';

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    onToast('Raw JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const curlCommand = `curl -X POST "${window.location.origin}/api/analyze" \\
  -H "Content-Type: application/json" \\
  -d '{"transcript": "Sarah: I will send over the updated financial sensitivity models by tomorrow at 4 PM..."}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    onToast('cURL command copied to clipboard');
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  // Schema verification check
  const isSchemaValid = Boolean(
    data &&
    Array.isArray(data.commitments) &&
    data.commitments.every(
      (c) =>
        (c.type === 'calendar' || c.type === 'keep') &&
        typeof c.title === 'string' &&
        typeof c.description === 'string' &&
        (c.date_time === null || typeof c.date_time === 'string') &&
        typeof c.confidence_score === 'number'
    )
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Raw Schema Output (Strict JSON)
          </h2>
          {isSchemaValid && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-3 w-3" />
              Schema Validated
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              downloadJsonFile(data || { commitments: [] }, 'commitmentos-v2-schema.json');
              onToast('Downloaded JSON schema file');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .json</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied Raw JSON!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Raw JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="relative">
        <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-[460px] leading-relaxed selection:bg-emerald-500/30">
          <code>{formattedJson}</code>
        </pre>
      </div>

      {/* REST API cURL Playground */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Terminal className="h-3.5 w-3.5 text-amber-400" />
            <span>Developer REST API Endpoint:</span>
            <code className="text-amber-300">POST /api/analyze</code>
          </div>
          <button
            onClick={handleCopyCurl}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedCurl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>Copy cURL</span>
          </button>
        </div>
        <pre className="text-[11px] font-mono text-slate-500 overflow-x-auto whitespace-pre-wrap select-all">
          {curlCommand}
        </pre>
      </div>
    </div>
  );
};
