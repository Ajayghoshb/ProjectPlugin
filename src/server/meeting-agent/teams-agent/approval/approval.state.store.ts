export interface ApprovalState {
  requestId: string;
  meetingId: string;
  organizerEmail: string;
  status: 'REQUESTED' | 'WAITING_APPROVAL' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'JOINED';
  approvedBy?: string;
  requestedAt: string;
  respondedAt?: string;
}

export class ApprovalStateStore {
  private approvals = new Map<string, ApprovalState>();

  saveApproval(state: ApprovalState): void {
    this.approvals.set(state.meetingId, state);
  }

  getApprovalByMeetingId(meetingId: string): ApprovalState | undefined {
    return this.approvals.get(meetingId);
  }

  updateStatus(meetingId: string, status: ApprovalState['status'], approverEmail?: string): ApprovalState | undefined {
    const existing = this.approvals.get(meetingId);
    if (existing) {
      existing.status = status;
      if (approverEmail) existing.approvedBy = approverEmail;
      existing.respondedAt = new Date().toISOString();
    }
    return existing;
  }
}

export const approvalStateStore = new ApprovalStateStore();
