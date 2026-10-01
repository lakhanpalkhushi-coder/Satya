import React, { useState } from 'react';
import { ArrowLeft, Clock, Map, FolderOpen, ArrowRight, X, Sparkles } from 'lucide-react';
import { CrimeScene3D } from './CrimeScene3D';
import { CaseWorld, StepId } from '../types';

interface Step3CrimeSceneProps {
  caseWorld: CaseWorld;
  selectedEvidenceId: string | null;
  onSelectEvidence: (id: string) => void;
  onProceedTimeline: () => void;
  onBack: () => void;
  onNavigateStep?: (step: StepId) => void;
  onInspectEvidence?: (id: string) => void;
  onOpenCaseBuilder?: () => void;
}

export const Step3CrimeScene: React.FC<Step3CrimeSceneProps> = ({
  caseWorld,
  selectedEvidenceId,
  onSelectEvidence,
  onProceedTimeline,
  onBack,
  onNavigateStep,
  onInspectEvidence,
  onOpenCaseBuilder,
}) => {
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState<boolean>(false);

  const evidenceList =
    caseWorld.evidence && caseWorld.evidence.length > 0
      ? caseWorld.evidence
      : caseWorld.objects.map((obj) => ({
          id: obj.evidenceId || obj.id,
          code: obj.id.toUpperCase(),
          name: obj.name,
          type: obj.type,
          source: obj.sourceEvidence,
          location: obj.location,
          timestamp: obj.timestamp,
          shortDesc: `Found at ${obj.location}`,
          details: `Source: ${obj.sourceEvidence}`,
          chainOfCustody: 'Logged by First Responder',
        }));

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden font-mono">
      {/* 3D Crime Scene occupies full viewport */}
      <div className="flex-1 w-full h-full relative">
        <CrimeScene3D
          caseWorld={caseWorld}
          selectedEvidenceId={selectedEvidenceId}
          onSelectEvidence={onSelectEvidence}
          onInspectEvidence={onInspectEvidence}
        />

        {/* Top-Right Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* AI Case Builder Quick Switch */}
          {onOpenCaseBuilder && (
            <button
              type="button"
              onClick={onOpenCaseBuilder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
              title="Upload evidence or switch between preset investigation worlds"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SWITCH CASE WORLD</span>
            </button>
          )}

          {/* Back Button (Strict: 3 -> 2 Map) */}
          <button
            type="button"
            onClick={onBack}
            id="step3-back-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/90 text-xs font-semibold shadow-lg transition-all cursor-pointer backdrop-blur-md"
            title="Return to Map"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-orange-500" />
            <span>BACK TO MAP</span>
          </button>

          {/* Evidence Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowEvidenceDrawer(!showEvidenceDrawer)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-lg transition-all cursor-pointer backdrop-blur-md ${
              showEvidenceDrawer
                ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/90 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>EVIDENCE ({evidenceList.length})</span>
          </button>

          {/* Map Link */}
          {onNavigateStep && (
            <button
              type="button"
              onClick={() => onNavigateStep(2)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/90 text-xs font-semibold shadow-lg transition-all cursor-pointer backdrop-blur-md"
              title="View Satellite Map"
            >
              <Map className="w-3.5 h-3.5 text-blue-400" />
              <span>MAP</span>
            </button>
          )}

          {/* Timeline Action (Proceed to Step 4) */}
          <button
            type="button"
            id="proceed-timeline-button"
            onClick={onProceedTimeline}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold border border-orange-400 shadow-lg transition-all cursor-pointer"
            title="Enter Chronological Timeline Overlay"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>TIMELINE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Minimal Evidence Quick Drawer Overlay */}
        {showEvidenceDrawer && (
          <div className="absolute top-16 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-white animate-fade-in max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-orange-400">PHYSICAL EVIDENCE LOG</span>
              <button
                type="button"
                onClick={() => setShowEvidenceDrawer(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {evidenceList.map((ev, idx) => {
                const isSelected = ev.id === selectedEvidenceId;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      onSelectEvidence(ev.id);
                      setShowEvidenceDrawer(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-400">#{idx + 1} {ev.code}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-400">
                        {ev.type}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5">{ev.name}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">{ev.shortDesc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
