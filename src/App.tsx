/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Step1CaseIntro } from './components/Step1CaseIntro';
import { Step2MapView } from './components/Step2MapView';
import { Step3CrimeScene } from './components/Step3CrimeScene';
import { Step4Timeline } from './components/Step4Timeline';
import { Step5Correlation } from './components/Step5Correlation';
import { EvidenceDetailModal } from './components/EvidenceDetailModal';
import { AiCaseBuilderModal } from './components/AiCaseBuilderModal';
import { CASE_WAREHOUSE } from './data/presetCases';
import { CaseWorld, StepId } from './types';

export default function App() {
  // Active Case World (AI generated or selected preset)
  const [currentCaseWorld, setCurrentCaseWorld] = useState<CaseWorld>(CASE_WAREHOUSE);
  const [isCaseBuilderOpen, setIsCaseBuilderOpen] = useState<boolean>(false);

  // Navigation state (1: Case Intro, 2: Map, 3: 3D Scene, 4: Timeline, 5: Correlation)
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Preserved case state across steps
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>(
    currentCaseWorld.locations[0]?.id || 'marker-scene'
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    currentCaseWorld.evidence[0]?.id || currentCaseWorld.objects[0]?.evidenceId || 'evd-body'
  );
  const [selectedEventId, setSelectedEventId] = useState<string>(
    currentCaseWorld.timeline[0]?.id || 'time-1'
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>(
    currentCaseWorld.correlations[0]?.id || 'edge-1'
  );

  // Modal inspection
  const [modalEvidenceId, setModalEvidenceId] = useState<string | null>(null);

  // Handle case world change
  const handleSelectCaseWorld = (newCase: CaseWorld) => {
    setCurrentCaseWorld(newCase);
    if (newCase.locations.length > 0) {
      setSelectedMarkerId(newCase.locations[0].id);
    }
    if (newCase.evidence.length > 0) {
      setSelectedEvidenceId(newCase.evidence[0].id);
    } else if (newCase.objects.length > 0) {
      setSelectedEvidenceId(newCase.objects[0].evidenceId || newCase.objects[0].id);
    }
    if (newCase.timeline.length > 0) {
      setSelectedEventId(newCase.timeline[0].id);
    }
    if (newCase.correlations.length > 0) {
      setSelectedEdgeId(newCase.correlations[0].id);
    }
    setIsCaseBuilderOpen(false);
  };

  // Strict Back navigation rule:
  // Step 5 -> Step 4
  // Step 4 -> Step 3
  // Step 3 -> Step 2
  // Step 2 -> Step 1
  const handleBack = () => {
    setCurrentStep((prev) => {
      if (prev === 5) return 4;
      if (prev === 4) return 3;
      if (prev === 3) return 2;
      if (prev === 2) return 1;
      return 1;
    });
  };

  const handleNavigateStep = (step: StepId) => {
    setCurrentStep(step);
  };

  const handleOpenEvidenceModal = (evidenceId: string) => {
    setModalEvidenceId(evidenceId);
  };

  const handleSelectEvidenceFromModal = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    if (currentStep !== 3) {
      setCurrentStep(3);
    }
  };

  const modalEvidence = modalEvidenceId
    ? currentCaseWorld.evidence.find(
        (e) => e.id === modalEvidenceId || e.code === modalEvidenceId
      ) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-slate-950">
      {/* Universal Forensic Header with STEP INDICATOR and BACK BUTTON */}
      <Header
        currentStep={currentStep}
        caseWorld={currentCaseWorld}
        onNavigateStep={handleNavigateStep}
        onBack={handleBack}
        onOpenCaseBuilder={() => setIsCaseBuilderOpen(true)}
      />

      {/* Main Investigation Stage */}
      <main className="flex-1 flex flex-col">
        {currentStep === 1 && (
          <Step1CaseIntro
            caseWorld={currentCaseWorld}
            onEnterCase={() => setCurrentStep(2)}
            onEnterSceneDirect={() => setCurrentStep(3)}
            onOpenCaseBuilder={() => setIsCaseBuilderOpen(true)}
          />
        )}

        {currentStep === 2 && (
          <Step2MapView
            caseWorld={currentCaseWorld}
            selectedMarkerId={selectedMarkerId}
            onSelectMarker={setSelectedMarkerId}
            onEnterScene={() => setCurrentStep(3)}
            onBack={handleBack}
            onInspectEvidence={handleOpenEvidenceModal}
          />
        )}

        {currentStep === 3 && (
          <Step3CrimeScene
            caseWorld={currentCaseWorld}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={setSelectedEvidenceId}
            onProceedTimeline={() => setCurrentStep(4)}
            onBack={handleBack}
            onNavigateStep={handleNavigateStep}
            onInspectEvidence={handleOpenEvidenceModal}
            onOpenCaseBuilder={() => setIsCaseBuilderOpen(true)}
          />
        )}

        {currentStep === 4 && (
          <Step4Timeline
            caseWorld={currentCaseWorld}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            onProceedCorrelation={() => setCurrentStep(5)}
            onBack={handleBack}
            onViewEvidenceDetail={handleOpenEvidenceModal}
          />
        )}

        {currentStep === 5 && (
          <Step5Correlation
            caseWorld={currentCaseWorld}
            selectedEdgeId={selectedEdgeId}
            onSelectEdge={setSelectedEdgeId}
            onBack={handleBack}
            onNavigateStep={handleNavigateStep}
          />
        )}
      </main>

      {/* Global Evidence Detail Modal for cross-step inspection */}
      <EvidenceDetailModal
        evidence={modalEvidence}
        onClose={() => setModalEvidenceId(null)}
        onSelectEvidence={handleSelectEvidenceFromModal}
      />

      {/* AI Case Builder & Evidence Uploader Modal */}
      <AiCaseBuilderModal
        isOpen={isCaseBuilderOpen}
        onClose={() => setIsCaseBuilderOpen(false)}
        currentCaseId={currentCaseWorld.id}
        onSelectCase={handleSelectCaseWorld}
      />

      {/* Discreet Forensic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-slate-400">SATYA DYNAMIC FORENSIC WORLD ENGINE</span>
            <span className="text-slate-700">|</span>
            <span className="text-orange-400 font-bold">{currentCaseWorld.caseNumber}</span>
            <span className="text-slate-400 truncate max-w-[200px]">({currentCaseWorld.title})</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>ENVIRONMENT: {currentCaseWorld.environmentType.toUpperCase()}</span>
            <span>THREE.JS WEBGL RENDERER</span>
            <button
              type="button"
              onClick={() => setIsCaseBuilderOpen(true)}
              className="text-orange-400 hover:text-orange-300 underline cursor-pointer"
            >
              SWITCH CASE
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
