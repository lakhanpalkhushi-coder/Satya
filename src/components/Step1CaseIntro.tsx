import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  User,
  Fingerprint,
  Database,
  Box,
  Map,
  Activity,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { CaseWorld } from '../types';

interface Step1CaseIntroProps {
  caseWorld: CaseWorld;
  onEnterCase: () => void;
  onEnterSceneDirect?: () => void;
  onOpenCaseBuilder?: () => void;
}

export const Step1CaseIntro: React.FC<Step1CaseIntroProps> = ({
  caseWorld,
  onEnterCase,
  onEnterSceneDirect,
  onOpenCaseBuilder,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 font-mono text-slate-100">
      {/* Top Protocol Status Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span>SATYA DIGITAL FORENSIC ENGINE // ACTIVE CASE DOSSIER</span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenCaseBuilder && (
            <button
              type="button"
              onClick={onOpenCaseBuilder}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>UPLOAD EVIDENCE / SWITCH CASE</span>
            </button>
          )}

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-orange-400" />
            <span>HASH:</span>
            <span className="bg-slate-900 text-orange-300 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
              {caseWorld.hash.substring(0, 12)} (VERIFIED)
            </span>
          </div>
        </div>
      </div>

      {/* Main Forensic Dossier Screen */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative grid */}
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-10 [background-image:radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Case Badge Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3.5 py-1 rounded-lg bg-orange-500 text-slate-950 font-bold text-xs tracking-wider">
            {caseWorld.caseNumber}
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-800 text-orange-400 border border-slate-700 font-semibold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            {caseWorld.classification}
          </span>
          <span className="text-xs text-slate-500 ml-auto hidden sm:block">
            ENVIRONMENT: <span className="text-slate-300 uppercase font-bold">{caseWorld.environmentType}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          {caseWorld.title}
        </h1>

        {/* Executive Case Summary */}
        <div className="bg-slate-950/80 border-l-4 border-l-orange-500 border border-slate-800 p-5 rounded-r-xl mb-8">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-orange-400" />
            INITIAL INCIDENT BRIEFING
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {caseWorld.summary}
          </p>
        </div>

        {/* Key Incident Coordinates & Personnel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="p-2.5 rounded-lg bg-slate-900 text-orange-400 border border-slate-800 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] uppercase text-slate-500">Incident Location</span>
              <span className="text-sm font-semibold text-white">{caseWorld.locationName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="p-2.5 rounded-lg bg-slate-900 text-orange-400 border border-slate-800 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] uppercase text-slate-500">Timestamp Reported</span>
              <span className="text-sm font-semibold text-white">{caseWorld.incidentDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="p-2.5 rounded-lg bg-slate-900 text-orange-400 border border-slate-800 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] uppercase text-slate-500">Lead Investigator</span>
              <span className="text-sm font-semibold text-white">{caseWorld.leadInvestigator}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="p-2.5 rounded-lg bg-slate-900 text-orange-400 border border-slate-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] uppercase text-slate-500">Procedural 3D World</span>
              <span className="text-sm font-semibold text-emerald-400">
                {caseWorld.objects.length} Objects • {caseWorld.evidence.length} Evidence Items
              </span>
            </div>
          </div>
        </div>

        {/* 3D Scene Exploration Features Ready */}
        <div className="border-t border-slate-800 pt-6 mb-8">
          <h3 className="text-xs uppercase text-slate-400 mb-3 tracking-wider">
            FORENSIC EXPLORATION SUITE SYNCHRONIZED:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-slate-300">3D Environment</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-slate-300">Geospatial Map</span>
              <span className="text-emerald-400 font-bold">{caseWorld.locations.length} SENSORS</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-slate-300">NTP Chronology</span>
              <span className="text-emerald-400 font-bold">{caseWorld.timeline.length} EVENTS</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-slate-300">Correlations</span>
              <span className="text-emerald-400 font-bold">{caseWorld.correlations.length} LINKS</span>
            </div>
          </div>
        </div>

        {/* Enter Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="w-4 h-4 text-orange-400" />
            <span>Digital Chain of Custody Verified • Forensic Integrity Intact</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Primary Action: ENTER SCENE */}
            <button
              type="button"
              id="enter-case-button"
              onClick={onEnterSceneDirect || onEnterCase}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-orange-500/20 border border-orange-400 cursor-pointer"
            >
              <Box className="w-4 h-4" />
              <span>ENTER 3D CRIME SCENE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Option: Satellite Map */}
            <button
              type="button"
              onClick={onEnterCase}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <Map className="w-4 h-4 text-blue-400" />
              <span>SPATIAL MAP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
