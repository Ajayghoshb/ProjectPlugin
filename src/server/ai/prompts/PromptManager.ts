import { PromptTemplates } from './PromptTemplates';

export class PromptManager {
  public static getPrompt(type: 'EXECUTIVE_SUMMARY' | 'MOM' | 'ACTION_ITEMS' | 'DECISIONS' | 'REASONING', payload: any): string {
    switch (type) {
      case 'EXECUTIVE_SUMMARY':
        return PromptTemplates.getExecutiveSummaryPrompt(payload.transcript || '');
      case 'MOM':
        return PromptTemplates.getMOMPrompt(payload.transcript || '');
      case 'ACTION_ITEMS':
        return PromptTemplates.getActionItemsPrompt(payload.transcript || '');
      case 'DECISIONS':
        return PromptTemplates.getDecisionsPrompt(payload.transcript || '');
      case 'REASONING':
        return PromptTemplates.getReasoningPrompt(payload.summary || '', payload.decisions || []);
      default:
        return payload.transcript || '';
    }
  }

  public static getVersion(): string {
    return PromptTemplates.VERSION;
  }
}
