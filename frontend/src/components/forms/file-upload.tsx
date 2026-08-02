'use client';

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface FileUploadProps {
  label: string;
  documentType: 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PHOTO' | 'SIGNATURE';
  guestId?: string;
  value?: string | null;
  onChange: (url: string) => void;
}

export function FileUpload({ label, documentType, guestId, value, onChange }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // If guestId is available, upload directly via API to Cloudinary
    if (guestId) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('guestId', guestId);
        formData.append('documentType', documentType);

        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.success) {
          onChange(res.data.data.fileUrl);
          setPreview(res.data.data.fileUrl);
        }
      } catch (err: any) {
        setError('Upload failed. Retrying offline preview.');
      } finally {
        setLoading(false);
      }
    } else {
      // In form mode before guest creation: convert to base64 preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onChange(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      {preview ? (
        <div className="relative border border-slate-300 rounded-md overflow-hidden bg-slate-50 group flex flex-col items-center justify-center p-2">
          <img src={preview} alt={label} className="h-32 object-contain rounded" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-slate-900/70 hover:bg-slate-900 text-white p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-1" />
          ) : (
            <Upload className="w-6 h-6 text-slate-400 mb-1" />
          )}
          <span className="text-xs font-medium text-slate-600">
            {loading ? 'Uploading...' : `Upload ${label}`}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 5MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
