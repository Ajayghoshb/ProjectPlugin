import React, { useState, useEffect } from 'react';
import { CalendarDays, Users, Video, Clock, MapPin, Sparkles, Send, CheckCircle, ChevronDown, Check, Info, FileText } from 'lucide-react';
import { TeamMember, Project, Meeting } from '../types';

interface MeetingSchedulerProps {
  members: TeamMember[];
  projects: Project[];
  meetings: Meeting[];
  onAddMeeting: (meetingPayload: Partial<Meeting>) => Promise<any>;
  seededParams: { email: string; date: string; startTime: string } | null;
  onClearSeededParams: () => void;
  onOpenAIScheduler: (participants: string[], date: string) => void;
  onGenerateTakeaways?: (meetingId: string, customInstruction?: string) => Promise<any>;
}

export default function MeetingScheduler({
  members,
  projects,
  meetings,
  onAddMeeting,
  seededParams,
  onClearSeededParams,
  onOpenAIScheduler,
  onGenerateTakeaways
}: MeetingSchedulerProps) {
  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Primary state: selected project
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>(projects[0]?.key || "");

  // Input states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [type, setType] = useState<'Face-to-Face' | 'Online'>("Online");
  const [roomDetails, setRoomDetails] = useState("");
  const [description, setDescription] = useState("");

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  // Takeaway generation state hooks
  const [takeawayProgressId, setTakeawayProgressId] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState<{ [key: string]: string }>({});

  // Expansions inside the timeline to inspect AI minutes
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  // Scheduling output state
  const [schedulingResult, setSchedulingResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collapsible dropdown state for meetings lists (closed by default)
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Selected emails representing actual attendees
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [ignoreProjAutoSelect, setIgnoreProjAutoSelect] = useState(false);

  // If no selectedProjectKey is active, or if the previously selected key is no longer in the projects array, auto-select the first one.
  useEffect(() => {
    if (projects && projects.length > 0) {
      if (!selectedProjectKey || !projects.some(p => p.key === selectedProjectKey)) {
        setSelectedProjectKey(projects[0].key);
      }
    } else {
      setSelectedProjectKey("");
    }
  }, [projects, selectedProjectKey]);

  // Time options (30-minute intervals)
  const times = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const isMockEmail = (email: string): boolean => {
    if (!email) return true;
    const lower = email.toLowerCase().trim();
    return (
      lower.endsWith("@project.io") ||
      lower.endsWith(".local") ||
      lower.includes("atlassian.net") ||
      lower === "user@gmail.com" ||
      lower.includes("simulated") ||
      lower.includes("mock")
    );
  };

  // Filter members belonging to selected project: show only active offline and online (Available) users, and exclude 'Recheck' status users
  const projectMembers = members.filter(m => 
    m.projects.includes(selectedProjectKey) && 
    !isMockEmail(m.email) && 
    (m.presence === 'Offline' || m.presence === 'Available')
  );

  // Determine if all users in this project are currently checked
  const isAllProjectMembersChecked = projectMembers.length > 0 && projectMembers.every(m => selectedEmails.includes(m.email));

  // Toggle selection for all users under the active project
  const handleToggleSelectAllMembers = () => {
    if (isAllProjectMembersChecked) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(projectMembers.map(m => m.email));
    }
  };

  // Automatically select members tied to the active project when project selection changes manually
  useEffect(() => {
    if (ignoreProjAutoSelect) return;
    if (selectedProjectKey) {
      const projMembers = members.filter(m => 
        m.projects.includes(selectedProjectKey) && 
        !isMockEmail(m.email) && 
        (m.presence === 'Offline' || m.presence === 'Available')
      );
      setSelectedEmails(projMembers.map(m => m.email));
    } else {
      setSelectedEmails([]);
    }
  }, [selectedProjectKey, members, ignoreProjAutoSelect]);

  // React to quick bookings from user profile availability clicks
  useEffect(() => {
    if (seededParams) {
      setIgnoreProjAutoSelect(true);
      setDate(seededParams.date);
      setStartTime(seededParams.startTime);
      
      // Auto set end time to +30mins
      const startIdx = times.indexOf(seededParams.startTime);
      if (startIdx !== -1 && times[startIdx + 1]) {
        setEndTime(times[startIdx + 1]);
      } else {
        setEndTime(seededParams.startTime);
      }

      // Title suggestion
      setTitle(`Quick Sync Appointment`);

      // Auto check the seed member's email exclusively
      setSelectedEmails([seededParams.email]);

      // If the user belongs to a specific project, match and select that project key
      const member = members.find(m => m.email.toLowerCase() === seededParams.email.toLowerCase());
      if (member && member.projects.length > 0) {
        setSelectedProjectKey(member.projects[0]);
      }

      // Auto clear so it doesn't loop
      onClearSeededParams();
      
      // Release ignore constraint
      const timer = setTimeout(() => {
        setIgnoreProjAutoSelect(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [seededParams, members]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Please specify meeting title.");
      return;
    }
    if (selectedEmails.length === 0) {
      alert("Please select at least one target attendee to send email notification.");
      return;
    }

    const todayStr = getTodayDateString();
    if (date < todayStr) {
      alert("Cannot schedule a meeting on a past date.");
      return;
    }

    if (date === todayStr) {
      const d = new Date();
      const currentHHMM = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      if (startTime < currentHHMM) {
        alert(`Cannot schedule a past meeting. It is currently ${currentHHMM}. Please select a future start time.`);
        return;
      }
    }

    if (startTime >= endTime) {
      alert("Meeting end time must be after the start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Meeting> = {
        title,
        date,
        startTime,
        endTime,
        type,
        roomDetails: type === 'Face-to-Face' ? roomDetails : undefined,
        description,
        projectKey: selectedProjectKey,
        participants: selectedEmails
      };

      const result = await onAddMeeting(payload);
      setSchedulingResult(result);
      
      // Reset details
      setTitle("");
      setRoomDetails("");
      setDescription("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProject = projects.find(p => p.key === selectedProjectKey);

  // Filter meetings belonging to this project (matches key or name)
  const filteredMeetings = meetings.filter((m) => {
    if (!selectedProjectKey) return false;
    return (
      m.projectKey === selectedProjectKey ||
      m.projectName?.toUpperCase() === selectedProjectKey.toUpperCase() ||
      (selectedProject && m.projectName?.toLowerCase() === selectedProject.name?.toLowerCase())
    );
  });

  const todayStr = getTodayDateString();
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Distinguish Upcoming vs History
  const upcomingMeetings = filteredMeetings.filter((m) => {
    if (m.date > todayStr) return true;
    if (m.date < todayStr) return false;
    return m.startTime >= currentHHMM;
  });

  const pastMeetings = filteredMeetings.filter((m) => {
    if (m.date > todayStr) return false;
    if (m.date < todayStr) return true;
    return m.startTime < currentHHMM;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-slate-800 tracking-tight">The Scheduler</h2>
        </div>
      </div>

      {/* Prominent Project Selection Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-700 font-extrabold block">PROJECT FOCUS SCOPE</span>
            <h3 className="text-sm font-semibold text-slate-700 font-sans">Choose Project to View Members & Schedule Appointments:</h3>
          </div>
          <div className="relative min-w-[280px]">
            <select
              value={selectedProjectKey}
              onChange={(e) => {
                setSelectedProjectKey(e.target.value);
                setSchedulingResult(null);
              }}
              className="w-full border border-slate-250 px-4 py-3 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100/50 hover:border-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-slate-800 font-sans shadow-xs cursor-pointer appearance-none pr-10 transition-all"
              id="scheduler-project-focus-select"
            >
              <option value="">-- Choose a Project Hub --</option>
              {projects.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {selectedProjectKey && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: User Listing & Scheduling Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              {schedulingResult ? (
                /* Success booking alert screen */
                <div className="space-y-4 animate-fadeIn" id="scheduler-success-alert">
                  <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                    <h3 className="font-display font-bold text-slate-800 text-md">Meeting Fully Scheduled!</h3>
                    <p className="text-slate-500 text-xs">{schedulingResult.message}</p>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Consolidated API Sync Outputs</span>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs flex justify-between items-center text-slate-600 font-sans">
                        <span className="font-semibold flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400" /> Google Calendar Event Sync</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded uppercase">SUCCESS</span>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs flex flex-col gap-1.5 text-slate-600 font-sans">
                        <div className="flex justify-between items-center w-full">
                          <span className="font-semibold flex items-center gap-1.5"><Video className="w-4 h-4 text-slate-400" /> Microsoft Teams Entry</span>
                          <span className={`text-[10px] border font-bold px-2 py-0.5 rounded font-mono uppercase ${
                            schedulingResult.notifications?.isRealGraphSyncActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {schedulingResult.notifications?.isRealGraphSyncActive ? 'REAL_LIVE_AD_SYNCED' : (type === 'Online' ? 'PROXIED_ONLINE' : 'LOCAL')}
                          </span>
                        </div>
                        {schedulingResult.notifications?.graphStatusMessage && (
                          <div className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200/60 rounded px-2 py-1 mt-0.5 max-w-full truncate">
                            AD Status: {schedulingResult.notifications.graphStatusMessage}
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs flex justify-between items-center text-slate-600 font-sans">
                        <span className="font-semibold flex items-center gap-1.5"><Send className="w-4 h-4 text-slate-400" /> Email Status Logs</span>
                        <span className={`text-[10px] border font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          schedulingResult.notifications.emailSent 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {schedulingResult.notifications.emailType === 'REAL_SMTP' ? 'SMTP_REAL_SENT' : 'PREVIEW_SANDBOX_OK'}
                        </span>
                      </div>
                    </div>

                    {schedulingResult.notifications.previewUrl && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2" id="ethereal-preview-box">
                        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs font-display">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          <span>Sandbox Notification Dispatch Ready</span>
                        </div>
                        <p className="text-slate-600 text-[11.5px] leading-relaxed font-sans">
                          An authentic HTML email notification has been dispatched to <strong>{schedulingResult.notifications.recipientCSV}</strong>. Enjoy checking out the sandbox inbox below!
                        </p>
                        <a
                          href={schedulingResult.notifications.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md font-sans cursor-pointer transition-colors mt-1"
                        >
                          <span>Open Micro-Inbox Sandbox ↗</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSchedulingResult(null)}
                    className="w-full bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl cursor-pointer transition-colors text-center block border-none"
                  >
                    Schedule Another Meeting
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  {/* Step A: Users section representing the project */}
                  <div className="space-y-2.5 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-750 font-sans block">
                          Users under {selectedProject?.name || "current project"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-700 font-mono font-extrabold bg-white px-2 py-0.5 border border-slate-350 rounded shadow-3xs">
                        Checked: <strong className="text-indigo-600 font-black">{selectedEmails.length}</strong>
                      </span>
                    </div>

                    {/* Checkbox to select the whole team / users under project at once */}
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllMembers}
                        className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono font-bold px-3 py-1.5 rounded-lg border border-blue-100 transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                      >
                        <Users className="w-3 h-3" />
                        <span>{isAllProjectMembersChecked ? "Clear Selected Users" : "Select Whole User List"}</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 bg-white rounded-lg p-2 max-h-[160px] overflow-y-auto space-y-1 text-xs">
                      {projectMembers.map((m) => {
                        const isChecked = selectedEmails.includes(m.email);
                        return (
                          <label
                            key={m.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border ${
                              isChecked 
                                ? 'bg-blue-50/25 border-blue-200 shadow-3xs font-medium' 
                                : 'border-transparent text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmails((prev) => [...prev, m.email]);
                                } else {
                                  setSelectedEmails((prev) => prev.filter((email) => email !== m.email));
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <img
                              src={m.avatar}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="w-5.5 h-5.5 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-800 truncate leading-tight">{m.name}</div>
                              <div className="text-[11px] text-slate-650 truncate mt-0.5 font-mono font-bold">{m.email}</div>
                            </div>
                            <span className="text-[8.5px] bg-slate-100 text-slate-650 border border-slate-200 px-1.5 py-0.5 rounded font-semibold shrink-0 uppercase tracking-tight">
                              {m.role}
                            </span>
                          </label>
                        );
                      })}
                      {projectMembers.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400 italic">
                          No team members registered under this project hub yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step B: Scheduling form inputs */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 block">Meeting Purpose / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Malayalam Language Support Check"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-slate-250 px-3.5 py-2 rounded-lg text-xs bg-slate-100/30 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                        id="schedule-title-input"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 block">Meeting Description / Context (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Discuss Malayalam translation mappings for client review."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-slate-250 px-3.5 py-2 rounded-lg text-xs bg-slate-100/30 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 resize-none"
                        id="schedule-description-input"
                      />
                    </div>

                    {/* Date Picker Widget */}
                    <div className="space-y-2.5 bg-slate-50 border border-slate-200 p-4 rounded-xl" id="custom-scheduler-calendar-widget">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1 font-sans">
                          <span>📅</span> Date Selection
                        </label>
                        <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                          {date}
                        </span>
                      </div>

                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          const d = new Date(e.target.value);
                          if (!isNaN(d.getTime())) {
                            setCalMonth(d.getMonth());
                            setCalYear(d.getFullYear());
                          }
                        }}
                        className="w-full border border-slate-200 px-3 py-2 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs font-mono cursor-pointer"
                        id="schedule-date-input"
                      />

                      {/* Calendar Picker UI */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 select-none">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              if (calMonth === 0) {
                                setCalMonth(11);
                                setCalYear((y) => y - 1);
                              } else {
                                setCalMonth((m) => m - 1);
                              }
                            }}
                            className="p-1 px-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors text-xs font-bold"
                          >
                            ◀
                          </button>
                          <span className="text-xs font-bold text-slate-805 font-display">
                            {monthNames[calMonth]} {calYear}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (calMonth === 11) {
                                setCalMonth(0);
                                setCalYear((y) => y + 1);
                              } else {
                                setCalMonth((m) => m + 1);
                              }
                            }}
                            className="p-1 px-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors text-xs font-bold"
                          >
                            ▶
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-slate-400 uppercase">
                          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const daysInMonth = getDaysInMonth(calMonth, calYear);
                            const firstDayIdx = getFirstDayOfMonth(calMonth, calYear);
                            const dayCells = [];

                            // padding
                            for (let i = 0; i < firstDayIdx; i++) {
                              dayCells.push(
                                <div key={`cal-empty-${i}`} className="h-8 bg-slate-50/20 rounded opacity-20" />
                              );
                            }

                            // days
                            for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                              const monthStr = String(calMonth + 1).padStart(2, '0');
                              const dayStr = String(dayNum).padStart(2, '0');
                              const dateString = `${calYear}-${monthStr}-${dayStr}`;

                              const isSelected = date === dateString;
                              const isToday = getTodayDateString() === dateString;

                              // check if there are meetings in this date
                              const dayMeetings = meetings.filter((m) => m.date === dateString);
                              const hasMeetings = dayMeetings.length > 0;

                              dayCells.push(
                                <button
                                  key={`cal-day-${dayNum}`}
                                  type="button"
                                  onClick={() => setDate(dateString)}
                                  className={`h-8 flex flex-col items-center justify-between py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all border ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-700'
                                      : isToday
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-350'
                                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>{dayNum}</span>
                                  {hasMeetings && (
                                    <span className={`h-1.25 w-1.25 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-blue-600'}`}></span>
                                  )}
                                </button>
                              );
                            }
                            return dayCells;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Format Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Meeting Format</label>
                      <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-0.5 gap-0.5 text-xs text-center border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setType('Online')}
                          className={`py-2 rounded-md cursor-pointer flex items-center justify-center gap-1.5 font-medium ${
                            type === 'Online' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 text-blue-500" />
                          Online (Teams)
                        </button>
                        <button
                          type="button"
                          onClick={() => setType('Face-to-Face')}
                          className={`py-2 rounded-md cursor-pointer flex items-center justify-center gap-1.5 font-medium ${
                            type === 'Face-to-Face' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-505 text-rose-600" />
                          Face-to-Face
                        </button>
                      </div>
                    </div>

                    {/* Room Details if Face to Face */}
                    {type === 'Face-to-Face' && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-xs font-bold text-slate-700 block">Specify Meeting Room</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Conference Room 302, 3rd Floor"
                          value={roomDetails}
                          onChange={(e) => setRoomDetails(e.target.value)}
                          className="w-full border border-slate-250 px-3.5 py-2 rounded-lg text-xs bg-slate-100/30 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                          id="schedule-room-input"
                        />
                      </div>
                    )}

                    {/* Start & End Time select dropdown */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Start Time</label>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full border border-slate-250 px-3.5 py-2 rounded-lg text-xs bg-slate-50 text-slate-700 font-mono focus:outline-none focus:bg-white cursor-pointer"
                        >
                          {times.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">End Time</label>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full border border-slate-250 px-3.5 py-2 rounded-lg text-xs bg-slate-50 text-slate-700 font-mono focus:outline-none focus:bg-white cursor-pointer"
                        >
                          {times.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl disabled:bg-slate-150 disabled:text-slate-400 shadow-md transition-all text-center uppercase tracking-wide cursor-pointer border-none"
                    id="btn-confirm-schedule"
                  >
                    {isSubmitting ? "Generating AI Transcripts & Syncing..." : "Schedule Meeting & Auto-Generate Minutes"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Scheduled Upcoming Meetings & Meeting History */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Scheduled Upcoming Meetings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <button
                type="button"
                onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
                className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 rounded-xl p-1 group"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-800 font-extrabold flex items-center gap-1.5 group-hover:text-slate-900 transition-colors">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                  Scheduled Upcoming Meetings ({upcomingMeetings.length})
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-700 transition-transform duration-250 ${isUpcomingExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isUpcomingExpanded && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 animate-fadeIn">
                  {upcomingMeetings.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <CalendarDays className="w-6 h-6 text-slate-350 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-400 italic">No upcoming meetings scheduled for this project.</p>
                    </div>
                  ) : (
                    upcomingMeetings.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition-all relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                              m.type === 'Online' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' : 'bg-rose-50 text-rose-700 border-rose-150'
                            }`}>
                              {m.type === 'Online' ? 'Teams Online' : `Room: ${m.roomDetails || 'Conference Room'}`}
                            </span>
                            <h4 className="font-display font-bold text-slate-800 text-sm leading-tight">{m.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">Host: {m.organizer}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-slate-700 font-mono">{m.startTime} - {m.endTime}</div>
                            <div className="text-[10px] text-slate-450 font-mono mt-0.5">{m.date}</div>
                          </div>
                        </div>

                        {/* Display attendee avatars quickly if available */}
                        {m.participants && m.participants.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/60 text-[10.5px] text-slate-500">
                            <span className="font-semibold text-slate-400 font-mono uppercase text-[9px]">Attendees:</span>
                            <div className="flex -space-x-1 overflow-hidden shrink-0">
                              {m.participants.slice(0, 6).map((email, pIdx) => {
                                const foundMem = members.find(u => u.email.toLowerCase() === email.toLowerCase());
                                return (
                                  <img
                                    key={pIdx}
                                    src={foundMem?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`}
                                    alt={email}
                                    title={foundMem?.name || email}
                                    className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 2. Historic Meetings & Transcript Audits */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 rounded-xl p-1 group"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-800 font-extrabold flex items-center gap-1.5 group-hover:text-slate-900 transition-colors">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Meeting History & AI Audited Minutes ({pastMeetings.length})
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-700 transition-transform duration-250 ${isHistoryExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isHistoryExpanded && (
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 animate-fadeIn">
                  {pastMeetings.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <Clock className="w-6 h-6 text-slate-350 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-400 italic">No past meeting records logged under this scope.</p>
                    </div>
                  ) : (
                    pastMeetings.map((m) => {
                      const isExpanded = expandedMeetingId === m.id;
                      return (
                        <div
                          key={m.id}
                          className={`border rounded-xl transition-all relative overflow-hidden ${
                            isExpanded ? 'bg-slate-55/65 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Header tab */}
                          <div
                            onClick={() => setExpandedMeetingId(isExpanded ? null : m.id)}
                            className="p-3.5 cursor-pointer select-none space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <span className="bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-600 font-mono text-[9px] font-bold px-2 py-0.5 rounded leading-none">
                                  ● {m.type === 'Online' ? 'Online' : 'In-Person'}
                                </span>
                                <h4 className="font-display font-semibold text-slate-800 text-xs sm:text-sm mt-1">{m.title}</h4>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-bold text-slate-700 font-mono">{m.startTime} - {m.endTime}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{m.date}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 font-sans">
                                {isExpanded ? 'Close Minutes ▲' : 'Inspect AI Transcripts & MoM ▼'}
                              </span>
                              {m.originalLanguage && (
                                <span className="font-mono text-[9px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-semibold">
                                  {m.originalLanguage}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expandable transcripts / summaries */}
                          {isExpanded && (
                            <div className="p-3.5 border-t border-slate-200 bg-white space-y-4 text-xs leading-relaxed text-slate-700 select-text animate-fadeIn">
                              {/* Summary Section */}
                              {m.summary && (
                                <div className="space-y-1 bg-slate-50 border border-slate-150 p-3 rounded-lg">
                                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-widest block">AI Prose Summary</span>
                                  <p className="text-slate-750 font-sans">{m.summary}</p>
                                </div>
                              )}

                              {/* Description Section */}
                              {m.description && (
                                <div className="space-y-1 bg-blue-50/25 border border-blue-100 p-3 rounded-lg">
                                  <span className="text-[10px] font-mono uppercase font-bold text-blue-600 tracking-widest block">Original Context</span>
                                  <p className="text-slate-700 font-sans">{m.description}</p>
                                </div>
                              )}

                              {/* Speaker Transcript Side Panel */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {m.transcript && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-widest block">Original Spoken Transcript</span>
                                    <div className="bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] max-h-36 overflow-y-auto leading-relaxed">
                                      {m.transcript.split("\n").map((line, lIdx) => (
                                        <div key={lIdx} className="mb-0.5">
                                          <span className="text-blue-400 font-sans font-bold">{line.split(":")[0]}:</span>
                                          {line.split(":")[1] || line}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {m.transcriptEnglish && m.originalLanguage !== 'English' && (
                                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-150 pt-2.5 md:pt-0 md:pl-3">
                                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-widest block">English Translation (Audit Safe)</span>
                                    <div className="bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] max-h-36 overflow-y-auto leading-relaxed">
                                      {m.transcriptEnglish.split("\n").map((line, lIdx) => (
                                        <div key={lIdx} className="mb-0.5">
                                          <span className="text-sky-450 text-cyan-400 font-sans font-bold">{line.split(":")[0]}:</span>
                                          {line.split(":")[1] || line}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Action Items List */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                                {m.mainPoints && m.mainPoints.length > 0 ? (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-widest block">Key Takeaways</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-slate-650 font-sans">
                                      {m.mainPoints.map((pt, pIdx) => (
                                        <li key={pIdx} className="text-[11px] leading-relaxed">{pt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-widest block">Key takeaways</span>
                                    <p className="text-[11px] text-slate-400 italic font-sans animate-pulse">Let Gemini parse final bullet takeaways below!</p>
                                  </div>
                                )}

                                {m.actionItems && m.actionItems.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-widest block font-mono">Assigned Actions checklist</span>
                                    <div className="space-y-1">
                                      {m.actionItems.map((act, aIdx) => (
                                        <div key={aIdx} className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-650 font-sans">
                                          <input type="checkbox" defaultChecked={aIdx === 0} className="rounded text-green-600 border-slate-300 mt-0.5" onChange={()=>{}} />
                                          <span>{act}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Gemini takeaways block */}
                              {onGenerateTakeaways && (
                                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 mt-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs font-display">
                                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                                      <span>Gemini Key Takeaways Generator</span>
                                    </div>
                                    <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase border border-blue-100 font-mono">
                                      3.5 FLASH
                                    </span>
                                  </div>

                                  <p className="text-slate-500 text-[11px] font-sans">
                                    Leverage server-side LLM synthesis to identify critical dependencies, Malayalam translation gaps, and timeline updates.
                                  </p>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Add custom custom instructions (e.g. emphasize Kochi milestones)..."
                                      value={customInstructions[m.id] || ""}
                                      onChange={(e) => setCustomInstructions(prev => ({ ...prev, [m.id]: e.target.value }))}
                                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] flex-1 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                                    />

                                    <button
                                      type="button"
                                      disabled={takeawayProgressId === m.id}
                                      onClick={async () => {
                                        setTakeawayProgressId(m.id);
                                        try {
                                          await onGenerateTakeaways(m.id, customInstructions[m.id]);
                                        } catch (e) {
                                          console.error(e);
                                          alert("Failed to formulate takeaways with Gemini API.");
                                        } finally {
                                          setTakeawayProgressId(null);
                                        }
                                      }}
                                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-350 text-white font-bold text-[10.5px] py-1.5 px-3 rounded-lg shadow-xs cursor-pointer transition-all shrink-0 border-none font-sans"
                                    >
                                      {takeawayProgressId === m.id ? (
                                        <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full h-3 w-3" />
                                      ) : (
                                        "Formulate"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
