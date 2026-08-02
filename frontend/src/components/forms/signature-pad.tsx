'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  value?: string | null;
}

export function SignaturePad({ onSave, value }: SignaturePadProps) {
  const sigRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [SigCanvas, setSigCanvas] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('react-signature-canvas').then((mod) => {
      setSigCanvas(() => mod.default);
    });
  }, []);

  const handleClear = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
    onSave('');
  };

  const handleSave = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border border-slate-300 rounded-md bg-white overflow-hidden min-h-[144px] flex items-center justify-center">
        {value ? (
          <div className="p-2 relative bg-slate-50 flex flex-col items-center w-full">
            <img src={value} alt="Guest Signature" className="max-h-32 object-contain" />
            <button
              type="button"
              onClick={handleClear}
              className="mt-2 text-xs text-rose-600 font-semibold hover:underline"
            >
              Re-sign / Clear
            </button>
          </div>
        ) : mounted && SigCanvas ? (
          <SigCanvas
            ref={sigRef}
            penColor="#1e293b"
            canvasProps={{
              className: 'w-full h-36 bg-white cursor-crosshair',
            }}
            onEnd={handleSave}
          />
        ) : (
          <div className="text-xs text-slate-400 p-4">Loading signature pad...</div>
        )}
      </div>

      {!value && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Sign inside the box above</span>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
}
