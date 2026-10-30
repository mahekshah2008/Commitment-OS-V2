export type CommitmentClassification =
  | 'committed'      // A clear promise or undertaking
  | 'tentative'      // A possible action with uncertain commitment ("I'll try to...")
  | 'intention'      // A planned or desired action without definite promise ("I hope to...")
  | 'conditional'    // Dependent on a stated condition ("If approved, I will...")
  | 'hypothetical'   // Discussed as a possibility ("I would if I had time...")
  | 'not_commitment';// Question, suggestion, general statement

export type CommitmentPriority = 'critical' | 'high' | 'medium' | 'low';

export type ConditionStatus = 'pending' | 'satisfied' | 'failed' | 'unknown';

// Module A: 9-stage Commitment Lifecycle
export type CommitmentLifecycleStatus =
  | 'detected'
  | 'needs_clarification'
  | 'confirmed'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'rescheduled'
  | 'overdue'
  | 'cancelled';

export type CommitmentStatus =
  | CommitmentLifecycleStatus
  | 'active'
  | 'dismissed'
  | 'pending_prerequisite';

export interface ConfidenceBreakdown {
  clarity: number; // 0-100
  ownerIdentification: number; // 0-100
  deadlineInterpretation: number; // 0-100
  contextSupport: number; // 0-100
  classificationConfidence: number; // 0-100
  explanation: string;
}

export interface EvidenceSpan {
  text: string;
  startChar?: number;
  endChar?: number;
  audioStartSec?: number;
  audioEndSec?: number;
  speaker?: string;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  targetField: 'deadline' | 'owner' | 'task' | 'condition' | 'confirmation';
  resolved: boolean;
}

export interface ContradictionAlert {
  id: string;
  earlierStatement: string;
  laterStatement: string;
  earlierSpeaker: string;
  laterSpeaker: string;
  explanation: string;
  dismissed: boolean;
  earlierTime?: string;
  laterTime?: string;
}

export interface CommitmentHistoryEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'created'
    | 'edited'
    | 'owner_changed'
    | 'deadline_changed'
    | 'status_changed'
    | 'completed'
    | 'reanalyzed'
    | 'condition_updated'
    | 'calendar_synced'
    | 'notes_exported'
    | 'task_created'
    | 'deadline_suggested_accepted'
    | 'duplicate_merged'
    | 'rescheduled'
    | 'recovery_action_applied'
    | 'agent_action_executed'
    | 'dismissed';
  description: string;
  actor: string;
}

export interface CalendarSyncInfo {
  status: 'not_synced' | 'syncing' | 'synced' | 'failed';
  externalEventId?: string;
  syncedAt?: string;
  eventUrl?: string;
  lastError?: string;
  retryCount?: number;
  idempotencyKey?: string;
}

export interface NotesExportInfo {
  status: 'not_exported' | 'exporting' | 'exported' | 'failed';
  provider: 'keep' | 'docs' | 'notes';
  exportedAt?: string;
  noteUrl?: string;
  lastError?: string;
}

export interface LinkedTask {
  id: string;
  commitmentId: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string | null;
  priority: CommitmentPriority;
  status: 'todo' | 'in_progress' | 'completed';
  createdAt: string;
  isAutoCreated: boolean;
}

export interface DuplicateInfo {
  isDuplicate: boolean;
  duplicateType?: 'exact' | 'probable';
  matchingCommitmentId?: string;
  matchingTitle?: string;
  similarityScore?: number;
  reason?: string;
  dismissed?: boolean;
}

export interface ConflictCheckInfo {
  hasConflict: boolean;
  conflictingEvents?: Array<{ title: string; time: string; reason: string }>;
  suggestedAlternativeSlots?: Array<{ startIso: string; endIso: string; label: string }>;
  checkedAt?: string;
}

export interface SuggestedDeadlineInfo {
  dateTime: string;
  label: string;
  reason: string;
  isAccepted: boolean;
  isRejected: boolean;
}

export interface RecurrencePattern {
  isRecurring: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  interval: number;
  byDay?: string[];
  rruleText?: string;
  humanSummary?: string;
  occurrencesCount?: number;
  confirmed?: boolean;
}

export interface FailedOperationRecord {
  id: string;
  commitmentId: string;
  commitmentTitle: string;
  operation: 'calendar_sync' | 'notes_export' | 'task_create';
  error: string;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'retrying' | 'failed' | 'resolved';
}

// Module B: Smart Reminders & Escalation
export interface SmartReminder {
  id: string;
  commitmentId: string;
  stage: 't_minus_24h' | 't_minus_4h' | 't_minus_1h' | 'due' | 'escalated';
  triggerAt: string;
  channel: 'in_app' | 'browser' | 'calendar';
  status: 'scheduled' | 'sent' | 'suppressed' | 'dismissed';
  message: string;
}

// Module B: Overdue Recovery Plan
export interface OverdueRecoveryPlan {
  actionType:
    | 'break_down'
    | 'schedule_focus'
    | 'request_extension'
    | 'notify_stakeholder'
    | 'resolve_dependency'
    | 'renegotiate';
  title: string;
  explanation: string;
  suggestedDeadline?: string;
  applied: boolean;
}

// Module B: Intelligent Rescheduling
export interface ReschedulingSuggestion {
  suggestedDate: string;
  reason: string;
  impactOnDownstream: string;
  approved: boolean;
}

// Module D: Proactive Deadline Risk Prediction
export interface DeadlineRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  factors: string[];
  recommendedMitigation: string;
}

// Module D: Dependency Mapping
export interface DependencyNode {
  type: 'waiting_for_person' | 'blocked_by_task' | 'requires_approval' | 'requires_info' | 'independent';
  targetEntity: string;
  status: 'pending' | 'resolved';
  downstreamCommitmentIds: string[];
}

// Module D: Multi-Agent Verification
export interface MultiAgentVerification {
  deadlineConfidence: number;
  deadlineAgentNotes: string;
  responsibilityConfidence: number;
  responsibilityAgentNotes: string;
  duplicateConfidence: number;
  duplicateAgentNotes: string;
  verifiedVerdict: 'accepted' | 'flagged_for_review';
}

// Module D: Autonomous Agent Proposal
export interface AutonomousAgentProposal {
  id: string;
  commitmentId: string;
  proposedAction: 'schedule_calendar' | 'create_task' | 'setup_reminder' | 'notify_stakeholder';
  previewText: string;
  parameters: Record<string, any>;
  status: 'pending_approval' | 'executed' | 'rejected';
  createdAt: string;
}

export interface CommitmentItem {
  id: string;
  type: 'calendar' | 'keep';
  title: string;
  description: string;
  date_time: string | null;
  confidence_score: number; // 0.0 to 1.0 (backward compatible)

  // Smart Commitment Intelligence fields:
  originalText?: string;
  action?: string;
  owner?: string;
  waitingPerson?: string;
  classification?: CommitmentClassification;
  deadlineOriginal?: string;
  deadlineTimezone?: string;
  deadlinePrecision?: 'exact' | 'day' | 'range' | 'approximate' | 'conditional';
  confidenceBreakdown?: ConfidenceBreakdown;
  priority?: CommitmentPriority;
  importanceScore?: number; // 0-100
  importanceExplanation?: string;
  condition?: string;
  conditionStatus?: ConditionStatus;
  dependencies?: string[];
  language?: 'en' | 'hi' | 'hinglish' | 'other';
  status?: CommitmentStatus;
  evidenceSpan?: EvidenceSpan;
  followUpQuestions?: FollowUpQuestion[];
  contradictions?: ContradictionAlert[];
  history?: CommitmentHistoryEvent[];

  // Workspace Sync & Task fields:
  calendarSync?: CalendarSyncInfo;
  notesExport?: NotesExportInfo;
  linkedTask?: LinkedTask;
  duplicateInfo?: DuplicateInfo;
  conflictCheck?: ConflictCheckInfo;
  suggestedDeadline?: SuggestedDeadlineInfo;
  recurrence?: RecurrencePattern;

  // New Intelligent Accountability & Lifecycle fields:
  reminders?: SmartReminder[];
  recoveryPlan?: OverdueRecoveryPlan;
  reschedulingSuggestion?: ReschedulingSuggestion;
  deadlineRisk?: DeadlineRisk;
  dependencyNode?: DependencyNode;
  multiAgentVerification?: MultiAgentVerification;
  autonomousProposals?: AutonomousAgentProposal[];
  chainName?: string;
  chainId?: string;
  estimatedHours?: number;
  completionTimestamp?: string;

  // Module B & C fields
  category?: 'technical' | 'product' | 'legal' | 'operations' | 'client';
  acknowledgment?: AcknowledgmentStatus;
  delegation?: DelegationRecord;
  sourceType?: 'call_transcript' | 'email' | 'chat' | 'document';
  isRedacted?: boolean;
}

// Module A: Promise-to-Action Conversion Metrics
export interface ConversionMetrics {
  detectedCount: number;
  actionableTaskCount: number;
  completedCount: number;
  detectedToTaskRate: number; // %
  taskToCompletionRate: number; // %
  overallCompletionRate: number; // %
}

// Module A: Commitment Streaks
export interface CommitmentStreak {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string;
  rescheduledProtections: number;
  explanation: string;
}

// Module C: Personal Reliability Score
export interface ReliabilityScore {
  score: number; // 0-100
  onTimeRate: number;
  overallCompletionRate: number;
  overdueRate: number;
  reschedulingFrequency: number;
  consistencyScore: number;
  formulaDescription: string;
  sampleSize: number;
}

// Module C: Weekly Accountability Review
export interface WeeklyAccountabilityReview {
  reportingWeek: string;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  rescheduledCount: number;
  conversionRate: number;
  reliabilityTrend: 'improving' | 'stable' | 'declining';
  keyHighlights: string[];
  aiRecommendations: string[];
}

// Module C: Commitment Load Forecast
export interface WorkloadDayForecast {
  date: string;
  label: string;
  totalEstimatedHours: number;
  capacityHours: number;
  isOverloaded: boolean;
  commitments: Array<{ id: string; title: string; priority: string; hours: number }>;
}

// Module D: Commitment Chain
export interface CommitmentChain {
  id: string;
  name: string;
  stepIds: string[];
  currentStepIndex: number;
  criticalPath: boolean;
}

// Module D: Learned Work Pattern
export interface LearnedWorkPattern {
  preferredReminderTimes: string[];
  preferredPlanningWindow: 'morning' | 'afternoon' | 'evening';
  averageTaskDurationMin: number;
  commonRescheduleDay: string;
  enabled: boolean;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  startSec: number;
  endSec: number;
}

export interface ConversationSummary {
  keyDecisions: string[];
  commitmentsSummary: string[];
  actionItems: Array<{ task: string; owner: string; deadline: string }>;
  unresolvedQuestions: string[];
  blockersAndRisks: string[];
  nextSteps: string[];
}

export interface IntegrationHubStatus {
  googleCalendarConnected: boolean;
  googleKeepConnected: boolean;
  googleTasksConnected: boolean;
  lastGlobalSync: string;
  failedOperations: FailedOperationRecord[];
}

export interface PlatformAnalytics {
  metrics: ConversionMetrics;
  streak: CommitmentStreak;
  reliability: ReliabilityScore;
  weeklyReview: WeeklyAccountabilityReview;
  workloadForecast: WorkloadDayForecast[];
  chains: CommitmentChain[];
  learnedPatterns: LearnedWorkPattern;
}

// Module B: People, Ownership, and Collaboration
export type AcknowledgmentStatus = 'pending' | 'acknowledged' | 'disputed';

export interface DelegationRecord {
  isDelegated: boolean;
  delegatedTo?: string;
  delegatedBy?: string;
  delegatedAt?: string;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
}

export interface FollowUpMessageDraft {
  recipient: string;
  recipientEmail?: string;
  subject: string;
  body: string;
  tone: 'polite_reminder' | 'urgent_escalation' | 'casual_sync';
}

export interface TeamMemberRaci {
  name: string;
  role: string;
  avatarSeed?: string;
  responsible: string[];
  accountable: string[];
  consulted: string[];
  informed: string[];
}

export interface SharedBoardPermission {
  boardName: string;
  accessLevel: 'viewer' | 'editor' | 'owner';
  sharedWith: string[];
}

// Module C: Privacy, Security, and Consent
export interface ConsentPolicy {
  recordingConsentObtained: boolean;
  jurisdiction: 'two_party_wiretap' | 'one_party' | 'gdpr_enterprise';
  consentTimestamp?: string;
  localOnlyProcessing: boolean;
  redactionEnabled: boolean;
  sensitiveTermsRedactedCount: number;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  action:
    | 'export_data'
    | 'delete_commitment'
    | 'view_transcript'
    | 'modify_deadline'
    | 'consent_granted'
    | 'redaction_applied'
    | 'local_mode_toggled';
  actor: string;
  details: string;
  severity: 'info' | 'warning' | 'security';
}

export interface DataRetentionSetting {
  retentionDays: number; // 7, 30, 90, 365
  autoPurgeTranscripts: boolean;
  autoPurgeAudio: boolean;
  rightToDeleteExercised: boolean;
  lastPurgeDate?: string;
}

// Module D: Analytics Heatmaps & Accuracy
export interface HeatmapHourSlot {
  hour: number;
  count: number;
  riskCount: number;
}

export interface CommitmentHeatmapDay {
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  slots: HeatmapHourSlot[];
}

export interface CommitmentCategoryBreakdown {
  category: 'technical' | 'product' | 'legal' | 'operations' | 'client';
  count: number;
  onTimeRate: number;
  color: string;
}

// Module F: Digital Twin, Copilot & What-If Simulator
export interface DigitalTwinState {
  activeCount: number;
  highRiskCount: number;
  unresolvedDependencies: number;
  nextCriticalDeadline?: string;
  totalEstimatedCognitiveHours: number;
  systemHealth: 'optimal' | 'warning' | 'congested';
}

export interface CopilotCitation {
  source: string;
  quote: string;
  commitmentId?: string;
  speaker?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: CopilotCitation[];
  timestamp: string;
}

export interface WhatIfSimulation {
  targetCommitmentId: string;
  daysShifted: number;
  newConflictsCount: number;
  downstreamChainsAffected: number;
  streakImpact: 'streak_safe' | 'streak_at_risk';
  summary: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'person' | 'commitment' | 'date' | 'condition';
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
  relationship: 'owes_to' | 'depends_on' | 'due_on' | 'blocked_by';
}

export interface CommitmentResponse {
  commitments: CommitmentItem[];
  segments?: TranscriptSegment[];
  summary?: ConversationSummary;
  contradictions?: ContradictionAlert[];
  languageDetected?: string;
  integrationHub?: IntegrationHubStatus;
  analytics?: PlatformAnalytics;
  consentPolicy?: ConsentPolicy;
  securityAuditTrail?: SecurityAuditEvent[];
}
