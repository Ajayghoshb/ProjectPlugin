export interface SpeakerTurn {
  speakerId: string;
  speakerName: string;
  turnCount: number;
  totalWords: number;
  lastActiveISO: string;
}

export class SpeakerTracker {
  private speakers = new Map<string, SpeakerTurn>();

  trackTurn(speakerName: string, text: string): SpeakerTurn {
    const speakerId = `spk-${speakerName.toLowerCase().replace(/\s+/g, '-')}`;
    const wordCount = text.trim().split(/\s+/).length;

    let existing = this.speakers.get(speakerId);
    if (!existing) {
      existing = {
        speakerId,
        speakerName,
        turnCount: 0,
        totalWords: 0,
        lastActiveISO: new Date().toISOString()
      };
      this.speakers.set(speakerId, existing);
    }

    existing.turnCount += 1;
    existing.totalWords += wordCount;
    existing.lastActiveISO = new Date().toISOString();

    return existing;
  }

  getActiveSpeakers(): SpeakerTurn[] {
    return Array.from(this.speakers.values());
  }
}

export const speakerTracker = new SpeakerTracker();
