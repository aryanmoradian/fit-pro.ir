
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Radio, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MODEL_LIVE } from '../constants';
import { ai } from '../services/geminiService';

const LiveCoach: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [status, setStatus] = useState('آفلاین');
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // Holds the active session

  // Audio Processing Vars
  let nextStartTime = 0;
  const sources = new Set<AudioBufferSourceNode>();

  const connectToLive = async () => {
    try {
      setStatus('راه اندازی صدا...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      setStatus('اتصال به هوش مصنوعی...');

      // Live Connect
      const sessionPromise = ai.live.connect({
        model: MODEL_LIVE,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are an intense, high-performance bodybuilding coach. Motivate the user, track their sets, and keep them focused. Be concise and energetic. Speak Farsi/Persian if addressed in Farsi, but you can use English technical terms.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }, // Deep, authoritative voice
          },
        },
        callbacks: {
          onopen: () => {
            setStatus('مربی آنلاین است');
            setIsConnected(true);

            // Setup Input Streaming
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
                setIsTalking(true);
                // Decode and Play
                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                
                source.addEventListener('ended', () => {
                    sources.delete(source);
                    if (sources.size === 0) setIsTalking(false);
                });

                source.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
                sources.add(source);
            }
          },
          onclose: () => {
            setStatus('قطع ارتباط');
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error(err);
            setStatus('خطا در اتصال');
            setIsConnected(false);
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Live API Error:", err);
      setStatus('عدم موفقیت در اتصال');
    }
  };

  const disconnect = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    // Note: currently no direct .close() on session promise wrapper in SDK snippet, 
    // but stopping the stream ends interaction effectively.
    setIsConnected(false);
    setStatus('آفلاین');
    setIsTalking(false);
  };

  // --- Helpers ---
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return {
        data: base64,
        mimeType: 'audio/pcm;rate=16000'
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
     const dataInt16 = new Int16Array(data.buffer);
     const frameCount = dataInt16.length / numChannels;
     const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
     for (let channel = 0; channel < numChannels; channel++) {
       const channelData = buffer.getChannelData(channel);
       for (let i = 0; i < frameCount; i++) {
         channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
       }
     }
     return buffer;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start space-y-2">
        {isConnected && (
             <div className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full border border-slate-700 shadow-lg flex items-center gap-2 animate-fade-in">
                 {isTalking && <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />}
                 <span>{status}</span>
             </div>
        )}
      <button
        onClick={isConnected ? disconnect : connectToLive}
        className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 ${
          isConnected 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-500/30' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
      >
        {isConnected ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
    </div>
  );
};

export default LiveCoach;