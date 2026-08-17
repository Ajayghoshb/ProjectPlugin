import { meetingWorkflowEngine } from '../workflow/workflow.engine';
import { meetingSessionManager } from '../services/session-manager.service';
import { pluginManager } from '../plugins/plugin.manager';
import { policyEngine } from '../policy/policy.engine';
import { SpeakerSegment } from '../models/agent.models';

export class MeetingAgentOrchestrator {
  async startMeetingAgent(meetingId: string, title: string, organizerEmail: string, ownerUserId?: string, ownerUserEmail?: string): Promise<boolean> {
    console.log(`[Meeting Agent Orchestrator] Initializing Agent Pipeline for meeting '${title}' (${meetingId}) [Owner: ${ownerUserEmail || 'DEFAULT'}]`);
    return await meetingWorkflowEngine.executeMeetingStartWorkflow(meetingId, title, organizerEmail, ownerUserId, ownerUserEmail);
  }

  async processLiveAudioSegment(meetingId: string, segment: SpeakerSegment): Promise<void> {
    await meetingWorkflowEngine.executeTranscriptProcessingWorkflow(meetingId, segment);
  }

  async endMeetingAgent(meetingId: string): Promise<void> {
    console.log(`[Meeting Agent Orchestrator] Terminating Agent Pipeline for meeting '${meetingId}'`);
    await meetingWorkflowEngine.executeMeetingEndWorkflow(meetingId);
  }

  getAgentOverview(meetingId: string): any {
    const session = meetingSessionManager.getActiveSession(meetingId);
    return {
      session,
      pluginsActive: pluginManager.getRegisteredPlugins(),
      policyStatus: policyEngine.canJoinMeeting(meetingId, session?.organizerEmail || '')
    };
  }
}

export const meetingAgentOrchestrator = new MeetingAgentOrchestrator();
