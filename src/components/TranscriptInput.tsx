import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_TRANSCRIPTS, SampleTranscript } from '../data/sampleTranscripts';
import { 
  FileText, 
  Sparkles, 
  Mic, 
  MicOff, 
  Upload, 
  RotateCcw, 
  Search, 
  Info,
  Clock,
  Play,
  Volume2
} from 'lucide-react';

interface TranscriptInputProps {
  transcript: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const COMMITMENT_MARKERS = [
  'I will',
  'I\'ll',
  'I promise to',
  'let\'s meet',
  'let us meet',
  'don\'t forget to',
  'I need to finish',
  'by tomorrow',
  'by Friday',
  'we will meet',
  'I commit to',
  'I\'ll make sure'
];

export const TranscriptInput: React.FC<TranscriptInputProps> = ({
  transcript,
  onChange,
  onAnalyze,
  isAnalyzing,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('client-pitch');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcriptText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcriptText += event.results[i][0].transcript + ' ';
          }
        }
        if (transcriptText) {
          onChange(transcript + (transcript ? '\n' : '') + 'Speaker: ' + transcriptText.trim());
        }
      };

      rec.onerror = () => {
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [transcript, onChange]);

  const toggleRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. You can type or paste a transcript directly.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSelectPreset = (preset: SampleTranscript) => {
    setSelectedPresetId(preset.id);
    onChange(preset.transcript);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content);
        setSelectedPresetId('custom');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Count detected markers in current text
  const detectedMarkersCount = COMMITMENT_MARKERS.reduce((acc, marker) => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = transcript.match(regex);
    return acc + (matches ? matches.length : 0);
  }, 0);

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const lineCount = transcript.trim() ? transcript.trim().split('\n').length : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 shrink-0">
          <FileText className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Input Phone Call Transcript
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs min-w-0 flex-1 justify-start sm:justify-end">
          <span className="text-slate-400 shrink-0 hidden sm:inline">Presets:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            {SAMPLE_TRANSCRIPTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedPresetId === preset.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {preset.name.split('&')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative">
        <textarea
          value={transcript}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedPresetId('custom');
          }}
          placeholder="Paste or type raw telephone conversation transcript here (e.g., 'Sarah: I will send over the updated financial sensitivity models by tomorrow at 4 PM...')"
          className="w-full h-72 sm:h-80 bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 pb-14 pr-28 font-mono text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 resize-none leading-relaxed transition-all"
        />

        {/* Toolbar in bottom-right of textarea */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.vtt,.srt,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700/60 cursor-pointer shadow-md"
            title="Upload Transcript (.txt, .vtt, .srt)"
          >
            <Upload className="h-4 w-4" />
          </button>

          <button
            onClick={toggleRecording}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-md ${
              isRecording
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                : 'bg-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border-slate-700/60'
            }`}
            title={isRecording ? 'Stop Recording' : 'Dictate with Microphone'}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            onClick={() => {
              onChange('');
              setSelectedPresetId('custom');
            }}
            className="p-1.5 rounded-lg bg-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700/60 cursor-pointer shadow-md"
            title="Clear Transcript"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Linguistic Marker Detection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 px-3.5 py-2.5 rounded-xl border border-slate-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            Detected Verbal Markers:
          </span>
          {detectedMarkersCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {detectedMarkersCount} linguistic trigger{detectedMarkersCount > 1 ? 's' : ''} found
            </span>
          ) : (
            <span className="text-slate-500 italic">No verbal promise markers found in text</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] shrink-0">
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{transcript.length} chars</span>
        </div>
      </div>

      {/* Execution Call to Action */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-400 hidden md:block">
          Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">Ctrl+Enter</kbd> to analyze
        </p>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !transcript.trim()}
          style={!isAnalyzing && transcript.trim() ? { backgroundColor: '#F5B942' } : undefined}
          className={`w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            isAnalyzing || !transcript.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-[#F5B942] hover:brightness-105 active:brightness-95 text-slate-950 shadow-[#F5B942]/25 hover:shadow-[#F5B942]/40 hover:scale-[1.01] active:scale-[0.99] border border-[#e5a832]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Scanning Transcript Markers...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>Extract Commitments & Promises</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
