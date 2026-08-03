import { KnowledgeDocument } from '../models/knowledge.models';

export class KnowledgeDocumentBuilder {
  public static buildFromMeeting(meeting: any): KnowledgeDocument {
    const docId = `doc-${meeting.id}`;

    return {
      id: docId,
      meetingId: meeting.id,
      title: meeting.title || meeting.subject || 'Meeting Document',
      projectName: meeting.projectName || 'Enterprise Workspace',
      organizer: meeting.organizer || 'Sarah Connor',
      date: meeting.date || new Date().toISOString(),
      executiveSummary: meeting.executiveSummary || meeting.summary || '',
      detailedSummary: meeting.detailedSummary || meeting.summary || '',
      mom: meeting.summary || '',
      actionItems: meeting.actionItems || [],
      decisions: meeting.keyDecisions || [],
      risks: meeting.risks || [],
      transcriptText: (meeting.transcript || []).map((t: any) => `${t.speaker}: ${t.translatedText || t.text}`).join('\n'),
      chunks: [],
      indexedAt: new Date().toISOString()
    };
  }
}
