export type StepId = 1 | 2 | 3 | 4 | 5;

export type CorrelationStatus = 'supported' | 'uncertain' | 'conflict' | 'unknown';

export type EnvironmentType =
  | 'apartment'
  | 'warehouse'
  | 'highway_road'
  | 'retail_shop'
  | 'office'
  | 'open_ground';

export type ProceduralObjectType =
  | 'room'
  | 'building'
  | 'road'
  | 'vehicle'
  | 'door'
  | 'window'
  | 'table'
  | 'chair'
  | 'person'
  | 'body'
  | 'phone'
  | 'laptop'
  | 'weapon'
  | 'cctv_camera'
  | 'footprint'
  | 'blood_evidence'
  | 'evidence_object'
  | 'digital_device'
  | 'cash_counter'
  | 'tyre_marks'
  | 'pallet';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CaseWorldObject {
  id: string;
  type: ProceduralObjectType;
  name: string;
  location: string;
  position: Vector3D;
  rotation?: Vector3D;
  scale?: Vector3D;
  color?: string;
  sourceEvidence: string;
  timestamp: string;
  relatedEvidence: string[];
  confidence: number | 'UNKNOWN' | 'UNCERTAIN';
  metadata?: Record<string, any>;
  isEvidenceMarker?: boolean;
  evidenceId?: string;
}

export interface CaseEvidence {
  id: string;
  code: string;
  name: string;
  type: 'Biological' | 'Digital' | 'Ballistics / Toolmark' | 'IoT / Surveillance' | 'Physical / Trace' | 'Vehicular' | 'Documentary' | string;
  source: string;
  location?: string;
  timestamp: string;
  shortDesc: string;
  details: string;
  chainOfCustody: string;
  confidence?: number | 'UNKNOWN' | 'UNCERTAIN';
  isometricPos?: { x: number; y: number; z?: number };
  relatedEvidence: {
    id: string;
    label: string;
    relationship: string;
  }[];
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'telemetry';
  mediaUrl?: string;
}

export interface CaseLocation {
  id: string;
  label: string;
  type: 'scene' | 'cctv' | 'vehicle' | 'phone' | 'digital' | 'checkpoint' | 'perimeter';
  code: string;
  timestamp: string;
  summary: string;
  source: string;
  hasGps?: boolean;
  coordinates?: {
    x: number;
    y: number;
    lat?: string;
    lng?: string;
  };
  linkedEvidenceId?: string;
  details?: {
    deviceOrEntity?: string;
    signalStrength?: string;
    forensicConfidence?: string;
    notes?: string;
  };
}

export interface CaseTimelineEvent {
  id: string;
  time: string;
  title: string;
  category: 'phone' | 'vehicle' | 'cctv' | 'scene' | 'system' | 'witness';
  sourceEvidenceId?: string;
  summary: string;
  rawSignal: string;
  sensorLocation: string;
  confidence: 'High' | 'Medium' | 'Corroborated' | 'Verified' | 'UNKNOWN' | 'UNCERTAIN';
  relatedArtifacts?: string[];
  targetObjectId?: string;
  correlatedEvidenceId?: string;
}

export interface CaseRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number | 'UNKNOWN' | 'UNCERTAIN';
}

export interface CaseSource {
  id: string;
  name: string;
  type: 'photograph' | 'cctv' | 'pdf_report' | 'device_extraction' | 'cdr_log' | 'witness_statement';
  fileSize?: string;
  timestamp: string;
  verified: boolean;
}

export interface CaseConflict {
  id: string;
  description: string;
  sources: string[];
  divergence: string;
  severity: 'high' | 'medium' | 'low';
}

export interface CaseCorrelationEdge {
  id: string;
  source: string;
  target: string;
  status: CorrelationStatus;
  label: string;
  hypothesis: string;
  technicalNotes: string;
  discrepancyDelta?: string;
}

export interface CaseUncertainty {
  topic: string;
  reason: string;
  suggestedInvestigation: string;
}

export interface CaseWorld {
  id?: string;
  caseId: string;
  caseNumber: string;
  title: string;
  classification: string;
  summary: string;
  incidentDate: string;
  locationName: string;
  leadInvestigator: string;
  hash: string;
  environmentType: EnvironmentType;
  roomDimensions?: { width: number; length: number; height: number };
  theme?: {
    ambientColor?: string;
    groundColor?: string;
    wallColor?: string;
    skyColor?: string;
    lightingTone?: 'indoor_fluorescent' | 'night_street' | 'dim_industrial' | 'ambient_office' | 'daylight';
  };
  locations: CaseLocation[];
  objects: CaseWorldObject[];
  evidence: CaseEvidence[];
  events: CaseTimelineEvent[];
  relationships: CaseRelationship[];
  sources: CaseSource[];
  timeline: CaseTimelineEvent[];
  uncertainties: (string | CaseUncertainty)[];
  conflicts: CaseConflict[];
  correlations: CaseCorrelationEdge[];
}

// Aliases for compatibility
export type SceneEvidence = CaseEvidence;
export type TimelineEvent = CaseTimelineEvent;
export type CorrelationEdge = CaseCorrelationEdge;
export type MapMarker = CaseLocation;
export type CaseWorldLocation = CaseLocation;

export interface CaseMetadata {
  caseNumber: string;
  title: string;
  classification: string;
  summary: string;
  incidentDate: string;
  locationName?: string;
  location?: string;
  victim?: string;
  leadInvestigator: string;
  hash: string;
  sourceCount?: number;
  chainOfCustodyConfirmed?: boolean;
}

export interface CorrelationNode {
  id: string;
  label: string;
  subtitle?: string;
  evidenceCode?: string;
  status?: string;
  x?: number;
  y?: number;
  type?: 'physical' | 'digital' | 'telecom' | 'cctv' | string;
  category?: string;
}
