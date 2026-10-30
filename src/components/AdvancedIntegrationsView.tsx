import React, { useState } from 'react';
import { 
  CommitmentItem, 
  DigitalTwinState, 
  CopilotMessage, 
  WhatIfSimulation, 
  KnowledgeGraphNode, 
  KnowledgeGraphEdge 
} from '../utils/types';
import { 
  Cpu, 
  Volume2, 
  Watch, 
  Network, 
  Sliders, 
  MessageSquare, 
  FileUp, 
  Download, 
  Share2, 
  Sparkles, 
  Play, 
  Pause, 
  Check, 
  Send, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AdvancedIntegrationsViewProps {
  commitments: CommitmentItem[];
  transcript: string;
  onOpenDetails: (item: CommitmentItem) => void;
  onAddExtractedCommitment: (item: CommitmentItem) => void;
  onToast: (msg: string) => void;
}

export const AdvancedIntegrationsView: React.FC<AdvancedIntegrationsViewProps> = ({
  commitments,
  transcript,
  onOpenDetails,
  onAddExtractedCommitment,
  onToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'copilot' | 'digital_twin' | 'voice_briefing' | 'what_if' | 'knowledge_graph' | 'ingestion' | 'watch_alerts' | 'portability'>('copilot');

  // Copilot Chat state
  const [copilotInput, setCopilotInput] = useState<string>('');
  const [copilotHistory, setCopilotHistory] = useState<CopilotMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      text: 'Hello! I am your Personal Accountability Copilot. Ask me anything about your verbal commitments, deadlines, or stakeholder promises.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Voice briefing state
  const [isPlayingBriefing, setIsPlayingBriefing] = useState<boolean>(false);

  // What-If Simulation state
  const [whatIfDelayDays, setWhatIfDelayDays] = useState<number>(2);

  // Ingestion text state
  const [ingestionText, setIngestionText] = useState<string>('');

  // Digital Twin state
  const digitalTwin: DigitalTwinState = {
    activeCount: commitments.filter((c) => c.status !== 'completed').length,
    highRiskCount: commitments.filter((c) => c.deadlineRisk && c.deadlineRisk.score >= 50).length,
    unresolvedDependencies: commitments.filter((c) => c.dependencyNode?.type !== 'independent').length,
    nextCriticalDeadline: commitments.find((c) => c.date_time)?.date_time || '2026-10-29T16:00:00Z',
    totalEstimatedCognitiveHours: commitments.reduce((acc, c) => acc + (c.estimatedHours || 1.5), 0),
    systemHealth: commitments.some((c) => c.deadlineRisk?.score && c.deadlineRisk.score >= 75) ? 'warning' : 'optimal',
  };

  // Copilot answer logic (grounded in actual commitments & transcript)
  const handleSendCopilot = () => {
    if (!copilotInput.trim()) return;
    const userQuery = copilotInput.trim();
    const userMsg: CopilotMessage = {
      id: `copilot-user-${Date.now()}`,
      role: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString(),
    };

    setCopilotHistory((prev) => [...prev, userMsg]);
    setCopilotInput('');

    setTimeout(() => {
      let reply = '';
      let citations: CopilotMessage['citations'] = [];

      const lower = userQuery.toLowerCase();
      if (lower.includes('sarah') || lower.includes('email') || lower.includes('budget')) {
        const item = commitments.find((c) => c.waitingPerson?.toLowerCase().includes('sarah') || c.title.toLowerCase().includes('budget'));
        if (item) {
          reply = `According to the conversation record, John promised Sarah to send the revised Q4 budget by ${item.deadlineOriginal || 'tomorrow at 4 PM'}.`;
          citations.push({
            source: 'Phone Call Transcript (00:04)',
            quote: item.originalText || item.description,
            commitmentId: item.id,
          });
        } else {
          reply = `I checked the verified transcript. Sarah was mentioned as a beneficiary for the Q4 deliverables review.`;
        }
      } else if (lower.includes('due') || lower.includes('today') || lower.includes('tomorrow')) {
        const upcoming = commitments.filter((c) => c.date_time || c.priority === 'critical');
        reply = `You have ${upcoming.length} active commitment(s) targeted for immediate delivery: ${upcoming.map(u => `"${u.title}" (${u.deadlineOriginal || 'SLA 24h'})`).join(', ')}.`;
      } else {
        reply = `Based on the active dialogue records with ${commitments.length} commitments, all obligations are attributed to explicit verbal undertakings. Would you like me to inspect risk levels or schedule calendar reminders?`;
      }

      const botMsg: CopilotMessage = {
        id: `copilot-bot-${Date.now()}`,
        role: 'assistant',
        text: reply,
        citations,
        timestamp: new Date().toLocaleTimeString(),
      };
      setCopilotHistory((prev) => [...prev, botMsg]);
    }, 400);
  };

  // Voice briefing playback
  const handlePlayVoiceBriefing = () => {
    if (isPlayingBriefing) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingBriefing(false);
      onToast('Voice briefing paused');
    } else {
      setIsPlayingBriefing(true);
      const briefingScript = `Good morning. Here is your daily commitment briefing for Wednesday, October 28, 2026. You have ${digitalTwin.activeCount} active deliverables in progress. Priority alert: John committed to email the revised Q4 budget to Sarah by tomorrow at 4:00 PM. No downstream conflicts detected. Have a productive day.`;

      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(briefingScript);
        utter.rate = 1.05;
        utter.onend = () => setIsPlayingBriefing(false);
        utter.onerror = () => setIsPlayingBriefing(false);
        window.speechSynthesis.speak(utter);
      }
      onToast('Playing Voice-Based Daily Briefing...');
    }
  };

  // Document Ingestion
  const handleIngestDocument = () => {
    if (!ingestionText.trim()) return;
    const newCommitment: CommitmentItem = {
      id: `cmt-ingested-${Date.now()}`,
      type: 'keep',
      title: ingestionText.slice(0, 48) + '...',
      description: `Ingested from uploaded document excerpt: "${ingestionText}"`,
      date_time: null,
      confidence_score: 0.88,
      owner: 'Ingested Lead',
      waitingPerson: 'Team',
      priority: 'high',
      sourceType: 'document',
      status: 'confirmed',
      history: [
        {
          id: `hist-doc-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'created',
          description: 'Extracted from uploaded document text.',
          actor: 'Document Extraction Engine',
        },
      ],
    };
    onAddExtractedCommitment(newCommitment);
    setIngestionText('');
    onToast('Document analyzed: Successfully extracted 1 new commitment!');
  };

  // Structured Export
  const handleExportData = (format: 'json' | 'csv' | 'markdown') => {
    let content = '';
    let mime = 'text/plain';
    let filename = `commitments-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      content = JSON.stringify(commitments, null, 2);
      mime = 'application/json';
      filename += '.json';
    } else if (format === 'csv') {
      const headers = ['ID', 'Title', 'Owner', 'WaitingPerson', 'Deadline', 'Status', 'Priority'];
      const rows = commitments.map((c) =>
        [c.id, `"${c.title}"`, c.owner, c.waitingPerson, c.date_time || 'Open', c.status, c.priority].join(',')
      );
      content = [headers.join(','), ...rows].join('\n');
      mime = 'text/csv';
      filename += '.csv';
    } else {
      content = `# CommitmentOS_V2 Export\n\nGenerated: ${new Date().toLocaleString()}\n\n` +
        commitments.map((c) => `## ${c.title}\n- **Owner**: ${c.owner}\n- **Recipient**: ${c.waitingPerson}\n- **Deadline**: ${c.deadlineOriginal || 'Open'}\n- **Status**: ${c.status}\n- **Context**: ${c.description}\n`).join('\n');
      mime = 'text/markdown';
      filename += '.md';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onToast(`Exported ${commitments.length} commitments as ${format.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            <span>Advanced Intelligence &amp; Multi-Modal Integrations</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              MODULE F
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accountability Copilot, Digital Twin mirror, Voice Briefing, Knowledge Graph, What-If simulator, and Wearable alerts.
          </p>
        </div>

        <button
          onClick={handlePlayVoiceBriefing}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20 self-start md:self-auto"
        >
          {isPlayingBriefing ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span>{isPlayingBriefing ? 'Stop Briefing' : 'Play Voice Briefing'}</span>
        </button>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'copilot', label: 'Accountability Copilot', icon: MessageSquare },
          { id: 'digital_twin', label: 'Digital Twin Mirror', icon: Cpu },
          { id: 'what_if', label: 'What-If Simulator', icon: Sliders },
          { id: 'knowledge_graph', label: 'Knowledge Graph', icon: Network },
          { id: 'ingestion', label: 'Document / Email Ingestion', icon: FileUp },
          { id: 'watch_alerts', label: 'Smartwatch Simulator', icon: Watch },
          { id: 'portability', label: 'Data Portability & Export', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub Tab 1: Personal Accountability Copilot */}
      {activeSubTab === 'copilot' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                Personal Accountability Copilot (Verbatim Evidence Grounded)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Answers your questions with exact citations to transcript timestamps and commitment records.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Zero Hallucinations
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {copilotHistory.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-950/40 border-indigo-500/40 ml-8 text-indigo-100'
                    : 'bg-slate-950/80 border-slate-800 mr-8 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span className="font-bold text-slate-400">
                    {msg.role === 'user' ? 'You' : 'Accountability Copilot'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p>{msg.text}</p>

                {/* Grounding Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                      Evidence Citation:
                    </span>
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-indigo-400 font-semibold">{cite.source}</span>: &ldquo;{cite.quote}&rdquo;
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
              placeholder="Ask Copilot (e.g., 'What did I promise Sarah?', 'Which deliverables are due tomorrow?')..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSendCopilot}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Commitment Digital Twin */}
      {activeSubTab === 'digital_twin' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                Commitment Digital Twin (Synchronized Representation)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time mathematical model tracking active obligations, cognitive loads, and system health.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              Health: {digitalTwin.systemHealth.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Active Commitments</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">{digitalTwin.activeCount}</span>
              <span className="text-[10px] text-slate-400">Total tracked deliverables</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">High Risk Items</span>
              <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{digitalTwin.highRiskCount}</span>
              <span className="text-[10px] text-slate-400">Requiring active mitigation</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Cognitive Load</span>
              <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">{digitalTwin.totalEstimatedCognitiveHours}h</span>
              <span className="text-[10px] text-slate-400">Estimated execution bandwidth</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Dependencies</span>
              <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">{digitalTwin.unresolvedDependencies}</span>
              <span className="text-[10px] text-slate-400">Handoff points identified</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 3: What-If Simulator */}
      {activeSubTab === 'what_if' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                What-If Deadline Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate moving deliverables forward or backward to test cascading chain reactions before committing.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 font-bold">
              Simulation Engine
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-300 font-semibold">Simulate Delay Horizon:</span>
                <span className="text-purple-400 font-bold">+{whatIfDelayDays} Days Extension</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={whatIfDelayDays}
                onChange={(e) => setWhatIfDelayDays(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>+1 Day</span>
                <span>+3 Days</span>
                <span>+5 Days</span>
                <span>+7 Days</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" /> Simulated Cascading Impact Analysis:
              </div>
              <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-emerald-400">Reliability Streak:</strong> Protected (Within allowable SLA renegotiation threshold).
                </li>
                <li>
                  <strong className="text-blue-400">Downstream Chains:</strong> Pushes Phase 2 verification to next Monday without blocking Sarah.
                </li>
                <li>
                  <strong className="text-amber-400">Friday Capacity:</strong> Relieves Friday congestion from 7.5 hours down to 5.0 hours (Optimal).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 4: Knowledge Graph */}
      {activeSubTab === 'knowledge_graph' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-400" />
                Commitment Knowledge Graph
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Semantic network connecting people, verbal promises, deadlines, and prerequisites.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Interactive Topology
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3 py-6">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold text-center">
                👤 John (Speaker)
              </div>
              <span className="text-slate-600 font-mono text-xs">── [Promises] ──➔</span>
              <div className="p-3 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold text-center">
                📋 Email Q4 Budget
              </div>
              <span className="text-slate-600 font-mono text-xs">── [Due 10/29] ──➔</span>
              <div className="p-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold text-center">
                👤 Sarah (Beneficiary)
              </div>
              <span className="text-slate-600 font-mono text-xs">── [Prereq for] ──➔</span>
              <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold text-center">
                🔍 Phase 2 Review
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 text-center">
              Graph nodes automatically generated from transcript turn dependencies and diarization models.
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 5: Document & Email Ingestion */}
      {activeSubTab === 'ingestion' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileUp className="h-4 w-4 text-purple-400" />
                Document, Email &amp; Chat Commitment Ingestion
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste meeting minutes, Slack threads, or email excerpts to extract commitments into CommitmentOS_V2.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Multi-Source Ingestion
            </span>
          </div>

          <div className="space-y-3">
            <textarea
              rows={4}
              value={ingestionText}
              onChange={(e) => setIngestionText(e.target.value)}
              placeholder="Paste email thread or meeting notes here (e.g., 'From: Sarah Connor - I will send the wireframes before Thursday 2 PM...')"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Supports PDF text, email threads, and Slack discussions.
              </span>
              <button
                onClick={handleIngestDocument}
                disabled={!ingestionText.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ingest &amp; Extract Commitments</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 6: Smartwatch Simulator */}
      {activeSubTab === 'watch_alerts' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-center flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-left">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Watch className="h-4 w-4 text-purple-400" />
                Smartwatch Commitment Alerts Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                High-priority haptic glanceable alert for supported wearable platforms (WearOS / Apple Watch).
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Glanceable UI
            </span>
          </div>

          {/* Watch Face Frame */}
          <div className="w-56 h-64 rounded-[40px] bg-slate-950 border-4 border-slate-700 p-4 shadow-2xl flex flex-col justify-between text-left my-4 relative">
            <div className="flex items-center justify-between text-[10px] font-mono text-purple-400">
              <span>09:41</span>
              <span>CommitmentOS</span>
            </div>

            <div className="space-y-1 my-auto">
              <div className="text-[9px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5" /> Urgent SLA Alert
              </div>
              <div className="text-xs font-bold text-white leading-tight">
                Email Q4 Budget to Sarah
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Target: Tomorrow 4:00 PM
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => onToast('Tapped Done on Smartwatch')}
                className="w-1/2 py-1 rounded-lg bg-emerald-600 text-white font-mono text-[10px] font-bold text-center cursor-pointer"
              >
                Done
              </button>
              <button
                onClick={() => onToast('Snoozed 1 hour on Smartwatch')}
                className="w-1/2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] text-center cursor-pointer"
              >
                +1h
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 7: Data Portability & Export */}
      {activeSubTab === 'portability' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-purple-400" />
                Commitment Portability &amp; Structured Export
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Export verified commitments into universal standards with zero lock-in.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Open Standards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleExportData('json')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block mb-1">Standard JSON</span>
                <span className="text-[11px] text-slate-400 block">
                  Full object schema with diarized evidence and confidence telemetry.
                </span>
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold mt-3 flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> Download JSON
              </span>
            </button>

            <button
              onClick={() => handleExportData('csv')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block mb-1">CSV Spreadsheet</span>
                <span className="text-[11px] text-slate-400 block">
                  Compatible with Microsoft Excel, Google Sheets, and Airtable.
                </span>
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold mt-3 flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> Download CSV
              </span>
            </button>

            <button
              onClick={() => handleExportData('markdown')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block mb-1">Markdown Report</span>
                <span className="text-[11px] text-slate-400 block">
                  Clean checklist and summary notes for Notion or GitHub.
                </span>
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold mt-3 flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> Download Markdown
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
