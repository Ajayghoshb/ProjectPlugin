import { IJoinManager } from '../contracts/agent.contracts';
import { JoinRequest, MeetingState } from '../models/agent.models';
import { meetingLifecycleManager } from './lifecycle.service';

export class JoinManager implements IJoinManager {
  private requests = new Map<string, JoinRequest>();

  async createJoinRequest(meetingId: string, title: string, organizerEmail: string): Promise<JoinRequest> {
    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const joinReq: JoinRequest = {
      requestId,
      meetingId,
      meetingTitle: title,
      organizerEmail,
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    this.requests.set(requestId, joinReq);
    await meetingLifecycleManager.transitionState(meetingId, MeetingState.WAITING_APPROVAL, "Waiting for organizer approval to join meeting.");
    return joinReq;
  }

  async approveJoinRequest(requestId: string, approverEmail: string): Promise<boolean> {
    const req = this.requests.get(requestId);
    if (!req || req.status !== 'PENDING') return false;

    req.status = 'APPROVED';
    req.approvedBy = approverEmail;
    req.respondedAt = new Date().toISOString();

    await meetingLifecycleManager.transitionState(req.meetingId, MeetingState.JOINING, `Approved by ${approverEmail}`);
    await meetingLifecycleManager.transitionState(req.meetingId, MeetingState.CONNECTED, "Successfully connected to meeting stream.");
    await meetingLifecycleManager.transitionState(req.meetingId, MeetingState.LISTENING, "AI agent listening to live meeting audio.");
    return true;
  }

  async declineJoinRequest(requestId: string, approverEmail: string): Promise<boolean> {
    const req = this.requests.get(requestId);
    if (!req || req.status !== 'PENDING') return false;

    req.status = 'DECLINED';
    req.approvedBy = approverEmail;
    req.respondedAt = new Date().toISOString();

    await meetingLifecycleManager.transitionState(req.meetingId, MeetingState.REJECTED, `Declined by ${approverEmail}`);
    return true;
  }

  async getPendingRequests(): Promise<JoinRequest[]> {
    return Array.from(this.requests.values()).filter(r => r.status === 'PENDING');
  }

  getRequestById(requestId: string): JoinRequest | undefined {
    return this.requests.get(requestId);
  }
}

export const joinManager = new JoinManager();
