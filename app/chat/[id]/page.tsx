'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Bot, Mic, Loader2, X, Copy, Check, Volume2, Square } from 'lucide-react';
import { CaregiverProfileCard } from '@/components/CaregiverProfileCard';
import { CaregiverProfile } from '@/db/types';
import { useAudioRecording } from '@/lib/hooks/useAudioRecording';
import { InlineWaveform } from '@/components/InlineWaveform';

export default function Chat() {
  const params = useParams();
  const router = useRouter();
  const caregiverId = params.id as string;
  
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: async (url, options) => {
        const modifiedOptions = {
          ...options,
          body: JSON.stringify({
            ...JSON.parse(options?.body as string || '{}'),
            caregiverId: caregiverId,
          }),
        };
        return fetch(url, modifiedOptions);
      },
    }),
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'submitted';
  const isStreaming = status === 'streaming';

  const [caregiver, setCaregiver] = useState<CaregiverProfile | null>(null);
  
  // Speech-to-text states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  
  // Copy to clipboard state
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Text-to-speech states
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const {
    isRecording,
    audioBlob,
    error: recordingError,
    duration,
    audioData,
    startRecording,
    stopRecording,
    clearError,
  } = useAudioRecording();

  // Count non-null fields, we don't show the profile when a new chat is started, only show the profile when there are at least 1 field filled
  // This is to avoid showing the profile when a new chat is started and the profile is empty
  const countNonNullFields = (profile: CaregiverProfile | null): number => {
    if (!profile) return 0;
    
    let count = 0;
    
    if (profile.location) count++;
    if (profile.profilePictureUrl) count++;
    if (profile.startDate) count++;
    if (profile.generalAvailability) count++;
    if (profile.weeklyHours) count++;
    if (profile.commuteDistance) count++;
    if (profile.commuteType) count++;
    if (profile.willDriveChildren) count++;
    if (profile.accessibilityNeeds) count++;
    if (profile.hourlyRate) count++;
    if (profile.additionalChildRate) count++;
    if (profile.payrollRequired) count++;
    
    if (profile.qualifications.length > 0) count++;
    if (profile.languages.length > 0) count++;
    if (profile.preferredAgeGroups.length > 0) count++;
    if (profile.dietaryPreferences.length > 0) count++;
    if (profile.responsibilities.length > 0) count++;
    if (profile.benefitsRequired.length > 0) count++;
    if (profile.careTypes.length > 0) count++;
    
    if (Object.keys(profile.yearsOfExperience).length > 0) count++;
    
    return count;
  };

  const fetchCaregiverData = async () => {
    try {
      const response = await fetch(`/api/caregivers/${caregiverId}`);
      if (response.ok) {
        const data = await response.json();
        setCaregiver(data);
      }
    } catch (error) {
      console.error('Error fetching caregiver data:', error);
    }
  };

  useEffect(() => {
    fetchCaregiverData();
    const interval = setInterval(fetchCaregiverData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [caregiverId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (audioBlob && !isRecording) {
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, isRecording]);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      setTranscriptionError(recordingError);
    }
  }, [recordingError]);

  const handleMicClick = async () => {
    setTranscriptionError(null);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      
      if (data.text) {
        setInput(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptionError(
        error instanceof Error ? error.message : 'Failed to transcribe audio'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const shouldShowProfile = caregiver && countNonNullFields(caregiver) >= 1;

  const handleCopyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleTextToSpeech = async (messageId: string, text: string) => {
    // If this message is already playing, stop it
    if (playingMessageId === messageId && audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setPlayingMessageId(null);
      setAudioInstance(null);
      return;
    }

    // Stop any currently playing audio
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
    }

    setIsGeneratingAudio(true);

    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setPlayingMessageId(null);
        setAudioInstance(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingMessageId(null);
        setAudioInstance(null);
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error');
      };

      setAudioInstance(audio);
      setPlayingMessageId(messageId);
      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setPlayingMessageId(null);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }
    };
  }, [audioInstance]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {shouldShowProfile && (
        <CaregiverProfileCard caregiver={caregiver} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          className="fixed top-4 right-4 z-20 h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 overflow-y-auto">
        <div className={`${messages.length === 0 ? 'h-full flex items-center justify-center' : ''}`}>
        <div className="w-full max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="mb-6 rounded-full bg-blue-500 p-6">
                <Bot className="h-12 w-12 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Let&apos;s Build Your Profile
              </h2>
              <p className="max-w-md text-gray-600 dark:text-gray-400">
                Tell me about your experience, preferences, and what you&apos;re looking for in a caregiving position.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4 min-h-full">
              {messages.map((message) => {
                if (!message.parts || message.parts.length === 0) {
                  return null;
                }
                
                const textParts = message.parts.filter(part => part.type === 'text');
                const toolParts = message.parts.filter(part => 
                  part.type.startsWith('tool-') || part.type === 'dynamic-tool'
                );
                
                return (
                  <div key={message.id} className="space-y-2">
                    {toolParts.map((part, index) => {
                      const toolPart = part as any;
                      return (
                        <div key={`tool-${index}`} className="flex">
                          <div className="max-w-[80%] rounded-lg px-3 py-2 text-center text-xs text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Assistant called {toolPart.toolName || part.type.replace('tool-', '')} tool</span>
                            {toolPart.args && (
                              <div className="mt-1 text-[11px] opacity-70">
                                {JSON.stringify(toolPart.args)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {textParts.length > 0 && (
                      <div className="space-y-1">
                        <div
                          className={`flex items-end gap-2 ${
                            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        > 
                          <div
                            className={`group max-w-[75%] rounded-3xl px-4 py-3 ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {textParts.map((part, index) => (
                              <div key={index} className="whitespace-pre-wrap text-[15px] leading-relaxed">
                                {(part as any).text}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 pl-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const fullText = textParts
                                  .map(part => (part as any).text)
                                  .join('\n');
                                handleCopyMessage(message.id, fullText);
                              }}
                              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const fullText = textParts
                                  .map(part => (part as any).text)
                                  .join('\n');
                                handleTextToSpeech(message.id, fullText);
                              }}
                              disabled={isGeneratingAudio}
                              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
                            >
                              {isGeneratingAudio ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : playingMessageId === message.id ? (
                                <Square className="h-3.5 w-3.5" />
                              ) : (
                                <Volume2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="rounded-3xl px-5 py-4 bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        </div>
      </div>

      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        </div>
      )}

      {transcriptionError && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950 animate-in slide-in-from-top duration-300">
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Transcription Error:</strong> {transcriptionError}
            </p>
            <button
              onClick={() => {
                setTranscriptionError(null);
                clearError();
              }}
              className="text-red-800 hover:text-red-900 dark:text-red-200 dark:hover:text-red-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {isTranscribing && (
        <div className="border-t border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950 animate-in slide-in-from-top duration-300">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Transcribing your audio...
            </p>
          </div>
        </div>
      )}

      <div className="sticky bottom-3 z-10">
        <div className="flex justify-center">
        <div className="w-full max-w-3xl px-4 py-3">
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput('');
              }
            }}
            className="flex items-center gap-2"
          >
            {isRecording ? (
              <InlineWaveform
                audioData={audioData}
                duration={duration}
                onStop={handleStopRecording}
              />
            ) : (
              <>
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading || isTranscribing}
                    className="h-11 rounded-full border-gray-300 bg-white pr-12 text-base placeholder:text-gray-400 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500 shadow-none"
                  />

                  {input.trim() && !isLoading && !isTranscribing && (
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Button
                  type="button"
                  size="icon"
                  onClick={handleMicClick}
                  disabled={isLoading || isTranscribing}
                  className="h-11 w-11 shrink-0 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                >
                  {isTranscribing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Mic className="h-5 w-5 text-white" />
                  )}
                </Button>
              </>
            )}
          </form>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}

