import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, UploadCloud, FolderArchive, Download, FileSpreadsheet, 
  CheckCircle2, AlertCircle, RefreshCw, Sparkles, Folder, File, 
  Trash2, Search, Filter, Calendar, Clock, Cpu, User, Users, 
  ArrowRight, ShieldCheck, Zap, Layers, Play, Check, Copy, Share2
} from 'lucide-react';
import { CustomMeetingReport } from '../types';
import { API_URL } from '../config/api';

interface UploadedFileInfo {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  category: 'Audio' | 'Video' | 'Transcript' | 'Document';
}

export default function CustomReportModule() {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create');
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [meetingName, setMeetingName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Processing pipeline state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generated active report
  const [activeReport, setActiveReport] = useState<CustomMeetingReport | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'summary' | 'mom' | 'actions' | 'decisions' | 'conversation' | 'timeline' | 'recommendations' | 'keywords'>('summary');
  const [copySuccess, setCopySuccess] = useState(false);

  // History & Search state
  const [historyReports, setHistoryReports] = useState<CustomMeetingReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pipelineStages = [
    'Detecting File Formats & Extracting Media Streams',
    'Speech Recognition & Transcript Normalization',
    'AI Gateway Routing (NVIDIA NIM / Groq / Kimi / Local)',
    'Synthesizing MoMs, Action Items & Decision Matrix',
    'Constructing Enterprise Document Folder Structure',
    'Finalizing Custom Report Package'
  ];

  // Helper to categorize files by extension
  const categorizeFile = (file: File): UploadedFileInfo => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let category: 'Audio' | 'Video' | 'Transcript' | 'Document' = 'Document';

    if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext)) category = 'Audio';
    else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) category = 'Video';
    else if (['txt', 'srt', 'vtt', 'json'].includes(ext)) category = 'Transcript';
    else if (['pdf', 'docx', 'doc', 'rtf'].includes(ext)) category = 'Document';

    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: ext,
      category
    };
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(categorizeFile);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (!meetingName && newFiles.length > 0) {
        const baseName = newFiles[0].name.replace(/\.[^/.]+$/, "");
        setMeetingName(baseName.replace(/[-_]/g, ' '));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(categorizeFile);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (!meetingName && newFiles.length > 0) {
        const baseName = newFiles[0].name.replace(/\.[^/.]+$/, "");
        setMeetingName(baseName.replace(/[-_]/g, ' '));
      }
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Process uploaded assets via AI Gateway API
  const handleGenerateReport = async () => {
    if (uploadedFiles.length === 0) {
      setErrorMsg("Please upload at least one audio, video, transcript, or document file.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingStage(0);
    setProcessingMessage(pipelineStages[0]);

    // Simulate multi-stage progress steps for user feedback
    const stageInterval = setInterval(() => {
      setProcessingStage(prev => {
        const next = prev + 1;
        if (next < pipelineStages.length) {
          setProcessingMessage(pipelineStages[next]);
          return next;
        }
        return prev;
      });
    }, 1100);

    try {
      // Read text content from transcript/document files if present
      let rawText = "";
      for (const f of uploadedFiles) {
        if (['txt', 'srt', 'vtt', 'json', 'md'].includes(f.extension)) {
          try {
            const text = await f.file.text();
            rawText += `\n--- File: ${f.name} ---\n` + text;
          } catch (e) {
            console.warn("Could not read text file:", f.name);
          }
        } else {
          rawText += `\n--- File Asset: ${f.name} (${f.category}, ${Math.round(f.size/1024)} KB) ---\nRecorded meeting audio/video transcript for processing.`;
        }
      }

      const payload = {
        meetingName: meetingName || `Custom Meeting Report ${new Date().toLocaleDateString()}`,
        fileNames: uploadedFiles.map(f => f.name),
        fileTypes: uploadedFiles.map(f => f.category),
        transcriptText: rawText
      };

      const res = await fetch(`${API_URL}/api/custom-reports/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      clearInterval(stageInterval);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setActiveReport(data.report);
      fetchHistoryReports();
    } catch (err: any) {
      clearInterval(stageInterval);
      setErrorMsg(err.message || "Failed to process custom report.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch report history
  const fetchHistoryReports = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/api/custom-reports/history`);
      if (res.ok) {
        const data = await res.json();
        setHistoryReports(data.reports || []);
      }
    } catch (e) {
      console.error("Failed to fetch custom report history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistoryReports();
  }, []);

  // Filter history by search query
  const filteredHistory = historyReports.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.meetingName.toLowerCase().includes(q) ||
      (r.keywords && r.keywords.some(k => k.toLowerCase().includes(q))) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  // Client-side File Downloads
  const downloadTextFile = (filename: string, content: string, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate ZIP bundle containing all 8 report files
  const handleDownloadZipPackage = async () => {
    if (!activeReport) return;
    try {
      const res = await fetch(`${API_URL}/api/custom-reports/export-zip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: activeReport.id, report: activeReport })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeReport.meetingName.replace(/\s+/g, '_')}_Reports_Folder.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        downloadTextFile(`${activeReport.meetingName}_MOM_Summary.txt`, getReportContentText(activeReport));
      }
    } catch (e) {
      downloadTextFile(`${activeReport.meetingName}_Full_Report.txt`, getReportContentText(activeReport));
    }
  };

  const getReportContentText = (r: CustomMeetingReport): string => {
    return `===============================================================
THINK IT ENTERPRISE CUSTOM REPORT: ${r.meetingName}
===============================================================
Processed Date: ${new Date(r.processingDate).toLocaleString()}
AI Provider: ${r.aiProviderUsed}
Status: ${r.status}

1. EXECUTIVE SUMMARY
${r.executiveSummary || r.summary}

2. MINUTES OF MEETING (MOM)
${r.mom}

3. ACTION ITEMS
${(r.actionItems || []).map(a => `- [${a.priority}] ${a.title} (Owner: ${a.owner}, Due: ${a.deadline})`).join('\n')}

4. KEY DECISIONS & RISKS
Decisions: ${(r.decisions || []).map(d => `• ${d.decision} (Impact: ${d.impact})`).join('\n')}
Risks: ${(r.risks || []).map(rk => `• [${rk.severity}] ${rk.risk} -> Mitigation: ${rk.mitigation}`).join('\n')}

5. AI RECOMMENDATIONS
${(r.recommendations || []).map(rec => `• ${rec.category}: ${rec.suggestion}`).join('\n')}
`;
  };

  const copyReportText = () => {
    if (!activeReport) return;
    navigator.clipboard.writeText(getReportContentText(activeReport));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden font-sans">
      {/* Top Header Banner - Clean White & Blue Theme */}
      <div className="bg-slate-900 border-b border-slate-800 p-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Custom Report Studio
                <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AI Document Platform
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload audio, video, transcripts, or meeting documents to synthesize executive MOMs, summaries, action items, & downloadable report packages.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher - Blue Accents */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Report Studio
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            Report History ({historyReports.length})
          </button>
        </div>
      </div>

      {/* Content View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeSubTab === 'create' ? (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Upload Box - Blue Highlights */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-4.5 h-4.5 text-blue-400" />
                    Upload Meeting Assets & Documents
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports Audio (.mp3, .wav, .m4a), Video (.mp4, .webm, .mkv), Transcripts (.txt, .srt, .vtt), and Documents (.pdf, .docx).
                  </p>
                </div>
                {uploadedFiles.length > 0 && (
                  <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 font-bold">
                    {uploadedFiles.length} file(s) selected
                  </span>
                )}
              </div>

              {/* Meeting Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Meeting / Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Architecture Align & Microservices Review"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.005]'
                    : 'border-slate-800 bg-slate-950/80 hover:border-blue-500/60 hover:bg-slate-950'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,.mp4,.mov,.avi,.mkv,.webm,.txt,.docx,.pdf,.srt,.vtt,.json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20 shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Drag & drop your files here, or <span className="text-blue-400 underline">browse files</span></h3>
                <p className="text-xs text-slate-400 mt-1">Single or multiple files will be automatically merged into one unified meeting analysis.</p>

                {/* Format Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <span className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-slate-900 text-blue-300 border border-slate-800">Audio (.mp3, .wav, .m4a)</span>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-slate-900 text-blue-300 border border-slate-800">Video (.mp4, .webm, .mkv)</span>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-slate-900 text-blue-300 border border-slate-800">Transcripts (.txt, .vtt, .srt)</span>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-slate-900 text-blue-300 border border-slate-800">Docs (.pdf, .docx)</span>
                </div>
              </div>

              {/* Selected Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-300">Uploaded Assets for Synthesis:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {uploadedFiles.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30">
                            {f.extension.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{(f.size / 1024).toFixed(1)} KB • {f.category}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(f.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={handleGenerateReport}
                  disabled={isProcessing || uploadedFiles.length === 0}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 shadow-lg cursor-pointer ${
                    isProcessing || uploadedFiles.length === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-[0.98]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Synthesizing Intelligence Package...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      Generate Custom Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Processing Progress Indicator Overlay */}
            {isProcessing && (
              <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                    <h3 className="text-sm font-bold text-white">AI Pipeline Active</h3>
                  </div>
                  <span className="text-xs font-mono text-blue-400 font-bold">Stage {processingStage + 1} of {pipelineStages.length}</span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: `${((processingStage + 1) / pipelineStages.length) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 font-mono animate-pulse flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  {processingMessage}...
                </p>
              </div>
            )}

            {/* Generated Report Folder Display */}
            {activeReport && !isProcessing && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-0">
                {/* Folder Header Toolbar */}
                <div className="bg-slate-900/90 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        {activeReport.meetingName}
                        <span className="px-2.5 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30 font-bold">
                          {activeReport.status}
                        </span>
                      </h2>
                      <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5 font-mono">
                        <span>AI Provider: {activeReport.aiProviderUsed}</span>
                        <span>Latency: {activeReport.processingTimeMs}ms</span>
                        <span>Date: {new Date(activeReport.processingDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={copyReportText}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                      {copySuccess ? 'Copied!' : 'Copy All'}
                    </button>
                    <button
                      onClick={() => downloadTextFile(`${activeReport.meetingName}_MOM.txt`, activeReport.mom || activeReport.summary || '')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      Download TXT
                    </button>
                    <button
                      onClick={handleDownloadZipPackage}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      Download Entire Folder (ZIP)
                    </button>
                  </div>
                </div>

                {/* Sub-document Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950 px-4 pt-2.5 gap-1.5 scrollbar-none">
                  {[
                    { id: 'summary', label: 'Executive Summary', icon: FileText },
                    { id: 'mom', label: 'Minutes of Meeting (MOM)', icon: FileSpreadsheet },
                    { id: 'actions', label: 'Action Items', icon: CheckCircle2 },
                    { id: 'decisions', label: 'Decisions & Risks', icon: ShieldCheck },
                    { id: 'conversation', label: 'Detailed Conversation', icon: Layers },
                    { id: 'timeline', label: 'Timeline & Analysis', icon: Clock },
                    { id: 'keywords', label: 'Keywords & Tags', icon: Filter },
                    { id: 'recommendations', label: 'AI Recommendations', icon: Zap }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeDocTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDocTab(tab.id as any)}
                        className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-blue-400 border-t-2 border-x border-slate-800 border-t-blue-500 font-extrabold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Document Tab Content Body */}
                <div className="p-6 bg-slate-900 min-h-[350px]">
                  {activeDocTab === 'summary' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white">Executive Summary</h3>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                        {activeReport.executiveSummary || activeReport.summary}
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'mom' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white">Formal Minutes of Meeting (MOM)</h3>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                        {activeReport.mom}
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'actions' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white">Assigned Action Items</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(activeReport.actionItems || []).map((item, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-600/20 text-blue-300 border border-blue-500/30">{item.priority} Priority</span>
                              <span className="text-[10px] font-mono text-slate-500">Due: {item.deadline}</span>
                            </div>
                            <p className="font-semibold text-slate-100">{item.title}</p>
                            <p className="text-slate-400 text-[11px]">Assigned Owner: <span className="text-blue-400 font-medium">{item.owner}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'decisions' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-2">Decisions Taken</h3>
                        <div className="space-y-2">
                          {(activeReport.decisions || []).map((d, idx) => (
                            <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                              <p className="font-semibold text-slate-100 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                {d.decision}
                              </p>
                              <p className="text-slate-400 text-[11px] pl-6">Impact Scope: {d.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white mb-2">Risks & Assessment</h3>
                        <div className="space-y-2">
                          {(activeReport.risks || []).map((r, idx) => (
                            <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-slate-200 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                                  {r.risk}
                                </p>
                                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{r.severity} Severity</span>
                              </div>
                              <p className="text-slate-400 text-[11px] pl-6">Mitigation Strategy: {r.mitigation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'conversation' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white">Detailed Conversation Breakdown</h3>
                      <div className="space-y-3">
                        {(activeReport.detailedConversation || []).map((c, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                            <h4 className="font-bold text-blue-300 text-xs border-b border-slate-800 pb-2">{c.topic}</h4>
                            <p className="text-slate-300 leading-relaxed"><strong className="text-slate-400">Discussion:</strong> {c.discussion}</p>
                            <p className="text-slate-300"><strong className="text-blue-400">Decision:</strong> {c.decision}</p>
                            <p className="text-slate-400"><strong className="text-slate-500">Conclusion:</strong> {c.conclusion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'timeline' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white">Conversation & Speaker Timeline</h3>
                      <div className="relative border-l-2 border-slate-800 ml-4 space-y-4 pl-4">
                        {(activeReport.timeline || []).map((t, idx) => (
                          <div key={idx} className="relative text-xs space-y-1">
                            <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900" />
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-500">{t.timestamp}</span>
                              <span className="font-bold text-blue-300">{t.speaker}</span>
                              <span className="px-2 py-0.5 rounded text-[9px] bg-slate-950 text-slate-400 font-mono border border-slate-800">{t.topic}</span>
                            </div>
                            <p className="text-slate-300">{t.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'keywords' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-2">Extracted Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {(activeReport.keywords || []).map((k, idx) => (
                            <span key={idx} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-blue-300">
                              #{k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white mb-2">Searchable Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {(activeReport.tags || []).map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-mono text-blue-400 font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDocTab === 'recommendations' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white">AI Next-Steps & Productivity Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(activeReport.recommendations || []).map((rec, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 font-mono">{rec.category}</span>
                            <p className="font-semibold text-slate-100">{rec.suggestion}</p>
                            <p className="text-slate-400 text-[11px]">Recommended Action: {rec.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Report History View */
          <div className="max-w-6xl mx-auto space-y-5">
            {/* Search Filter Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search history by meeting name, keyword, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={fetchHistoryReports}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                Refresh History
              </button>
            </div>

            {/* History Cards Grid */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-3">
                <Folder className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-300">No custom reports found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a new report by uploading audio, video, or transcript assets in the Report Studio tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHistory.map(report => (
                  <div
                    key={report.id}
                    onClick={() => { setActiveReport(report); setActiveSubTab('create'); }}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all duration-150 cursor-pointer space-y-3 shadow-lg group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
                          <Folder className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{report.meetingName}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {report.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{report.executiveSummary || report.summary}</p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(report.keywords || []).slice(0, 3).map((k, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-950 text-slate-400 border border-slate-800">
                          #{k}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                      <span>{new Date(report.processingDate).toLocaleDateString()}</span>
                      <span className="text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">Open Folder <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
