import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  FolderPlus, 
  Clock, 
  ArrowRight, 
  Play, 
  Pause, 
  Trash2, 
  Calendar, 
  Users, 
  X, 
  Check, 
  MessageSquare, 
  Zap, 
  FileText,
  Plus,
  Download,
  Copy,
  Sparkles,
  CheckCircle2,
  Video,
  HardDrive,
  User,
  Mic,
  Languages,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  FileCode,
  FileCheck,
  ChevronRight,
  Filter,
  CheckSquare,
  RefreshCw
} from 'lucide-react';
import { API_URL } from '../../config/api';

export interface Participant {
  name: string;
  role: string;
  avatar: string;
  email?: string;
  joinTime?: string;
  endTime?: string;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
  priority?: 'HIGH' | 'MED' | 'LOW';
  dueDate?: string;
}

export interface DecisionItem {
  id: string;
  text: string;
  category?: string;
  impact?: 'HIGH' | 'MED' | 'LOW';
}

export interface RiskItem {
  id: string;
  risk: string;
  mitigation?: string;
  severity?: 'HIGH' | 'MED' | 'LOW';
}

export interface QuestionItem {
  id: string;
  question: string;
  askedBy?: string;
  answered?: boolean;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  speaker?: string;
}

export interface TranscriptLine {
  speaker: string;
  text: string;
  time: string;
  timestampSec?: number;
  translatedText?: string;
  language?: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  projectName?: string;
  type: 'analytics' | 'chat' | 'lightning' | 'custom';
  status: 'ANALYZING' | 'COMPLETED' | 'DRAFT';
  date: string;
  time: string;
  rawTimestamp?: string;
  duration?: string;
  teamsMeetingId?: string;
  organizer: string;
  organizerEmail?: string;
  fileSize?: string;
  confidenceScore?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Action-Oriented' | 'Urgent';
  recordingStatus: 'Available' | 'Processing' | 'Not Recorded';
  aiStatus: 'Processed (Llama 3.3 70B)' | 'Processing' | 'Pending';
  detectedLanguage: string;
  originalLanguage: string;
  hasTranslation: boolean;
  topics?: string[];
  executiveSummary?: string;
  detailedSummary?: string;
  summary?: string; // MOM Summary
  keyHighlights?: string[];
  keyDiscussionPoints?: string[];
  keyDecisions?: DecisionItem[] | string[];
  actionItems?: ActionItem[];
  risks?: RiskItem[];
  questionsRaised?: QuestionItem[];
  suggestions?: string[];
  followUpTasks?: string[];
  timeline?: TimelineEvent[];
  participantsCount: number;
  avatars: string[];
  participantsList?: Participant[];
  transcript?: TranscriptLine[];
  audioUrl?: string;
  aiModel?: string;
  translationEngine?: string;
  nemotronReady?: boolean;
}

interface CollectionTabProps {
  collections: CollectionItem[];
  setCollections: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  selectedCollectionId: string;
  setSelectedCollectionId: (id: string) => void;
  addLog: (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', message: string) => void;
}

export default function CollectionTab({
  collections,
  setCollections,
  selectedCollectionId,
  setSelectedCollectionId,
  addLog
}: CollectionTabProps) {
  // Search and Date Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'All Meetings' | 'Today' | 'This Week' | 'This Month'>('All Meetings');
  const [detailSubTab, setDetailSubTab] = useState<'executive' | 'detailed' | 'mom' | 'transcript' | 'decisions' | 'tasks' | 'risks' | 'timeline' | 'participants'>('executive');

  // Download Center Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [downloadTargetDoc, setDownloadTargetDoc] = useState<'MOM' | 'Executive Summary' | 'Detailed Summary' | 'Full Transcript' | 'Translated Transcript' | 'Action Item Report' | 'Decision Report' | 'Complete Meeting Report'>('Complete Meeting Report');
  const [downloadFormat, setDownloadFormat] = useState<'PDF' | 'DOCX' | 'Markdown' | 'TXT'>('PDF');

  // Audio simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioIntervalRef = useRef<any>(null);

  // Copy transcript states
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);
  const [transcriptSearch, setTranscriptSearch] = useState<string>('');
  const [showOriginalTranscript, setShowOriginalTranscript] = useState<boolean>(false);

  useEffect(() => {
    if (isPlayingAudio) {
      const stepMs = 250 / playbackSpeed;
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, stepMs);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlayingAudio, playbackSpeed]);

  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
  }, [selectedCollectionId]);

  // Load real custom meeting reports from Neon Cloud PostgreSQL database
  useEffect(() => {
    const loadRealDatabaseReports = async () => {
      try {
        const res = await fetch(`${API_URL}/api/custom-reports/history`);
        if (res.ok) {
          const data = await res.json();
          if (data.reports && data.reports.length > 0) {
            const mapped: CollectionItem[] = data.reports.map((r: any) => ({
              id: r.id,
              title: r.meetingName,
              projectName: 'Recorded Meeting',
              type: 'analytics',
              status: r.status === 'COMPLETED' ? 'COMPLETED' : 'ANALYZING',
              organizer: r.organizer || 'Meeting Host',
              organizerEmail: 'host@thinkit.ai',
              date: new Date(r.uploadDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
              time: new Date(r.uploadDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              rawTimestamp: r.uploadDate,
              duration: r.duration || '45m 00s',
              teamsMeetingId: r.id,
              fileSize: '150 MB',
              confidenceScore: 99.0,
              sentiment: 'Action-Oriented',
              recordingStatus: 'Available',
              aiStatus: r.aiProviderUsed || 'Processed (Groq Llama 3.3 70B)',
              detectedLanguage: 'English (US)',
              originalLanguage: 'English',
              hasTranslation: true,
              topics: r.keywords || ['#MeetingIntelligence', '#CustomReport'],
              aiModel: 'meta/llama-3.3-70b-instruct',
              translationEngine: 'NVIDIA Riva Translation',
              nemotronReady: true,
              executiveSummary: r.executiveSummary || r.summary,
              detailedSummary: r.summary,
              summary: r.summary,
              keyHighlights: r.actionItems ? r.actionItems.map((a: any) => a.title || a.text) : [],
              keyDiscussionPoints: r.decisions ? r.decisions.map((d: any) => d.decision || d.text) : [],
              keyDecisions: r.decisions ? r.decisions.map((d: any, idx: number) => ({ id: `dec-${idx}`, text: d.decision || d.text, impact: 'HIGH' })) : [],
              actionItems: r.actionItems ? r.actionItems.map((a: any, idx: number) => ({ id: `act-${idx}`, text: a.title || a.text, completed: a.status === 'Completed', priority: 'HIGH' })) : [],
              risks: r.risks ? r.risks.map((rk: any, idx: number) => ({ id: `risk-${idx}`, risk: rk.risk, mitigation: rk.mitigation, severity: 'MED' })) : [],
              questionsRaised: [],
              suggestions: [],
              followUpTasks: [],
              timeline: r.timeline || [],
              participantsCount: 4,
              avatars: [],
              participantsList: [],
              transcript: r.rawTranscript ? [{ speaker: 'Meeting Participant', text: r.rawTranscript.substring(0, 500), time: '00:00' }] : []
            }));
            setCollections(mapped);
            if (mapped.length > 0) {
              setSelectedCollectionId(mapped[0].id);
            }
          }
        }
      } catch (e) {
        console.warn('Could not load database custom reports history:', e);
      }
    };
    loadRealDatabaseReports();
  }, []);

  const activeCollection = collections.find((c) => c.id === selectedCollectionId) || collections[0];

  const handleToggleActionItem = (itemId: string) => {
    if (!activeCollection) return;
    setCollections((prev) => 
      prev.map((c) => {
        if (c.id === activeCollection.id && c.actionItems) {
          return {
            ...c,
            actionItems: c.actionItems.map((item) => 
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          };
        }
        return c;
      })
    );
    addLog('SUCCESS', `Updated action item in '${activeCollection.title}'.`);
  };

  const handleCopyTranscript = () => {
    if (!activeCollection || !activeCollection.transcript) return;
    const text = activeCollection.transcript.map(t => {
      const mainText = showOriginalTranscript ? t.text : (t.translatedText || t.text);
      return `[${t.time}] ${t.speaker}: ${mainText}`;
    }).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    addLog('SUCCESS', `Copied transcript for '${activeCollection.title}' to clipboard.`);
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  // Professional Download Generator for PDF, DOCX, Markdown, and TXT
  const handleExecuteDownload = () => {
    if (!activeCollection) return;

    let content = "";
    const filename = `${activeCollection.title.replace(/[^a-zA-Z0-9]/g, '_')}_${downloadTargetDoc.replace(/ /g, '_')}`;

    if (downloadFormat === 'Markdown') {
      content = `# ${activeCollection.title}\n`;
      content += `**Document Type:** ${downloadTargetDoc}\n`;
      content += `**Project:** ${activeCollection.projectName || 'Enterprise Workspace'}\n`;
      content += `**Date & Time:** ${activeCollection.date} ${activeCollection.time} (${activeCollection.duration})\n`;
      content += `**Organizer:** ${activeCollection.organizer}\n`;
      content += `**AI Processing Engine:** ${activeCollection.aiModel || 'meta/llama-3.3-70b-instruct'}\n`;
      content += `**Translation Engine:** ${activeCollection.translationEngine || 'NVIDIA Riva Translation'}\n`;
      content += `**Generated Timestamp:** ${new Date().toISOString()}\n\n`;
      content += `---\n\n`;

      if (downloadTargetDoc === 'Executive Summary' || downloadTargetDoc === 'Complete Meeting Report') {
        content += `## Executive Summary\n${activeCollection.executiveSummary || activeCollection.summary}\n\n`;
      }
      if (downloadTargetDoc === 'Detailed Summary' || downloadTargetDoc === 'Complete Meeting Report') {
        content += `## Detailed Summary\n${activeCollection.detailedSummary || activeCollection.summary}\n\n`;
      }
      if (downloadTargetDoc === 'MOM' || downloadTargetDoc === 'Complete Meeting Report') {
        content += `## Minutes of Meeting (MOM)\n${activeCollection.summary}\n\n`;
      }
      if (downloadTargetDoc === 'Action Item Report' || downloadTargetDoc === 'Complete Meeting Report') {
        content += `## Action Items\n`;
        (activeCollection.actionItems || []).forEach(item => {
          content += `- [${item.completed ? 'x' : ' '}] **${item.text}** (Assignee: ${item.assignee || 'Unassigned'}, Due: ${item.dueDate || 'TBD'}, Priority: ${item.priority || 'MED'})\n`;
        });
        content += `\n`;
      }
      if (downloadTargetDoc === 'Decision Report' || downloadTargetDoc === 'Complete Meeting Report') {
        content += `## Key Decisions Reached\n`;
        (activeCollection.keyDecisions || []).forEach((dec: any) => {
          const text = typeof dec === 'string' ? dec : dec.text;
          content += `- ${text}\n`;
        });
        content += `\n`;
      }
      if (downloadTargetDoc === 'Full Transcript' || downloadTargetDoc === 'Translated Transcript' || downloadTargetDoc === 'Complete Meeting Report') {
        content += `## Meeting Transcript\n`;
        (activeCollection.transcript || []).forEach(line => {
          const lineText = downloadTargetDoc === 'Full Transcript' ? line.text : (line.translatedText || line.text);
          content += `**[${line.time}] ${line.speaker}:** ${lineText}\n`;
        });
      }
    } else if (downloadFormat === 'TXT') {
      content = `====================================================\n`;
      content += `COMPANY MEETING REPORT: ${activeCollection.title.toUpperCase()}\n`;
      content += `====================================================\n`;
      content += `Document: ${downloadTargetDoc}\n`;
      content += `Project: ${activeCollection.projectName || 'Enterprise Workspace'}\n`;
      content += `Date/Time: ${activeCollection.date} ${activeCollection.time}\n`;
      content += `Organizer: ${activeCollection.organizer}\n`;
      content += `AI Engine: ${activeCollection.aiModel || 'meta/llama-3.3-70b-instruct'}\n`;
      content += `Timestamp: ${new Date().toLocaleString()}\n`;
      content += `====================================================\n\n`;

      content += `EXECUTIVE SUMMARY:\n${activeCollection.executiveSummary || activeCollection.summary}\n\n`;
      content += `DETAILED SUMMARY:\n${activeCollection.detailedSummary || activeCollection.summary}\n\n`;

      if (activeCollection.actionItems && activeCollection.actionItems.length > 0) {
        content += `ACTION ITEMS:\n`;
        activeCollection.actionItems.forEach((act, i) => {
          content += `${i + 1}. [${act.completed ? 'DONE' : 'PENDING'}] ${act.text} (Assignee: ${act.assignee})\n`;
        });
        content += `\n`;
      }

      if (activeCollection.transcript && activeCollection.transcript.length > 0) {
        content += `TRANSCRIPT LOG:\n`;
        activeCollection.transcript.forEach(t => {
          content += `[${t.time}] ${t.speaker}: ${t.translatedText || t.text}\n`;
        });
      }
    } else {
      // PDF or DOCX structured HTML download payload
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${activeCollection.title}</title>`;
      content += `<style>body{font-family:Arial,sans-serif;padding:30px;color:#1e293b;} h1{color:#4338ca;} table{width:100%;border-collapse:collapse;margin-top:15px;} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;} th{background:#f1f5f9;}</style></head><body>`;
      content += `<h1>THINKPALM TEAMS AI MEETING INTELLIGENCE</h1>`;
      content += `<h2>${activeCollection.title}</h2>`;
      content += `<p><strong>Document Type:</strong> ${downloadTargetDoc} | <strong>Format:</strong> ${downloadFormat}</p>`;
      content += `<p><strong>Project:</strong> ${activeCollection.projectName || 'Enterprise Workspace'} | <strong>Organizer:</strong> ${activeCollection.organizer}</p>`;
      content += `<p><strong>Date:</strong> ${activeCollection.date} ${activeCollection.time} | <strong>Duration:</strong> ${activeCollection.duration}</p>`;
      content += `<p><strong>AI Engine:</strong> meta/llama-3.3-70b-instruct | <strong>Translation Engine:</strong> NVIDIA Riva Translation</p>`;
      content += `<hr/>`;

      content += `<h3>Executive Summary</h3><p>${activeCollection.executiveSummary || activeCollection.summary}</p>`;
      content += `<h3>Detailed Summary</h3><p>${activeCollection.detailedSummary || activeCollection.summary}</p>`;

      if (activeCollection.keyDecisions && activeCollection.keyDecisions.length > 0) {
        content += `<h3>Key Decisions</h3><ul>`;
        activeCollection.keyDecisions.forEach((dec: any) => {
          content += `<li>${typeof dec === 'string' ? dec : dec.text}</li>`;
        });
        content += `</ul>`;
      }

      if (activeCollection.actionItems && activeCollection.actionItems.length > 0) {
        content += `<h3>Action Items</h3><table><tr><th>Status</th><th>Task</th><th>Assignee</th><th>Priority</th></tr>`;
        activeCollection.actionItems.forEach(item => {
          content += `<tr><td>${item.completed ? 'Completed' : 'Pending'}</td><td>${item.text}</td><td>${item.assignee || 'Unassigned'}</td><td>${item.priority || 'MED'}</td></tr>`;
        });
        content += `</table>`;
      }

      if (activeCollection.transcript && activeCollection.transcript.length > 0) {
        content += `<h3>Meeting Transcript</h3><table><tr><th>Time</th><th>Speaker</th><th>Dialogue</th></tr>`;
        activeCollection.transcript.forEach(t => {
          content += `<tr><td>${t.time}</td><td>${t.speaker}</td><td>${t.translatedText || t.text}</td></tr>`;
        });
        content += `</table>`;
      }

      content += `</body></html>`;
    }

    const mimeType = downloadFormat === 'Markdown' ? 'text/markdown' : (downloadFormat === 'TXT' ? 'text/plain' : 'application/msword');
    const ext = downloadFormat === 'Markdown' ? 'md' : (downloadFormat === 'TXT' ? 'txt' : (downloadFormat === 'DOCX' ? 'docx' : 'pdf'));

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = `${filename}.${ext}`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsDownloadModalOpen(false);
    addLog('SUCCESS', `Generated and downloaded ${downloadTargetDoc} (${downloadFormat}) for '${activeCollection.title}'.`);
  };

  // Filter collections by date & search query
  const filteredCollections = collections.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      c.title.toLowerCase().includes(query) ||
      c.date.toLowerCase().includes(query) ||
      (c.projectName && c.projectName.toLowerCase().includes(query)) ||
      (c.organizer && c.organizer.toLowerCase().includes(query)) ||
      (c.summary && c.summary.toLowerCase().includes(query)) ||
      (c.teamsMeetingId && c.teamsMeetingId.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (dateFilter === 'Today') {
      return c.date.includes('JUL 29') || c.date.includes('TODAY');
    }
    if (dateFilter === 'This Week') {
      return c.date.includes('JUL 28') || c.date.includes('JUL 29') || c.date.includes('JUL 27');
    }
    return true;
  });

  if (collections.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-2xl mx-auto my-8 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-inner">
          <FolderPlus className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-lg text-slate-900">No Recorded Meetings Found</h3>
          <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
            Meetings captured by Think It in Microsoft Teams will automatically appear here once recorded and processed by the AI Gateway.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Collection List & Filters (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                Processed Microsoft Teams Meetings
              </h3>
              <span className="font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                {filteredCollections.length} Calls
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meeting titles, projects, organizers..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Filters (Today, This Week, This Month, All Meetings) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              {(['All Meetings', 'Today', 'This Week', 'This Month'] as const).map((df) => (
                <button
                  key={df}
                  onClick={() => setDateFilter(df)}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    dateFilter === df
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {df}
                </button>
              ))}
            </div>
          </div>

          {/* List of Fluent UI Meeting Cards */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredCollections.map((item) => {
                const isSelected = item.id === activeCollection?.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => setSelectedCollectionId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.projectName && (
                            <span className="font-mono text-[9.5px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200/60 uppercase">
                              {item.projectName}
                            </span>
                          )}
                          <span className="font-mono text-[9.5px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                            {item.aiStatus || 'Processed'}
                          </span>
                          <span className="font-mono text-[9.5px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {item.detectedLanguage || 'English'}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 tracking-tight leading-snug">
                          {item.title}
                        </h4>

                        <p className="font-mono text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Organizer: <strong className="text-slate-800">{item.organizer}</strong></span>
                          <span>•</span>
                          <span>{item.date} ({item.time})</span>
                        </p>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                    </div>

                    {/* Metadata & Action Row - Styled matching user screenshot */}
                    <div className="pt-3 border-t border-slate-150 flex items-center gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCollectionId(item.id);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <span>Open Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCollectionId(item.id);
                          setIsDownloadModalOpen(true);
                        }}
                        className="w-10 h-10 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 rounded-xl flex items-center justify-center shadow-xs transition-all shrink-0 cursor-pointer"
                        title="Sync & Re-process Meeting Intelligence"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-950 font-bold" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredCollections.length === 0 && (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl p-6">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-800 text-xs font-bold">No completed Teams meetings found matching filter.</p>
                <button onClick={() => { setSearchQuery(''); setDateFilter('All Meetings'); }} className="mt-2 text-xs text-indigo-600 font-bold underline cursor-pointer">
                  Reset date & search filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Meeting Intelligence Page (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {activeCollection ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              {/* Detailed Header */}
              <div className="space-y-3 border-b border-slate-150 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-200">
                        {activeCollection.projectName || 'Enterprise Workspace'}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {activeCollection.aiModel || 'meta/llama-3.3-70b-instruct'}
                      </span>
                      {activeCollection.hasTranslation && (
                        <span className="bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                          <Languages className="w-3 h-3 text-purple-600" />
                          NVIDIA Riva Translation
                        </span>
                      )}
                    </div>

                    <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight leading-snug">
                      {activeCollection.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsDownloadModalOpen(true)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Reports</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Organizer</span>
                    <strong className="text-slate-900 mt-0.5 block truncate">{activeCollection.organizer}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Time</span>
                    <strong className="text-slate-900 mt-0.5 block">{activeCollection.date} ({activeCollection.time})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                    <strong className="text-slate-900 mt-0.5 block">{activeCollection.duration || '45m'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recording Status</span>
                    <strong className="text-emerald-700 mt-0.5 block">{activeCollection.recordingStatus || 'Available'}</strong>
                  </div>
                </div>
              </div>

              {/* Interactive Stream Player Bar */}
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>
                    <div>
                      <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-indigo-400" />
                        Teams Audio Playback
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {isPlayingAudio ? 'Simulating Opus HD audio playback...' : 'Play meeting recording stream'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                    <span>Speed:</span>
                    {[1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${playbackSpeed === speed ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-700 text-slate-400'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div 
                    className="h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      setAudioProgress(Math.round((clickX / rect.width) * 100));
                    }}
                  >
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-150" style={{ width: `${audioProgress}%` }} />
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9px] text-slate-400">
                    <span>{Math.floor((audioProgress / 100) * 45)}m {Math.floor((audioProgress / 100) * 60) % 60}s</span>
                    <span>{activeCollection.duration || '48m 15s'}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Navigation Sub Tabs */}
              <div className="border-b border-slate-200 flex items-center gap-4 font-mono text-xs font-bold text-slate-500 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'executive', label: 'Executive Summary' },
                  { id: 'detailed', label: 'Detailed Summary' },
                  { id: 'mom', label: 'MOM Minutes' },
                  { id: 'transcript', label: 'Transcript & Riva' },
                  { id: 'decisions', label: 'Decisions' },
                  { id: 'tasks', label: 'Action Items' },
                  { id: 'risks', label: 'Risks & Questions' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'participants', label: 'Participants' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailSubTab(tab.id as any)}
                    className={`pb-2 transition-colors cursor-pointer shrink-0 border-b-2 ${
                      detailSubTab === tab.id ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Panes */}
              {detailSubTab === 'executive' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-900 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Executive Summary (Meta Llama 3.3 70B Instruct)
                    </h3>
                    <p className="text-slate-800 text-xs leading-relaxed">
                      {activeCollection.executiveSummary || activeCollection.summary}
                    </p>
                  </div>

                  {activeCollection.keyHighlights && activeCollection.keyHighlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Key Highlights</h4>
                      <div className="space-y-1.5">
                        {activeCollection.keyHighlights.map((kh, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span>{kh}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {detailSubTab === 'detailed' && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Comprehensive Meeting Breakdown</h3>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                    {activeCollection.detailedSummary || activeCollection.summary}
                  </div>

                  {activeCollection.keyDiscussionPoints && activeCollection.keyDiscussionPoints.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Key Discussion Topics</h4>
                      <ul className="space-y-1 text-xs text-slate-700 list-disc pl-5">
                        {activeCollection.keyDiscussionPoints.map((dp, i) => (
                          <li key={i}>{dp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {detailSubTab === 'mom' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Formal Minutes of Meeting (MOM)</h3>
                    <button
                      onClick={() => setIsDownloadModalOpen(true)}
                      className="text-xs text-indigo-600 font-bold underline cursor-pointer"
                    >
                      Download MOM Document
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-3 font-sans">
                    <p><strong>Meeting Title:</strong> {activeCollection.title}</p>
                    <p><strong>Organizer:</strong> {activeCollection.organizer}</p>
                    <p><strong>Date & Time:</strong> {activeCollection.date} at {activeCollection.time}</p>
                    <hr className="border-slate-200" />
                    <p className="leading-relaxed">{activeCollection.summary}</p>
                  </div>
                </div>
              )}

              {detailSubTab === 'transcript' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <input
                      type="text"
                      value={transcriptSearch}
                      onChange={(e) => setTranscriptSearch(e.target.value)}
                      placeholder="Search dialogue..."
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 w-full max-w-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowOriginalTranscript(!showOriginalTranscript)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                          showOriginalTranscript ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {showOriginalTranscript ? 'Showing Original' : 'Showing NVIDIA Riva Translation'}
                      </button>

                      <button
                        onClick={handleCopyTranscript}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 cursor-pointer"
                      >
                        {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{copiedTranscript ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1 font-sans text-xs">
                    {activeCollection.transcript && activeCollection.transcript.length > 0 ? (
                      activeCollection.transcript
                        .filter(t => !transcriptSearch || t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) || t.speaker.toLowerCase().includes(transcriptSearch.toLowerCase()))
                        .map((line, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <strong className="text-indigo-900 font-bold">{line.speaker}</strong>
                              <span className="text-slate-400">{line.time}</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed">
                              {showOriginalTranscript ? line.text : (line.translatedText || line.text)}
                            </p>
                            {line.language && !showOriginalTranscript && line.language !== 'English' && (
                              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-semibold border border-purple-200/60 inline-block">
                                Translated from {line.language} via NVIDIA Riva
                              </span>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-slate-500 text-xs text-center py-4">No transcript dialogue available.</p>
                    )}
                  </div>
                </div>
              )}

              {detailSubTab === 'decisions' && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Identified Decisions</h3>
                  <div className="space-y-2">
                    {activeCollection.keyDecisions && activeCollection.keyDecisions.length > 0 ? (
                      activeCollection.keyDecisions.map((dec: any, i) => {
                        const text = typeof dec === 'string' ? dec : dec.text;
                        const impact = typeof dec === 'object' ? dec.impact : 'HIGH';
                        return (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{text}</p>
                              {typeof dec === 'object' && dec.category && (
                                <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-semibold">
                                  Category: {dec.category} (Impact: {impact})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-xs text-center py-4">No explicit decisions logged.</p>
                    )}
                  </div>
                </div>
              )}

              {detailSubTab === 'tasks' && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Action Items & Deliverables</h3>
                  <div className="space-y-2">
                    {activeCollection.actionItems && activeCollection.actionItems.length > 0 ? (
                      activeCollection.actionItems.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleActionItem(task.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            task.completed ? 'bg-emerald-50/50 border-emerald-200 opacity-75' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {task.text}
                              </p>
                              <span className="font-mono text-[10px] text-slate-500">
                                Assignee: {task.assignee || 'Unassigned'} • Due: {task.dueDate || 'TBD'}
                              </span>
                            </div>
                          </div>
                          <span className={`font-mono text-[9.5px] font-bold px-2 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                            {task.priority || 'MED'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs text-center py-4">No action items logged.</p>
                    )}
                  </div>
                </div>
              )}

              {detailSubTab === 'risks' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Identified Meeting Risks
                    </h3>
                    {activeCollection.risks && activeCollection.risks.length > 0 ? (
                      activeCollection.risks.map((r) => (
                        <div key={r.id} className="p-3 bg-red-50/50 border border-red-200/80 rounded-xl space-y-1 text-xs">
                          <strong className="text-red-950 font-bold block">{r.risk}</strong>
                          {r.mitigation && <p className="text-slate-700">Mitigation: {r.mitigation}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs py-2">No critical risks identified.</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-150">
                    <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      Questions Raised
                    </h3>
                    {activeCollection.questionsRaised && activeCollection.questionsRaised.length > 0 ? (
                      activeCollection.questionsRaised.map((q) => (
                        <div key={q.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                          <p className="font-bold text-slate-900">{q.question}</p>
                          <span className="font-mono text-[10px] text-slate-500">Asked by: {q.askedBy || 'Participant'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs py-2">No unresolved questions logged.</p>
                    )}
                  </div>
                </div>
              )}

              {detailSubTab === 'timeline' && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Conversation Timeline</h3>
                  {activeCollection.timeline && activeCollection.timeline.length > 0 ? (
                    <div className="space-y-2 border-l-2 border-indigo-200 pl-4 ml-1">
                      {activeCollection.timeline.map((ev, i) => (
                        <div key={i} className="relative space-y-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute -left-[21px] top-1 border-2 border-white" />
                          <span className="font-mono text-[10px] text-indigo-700 font-bold">{ev.time} - {ev.speaker}</span>
                          <h4 className="font-bold text-xs text-slate-900">{ev.title}</h4>
                          <p className="text-xs text-slate-600">{ev.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs py-4 text-center">Timeline details unavailable.</p>
                  )}
                </div>
              )}

              {detailSubTab === 'participants' && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">Attending Participants ({activeCollection.participantsList?.length || 0})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeCollection.participantsList && activeCollection.participantsList.map((p, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0 font-sans">
                          <p className="font-bold text-xs text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{p.role}</p>
                          {p.joinTime && <span className="text-[9.5px] font-mono text-indigo-700 block">Joined {p.joinTime}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              Select a meeting card to inspect full AI Intelligence.
            </div>
          )}
        </div>
      </div>

      {/* Fluent UI Download Center Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && activeCollection && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-display font-bold text-base text-slate-900">Download Center</h3>
                </div>
                <button onClick={() => setIsDownloadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div className="space-y-1.5">
                  <label className="font-mono font-bold text-slate-700 uppercase tracking-wider block">Target Document</label>
                  <select
                    value={downloadTargetDoc}
                    onChange={(e: any) => setDownloadTargetDoc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900"
                  >
                    <option value="Complete Meeting Report">Complete Meeting Report (All Sections)</option>
                    <option value="MOM">Meeting Minutes (MOM)</option>
                    <option value="Executive Summary">Executive Summary</option>
                    <option value="Detailed Summary">Detailed Summary</option>
                    <option value="Full Transcript">Full Transcript</option>
                    <option value="Translated Transcript">Translated Transcript (NVIDIA Riva)</option>
                    <option value="Action Item Report">Action Item Report</option>
                    <option value="Decision Report">Decision Report</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono font-bold text-slate-700 uppercase tracking-wider block">Document Format</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['PDF', 'DOCX', 'Markdown', 'TXT'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setDownloadFormat(fmt)}
                        className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                          downloadFormat === fmt ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono space-y-1">
                  <span className="text-slate-400 block">COMPANY BRANDING ATTACHED</span>
                  <p className="text-slate-800 font-bold">Includes company metadata, attendee roster, and AI timestamps.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-150">
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDownload}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Generate & Download
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
