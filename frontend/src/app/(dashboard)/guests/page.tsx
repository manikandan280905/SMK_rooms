'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { useLodge } from '@/lib/lodge-context';
import { StatusBadge } from '@/components/common/status-badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export default function GuestListPage() {
  const queryClient = useQueryClient();
  const { selectedLodgeId, selectedLodge } = useLodge();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['guests', page, search, status, selectedLodgeId],
    queryFn: async () => {
      const res = await api.get('/guests', {
        params: {
          page,
          limit: 15,
          lodgeId: selectedLodgeId,
          search: search || undefined,
          status: status || undefined,
        },
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/guests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setDeleteModalId(null);
    },
  });

  const guests = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Guest Register {selectedLodgeId !== 'ALL' && `(${selectedLodge?.name})`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, view, and manage arrival and departure records
          </p>
        </div>
        <Link
          href="/guests/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-md shadow-sm transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Guest Check-in</span>
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Instant Search by Name, Phone, Aadhaar, Room, Invoice..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Booking Statuses</option>
              <option value="CHECKED_IN">Currently Checked In</option>
              <option value="CHECKED_OUT">Checked Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Lodge</th>
                <th className="px-4 py-3.5">Guest Name</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Room</th>
                <th className="px-4 py-3.5">Check In</th>
                <th className="px-4 py-3.5">Check Out</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Bill Amount</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Fetching guests register...</span>
                    </div>
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No guest records found for this lodge selection.
                  </td>
                </tr>
              ) : (
                guests.map((guest: any) => {
                  const booking = guest.bookings?.[0];
                  const room = booking?.room;
                  const lodgeName = guest.lodge?.name || booking?.lodge?.name || '-';

                  return (
                    <tr key={guest.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-800">
                        <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                          {lodgeName}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <Link href={`/guests/${guest.id}`} className="hover:underline text-blue-600">
                          {guest.name}
                        </Link>
                        {guest.aadhaarNumber && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Aadhaar: {guest.aadhaarNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{guest.phone}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {room ? (
                          <>
                            Room {room.roomNumber}
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {room.roomType}
                            </span>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {booking ? formatDate(booking.arrivalDate) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {booking?.departureDate
                          ? formatDate(booking.departureDate)
                          : booking?.expectedCheckoutDate
                          ? `Exp: ${formatDate(booking.expectedCheckoutDate)}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking?.status || 'CHECKED_IN'} />
                      </td>
                      <td className="px-4 py-3">
                        {booking ? (
                          <>
                            <span className="font-bold text-slate-900">{formatCurrency(booking.totalAmount || 0)}</span>
                            {(booking.advanceAmount || 0) > 0 && (
                              <span className="text-[10px] text-emerald-600 block font-medium">
                                Adv: {formatCurrency(booking.advanceAmount)}
                              </span>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/guests/${guest.id}`}
                            title="View Details"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/guests/${guest.id}/edit`}
                            title="Edit Record"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {booking?.status === 'CHECKED_IN' && (
                            <Link
                              href={`/guests/${guest.id}/checkout`}
                              title="Check Out"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors font-medium flex items-center gap-1 text-[11px]"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Checkout</span>
                            </Link>
                          )}

                          <button
                            onClick={() => setDeleteModalId(guest.id)}
                            title="Delete Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total guests)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-slate-200 shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Delete Guest Record?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete this guest entry and associated records.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteModalId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
