export class PromptTemplates {
  public static readonly VERSION = '1.2.0';

  public static getExecutiveSummaryPrompt(transcript: string): string {
    return `You are a Principal AI Meeting Intelligence Analyst. Analyze the following meeting transcript and produce a high-level Executive Summary (2-3 sentences max) highlighting core business outcomes.\n\nTRANSCRIPT:\n${transcript}`;
  }

  public static getMOMPrompt(transcript: string): string {
    return `You are an Executive Assistant. Draft formal Minutes of Meeting (MOM) based on the transcript below, covering Meeting Details, Objective, Key Discussion Topics, Decisions, and Action Items.\n\nTRANSCRIPT:\n${transcript}`;
  }

  public static getActionItemsPrompt(transcript: string): string {
    return `Extract all actionable tasks from the transcript below. Return a valid JSON array of objects with properties: text (string), assignee (string), priority ('HIGH' | 'MED' | 'LOW'), dueDate (string).\n\nTRANSCRIPT:\n${transcript}`;
  }

  public static getDecisionsPrompt(transcript: string): string {
    return `Identify all explicit decisions agreed upon in the transcript below. Return a valid JSON array of objects with properties: text (string), category (string), impact ('HIGH' | 'MED' | 'LOW').\n\nTRANSCRIPT:\n${transcript}`;
  }

  public static getReasoningPrompt(summary: string, decisions: string[]): string {
    return `Analyze the following meeting summary and decisions for operational risks, unresolved questions, and cross-project dependencies.\n\nSUMMARY:\n${summary}\n\nDECISIONS:\n${JSON.stringify(decisions)}`;
  }
}
