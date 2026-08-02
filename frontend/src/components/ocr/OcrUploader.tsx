'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import {
  Upload,
  Camera,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
  Scan,
  RotateCcw,
  Info,
  BookOpen,
  User,
  Building,
} from 'lucide-react';

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

export interface GuestOcrResult extends GuestRegisterEntry {
  documentType: string;
  rawText: string;
  processingNotes: string;
  entries?: GuestRegisterEntry[];
}

export interface OcrMappedFields {
  name?: string;
  fatherName?: string;
  address?: string;
  phone?: string;
  aadhaarNumber?: string;
  gender?: string;
  age?: number;
  roomNumber?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  expectedCheckoutDate?: string;
  expectedCheckoutTime?: string;
  roomRent?: number;
  advanceAmount?: number;
  totalAmount?: number;
  remarks?: string;
}

interface OcrUploaderProps {
  /** Called when user confirms and applies OCR results to the form */
  onApply: (fields: OcrMappedFields) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 10;

function confidenceBadge(confidence: OcrExtractedField['confidence']) {
  const map = {
    high: { label: 'High', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-300' },
    low: { label: 'Low', cls: 'bg-rose-100 text-rose-700 border-rose-300' },
    none: { label: 'Not Found', cls: 'bg-slate-100 text-slate-500 border-slate-300' },
  };
  const { label, cls } = map[confidence] || map.none;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

/**
 * Maps raw OCR register entry to form-compatible fields.
 */
function mapOcrEntryToFormFields(entry: GuestRegisterEntry): OcrMappedFields {
  const fields: OcrMappedFields = {};

  if (entry.name?.value && entry.name.confidence !== 'none') {
    fields.name = entry.name.value;
  }
  if (entry.fatherName?.value && entry.fatherName.confidence !== 'none') {
    fields.fatherName = entry.fatherName.value;
  }
  if (entry.address?.value && entry.address.confidence !== 'none') {
    fields.address = entry.address.value;
  }
  if (entry.phone?.value && entry.phone.confidence !== 'none') {
    fields.phone = entry.phone.value;
  }
  if (entry.aadhaarNumber?.value && entry.aadhaarNumber.confidence !== 'none') {
    fields.aadhaarNumber = entry.aadhaarNumber.value.replace(/\s+/g, '');
  }
  if (entry.gender?.value && entry.gender.confidence !== 'none') {
    const g = entry.gender.value.toUpperCase();
    if (['MALE', 'FEMALE', 'OTHER'].includes(g)) fields.gender = g;
  }
  if (entry.age?.value && entry.age.confidence !== 'none') {
    const parsed = parseInt(entry.age.value, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 130) fields.age = parsed;
  }
  if (entry.roomNumber?.value && entry.roomNumber.confidence !== 'none') {
    fields.roomNumber = entry.roomNumber.value;
  }
  if (entry.arrivalDate?.value && entry.arrivalDate.confidence !== 'none') {
    fields.arrivalDate = entry.arrivalDate.value;
  }
  if (entry.arrivalTime?.value && entry.arrivalTime.confidence !== 'none') {
    fields.arrivalTime = entry.arrivalTime.value;
  }
  if (entry.expectedCheckoutDate?.value && entry.expectedCheckoutDate.confidence !== 'none') {
    fields.expectedCheckoutDate = entry.expectedCheckoutDate.value;
  }
  if (entry.expectedCheckoutTime?.value && entry.expectedCheckoutTime.confidence !== 'none') {
    fields.expectedCheckoutTime = entry.expectedCheckoutTime.value;
  }
  if (entry.roomRent?.value && entry.roomRent.confidence !== 'none') {
    const val = parseFloat(entry.roomRent.value);
    if (!isNaN(val)) fields.roomRent = val;
  }
  if (entry.advanceAmount?.value && entry.advanceAmount.confidence !== 'none') {
    const val = parseFloat(entry.advanceAmount.value);
    if (!isNaN(val)) fields.advanceAmount = val;
  }
  if (entry.totalAmount?.value && entry.totalAmount.confidence !== 'none') {
    const val = parseFloat(entry.totalAmount.value);
    if (!isNaN(val)) fields.totalAmount = val;
  }
  if (entry.remarks?.value && entry.remarks.confidence !== 'none') {
    fields.remarks = entry.remarks.value;
  }

  return fields;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function OcrUploader({ onApply }: OcrUploaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<GuestOcrResult | null>(null);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);
  const [mappedFields, setMappedFields] = useState<OcrMappedFields>({});
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported format: ${file.type}. Please upload JPG, PNG, WEBP, or PDF.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setOcrResult(null);
    setSelectedEntryIndex(0);
    setMappedFields({});
    setApplied(false);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 85));
      }, 200);

      const response = await api.post('/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result: GuestOcrResult = response.data.data;
      setOcrResult(result);
      setSelectedEntryIndex(0);

      const activeEntry = result.entries?.[0] || result;
      setMappedFields(mapOcrEntryToFormFields(activeEntry));
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'OCR extraction failed. Please ensure the register page photo is bright and legible.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectEntry = (index: number) => {
    if (!ocrResult || !ocrResult.entries?.[index]) return;
    setSelectedEntryIndex(index);
    setMappedFields(mapOcrEntryToFormFields(ocrResult.entries[index]));
    setApplied(false);
  };

  const handleApply = () => {
    onApply(mappedFields);
    setApplied(true);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setSelectedEntryIndex(0);
    setMappedFields({});
    setError(null);
    setApplied(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const activeEntry: GuestRegisterEntry | null = ocrResult
    ? (ocrResult.entries?.[selectedEntryIndex] || ocrResult)
    : null;

  const entriesList = ocrResult?.entries || (ocrResult ? [ocrResult] : []);

  return (
    <div className="bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden">
      {/* ── Header — always visible ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              📖 Scan Handwritten Register Notebook Page (AI OCR)
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              Photograph handwritten arrival/departure register pages — AI automatically transcribes & extracts guest check-ins
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {applied && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Applied to Form
            </span>
          )}
          <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            AI Notebook Scan
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* ── Expandable body ──────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-blue-100 p-4 space-y-4">
          {/* Info bar */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
            <span>
              <strong>Handwritten Register Extraction:</strong> Snap or upload a photo of your physical guest register notebook or ledger sheet.
              The AI transcribes handwritten Names, Father Names, Addresses, Phone Numbers, Room Numbers, rent/advance amounts, and dates automatically.
            </span>
          </div>

          {/* ── Upload area ──────────────────────────────────────────────── */}
          {!selectedFile && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Drag & drop notebook photo or click to upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload handwritten guest register page, notebook photo, or PDF (JPG, PNG, WEBP, PDF — max 10MB)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Select Register Photo
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    className="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Snap Register Book
                  </button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          )}

          {/* ── Selected file preview ────────────────────────────────────── */}
          {selectedFile && !ocrResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Register preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(0)} KB • Ready for Handwriting Extraction
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Processing progress */}
              {isProcessing && (
                <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-900 font-semibold flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      {uploadProgress < 90 ? 'Uploading register page...' : 'Transcribing handwriting with Gemini AI...'}
                    </span>
                    <span className="text-blue-700 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isProcessing && (
                <button
                  type="button"
                  onClick={handleExtract}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Scan className="w-4 h-4" />
                  Transcribe & Extract Register Entry
                </button>
              )}
            </div>
          )}

          {/* ── Error message ────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Extraction Error</p>
                <p>{error}</p>
              </div>
              <button type="button" onClick={handleReset} className="ml-auto">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── OCR Results ──────────────────────────────────────────────── */}
          {ocrResult && activeEntry && (
            <div className="space-y-4">
              {/* Multiple entries selector tab bar */}
              {entriesList.length > 1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-blue-900 block">
                    Found {entriesList.length} handwritten guest entries on this page. Select an entry to review & apply:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {entriesList.map((entry, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectEntry(idx)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                          selectedEntryIndex === idx
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <User className="w-3 h-3" />
                        Entry #{idx + 1}: {entry.name.value || `Guest ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Result header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">
                    Handwritten Extraction Complete
                  </span>
                  <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">
                    {ocrResult.documentType.replace(/_/g, ' ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Scan Another Page
                </button>
              </div>

              {/* Preview thumbnail alongside results */}
              {previewUrl && (
                <div className="flex gap-3 items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <img
                    src={previewUrl}
                    alt="Register page photo"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-800">{selectedFile?.name}</p>
                    {ocrResult.processingNotes && (
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        ⚠️ {ocrResult.processingNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Extracted fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {[
                  { label: 'Guest Full Name', field: activeEntry.name },
                  { label: 'Father / Husband Name', field: activeEntry.fatherName },
                  { label: 'Mobile Phone', field: activeEntry.phone },
                  { label: 'Permanent Address', field: activeEntry.address, colSpan: 'sm:col-span-2' },
                  { label: 'Aadhaar / ID No.', field: activeEntry.aadhaarNumber },
                  { label: 'Gender', field: activeEntry.gender },
                  { label: 'Age', field: activeEntry.age },
                  { label: 'Room Number', field: activeEntry.roomNumber },
                  { label: 'Check-in Date', field: activeEntry.arrivalDate },
                  { label: 'Check-in Time', field: activeEntry.arrivalTime },
                  { label: 'Checkout Date', field: activeEntry.expectedCheckoutDate },
                  { label: 'Room Rent (₹)', field: activeEntry.roomRent },
                  { label: 'Advance Paid (₹)', field: activeEntry.advanceAmount },
                  { label: 'Total Amount (₹)', field: activeEntry.totalAmount },
                  { label: 'Handwritten Remarks', field: activeEntry.remarks, colSpan: 'sm:col-span-2' },
                ].map(({ label, field, colSpan }) => (
                  <div
                    key={label}
                    className={`p-2.5 rounded-lg border ${
                      field.confidence === 'low'
                        ? 'bg-amber-50 border-amber-200'
                        : field.confidence === 'none'
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-emerald-50 border-emerald-200'
                    } ${colSpan || ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-600 uppercase text-[10px]">{label}</span>
                      {confidenceBadge(field.confidence)}
                    </div>
                    <p className={`font-semibold ${field.value ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                      {field.value || 'Not written in register'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Confidence legend */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="font-semibold">Handwriting Confidence:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>High (Clear text)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>Medium (Legible)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>Low (Difficult cursive — please verify)
                </span>
              </div>

              {/* Raw text transcription toggle */}
              <button
                type="button"
                onClick={() => setShowRawText((p) => !p)}
                className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-slate-900 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                {showRawText ? 'Hide' : 'Show'} full raw register transcription
              </button>
              {showRawText && (
                <pre className="p-3 bg-slate-900 text-slate-100 text-[10px] rounded-lg overflow-auto max-h-36 whitespace-pre-wrap font-mono">
                  {ocrResult.rawText || 'No raw text transcribed.'}
                </pre>
              )}

              {/* Apply button */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                {applied ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 w-full justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                    Handwritten entry applied to check-in registration form!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply Handwritten Entry to Form
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-3 border border-slate-300 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
