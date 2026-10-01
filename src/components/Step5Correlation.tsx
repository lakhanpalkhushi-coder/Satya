import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Box,
  ExternalLink,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
import { CaseWorld, CorrelationEdge, CorrelationStatus, StepId } from '../types';

interface Step5CorrelationProps {
  caseWorld: CaseWorld;
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string) => void;
  onBack: () => void;
  onNavigateStep: (step: StepId) => void;
}

export const Step5Correlation: React.FC<Step5CorrelationProps> = ({
  caseWorld,
  selectedEdgeId,
  onSelectEdge,
  onBack,
  onNavigateStep,
}) => {
  const [filterStatus, setFilterStatus] = useState<CorrelationStatus | 'all'>('all');

  const correlationEdges = caseWorld.correlations || [];
  const activeEdge =
    correlationEdges.find((e) => e.id === selectedEdgeId) ||
    correlationEdges[0] || {
      id: 'edge-default',
      source: 'Physical Scene',
      target: 'Telemetry',
      label: 'Multi-Source Synthesis',
      hypothesis: 'Evidence points corroborated by forensic inspection.',
      status: 'supported',
      technicalNotes: 'Direct observation logged by lead investigator.',
    };

  const getStatusBadge = (status: CorrelationStatus) => {
    switch (status) {
      case 'supported':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Supported',
          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
        };
      case 'uncertain':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Uncertain',
          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
        };
      case 'conflict':
        return {
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Conflict',
          badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/80',
        };
      case 'unknown':
        return {
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" />,
          label: 'Unknown',
          badgeClass: 'bg-slate-900 text-slate-300 border-slate-700',
        };
    }
  };

  const filteredEdges =
    filterStatus === 'all'
      ? correlationEdges
      : correlationEdges.filter((edge) => edge.status === filterStatus);

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 font-mono py-6 px-4 sm:px-6">
      {/* Top Header & Strict Back Button (5 -> 4) */}
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            id="step5-back-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold shadow-md transition-all cursor-pointer"
            title="Return to Timeline (Step 4)"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-orange-500" />
            <span>BACK TO TIMELINE</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <span className="text-xs font-bold text-slate-200 tracking-wider">
            STEP 05 // MULTI-SOURCE EVIDENCE CORRELATION MATRIX ({caseWorld.caseNumber})
          </span>
        </div>

        {/* Quick jump to 3D Scene */}
        <button
          type="button"
          onClick={() => onNavigateStep(3)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-500 text-orange-400 text-xs font-bold transition-all cursor-pointer"
        >
          <Box className="w-3.5 h-3.5" />
          <span>RETURN TO 3D SCENE</span>
        </button>
      </div>

      {/* Mandatory Objective Boundary Banner */}
      <div className="max-w-7xl mx-auto w-full mb-6">
        <div className="bg-slate-900/90 border-l-4 border-l-orange-500 border border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-orange-400 uppercase tracking-wide">
              OBJECTIVE FORENSIC BOUNDARY
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              SATYA assists the investigator by organizing and correlating multi-source physical and digital evidence.
              It does <span className="font-bold text-white underline decoration-orange-500">NOT</span> identify the suspect or draw legal guilt.
              Uncertainties and conflicts are explicitly flagged.
            </p>
          </div>
        </div>
      </div>

      {/* Flagged Uncertainties Callout if present */}
      {caseWorld.uncertainties && caseWorld.uncertainties.length > 0 && (
        <div className="max-w-7xl mx-auto w-full mb-6">
          <div className="bg-amber-950/30 border border-amber-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
              <QuestionIcon className="w-4 h-4" />
              <span>UNKNOWN OR UNCERTAIN POINTS IDENTIFIED FROM EVIDENCE ({caseWorld.uncertainties.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {caseWorld.uncertainties.map((u, i) => {
                const isObj = typeof u === 'object' && u !== null;
                const topic = isObj ? (u as any).topic : `Uncertainty #${i + 1}`;
                const reason = isObj ? (u as any).reason : String(u);
                const suggested = isObj ? (u as any).suggestedInvestigation : 'Requires forensic corroboration';

                return (
                  <div key={i} className="bg-slate-950/60 p-2.5 rounded-lg border border-amber-900/50 text-slate-300">
                    <div className="font-semibold text-amber-300">{topic}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{reason}</div>
                    <div className="text-[10px] text-orange-400 mt-1">Suggested: {suggested}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Forensic Synthesis Layout */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Correlation Matrix Rows */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                CROSS-MODALITY HYPOTHESES ({filteredEdges.length})
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {(['all', 'supported', 'uncertain', 'conflict'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase ${
                    filterStatus === status
                      ? 'bg-orange-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Rows */}
          <div className="space-y-2.5">
            {filteredEdges.map((edge) => {
              const isSelected = edge.id === activeEdge.id;
              const badge = getStatusBadge(edge.status);

              return (
                <div
                  key={edge.id}
                  onClick={() => onSelectEdge(edge.id)}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-orange-500 ring-1 ring-orange-500/50 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-white text-sm tracking-wide">{edge.label}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.badgeClass}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed mb-2 line-clamp-2">
                    {edge.hypothesis}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-400">
                      Link: <span className="text-orange-400">{edge.source}</span> ↔ <span className="text-orange-400">{edge.target}</span>
                    </span>
                    {edge.discrepancyDelta && (
                      <span className="text-rose-400 font-bold">DELTA: {edge.discrepancyDelta}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Forensic Dossier Inspection Panel */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              CORRELATION DOSSIER // {activeEdge.id}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(activeEdge.status).badgeClass}`}
            >
              {getStatusBadge(activeEdge.status).icon}
              <span>{getStatusBadge(activeEdge.status).label}</span>
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-2">{activeEdge.label}</h3>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs text-slate-300 mb-4">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">WORKING HYPOTHESIS:</span>
              <p className="leading-relaxed text-slate-200">{activeEdge.hypothesis}</p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-semibold block mb-1">TECHNICAL AUDIT & SENSOR FINDINGS:</span>
              <p className="leading-relaxed text-cyan-300 text-[11px]">
                {activeEdge.technicalNotes}
              </p>
            </div>

            {activeEdge.discrepancyDelta && (
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-rose-400 font-bold">TEMPORAL DISCREPANCY:</span>
                <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-300 font-bold rounded">
                  {activeEdge.discrepancyDelta}
                </span>
              </div>
            )}
          </div>

          {/* Action button to explore in 3D Scene */}
          <button
            type="button"
            onClick={() => onNavigateStep(3)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-lg cursor-pointer border border-orange-400"
          >
            <span>INSPECT IN 3D CRIME SCENE</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
