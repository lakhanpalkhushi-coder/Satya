import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Video,
  Car,
  Smartphone,
  Key,
  Radio,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import { CaseWorld, CaseWorldLocation } from '../types';

interface Step2MapViewProps {
  caseWorld: CaseWorld;
  selectedMarkerId: string | null;
  onSelectMarker: (markerId: string) => void;
  onEnterScene: () => void;
  onBack: () => void;
  onInspectEvidence?: (evidenceId: string) => void;
}

export const Step2MapView: React.FC<Step2MapViewProps> = ({
  caseWorld,
  selectedMarkerId,
  onSelectMarker,
  onEnterScene,
  onBack,
  onInspectEvidence,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const locations = caseWorld.locations || [];
  const activeMarker =
    locations.find((m) => m.id === selectedMarkerId) || locations[0] || {
      id: 'loc-scene',
      label: caseWorld.locationName,
      type: 'scene',
      code: 'LOC-01',
      coordinates: { x: 50, y: 50, lat: '28.5355° N', lng: '77.3910° E' },
      timestamp: 'Incident Timestamp',
      summary: caseWorld.summary,
      source: 'Police Dispatch',
    };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'scene':
        return <AlertCircle className="w-4 h-4 text-white" />;
      case 'cctv':
        return <Video className="w-4 h-4 text-white" />;
      case 'vehicle':
        return <Car className="w-4 h-4 text-white" />;
      case 'phone':
        return <Smartphone className="w-4 h-4 text-white" />;
      case 'digital':
        return <Key className="w-4 h-4 text-white" />;
      default:
        return <Radio className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden select-none font-mono">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs shadow-lg">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-bold text-orange-400">GEOSPATIAL SATELLITE RECONSTRUCTION</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 uppercase">{caseWorld.locationName}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Back Button (Strict: 2 -> 1 Case Intro) */}
          <button
            type="button"
            onClick={onBack}
            id="map-back-button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-xs font-semibold shadow-lg transition-all cursor-pointer backdrop-blur-md"
            title="Return to Case Intro"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-orange-500" />
            <span>BACK TO DOSSIER</span>
          </button>

          {/* Primary Action: ENTER SCENE */}
          <button
            type="button"
            id="enter-scene-button"
            onClick={onEnterScene}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold border border-orange-400 shadow-xl transition-all cursor-pointer"
          >
            <span>ENTER 3D CRIME SCENE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Zoom & Pan Controls on Top-Right */}
      <div className="absolute top-16 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700 hover:text-white hover:bg-slate-800 shadow-md cursor-pointer backdrop-blur-md"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700 hover:text-white hover:bg-slate-800 shadow-md cursor-pointer backdrop-blur-md"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-2 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700 hover:text-white hover:bg-slate-800 shadow-md cursor-pointer backdrop-blur-md"
          title="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* FULL SCREEN SPATIAL SATELLITE CANVAS */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="w-[1800px] h-[1200px] absolute transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            left: 'calc(50% - 900px)',
            top: 'calc(50% - 600px)',
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 1800 1200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sat-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="1" strokeOpacity="0.4" />
              </pattern>
              <linearGradient id="cctv-cone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
              <radialGradient id="rf-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Dark Satellite Terrain Base */}
            <rect width="1800" height="1200" fill="#0b1120" />
            <rect width="1800" height="1200" fill="url(#sat-grid)" />

            {/* Primary Road Arteries */}
            <path d="M 0 780 L 1800 780" stroke="#1e293b" strokeWidth="110" strokeLinecap="square" />
            <path d="M 0 780 L 1800 780" stroke="#334155" strokeWidth="100" strokeLinecap="square" />
            <line x1="0" y1="780" x2="1800" y2="780" stroke="#94a3b8" strokeWidth="2" strokeDasharray="16 16" />

            {/* Secondary Service Avenue */}
            <path d="M 520 780 L 520 380 L 1100 380" stroke="#334155" strokeWidth="64" fill="none" strokeLinejoin="round" />
            <path d="M 520 780 L 520 380 L 1100 380" stroke="#0f172a" strokeWidth="56" fill="none" strokeLinejoin="round" />

            {/* Trajectory corridor */}
            <path
              d="M 280 780 Q 420 780 520 620 T 520 420"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
              strokeDasharray="8 8"
              opacity="0.8"
            />

            {/* Surrounding perimeter facilities */}
            <rect x="220" y="240" width="220" height="340" fill="#131c2e" stroke="#334155" strokeWidth="2" rx="4" />
            <text x="330" y="410" fill="#64748b" fontSize="14" fontFamily="monospace" textAnchor="middle">
              SECTOR ANNEX
            </text>

            <rect x="1140" y="200" width="380" height="280" fill="#131c2e" stroke="#334155" strokeWidth="2" rx="4" />
            <text x="1330" y="340" fill="#64748b" fontSize="14" fontFamily="monospace" textAnchor="middle">
              SURROUNDING FACILITY
            </text>

            {/* Primary Scene Perimeter Highlight */}
            <g className="cursor-pointer group" onClick={onEnterScene}>
              <rect
                x="680"
                y="260"
                width="380"
                height="420"
                fill="#1e293b"
                stroke="#f97316"
                strokeWidth="3"
                rx="6"
              />
              <rect x="710" y="290" width="320" height="180" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <text x="870" y="370" fill="#f97316" fontSize="16" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                [{caseWorld.locationName.toUpperCase()}]
              </text>
              <text x="870" y="395" fill="#94a3b8" fontSize="12" fontFamily="monospace" textAnchor="middle">
                PRIMARY INVESTIGATION SECTOR // 3D WORLD
              </text>
            </g>

            {/* CCTV Optical Cone */}
            <g>
              <path d="M 640 460 L 860 380 L 860 540 Z" fill="url(#cctv-cone-grad)" />
              <line x1="640" y1="460" x2="860" y2="380" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="640" y1="460" x2="860" y2="540" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
            </g>

            {/* Tower Sector RF coverage */}
            <g>
              <circle cx="1400" cy="950" r="280" fill="url(#rf-grad)" />
              <line x1="1400" y1="950" x2="900" y2="500" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
            </g>

            {/* INTERACTIVE GEOSPATIAL MARKERS FROM CASEWORLD */}
            {locations.map((marker) => {
              const posX = ((marker.coordinates?.x || 50) / 100) * 1800;
              const posY = ((marker.coordinates?.y || 50) / 100) * 1200;
              const isSelected = marker.id === activeMarker.id;

              return (
                <g
                  key={marker.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMarker(marker.id);
                  }}
                >
                  {/* Pulse ring when selected */}
                  {isSelected && (
                    <circle cx={posX} cy={posY} r="32" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.8">
                      <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    cx={posX}
                    cy={posY}
                    r={isSelected ? 18 : 14}
                    fill={isSelected ? '#ea580c' : '#0f172a'}
                    stroke={isSelected ? '#ffffff' : '#f97316'}
                    strokeWidth="2.5"
                  />

                  {/* Marker Pin Label Tag */}
                  <rect
                    x={posX + 20}
                    y={posY - 12}
                    width={marker.label.length * 8 + 36}
                    height="24"
                    fill="#0f172a"
                    stroke={isSelected ? '#f97316' : '#334155'}
                    strokeWidth="1.5"
                    rx="4"
                  />
                  <text
                    x={posX + 28}
                    y={posY + 4}
                    fill={isSelected ? '#f97316' : '#f1f5f9'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {marker.code} // {marker.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating Tactical Marker Dossier (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-4 shadow-2xl text-white pointer-events-auto animate-fade-in">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="font-bold text-orange-400">{activeMarker.code}</span>
            <span className="text-slate-300 font-semibold text-xs">// {activeMarker.label}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {activeMarker.coordinates?.lat || 'GPS LOCKED'}
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <p className="leading-relaxed">{activeMarker.summary}</p>
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-white font-mono">{activeMarker.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Source:</span>
              <span className="text-slate-200 truncate max-w-[180px]">{activeMarker.source}</span>
            </div>
            {activeMarker.details?.deviceOrEntity && (
              <div className="flex justify-between">
                <span className="text-slate-400">Target Sensor:</span>
                <span className="text-cyan-300 truncate max-w-[180px]">{activeMarker.details.deviceOrEntity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onEnterScene}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer border border-orange-400"
        >
          <span>ENTER 3D CRIME SCENE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Discreet Map Instructions Watermark */}
      <div className="absolute bottom-4 right-6 pointer-events-none hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-900/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800">
        <span>DRAG TO PAN</span>
        <span>•</span>
        <span>SCROLL TO ZOOM</span>
        <span>•</span>
        <span>CLICK MARKER TO INSPECT</span>
      </div>
    </div>
  );
};
