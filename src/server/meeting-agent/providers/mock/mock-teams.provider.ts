import { JoinRequest } from '../../models/agent.models';
import { joinManager } from '../../services/join.service';

export class MockTeamsProvider {
  async simulateOrganizerPrompt(meetingId: string, title: string, organizerEmail: string): Promise<JoinRequest> {
    console.log(`[Mock Teams Provider] Simulating Adaptive Card permission prompt to organizer '${organizerEmail}' for meeting '${title}'`);
    return await joinManager.createJoinRequest(meetingId, title, organizerEmail);
  }

  async simulateOrganizerDecision(requestId: string, approve: boolean, approverEmail: string): Promise<boolean> {
    if (approve) {
      console.log(`[Mock Teams Provider] Organizer '${approverEmail}' clicked ALLOW on Adaptive Card.`);
      return await joinManager.approveJoinRequest(requestId, approverEmail);
    } else {
      console.log(`[Mock Teams Provider] Organizer '${approverEmail}' clicked DECLINE on Adaptive Card.`);
      return await joinManager.declineJoinRequest(requestId, approverEmail);
    }
  }
}

export const mockTeamsProvider = new MockTeamsProvider();
