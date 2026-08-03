import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Bot, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Globe,
  Bell,
  Cpu,
  RefreshCw,
  Video,
  Languages,
  Info,
  Check,
  Zap,
  Sparkles,
  Layers,
  Download
} from 'lucide-react';

interface SettingsTabProps {
  addLog: (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', message: string) => void;
}

export default function SettingsTab({ addLog }: SettingsTabProps) {
  // Settings States
  const [botName, setBotName] = useState<string>('Meeting Memory AI');
  const [autoProcess, setAutoProcess] = useState<boolean>(true);
  const [autoSummary, setAutoSummary] = useState<boolean>(true);
  const [autoMOM, setAutoMOM] = useState<boolean>(true);
  const [autoActionItems, setAutoActionItems] = useState<boolean>(true);
  const [autoDecisions, setAutoDecisions] = useState<boolean>(true);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [processingLanguage, setProcessingLanguage] = useState<string>('Auto Detect');

  const handleSaveBotName = () => {
    addLog('SUCCESS', `Assistant bot display name updated to: '${botName}'.`);
  };

  const handleToggle = (settingLabel: string, currentValue: boolean, setter: (val: boolean) => void) => {
    const newVal = !currentValue;
    setter(newVal);
    addLog('INFO', `Preference '${settingLabel}' set to ${newVal ? 'ENABLED' : 'DISABLED'}.`);
  };

  const handleLanguageChange = (lang: string) => {
    setProcessingLanguage(lang);
    addLog('SUCCESS', `AI processing language target updated to: ${lang}.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-6 font-sans text-slate-800"
    >
      {/* Top Banner: Architecture & AI Model Telemetry */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              Microsoft Teams AI Pipeline Telemetry
              <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                Active & Healthy
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              LLM: <strong className="text-slate-800 font-mono">meta/llama-3.3-70b-instruct</strong> • Translation: <strong className="text-slate-800 font-mono">NVIDIA Riva</strong> • Architecture: <strong className="text-indigo-600 font-mono">NVIDIA Nemotron Ready</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Nemotron Bridge Ready</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Bot Identity & Automation Toggles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-150 pb-3">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
              Assistant Identity & Preferences
            </h3>
          </div>

          {/* Bot Name Editor */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
              Assistant Display Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. Meeting Memory AI"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                onClick={handleSaveBotName}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              This name will be displayed in Teams meeting transcripts and AI documentation.
            </p>
          </div>

          {/* Processing Language Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              Processing Language Target
            </label>
            <select
              value={processingLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Auto Detect">Auto Detect (Recommended)</option>
              <option value="English">English</option>
              <option value="Malayalam">Malayalam (മലയാളം)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="French">French (Français)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              NVIDIA Riva Translation will automatically convert regional dialogue into English summaries.
            </p>
          </div>

          {/* Notifications Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Notify When Processing Completes
              </span>
              <p className="text-[11px] text-slate-500">
                Receive Teams notifications when AI reports are saved into Collection.
              </p>
            </div>
            <button
              onClick={() => handleToggle('Processing Notifications', notifications, setNotifications)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Card 2: AI Processing Toggles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-150 pb-3">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
              Automatic Processing Rules
            </h3>
          </div>

          <div className="space-y-3 text-xs font-medium">
            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automatically Process Eligible Meetings</span>
                <span className="text-[11px] text-slate-500">Auto-ingest scheduled Teams calls for AI processing</span>
              </div>
              <button
                onClick={() => handleToggle('Auto Process Meetings', autoProcess, setAutoProcess)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoProcess ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoProcess ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automatically Generate AI Summary</span>
                <span className="text-[11px] text-slate-500">Extract Executive & Detailed summaries with Llama 3.3 70B</span>
              </div>
              <button
                onClick={() => handleToggle('Auto AI Summary', autoSummary, setAutoSummary)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoSummary ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoSummary ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automatically Generate Meeting Minutes (MOM)</span>
                <span className="text-[11px] text-slate-500">Format formal MOM documents ready for PDF export</span>
              </div>
              <button
                onClick={() => handleToggle('Auto MOM Generation', autoMOM, setAutoMOM)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoMOM ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoMOM ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automatically Generate Action Items</span>
                <span className="text-[11px] text-slate-500">Assign task items with priorities and due dates</span>
              </div>
              <button
                onClick={() => handleToggle('Auto Action Items', autoActionItems, setAutoActionItems)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoActionItems ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoActionItems ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automatically Generate Decisions</span>
                <span className="text-[11px] text-slate-500">Highlight key architectural and strategic decisions</span>
              </div>
              <button
                onClick={() => handleToggle('Auto Decision Tracking', autoDecisions, setAutoDecisions)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoDecisions ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoDecisions ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automatically Translate Transcript</span>
                <span className="text-[11px] text-slate-500">Translate non-English dialogue into English via NVIDIA Riva</span>
              </div>
              <button
                onClick={() => handleToggle('Auto Translation', autoTranslate, setAutoTranslate)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoTranslate ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoTranslate ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Behavior Info & Plugin Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording Preference */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Video className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase font-mono tracking-wider">Recording Preference</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Meeting audio ingestion follows your organization's Microsoft Teams recording policies. The plugin operates securely within Azure AD tenant permissions and respects user recording consent settings.
          </p>
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Azure AD Tenant Policy Verified (OnlineMeetings.ReadWrite)</span>
          </div>
        </div>

        {/* Plugin Metadata Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-xs uppercase font-mono tracking-wider">Plugin System Information</h4>
            </div>
            <a
              href="/api/teams/package/download"
              download="manifest.json"
              className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Download official Microsoft Teams manifest.json package for Teams Admin Center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Manifest.json</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">PLUGIN VERSION</span>
              <strong className="text-slate-800 font-bold">v1.15.0-Enterprise</strong>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">CONNECTED ACCOUNT</span>
              <strong className="text-slate-800 font-bold truncate block">ajayaghosh.b@thinkpalm.com</strong>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">ORGANIZATION</span>
              <strong className="text-slate-800 font-bold">ThinkPalm Technologies</strong>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">LAST SYNCHRONIZATION</span>
              <strong className="text-emerald-700 font-bold">Just now</strong>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">PRIMARY LLM</span>
              <strong className="text-indigo-700 font-bold truncate block">meta/llama-3.3-70b-instruct</strong>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">TRANSLATION ENGINE</span>
              <strong className="text-indigo-700 font-bold truncate block">NVIDIA Riva Translation</strong>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
