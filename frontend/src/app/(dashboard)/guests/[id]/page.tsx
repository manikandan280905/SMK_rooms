'use client';

import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/formatters';
import {
  ArrowLeft,
  Edit,
  LogOut,
  User,
  Phone,
  MapPin,
  Calendar,
  Building,
  FileText,
  Loader2,
  ShieldCheck,
  Printer,
} from 'lucide-react';

export default function GuestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: guest, isLoading, error } = useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await api.get(`/guests/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
        Guest record not found.
      </div>
    );
  }

  const latestBooking = guest.bookings?.[0];
  const room = latestBooking?.room;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/guests"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{guest.name}</h1>
              {latestBooking && <StatusBadge status={latestBooking.status} />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Guest Record ID: {guest.id} • Registered {formatDateTime(guest.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>
          <Link
            href={`/guests/${guest.id}/edit`}
            className="px-3 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>

          {latestBooking?.status === 'CHECKED_IN' && (
            <Link
              href={`/guests/${guest.id}/checkout`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Checkout Guest</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal & Contact Information</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Father's Name</span>
              <span className="font-medium text-slate-900">{guest.fatherName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Phone</span>
              <span className="font-medium text-slate-900">{guest.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Alt Phone</span>
              <span className="font-medium text-slate-900">{guest.altPhone || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Gender / Age</span>
              <span className="font-medium text-slate-900">
                {guest.gender}, {guest.age} yrs
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Nationality</span>
              <span className="font-medium text-slate-900">{guest.nationality}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Occupation</span>
              <span className="font-medium text-slate-900">{guest.occupation || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Vehicle No</span>
              <span className="font-medium text-slate-900">{guest.vehicleNumber || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Purpose of Visit</span>
              <span className="font-medium text-slate-900">{guest.purposeOfVisit || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold">Guests Count</span>
              <span className="font-medium text-slate-900">
                {guest.adults} Adults, {guest.children} Children
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-slate-500 block text-xs uppercase font-semibold">Permanent Address</span>
            <p className="text-xs font-medium text-slate-900 mt-0.5">{guest.address}</p>
          </div>
        </div>

        {/* Room & Stay Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Room & Stay Summary</span>
          </h2>

          {room ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                <span className="text-slate-600">Assigned Room</span>
                <span className="font-bold text-slate-900 text-sm">
                  Room {room.roomNumber} ({room.roomType})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Arrival Date</span>
                <span className="font-semibold text-slate-800">{formatDate(latestBooking?.arrivalDate)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Expected Checkout</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(latestBooking?.expectedCheckoutDate)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duration</span>
                <span className="font-semibold text-slate-800">{latestBooking?.numberOfDays} Day(s)</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active room assignment.</p>
          )}

          {latestBooking && (
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Bill</span>
                <span className="font-bold text-slate-900">{formatCurrency(latestBooking.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Advance Paid</span>
                <span className="font-bold text-emerald-700">{formatCurrency(latestBooking.advanceAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Balance</span>
                <span className="font-bold text-rose-700">{formatCurrency(Math.max(0, (latestBooking.totalAmount || 0) - (latestBooking.advanceAmount || 0)))}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Identity Documents Preview */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Uploaded Documents & Signature</span>
        </h2>

        {guest.documents && guest.documents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {guest.documents.map((doc: any) => (
              <div key={doc.id} className="border border-slate-200 rounded p-2 text-center bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-600 block truncate">
                  {doc.documentType.replace('_', ' ')}
                </span>
                <img
                  src={doc.fileUrl}
                  alt={doc.documentType}
                  className="h-28 mx-auto object-contain rounded bg-white"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No identity documents attached to this register record.</p>
        )}
      </div>
    </div>
  );
}
