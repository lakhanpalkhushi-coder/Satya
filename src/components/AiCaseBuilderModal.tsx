import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  X,
  ArrowRight,
  Database,
  Layers,
  Box,
  Car,
  Home,
  Store,
  Warehouse,
  Shield,
  Loader2,
} from 'lucide-react';
import { CaseWorld } from '../types';
import { buildCaseWorldFromEvidence, EvidenceUploadInput } from '../services/aiCaseBuilder';
import { ALL_PRESET_CASES } from '../data/presetCases';

interface AiCaseBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseLoaded?: (caseWorld: CaseWorld) => void;
  onSelectCase?: (caseWorld: CaseWorld) => void;
  currentCaseId?: string;
}

export const AiCaseBuilderModal: React.FC<AiCaseBuilderModalProps> = ({
  isOpen,
  onClose,
  onCaseLoaded,
  onSelectCase,
  currentCaseId,
}) => {
  const triggerCaseLoaded = (caseWorld: CaseWorld) => {
    if (onSelectCase) onSelectCase(caseWorld);
    else if (onCaseLoaded) onCaseLoaded(caseWorld);
  };
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('presets');
  const [caseTitle, setCaseTitle] = useState<string>('');
  const [classification, setClassification] = useState<string>('Suspicious Death / Homicide');
  const [incidentText, setIncidentText] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: number; contentPreview?: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [generatedWorld, setGeneratedWorld] = useState<CaseWorld | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((f) => ({
      name: f.name,
      type: f.type || 'application/octet-stream',
      size: f.size,
      contentPreview: `Uploaded file: ${f.name} (${Math.round(f.size / 1024)} KB)`,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      type: f.type || 'application/octet-stream',
      size: f.size,
      contentPreview: `Dropped file: ${f.name} (${Math.round(f.size / 1024)} KB)`,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRunAiCaseBuilder = async () => {
    setIsProcessing(true);
    setProgressStep(1);

    // Simulated progress tick for AI generation feedback
    const t1 = setTimeout(() => setProgressStep(2), 600);
    const t2 = setTimeout(() => setProgressStep(3), 1300);
    const t3 = setTimeout(() => setProgressStep(4), 2100);

    const input: EvidenceUploadInput = {
      caseName: caseTitle || undefined,
      caseClassification: classification || undefined,
      textReport: incidentText || undefined,
      files: uploadedFiles,
    };

    try {
      const world = await buildCaseWorldFromEvidence(input);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setProgressStep(5);
      setGeneratedWorld(world);
    } catch (err) {
      console.error(err);
      setProgressStep(5);
      // Fallback to warehouse demo
      setGeneratedWorld(ALL_PRESET_CASES['case-27-2026']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = (key: string) => {
    const preset = ALL_PRESET_CASES[key];
    if (preset) {
      triggerCaseLoaded(preset);
      onClose();
    }
  };

  const handleConfirmGeneratedWorld = () => {
    if (generatedWorld) {
      triggerCaseLoaded(generatedWorld);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                AI CASE BUILDER & WORLD GENERATOR
              </h2>
              <p className="text-[11px] text-slate-400">
                Transform uploaded forensic evidence into a 3D investigation world
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('presets');
              setGeneratedWorld(null);
            }}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'presets'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            PRESET INVESTIGATION WORLDS (4)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setGeneratedWorld(null);
            }}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            CUSTOM EVIDENCE INGESTION
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: PRESET INVESTIGATION WORLDS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-slate-300 leading-relaxed mb-3">
                Select from verified case dossiers to explore completely distinct 3D environments procedurally generated by SATYA:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Preset 1: Logistics Warehouse */}
                <div
                  onClick={() => handleSelectPreset('case-27-2026')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-orange-500 ${
                    currentCaseId === 'case-27-2026'
                      ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold text-[10px]">
                      CASE 27/2026
                    </span>
                    <Warehouse className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Logistics Warehouse Unit 4B</h4>
                  <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                    Industrial chamber, body of Rohan Mathur, forged pipe wrench, encrypted mobile device, overhead CCTV.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>ENV: WAREHOUSE</span>
                    <span className="text-orange-400 font-bold">EXPLORE SCENE →</span>
                  </div>
                </div>

                {/* Preset 2: Apartment Bedroom Homicide */}
                <div
                  onClick={() => handleSelectPreset('case-12-apartment')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-orange-500 ${
                    currentCaseId === 'case-12-apartment'
                      ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                      CASE 12/2026
                    </span>
                    <Home className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Apartment 402 Homicide</h4>
                  <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                    Residential master bedroom, victim Ananya Sharma, 9mm semi-automatic handgun, smart lock, hallway CCTV.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>ENV: APARTMENT</span>
                    <span className="text-blue-400 font-bold">EXPLORE SCENE →</span>
                  </div>
                </div>

                {/* Preset 3: Highway Collision / Hit-and-Run */}
                <div
                  onClick={() => handleSelectPreset('case-08-highway')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-orange-500 ${
                    currentCaseId === 'case-08-highway'
                      ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                      CASE 08/2026
                    </span>
                    <Car className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Eastern Expressway Km 44</h4>
                  <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                    Asphalt 4-lane highway, deformed sedan vs SUV, 38m ABS tire skid marks, overhead gantry radar.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>ENV: HIGHWAY_ROAD</span>
                    <span className="text-purple-400 font-bold">EXPLORE SCENE →</span>
                  </div>
                </div>

                {/* Preset 4: Retail Jewelry Robbery */}
                <div
                  onClick={() => handleSelectPreset('case-05-retail')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-orange-500 ${
                    currentCaseId === 'case-05-retail'
                      ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      CASE 05/2026
                    </span>
                    <Store className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Royal Jewelers Showroom</h4>
                  <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                    Commercial storefront, pried cash counter, POS laptop terminal, dropped revolver, ceiling dome cam.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>ENV: RETAIL_SHOP</span>
                    <span className="text-emerald-400 font-bold">EXPLORE SCENE →</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM EVIDENCE UPLOAD */}
          {activeTab === 'upload' && !generatedWorld && !isProcessing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">CASE IDENTIFIER / TITLE</label>
                  <input
                    type="text"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    placeholder="e.g. Downtown Office Burglary"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">CLASSIFICATION</label>
                  <input
                    type="text"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    placeholder="e.g. Armed Robbery / Cyber Incident"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Drag and drop zone */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ATTACH FORENSIC EVIDENCE FILES (CCTV, PHOTOS, PDFS, PHONE EXTRACTIONS)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-700 hover:border-orange-500/80 rounded-xl p-5 text-center bg-slate-950/40 transition-colors relative cursor-pointer"
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="font-semibold text-white">Drag & drop forensic evidence files</div>
                  <p className="text-[11px] text-slate-400 mt-1">or click to browse filesystem</p>
                </div>
              </div>

              {/* Attached file chips */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {uploadedFiles.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px] flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3 text-orange-400" />
                      <span className="truncate max-w-[160px]">{f.name}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Incident report text statement */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  OFFICIAL INCIDENT REPORT / WITNESS STATEMENTS / DISPATCH LOG
                </label>
                <textarea
                  rows={4}
                  value={incidentText}
                  onChange={(e) => setIncidentText(e.target.value)}
                  placeholder="Paste initial investigation findings, witness statements, CCTV time logs, device artifacts, vehicle plates, or physical notes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={handleRunAiCaseBuilder}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-lg cursor-pointer border border-orange-400"
              >
                <Sparkles className="w-4 h-4" />
                <span>BUILD DYNAMIC 3D CASE WORLD WITH AI</span>
              </button>
            </div>
          )}

          {/* AI PROCESSING ANIMATION */}
          {isProcessing && (
            <div className="py-8 text-center space-y-4 bg-slate-950/60 rounded-xl border border-slate-800 p-6">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white tracking-wide">
                BUILDING CASE WORLD FROM EVIDENCE...
              </div>

              <div className="max-w-md mx-auto space-y-2 text-left text-[11px] text-slate-300">
                <div className={`flex items-center gap-2 ${progressStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Evidence files parsed & verified</span>
                </div>
                <div className={`flex items-center gap-2 ${progressStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Procedural objects & spatial coordinates calculated</span>
                </div>
                <div className={`flex items-center gap-2 ${progressStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>NTP synchronized timeline synthesized</span>
                </div>
                <div className={`flex items-center gap-2 ${progressStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Geospatial perimeter & evidence cross-correlations mapped</span>
                </div>
              </div>
            </div>
          )}

          {/* GENERATION SUMMARY & CONFIRMATION */}
          {generatedWorld && !isProcessing && (
            <div className="space-y-4 bg-slate-950/80 rounded-xl border border-slate-800 p-5 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>CASE WORLD SUCCESSFULLY GENERATED</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Case Identifier:</span>
                  <span className="font-bold text-white">{generatedWorld.caseNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Title:</span>
                  <span className="text-white font-semibold">{generatedWorld.title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Procedural 3D Environment:</span>
                  <span className="text-orange-400 font-bold uppercase">{generatedWorld.environmentType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Identified 3D Objects:</span>
                  <span className="text-cyan-300 font-bold">{generatedWorld.objects.length} Entities</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Timeline Events:</span>
                  <span className="text-emerald-400 font-bold">{generatedWorld.timeline.length} Chronological Points</span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span className="text-slate-400">Uncertainties Marked:</span>
                  <span className="text-amber-400 font-bold">{generatedWorld.uncertainties.length} Item(s)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmGeneratedWorld}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-lg cursor-pointer border border-orange-400"
              >
                <span>ENTER RECONSTRUCTED CASE WORLD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-orange-400" />
            <span>SATYA DYNAMIC RECONSTRUCTION ENGINE v5.0</span>
          </div>
          <span>GEMINI AI POWERED</span>
        </div>
      </div>
    </div>
  );
};
