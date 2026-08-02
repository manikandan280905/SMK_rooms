'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { LogOut, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const { data: guest, isLoading } = useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await api.get(`/guests/${id}`);
      return res.data.data;
    },
  });

  const latestBooking = guest?.bookings?.[0];

  const [checkoutData, setCheckoutData] = useState({
    departureDate: new Date().toISOString().slice(0, 10),
    departureTime: new Date().toTimeString().slice(0, 5),
    lateCheckoutCharges: 0,
    additionalPayment: 0,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!latestBooking?.id) throw new Error('No active booking found');
      const res = await api.post(`/guests/${latestBooking.id}/checkout`, checkoutData);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate dashboard and related queries immediately
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest', id] });
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });

      showToast('success', '✅ Check-out Complete!', `${guest?.name} has been checked out successfully.`);
      router.push(`/guests/${id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Checkout failed. Please try again.';
      setError(msg);
      showToast('error', 'Checkout Failed', msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!latestBooking) {
    return <div className="p-6 text-slate-500">No active booking to check out.</div>;
  }

  const room = latestBooking.room;
  const totalBill = latestBooking.totalAmount || 0;
  const advancePaid = latestBooking.advanceAmount || 0;
  const lateCharges = checkoutData.lateCheckoutCharges || 0;
  const additionalPaid = checkoutData.additionalPayment || 0;
  const finalBalance = Math.max(0, totalBill + lateCharges - advancePaid - additionalPaid);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Guest Check-out</h1>
          <p className="text-xs text-slate-500">
            Guest: {guest.name} • Room {room?.roomNumber}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Stay & Billing Summary
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-slate-500 uppercase font-semibold block">Check-in Date</span>
            <span className="font-bold text-slate-900">{formatDate(latestBooking.arrivalDate)}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold block">Room Rent Rate</span>
            <span className="font-bold text-slate-900">{formatCurrency(latestBooking.roomRent)}/day</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold block">Total Bill</span>
            <span className="font-bold text-slate-900">{formatCurrency(totalBill)}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold block">Advance Paid</span>
            <span className="font-bold text-emerald-700">{formatCurrency(advancePaid)}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold block">Pending Balance</span>
            <span className="font-bold text-rose-700">{formatCurrency(Math.max(0, totalBill - advancePaid))}</span>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkoutMutation.mutate();
        }}
        className="bg-white rounded-lg border border-slate-200 p-6 space-y-5 shadow-sm text-xs"
      >
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Departure Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Departure Date *
            </label>
            <input
              type="date"
              required
              value={checkoutData.departureDate}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, departureDate: e.target.value })
              }
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Departure Time *
            </label>
            <input
              type="time"
              required
              value={checkoutData.departureTime}
              onChange={(e) =>
                setCheckoutData({ ...checkoutData, departureTime: e.target.value })
              }
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Late Checkout Extra Charges (₹)
            </label>
            <input
              type="number"
              min={0}
              value={checkoutData.lateCheckoutCharges}
              onChange={(e) =>
                setCheckoutData({
                  ...checkoutData,
                  lateCheckoutCharges: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Additional Payment Received (₹)
            </label>
            <input
              type="number"
              min={0}
              value={checkoutData.additionalPayment}
              onChange={(e) =>
                setCheckoutData({
                  ...checkoutData,
                  additionalPayment: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full p-2.5 border border-slate-300 rounded-md font-bold text-blue-700 focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Calculation Result */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center text-sm font-bold">
          <span className="text-slate-700">Remaining Balance After Settlement:</span>
          <span className={finalBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
            {formatCurrency(finalBalance)}
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={checkoutMutation.isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold flex items-center gap-2"
          >
            {checkoutMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Check-out</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
