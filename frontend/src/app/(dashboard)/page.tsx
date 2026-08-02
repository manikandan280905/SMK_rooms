'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLodge } from '@/lib/lodge-context';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/common/status-badge';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import OcrUploader, { OcrMappedFields } from '@/components/ocr/OcrUploader';
import Link from 'next/link';
import {
  UserPlus,
  LogIn,
  LogOut,
  BedDouble,
  CheckCircle2,
  IndianRupee,
  Loader2,
  ArrowRight,
  Building2,
  CalendarDays,
  Home,
  Wind,
  Thermometer,
  Scan,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { selectedLodgeId, selectedLodge } = useLodge();

  const handleOcrApply = (fields: OcrMappedFields) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ocr_guest_data', JSON.stringify(fields));
    }
    router.push('/guests/new');
  };

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['dashboard', selectedLodgeId],
    queryFn: async () => {
      const res = await api.get('/dashboard', {
        params: selectedLodgeId !== 'ALL' ? { lodgeId: selectedLodgeId } : {},
      });
      return res.data.data;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 15,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
        Failed to load dashboard metrics for selected lodge.
      </div>
    );
  }

  // AC/Non-AC breakdown for available rooms
  const acBreakdown: Record<string, { ac: number; nonAc: number }> = data.acBreakdown || {};

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-50 border-emerald-200',
    OCCUPIED: 'bg-rose-50 border-rose-200',
    CLEANING: 'bg-amber-50 border-amber-200',
    MAINTENANCE: 'bg-slate-50 border-slate-200',
    RESERVED: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {selectedLodgeId === 'ALL' ? 'All Lodges Operational Dashboard' : `${selectedLodge?.name} Operational Overview`}
            </h1>
            {isFetching && !isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time lodge status, occupancy, revenue, and guest register
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/guests/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Guest Check-in</span>
          </Link>

          <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-md text-xs font-bold text-blue-800 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Active: {selectedLodgeId === 'ALL' ? 'All Lodges' : selectedLodge?.name}</span>
          </div>
        </div>
      </div>

      {/* ── OCR Scan Section on Dashboard ───────────────────────────────── */}
      <OcrUploader onApply={handleOcrApply} />

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={data.totalRooms}
          icon={Home}
          color="slate"
        />
        <StatCard
          title="Available Rooms"
          value={data.availableRooms}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Occupied Rooms"
          value={data.occupiedRooms}
          icon={BedDouble}
          color="rose"
        />
        <StatCard
          title="Current Guests"
          value={data.currentCheckIns}
          icon={LogIn}
          color="indigo"
        />
        <StatCard
          title="Today's Guests"
          value={data.todaysGuests}
          icon={UserPlus}
          color="blue"
        />
        <StatCard
          title="Today's Check-outs"
          value={data.todaysCheckOuts}
          icon={LogOut}
          color="slate"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(data.todaysRevenue)}
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(data.monthlyRevenue)}
          icon={CalendarDays}
          color="emerald"
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Check-ins Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Check-ins</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest guests checked into {selectedLodgeId === 'ALL' ? 'all lodges' : selectedLodge?.name}</p>
            </div>
            <Link
              href="/guests"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Lodge / Room</th>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Check-in Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentCheckIns.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                      No active check-ins currently
                    </td>
                  </tr>
                ) : (
                  data.recentCheckIns.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <span className="text-[10px] text-blue-600 font-bold uppercase block">
                          {booking.lodge?.name || 'Lodge'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span>Room {booking.room?.roomNumber}</span>
                          {booking.room?.isAC ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold">
                              <Wind className="w-2.5 h-2.5" />
                              AC
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[9px] font-bold">
                              <Thermometer className="w-2.5 h-2.5" />
                              Non-AC
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {booking.room?.roomType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link href={`/guests/${booking.guestId}`} className="hover:underline text-blue-600">
                          {booking.guest?.name || 'Guest'}
                        </Link>
                        <p className="text-[11px] text-slate-500">{booking.guest?.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDateTime(booking.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Status Summary */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Room Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Inventory breakdown by AC type</p>
            </div>
            <Link
              href="/rooms"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            <div className="space-y-3">
              {data.roomStatus.map((item: any) => {
                const breakdown = acBreakdown[item.status];
                return (
                  <div
                    key={item.status}
                    className={`p-3 rounded-md border ${statusColors[item.status] || 'bg-slate-50 border-slate-100'}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <StatusBadge status={item.status} />
                      <span className="font-bold text-slate-900 text-sm">{item.count} Rooms</span>
                    </div>

                    {/* AC / Non-AC sub-breakdown */}
                    {item.count > 0 && breakdown && (
                      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-white/60">
                        {breakdown.ac > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                            <Wind className="w-2.5 h-2.5" />
                            AC: {breakdown.ac}
                          </span>
                        )}
                        {breakdown.nonAc > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                            <Thermometer className="w-2.5 h-2.5" />
                            Non-AC: {breakdown.nonAc}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
