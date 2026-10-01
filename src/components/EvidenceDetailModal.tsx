import React from 'react';
import { X, Shield, Clock, Link2, FileCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { SceneEvidence } from '../types';

interface EvidenceDetailModalProps {
  evidence: SceneEvidence | null;
  onClose: () => void;
  onSelectEvidence: (evidenceId: string) => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  evidence,
  onClose,
  onSelectEvidence,
}) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-slate-900 rounded-2xl border border-slate-700/90 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="font-bold text-sm tracking-wider text-orange-400">{evidence.code}</span>
            <span className="text-slate-400 text-xs">// {evidence.type}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {evidence.name}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {evidence.shortDesc}
            </p>
          </div>

          {/* Forensic Specification Data */}
          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">EVIDENCE ID:</span>
              <span className="text-orange-400 font-bold">{evidence.code}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">TYPE:</span>
              <span className="text-slate-200 font-semibold">{evidence.type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">SOURCE:</span>
              <span className="text-slate-200 text-right truncate max-w-[240px]">{evidence.source}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">TIMESTAMP:</span>
              <span className="text-slate-200">{evidence.timestamp}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">CHAIN OF CUSTODY:</span>
              <span className="text-slate-300 text-right truncate max-w-[240px]">{evidence.chainOfCustody}</span>
            </div>
          </div>

          {/* Lab Notes */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">
              FORENSIC LAB ANALYSIS:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{evidence.details}</p>
          </div>

          {/* Cross-Correlated Evidence */}
          {evidence.relatedEvidence && evidence.relatedEvidence.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                CORRELATED PHYSICAL & DIGITAL LINKS:
              </span>
              <div className="space-y-1.5">
                {evidence.relatedEvidence.map((rel: { id: string; label: string; relationship: string }) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => {
                      onSelectEvidence(rel.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-orange-500/60 hover:bg-slate-800/50 text-left text-xs transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">
                        {rel.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{rel.relationship}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-500">DIGITAL FORENSIC SEAL VERIFIED</span>
          <button
            type="button"
            onClick={() => {
              onSelectEvidence(evidence.id);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition-all cursor-pointer border border-orange-400"
          >
            FOCUS IN 3D SCENE
          </button>
        </div>
      </div>
    </div>
  );
};
