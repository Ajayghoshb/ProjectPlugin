import { policyEngine } from '../policy/policy.engine';
import { meetingSessionManager } from '../services/session-manager.service';
import { pluginManager } from '../plugins/plugin.manager';
import { agentEventBus } from '../events/event-bus';
import { SpeakerSegment, IntelligenceItem } from '../models/agent.models';

export class MeetingWorkflowEngine {
  async executeMeetingStartWorkflow(meetingId: string, title: string, organizerEmail: string): Promise<boolean> {
    console.log(`[Workflow Engine] Step 1: Evaluating Join Policy...`);
    const policyCheck = policyEngine.canJoinMeeting(meetingId, organizerEmail);
    if (!policyCheck.allowed) {
      console.warn(`[Workflow Engine] Join Flow Aborted: ${policyCheck.reason}`);
      return false;
    }

    console.log(`[Workflow Engine] Step 2: Initializing Meeting Session...`);
    meetingSessionManager.startSession(meetingId, title, organizerEmail);

    agentEventBus.publish('MEETING_STATE_CHANGED', {
      meetingId,
      data: { workflow: 'STARTED', title }
    });

    return true;
  }

  async executeTranscriptProcessingWorkflow(meetingId: string, segment: SpeakerSegment): Promise<void> {
    console.log(`[Workflow Engine] Processing Transcript Segment from '${segment.speakerName}'...`);
    meetingSessionManager.addSegmentToSession(meetingId, segment);

    // AI Intelligence Detection Flow
    if (segment.text.toLowerCase().includes("action item") || segment.text.toLowerCase().includes("will")) {
      const item: IntelligenceItem = {
        id: `item-${Date.now()}`,
        type: 'ACTION_ITEM',
        content: segment.text,
        owner: segment.speakerName,
        confidenceScore: 0.95,
        detectedAt: new Date().toISOString(),
        speakerName: segment.speakerName
      };

      meetingSessionManager.addIntelligenceToSession(meetingId, item);
      await pluginManager.executePluginAction('Jira Issue Creator Plugin', 'CREATE_ISSUE', {
        title: item.content,
        projectKey: 'BRH'
      });
    }
  }

  async executeMeetingEndWorkflow(meetingId: string): Promise<void> {
    console.log(`[Workflow Engine] Executing Meeting End & Knowledge Archival Flow...`);
    meetingSessionManager.endSession(meetingId);
  }
}

export const meetingWorkflowEngine = new MeetingWorkflowEngine();
