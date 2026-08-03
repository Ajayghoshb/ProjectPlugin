import { policyEngine } from '../../policy/policy.engine';
import { approvalStateStore, ApprovalState } from '../approval/approval.state.store';
import { agentEventBus } from '../../events/event-bus';
import { meetingAgentOrchestrator } from '../../orchestrator/agent.orchestrator';

export interface MeetingJoinCandidate {
  meetingId: string;
  organizerId: string;
  organizerEmail: string;
  title: string;
  participants: string[];
  startTime: string;
  isPrivate?: boolean;
}

export class MeetingDetector {
  detectMeetingCandidate(rawEvent: any): MeetingJoinCandidate {
    return {
      meetingId: rawEvent.meetingId || rawEvent.id || `m-${Date.now()}`,
      organizerId: rawEvent.organizerId || 'org-01',
      organizerEmail: rawEvent.organizerEmail || rawEvent.organizer || 'sarah.chen@thinkpalm.com',
      title: rawEvent.title || rawEvent.subject || 'Q3 Enterprise Architecture Sync',
      participants: rawEvent.participants || ['sarah.chen@thinkpalm.com', 'alex.rivera@thinkpalm.com'],
      startTime: rawEvent.startTime || new Date().toISOString(),
      isPrivate: rawEvent.isPrivate || false
    };
  }
}

export class MeetingPermissionService {
  validateJoinPolicy(candidate: MeetingJoinCandidate): { allowed: boolean; reason?: string } {
    const joinCheck = policyEngine.canJoinMeeting(candidate.meetingId, candidate.organizerEmail);
    if (!joinCheck.allowed) return joinCheck;

    const recordCheck = policyEngine.canRecordMeeting(candidate.meetingId, !!candidate.isPrivate);
    if (!recordCheck.allowed) return recordCheck;

    return { allowed: true };
  }
}

export class JoinManager {
  async initiateJoinRequest(candidate: MeetingJoinCandidate): Promise<ApprovalState> {
    const requestId = `req-join-${Date.now()}`;
    const approvalState: ApprovalState = {
      requestId,
      meetingId: candidate.meetingId,
      organizerEmail: candidate.organizerEmail,
      status: 'WAITING_APPROVAL',
      requestedAt: new Date().toISOString()
    };

    approvalStateStore.saveApproval(approvalState);

    agentEventBus.publish('JOIN_REQUESTED', {
      meetingId: candidate.meetingId,
      data: { candidate, requestId }
    });

    console.log(`[Join Manager] Join request '${requestId}' initiated for meeting '${candidate.title}'. Status: WAITING_APPROVAL`);
    return approvalState;
  }

  async processApproval(meetingId: string, approverEmail: string, approved: boolean): Promise<ApprovalState | undefined> {
    const status: ApprovalState['status'] = approved ? 'APPROVED' : 'DECLINED';
    const updated = approvalStateStore.updateStatus(meetingId, status, approverEmail);

    if (updated) {
      if (approved) {
        updated.status = 'JOINED';
        agentEventBus.publish('JOIN_APPROVED', {
          meetingId,
          data: { approvedBy: approverEmail }
        });
        await meetingAgentOrchestrator.startMeetingAgent(meetingId, 'Teams Meeting Sync', approverEmail);
      } else {
        agentEventBus.publish('JOIN_DECLINED', {
          meetingId,
          data: { declinedBy: approverEmail }
        });
      }
    }

    return updated;
  }
}

export class MeetingJoinWorkflow {
  private detector = new MeetingDetector();
  private permissionService = new MeetingPermissionService();
  private joinManager = new JoinManager();

  async executeJoinFlow(rawMeetingEvent: any): Promise<{ candidate: MeetingJoinCandidate; approvalState?: ApprovalState; status: string; reason?: string }> {
    const candidate = this.detector.detectMeetingCandidate(rawMeetingEvent);
    const permission = this.permissionService.validateJoinPolicy(candidate);

    if (!permission.allowed) {
      return { candidate, status: 'REJECTED_BY_POLICY', reason: permission.reason };
    }

    const approvalState = await this.joinManager.initiateJoinRequest(candidate);
    return { candidate, approvalState, status: 'JOIN_REQUEST_SENT' };
  }
}

export const meetingDetector = new MeetingDetector();
export const meetingPermissionService = new MeetingPermissionService();
export const joinManager = new JoinManager();
export const meetingJoinWorkflow = new MeetingJoinWorkflow();
