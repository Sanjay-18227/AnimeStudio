import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  Square,
  Globe2,
  Sliders,
  Send,
  Sparkles,
  AlertCircle,
  Radio
} from 'lucide-react';

const VOICE_LANGUAGES = [
  { code: 'en-US', label: 'English', labelTa: 'ஆங்கிலம்', flag: '🇺🇸', name: 'en' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)', labelTa: 'தமிழ்', flag: '🇮🇳', name: 'ta' },
  { code: 'ja-JP', label: 'Japanese (日本語)', labelTa: 'ஜப்பானிய மொழி', flag: '🇯🇵', name: 'ja' },
];

export default function VoiceModeModal({
  isOpen,
  onClose,
  onSendMessage,
  lastAssistantMessage,
  language = 'en',
  assistantName = 'Anime Studio AI',
  voiceSpeed = 1.0
}) {
  if (!isOpen) return null;

  const isTamil = language === 'ta';

  // Voice recognition & synthesis state
  const [selectedLang, setSelectedLang] = useState(
    language === 'ta' ? 'ta-IN' : language === 'ja' ? 'ja-JP' : 'en-US'
  );
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speed, setSpeed] = useState(voiceSpeed || 1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Check speech recognition support
  const hasSpeechRecognition = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Load available TTS voices
  useEffect(() => {
    if (!synthRef.current) return;

    const updateVoices = () => {
      const voices = synthRef.current.getVoices();
      setAvailableVoices(voices);

      // Pick default voice matching selected language
      const match = voices.find((v) => v.lang.startsWith(selectedLang.split('-')[0]));
      if (match) setSelectedVoice(match);
    };

    updateVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = updateVoices;
    }
  }, [selectedLang]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!hasSpeechRecognition) {
      setSpeechError('Browser speech recognition not supported. Type or try Chrome/Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => (prev ? `${prev} ${final}` : final));
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone permission denied. Please allow microphone access.');
      } else if (event.error !== 'no-speech') {
        setSpeechError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [selectedLang, hasSpeechRecognition]);

  // Speak AI response when new assistant message arrives
  useEffect(() => {
    if (lastAssistantMessage && lastAssistantMessage.content && !isMuted) {
      speakText(lastAssistantMessage.content);
    }
  }, [lastAssistantMessage]);

  const startListening = () => {
    if (!recognitionRef.current || isMuted) return;
    setSpeechError('');
    try {
      // Stop ongoing speech before listening
      stopSpeaking();
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Could not start recognition:', e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {}
    setIsListening(false);
  };

  const handleSendTranscript = async () => {
    const textToSend = (transcript + ' ' + interimTranscript).trim();
    if (!textToSend || isProcessing) return;

    stopListening();
    setIsProcessing(true);
    setTranscript('');
    setInterimTranscript('');

    try {
      await onSendMessage(textToSend);
    } catch (err) {
      setSpeechError(err.message || 'Failed to send voice message');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current || isMuted) return;

    stopSpeaking();

    // Strip markdown formatting for cleaner audio
    const cleanText = text
      .replace(/###?\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/•/g, '')
      .replace(/[*_~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang;
    utterance.rate = speed;
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const togglePauseSpeaking = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleClose = () => {
    stopListening();
    stopSpeaking();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-xl rounded-3xl border border-studio-purple/40 bg-gradient-to-b from-[#14122E] via-[#0E1022] to-[#0A0C16] p-6 shadow-2xl text-white overflow-hidden">
        {/* Glowing Background Ambiance */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-studio-purple/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-studio-cyan/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-studio-border/60 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-studio-purple to-studio-cyan text-white shadow-glow-purple">
              <Radio className="h-5 w-5 text-violet-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>{assistantName} Voice Mode</span>
                <span className="rounded-full bg-studio-cyan/20 text-studio-cyan-light text-[10px] font-semibold px-2 py-0.5 border border-studio-cyan/30">
                  Hands-Free
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isTamil ? 'நேரடி குரல் உரையாடல் முறை' : 'Real-time conversational speech co-pilot'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-xl border border-studio-border bg-studio-card/80 p-1.5 text-slate-400 hover:text-white hover:bg-studio-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Central Audio Waveform & Animated Orb */}
        <div className="relative z-10 flex flex-col items-center justify-center py-8 space-y-5">
          {/* Pulsating Reactive Orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer rings */}
            <div
              className={`absolute h-36 w-36 rounded-full transition-all duration-500 ${
                isListening
                  ? 'bg-studio-cyan/20 animate-ping'
                  : isSpeaking
                  ? 'bg-studio-purple/20 animate-pulse'
                  : 'bg-slate-700/10'
              }`}
            />
            <div
              className={`absolute h-28 w-28 rounded-full border transition-all duration-300 ${
                isListening
                  ? 'border-studio-cyan shadow-glow-cyan'
                  : isSpeaking
                  ? 'border-studio-purple shadow-glow-purple'
                  : 'border-studio-border'
              }`}
            />

            {/* Central Microphone / Speaker Hub */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-studio-border transition-all duration-300 shadow-xl ${
                isListening
                  ? 'bg-studio-cyan text-black shadow-glow-cyan scale-105'
                  : isSpeaking
                  ? 'bg-studio-purple text-white shadow-glow-purple'
                  : 'bg-studio-elevated text-slate-300 hover:text-white hover:bg-studio-hover'
              }`}
            >
              {isListening ? (
                <Mic className="h-8 w-8 text-cyan-400 animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="h-8 w-8 text-violet-400 animate-bounce" />
              ) : (
                <Mic className="h-8 w-8 text-violet-400" />
              )}
            </button>
          </div>

          {/* Status Label */}
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-studio-purple-light">
              {isListening
                ? (isTamil ? 'உரையாடலைக் கேட்கிறது...' : 'Listening to your voice...')
                : isSpeaking
                ? (isTamil ? 'AI பேசுகிறது...' : `${assistantName} is speaking...`)
                : isProcessing
                ? (isTamil ? 'சிந்திக்கிறது...' : 'Thinking & drafting response...')
                : (isTamil ? 'தொடங்க மைக்-ஐ அழுத்தவும்' : 'Tap microphone to speak')}
            </span>
            <p className="text-[11px] text-slate-400">
              {isTamil ? 'ஆங்கிலம், தமிழ் மற்றும் ஜப்பானிய மொழிக்கு ஆதரவு உள்ளது' : 'Speaks & listens in English, Tamil & Japanese'}
            </p>
          </div>

          {/* Animated Waveform Bars */}
          <div className="flex items-center gap-1.5 h-8">
            {[40, 70, 90, 60, 100, 50, 80, 45, 95, 65, 30].map((height, i) => (
              <span
                key={i}
                className={`mono-visual w-1 rounded-full transition-all duration-150 ${
                  isListening || isSpeaking ? 'opacity-100' : 'opacity-50'
                }`}
                style={{
                  height: isListening || isSpeaking ? `${height}%` : '20%',
                  animationDelay: `${i * 60}ms`
                }}
              />
            ))}
          </div>
        </div>

        {/* Live Transcript / Speech Box */}
        <div className="relative z-10 rounded-2xl border border-studio-border bg-[#0C0E1C]/90 p-4 space-y-2 max-h-36 overflow-y-auto shadow-inner text-xs">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
            <span>{isTamil ? 'நேரடி உரை / டிரான்ஸ்கிரிப்ட்:' : 'Live Transcription:'}</span>
            {transcript && (
              <button
                onClick={() => { setTranscript(''); setInterimTranscript(''); }}
                className="text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-slate-200 min-h-[32px] break-words leading-relaxed font-sans">
            {transcript || interimTranscript ? (
              <>
                <span>{transcript}</span>
                <span className="text-studio-cyan italic"> {interimTranscript}</span>
              </>
            ) : (
              <span className="text-slate-500 italic">
                {isTamil ? 'நீங்கள் பேசும் வார்த்தைகள் இங்கே தோன்றும்...' : 'Your spoken words will appear here...'}
              </span>
            )}
          </div>
        </div>

        {speechError && (
          <div className="relative z-10 mt-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Voice Controls & Language Selector */}
        <div className="relative z-10 mt-4 pt-3 border-t border-studio-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Language Pills */}
          <div className="flex items-center gap-1.5">
            {VOICE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  selectedLang === lang.code
                    ? 'bg-studio-purple text-white shadow-sm border border-studio-purple'
                    : 'border border-studio-border bg-studio-card text-slate-400 hover:text-white'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <>
                <button
                  onClick={togglePauseSpeaking}
                  className="flex items-center gap-1 rounded-lg border border-studio-border bg-studio-card px-2.5 py-1 text-[11px] text-slate-300 hover:text-white"
                  title={isPaused ? "Resume speech" : "Pause speech"}
                >
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20"
                  title="Interrupt speech"
                >
                  <Square className="h-3 w-3" />
                  <span>Stop Speech</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] transition-colors ${
                isMuted
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-studio-border bg-studio-card text-slate-300 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              <span>{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>

            <button
              disabled={!(transcript + interimTranscript).trim() || isProcessing}
              onClick={handleSendTranscript}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-studio-purple to-studio-cyan px-4 py-1.5 text-xs font-semibold text-white shadow-glow-purple hover:opacity-95 transition-all disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isProcessing ? 'Thinking...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

