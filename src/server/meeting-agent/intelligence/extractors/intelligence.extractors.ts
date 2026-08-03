import { IntelligenceItem } from '../../models/agent.models';

export class DecisionExtractor {
  extractDecisions(text: string, speakerName: string): IntelligenceItem[] {
    const items: IntelligenceItem[] = [];
    const lower = text.toLowerCase();
    if (lower.includes("decided") || lower.includes("agreed") || lower.includes("approved")) {
      items.push({
        id: `dec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'DECISION',
        content: text,
        speakerName,
        confidenceScore: 0.96,
        detectedAt: new Date().toISOString()
      });
    }
    return items;
  }
}

export class ActionItemExtractor {
  extractActionItems(text: string, speakerName: string): IntelligenceItem[] {
    const items: IntelligenceItem[] = [];
    const lower = text.toLowerCase();
    if (lower.includes("will") || lower.includes("action item") || lower.includes("task") || lower.includes("assigned")) {
      items.push({
        id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'ACTION_ITEM',
        content: text,
        owner: speakerName,
        speakerName,
        confidenceScore: 0.94,
        detectedAt: new Date().toISOString()
      });
    }
    return items;
  }
}

export class RiskExtractor {
  extractRisks(text: string, speakerName: string): IntelligenceItem[] {
    const items: IntelligenceItem[] = [];
    const lower = text.toLowerCase();
    if (lower.includes("risk") || lower.includes("concern") || lower.includes("delay") || lower.includes("bottleneck")) {
      items.push({
        id: `risk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'RISK',
        content: text,
        speakerName,
        confidenceScore: 0.92,
        detectedAt: new Date().toISOString()
      });
    }
    return items;
  }
}

export class QuestionExtractor {
  extractQuestions(text: string, speakerName: string): IntelligenceItem[] {
    const items: IntelligenceItem[] = [];
    if (text.includes("?") || text.toLowerCase().includes("how do we") || text.toLowerCase().includes("what about")) {
      items.push({
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'QUESTION',
        content: text,
        speakerName,
        confidenceScore: 0.91,
        detectedAt: new Date().toISOString()
      });
    }
    return items;
  }
}

export const decisionExtractor = new DecisionExtractor();
export const actionItemExtractor = new ActionItemExtractor();
export const riskExtractor = new RiskExtractor();
export const questionExtractor = new QuestionExtractor();
