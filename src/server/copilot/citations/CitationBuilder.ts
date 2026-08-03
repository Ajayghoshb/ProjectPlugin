import { CopilotCitation } from '../models/copilot.models';
import { VectorSearchResult } from '../../knowledge/models/knowledge.models';

export class CitationBuilder {
  public static buildCitations(results: VectorSearchResult[]): CopilotCitation[] {
    return results.map((r, idx) => ({
      id: idx + 1,
      meetingId: r.chunk.meetingId,
      meetingTitle: r.chunk.meetingSubject,
      date: r.chunk.metadata.date || 'JUL 2026',
      section: r.chunk.section,
      snippet: r.chunk.content.slice(0, 150) + '...'
    }));
  }
}
