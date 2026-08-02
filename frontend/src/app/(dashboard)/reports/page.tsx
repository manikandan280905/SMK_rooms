'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLodge } from '@/lib/lodge-context';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/status-badge';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  DollarSign,
  Users,
  BedDouble,
  Loader2,
  Clock,
  Building2,
} from 'lucide-react';

export default function ReportsPage() {
  const { lodges, selectedLodgeId, setSelectedLodgeId } = useLodge();
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useQuery({
    queryKey: ['reports', reportType, date, dateFrom, dateTo, selectedLodgeId],
    queryFn: async () => {
      let endpoint = `/reports/${reportType}`;
      const params: any = { lodgeId: selectedLodgeId };

      if (reportType === 'daily') {
        params.date = date;
      } else if (reportType === 'revenue' || reportType === 'checkout' || reportType === 'guest-history') {
        params.dateFrom = dateFrom;
        params.dateTo = dateTo;
      }

      const res = await api.get(endpoint, { params });
      return res.data.data;
    },
  });

  const exportCSV = () => {
    if (!data) return;

    let rows: any[] = [];
    if (Array.isArray(data)) {
      rows = data;
    } else if (data.bookings) {
      rows = data.bookings;
    } else if (data.payments) {
      rows = data.payments;
    } else if (data.rooms) {
      rows = data.rooms;
    }

    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]).join(',');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows.map((row) => JSON.stringify(Object.values(row)).slice(1, -1))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smk-rooms-${reportType}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTabs = [
    { id: 'daily', label: 'Daily Register', icon: Calendar },
    { id: 'monthly', label: 'Monthly Summary', icon: Clock },
    { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
    { id: 'occupancy', label: 'Room Occupancy', icon: BedDouble },
    { id: 'current-guests', label: 'Current Guests', icon: Users },
    { id: 'checkout', label: 'Checkout Report', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports & Daily Register Output</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs, occupancy analytics, revenue reports, and export tools
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters bar: Lodge Selector & Date Range */}
      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-blue-900">Lodge Filter:</span>
          <select
            value={selectedLodgeId}
            onChange={(e) => setSelectedLodgeId(e.target.value)}
            className="bg-transparent font-bold text-blue-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL">🌐 All Lodges Combined</option>
            {lodges.map((l) => (
              <option key={l.id} value={l.id}>
                🏨 {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          {reportType === 'daily' && (
            <div>
              <label className="font-semibold text-slate-700 mr-2 uppercase">Select Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border border-slate-300 rounded-md bg-white font-medium"
              />
            </div>
          )}

          {(reportType === 'revenue' || reportType === 'checkout' || reportType === 'guest-history') && (
            <>
              <div>
                <label className="font-semibold text-slate-700 mr-2 uppercase">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="p-2 border border-slate-300 rounded-md bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 mr-2 uppercase">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="p-2 border border-slate-300 rounded-md bg-white font-medium"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Generating report data...</span>
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-slate-400 text-xs">No data returned for this query.</div>
        ) : (
          <div className="overflow-x-auto">
            {Array.isArray(data) ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Lodge</th>
                    <th className="px-4 py-3">Guest Name</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Check-in</th>
                    <th className="px-4 py-3">Check-out</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No records found for the selected parameters.
                      </td>
                    </tr>
                  ) : (
                    data.map((item: any) => {
                      const guest = item.guest || item;
                      const room = item.room;
                      const payment = item.payment;
                      const lodgeName = item.lodge?.name || guest.lodge?.name || '-';
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-blue-800">
                            <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                              {lodgeName}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {guest.name}
                            <span className="block text-[11px] text-slate-500 font-normal">{guest.phone}</span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {room ? `Room ${room.roomNumber}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatDate(item.arrivalDate || item.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.departureDate ? formatDate(item.departureDate) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={item.status || 'CHECKED_IN'} />
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {item.totalAmount ? formatCurrency(item.totalAmount) : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : data.occupancyRate !== undefined ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-xs text-blue-600 font-semibold uppercase">Occupancy Rate</span>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{data.occupancyRate}%</p>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <span className="text-xs text-emerald-600 font-semibold uppercase">Occupied Rooms</span>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{data.occupied}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-600 font-semibold uppercase">Total Rooms</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{data.totalRooms}</p>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-slate-200 rounded-md">
                  <thead className="bg-slate-50 uppercase font-semibold text-slate-700 border-b">
                    <tr>
                      <th className="px-4 py-3">Lodge</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Current Occupant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.rooms.map((room: any) => (
                      <tr key={room.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-blue-800">{room.lodge?.name}</td>
                        <td className="px-4 py-3 font-bold">Room {room.roomNumber}</td>
                        <td className="px-4 py-3">{room.roomType} ({room.isAC ? 'AC' : 'Non-AC'})</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={room.status} />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {room.bookings?.[0]?.guest?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : data.summary ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Total Revenue</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {formatCurrency(data.summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Total GST</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {formatCurrency(data.summary.totalGST)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Total Guests</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{data.summary.totalGuests}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Total Bookings</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{data.summary.totalBookings}</p>
                  </div>
                </div>
              </div>
            ) : (
              <pre className="p-4 text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
