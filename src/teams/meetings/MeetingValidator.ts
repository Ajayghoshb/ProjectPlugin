import { MeetingEntity } from './models/meeting.models';

export class MeetingValidator {
  public static validate(meeting: Partial<MeetingEntity>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!meeting.id) errors.push('Missing mandatory meeting id');
    if (!meeting.subject) errors.push('Missing mandatory meeting subject');
    if (!meeting.startTime) errors.push('Missing mandatory meeting startTime');
    if (!meeting.endTime) errors.push('Missing mandatory meeting endTime');
    if (!meeting.organizer) errors.push('Missing mandatory meeting organizer');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
