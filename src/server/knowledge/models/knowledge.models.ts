export interface KnowledgeChunk {
  id: string;
  documentId: string;
  meetingId: string;
  meetingSubject: string;
  section: 'EXECUTIVE_SUMMARY' | 'DETAILED_SUMMARY' | 'MOM' | 'ACTION_ITEMS' | 'DECISIONS' | 'RISKS' | 'TRANSCRIPT';
  content: string;
  tokenCount: number;
  sequenceIndex: number;
  metadata: {
    projectName?: string;
    organizer?: string;
    date?: string;
    language?: string;
    tags?: string[];
  };
  embedding?: number[];
}

export interface KnowledgeDocument {
  id: string;
  meetingId: string;
  title: string;
  projectName?: string;
  organizer: string;
  date: string;
  executiveSummary: string;
  detailedSummary: string;
  mom: string;
  actionItems: any[];
  decisions: any[];
  risks: any[];
  transcriptText: string;
  chunks: KnowledgeChunk[];
  indexedAt: string;
}

export interface VectorSearchResult {
  chunk: KnowledgeChunk;
  similarityScore: number;
}

export interface RAGContext {
  query: string;
  retrievedChunks: KnowledgeChunk[];
  formattedContext: string;
  totalTokens: number;
}

export interface KnowledgeMetrics {
  totalDocumentsIndexed: number;
  totalChunksCreated: number;
  totalEmbeddingsGenerated: number;
  averageSearchTimeMs: number;
  cacheHitRatio: number;
}
