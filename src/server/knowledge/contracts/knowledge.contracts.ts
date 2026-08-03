import { KnowledgeDocument, KnowledgeChunk, VectorSearchResult, RAGContext } from '../models/knowledge.models';

export interface IVectorStore {
  saveVector(chunk: KnowledgeChunk, embedding: number[]): Promise<boolean>;
  searchVectors(queryEmbedding: number[], topK?: number, filters?: any): Promise<VectorSearchResult[]>;
}

export interface IChunker {
  generateChunks(document: KnowledgeDocument): KnowledgeChunk[];
}

export interface ISemanticSearch {
  search(query: string, filters?: any): Promise<VectorSearchResult[]>;
}

export interface IRAGBuilder {
  buildContext(query: string, maxTokens?: number): Promise<RAGContext>;
}
