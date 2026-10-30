export interface SampleTranscript {
  id: string;
  name: string;
  category: string;
  duration: string;
  description: string;
  transcript: string;
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    id: 'client-pitch',
    name: 'Executive Client Pitch & Q4 Review',
    category: 'Business',
    duration: '4m 12s',
    description: 'Conversation between Sarah (Product Lead) and John (Client VP) finalizing Q4 deliverables and next steps.',
    transcript: `Sarah: Hey John, thanks for jumping on the phone today. I wanted to quickly align on the Q4 roadmap presentation.
John: Hey Sarah! Absolutely. I reviewed the draft deck you sent over yesterday. Overall it looks great, but we definitely need more financial modeling around the enterprise tier.
Sarah: Understood. I will send over the updated financial sensitivity models by tomorrow at 4 PM so your finance team can inspect the numbers.
John: Perfect. And let's meet on Friday, October 30th at 10:00 AM PST with the executive committee to walk through the revised slides together.
Sarah: Sounds great, I'll put that on our calendars. Also, don't forget to send me the signed mutual NDA for our new sub-processors before the meeting.
John: Yes, I promise to have our legal counsel sign and return the NDA by Thursday morning.
Sarah: Fantastic. One last thing—I need to finish updating the product roadmap diagram in Figma before our team sync next week, but I'll make sure it's wrapped up.
John: Awesome, thanks Sarah. Talk soon!`
  },
  {
    id: 'sprint-standup',
    name: 'Engineering Sprint & Hotfix Standup',
    category: 'Engineering',
    duration: '3m 28s',
    description: 'Call between Marcus (Senior Engineer) and Priya (Engineering Manager) coordinating release fixes.',
    transcript: `Priya: Hey Marcus, did we get clarity on the database connection pool leak reported in production?
Marcus: Yeah, I reproduced it locally. It's an issue with unclosed pooled connections during socket timeouts. I will push a hotfix branch and open a pull request by today at 5:00 PM.
Priya: Great. As soon as you open it, I'll review and approve the PR so we can deploy to staging tonight.
Marcus: Sounds like a plan. Also, we need to schedule a retrospective with the DevOps team. Let's meet on Monday, November 2nd at 2:00 PM to review our alert thresholds.
Priya: Done, adding it to the agenda. Don't forget to update the incident timeline documentation in Notion before that meeting.
Marcus: Will do. I also need to order backup hardware tokens for the on-call rotation this week.
Priya: Thanks Marcus, keep me posted once the branch is up!`
  },
  {
    id: 'sales-enterprise',
    name: 'Enterprise Contract & Pilot Negotiation',
    category: 'Sales',
    duration: '5m 05s',
    description: 'Call between Jordan (Account Exec) and David (Procurement Director) closing a software license.',
    transcript: `Jordan: Hello David, thanks for taking the call. I understand your security audit team had three follow-up questions regarding SOC2 compliance.
David: That's right Jordan. Our CISO wants clarity on multi-tenant data isolation and encryption at rest.
Jordan: I promise to email the complete SOC2 Type II compliance package and pen-test summary to your security team by tomorrow at 11:00 AM.
David: Excellent. If those check out, let's meet on Friday at 3:30 PM to negotiate the final enterprise multi-year discount.
Jordan: I'll prepare the revised pricing tiers with the volume discounts ready for that discussion. 
David: Please don't forget to include the SLA penalty clauses in the rider agreement draft.
Jordan: I will have our commercial legal team draft the custom SLA addendum and attach it.
David: Appreciate the fast turnaround Jordan.`
  },
  {
    id: 'contractor-home',
    name: 'Residential Renovation & Site Inspection',
    category: 'Personal',
    duration: '2m 45s',
    description: 'Call between Homeowner Elena and General Contractor Mark coordinating architectural permits and inspection.',
    transcript: `Elena: Hi Mark, did the city inspector approve our architectural framing permits?
Mark: Hi Elena! Yes, the permit came through this morning. I will pick up the physical permits from City Hall tomorrow morning.
Elena: That's a huge relief! When can we do the walkthrough?
Mark: Let's meet at the job site on Tuesday, November 3rd at 9:00 AM to inspect the plumbing rough-in with the subcontractor.
Elena: Perfect. I will bring the check for the milestone 2 payment to that meeting.
Mark: Great. Don't forget to finalize your kitchen cabinet hardware selections so we can order them before the lead time cutoff.
Elena: I'll browse the samples tonight and compile our list. Thanks Mark!`
  },
  {
    id: 'hinglish-delivery',
    name: 'Product Delivery & Client Review (Hinglish / Hindi)',
    category: 'Multilingual',
    duration: '3m 15s',
    description: 'Bilingual conversation in Hinglish/English with code-switching, conditional commitments, and Indian regional phrasing.',
    transcript: `Amit: Rahul, client presentation ke liye UI deck ready hai kya?
Rahul: Haan Amit, main Friday tak final presentation deck prepare kar dunga.
Amit: Bohot badhiya. Lekin client agar budget approve karega, tabhi hum additional backend compute proceed karenge.
Rahul: Samjh gaya. Client approve karega toh main cloud cluster scale-up schedule kar dunga.
Amit: Kal tak wireframes ka initial draft bhej sakte ho kya Sarah ko?
Rahul: Haan, kal shaam 5 baje tak initial draft Sarah ko email kar dunga.
Amit: Perfect. Aur let's meet on Monday, November 2nd at 11:00 AM to review sprint velocity with the team.
Rahul: Done. Main Monday meeting se pehle velocity charts update kar dunga.`
  },
  {
    id: 'contradiction-security',
    name: 'Security Audit & Revision (Contradiction & Dependencies)',
    category: 'Engineering',
    duration: '4m 30s',
    description: 'Call demonstrating conditional commitments, deadline revision, and contradiction detection between earlier and later statements.',
    transcript: `Elena: Marcus, can you deliver the customer data encryption module by Friday?
Marcus: Yes, I will deliver the encryption module by Friday, October 30th at 5:00 PM if the security keys are provisioned on time.
Elena: Great, our compliance audit is riding on this. Also, please review the API specs with devops.
Marcus: Actually wait Elena, I just checked Slack—our cloud infrastructure team delayed the HSM key vault provisioning until the weekend. So I won't be able to deliver on Friday. Instead, I will definitely deliver the completed encryption module on next Tuesday, November 3rd at 11:00 AM.
Elena: Understood, thanks for flagging the blocker. Don't forget to update the audit tracker in Jira.`
  },
  {
    id: 'recurring-sync',
    name: 'Recurring Cadence & Schedule Audit',
    category: 'Operations',
    duration: '3m 45s',
    description: 'Call demonstrating recurring commitments ("every Friday"), duplicate verbal commitments, and calendar conflict detection.',
    transcript: `Alex: Hey Taylor, let's establish a regular reporting cadence for the client deliverables.
Taylor: Great idea Alex. I will send the executive progress report every Friday at 10:00 AM.
Alex: Perfect. Also, we will review the sprint metrics on the first Monday of each month with the leadership team.
Taylor: Confirmed. And as I mentioned earlier, I will send the executive progress report every Friday to make sure everyone is aligned.
Alex: Awesome. Also, I need to finalize the quarterly budget spreadsheet sometime soon.
Taylor: Sounds good. Let's make sure it's on track!`
  }
];
