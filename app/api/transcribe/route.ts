import { openai } from '@ai-sdk/openai';
import { experimental_transcribe as transcribe } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return Response.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for transcription
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const transcript = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: buffer,
    });

    return Response.json({
      text: transcript.text,
      segments: transcript.segments,
      language: transcript.language,
      durationInSeconds: transcript.durationInSeconds,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

