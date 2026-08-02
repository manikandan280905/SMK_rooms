'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function EditGuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState('');

  const { data: guest, isLoading } = useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await api.get(`/guests/${id}`);
      return res.data.data;
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    address: '',
    phone: '',
    altPhone: '',
    gender: 'MALE',
    age: 25,
    occupation: '',
    nationality: 'Indian',
    purposeOfVisit: '',
    vehicleNumber: '',
    aadhaarNumber: '',
    remarks: '',
    internalNotes: '',
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || '',
        fatherName: guest.fatherName || '',
        address: guest.address || '',
        phone: guest.phone || '',
        altPhone: guest.altPhone || '',
        gender: guest.gender || 'MALE',
        age: guest.age || 25,
        occupation: guest.occupation || '',
        nationality: guest.nationality || 'Indian',
        purposeOfVisit: guest.purposeOfVisit || '',
        vehicleNumber: guest.vehicleNumber || '',
        aadhaarNumber: guest.aadhaarNumber || '',
        remarks: guest.remarks || '',
        internalNotes: guest.internalNotes || '',
      });
    }
  }, [guest]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/guests/${id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      router.push(`/guests/${id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update guest details');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit Guest Record</h1>
          <p className="text-xs text-slate-500">Updating register details for {guest?.name}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="bg-white rounded-lg border border-slate-200 p-6 space-y-6 shadow-sm text-xs"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Guest Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
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
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
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
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Alternative Phone
            </label>
            <input
              type="tel"
              value={formData.altPhone}
              onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-700 mb-1">
              Aadhaar Number
            </label>
            <input
              type="text"
              maxLength={12}
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
