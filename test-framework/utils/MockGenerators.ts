export class MockGenerators {
  public static generateMeeting(customId?: string) {
    const id = customId || `qa-meet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      id,
      title: `QA Synthetic Meeting ${id}`,
      subject: `QA Engineering Architecture & Load Review ${id}`,
      projectName: 'Titan Core Framework',
      organizer: 'Sarah Connor',
      date: new Date().toISOString(),
      status: 'COMPLETED',
      durationMinutes: 45,
      participantsCount: 4,
      summary: 'Executive sync validating real-time speech translation and AI RAG knowledge search performance.'
    };
  }

  public static generateTranscript(size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'NOISY' = 'MEDIUM') {
    if (size === 'SMALL') {
      return [
        { speaker: 'Alex Rivera', text: 'Let us confirm the Teams manifest schema v1.15.' },
        { speaker: 'Sarah Chen', text: 'Verified, calling webhooks respond in 12ms.' }
      ];
    }

    if (size === 'NOISY') {
      return [
        { speaker: 'Deepak Menon', text: 'നമ്മൾ ടീംസ് കോളിംഗ് ഗേറ്റ്‌വേ സുരക്ഷിതമാണെന്ന് ഉറപ്പാക്കണം.' },
        { speaker: 'Alex Rivera', text: '[Background noise] Yes... um... we need HMAC signatures!' },
        { speaker: 'Sarah Chen', text: 'അതെ, ഞാൻ ഡിജിറ്റൽ കീ ടെസ്റ്റ് ചെയ്യുന്നു.' }
      ];
    }

    if (size === 'LARGE') {
      const lines = [];
      for (let i = 0; i < 150; i++) {
        lines.push({
          speaker: i % 2 === 0 ? 'Alex Rivera' : 'Sarah Chen',
          text: `Discussion point #${i}: Validating high concurrency vector search and PostgreSQL persistence layer.`
        });
      }
      return lines;
    }

    // Default MEDIUM
    return [
      { speaker: 'Alex Rivera', text: 'Welcome team. Today we review the Enterprise Knowledge Platform RAG pipeline.' },
      { speaker: 'Sarah Chen', text: 'We integrated NVIDIA Nemotron 1536-dimensional vector embeddings.' },
      { speaker: 'Deepak Menon', text: 'Action Item: Deploy calling webhook verifying HMAC signature signatures.' },
      { speaker: 'Sarah Connor', text: 'Decision: Locked Teams App manifest schema v1.15 for admin center deployment.' }
    ];
  }

  public static generateCopilotQueries() {
    return [
      { question: 'What decisions were made regarding Teams manifest schema?', expectedIntent: 'SEARCH_DECISION' },
      { question: 'Show action items assigned to Alex Rivera', expectedIntent: 'SEARCH_ACTION_ITEM' },
      { question: 'What risks exist for high concurrency vector search?', expectedIntent: 'SEARCH_RISK' },
      { question: 'Summarize discussions about Titan Core Framework', expectedIntent: 'SUMMARY_REQUEST' }
    ];
  }
}
