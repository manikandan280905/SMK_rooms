'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Settings, Save, Loader2, CheckCircle2, Building, Receipt, Clock } from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    hotel_name: 'SMK Rooms',
    hotel_address: 'Main Street, City Center',
    hotel_phone: '+91 9876543210',
    hotel_email: 'info@smkrooms.com',
    gst_number: '29ABCDE1234F1Z5',
    gst_rate: '12',
    default_checkout_time: '11:00',
    currency: 'INR',
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
      }));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/settings', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save settings');
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
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Hotel System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure hotel business details, tax rates, and checkout policies
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-6"
      >
        {/* Hotel Identity */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-700 font-bold text-sm">
            <Building className="w-5 h-5" />
            <span>1. Hotel Profile & Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Hotel / Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.hotel_name}
                onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.hotel_phone}
                onChange={(e) => setFormData({ ...formData, hotel_phone: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Full Address
              </label>
              <input
                type="text"
                value={formData.hotel_address}
                onChange={(e) => setFormData({ ...formData, hotel_address: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.hotel_email}
                onChange={(e) => setFormData({ ...formData, hotel_email: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* GST & Taxation */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-700 font-bold text-sm">
            <Receipt className="w-5 h-5" />
            <span>2. Taxation & GST Configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                placeholder="15-digit GSTIN"
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                GST Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={formData.gst_rate}
                onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Policy */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-blue-700 font-bold text-sm">
            <Clock className="w-5 h-5" />
            <span>3. Check-out Policy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-slate-700 mb-1">
                Default Standard Checkout Time
              </label>
              <input
                type="time"
                value={formData.default_checkout_time}
                onChange={(e) =>
                  setFormData({ ...formData, default_checkout_time: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
