import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { floatTo16BitPCM, base64ToUint8Array, uint8ArrayToBase64, pcmToFloat32 } from './audio-utils';

const MODEL_NAME = "gemini-3.1-flash-live-preview";

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export function useLiveAPI(systemInstruction: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize AI
  useEffect(() => {
    if (!process.env.GEMINI_API_KEY) {
      setError("Gemini API Key is missing.");
      return;
    }
    aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }, []);

  const playNextInQueue = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;
    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  }, []);

  const connect = useCallback(async () => {
    if (!aiRef.current) return;

    try {
      setError(null);
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = aiRef.current.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            startRecording();
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcription
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              const text = message.serverContent.modelTurn.parts[0].text;
              setMessages(prev => [...prev, { role: 'model', text, timestamp: Date.now() }]);
            }

            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const uint8 = base64ToUint8Array(base64Audio);
              const pcm16 = new Int16Array(uint8.buffer);
              const float32 = pcmToFloat32(pcm16);
              audioQueueRef.current.push(float32);
              if (!isPlayingRef.current) {
                playNextInQueue();
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              // In a real app, we'd stop the current source node too
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopRecording();
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            setIsConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to connect:", err);
      setError("Failed to establish connection.");
    }
  }, [systemInstruction, playNextInQueue]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new AudioContext({ sampleRate: 16000 });
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = uint8ArrayToBase64(new Uint8Array(pcm16.buffer));
        
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(context.destination);
      processorRef.current = processor;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setError("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    stopRecording();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    messages,
    isRecording,
    error,
    connect,
    disconnect
  };
}
