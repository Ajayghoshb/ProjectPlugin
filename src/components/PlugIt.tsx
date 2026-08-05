import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { 
  Radio, 
  User, 
  AlertTriangle, 
  CheckCircle2,
  Sliders, 
  Cpu, 
  Unlock, 
  Lock, 
  Zap, 
  Save, 
  FileArchive, 
  Download, 
  ClipboardList, 
  Sparkles, 
  Server, 
  RefreshCw,
  Clock,
  ArrowRight,
  Terminal,
  Play,
  Pause,
  Square,
  Check,
  Eye,
  X,
  Code,
  Copy,
  FileJson,
  Settings,
  Search,
  LayoutGrid,
  List,
  FolderPlus,
  MessageSquare,
  Folder,
  Plus,
  Trash2,
  Volume2,
  Calendar,
  Users,
  FileText
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

import CollectionTab, { CollectionItem } from './PlugIt/CollectionTab';
import SettingsTab from './PlugIt/SettingsTab';
import CustomReportModule from './CustomReportModule';

export default function PlugIt() {
  // Navigation / Tab state: Collection, Settings, Custom Report
  const [activeTab, setActiveTab] = useState<'collection' | 'settings' | 'custom-report'>('collection');

  useEffect(() => {
    if (window.location.hash.includes('custom-report')) {
      setActiveTab('custom-report');
    }
  }, []);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('q3-strategy-2026');

  // Initial collection list with realistic Teams meeting recordings & data
  const [collections, setCollections] = useState<CollectionItem[]>([
    {
      id: 'q3-strategy-2026',
      title: 'Q3 Enterprise Strategy & Scaling',
      projectName: 'BlueLink Rest Hours (BRH)',
      type: 'analytics',
      status: 'COMPLETED',
      organizer: 'Sarah Chen',
      organizerEmail: 'sarah.chen@company.com',
      date: 'JUL 29, 2026',
      time: '02:30 PM',
      rawTimestamp: '2026-07-29T14:30:00Z',
      duration: '48m 15s',
      teamsMeetingId: 'M365-88492-MS',
      fileSize: '210 MB',
      confidenceScore: 99.2,
      sentiment: 'Action-Oriented',
      recordingStatus: 'Available',
      aiStatus: 'Processed (Llama 3.3 70B)',
      detectedLanguage: 'English (US)',
      originalLanguage: 'English',
      hasTranslation: true,
      topics: ['#AzureAD', '#Q3Targets', '#TeamsWebhook', '#EnterpriseScaling'],
      aiModel: 'meta/llama-3.3-70b-instruct',
      translationEngine: 'NVIDIA Riva Translation',
      nemotronReady: true,
      executiveSummary: "Executive strategy session approving multi-tenant Teams bot provisioning in Azure AD, allocating $45,000 infrastructure expansion budget, and scheduling ISO 27001 audit pre-checks.",
      detailedSummary: "The executive team evaluated Q3 growth targets and technical dependencies. Marketing lead volume increased by 18%, requiring deeper API integration into client M365 tenants. DevOps confirmed Azure webhooks are handling 2,500 req/min with TLS 1.3 encryption. The Teams Bot Manifest was updated to v1.15 schema with explicit OnlineMeetings.ReadWrite scopes.",
      summary: "Executive strategy session aligning Q3 growth metrics, Azure Graph API tenant authorization workflows, multi-tenant Teams bot deployment timelines, and automated meeting recording ingestion.",
      keyHighlights: [
        'Marketing lead volume increased by 18% month-over-month.',
        'Azure webhooks scaling smoothly at 2,500 req/min under 15ms latency.',
        'Manifest schema v1.15 validated for Microsoft Teams Admin Center.'
      ],
      keyDiscussionPoints: [
        'API rate limits & multi-tenant throttling in Microsoft Graph.',
        'Budget allocation for automated meeting transcript indexing.',
        'Security compliance timeline for ISO 27001 & SOC2 audits.'
      ],
      keyDecisions: [
        { id: 'dec-1', text: 'Approved Azure AD Multi-Tenant Bot provisioning for enterprise clients.', impact: 'HIGH', category: 'Architecture' },
        { id: 'dec-2', text: 'Allocated $45,000 budget for automated meeting transcript indexing infrastructure.', impact: 'HIGH', category: 'Finance' },
        { id: 'dec-3', text: 'Targeting November 15 for ISO 27001 & SOC2 compliance certification audit.', impact: 'MED', category: 'Security' }
      ],
      actionItems: [
        { id: 'item-1', text: 'Approve final budget allocation for Azure API Gateway expansion', completed: true, assignee: 'Sarah Chen', priority: 'HIGH', dueDate: '2026-08-01' },
        { id: 'item-2', text: 'Finalize Azure Graph API scopes config & manifest schema v1.15', completed: false, assignee: 'Alex Rivera', priority: 'HIGH', dueDate: '2026-08-05' },
        { id: 'item-3', text: 'Roll out automated PDF meeting digest templates for enterprise clients', completed: false, assignee: 'Elena Rostova', priority: 'MED', dueDate: '2026-08-10' },
        { id: 'item-4', text: 'Schedule ISO 27001 audit pre-check with David Park', completed: false, assignee: 'David Park', priority: 'MED', dueDate: '2026-08-15' }
      ],
      risks: [
        { id: 'risk-1', risk: 'Azure Graph API throttling during peak morning hours.', mitigation: 'Implement exponential backoff retry queues.', severity: 'HIGH' },
        { id: 'risk-2', risk: 'Delays in ISO 27001 admin consent documentation.', mitigation: 'Assign dedicated compliance analyst for pre-checks.', severity: 'MED' }
      ],
      questionsRaised: [
        { id: 'q-1', question: 'Does the manifest ZIP pass automated validation in Teams Admin Center?', askedBy: 'Marcus Vance', answered: true },
        { id: 'q-2', question: 'What is the maximum latency for NVIDIA Riva translation streaming?', askedBy: 'Elena Rostova', answered: true }
      ],
      suggestions: [
        'Cache recurring attendee avatars to speed up meeting detail rendering.',
        'Add automated Slack notification triggers when MOM exports are finalized.'
      ],
      followUpTasks: [
        'Review Graph API quota expansion with Microsoft Partner team.',
        'Validate PDF meeting summary template alignment on mobile viewports.'
      ],
      timeline: [
        { time: '00:04', title: 'Call Commencement & Q3 Target Overview', description: 'Sarah Chen welcomed participants and reviewed Q3 metrics.', speaker: 'Sarah Chen' },
        { time: '00:21', title: 'DevOps & Webhook Performance Audit', description: 'Alex Rivera presented telemetry metrics for Azure webhooks.', speaker: 'Alex Rivera' },
        { time: '00:42', title: 'Manifest Schema v1.15 Review', description: 'Marcus Vance confirmed scope additions for meeting read/write permissions.', speaker: 'Marcus Vance' },
        { time: '01:10', title: 'Client Feedback & Document Export Discussion', description: 'Elena Rostova shared client requests for PDF meeting digests.', speaker: 'Elena Rostova' }
      ],
      participantsCount: 5,
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80'
      ],
      participantsList: [
        { name: 'Sarah Chen', role: 'Product Lead (Organizer)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', email: 'sarah.chen@company.com', joinTime: '02:30 PM', endTime: '03:18 PM' },
        { name: 'Alex Rivera', role: 'Senior DevOps Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', email: 'alex.rivera@company.com', joinTime: '02:30 PM', endTime: '03:18 PM' },
        { name: 'Elena Rostova', role: 'Client Success Director', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80', email: 'elena.r@company.com', joinTime: '02:32 PM', endTime: '03:18 PM' },
        { name: 'Marcus Vance', role: 'Enterprise Architect', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80', email: 'marcus.v@company.com', joinTime: '02:30 PM', endTime: '03:15 PM' },
        { name: 'David Park', role: 'Compliance Officer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', email: 'david.park@company.com', joinTime: '02:35 PM', endTime: '03:18 PM' }
      ],
      transcript: [
        { speaker: 'Sarah Chen (Product Lead)', text: "Welcome everyone. Let's align on our Q3 enterprise targets. Marketing lead volume is up 18%, but we need deeper API integration into client Microsoft 365 tenants.", time: '00:04', translatedText: "Welcome everyone. Let's align on our Q3 enterprise targets. Marketing lead volume is up 18%, but we need deeper API integration into client Microsoft 365 tenants.", language: 'English' },
        { speaker: 'Alex Rivera (DevOps)', text: "Our Azure webhooks are scaling nicely, handling over 2,500 requests/min with sub-15ms latency over TLS 1.3.", time: '00:21', translatedText: "Our Azure webhooks are scaling nicely, handling over 2,500 requests/min with sub-15ms latency over TLS 1.3.", language: 'English' },
        { speaker: 'Marcus Vance (Architect)', text: "We have updated the Teams Bot Manifest to v1.15 schema with explicit OnlineMeetings.ReadWrite scopes for automated recording capture.", time: '00:42', translatedText: "We have updated the Teams Bot Manifest to v1.15 schema with explicit OnlineMeetings.ReadWrite scopes for automated recording capture.", language: 'English' },
        { speaker: 'Elena Rostova (Client Success)', text: "Enterprise clients are requesting that automated meeting summaries be exported directly into custom dashboard widgets or PDF digests.", time: '01:10', translatedText: "Enterprise clients are requesting that automated meeting summaries be exported directly into custom dashboard widgets or PDF digests.", language: 'English' },
        { speaker: 'Sarah Chen (Product Lead)', text: "Excellent point, Elena. Let's ensure our ZIP package contains all required icons and manifests ready for tenant admin upload.", time: '01:38', translatedText: "Excellent point, Elena. Let's ensure our ZIP package contains all required icons and manifests ready for tenant admin upload.", language: 'English' }
      ]
    },
    {
      id: 'bot-manifest-review',
      title: 'Teams Plugin & Calling Webhook Sync',
      projectName: 'Phoenix Portal UI',
      type: 'chat',
      status: 'COMPLETED',
      organizer: 'Alex Rivera',
      organizerEmail: 'alex.rivera@company.com',
      date: 'JUL 28, 2026',
      time: '10:15 AM',
      rawTimestamp: '2026-07-28T10:15:00Z',
      duration: '32m 40s',
      teamsMeetingId: 'M365-77210-BOT',
      fileSize: '145 MB',
      confidenceScore: 98.7,
      sentiment: 'Positive',
      recordingStatus: 'Available',
      aiStatus: 'Processed (Llama 3.3 70B)',
      detectedLanguage: 'Malayalam (മലയാളം)',
      originalLanguage: 'Malayalam',
      hasTranslation: true,
      topics: ['#ManifestV115', '#CallingWebhook', '#TeamsBot', '#AudioStream'],
      aiModel: 'meta/llama-3.3-70b-instruct',
      translationEngine: 'NVIDIA Riva Translation',
      nemotronReady: true,
      executiveSummary: "Multilingual review session translating Malayalam conversation into English via NVIDIA Riva. Locked Manifest v1.15 JSON schema and validated websocket calling webhooks.",
      detailedSummary: "The engineering team evaluated real-time speech-to-text translation latency. Spoken Malayalam dialogue was processed using NVIDIA Riva Translation and forwarded to Meta Llama 3.3 70B Instruct for document synthesis. All manifest asset dimensions (192x192 color, 32x32 outline) were verified.",
      summary: "Technical architectural review locking Teams manifest schemas, validating webhook calling endpoints, and testing real-time speech-to-text transcript processing.",
      keyHighlights: [
        'Spoken Malayalam translated to English with 98.7% confidence score.',
        'Calling Webhook endpoint secured with HMAC signature verification.',
        'Live transcript highlight player ready for Teams client embed.'
      ],
      keyDiscussionPoints: [
        'NVIDIA Riva real-time speech translation latency.',
        'Manifest ZIP compiler performance.',
        'Calling webhook HMAC authentication.'
      ],
      keyDecisions: [
        { id: 'dec-4', text: 'Enforced Manifest v1.15 JSON schema for Microsoft Teams Admin Center uploads.', impact: 'HIGH', category: 'Engineering' },
        { id: 'dec-5', text: 'Enabled real-time WebSocket audio streaming for live meeting transcriptions.', impact: 'HIGH', category: 'Architecture' }
      ],
      actionItems: [
        { id: 'item-5', text: 'Publish Calling Webhook API endpoint with HMAC signature verification', completed: true, assignee: 'Alex Rivera', priority: 'HIGH', dueDate: '2026-07-30' },
        { id: 'item-6', text: 'Verify manifest ZIP compiler generates valid 192x192 color and 32x32 outline PNG assets', completed: true, assignee: 'Chloe Bennett', priority: 'MED', dueDate: '2026-07-31' }
      ],
      risks: [
        { id: 'risk-3', risk: 'Websocket connection drops over weak VPN networks.', mitigation: 'Added auto-reconnect socket buffer.', severity: 'MED' }
      ],
      questionsRaised: [
        { id: 'q-3', question: 'Does NVIDIA Riva support code-switched Malayalam and English?', askedBy: 'Sarah Chen', answered: true }
      ],
      suggestions: [
        'Pre-compile manifest icons on server startup to shave 200ms off download time.'
      ],
      followUpTasks: [
        'Perform load test with 50 concurrent Teams meeting streams.'
      ],
      timeline: [
        { time: '00:05', title: 'Malayalam Speech Ingestion Check', description: 'Alex Rivera initiated testing with NVIDIA Riva Translation engine.', speaker: 'Alex Rivera' },
        { time: '00:30', title: 'Websocket Gateway Validation', description: 'Sarah Chen verified client credentials.', speaker: 'Sarah Chen' }
      ],
      participantsCount: 3,
      avatars: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
      ],
      participantsList: [
        { name: 'Alex Rivera', role: 'Senior DevOps Lead (Organizer)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', email: 'alex.rivera@company.com', joinTime: '10:15 AM', endTime: '10:47 AM' },
        { name: 'Sarah Chen', role: 'Product Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', email: 'sarah.chen@company.com', joinTime: '10:15 AM', endTime: '10:47 AM' },
        { name: 'Chloe Bennett', role: 'Frontend Lead', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80', email: 'chloe.b@company.com', joinTime: '10:18 AM', endTime: '10:47 AM' }
      ],
      transcript: [
        { speaker: 'Alex Rivera (DevOps)', text: "നമ്മൾ ടീംസ് കോളിംഗ് ഗേറ്റ്‌വേ സുരക്ഷിതമാണെന്ന് ഉറപ്പാക്കണം.", time: '00:05', translatedText: "We need to make sure the Teams calling gateway is secure.", language: 'Malayalam (മലയാളം)' },
        { speaker: 'Sarah Chen (Product Lead)', text: "അതെ, ഞാൻ വിഭജിച്ച പോർട്ടൽ പരിശോധിക്കുകയാണ്.", time: '00:30', translatedText: "Yes, I am testing the divided portal configuration.", language: 'Malayalam (മലയാളം)' },
        { speaker: 'Chloe Bennett (Frontend)', text: "The live transcript player component now supports real-time speaker highlight and seeking.", time: '01:05', translatedText: "The live transcript player component now supports real-time speaker highlight and seeking.", language: 'English' }
      ]
    },
    {
      id: 'contoso-onboarding',
      title: 'Contoso Global - Teams Bot Onboarding',
      type: 'custom',
      status: 'COMPLETED',
      ownerEmail: 'elena.r@company.com',
      ownerName: 'Elena Rostova (Client Success Director)',
      date: 'JUL 25, 2026',
      time: '04:00 PM',
      rawTimestamp: '2026-07-25T16:00:00Z',
      duration: '55m 10s',
      teamsMeetingId: 'M365-66102-CT',
      fileSize: '280 MB',
      confidenceScore: 99.5,
      sentiment: 'Positive',
      topics: ['#Contoso', '#TenantGrant', '#SecurityAudit', '#SSO'],
      keyDecisions: [
        'Granted admin consent across 12 Contoso organizational units in Azure AD.',
        'Configured automated email summary digests for executive stakeholders.'
      ],
      participantsCount: 6,
      avatars: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80'
      ],
      participantsList: [
        { name: 'Elena Rostova', role: 'Client Success Director', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80', email: 'elena.r@company.com' },
        { name: 'Sarah Chen', role: 'Product Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', email: 'sarah.chen@company.com' },
        { name: 'Robert Sterling', role: 'Contoso VP of IT', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80', email: 'rsterling@contoso.com' }
      ],
      transcript: [
        { speaker: 'Elena Rostova (Client Success)', text: "Welcome Robert! Today we will walk through uploading your custom manifest ZIP to Microsoft Teams Admin Center.", time: '00:10' },
        { speaker: 'Robert Sterling (Contoso IT)', text: "We completed the Azure AD tenant consent step yesterday. All security policies are green.", time: '00:45' },
        { speaker: 'Elena Rostova (Client Success)', text: "Wonderful. Your Teams bot will now automatically join scheduled meetings and generate transcripts.", time: '01:20' }
      ],
      actionItems: [
        { id: 'item-7', text: 'Send Contoso IT team the final deployment verification report', completed: true, assignee: 'Elena Rostova', priority: 'HIGH' }
      ],
      summary: "Client onboarding session successfully completing Azure tenant authorization, custom manifest upload, and initial live meeting recording test."
    },
    {
      id: 'weekly-standup-2026',
      title: 'Weekly Cross-Functional Sync',
      type: 'lightning',
      status: 'COMPLETED',
      ownerEmail: 'sarah.chen@company.com',
      ownerName: 'Sarah Chen (Tenant Admin)',
      date: 'JUL 24, 2026',
      time: '09:30 AM',
      rawTimestamp: '2026-07-24T09:30:00Z',
      duration: '22m 05s',
      teamsMeetingId: 'M365-55910-SU',
      fileSize: '98 MB',
      confidenceScore: 97.9,
      sentiment: 'Neutral',
      topics: ['#Standup', '#ZIPDownload', '#LatencyCheck', '#BugFixes'],
      keyDecisions: [
        'Decreased manifest ZIP compile time to under 1.2 seconds.',
        'Resolved audio buffer drop issue during high-concurrency calls.'
      ],
      participantsCount: 12,
      avatars: [
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80'
      ],
      participantsList: [
        { name: 'Sarah Chen', role: 'Product Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', email: 'sarah.chen@company.com' },
        { name: 'Alex Rivera', role: 'Senior DevOps Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', email: 'alex.rivera@company.com' },
        { name: 'Marcus Vance', role: 'Enterprise Architect', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80', email: 'marcus.v@company.com' }
      ],
      transcript: [
        { speaker: 'Elena Rostova (Client Success)', text: "Clients report 99.9% uptime for the Teams proxy listening service this week.", time: '00:08' },
        { speaker: 'Sarah Chen (Product Lead)', text: "Excellent work team. How is the ZIP extractor package behaving?", time: '00:25' },
        { speaker: 'Alex Rivera (DevOps)', text: "It compiles and downloads in under 1 second. Manifest validation checks out 100% cleanly.", time: '00:45' }
      ],
      actionItems: [
        { id: 'item-8', text: 'Verify tenant permissions for offline enterprise clients', completed: true, assignee: 'Elena Rostova', priority: 'LOW' }
      ],
      summary: "Weekly operational standup reviewing proxy health metrics, manifest compiler speed improvements, and client feedback."
    },
    {
      id: 'soc2-security-audit',
      title: 'Security & SOC2 Compliance Deep-Dive',
      type: 'analytics',
      status: 'COMPLETED',
      ownerEmail: 'david.park@company.com',
      ownerName: 'David Park (Compliance Officer)',
      date: 'JUL 21, 2026',
      time: '11:00 AM',
      rawTimestamp: '2026-07-21T11:00:00Z',
      duration: '1h 04m',
      teamsMeetingId: 'M365-44201-SEC',
      fileSize: '310 MB',
      confidenceScore: 99.1,
      sentiment: 'Urgent',
      topics: ['#SOC2', '#Encryption', '#TLS13', '#AuditLogs'],
      keyDecisions: [
        'Mandated TLS 1.3 encryption for all incoming Teams calling webhooks.',
        'Implemented 90-day automatic retention policy for raw audio recordings.'
      ],
      participantsCount: 5,
      avatars: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
      ],
      participantsList: [
        { name: 'David Park', role: 'Compliance Officer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', email: 'david.park@company.com' },
        { name: 'Marcus Vance', role: 'Enterprise Architect', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80', email: 'marcus.v@company.com' },
        { name: 'Sarah Chen', role: 'Product Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', email: 'sarah.chen@company.com' }
      ],
      transcript: [
        { speaker: 'David Park (Compliance)', text: "All recording audio streams stored in cloud buffers must be encrypted at rest with AES-256.", time: '00:15' },
        { speaker: 'Marcus Vance (Architect)', text: "Our storage architecture already utilizes Azure Key Vault with customer-managed keys.", time: '00:50' }
      ],
      actionItems: [
        { id: 'item-9', text: 'Generate monthly audit log export for compliance officer review', completed: true, assignee: 'David Park', priority: 'HIGH' }
      ],
      summary: "In-depth security audit establishing mandatory TLS 1.3 webhook transport, customer-managed key encryption, and automated compliance retention policies."
    }
  ]);

  // Connection states
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionStep, setConnectionStep] = useState<string>('');
  
  // Bot settings
  const [botName, setBotName] = useState<string>('PLUGIT Notetaker AI');
  const [botId, setBotId] = useState<string>('7fa12bf1-9134-4b5a-ba3d-47be0b9bf3b4');
  const [companyName, setCompanyName] = useState<string>('PLUGIT AI');
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://plugit.ai');
  const [privacyUrl, setPrivacyUrl] = useState<string>('https://plugit.ai/privacy');
  const [termsOfUseUrl, setTermsOfUseUrl] = useState<string>('https://plugit.ai/terms');
  const [callingEndpoint, setCallingEndpoint] = useState<string>('https://api.plugit.ai/api/calling');
  
  const [autoJoinScheduled, setAutoJoinScheduled] = useState<boolean>(true);
  const [promptBeforeJoining, setPromptBeforeJoining] = useState<boolean>(false);
  
  // Extraction states
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [isExtracted, setIsExtracted] = useState<boolean>(false);

  // Modal and customizer helpers
  const [isManifestOpen, setIsManifestOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Guide step state
  const [activeGuideStep, setActiveGuideStep] = useState<number>(1);

  // Live Terminal Logs State
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '10:45:01', level: 'INFO', message: 'System initialization sequence offline.' },
    { id: '2', timestamp: '10:45:02', level: 'WARN', message: 'Azure Graph API connection pending authorization.' }
  ]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Simulate Azure authorization handshake
  const handleGrantAccess = () => {
    if (isConnected) {
      // Disconnect
      setIsConnected(false);
      addLog('WARN', 'Tenant authorization revoked by administrator.');
      addLog('INFO', 'PLUGIT Notetaker listening gateway offline.');
      return;
    }

    if (isConnecting) return;

    setIsConnecting(true);
    setConnectionStep('Initializing Azure Secure Tunnel...');
    addLog('INFO', 'Initiating OAuth2 handshake with Microsoft Azure ID...');

    setTimeout(() => {
      setConnectionStep('Verifying Tenant credentials...');
      addLog('INFO', 'Resolving Active Directory application registration (App ID: 9f8e-d901)...');
    }, 1200); // Visual timing for active AD lookup

    setTimeout(() => {
      setConnectionStep('Syncing Microsoft Graph API Scopes...');
      addLog('INFO', 'Requested scopes approved: OnlineMeetings.ReadWrite, CallRecords.Read.All, Group.ReadWrite.All');
    }, 2400);

    setTimeout(() => {
      setConnectionStep('Securing webhook listeners...');
      addLog('SUCCESS', 'TLS 1.3 tunnel secured with ajayaghosh.b@thinkpalm.com tenant.');
    }, 3600);

    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setConnectionStep('');
      addLog('SUCCESS', 'PLUGIT Teams Gateway active and listening for live conference calls.');
    }, 4500);
  };

  // Helper to add terminal logs
  const addLog = (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', message: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: time,
      level,
      message
    };
    setLogs((prev) => [...prev, newLog].slice(-50)); // Keep last 50 logs
  };

  const getSafeHostname = (urlStr: string, fallback: string) => {
    try {
      return new URL(urlStr).hostname || fallback;
    } catch (e) {
      return fallback;
    }
  };

  const handleRegenerateId = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setBotId(uuid);
    addLog('INFO', `Generated new App Client ID: ${uuid}`);
  };

  const generateIconBlob = (type: 'color' | 'outline'): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      if (type === 'color') {
        canvas.width = 192;
        canvas.height = 192;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 192, 192);
          grad.addColorStop(0, '#6366f1');
          grad.addColorStop(1, '#4f46e5');
          ctx.fillStyle = grad;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(0, 0, 192, 192, 40);
          } else {
            ctx.rect(0, 0, 192, 192);
          }
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(96, 96, 60, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 96px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('P', 96, 96);
        }
      } else {
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 32, 32);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(16, 16, 12, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('P', 16, 16);
        }
      }
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/png');
    });
  };

  const getManifestJSON = () => {
    return {
      "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.15/MicrosoftTeams.schema.json",
      "manifestVersion": "1.15",
      "version": "1.0.0",
      "id": botId,
      "packageName": "com.plugit.notetaker",
      "developer": {
        "name": companyName,
        "websiteUrl": websiteUrl,
        "privacyUrl": privacyUrl,
        "termsOfUseUrl": termsOfUseUrl
      },
      "name": {
        "short": botName.substring(0, 30),
        "full": `${botName} - Meeting Notetaker Bot`
      },
      "description": {
        "short": "AI Meeting Notetaker and summarizer.",
        "full": "PLUGIT automatically joins your Teams meetings as a highly intelligent co-pilot, capturing transcripts, identifying action items, and producing beautiful AI summaries."
      },
      "icons": {
        "outline": "outline.png",
        "color": "color.png"
      },
      "accentColor": "#6366F1",
      "bots": [
        {
          "botId": botId,
          "scopes": [
            "groupchat",
            "team"
          ],
          "supportsFiles": false,
          "isNotificationOnly": false,
          "supportsCalling": true,
          "supportsVideo": false,
          "callingWebhook": callingEndpoint
        }
      ],
      "permissions": [
        "identityProvider"
      ],
      "validDomains": [
        getSafeHostname(websiteUrl, "plugit.ai"),
        getSafeHostname(callingEndpoint, "api.plugit.ai")
      ].filter((v, i, a) => a.indexOf(v) === i && v)
    };
  };

  const triggerZipDownload = async () => {
    try {
      addLog('INFO', 'Compiling manifest package assets and XML schema registrations...');
      const zip = new JSZip();

      const manifest = getManifestJSON();

      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      const colorBlob = await generateIconBlob('color');
      zip.file('color.png', colorBlob);

      const outlineBlob = await generateIconBlob('outline');
      zip.file('outline.png', outlineBlob);

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'PLUGIT-Teams-App.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addLog('SUCCESS', 'PLUGIT-Teams-App.zip generated and downloaded successfully!');
    } catch (e: any) {
      addLog('ERROR', `Compression error: ${e.message || e}`);
    }
  };

  // Simulate package extraction process
  const handleExtractPackage = () => {
    if (isExtracting) return;
    setIsExtracting(true);
    setExtractProgress(0);
    setIsExtracted(false);
    addLog('INFO', 'Constructing Microsoft Teams application zip package stream...');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExtracting) {
      interval = setInterval(() => {
        setExtractProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsExtracting(false);
            setIsExtracted(true);
            addLog('SUCCESS', 'Manifest compilation complete. PLUGIT-Teams-App.zip successfully compiled.');
            triggerZipDownload();
            return 100;
          }
          const increment = Math.floor(Math.random() * 15) + 10;
          return Math.min(prev + increment, 100);
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isExtracting]);

  // Telemetry loop - adds realistic ambient logs when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const messages = [
        { level: 'INFO', text: 'Polling Microsoft Teams calendar endpoints...' },
        { level: 'INFO', text: 'Gateway ping response 45ms. Healthy.' },
        { level: 'SUCCESS', text: 'Synchronized meeting agenda for pending daily scrum.' },
        { level: 'INFO', text: 'Azure SignalR live channel waiting on standby...' }
      ];
      const selected = messages[Math.floor(Math.random() * messages.length)];
      addLog(selected.level as any, selected.text);
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Scroll terminal logs to bottom on change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Detailed guides for the active installation step
  const getStepGuide = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return {
          title: "Grant Organization Access (Azure Auth)",
          desc: "Connect your tenant gateway with secure Microsoft API credentials.",
          instructions: [
            "Click the 'GRANT ACCESS' button in the Interface Config card on this dashboard.",
            "Log in using your corporate Microsoft 365 Global Administrator account.",
            "Verify the requested Graph permissions: Group.ReadWrite.All, OnlineMeetings.ReadWrite, and Calls.AccessMedia.All.",
            "Accept the tenant-wide authorization prompt to open secure communication tunnels."
          ]
        };
      case 2:
        return {
          title: "Extract App Manifest (File Prep)",
          desc: "Build the zip file containing all required Microsoft Teams icons, endpoints, and secure credentials.",
          instructions: [
            "Use the 'Bot Protocol' section to customize the public Display Name of your bot.",
            "Under the 'Data Manifest' card, click the 'EXTRACT PACKAGE' button.",
            "Wait for compilation (100% complete) to register your bot endpoints.",
            "Save the generated file 'PLUGIT-Teams-App.zip' to your local workstation."
          ]
        };
      case 3:
        return {
          title: "Upload to Teams Admin Center (Manual Upload)",
          desc: "Deploy the custom app package globally so users across your tenant can access it.",
          instructions: [
            "Navigate to the Microsoft Teams Admin Center (admin.teams.microsoft.com).",
            "In the left navigation bar, go to 'Teams apps' and select 'Manage apps'.",
            "Click '+ Upload new app' in the top toolbar.",
            "Choose 'Upload a custom app' and select the 'PLUGIT-Teams-App.zip' you downloaded in Step 2.",
            "Confirm that the app status is listed as 'Published' and 'Allowed'."
          ]
        };
      case 4:
        return {
          title: "Configure Transcript Policy (Meeting Setup)",
          desc: "Set Teams conference settings to allow the Notetaker bot to stream sound waves and write notes.",
          instructions: [
            "Go to the Microsoft Teams Admin Center -> 'Meetings' -> 'Meeting policies'.",
            "Select the default Global policy, or the custom policy assigned to your organizers.",
            "Scroll down to the 'Recording & transcription' section.",
            "Ensure 'Transcription' and 'Recording' toggles are switched to 'On'.",
            "Restart your Teams client. Schedule a meeting and add your custom PLUGIT bot to join and generate summaries."
          ]
        };
      default:
        return null;
    }
  };

  const activeGuide = getStepGuide(activeGuideStep);

  return (
    <div className="space-y-5 font-sans">
      {/* Fluent UI Microsoft Teams Plugin Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl md:text-2xl tracking-tight text-white flex items-center gap-2">
                Microsoft Teams AI Meeting Intelligence
              </h1>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded uppercase tracking-wider">
                Fluent UI v1.15
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5 flex items-center gap-2 font-medium">
              <span>Automated Meeting Memory & Documentation Assistant</span>
              <span className="text-slate-500">•</span>
              <span className="text-indigo-300 font-mono text-[11px] font-bold">Llama 3.3 70B & Riva Enabled</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">Teams Sync Active</span>
          </div>
        </div>
      </div>

      {/* Fluent UI 2-Tab Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="h-[2px] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 w-full" />
        
        <div className="flex items-center px-6 py-0.5 gap-8 border-b border-slate-150">
          <button
            onClick={() => setActiveTab('collection')}
            className={`font-sans text-sm font-bold tracking-wide transition-all relative py-3.5 px-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'collection' ? 'text-indigo-600 font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>📂 Collection</span>
            {activeTab === 'collection' && (
              <motion.div 
                layoutId="activePlugItTab" 
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-full" 
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`font-sans text-sm font-bold tracking-wide transition-all relative py-3.5 px-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings' ? 'text-indigo-600 font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>⚙ Settings</span>
            {activeTab === 'settings' && (
              <motion.div 
                layoutId="activePlugItTab" 
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-full" 
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('custom-report')}
            className={`font-sans text-sm font-bold tracking-wide transition-all relative py-3.5 px-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'custom-report' ? 'text-blue-600 font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>📄 Custom Report</span>
            {activeTab === 'custom-report' && (
              <motion.div 
                layoutId="activePlugItTab" 
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full" 
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'collection' && (
          <motion.div
            key="collection-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
          >
            <CollectionTab
              collections={collections}
              setCollections={setCollections}
              selectedCollectionId={selectedCollectionId}
              setSelectedCollectionId={setSelectedCollectionId}
              addLog={addLog}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
          >
            <SettingsTab addLog={addLog} />
          </motion.div>
        )}

        {activeTab === 'custom-report' && (
          <motion.div
            key="custom-report-pane"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
          >
            <CustomReportModule />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Manifest Modal */}
      <AnimatePresence>
        {isManifestOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-200"
            >
              {/* Decorative radial gradients */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08)_0%,transparent_50%)] pointer-events-none" />
              <div className="absolute top-1/2 left-0 w-72 h-72 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.03)_0%,transparent_60%)] pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 p-5 bg-slate-900 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      manifest.json
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        Live Preview
                      </span>
                    </h3>
                    <p className="text-xs text-slate-200 font-semibold mt-0.5">
                      Real-time compiled manifest layout schema for Microsoft Teams Bot registration.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsManifestOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 scrollbar-thin scrollbar-thumb-slate-850">
                
                {/* Left Side: Parameters Map & Explanations (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-indigo-300 uppercase tracking-widest font-extrabold block">
                      DYNAMIC VALUE MAPPING
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      This manifest is built in real-time. Changes you make in the editor are mapped directly into the exported JSON schema:
                    </p>
                  </div>

                  {/* Live indicators */}
                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 uppercase font-extrabold">"id" / "botId"</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-extrabold">Live UUID</span>
                      </div>
                      <p className="font-mono text-xs text-slate-200 truncate font-semibold">{botId}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 uppercase font-extrabold">"short" Name</span>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded font-extrabold">Trimmed</span>
                      </div>
                      <p className="font-sans text-sm text-slate-200 font-extrabold">{botName.substring(0, 30)}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 uppercase font-extrabold">"developer"</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-extrabold">Active Org</span>
                      </div>
                      <p className="font-sans text-sm text-slate-200 truncate font-extrabold">{companyName}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 uppercase font-extrabold">"callingWebhook"</span>
                        <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded font-extrabold">API Route</span>
                      </div>
                      <p className="font-mono text-xs text-slate-200 truncate font-semibold">{callingEndpoint}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/40 rounded-xl text-indigo-200 text-xs leading-relaxed font-semibold">
                    💡 <strong>Real-World Integrity:</strong> This schema conforms fully to Microsoft's developer specs (Teams App Manifest v1.15 schema). It enables features like inline transcripts, automated group chat invitations, and incoming calling webhook delivery.
                  </div>
                </div>

                {/* Right Side: Interactive Code Block (lg:col-span-8) */}
                <div className="lg:col-span-8 flex flex-col min-h-[380px] bg-slate-950 rounded-xl border border-slate-850 overflow-hidden">
                  
                  {/* Action ribbon */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-900/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="text-[10px] text-slate-400 font-mono ml-1 font-bold">preview-manifest.json</span>
                    </div>

                    <button
                      onClick={() => {
                        const manifestStr = JSON.stringify(getManifestJSON(), null, 2);
                        navigator.clipboard.writeText(manifestStr);
                        setIsCopied(true);
                        addLog('SUCCESS', 'Copied live manifest.json to clipboard.');
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-mono text-[10px] uppercase font-extrabold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-450" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scrollable Pre */}
                  <div className="flex-1 p-4 overflow-auto font-mono text-[10.5px] text-slate-100 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 select-all font-semibold">
                    <pre className="whitespace-pre">
                      {JSON.stringify(getManifestJSON(), null, 2)}
                    </pre>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800/85 bg-slate-950/40 flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-2 text-slate-200 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Conforms to Teams Schema v1.15
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setIsManifestOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-bold border border-slate-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  
                  <button
                    onClick={() => {
                      triggerZipDownload();
                      setIsManifestOpen(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-indigo-600/10 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export ZIP Package
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
