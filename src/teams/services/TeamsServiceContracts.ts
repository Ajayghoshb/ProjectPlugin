export interface IAuthenticationService {
  acquireSSOToken(): Promise<string | null>;
  getUserProfile(): Promise<any>;
}

export interface IGraphService {
  queryGraph(endpoint: string, options?: any): Promise<any>;
}

export interface IMeetingService {
  getMeetingContext(): Promise<any>;
  joinMeeting(meetingId: string): Promise<boolean>;
}

export interface INotificationService {
  sendTeamsNotification(message: string, targetUser: string): Promise<boolean>;
}

export interface IBotService {
  sendMessageToBot(text: string): Promise<boolean>;
}

export interface IRecordingService {
  startRecording(): Promise<boolean>;
  stopRecording(): Promise<boolean>;
}

export interface IAIService {
  generateMeetingIntelligence(transcript: string): Promise<any>;
}

export interface ITranslationService {
  translateDialogue(text: string, targetLanguage: string): Promise<string>;
}

export interface IDocumentService {
  generateMOMDocument(meetingId: string, format: 'PDF' | 'DOCX' | 'MD' | 'TXT'): Promise<Blob | null>;
}
