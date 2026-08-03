export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
}

export class PolicyEngine {
  canJoinMeeting(meetingId: string, organizerEmail: string): PolicyCheckResult {
    if (!organizerEmail || organizerEmail.includes("blocked")) {
      return { allowed: false, reason: "Organizer email is blocked by tenant governance policy." };
    }
    return { allowed: true };
  }

  canRecordMeeting(meetingId: string, isPrivate: boolean): PolicyCheckResult {
    if (isPrivate) {
      return { allowed: false, reason: "Recording private confidential meetings is restricted by policy." };
    }
    return { allowed: true };
  }

  canReadTranscript(meetingId: string): PolicyCheckResult {
    return { allowed: true };
  }

  canIndexKnowledge(meetingId: string, containsSensitiveData: boolean): PolicyCheckResult {
    if (containsSensitiveData) {
      return { allowed: false, reason: "Sensitive PCI/HIPAA data detected. Indexing skipped." };
    }
    return { allowed: true };
  }
}

export const policyEngine = new PolicyEngine();
