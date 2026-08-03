import { EventEmitter } from 'events';
import { MeetingState, SpeakerSegment, JoinRequest, IntelligenceItem } from '../models/agent.models';

export type AgentEventType = 
  | 'MEETING_STATE_CHANGED'
  | 'JOIN_REQUESTED'
  | 'JOIN_APPROVED'
  | 'JOIN_DECLINED'
  | 'SPEAKER_SEGMENT_RECEIVED'
  | 'INTELLIGENCE_ITEM_DETECTED'
  | 'SUMMARY_GENERATED';

export interface AgentEventPayload {
  meetingId: string;
  eventType: AgentEventType;
  timestamp: string;
  data: any;
}

export class MeetingEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  publish(eventType: AgentEventType, payload: Omit<AgentEventPayload, 'eventType' | 'timestamp'>): void {
    const fullPayload: AgentEventPayload = {
      ...payload,
      eventType,
      timestamp: new Date().toISOString()
    };
    this.emitter.emit(eventType, fullPayload);
    this.emitter.emit('*', fullPayload);
  }

  subscribe(eventType: AgentEventType | '*', handler: (payload: AgentEventPayload) => void): () => void {
    this.emitter.on(eventType, handler);
    return () => {
      this.emitter.off(eventType, handler);
    };
  }
}

export const agentEventBus = new MeetingEventBus();
