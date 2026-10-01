import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'SATYA Forensic Core v5.0' });
  });

  // AI Case Builder API endpoint
  app.post('/api/case/analyze', async (req, res) => {
    const { textReport, files, caseName, caseClassification } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        warning: 'GEMINI_API_KEY is not configured on server. Use local forensic fallback.',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const userEvidencePayload = `
CASE NAME: ${caseName || 'Unknown Case'}
CLASSIFICATION: ${caseClassification || 'Forensic Investigation'}
TEXT STATEMENTS & FORENSIC NOTES:
${textReport || 'None provided'}

UPLOADED EVIDENCE FILES & PREVIEWS:
${(files || [])
  .map(
    (f: any, i: number) =>
      `[File ${i + 1}] Name: ${f.name} | Type: ${f.type} | Preview: ${f.contentPreview || 'Binary/Media file'}`
  )
  .join('\n')}
`;

      const prompt = `
You are the SATYA AI Forensic Case Builder.
Your job is NOT to invent fictional evidence. Analyze the provided evidence and extract a structured "Case World" JSON.

RULES:
1. Identify the primary environmentType: Must be one of: "apartment", "warehouse", "highway_road", "retail_shop", "office", "open_ground".
2. Extract procedural 3D objects with exact types:
   Allowed types: "room", "building", "road", "vehicle", "door", "window", "table", "chair", "person", "body", "phone", "laptop", "weapon", "cctv_camera", "footprint", "blood_evidence", "evidence_object", "digital_device", "cash_counter", "tyre_marks", "pallet".
   Position them logically in 3D coordinates (x between -8 and 8, y between 0 and 4, z between -8 and 8).
3. Extract real Evidence objects, with evidence codes (e.g. EVD-01, E-017), types, sources, timestamps, and chain of custody.
4. Extract Timeline events in chronological order (e.g. "21:42", "21:51", etc.).
5. If location GPS coordinates are not provided, mark hasGps: false or leave coordinates undefined. Do not invent fake GPS coordinates.
6. If facts cannot be established from uploaded evidence, mark confidence as "UNKNOWN" or "UNCERTAIN", or add to the "uncertainties" array.
7. Return valid JSON matching the CaseWorld schema:
{
  "caseId": "...",
  "caseNumber": "...",
  "title": "...",
  "classification": "...",
  "summary": "...",
  "incidentDate": "...",
  "locationName": "...",
  "leadInvestigator": "...",
  "hash": "...",
  "environmentType": "...",
  "roomDimensions": { "width": 14, "length": 16, "height": 4.5 },
  "theme": { "lightingTone": "indoor_fluorescent" },
  "locations": [],
  "objects": [],
  "evidence": [],
  "events": [],
  "timeline": [],
  "uncertainties": [],
  "conflicts": [],
  "correlations": []
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { text: prompt },
          { text: userEvidencePayload },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (text) {
        const caseWorld = JSON.parse(text);
        return res.json({ success: true, caseWorld });
      } else {
        return res.status(200).json({ success: false, error: 'Empty response from Gemini' });
      }
    } catch (error: any) {
      console.error('Error generating case world with Gemini:', error);
      return res.status(200).json({
        success: false,
        error: error.message || 'Gemini processing failed',
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SATYA Forensic Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
