import { CommitmentItem } from './types';

// Convert ISO string to Google Calendar format: YYYYMMDDTHHmmssZ
export function formatGoogleCalendarDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return '20261030T150000Z';
    }
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  } catch {
    return '20261030T150000Z';
  }
}

// Compute end time (default 45 min or 1 hour after start)
export function getEndTimeGoogleCalendar(dateStr: string, durationMinutes = 60): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return '20261030T160000Z';
    }
    const end = new Date(d.getTime() + durationMinutes * 60 * 1000);
    return end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  } catch {
    return '20261030T160000Z';
  }
}

// Feature 7: Calendar Event Enrichment
export function buildEnrichedGoogleCalendarUrl(item: CommitmentItem): string {
  const start = item.date_time ? formatGoogleCalendarDate(item.date_time) : '20261030T150000Z';
  const end = item.date_time ? getEndTimeGoogleCalendar(item.date_time) : '20261030T160000Z';
  const text = encodeURIComponent(item.title);

  const recurrenceRule = item.recurrence?.rruleText ? `&recur=${encodeURIComponent(item.recurrence.rruleText)}` : '';

  // Rich formatted description with metadata, quote, and deep link
  const enrichedDescription = [
    `📌 ACTION COMMITMENT: ${item.title}`,
    `👤 OWNER: ${item.owner || 'Unassigned'}`,
    `👥 PARTICIPANT / BENEFICIARY: ${item.waitingPerson || 'Team'}`,
    `⏱️ DEADLINE: ${item.deadlineOriginal || (item.date_time ? new Date(item.date_time).toLocaleString() : 'Open')}`,
    `⚡ PRIORITY: ${(item.priority || 'medium').toUpperCase()} (Score: ${item.importanceScore || 70}/100)`,
    `🎯 CLASSIFICATION: ${(item.classification || 'committed').toUpperCase()}`,
    item.condition ? `⚠️ PREREQUISITE: ${item.condition} (Status: ${item.conditionStatus || 'pending'})` : null,
    item.recurrence?.humanSummary ? `🔁 RECURRENCE: ${item.recurrence.humanSummary}` : null,
    ``,
    `💬 VERBATIM TRANSCRIPT EVIDENCE:`,
    `"${item.originalText || item.description}"`,
    ``,
    `---`,
    `Synced via CommitmentOS_V2 • Confidence: ${Math.round(item.confidence_score * 100)}%`,
    `Originating Commitment ID: ${item.id}`,
    `Origin: ${typeof window !== 'undefined' ? window.location.origin : 'https://commitmentos.v2'}`,
  ]
    .filter(Boolean)
    .join('\n');

  const details = encodeURIComponent(enrichedDescription);
  const location = encodeURIComponent('Phone Call Action Follow-up');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}${recurrenceRule}`;
}

export function buildGoogleCalendarUrl(item: CommitmentItem): string {
  return buildEnrichedGoogleCalendarUrl(item);
}

// Generate enriched .ICS calendar file with recurrence and enriched description
export function generateIcsFile(item: CommitmentItem): void {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = item.date_time ? formatGoogleCalendarDate(item.date_time) : '20261030T150000Z';
  const end = item.date_time ? getEndTimeGoogleCalendar(item.date_time) : '20261030T160000Z';

  const cleanTitle = item.title.replace(/[\\;,\n]/g, ' ');
  const cleanDesc = [
    `ACTION: ${cleanTitle}`,
    `OWNER: ${item.owner || 'Unassigned'}`,
    `WAITING: ${item.waitingPerson || 'Team'}`,
    `CONFIDENCE: ${Math.round(item.confidence_score * 100)}%`,
    `EVIDENCE: "${(item.originalText || item.description).replace(/[\\;,\n]/g, ' ')}"`,
    item.condition ? `CONDITION: ${item.condition}` : '',
  ]
    .filter(Boolean)
    .join(' \\n ');

  const rruleLine = item.recurrence?.rruleText ? `RRULE:${item.recurrence.rruleText}\r\n` : '';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CommitmentOS_V2//Enhanced Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:commitment-${item.id || Date.now()}@commitmentos.v2`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    rruleLine.trim(),
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:Call Follow-up`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Feature 2: Smart Notes & Keep Export Formatter
export function buildFormattedNoteContent(item: CommitmentItem): string {
  return [
    `# [CommitmentOS_V2] ${item.title}`,
    `**Status:** ${(item.status || 'Active').toUpperCase()} | **Priority:** ${(item.priority || 'Medium').toUpperCase()} | **Confidence:** ${Math.round(item.confidence_score * 100)}%`,
    ``,
    `### Responsibility & Timeline`,
    `- **Owner:** ${item.owner || 'Unassigned'}`,
    `- **Waiting Person:** ${item.waitingPerson || 'Team'}`,
    `- **Deadline:** ${item.deadlineOriginal || (item.date_time ? new Date(item.date_time).toLocaleString() : 'Open')}`,
    item.condition ? `- **Prerequisite Condition:** ${item.condition} (${item.conditionStatus || 'pending'})` : null,
    item.recurrence?.humanSummary ? `- **Recurrence:** ${item.recurrence.humanSummary}` : null,
    ``,
    `### Supporting Dialogue Evidence`,
    `> "${item.originalText || item.description}"`,
    ``,
    `### Action Items & Next Steps`,
    `- [ ] ${item.action || item.title}`,
    `- [ ] Verify completion with ${item.waitingPerson || 'stakeholder'}`,
    ``,
    `*Generated by CommitmentOS_V2 Intelligence Engine (Commitment ID: ${item.id})*`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function downloadJsonFile(data: any, filename = 'commitments-schema.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
