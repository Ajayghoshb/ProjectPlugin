import React, { useState } from 'react';
import { Sparkles, Calendar, Users, AlertCircle, RefreshCw, Layers, CheckCircle2, X } from 'lucide-react';
import { TeamMember } from '../types';

interface AIAssistantProps {
  members: TeamMember[];
  checkedEmails: string[];
  date: string;
  onClose: () => void;
  onApplyTime: (startTime: string, endTime: string) => void;
}

export default function AIAssistant({
  members,
  checkedEmails,
  date,
  onClose,
  onApplyTime
}: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [adviceText, setAdviceText] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [duration, setDuration] = useState("30");

  const queryAISuggestions = async () => {
    setLoading(true);
    setAdviceText("");
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: checkedEmails,
          date: date,
          durationMinutes: parseInt(duration),
          priorityLevel: priority
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAdviceText(data.suggestions);
      } else {
        setAdviceText("Unable to retrieve AI advice at this moment.");
      }
    } catch (e) {
      console.error(e);
      setAdviceText("Service error analyzing calendar integrations.");
    } finally {
      setLoading(false);
    }
  };

  // Extract candidate times from adviceText (to support direct click-to-populate features)
  const extractAndMatchSlots = (): string[] => {
    // Standard times match regex like "09:00", "09:30", "11:00", etc.
    const timesReg = /\b([01]\d|2[023]):(00|30)\b/g;
    const matches = adviceText.match(timesReg);
    if (!matches) return [];
    
    // Remove duplicates
    return Array.from(new Set(matches)).slice(0, 4) as string[];
  };

  const detectedSlots = extractAndMatchSlots();

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="ai-assistant-modal">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/35 border border-indigo-500/30 flex items-center justify-center font-bold text-white">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base leading-tight">Gemini 3.5 AI Scheduling Assistant</h3>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">Automating conflict resolutions and timeline optimizations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            id="btn-close-ai-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Constraints summary info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-450 font-mono uppercase tracking-wider block text-[9px] font-bold">DATE TARGET</span>
              <span className="font-semibold text-slate-700 font-mono mt-0.5 block">{date}</span>
            </div>
            
            <div className="sm:col-span-2">
              <span className="text-slate-450 font-mono uppercase tracking-wider block text-[9px] font-bold">ANALYZING PARTICIPANTS ({checkedEmails.length})</span>
              <p className="font-mono text-[10.5px] mt-0.5 text-slate-600 truncate">{checkedEmails.join(', ')}</p>
            </div>
          </div>

          {/* Assistant input settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Meeting Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-xs bg-slate-50 focus:outline-none"
              >
                <option value="Low">Low - Reschedule easily if needed</option>
                <option value="Medium">Medium - Standard sprint balance</option>
                <option value="High">High - Overrides other events</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Expected Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-xs bg-slate-50 focus:outline-none"
              >
                <option value="30">30 Minutes (Recommended)</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
              </select>
            </div>
          </div>

          <button
            onClick={queryAISuggestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-700 to-indigo-850 text-white font-semibold text-xs py-3 rounded-xl cursor-pointer shadow-md shadow-indigo-600/10 transition-colors flex items-center justify-center gap-2"
            id="btn-trigger-ai-calc"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
                <span>Gemini is balancing calendar nodes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Optimize Calendar & Resolve Conflicts</span>
              </>
            )}
          </button>

          {/* Outputs from Gemini API */}
          {adviceText && (
            <div className="space-y-4 animate-fade-in" id="ai-advice-display-card">
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs leading-relaxed space-y-3.5 border border-slate-800 select-text overflow-x-auto">
                <span className="text-[10px] text-slate-400 font-bold block border-b border-slate-800 pb-1.5 font-sans flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unified Calendar Advice & Resolution
                </span>
                
                <div className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed max-w-full">
                  {adviceText}
                </div>
              </div>

              {/* Direct Time Binder block */}
              {detectedSlots.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4.5 space-y-3">
                  <div>
                    <h4 className="font-display font-semibold text-indigo-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> Direct Click-to-Apply Timeslots
                    </h4>
                    <p className="text-[10.5px] text-indigo-700 mt-0.5">We extracted candidate starts from the advice. Select a slot below to automatically configure your main scheduling form:</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detectedSlots.map((time, idx) => {
                      // Calc simple end time
                      const [h, m] = time.split(":");
                      const nextH = parseInt(h) + (m === "30" ? 1 : 0);
                      const nextM = m === "30" ? "00" : "30";
                      const endStr = `${nextH < 10 ? '0' + nextH : nextH}:${nextM}`;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            onApplyTime(time, endStr);
                            onClose();
                          }}
                          className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 text-xs border border-indigo-200 font-mono font-bold px-3 py-1.5 rounded-lg hover:shadow-md cursor-pointer transition-all flex items-center gap-1"
                          id={`apply-slot-btn-${idx}`}
                        >
                          {time} - {endStr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
