import { TestRunner } from '../core/TestRunner';
import { RestClient } from '../utils/RestClient';
import { MockGenerators } from '../utils/MockGenerators';

export async function runPhase04Transcript(): Promise<void> {
  console.log('\n\x1b[36m=== PHASE 4: Transcript Ingestion & Parsing ===\x1b[0m');

  await TestRunner.runTest('4', 'Small Transcript Processing', async () => {
    const transcript = MockGenerators.generateTranscript('SMALL');
    if (!Array.isArray(transcript) || transcript.length !== 2) {
      throw new Error('Small transcript parsing failed');
    }
  });

  await TestRunner.runTest('4', 'Large Multi-Speaker Transcript Parsing', async () => {
    const transcript = MockGenerators.generateTranscript('LARGE');
    if (transcript.length !== 150) {
      throw new Error(`Large transcript parsed incorrect line count: ${transcript.length}`);
    }
  });

  await TestRunner.runTest('4', 'Noisy Multilingual Dialogue & Riva Speech Translation', async () => {
    const res = await RestClient.post('/api/ai/translate', {
      text: 'നമ്മൾ ടീംസ് കോളിംഗ് ഗേറ്റ്‌വേ സുരക്ഷിതമാണെന്ന് ഉറപ്പാക്കണം.',
      sourceLanguage: 'Malayalam'
    });

    if (res.status !== 200 || !res.data.translatedText) {
      throw new Error(`Speech translation failed: ${JSON.stringify(res.data)}`);
    }

    if (!res.data.translatedText.includes('Teams calling gateway')) {
      throw new Error(`Unexpected translation output: ${res.data.translatedText}`);
    }
  });
}
