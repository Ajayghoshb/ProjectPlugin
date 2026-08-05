export interface JiraConnection {
  id: string;
  baseUrl: string;
  email: string;
  apiToken: string;
  selectedProjects: string[]; // List of project IDs or keys
}

export interface TeamsConnection {
  id: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  active: boolean;
}

export interface GoogleConnection {
  id: string;
  email: string;
  accessToken: string;
  active: boolean;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  lead: string;
  userStoriesCount: number;
  bugsCount: number;
  teamMembers: string[]; // Email or ID list
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Project Manager' | 'Product Owner' | 'Scrum Master' | 'Developer' | 'QA Engineer' | 'Business Analyst';
  avatar: string;
  active: boolean;
  presence: 'Available' | 'Busy' | 'Away' | 'Offline';
  projects: string[]; // Project IDs/Keys they belong to
}

export interface Meeting {
  id: string;
  title: string;
  organizer: string; // Name of organizer
  projectName: string;
  projectKey?: string; // Opt association key
  participants: string[]; // List of emails
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  type: 'Face-to-Face' | 'Online';
  roomDetails?: string; // Meeting room or location details for Face-to-Face format
  description?: string; // Optional meeting description or notes
  transcript?: string; // Full conversation dialog, speaker formatted
  transcriptEnglish?: string; // Translated conversation if original was non-English
  originalLanguage?: string; // Auto-detected spoken language
  summary?: string; // Minutes of Meeting (MoM) summary text
  mainPoints?: string[]; // Bulleted lists of key takeaways
  actionItems?: string[]; // Target key action items identified
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'current-user' or member email/ID
  receiverId: string; // member ID/email
  message: string;
  timestamp: string; // ISO
}

export interface JiraEmailMapping {
  id: string;
  displayName: string;
  emailAddress: string;
}

export interface CustomMeetingReport {
  id: string;
  meetingName: string;
  uploadDate: string;
  processingDate: string;
  aiProviderUsed: string;
  processingTimeMs: number;
  status: 'COMPLETED' | 'PROCESSING' | 'ERROR';
  fileNames: string[];
  fileTypes: string[];
  keywords: string[];
  tags: string[];
  summary?: string;
  executiveSummary?: string;
  mom?: string;
  actionItems?: { owner: string; title: string; priority: 'Low' | 'Medium' | 'High'; deadline: string; status: 'Pending' | 'In Progress' | 'Completed' }[];
  decisions?: { decision: string; impact: string; owner: string }[];
  risks?: { risk: string; severity: 'Low' | 'Medium' | 'High'; mitigation: string }[];
  detailedConversation?: { topic: string; discussion: string; decision: string; conclusion: string }[];
  timeline?: { timestamp: string; speaker: string; topic: string; summary: string }[];
  recommendations?: { category: string; suggestion: string; action: string }[];
  rawTranscript?: string;
}

export interface DbSchema {
  jiraConnections: JiraConnection[];
  teamsConnections: TeamsConnection[];
  googleConnections: GoogleConnection[];
  projects: Project[];
  members: TeamMember[];
  meetings: Meeting[];
  chats: ChatMessage[];
  jiraEmailMappings?: JiraEmailMapping[];
  customReports?: CustomMeetingReport[];
}

export type RoleType = 'Admin' | 'Manager' | 'Member';
