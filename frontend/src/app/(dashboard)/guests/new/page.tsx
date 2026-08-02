'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLodge } from '@/lib/lodge-context';
import { useToast } from '@/lib/toast-context';
import { formatCurrency } from '@/lib/formatters';
import OcrUploader, { OcrMappedFields } from '@/components/ocr/OcrUploader';
import {
  UserCheck,
  Building,
  Camera,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Calculator,
  Building2,
  Wind,
  Thermometer,
} from 'lucide-react';

export default function NewGuestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { lodges, selectedLodgeId } = useLodge();
  const [error, setError] = useState('');

  // Selected Lodge for this booking — always defaults to a real lodge (never 'ALL')
  const [activeLodgeId, setActiveLodgeId] = useState<string>(
    selectedLodgeId !== 'ALL' && selectedLodgeId ? selectedLodgeId : lodges[0]?.id || ''
  );

  useEffect(() => {
    if (selectedLodgeId !== 'ALL' && selectedLodgeId) {
      setActiveLodgeId(selectedLodgeId);
    } else if (lodges.length > 0 && !activeLodgeId) {
      setActiveLodgeId(lodges[0].id);
    }

    // Check if OCR data was scanned from Dashboard page
    if (typeof window !== 'undefined') {
      const savedOcr = sessionStorage.getItem('ocr_guest_data');
      if (savedOcr) {
        try {
          const fields = JSON.parse(savedOcr);
          applyOcrResult(fields);
          sessionStorage.removeItem('ocr_guest_data');
          showToast('info', '📷 OCR Data Applied', 'Guest details pre-filled from Dashboard scan.');
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, [selectedLodgeId, lodges]);

  // Fetch available rooms for active lodge
  const { data: availableRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['availableRooms', activeLodgeId],
    queryFn: async () => {
      const res = await api.get('/rooms/available', {
        params: { lodgeId: activeLodgeId },
      });
      return res.data.data;
    },
    enabled: !!activeLodgeId,
  });

  // Form State
  const [formData, setFormData] = useState({
    lodgeId: activeLodgeId,
    // Guest Details
    name: '',
    fatherName: '',
    address: '',
    phone: '',
    altPhone: '',
    gender: 'MALE',
    age: 25,
    occupation: '',
    nationality: 'Indian',
    purposeOfVisit: 'Tourist',
    adults: 2,
    children: 0,
    vehicleNumber: '',
    emergencyContact: '',
    email: '',
    aadhaarNumber: '',
    passportNumber: '',
    remarks: '',
    internalNotes: '',

    // Documents
    aadhaarFrontUrl: '',
    aadhaarBackUrl: '',
    photoUrl: '',
    signatureUrl: '',

    // Room & Dates
    roomId: '',
    arrivalDate: new Date().toISOString().slice(0, 10),
    arrivalTime: new Date().toTimeString().slice(0, 5),
    expectedCheckoutDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    expectedCheckoutTime: '11:00',

    // Charges
    roomRent: 1600,
    baseRoomRent: 1600,
    extraGuestCharge: 0,
    extraCharges: 0,
    discount: 0,
    advanceAmount: 0,
    totalAmount: 1600,
    bookingRemarks: '',
  });

  const selectedRoom = availableRooms.find((r: any) => r.id === formData.roomId);

  // Automatically recalculate stay duration and price summary
  useEffect(() => {
    const lodgeToUse = activeLodgeId || (selectedLodgeId !== 'ALL' ? selectedLodgeId : lodges[0]?.id);
    setFormData((prev) => ({ ...prev, lodgeId: lodgeToUse }));

    if (!selectedRoom) return;

    const totalGuests = (formData.adults || 1) + (formData.children || 0);

    // Rule engine for automatic price calculation
    let basePrice = selectedRoom.dailyPrice || selectedRoom.price || 1000;
    let maxOcc = selectedRoom.maxOccupancy || 2;
    let extraGuestRate = selectedRoom.extraGuestCharge || 0;

    if (selectedRoom.roomType === 'MONTHLY') {
      const monthlyRent = selectedRoom.monthlyPrice || formData.roomRent || 12000;
      setFormData((prev) => ({
        ...prev,
        baseRoomRent: monthlyRent,
        extraGuestCharge: 0,
        roomRent: monthlyRent,
        totalAmount: Math.max(0, monthlyRent + prev.extraCharges - prev.discount),
      }));
      return;
    }

    // Daily room rules
    const extraGuests = Math.max(0, totalGuests - maxOcc);
    const extraChargePerDay = extraGuests * extraGuestRate;
    const dailyTotalRent = basePrice + extraChargePerDay;

    // Calculate stay days
    const arrival = new Date(formData.arrivalDate);
    const checkout = new Date(formData.expectedCheckoutDate);
    const days = Math.max(1, Math.ceil((checkout.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));

    const grandTotal = (dailyTotalRent * days) + (formData.extraCharges || 0) - (formData.discount || 0);

    setFormData((prev) => ({
      ...prev,
      baseRoomRent: basePrice,
      extraGuestCharge: extraChargePerDay,
      roomRent: dailyTotalRent,
      totalAmount: Math.max(0, grandTotal),
    }));
  }, [
    formData.roomId,
    formData.adults,
    formData.children,
    formData.arrivalDate,
    formData.expectedCheckoutDate,
    formData.extraCharges,
    formData.discount,
    activeLodgeId,
    selectedRoom,
  ]);

  /**
   * Merges OCR-extracted fields into formData.
   * Only overwrites fields that OCR actually found (non-null values).
   * User can still edit any field after applying.
   */
  const applyOcrResult = (fields: OcrMappedFields) => {
    setFormData((prev) => ({
      ...prev,
      ...(fields.name                 !== undefined && { name:                 fields.name }),
      ...(fields.fatherName            !== undefined && { fatherName:            fields.fatherName }),
      ...(fields.address              !== undefined && { address:              fields.address }),
      ...(fields.aadhaarNumber        !== undefined && { aadhaarNumber:        fields.aadhaarNumber }),
      ...(fields.gender               !== undefined && { gender:               fields.gender as any }),
      ...(fields.age                  !== undefined && { age:                  fields.age }),
      ...(fields.phone                !== undefined && { phone:                fields.phone }),
      ...(fields.arrivalDate          !== undefined && { arrivalDate:          fields.arrivalDate }),
      ...(fields.arrivalTime          !== undefined && { arrivalTime:          fields.arrivalTime }),
      ...(fields.expectedCheckoutDate !== undefined && { expectedCheckoutDate: fields.expectedCheckoutDate }),
      ...(fields.expectedCheckoutTime !== undefined && { expectedCheckoutTime: fields.expectedCheckoutTime }),
      ...(fields.roomRent             !== undefined && { roomRent:             fields.roomRent }),
      ...(fields.advanceAmount        !== undefined && { advanceAmount:        fields.advanceAmount }),
      ...(fields.totalAmount          !== undefined && { totalAmount:          fields.totalAmount }),
      ...(fields.remarks              !== undefined && { remarks:              fields.remarks }),
    }));
  };

  const createGuestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post('/guests', data);
      return res.data.data;
    },
    onSuccess: (guest) => {
      // Invalidate dashboard and guests cache so they update immediately
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });

      // Show success popup
      showToast(
        'success',
        '✅ Guest Checked In Successfully!',
        `${guest.name} has been registered and room allocated.`
      );

      // Navigate to guest detail page
      router.push(`/guests/${guest.id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register guest. Please check all fields.';
      setError(msg);
      showToast('error', 'Check-in Failed', msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.roomId) {
      setError('Please select an available room from the chosen lodge');
      return;
    }

    createGuestMutation.mutate(formData);
  };

  const arrivalDateObj = new Date(formData.arrivalDate);
  const checkoutDateObj = new Date(formData.expectedCheckoutDate);
  const calculatedDays = selectedRoom?.roomType === 'MONTHLY' ? 1 : Math.max(1, Math.ceil((checkoutDateObj.getTime() - arrivalDateObj.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">New Guest Registration</h1>
            <p className="text-xs text-slate-500">Digital Arrival & Departure Register Entry</p>
          </div>
        </div>
      </div>

      {/* ── OCR Auto-Fill Section ─────────────────────────────────────────── */}
      <OcrUploader onApply={applyOcrResult} />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Lodge Selection & Room Allocation */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-700 font-bold text-sm">
            <Building2 className="w-5 h-5" />
            <span>1. Lodge Selection & Room Allocation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Field 1: Lodge Selection Dropdown */}
            <div>
              <label className="block font-bold uppercase text-blue-800 mb-1">
                Select Lodge *
              </label>
              <select
                required
                value={activeLodgeId}
                onChange={(e) => {
                  setActiveLodgeId(e.target.value);
                  setFormData({ ...formData, lodgeId: e.target.value, roomId: '' });
                }}
                className="w-full p-2.5 bg-blue-50 border border-blue-300 rounded-md font-bold text-blue-900 focus:ring-2 focus:ring-blue-600"
              >
                {lodges.map((lodge) => (
                  <option key={lodge.id} value={lodge.id}>
                    🏨 {lodge.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Room Dropdown */}
            <div className="md:col-span-2">
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Available Rooms in {lodges.find((l) => l.id === activeLodgeId)?.name || 'Lodge'} *
              </label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-medium"
              >
                <option value="">-- Choose Available Room --</option>
                {availableRooms.map((room: any) => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber} ({room.roomType} • {room.isAC ? 'AC' : 'Non-AC'}){room.status === 'RESERVED' ? ' [RESERVED]' : ''} — Max {room.maxOccupancy} Guests — ₹
                    {room.roomType === 'MONTHLY' ? `${room.monthlyPrice}/mo` : `${room.dailyPrice || room.price}/day`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Specifications Info Card */}
          {selectedRoom && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-semibold block mb-1">Room Type</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{selectedRoom.roomType}</span>
                  {selectedRoom.isAC ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                      <Wind className="w-3 h-3" />
                      AC
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold">
                      <Thermometer className="w-3 h-3" />
                      Non-AC
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold block">Base Pricing</span>
                <span className="font-bold text-blue-700">
                  {selectedRoom.roomType === 'MONTHLY'
                    ? formatCurrency(selectedRoom.monthlyPrice || 0) + ' / month'
                    : formatCurrency(selectedRoom.dailyPrice || selectedRoom.price) + ' / day'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold block">Max Occupancy</span>
                <span className="font-bold text-slate-900">{selectedRoom.maxOccupancy} Guests</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold block">Extra Guest Fee</span>
                <span className="font-bold text-slate-900">
                  {selectedRoom.extraGuestCharge > 0 ? `${formatCurrency(selectedRoom.extraGuestCharge)}/extra guest` : 'No Extra Fee'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Personal Guest Information */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-700 font-bold text-sm">
            <UserCheck className="w-5 h-5" />
            <span>2. Guest Details & Number of Guests</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Guest Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Father / Husband Name
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Father's Name"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Permanent Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House No, Street, City, State, Pin Code"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Aadhaar Number *
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                placeholder="12-digit Aadhaar number"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Number of Adult Guests *
              </label>
              <input
                type="number"
                required
                min={1}
                max={20}
                value={formData.adults}
                onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Number of Children
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={formData.children}
                onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Stay Dates */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-700 font-bold text-sm">
            <Building className="w-5 h-5" />
            <span>3. Check-in & Check-out Dates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={formData.arrivalDate}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Check-in Time *
              </label>
              <input
                type="time"
                required
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={formData.expectedCheckoutDate}
                onChange={(e) => setFormData({ ...formData, expectedCheckoutDate: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Check-out Time
              </label>
              <input
                type="time"
                value={formData.expectedCheckoutTime}
                onChange={(e) => setFormData({ ...formData, expectedCheckoutTime: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Price Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-700 font-bold text-sm">
            <Calculator className="w-5 h-5" />
            <span>4. Live Price Summary</span>
          </div>

          {/* Automatic Price Breakdown Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <h3 className="font-bold text-blue-900 text-sm flex items-center justify-between">
              <span>Automatic Price Calculation Breakdown</span>
              <span className="text-xs font-normal text-blue-700">Live Auto-Update</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase block font-semibold">Base Room Rent</span>
                <span className="font-bold text-slate-900">{formatCurrency(formData.baseRoomRent)}/day</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block font-semibold">Extra Guest Charges</span>
                <span className="font-bold text-slate-900">{formatCurrency(formData.extraGuestCharge)}/day</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block font-semibold">Duration</span>
                <span className="font-bold text-slate-900">{calculatedDays} Day(s)</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block font-semibold">Calculated Total</span>
                <span className="font-extrabold text-blue-800 text-sm">{formatCurrency(formData.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Extra Charges (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.extraCharges}
                onChange={(e) => setFormData({ ...formData, extraCharges: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Discount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Advance Paid (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.advanceAmount}
                onChange={(e) => setFormData({ ...formData, advanceAmount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-slate-300 rounded-md text-slate-700 text-sm font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createGuestMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            {createGuestMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Guest...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Check-in</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
