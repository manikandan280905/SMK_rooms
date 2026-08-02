import { env } from '../../config/env';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface OcrExtractedField {
  value: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

export interface GuestRegisterEntry {
  name: OcrExtractedField;
  fatherName: OcrExtractedField;
  address: OcrExtractedField;
  phone: OcrExtractedField;
  aadhaarNumber: OcrExtractedField;
  gender: OcrExtractedField;
  age: OcrExtractedField;
  roomNumber: OcrExtractedField;
  arrivalDate: OcrExtractedField;
  arrivalTime: OcrExtractedField;
  expectedCheckoutDate: OcrExtractedField;
  expectedCheckoutTime: OcrExtractedField;
  roomRent: OcrExtractedField;
  advanceAmount: OcrExtractedField;
  totalAmount: OcrExtractedField;
  remarks: OcrExtractedField;
}

/**
 * Structured data returned after OCR processing of handwritten register notebook pages.
 */
export interface GuestOcrResult extends GuestRegisterEntry {
  documentType: string;           // e.g. "HANDWRITTEN_REGISTER_NOTEBOOK", "LEDGER_PAGE", "AADHAAR_CARD", "UNKNOWN"
  rawText: string;                // Full raw transcription from register page
  processingNotes: string;        // Any caveats or issues Gemini noted
  entries?: GuestRegisterEntry[]; // List of entries if page contains multiple handwritten rows
}

// ─── Dynamic prompt builder for Handwritten Register Notebooks ─────────────

/**
 * Builds a context-aware Gemini prompt for transcribing handwritten hotel register notebooks.
 */
function buildOcrPrompt(): string {
  return `You are an expert AI OCR assistant integrated into SMK Rooms — a hotel lodge management system in India.

BUSINESS & DOCUMENT CONTEXT:
- The user is uploading a photo or scan of a PHYSICAL HANDWRITTEN REGISTER BOOK / NOTEBOOK / LEDGER SHEET used at a hotel reception counter.
- Receptionists manually write guest check-in entries in columns or freeform handwriting inside this register notebook.
- Your job is to read the handwritten text accurately, extract all guest check-in registration data, and convert it into structured JSON.

YOUR TASK:
1. Carefully read all handwritten text, column headings, and table rows on the paper register page.
2. Identify if this is a handwritten register page, paper form, ID card, or document.
3. Transcribe and extract all guest check-in fields from the handwritten entries.
4. If there are multiple guest rows/entries written on the register page, extract all of them into the "entries" array, with the primary entry being the first one.

FIELDS TO EXTRACT FOR EACH GUEST ENTRY:
- name: Full name of the guest written in the register
- fatherName: Father's name / Husband's name (often written as S/O, W/O, S/o, W/o)
- address: Permanent address or city/town written
- phone: 10-digit mobile number
- aadhaarNumber: Aadhaar card or Govt ID number if written
- gender: MALE, FEMALE, or OTHER (normalize to uppercase if stated or clear from name/salutation)
- age: Numeric age if written (e.g. 28, 35)
- roomNumber: Room number allocated (e.g. 101, 102, 204)
- arrivalDate: Check-in date written (YYYY-MM-DD or DD/MM/YYYY)
- arrivalTime: Check-in time written (e.g. 10:30 AM, 14:00)
- expectedCheckoutDate: Checkout date if written
- expectedCheckoutTime: Checkout time if written
- roomRent: Room rent / tariff amount written
- advanceAmount: Advance payment amount written
- totalAmount: Total bill amount written
- remarks: Any handwritten notes, vehicle number, or remarks

CONFIDENCE LEVELS FOR EACH FIELD:
- "high": Handwritten text is clean, clear, and unambiguous
- "medium": Legible with minor handwriting ambiguity
- "low": Difficult cursive or faded ink, educated reading
- "none": Field not written or completely unreadable — set value to null

CRITICAL RULES:
- NEVER guess or hallucinate text that is not visible on the paper register
- If handwriting is unreadable for a field, set value to null with confidence "none"
- Return ONLY valid JSON with no markdown formatting or extra commentary outside the JSON block.

RESPONSE FORMAT (respond ONLY with valid JSON):
{
  "documentType": "HANDWRITTEN_REGISTER_NOTEBOOK",
  "name": { "value": "...", "confidence": "high" },
  "fatherName": { "value": "...", "confidence": "high" },
  "address": { "value": "...", "confidence": "high" },
  "phone": { "value": "...", "confidence": "high" },
  "aadhaarNumber": { "value": "...", "confidence": "high" },
  "gender": { "value": "MALE", "confidence": "high" },
  "age": { "value": "30", "confidence": "high" },
  "roomNumber": { "value": "101", "confidence": "high" },
  "arrivalDate": { "value": "2026-08-02", "confidence": "high" },
  "arrivalTime": { "value": "10:30", "confidence": "high" },
  "expectedCheckoutDate": { "value": "2026-08-03", "confidence": "high" },
  "expectedCheckoutTime": { "value": "11:00", "confidence": "high" },
  "roomRent": { "value": "1600", "confidence": "high" },
  "advanceAmount": { "value": "1000", "confidence": "high" },
  "totalAmount": { "value": "1600", "confidence": "high" },
  "remarks": { "value": null, "confidence": "none" },
  "entries": [],
  "rawText": "full raw handwritten text transcribed from page",
  "processingNotes": "any relevant notes about handwriting legibility or page format"
}`;
}

// ─── Gemini API call ────────────────────────────────────────────────────────

/**
 * Calls the Google Gemini Flash API with the image and OCR prompt.
 * Uses REST API directly — no extra SDK required.
 */
async function callGeminiFlash(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
  }

  const model = 'gemini-2.0-flash-exp';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: buildOcrPrompt(),
          },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,       // Low temperature — we want factual extraction, not creativity
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 3072,
      responseMimeType: 'application/json',  // Force JSON response
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json() as any;

  // Extract text from Gemini response
  const candidate = data?.candidates?.[0];
  if (!candidate) {
    throw new Error('Gemini returned no candidates. The image may be unprocessable.');
  }

  // Finish reason check
  const finishReason = candidate.finishReason;
  if (finishReason === 'SAFETY') {
    throw new Error('Gemini blocked the request due to safety filters. Try a clearer photo of the register book.');
  }

  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned empty text. The register image may be unreadable.');
  }

  return text;
}

// ─── PDF handling (convert first page to base64 for vision) ─────────────────

/**
 * For PDF uploads, we pass the raw PDF bytes as base64 to Gemini.
 * Gemini 2.0 Flash supports PDF natively in vision mode.
 */
function prepareFileForGemini(
  buffer: Buffer,
  mimetype: string
): { base64: string; effectiveMimeType: string } {
  const supportedMimes: Record<string, string> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/webp': 'image/webp',
    'application/pdf': 'application/pdf',
  };

  const effectiveMimeType = supportedMimes[mimetype] || 'image/jpeg';
  const base64 = buffer.toString('base64');
  return { base64, effectiveMimeType };
}

// ─── Result parser ──────────────────────────────────────────────────────────

/**
 * Parses and validates Gemini's JSON response into a typed GuestOcrResult.
 * Handles single or multiple handwritten register entries gracefully.
 */
function parseOcrResponse(rawText: string): GuestOcrResult {
  let parsed: any;

  // Try to extract JSON if wrapped in markdown code blocks
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim();

  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    const emptyField: OcrExtractedField = { value: null, confidence: 'none' };
    return {
      name: emptyField,
      fatherName: emptyField,
      address: emptyField,
      phone: emptyField,
      aadhaarNumber: emptyField,
      gender: emptyField,
      age: emptyField,
      roomNumber: emptyField,
      arrivalDate: emptyField,
      arrivalTime: emptyField,
      expectedCheckoutDate: emptyField,
      expectedCheckoutTime: emptyField,
      roomRent: emptyField,
      advanceAmount: emptyField,
      totalAmount: emptyField,
      remarks: emptyField,
      documentType: 'UNKNOWN',
      rawText: rawText,
      processingNotes: 'Failed to parse structured JSON response. Raw transcription preserved.',
    };
  }

  // Helper to safely extract a field from a given object
  const extractField = (obj: any, key: string): OcrExtractedField => {
    const f = obj?.[key];
    if (!f || typeof f !== 'object') return { value: null, confidence: 'none' };
    return {
      value: f.value ?? null,
      confidence: ['high', 'medium', 'low', 'none'].includes(f.confidence)
        ? f.confidence
        : 'low',
    };
  };

  const parseSingleEntry = (src: any): GuestRegisterEntry => ({
    name: extractField(src, 'name'),
    fatherName: extractField(src, 'fatherName'),
    address: extractField(src, 'address'),
    phone: extractField(src, 'phone'),
    aadhaarNumber: extractField(src, 'aadhaarNumber'),
    gender: extractField(src, 'gender'),
    age: extractField(src, 'age'),
    roomNumber: extractField(src, 'roomNumber'),
    arrivalDate: extractField(src, 'arrivalDate'),
    arrivalTime: extractField(src, 'arrivalTime'),
    expectedCheckoutDate: extractField(src, 'expectedCheckoutDate'),
    expectedCheckoutTime: extractField(src, 'expectedCheckoutTime'),
    roomRent: extractField(src, 'roomRent'),
    advanceAmount: extractField(src, 'advanceAmount'),
    totalAmount: extractField(src, 'totalAmount'),
    remarks: extractField(src, 'remarks'),
  });

  const mainEntry = parseSingleEntry(parsed);

  // Parse multiple entries if present
  let entries: GuestRegisterEntry[] = [];
  if (Array.isArray(parsed.entries) && parsed.entries.length > 0) {
    entries = parsed.entries.map((e: any) => parseSingleEntry(e));
  }

  return {
    ...mainEntry,
    documentType: parsed.documentType || 'HANDWRITTEN_REGISTER_NOTEBOOK',
    rawText: parsed.rawText || rawText,
    processingNotes: parsed.processingNotes || '',
    entries: entries.length > 0 ? entries : [mainEntry],
  };
}

// ─── Main exported function ─────────────────────────────────────────────────

/**
 * Main OCR extraction function for handwritten register notebook pages.
 */
export async function extractGuestDataFromDocument(
  buffer: Buffer,
  mimetype: string
): Promise<GuestOcrResult> {
  const { base64, effectiveMimeType } = prepareFileForGemini(buffer, mimetype);
  const rawText = await callGeminiFlash(base64, effectiveMimeType);
  return parseOcrResponse(rawText);
}
