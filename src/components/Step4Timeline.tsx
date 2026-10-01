import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Play,
  Pause,
  Smartphone,
  Car,
  Video,
  Key,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { CrimeScene3D } from './CrimeScene3D';
import { CaseWorld, TimelineEvent } from '../types';

interface Step4TimelineProps {
  caseWorld: CaseWorld;
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
  onProceedCorrelation: () => void;
  onBack: () => void;
  onViewEvidenceDetail?: (evidenceId: string) => void;
}

export const Step4Timeline: React.FC<Step4TimelineProps> = ({
  caseWorld,
  selectedEventId,
  onSelectEvent,
  onProceedCorrelation,
  onBack,
  onViewEvidenceDetail,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);

  const timelineEvents = caseWorld.timeline || [];

  // Active event or default to first
  const currentEvent: TimelineEvent =
    timelineEvents.find((e) => e.id === selectedEventId) ||
    timelineEvents[0] || {
      id: 'time-default',
      time: '22:00',
      title: 'Incident Registered',
      category: 'scene',
      summary: caseWorld.summary,
      rawSignal: 'System Log Entry',
      sensorLocation: caseWorld.locationName,
      confidence: 'Verified',
    };

  const currentIndex = Math.max(0, timelineEvents.findIndex((e) => e.id === currentEvent.id));

  // Determine correlated 3D evidence
  const correlatedEvidenceId = currentEvent.correlatedEvidenceId || (
    caseWorld.objects[0]?.evidenceId || caseWorld.objects[0]?.id
  );

  const matchedEvidence = caseWorld.evidence.find(
    (e) => e.id === correlatedEvidenceId || e.code === correlatedEvidenceId
  );

  // Auto-play timeline simulation
  useEffect(() => {
    if (!isPlaying || timelineEvents.length <= 1) return;
    const timer = setInterval(() => {
      onSelectEvent(timelineEvents[(currentIndex + 1) % timelineEvents.length].id);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, onSelectEvent, timelineEvents]);

  const handlePrev = () => {
    if (timelineEvents.length === 0) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : timelineEvents.length - 1;
    onSelectEvent(timelineEvents[prevIdx].id);
  };

  const handleNext = () => {
    if (timelineEvents.length === 0) return;
    const nextIdx = (currentIndex + 1) % timelineEvents.length;
    onSelectEvent(timelineEvents[nextIdx].id);
  };

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'phone':
        return <Smartphone className="w-4 h-4 text-orange-400" />;
      case 'vehicle':
        return <Car className="w-4 h-4 text-purple-400" />;
      case 'cctv':
        return <Video className="w-4 h-4 text-blue-400" />;
      default:
        return <Key className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden font-mono">
      {/* 1. PRIMARY INTERFACE: 3D Scene in Background */}
      <div className="flex-1 w-full h-full relative">
        <CrimeScene3D
          caseWorld={caseWorld}
          selectedEvidenceId={correlatedEvidenceId}
          focusEvidenceId={correlatedEvidenceId}
          onSelectEvidence={() => {}}
          onInspectEvidence={onViewEvidenceDetail}
        />

        {/* Top Navigation & Status Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
          {/* Breadcrumb / Status */}
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs shadow-lg">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-bold text-orange-400">CHRONOLOGICAL REPLAY</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200 uppercase">{caseWorld.caseNumber}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Back to Step 3 */}
            <button
              type="button"
              onClick={onBack}
              id="timeline-back-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-xs font-semibold shadow-lg transition-all cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-500" />
              <span>BACK TO 3D SCENE</span>
            </button>

            {/* Toggle Telemetry Card */}
            <button
              type="button"
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold shadow-lg transition-all cursor-pointer backdrop-blur-md"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showTelemetry ? 'HIDE TELEMETRY' : 'SHOW TELEMETRY'}</span>
            </button>

            {/* Proceed to Correlation (Step 5) */}
            <button
              type="button"
              id="proceed-correlation-button"
              onClick={onProceedCorrelation}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold border border-orange-400 shadow-lg transition-all cursor-pointer"
            >
              <span>CORRELATION MATRIX</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Left Floating Forensic Telemetry HUD */}
        {showTelemetry && (
          <div className="absolute top-16 left-4 z-20 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-4 shadow-2xl text-white animate-fade-in pointer-events-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-extrabold text-base">{currentEvent.time}</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[160px]">
                  // {currentEvent.title}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                NTP SYNC
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 mb-3">
              <p className="leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                {currentEvent.summary}
              </p>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Raw Signal:</span>
                  <span className="text-cyan-300 truncate max-w-[190px]">{currentEvent.rawSignal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sensor Location:</span>
                  <span className="text-slate-200 truncate max-w-[190px]">{currentEvent.sensorLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Forensic Confidence:</span>
                  <span className="text-emerald-400 font-bold">{currentEvent.confidence}</span>
                </div>
              </div>
            </div>

            {/* Correlated 3D Evidence Highlight */}
            {matchedEvidence && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-[11px] text-slate-300">
                    Focused 3D Object: <span className="text-orange-400 font-bold">{matchedEvidence.name}</span>
                  </span>
                </div>
                {onViewEvidenceDetail && (
                  <button
                    type="button"
                    onClick={() => onViewEvidenceDetail(matchedEvidence.id)}
                    className="text-[10px] text-orange-400 hover:text-orange-300 underline cursor-pointer"
                  >
                    Inspect
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. SPEC-MATCHING TIMELINE OVERLAY AT BOTTOM OF SCREEN */}
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-4 shadow-2xl pointer-events-auto">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer"
                title="Previous Event"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-orange-500 text-slate-950 border-orange-400 hover:bg-orange-600'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'PAUSE REPLAY' : 'PLAY REPLAY'}</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 cursor-pointer"
                title="Next Event"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Central Active Timestamp Display */}
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-slate-400">ACTIVE TIMELINE STAMP:</span>
              <span className="text-orange-400 font-extrabold text-sm px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {currentEvent.time}
              </span>
              <span className="text-white font-semibold hidden md:inline">({currentEvent.title})</span>
            </div>

            <div className="text-[11px] text-slate-400 hidden lg:block">
              CLICK ANY TIMESTAMP TO FOCUS CAMERA IN 3D SCENE
            </div>
          </div>

          {/* Connected Timeline Axis Line */}
          <div className="relative pt-2 pb-1">
            <div className="absolute top-7 left-8 right-8 h-1 bg-slate-800 rounded-full" />
            <div
              className="absolute top-7 left-8 h-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
              style={{
                width: timelineEvents.length > 1 ? `${(currentIndex / (timelineEvents.length - 1)) * 100}%` : '100%',
              }}
            />

            {/* Sequential Events */}
            <div className="relative flex justify-between items-center px-4">
              {timelineEvents.map((event, idx) => {
                const isActive = event.id === currentEvent.id;
                const isPassed = idx <= currentIndex;

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      onSelectEvent(event.id);
                      setIsPlaying(false);
                    }}
                    className="flex flex-col items-center group cursor-pointer transition-all z-10"
                  >
                    {/* Event Node Circle */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-orange-500 border-white text-slate-950 ring-4 ring-orange-500/40 scale-125'
                          : isPassed
                          ? 'bg-slate-900 border-orange-500 text-orange-400 hover:scale-110'
                          : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {getEventIcon(event.category)}
                    </div>

                    {/* Time Label */}
                    <span
                      className={`mt-2 text-xs font-bold transition-colors ${
                        isActive ? 'text-orange-400 font-mono scale-110' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {event.time}
                    </span>

                    {/* Short Event Label */}
                    <span
                      className={`text-[10px] hidden sm:block truncate max-w-[110px] text-center mt-0.5 ${
                        isActive ? 'text-white font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {event.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
