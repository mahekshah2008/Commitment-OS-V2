import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_TRANSCRIPTS } from './data/sampleTranscripts';
import { CommitmentResponse, CommitmentItem, CommitmentStatus } from './utils/types';
import { Header } from './components/Header';
import { TranscriptInput } from './components/TranscriptInput';
import { CommitmentList } from './components/CommitmentList';
import { RawJsonViewer } from './components/RawJsonViewer';
import { TranscriptViewer } from './components/TranscriptViewer';
import { CommitmentDetailModal } from './components/CommitmentDetailModal';
import { ConversationSummaryModal } from './components/ConversationSummaryModal';
import { CalendarEventReviewModal } from './components/CalendarEventReviewModal';
import { LinkedTasksModal } from './components/LinkedTasksModal';
import { IntegrationsHubModal } from './components/IntegrationsHubModal';
import { FocusModeView } from './components/FocusModeView';
import { AccountabilityInsightsView } from './components/AccountabilityInsightsView';
import { PlanningForecastView } from './components/PlanningForecastView';
import { AutonomousAgentView } from './components/AutonomousAgentView';
import { PeopleCollaborationView } from './components/PeopleCollaborationView';
import { PrivacySecurityView } from './components/PrivacySecurityView';
import { CommitmentAnalyticsView } from './components/CommitmentAnalyticsView';
import { KanbanBoardView } from './components/KanbanBoardView';
import { AdvancedIntegrationsView } from './components/AdvancedIntegrationsView';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  Code2, 
  LayoutList, 
  HelpCircle, 
  Users, 
  FileText, 
  Check, 
  Search, 
  Settings2, 
  Zap, 
  Repeat, 
  Flame, 
  ShieldCheck, 
  Bot,
  Columns,
  Lock,
  BarChart3,
  Cpu
} from 'lucide-react';

export default function App() {
  const [transcript, setTranscript] = useState<string>(SAMPLE_TRANSCRIPTS[0].transcript);
  const [data, setData] = useState<CommitmentResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'board' | 'kanban' | 'focus' | 'people' | 'analytics' | 'planning' | 'privacy' | 'advanced' | 'agent' | 'transcript' | 'json'
  >('board');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('commitmentos_theme') !== 'light';
    } catch {
      return true;
    }
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Modals state
  const [selectedCommitment, setSelectedCommitment] = useState<CommitmentItem | null>(null);
  const [calendarReviewCommitment, setCalendarReviewCommitment] = useState<CommitmentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCalendarReviewOpen, setIsCalendarReviewOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState<boolean>(false);
  const [isIntegrationsHubOpen, setIsIntegrationsHubOpen] = useState<boolean>(false);
  const [activeEvidenceText, setActiveEvidenceText] = useState<string | undefined>(undefined);

  // Audio Playback simulation state
  const [currentAudioSec, setCurrentAudioSec] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioIntervalRef = useRef<any>(null);

  const totalDurationSec = data?.segments?.length
    ? data.segments[data.segments.length - 1].endSec + 2
    : 60;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: CommitmentResponse = await response.json();
      setData(result);
      showToast(`Extracted ${result.commitments?.length || 0} verbal commitments!`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      showToast('Extraction failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Feature 6: Reanalyze / Recover Missed Commitments
  const handleReanalyze = async () => {
    if (!transcript.trim()) return;
    setIsReanalyzing(true);

    try {
      const response = await fetch('/api/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          existingCommitments: data?.commitments || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: CommitmentResponse = await response.json();
      setData(result);
      const newItemsCount = result.commitments.filter((c: any) => c.isRecovered).length;
      showToast(
        newItemsCount > 0
          ? `Recovered ${newItemsCount} missed/tentative commitment${newItemsCount > 1 ? 's' : ''}!`
          : 'Reanalysis complete: all commitments verified against source evidence.'
      );
    } catch (err: any) {
      console.error('Reanalysis error:', err);
      showToast('Reanalysis failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Feature 5: Regenerate Summary
  const handleRegenerateSummary = async () => {
    if (!transcript.trim()) return;
    setIsRegeneratingSummary(true);

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) throw new Error('Summary regeneration failed');
      const res = await response.json();

      if (data) {
        setData({
          ...data,
          summary: res.summary,
        });
      }
      showToast('Conversation summary refreshed');
    } catch (err: any) {
      showToast('Failed to regenerate summary');
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  // Feature 1: Confirm Calendar Sync
  const handleConfirmCalendarSync = (commitmentId: string, eventDetails: any) => {
    if (!data) return;
    const updatedCommitments = data.commitments.map((c) => {
      if (c.id === commitmentId) {
        return {
          ...c,
          title: eventDetails.title || c.title,
          date_time: eventDetails.dateTime || c.date_time,
          calendarSync: {
            status: 'synced' as const,
            syncedAt: new Date().toISOString(),
            externalEventId: `gcal-${Date.now()}`,
            eventUrl: eventDetails.calUrl,
          },
          history: [
            ...(c.history || []),
            {
              id: `hist-cal-${Date.now()}`,
              timestamp: new Date().toISOString(),
              eventType: 'calendar_synced' as const,
              description: 'Created and synced Google Calendar event.',
              actor: 'Google Calendar Sync',
            },
          ],
        };
      }
      return c;
    });

    setData({
      ...data,
      commitments: updatedCommitments,
    });
  };

  // Feature 3: Update Task Status
  const handleUpdateTaskStatus = (commitmentId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    if (!data) return;
    const updatedCommitments = data.commitments.map((c) => {
      if (c.id === commitmentId && c.linkedTask) {
        return {
          ...c,
          linkedTask: {
            ...c.linkedTask,
            status: newStatus,
          },
          status: newStatus === 'completed' ? ('completed' as const) : c.status,
          history: [
            ...(c.history || []),
            {
              id: `hist-task-${Date.now()}`,
              timestamp: new Date().toISOString(),
              eventType: 'task_created' as const,
              description: `Action task marked as "${newStatus}".`,
              actor: 'Task System',
            },
          ],
        };
      }
      return c;
    });

    setData({ ...data, commitments: updatedCommitments });
    showToast(`Task status updated to ${newStatus}`);
  };

  // Feature 10: Retry Failed Operations in Integration Hub
  const handleRetryOperation = (opId: string) => {
    if (!data || !data.integrationHub) return;
    const updatedFailed = data.integrationHub.failedOperations.filter((op) => op.id !== opId);
    setData({
      ...data,
      integrationHub: {
        ...data.integrationHub,
        failedOperations: updatedFailed,
      },
    });
  };

  // Audio Playback simulation logic
  const handlePlayPauseAudio = () => {
    if (isPlayingAudio) {
      clearInterval(audioIntervalRef.current);
      setIsPlayingAudio(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsPlayingAudio(true);
      const currentSeg = data?.segments?.find(
        (s) => currentAudioSec >= s.startSec && currentAudioSec <= s.endSec
      );
      if (currentSeg && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(currentSeg.text);
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      }

      audioIntervalRef.current = setInterval(() => {
        setCurrentAudioSec((prev) => {
          if (prev >= totalDurationSec) {
            clearInterval(audioIntervalRef.current);
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleSeekAudio = (sec: number) => {
    setCurrentAudioSec(sec);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isPlayingAudio) {
      const currentSeg = data?.segments?.find(
        (s) => sec >= s.startSec && sec <= s.endSec
      );
      if (currentSeg && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(currentSeg.text);
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      }
    }
  };

  const handleJumpToAudioSegment = (startSec: number) => {
    handleSeekAudio(startSec);
    if (!isPlayingAudio) {
      handlePlayPauseAudio();
    }
    showToast(`Seeking audio to 00:${String(startSec).padStart(2, '0')}`);
  };

  const handleUpdateCommitment = (updated: CommitmentItem) => {
    if (!data) return;
    const updatedList = data.commitments.map((c) => (c.id === updated.id ? updated : c));
    setData({ ...data, commitments: updatedList });
    setSelectedCommitment(updated);
  };

  const handleToggleStatus = (id: string, newStatus: CommitmentStatus) => {
    if (!data) return;
    const updatedList = data.commitments.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          history: [
            ...(c.history || []),
            {
              id: `hist-status-${Date.now()}`,
              timestamp: new Date().toISOString(),
              eventType: 'status_changed' as const,
              description: `Status changed to ${newStatus}`,
              actor: 'User',
            },
          ],
        };
      }
      return c;
    });
    setData({ ...data, commitments: updatedList });
    showToast(`Commitment marked as ${newStatus}`);
  };

  const handleUpdateCommitmentDate = (id: string, newDateIso: string) => {
    if (!data) return;
    const updatedList = data.commitments.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          date_time: newDateIso,
          status: 'rescheduled' as const,
          history: [
            ...(c.history || []),
            {
              id: `hist-resched-${Date.now()}`,
              timestamp: new Date().toISOString(),
              eventType: 'rescheduled' as const,
              description: `Proactively rescheduled to ${new Date(newDateIso).toLocaleDateString()}. Streak shield preserved.`,
              actor: 'Intelligent Rescheduling Agent',
            },
          ],
        };
      }
      return c;
    });
    setData({ ...data, commitments: updatedList });
  };

  const handleUpdateSpeaker = (oldName: string, newName: string) => {
    if (!data) return;
    const updatedSegments = (data.segments || []).map((seg) =>
      seg.speaker === oldName ? { ...seg, speaker: newName } : seg
    );
    const updatedCommitments = data.commitments.map((c) =>
      c.owner === oldName ? { ...c, owner: newName } : c
    );
    setData({
      ...data,
      segments: updatedSegments,
      commitments: updatedCommitments,
    });
  };

  const handleOpenDetails = (item: CommitmentItem) => {
    setSelectedCommitment(item);
    setIsDetailModalOpen(true);
    if (item.originalText) {
      setActiveEvidenceText(item.originalText);
    }
  };

  const handleOpenCalendarReview = (item: CommitmentItem) => {
    setCalendarReviewCommitment(item);
    setIsCalendarReviewOpen(true);
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('commitmentos_theme', next ? 'dark' : 'light');
      } catch (err) {
        // ignore
      }
      return next;
    });
    showToast(`Theme switched to ${!isDark ? 'Dark Mode' : 'Light Mode'}`);
  };

  const handleClearAllData = () => {
    setData({
      commitments: [],
      segments: [],
      summary: undefined,
      contradictions: [],
      integrationHub: data?.integrationHub,
      analytics: data?.analytics,
      consentPolicy: data?.consentPolicy,
      securityAuditTrail: [
        ...(data?.securityAuditTrail || []),
        {
          id: `audit-del-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'delete_commitment',
          actor: 'User (Right-to-Delete)',
          details: 'User exercised Right-to-Delete. All active commitments and transcript turns purged.',
          severity: 'security',
        },
      ],
    });
    showToast('Right-to-Delete executed: All session data cleared.');
  };

  const handleAddExtractedCommitment = (newCmt: CommitmentItem) => {
    if (!data) return;
    setData({
      ...data,
      commitments: [newCmt, ...data.commitments],
    });
    showToast(`Added new commitment: "${newCmt.title}"`);
  };

  // Initial load
  useEffect(() => {
    handleAnalyze();
  }, []);

  // Cleanup audio timer
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter & Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transcript]);

  const calendarCount = data?.commitments?.filter((c) => c.type === 'calendar').length || 0;
  const keepCount = data?.commitments?.filter((c) => c.type === 'keep').length || 0;
  const taskCount = data?.commitments?.filter((c) => Boolean(c.linkedTask)).length || 0;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500/30 selection:text-amber-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-100 shadow-2xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        analyzing={isAnalyzing}
        totalCommitments={data?.commitments?.length || 0}
        calendarCount={calendarCount}
        keepCount={keepCount}
        taskCount={taskCount}
        onOpenTasksModal={() => setIsTasksModalOpen(true)}
        onOpenIntegrationsHub={() => setIsIntegrationsHubOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleTheme={handleToggleTheme}
        isDark={isDark}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Intelligence Banner */}
        {/* Intelligence Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  CommitmentOS_V2: Full-Spectrum Commitment Intelligence Platform
                </h2>
                {data?.languageDetected && (
                  <span className="text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded shrink-0">
                    {data.languageDetected}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Modules A through F active: AI extraction, People &amp; collaboration, Privacy &amp; consent gates, Analytics heatmaps, Interactive Kanban, and Copilot integrations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs flex-wrap shrink-0">
            <button
              onClick={() => setActiveTab('kanban')}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveTab('focus')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold"
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>Focus</span>
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold"
            >
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              <span>Copilot</span>
            </button>
            <button
              onClick={() => setIsIntegrationsHubOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Settings2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Sync Hub</span>
            </button>
          </div>
        </div>

        {/* Core Workspace: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Transcript Input & Controls */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <TranscriptInput
              transcript={transcript}
              onChange={setTranscript}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />

            {/* Methodology & Capabilities Reference Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold mb-3 text-xs uppercase tracking-wider">
                <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Modules A–F Active Architecture</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-slate-400">
                <li><strong className="text-slate-200">A: AI Intelligence:</strong> Verification, Ambiguity Resolver &amp; Risk Scoring.</li>
                <li><strong className="text-slate-200">B: Collaboration:</strong> Who-Owes-What, Contact Timelines &amp; Polite Follow-Ups.</li>
                <li><strong className="text-slate-200">C: Privacy &amp; Consent:</strong> Statutory consent gates, PII scrub &amp; Right-to-Delete.</li>
                <li><strong className="text-slate-200">D: Analytics:</strong> Schedule heatmaps, Category metrics &amp; Bottleneck detection.</li>
                <li><strong className="text-slate-200">E: Design &amp; UX:</strong> Interactive Kanban, Theme toggle &amp; Architects Daughter highlights.</li>
                <li><strong className="text-slate-200">F: Advanced Integrations:</strong> Digital Twin, Voice Briefing &amp; Accountability Copilot.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Views Container */}
          <div className="lg:col-span-7 flex flex-col gap-4 min-w-0">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2 min-w-0">
              <div className="flex-1 min-w-0 flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('board')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'board'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span>Cards ({data?.commitments?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'kanban'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span>Kanban</span>
                </button>

                <button
                  onClick={() => setActiveTab('focus')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'focus'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>Focus</span>
                </button>

                <button
                  onClick={() => setActiveTab('people')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'people'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>People</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'analytics'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Heatmap</span>
                </button>

                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'privacy'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Privacy</span>
                </button>

                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'advanced'
                      ? 'bg-purple-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Copilot</span>
                </button>

                <button
                  onClick={() => setActiveTab('planning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'planning'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Forecast</span>
                </button>

                <button
                  onClick={() => setActiveTab('agent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'agent'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Agent</span>
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'transcript'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Audio</span>
                </button>

                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === 'json'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>JSON</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-500 hidden sm:block shrink-0 pl-2">
                CommitmentOS_V2
              </div>
            </div>

            {/* Tab Panels */}
            {activeTab === 'board' && (
              <CommitmentList
                data={data}
                onToast={showToast}
                isAnalyzing={isAnalyzing}
                onOpenDetails={handleOpenDetails}
                onPlayAudioSegment={handleJumpToAudioSegment}
                onToggleStatus={handleToggleStatus}
                onOpenCalendarReview={handleOpenCalendarReview}
                onOpenSummary={() => setIsSummaryModalOpen(true)}
                onOpenTasksModal={() => setIsTasksModalOpen(true)}
                onOpenIntegrationsHub={() => setIsIntegrationsHubOpen(true)}
                onReanalyze={handleReanalyze}
                isReanalyzing={isReanalyzing}
                activeEvidenceText={activeEvidenceText}
              />
            )}

            {activeTab === 'kanban' && (
              <KanbanBoardView
                commitments={data?.commitments || []}
                onToggleStatus={handleToggleStatus}
                onOpenDetails={handleOpenDetails}
                onToast={showToast}
              />
            )}

            {activeTab === 'focus' && (
              <FocusModeView
                commitments={data?.commitments || []}
                onToggleStatus={handleToggleStatus}
                onOpenDetails={handleOpenDetails}
                onToast={showToast}
              />
            )}

            {activeTab === 'people' && (
              <PeopleCollaborationView
                commitments={data?.commitments || []}
                onToggleStatus={handleToggleStatus}
                onOpenDetails={handleOpenDetails}
                onToast={showToast}
              />
            )}

            {activeTab === 'analytics' && (
              <CommitmentAnalyticsView
                commitments={data?.commitments || []}
                onOpenDetails={handleOpenDetails}
                onToast={showToast}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacySecurityView
                consentPolicy={data?.consentPolicy}
                securityAuditTrail={data?.securityAuditTrail}
                onClearAllData={handleClearAllData}
                onToast={showToast}
              />
            )}

            {activeTab === 'advanced' && (
              <AdvancedIntegrationsView
                commitments={data?.commitments || []}
                transcript={transcript}
                onOpenDetails={handleOpenDetails}
                onAddExtractedCommitment={handleAddExtractedCommitment}
                onToast={showToast}
              />
            )}

            {activeTab === 'planning' && (
              <PlanningForecastView
                analytics={data?.analytics}
                commitments={data?.commitments || []}
                onOpenDetails={handleOpenDetails}
                onUpdateCommitmentDate={handleUpdateCommitmentDate}
                onToast={showToast}
              />
            )}

            {activeTab === 'agent' && (
              <AutonomousAgentView
                commitments={data?.commitments || []}
                onToggleStatus={handleToggleStatus}
                onUpdateCommitmentDate={handleUpdateCommitmentDate}
                onToast={showToast}
              />
            )}

            {activeTab === 'transcript' && (
              <TranscriptViewer
                segments={data?.segments || []}
                onUpdateSpeaker={handleUpdateSpeaker}
                activeEvidenceText={activeEvidenceText}
                onSelectEvidence={(txt) => {
                  setActiveEvidenceText(txt);
                  showToast('Evidence selected in transcript');
                }}
                currentAudioSec={currentAudioSec}
                totalDurationSec={totalDurationSec}
                isPlayingAudio={isPlayingAudio}
                onPlayPauseAudio={handlePlayPauseAudio}
                onSeekAudio={handleSeekAudio}
                onToast={showToast}
              />
            )}

            {activeTab === 'json' && (
              <RawJsonViewer
                data={data}
                onToast={showToast}
              />
            )}
          </div>
        </div>
      </main>

      {/* Commitment Detail Drawer / Modal with 6 Grouped Sections */}
      <CommitmentDetailModal
        commitment={selectedCommitment}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCommitment(null);
        }}
        onUpdate={handleUpdateCommitment}
        onPlayAudioSegment={handleJumpToAudioSegment}
        onOpenCalendarReview={handleOpenCalendarReview}
        onToast={showToast}
      />

      {/* Feature 1: Calendar Event Review & Sync Modal */}
      <CalendarEventReviewModal
        commitment={calendarReviewCommitment}
        isOpen={isCalendarReviewOpen}
        onClose={() => {
          setIsCalendarReviewOpen(false);
          setCalendarReviewCommitment(null);
        }}
        onConfirmSync={handleConfirmCalendarSync}
        onToast={showToast}
      />

      {/* Feature 3: Linked Actionable Tasks Modal */}
      <LinkedTasksModal
        commitments={data?.commitments || []}
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onOpenCommitment={handleOpenDetails}
        onToast={showToast}
      />

      {/* Feature 8 & 10: Integrations & Synchronization Hub Modal */}
      <IntegrationsHubModal
        status={data?.integrationHub}
        isOpen={isIntegrationsHubOpen}
        onClose={() => setIsIntegrationsHubOpen(false)}
        onRetryOperation={handleRetryOperation}
        onToast={showToast}
      />

      {/* Smart Conversation Summary Modal */}
      <ConversationSummaryModal
        summary={data?.summary}
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onRegenerate={handleRegenerateSummary}
        isRegenerating={isRegeneratingSummary}
        onToast={showToast}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commitments={data?.commitments || []}
        onSelectTab={(tab) => setActiveTab(tab)}
        onSelectCommitment={handleOpenDetails}
        onToggleTheme={handleToggleTheme}
        isDark={isDark}
        onToast={showToast}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-12 text-center text-xs text-slate-600 font-mono">
        CommitmentOS_V2 • Google Calendar, Keep &amp; Tasks Synchronized • 2026 Reference Calibrated
      </footer>
    </div>
  );
}
