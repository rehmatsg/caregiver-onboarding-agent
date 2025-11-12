import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
  duration: number;
  audioData: Uint8Array | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearError: () => void;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateAudioData = useCallback(() => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);
      setAudioData(dataArray);
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      setDuration(0);
      chunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      // Set up audio context and analyser for waveform
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Set up media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setIsRecording(false);

        // Clean up
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Update duration every 100ms
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);

      // Start updating audio data for waveform
      updateAudioData();
    } catch (err) {
      console.error('Error starting recording:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access to record audio.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError('Failed to access microphone: ' + err.message);
        }
      } else {
        setError('Failed to start recording. Please try again.');
      }
    }
  }, [updateAudioData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    audioBlob,
    error,
    duration,
    audioData,
    startRecording,
    stopRecording,
    clearError,
  };
}

