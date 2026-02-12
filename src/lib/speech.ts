// Speech Recognition utilities for voice-based interview practice
import React from "react";

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  provider?: "browser" | "elevenlabs";
}

// Type definitions for the Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export class VoiceRecorder {
  private recognition: SpeechRecognitionInstance;
  private isListening: boolean = false;
  private onResult: ((result: SpeechRecognitionResult) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onEnd: (() => void) | null = null;

  constructor(config: SpeechRecognitionConfig = {}) {
    if (!this.isSupported()) {
      throw new Error("Speech recognition is not supported in this browser");
    }

    // Use browser's speech recognition API
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI!();

    // Configure recognition
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.lang = config.language ?? "en-US";
    this.recognition.maxAlternatives = config.maxAlternatives ?? 1;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!this.onResult) return;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        this.onResult({
          transcript,
          confidence: confidence || 0.9, // Fallback confidence
          isFinal,
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (this.onError) {
        this.onError(`Speech recognition error: ${event.error}`);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) {
        this.onEnd();
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
    };
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public startListening(): void {
    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch {
      if (this.onError) {
        this.onError("Failed to start speech recognition");
      }
    }
  }

  public stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.recognition.stop();
  }

  public setOnResult(
    callback: (result: SpeechRecognitionResult) => void,
  ): void {
    this.onResult = callback;
  }

  public setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  public setOnEnd(callback: () => void): void {
    this.onEnd = callback;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

// Enhanced Text-to-Speech with multiple free providers
export class VoiceSynthesis {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private elevenLabsApiKey: string | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    // Optional: Set Eleven Labs API key if available (free tier: 10,000 chars/month)
    this.elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || null;
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();

    // If voices aren't loaded yet, wait for the event
    if (this.voices.length === 0) {
      this.synthesis.addEventListener("voiceschanged", () => {
        this.voices = this.synthesis.getVoices();
      });
    }
  }

  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text.trim()) {
      return;
    }

    // Use Eleven Labs if API key is available and requested
    if (options.provider === "elevenlabs" && this.elevenLabsApiKey) {
      return this.speakWithElevenLabs(text, options);
    }

    // Default to browser Speech Synthesis (always free)
    return this.speakWithBrowser(text, options);
  }

  private speakWithBrowser(text: string, options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Set options
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      // Find and set voice
      if (options.voice) {
        const voice = this.voices.find(
          (v) =>
            v.name.toLowerCase().includes(options.voice!.toLowerCase()) ||
            v.lang.toLowerCase().includes(options.voice!.toLowerCase()),
        );
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  private async speakWithElevenLabs(
    text: string,
    options: TTSOptions,
  ): Promise<void> {
    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": this.elevenLabsApiKey!,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Eleven Labs API error");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play();
      });
    } catch (error) {
      console.warn(
        "Eleven Labs TTS failed, falling back to browser TTS:",
        error,
      );
      return this.speakWithBrowser(text, options);
    }
  }

  public stop(): void {
    this.synthesis.cancel();
  }

  public pause(): void {
    this.synthesis.pause();
  }

  public resume(): void {
    this.synthesis.resume();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public isSupported(): boolean {
    return "speechSynthesis" in window;
  }
}

// Hook for React components
export function useSpeechRecognition(config?: SpeechRecognitionConfig) {
  const [transcript, setTranscript] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSupported, setIsSupported] = React.useState(false);

  const voiceRecorderRef = React.useRef<VoiceRecorder | null>(null);

  // Store config in a ref to avoid dependency issues
  const configRef = React.useRef(config);
  configRef.current = config;

  React.useEffect(() => {
    try {
      const recorder = new VoiceRecorder(configRef.current);
      voiceRecorderRef.current = recorder;
      setIsSupported(true);

      recorder.setOnResult((result) => {
        if (result.isFinal) {
          setTranscript((prev) => prev + " " + result.transcript);
        }
      });

      recorder.setOnError((errorMessage) => {
        setError(errorMessage);
        setIsListening(false);
      });

      recorder.setOnEnd(() => {
        setIsListening(false);
      });
    } catch {
      setIsSupported(false);
      setError("Speech recognition not supported");
    }

    return () => {
      if (voiceRecorderRef.current) {
        voiceRecorderRef.current.stopListening();
      }
    };
  }, []);

  const startListening = React.useCallback(() => {
    if (voiceRecorderRef.current && !isListening) {
      setError(null);
      setTranscript("");
      voiceRecorderRef.current.startListening();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = React.useCallback(() => {
    if (voiceRecorderRef.current && isListening) {
      voiceRecorderRef.current.stopListening();
    }
  }, [isListening]);

  const resetTranscript = React.useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
