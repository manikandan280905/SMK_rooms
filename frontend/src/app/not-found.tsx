import React from 'react';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
      <div className="bg-white border border-slate-200 p-8 rounded-lg max-w-md w-full shadow-sm space-y-4">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The register page you requested does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md"
          >
            Return to Register Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
