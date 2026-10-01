import React from 'react';
import { ArrowLeft, ChevronRight, Box, Map, Clock, GitFork, Shield, Sparkles } from 'lucide-react';
import { CaseWorld, StepId } from '../types';

interface HeaderProps {
  currentStep: StepId;
  caseWorld: CaseWorld;
  onNavigateStep: (step: StepId) => void;
  onBack: () => void;
  onOpenCaseBuilder?: () => void;
}

const STEPS: { id: StepId; label: string; icon: React.ReactNode }[] = [
  { id: 1, label: 'CASE DOSSIER', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 2, label: 'SPATIAL MAP', icon: <Map className="w-3.5 h-3.5" /> },
  { id: 3, label: '3D CRIME SCENE', icon: <Box className="w-3.5 h-3.5" /> },
  { id: 4, label: 'TIMELINE REPLAY', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 5, label: 'CORRELATION MATRIX', icon: <GitFork className="w-3.5 h-3.5" /> },
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  caseWorld,
  onNavigateStep,
  onBack,
  onOpenCaseBuilder,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 shadow-md font-mono select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateStep(1)}
            className="flex items-center gap-2 text-left group transition-opacity hover:opacity-90 cursor-pointer"
            title="Return to Case Briefing"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-black text-sm tracking-wider shadow-lg border border-orange-400">
              S7
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-wider text-base">SATYA</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/40">
                  3D FORENSICS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Digital Crime Scene Exploration</p>
            </div>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Case Identifier */}
          <div className="hidden lg:flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
            <span className="font-bold text-orange-400">{caseWorld.caseNumber}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 truncate max-w-[140px]">{caseWorld.title}</span>
          </div>

          {/* Switch Case / Upload Evidence AI button */}
          {onOpenCaseBuilder && (
            <button
              type="button"
              onClick={onOpenCaseBuilder}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold transition-all cursor-pointer"
              title="Upload new evidence or switch between preset investigation worlds"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW CASE / UPLOAD</span>
            </button>
          )}
        </div>

        {/* Step Indicator (Minimalist HUD tabs) */}
        <nav aria-label="Investigation Steps" className="hidden md:flex items-center gap-1">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => onNavigateStep(step.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-slate-950 font-bold shadow-md border border-orange-400'
                      : isCompleted
                      ? 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 border border-transparent'
                  }`}
                  title={`Step ${step.id}: ${step.label}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isActive
                        ? 'bg-slate-950 text-orange-400'
                        : isCompleted
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Global Back Button */}
        <div className="flex items-center gap-2 shrink-0">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              id="header-back-button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-md cursor-pointer hover:border-orange-500"
              title={`Return to Step ${currentStep - 1}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>BACK</span>
              <span className="hidden sm:inline text-slate-400 text-[10px]">
                ({STEPS[currentStep - 2]?.label.split(' ')[0]})
              </span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">AI ENGINE ONLINE</span>
          </div>
        </div>
      </div>

      {/* Mobile Step Bar */}
      <div className="md:hidden px-4 py-2 bg-slate-950 border-t border-slate-900 overflow-x-auto">
        <div className="flex items-center gap-1 text-[11px] min-w-max">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onNavigateStep(step.id)}
                className={`px-2 py-0.5 rounded ${
                  currentStep === step.id
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : currentStep > step.id
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {step.id}. {step.label}
              </button>
              {idx < STEPS.length - 1 && <span className="text-slate-700">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
};
