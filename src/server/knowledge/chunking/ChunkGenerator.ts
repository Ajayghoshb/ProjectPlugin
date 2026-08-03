import { KnowledgeDocument, KnowledgeChunk } from '../models/knowledge.models';

export class ChunkGenerator {
  public static generateChunks(doc: KnowledgeDocument): KnowledgeChunk[] {
    const chunks: KnowledgeChunk[] = [];
    let seq = 0;

    if (doc.executiveSummary) {
      chunks.push({
        id: `chk-${doc.id}-${seq++}`,
        documentId: doc.id,
        meetingId: doc.meetingId,
        meetingSubject: doc.title,
        section: 'EXECUTIVE_SUMMARY',
        content: doc.executiveSummary,
        tokenCount: Math.round(doc.executiveSummary.length / 4),
        sequenceIndex: seq,
        metadata: { projectName: doc.projectName, organizer: doc.organizer, date: doc.date }
      });
    }

    if (doc.detailedSummary) {
      chunks.push({
        id: `chk-${doc.id}-${seq++}`,
        documentId: doc.id,
        meetingId: doc.meetingId,
        meetingSubject: doc.title,
        section: 'DETAILED_SUMMARY',
        content: doc.detailedSummary,
        tokenCount: Math.round(doc.detailedSummary.length / 4),
        sequenceIndex: seq,
        metadata: { projectName: doc.projectName, organizer: doc.organizer, date: doc.date }
      });
    }

    if (doc.transcriptText) {
      const paragraphs = doc.transcriptText.split('\n');
      paragraphs.forEach((p, idx) => {
        if (p.trim().length > 10) {
          chunks.push({
            id: `chk-${doc.id}-tr-${idx}`,
            documentId: doc.id,
            meetingId: doc.meetingId,
            meetingSubject: doc.title,
            section: 'TRANSCRIPT',
            content: p,
            tokenCount: Math.round(p.length / 4),
            sequenceIndex: seq++,
            metadata: { projectName: doc.projectName, organizer: doc.organizer, date: doc.date }
          });
        }
      });
    }

    return chunks;
  }
}
