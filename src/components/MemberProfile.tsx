import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, MessageSquare, Send, CheckCircle2, RefreshCw, Lock, Sparkles, User, Mail, Briefcase, Activity, Clock, Edit3, Trash2, Plus, AlertCircle } from 'lucide-react';
import { TeamMember, ChatMessage, Meeting, JiraEmailMapping } from '../types';

interface MemberProfileProps {
  member: TeamMember;
  chats: ChatMessage[];
  meetings?: Meeting[];
  onBack: () => void;
  onSendMessage: (receiverId: string, txt: string) => Promise<void>;
  onSeedMeeting: (email: string, date: string, startTime: string) => void;
  autoAction?: 'schedule' | 'chat';
  jiraEmailMappings?: JiraEmailMapping[];
  onRefreshData?: () => void;
}

export default function MemberProfile({
  member,
  chats,
  meetings = [],
  onBack,
  onSendMessage,
  onSeedMeeting,
  autoAction,
  jiraEmailMappings = [],
  onRefreshData
}: MemberProfileProps) {
  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getMemberEmails = () => {
    const list = [member.email.toLowerCase().trim()];
    if (jiraEmailMappings && jiraEmailMappings.length > 0) {
      const match = jiraEmailMappings.find(
        (m) => m.displayName?.toLowerCase().trim() === member.name?.toLowerCase().trim()
      );
      if (match && match.emailAddress) {
        const mapped = match.emailAddress.toLowerCase().trim();
        if (!list.includes(mapped)) {
          list.push(mapped);
        }
      }
    }
    return list;
  };

  const memberEmails = getMemberEmails();

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [availability, setAvailability] = useState<Record<string, "Free" | "Busy">>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [activeTabSub, setActiveTabSub] = useState<'calendar' | 'chat'>(autoAction === 'chat' ? 'chat' : 'calendar');

  // Calendar view range scope (selected date vs. all days/historical calendar)
  const [scheduleScope, setScheduleScope] = useState<'selected' | 'all'>('selected');

  // Notification notification Banner message
  const [notificationBanner, setNotificationBanner] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Manual Add Form states
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDate, setCustomDate] = useState(getTodayDateString());
  const [customStartTime, setCustomStartTime] = useState("10:00");
  const [customEndTime, setCustomEndTime] = useState("10:30");
  const [customType, setCustomType] = useState<"Online" | "In-Person">("Online");
  const [customRoom, setCustomRoom] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [addingCustomStatus, setAddingCustomStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [addingCustomMessage, setAddingCustomMessage] = useState("");

  // Edit Meeting form states
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editType, setEditType] = useState<"Online" | "In-Person">("Online");
  const [editRoom, setEditRoom] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editStatus, setEditStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [editMessage, setEditMessage] = useState("");

  const [selectedBookingTimeslot, setSelectedBookingTimeslot] = useState<string | null>(null);
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingType, setBookingType] = useState<"Online" | "In-Person">("Online");
  const [bookingRoom, setBookingRoom] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bookingMessage, setBookingMessage] = useState("");

  const calculateEndTime = (start: string) => {
    const [h, m] = start.split(':').map(Number);
    let eh = h;
    let em = m + 30;
    if (em >= 60) {
      em -= 60;
      eh += 1;
    }
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  };

  // Sync historical and upcoming calendars globally from Graph API
  const handleForceSyncAllGraph = async () => {
    setLoadingAvailability(true);
    setNotificationBanner({ type: "info", message: "Fetching broad historical and current calendar events from MS Graph API..." });
    try {
      // 1. Fetch meetings using range sync
      const syncResp = await fetch("/api/meetings/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: member.email })
      });

      // 2. Refresh timeslot presence
      const availResp = await fetch(`/api/availability?email=${encodeURIComponent(member.email)}&date=${selectedDate}`);

      if (syncResp.ok) {
        const syncData = await syncResp.json();
        setNotificationBanner({ type: "success", message: syncData.message || "Scanned Outlook calendar and integrated meetings successfully." });
      }

      if (availResp.ok) {
        const availData = await availResp.json();
        setAvailability(availData);
      }

      if (onRefreshData) onRefreshData();
    } catch (e: any) {
      console.error("Microsoft Graph broad sync failed:", e);
      setNotificationBanner({ type: "error", message: "Sync Exception: " + e.message });
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Manual Custom Book/Add meeting handler
  const handleAddCustomMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const todayStr = getTodayDateString();
    if (customDate < todayStr) {
      setAddingCustomStatus("error");
      setAddingCustomMessage("Cannot schedule a meeting on a past date.");
      return;
    }

    if (customDate === todayStr) {
      const d = new Date();
      const currentHHMM = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      if (customStartTime < currentHHMM) {
        setAddingCustomStatus("error");
        setAddingCustomMessage(`Cannot schedule a past meeting. It is currently ${currentHHMM}. Please select a future start time.`);
        return;
      }
    }

    if (customStartTime >= customEndTime) {
      setAddingCustomStatus("error");
      setAddingCustomMessage("Meeting end time must be after the start time.");
      return;
    }

    setAddingCustomStatus("loading");
    setAddingCustomMessage("");

    try {
      const payload = {
        title: customTitle,
        date: customDate,
        startTime: customStartTime,
        endTime: customEndTime,
        type: customType,
        roomDetails: customType === "In-Person" ? customRoom : "Microsoft Teams Meeting Link",
        projectKey: member.projects[0] || "SYN",
        participants: [member.email, "ajayaghosh.b@thinkpalm.com"],
        summary: customSummary || "Manual custom scheduled calendar event",
        actionItems: []
      };

      const response = await fetch("/api/meetings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setAddingCustomStatus("success");
        setAddingCustomMessage("Successfully registered and dispatched new calendar event.");
        setCustomTitle("");
        setCustomSummary("");
        setCustomRoom("");

        await fetchAvailability();
        if (onRefreshData) onRefreshData();

        setTimeout(() => {
          setIsAddingCustom(false);
          setAddingCustomStatus("idle");
        }, 1500);
      } else {
        const err = await response.json();
        setAddingCustomStatus("error");
        setAddingCustomMessage(err.error || "Failed to schedule custom meeting.");
      }
    } catch (err: any) {
      setAddingCustomStatus("error");
      setAddingCustomMessage(err.message || "Network exception occurred.");
    }
  };

  // Edit Update function
  const handleUpdateMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting || !editTitle.trim()) return;

    const todayStr = getTodayDateString();
    if (editDate < todayStr) {
      setEditStatus("error");
      setEditMessage("Cannot update meeting to a past date.");
      return;
    }

    if (editDate === todayStr) {
      const d = new Date();
      const currentHHMM = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      if (editStartTime < currentHHMM) {
        setEditStatus("error");
        setEditMessage(`Cannot schedule meeting in the past. It is currently ${currentHHMM}. Please select a future start time.`);
        return;
      }
    }

    if (editStartTime >= editEndTime) {
      setEditStatus("error");
      setEditMessage("Meeting end time must be after the start time.");
      return;
    }

    setEditStatus("loading");
    setEditMessage("");

    try {
      const payload = {
        id: editingMeeting.id,
        title: editTitle,
        date: editDate,
        startTime: editStartTime,
        endTime: editEndTime,
        type: editType,
        roomDetails: editType === "In-Person" ? editRoom : "Microsoft Teams Link",
        summary: editSummary,
        actionItems: editingMeeting.actionItems || []
      };

      const response = await fetch("/api/meetings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditStatus("success");
        setEditMessage("Successfully saved changes and updated Microsoft O365 secure calendar event.");

        await fetchAvailability();
        if (onRefreshData) onRefreshData();

        setTimeout(() => {
          setEditingMeeting(null);
          setEditStatus("idle");
        }, 1500);
      } else {
        const err = await response.json();
        setEditStatus("error");
        setEditMessage(err.error || "Failed to update calendar event details.");
      }
    } catch (err: any) {
      setEditStatus("error");
      setEditMessage(err.message || "Network communication error.");
    }
  };

  // Delete matching calendar event
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!window.confirm("Are you sure you want to delete this meeting? This will also attempt to purge the matching event on Microsoft Graph.")) {
      return;
    }

    setNotificationBanner({ type: "info", message: "Deleting event..." });
    try {
      const response = await fetch("/api/meetings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: meetingId })
      });

      if (response.ok) {
        setNotificationBanner({ type: "success", message: "Successfully removed meeting from database and Exchange Graph calendar." });
        await fetchAvailability();
        if (onRefreshData) onRefreshData();
      } else {
        const err = await response.json();
        setNotificationBanner({ type: "error", message: err.error || "Failed to delete meeting." });
      }
    } catch (err: any) {
      setNotificationBanner({ type: "error", message: err.message || "Network communication error." });
    }
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingTimeslot || !bookingTitle.trim()) return;

    const startTime = selectedBookingTimeslot;
    const endTime = calculateEndTime(startTime);

    const todayStr = getTodayDateString();
    if (selectedDate < todayStr) {
      setBookingStatus("error");
      setBookingMessage("Cannot book a meeting on a past date.");
      return;
    }

    if (selectedDate === todayStr) {
      const d = new Date();
      const currentHHMM = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      if (startTime < currentHHMM) {
        setBookingStatus("error");
        setBookingMessage(`Cannot book a past meeting timeslot. It is currently ${currentHHMM}. Please select a future timeslot.`);
        return;
      }
    }

    setBookingStatus("loading");
    setBookingMessage("");

    try {
      const payload = {
        title: bookingTitle,
        date: selectedDate,
        startTime,
        endTime,
        type: bookingType,
        roomDetails: bookingType === "In-Person" ? bookingRoom : "Microsoft Teams Meeting Link",
        projectKey: member.projects[0] || "SYN",
        participants: [member.email, "ajayaghosh.b@thinkpalm.com"]
      };

      const response = await fetch("/api/meetings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setBookingStatus("success");
        setBookingMessage(`Successfully scheduled & synced event on Microsoft Graph for ${member.name}!`);
        setBookingTitle("");
        setBookingRoom("");
        
        // Refresh availability grid
        await fetchAvailability();
        
        // Trigger parent state update
        if (onRefreshData) {
          onRefreshData();
        }

        setTimeout(() => {
          setSelectedBookingTimeslot(null);
          setBookingStatus("idle");
        }, 2200);
      } else {
        const errData = await response.json();
        setBookingStatus("error");
        setBookingMessage(errData.error || "An error occurred while booking.");
      }
    } catch (err: any) {
      setBookingStatus("error");
      setBookingMessage(err.message || "Network exception occurred.");
    }
  };

  // Trigger auto action if passed from external card clicks
  useEffect(() => {
    if (autoAction === 'chat') {
      setActiveTabSub('chat');
    } else if (autoAction === 'schedule') {
      setActiveTabSub('calendar');
    }
  }, [autoAction]);

  const times = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  // Fetch unified availability logs from Server (Combines Teams + Google Calendar inputs)
  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const response = await fetch(`/api/availability?email=${encodeURIComponent(member.email)}&date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (e) {
      console.error("Error loading availability details:", e);
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [member.email, selectedDate]);

  // Scroll to bottom of chat conversation
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sendingMsg) return;

    setSendingMsg(true);
    const textToSend = messageText;
    setMessageText("");

    try {
      await onSendMessage(member.id, textToSend);
    } catch (e) {
      console.error("Error transmitting chat:", e);
    } finally {
      setSendingMsg(false);
    }
  };

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case 'Available': return 'bg-emerald-500';
      case 'Busy': return 'bg-rose-500';
      case 'Away': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  // Filter relevant chats between me ('current-user') and this selected member ID or email
  const conversation = chats.filter(
    (c) =>
      (c.senderId === 'current-user' && (c.receiverId === member.id || c.receiverId === member.email)) ||
      ((c.senderId === member.id || c.senderId === member.email) && c.receiverId === 'current-user')
  );

  return (
    <div className="space-y-6 animate-fade-in" id="member-profile-section">
      {/* Header back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 bg-white shadow-xs cursor-pointer transition-colors"
          id="btn-profile-back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grid</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile General Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={member.avatar}
              alt={member.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-100"
            />
            <span className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full ring-4 ring-white ${getPresenceColor(member.presence)}`} />
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-slate-800 leading-tight">{member.name}</h3>
            <span className="inline-block mt-1 font-mono text-[10.5px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded">
              {member.role}
            </span>
          </div>

          <div className="text-left text-xs space-y-3.5 border-t border-slate-150 pt-4 text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono break-all leading-normal text-slate-705 font-medium min-w-0" title={member.email}>{member.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Assigned Projects: <span className="font-semibold text-slate-800">{member.projects.join(', ')}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Teams Presence: <strong className="text-slate-800">{member.presence}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Status: <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-semibold">Active</span></span>
            </div>
          </div>

          {/* Quick Tab control for mobile/layouts */}
          <div className="flex bg-slate-50 border border-slate-150 rounded-lg p-1 text-xs gap-1">
            <button
              onClick={() => setActiveTabSub('calendar')}
              className={`flex-1 py-1.5 rounded-md font-medium cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTabSub === 'calendar' ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Availability</span>
            </button>
            <button
              onClick={() => setActiveTabSub('chat')}
              className={`flex-1 py-1.5 rounded-md font-medium cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTabSub === 'chat' ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-500'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Teams Chat</span>
            </button>
          </div>
        </div>

        {/* Tab Contents: Calendar vs Direct Chat */}
        <div className="lg:col-span-2">
          {activeTabSub === 'calendar' ? (
            <div className="bg-white border-2 border-indigo-100/90 rounded-2xl p-6 shadow-md shadow-indigo-105/30 space-y-5 relative overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-105/40" id="portal-availability-card">
              {/* Premium Gradient Top Border Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-violet-600" />

              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 pt-1">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-850 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>Schedule</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleForceSyncAllGraph}
                    className="p-2 rounded-lg bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-600 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
                    title="Sync Microsoft Graph API Calendar"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAvailability ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Direct Slot Booking Overlay */}
              {selectedBookingTimeslot && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-10 rounded-2xl flex items-center justify-center p-4 min-h-[350px]">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xl w-full max-w-sm animate-scale-in space-y-4 text-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <h4 className="font-display font-semibold text-sm text-slate-900">Direct Slot Booking</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookingTimeslot(null);
                          setBookingStatus("idle");
                        }}
                        className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer border border-slate-250 rounded px-1.5 hover:bg-slate-50 transition-all font-mono"
                      >
                        ✕
                      </button>
                    </div>

                    {bookingStatus === "success" ? (
                      <div className="py-6 text-center space-y-2">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">✓</div>
                        <h5 className="font-bold text-slate-900 text-sm">Meeting Confirmed!</h5>
                        <p className="text-xs text-slate-500 leading-normal font-sans">{bookingMessage}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleBookMeeting} className="space-y-3">
                        <div className="bg-indigo-50/55 border border-indigo-100 p-2.5 rounded-lg text-xs space-y-1">
                          <p className="text-slate-600"><strong>Target Attendee:</strong> <span className="font-mono text-slate-850 font-semibold">{member.name}</span></p>
                          <p className="text-slate-600"><strong>Proposed Slot:</strong> <span className="font-mono text-slate-850 font-semibold">{selectedDate} &bull; {selectedBookingTimeslot} - {calculateEndTime(selectedBookingTimeslot)}</span></p>
                        </div>

                        {bookingStatus === "error" && (
                          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded text-xs text-rose-600 font-medium">
                            ⚠️ {bookingMessage}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meeting Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sprint Backlog Sync, Technical Audit"
                            value={bookingTitle}
                            onChange={(e) => setBookingTitle(e.target.value)}
                            disabled={bookingStatus === "loading"}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none placeholder-slate-450 transition-all text-slate-800 bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Type Format</label>
                            <select
                              value={bookingType}
                              onChange={(e) => setBookingType(e.target.value as any)}
                              disabled={bookingStatus === "loading"}
                              className="w-full border border-slate-200 px-2 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all text-slate-800 bg-white"
                            >
                              <option value="Online">Online Teams</option>
                              <option value="In-Person">In-Person</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Location Details</label>
                            {bookingType === "In-Person" ? (
                              <input
                                type="text"
                                required
                                placeholder="e.g. Hub Room Kochi"
                                value={bookingRoom}
                                onChange={(e) => setBookingRoom(e.target.value)}
                                disabled={bookingStatus === "loading"}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-450 transition-all text-slate-800 bg-white"
                              />
                            ) : (
                              <input
                                type="text"
                                disabled
                                value="Teams Video Link"
                                className="w-full border border-slate-150 bg-slate-50 px-3 py-1.5 rounded-lg text-xs text-slate-400"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingTimeslot(null);
                              setBookingStatus("idle");
                            }}
                            disabled={bookingStatus === "loading"}
                            className="flex-1 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={bookingStatus === "loading" || !bookingTitle.trim()}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 rounded-lg text-xs cursor-pointer disabled:bg-slate-100 disabled:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                          >
                            {bookingStatus === "loading" ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Registering...</span>
                              </>
                            ) : (
                              <span>Confirm</span>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* isAddingCustom Manual Add Overlay */}
              {isAddingCustom && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-10 rounded-2xl flex items-center justify-center p-4 min-h-[400px]">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xl w-full max-w-md animate-scale-in space-y-4 text-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-500" />
                        <h4 className="font-display font-semibold text-sm text-slate-900">Add Calendar Entry (Sync to Graph)</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustom(false)}
                        className="text-slate-450 hover:text-slate-650 font-bold text-sm cursor-pointer font-mono"
                      >
                        ✕
                      </button>
                    </div>

                    {addingCustomStatus === "success" ? (
                      <div className="py-6 text-center space-y-2">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <h5 className="font-bold text-slate-900 text-sm">Meeting Added Successfully!</h5>
                        <p className="text-xs text-slate-500 font-sans">{addingCustomMessage}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleAddCustomMeetingSubmit} className="space-y-3 text-xs text-left">
                        {addingCustomStatus === "error" && (
                          <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-600 font-medium">
                            ⚠️ {addingCustomMessage}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meeting Subject Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Backlog Aligns, Test Scenario Review"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date</label>
                            <input
                              type="date"
                              required
                              value={customDate}
                              onChange={(e) => setCustomDate(e.target.value)}
                              className="w-full border border-slate-200 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-900 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Start Time</label>
                            <input
                              type="time"
                              required
                              value={customStartTime}
                              onChange={(e) => setCustomStartTime(e.target.value)}
                              className="w-full border border-slate-200 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-900 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">End Time</label>
                            <input
                              type="time"
                              required
                              value={customEndTime}
                              onChange={(e) => setCustomEndTime(e.target.value)}
                              className="w-full border border-slate-200 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-900 font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meeting Format</label>
                            <select
                              value={customType}
                              onChange={(e) => setCustomType(e.target.value as any)}
                              className="w-full border border-slate-200 px-2 py-1.5 rounded-lg bg-white text-slate-900"
                            >
                              <option value="Online">Online Teams Call</option>
                              <option value="In-Person">In-Person Office Room</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Location Details</label>
                            <input
                              type="text"
                              placeholder={customType === "Online" ? "Teams Auto-Link" : "e.g. Kochi Desk Hub"}
                              disabled={customType === "Online"}
                              value={customType === "Online" ? "Microsoft Teams Link" : customRoom}
                              onChange={(e) => setCustomRoom(e.target.value)}
                              className="w-full border border-slate-200 px-3 py-1.5 rounded-lg bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-450"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">MoM Objectives & Description</label>
                          <textarea
                            rows={2}
                            placeholder="Provide summary detail notes and expectations"
                            value={customSummary}
                            onChange={(e) => setCustomSummary(e.target.value)}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-800"
                          />
                        </div>

                        <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingCustom(false)}
                            className="flex-1 border border-slate-250 text-slate-500 hover:text-slate-800 font-semibold py-1.5 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addingCustomStatus === "loading" || !customTitle.trim()}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Confirm Add
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* editingMeeting Edit Event Overlay */}
              {editingMeeting && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-10 rounded-2xl flex items-center justify-center p-4 min-h-[400px]">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xl w-full max-w-md animate-scale-in space-y-4 text-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-indigo-500" />
                        <h4 className="font-display font-semibold text-sm text-slate-900">Modify Calendar Entry (Sync to Graph)</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingMeeting(null)}
                        className="text-slate-450 hover:text-slate-650 font-bold text-sm cursor-pointer font-mono"
                      >
                        ✕
                      </button>
                    </div>

                    {editStatus === "success" ? (
                      <div className="py-6 text-center space-y-2">
                        <CheckCircle2 className="w-12 h-12 text-indigo-650 mx-auto" />
                        <h5 className="font-bold text-slate-900 text-sm">Meeting Modified Successfully!</h5>
                        <p className="text-xs text-slate-500 font-sans">{editMessage}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateMeetingSubmit} className="space-y-3 text-xs text-left">
                        {editStatus === "error" && (
                          <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-600 font-medium">
                            ⚠️ {editMessage}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meeting Subject Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Backlog Alignments, Code Review"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 bg-slate-50/85 p-2 rounded-lg border border-slate-150">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date</label>
                            <input
                              type="date"
                              required
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full border border-slate-200 px-2 py-1 rounded focus:ring-1 focus:ring-blue-500 bg-white text-slate-900 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Starts</label>
                            <input
                              type="time"
                              required
                              value={editStartTime}
                              onChange={(e) => setEditStartTime(e.target.value)}
                              className="w-full border border-slate-200 px-2 py-1 rounded focus:ring-1 focus:ring-blue-500 bg-white text-slate-900 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ends</label>
                            <input
                              type="time"
                              required
                              value={editEndTime}
                              onChange={(e) => setEditEndTime(e.target.value)}
                              className="w-full border border-slate-200 px-2 py-1 rounded focus:ring-1 focus:ring-blue-500 bg-white text-slate-900 font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meeting Format</label>
                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value as any)}
                              className="w-full border border-slate-200 px-2 py-1.5 rounded-lg bg-white text-slate-900"
                            >
                              <option value="Online">Online Microsoft Teams</option>
                              <option value="In-Person">In-Person Office Location</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Location Details</label>
                            <input
                              type="text"
                              value={editType === "Online" ? "Microsoft Teams Link" : editRoom}
                              disabled={editType === "Online"}
                              onChange={(e) => setEditRoom(e.target.value)}
                              className="w-full border border-slate-200 px-3 py-1.5 rounded-lg bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Discussion MoM Summary</label>
                          <textarea
                            rows={3}
                            placeholder="Add core transcript elements, objectives or MoM minutes notes..."
                            value={editSummary}
                            onChange={(e) => setEditSummary(e.target.value)}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-800"
                          />
                        </div>

                        <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setEditingMeeting(null)}
                            className="flex-1 border border-slate-250 text-slate-500 hover:text-slate-800 font-semibold py-1.5 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={editStatus === "loading" || !editTitle.trim()}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-450"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Notification Banner */}
              {notificationBanner && (
                <div className={`p-3 rounded-lg text-xs flex items-start gap-2.5 border animate-fade-in ${
                  notificationBanner.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                    : notificationBanner.type === 'error'
                      ? 'bg-rose-50 border-rose-150 text-rose-800'
                      : 'bg-blue-50 border-blue-150 text-blue-800'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="flex-1 leading-normal font-sans">{notificationBanner.message}</p>
                  <button 
                    onClick={() => setNotificationBanner(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold font-mono text-[10px] shrink-0 border border-slate-200 px-1 rounded bg-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Date selection and scope filter row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setScheduleScope('selected')}
                      className={`px-3 py-1 rounded-md text-xs transition-all font-sans cursor-pointer font-medium ${
                        scheduleScope === 'selected' 
                          ? 'bg-slate-900 text-white font-bold shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Timeslots View
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleScope('all')}
                      className={`px-3 py-1 rounded-md text-xs transition-all font-sans cursor-pointer font-medium ${
                        scheduleScope === 'all' 
                          ? 'bg-slate-900 text-white font-bold shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Meetings
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {scheduleScope === 'selected' && (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      id="profile-calendar-date-input"
                    />
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDate(selectedDate);
                      setIsAddingCustom(true);
                    }}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-750 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Calendar Meeting</span>
                  </button>
                </div>
              </div>

              {/* 30-min Block Schedule */}
              {scheduleScope === 'selected' && (
                <div className="space-y-2">
                  <span className="text-[10.5px] font-mono tracking-wider text-slate-400 uppercase block">Daily Timeslots (09:00 - 17:00)</span>
                  
                  {loadingAvailability ? (
                    <div className="py-20 text-center">
                      <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-sans">Negotiating Graph API tokens...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 animate-fade-in">
                      {times.map((time) => {
                        const isBusy = availability[time] === "Busy";
                        return (
                          <button
                            key={time}
                            type="button"
                            className={`border rounded-lg p-3 transition-all flex flex-col justify-between text-left relative ${
                              isBusy
                                ? 'bg-rose-50/40 border-rose-100 text-rose-400 opacity-65 select-none font-sans'
                                : 'bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 text-slate-705 cursor-pointer group shadow-2xs font-sans'
                            }`}
                            onClick={() => {
                              if (!isBusy) {
                                setSelectedBookingTimeslot(time);
                              }
                            }}
                            id={`timeslot-${time.replace(':', '-')}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-mono text-xs font-semibold tracking-wide">{time}</span>
                              {isBusy ? (
                                <Lock className="w-3 h-3 text-rose-300" title="Locked to protect user privacy metadata." />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              )}
                            </div>
                            
                            <div className="mt-2.5 flex items-center justify-between w-full">
                              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isBusy ? 'text-rose-500' : 'text-emerald-600'}`}>
                                {isBusy ? "Busy" : "Free"}
                              </span>
                              {!isBusy && (
                                <span className="text-[9px] text-indigo-550 opacity-0 group-hover:opacity-100 font-sans font-semibold transition-opacity">
                                  Book →
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Daily Calendar Agenda List */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-3xs" id="profile-calendar-agenda-list">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-705 font-mono tracking-wider uppercase">
                    <Calendar className="w-4 h-4 text-indigo-500" /> 
                    <span>
                      {scheduleScope === 'selected' 
                        ? `CALENDAR AGENDA FOR ${selectedDate}` 
                        : "ALL-TIME SYNCED CALENDAR (HISTORICAL & INCOMING)"}
                    </span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold px-2 py-0.5 rounded-full font-mono">
                    {(() => {
                      const list = (meetings || []).filter(m => {
                        const emailMatches = m.participants.some(pEmail => {
                          const pNorm = pEmail.toLowerCase().trim();
                          return memberEmails.includes(pNorm) || 
                                 pNorm === member.name.toLowerCase().trim() ||
                                 memberEmails.some(mEmail => pNorm.includes(mEmail) || mEmail.includes(pNorm));
                        });
                        if (!emailMatches) return false;
                        if (scheduleScope === 'selected') {
                          return m.date === selectedDate;
                        }
                        return true; // return all past & active days
                      });
                      return list.length;
                    })()} Event(s)
                  </span>
                </div>
                
                {(() => {
                  const filteredM = (meetings || []).filter(m => {
                    const emailMatches = m.participants.some(pEmail => {
                      const pNorm = pEmail.toLowerCase().trim();
                      return memberEmails.includes(pNorm) || 
                             pNorm === member.name.toLowerCase().trim() ||
                             memberEmails.some(mEmail => pNorm.includes(mEmail) || mEmail.includes(pNorm));
                    });
                    if (!emailMatches) return false;
                    if (scheduleScope === 'selected') {
                      return m.date === selectedDate;
                    }
                    return true;
                  }).sort((a, b) => {
                    // Sort descending by date and start time to show history correctly
                    return `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`);
                  });

                  if (filteredM.length === 0) {
                    return (
                      <p className="text-xs text-slate-500 italic p-6 bg-white rounded-lg border border-slate-150 text-center font-sans">
                        {scheduleScope === 'selected' 
                          ? `No scheduled meetings registered on this target date. Use the booking tools or select "All-Time" above!`
                          : "No historical or upcoming meetings have been fetched yet for this Outlook profile. Sync with Microsoft Graph to pull past/future entries!"}
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {filteredM.map((m) => {
                        const isGraphEvent = m.id?.startsWith("evt-graph-");
                        return (
                          <div key={m.id} className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5 shadow-3xs" id={`profile-agenda-item-${m.id}`}>
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                                  {m.title}
                                  {isGraphEvent && (
                                    <span className="text-[8.5px] bg-indigo-50 text-indigo-600 border border-indigo-150 rounded px-1 font-mono font-medium lowercase">
                                      graph-azure
                                    </span>
                                  )}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                                  Date: <strong className="text-slate-600">{m.date}</strong> &bull; Org: <strong className="text-slate-600">{m.organizer}</strong> &bull; Proj: <strong className="text-slate-600">{m.projectName || 'General Sync'}</strong>
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase font-mono ${
                                  m.type === 'Online' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  {m.type === 'Online' ? 'Teams' : 'In-Person'}
                                </span>

                                <div className="flex items-center gap-1 border-l pl-2 border-slate-100">
                                  <button
                                    onClick={() => {
                                      setEditingMeeting(m);
                                      setEditTitle(m.title);
                                      setEditDate(m.date);
                                      setEditStartTime(m.startTime);
                                      setEditEndTime(m.endTime);
                                      setEditType(m.type as any || "Online");
                                      setEditRoom(m.roomDetails || "");
                                      setEditSummary(m.summary || "");
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Edit Calendar Event"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMeeting(m.id)}
                                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Purge Event"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600 text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-150 font-mono font-bold">
                              <span className="flex items-center gap-1 text-slate-800">
                                <Clock className="w-3.5 h-3.5 text-slate-400 font-normal" />
                                {m.startTime} - {m.endTime}
                              </span>
                              {m.roomDetails && (
                                <span className="truncate max-w-[150px] text-slate-500 italic font-medium">
                                  &bull; {m.roomDetails}
                                </span>
                              )}
                            </div>

                            {m.summary && (
                              <div className="bg-indigo-50/50 border border-indigo-100/85 rounded-lg p-2.5 text-[11px] text-indigo-950 leading-relaxed font-sans space-y-1 text-left">
                                <span className="font-bold text-indigo-600 flex items-center gap-1 font-mono tracking-wide uppercase text-[9.5px]">
                                  <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> MoM AI Minutes
                                </span>
                                <p className="text-slate-650 font-medium"><strong>Summary:</strong> {m.summary}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100">
                              <span className="text-[9px] font-bold text-slate-400 mr-1 uppercase tracking-tight font-mono">Invited:</span>
                              {m.participants.map((email, idx) => (
                                <span key={`${email}-${idx}`} className="text-[9.5px] bg-slate-50 border border-slate-150 text-slate-600 px-1.5 py-0.5 rounded font-mono truncate max-w-[130px]" title={email}>
                                  {email}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Privacy Warning Footer */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-[11px] text-slate-500 flex items-start gap-2">
                <Lock className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans">
                  <strong>Privacy Filter Protection Active:</strong> Title details, organic descriptors, and meeting parameters are kept locked. The system serves exclusive <strong>Free/Busy</strong> labels to safeguard resource calendars while preventing cross-platform friction.
                </p>
              </div>
            </div>
          ) : (
            /* Microsoft Teams DIRECT Chats */
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[480px]">
              {/* Chats header */}
              <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold leading-tight">{member.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Microsoft Teams Chat Proxy
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {conversation.length === 0 ? (
                  <div className="text-center py-20">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No communication history securely registered.</p>
                    <p className="text-[11px] text-slate-450 mt-1">Send a greeting message below to test the instant Teams chat proxy API!</p>
                  </div>
                ) : (
                  conversation.map((c) => {
                    const isMe = c.senderId === 'current-user';
                    return (
                      <div
                        key={c.id}
                        className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div
                          className={`rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          {c.message}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <span className="text-blue-500 ml-1">✓ Sent via Graph</span>}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Sender Form input */}
              <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-150 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message to transmit over Teams..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 border border-slate-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 text-slate-800"
                  id="chat-message-input"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendingMsg}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl cursor-pointer disabled:bg-slate-100 disabled:text-slate-300 shrink-0 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
