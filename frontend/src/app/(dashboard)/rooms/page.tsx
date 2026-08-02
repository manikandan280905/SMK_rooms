'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLodge } from '@/lib/lodge-context';
import { useToast } from '@/lib/toast-context';
import { StatusBadge } from '@/components/common/status-badge';
import { formatCurrency } from '@/lib/formatters';
import { ROOM_TYPES, ROOM_STATUSES } from '@/lib/constants';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Users,
  Building2,
  Wind,
  Thermometer,
} from 'lucide-react';

export default function RoomsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { lodges, selectedLodgeId, selectedLodge } = useLodge();
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    lodgeId: selectedLodgeId !== 'ALL' ? selectedLodgeId : lodges[0]?.id || '',
    roomNumber: '',
    roomType: 'DOUBLE',
    isAC: true,
    floor: 1,
    price: 1600,
    dailyPrice: 1600,
    monthlyPrice: 0,
    maxOccupancy: 2,
    extraGuestCharge: 200,
    status: 'AVAILABLE',
  });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms', filterStatus, selectedLodgeId],
    queryFn: async () => {
      const res = await api.get('/rooms', {
        params: {
          lodgeId: selectedLodgeId,
          status: filterStatus || undefined,
        },
      });
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, data);
      } else {
        await api.post('/rooms', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });
      showToast('success', editingRoom ? 'Room updated successfully' : 'Room added successfully');
      handleCloseModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save room details';
      setError(msg);
      showToast('error', 'Save Failed', msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Cannot delete room with active bookings');
    },
  });

  const statusQuickUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/rooms/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['availableRooms'] });
      showToast('success', `Room status updated to ${variables.status}`);
    },
    onError: (err: any) => {
      showToast('error', 'Failed to update room status', err.response?.data?.message || 'Unknown error');
    },
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      lodgeId: selectedLodgeId !== 'ALL' ? selectedLodgeId : lodges[0]?.id || '',
      roomNumber: '',
      roomType: 'DOUBLE',
      isAC: true,
      floor: 1,
      price: 1600,
      dailyPrice: 1600,
      monthlyPrice: 0,
      maxOccupancy: 2,
      extraGuestCharge: 200,
      status: 'AVAILABLE',
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (room: any) => {
    setEditingRoom(room);
    setFormData({
      lodgeId: room.lodgeId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      isAC: room.isAC,
      floor: room.floor,
      price: room.price,
      dailyPrice: room.dailyPrice || room.price,
      monthlyPrice: room.monthlyPrice || 0,
      maxOccupancy: room.maxOccupancy || 2,
      extraGuestCharge: room.extraGuestCharge || 0,
      status: room.status,
    });
    setError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Room Master Management {selectedLodgeId !== 'ALL' && `(${selectedLodge?.name})`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure room inventory, pricing rules, monthly rents, and status
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-md shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wider">
          Filter Status:
        </span>
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            filterStatus === ''
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          All Rooms
        </button>
        {ROOM_STATUSES.map((st) => (
          <button
            key={st.value}
            onClick={() => setFilterStatus(st.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === st.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400">
          No rooms found for this lodge selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map((room: any) => (
            <div
              key={room.id}
              className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {room.lodge?.name || 'Lodge'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">Room {room.roomNumber}</h3>
                  </div>
                  <StatusBadge status={room.status} />
                </div>

                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{room.roomType}</span>
                    {room.isAC ? (
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
                  <p className="text-slate-500">Floor {room.floor}</p>
                  <p className="text-slate-500 font-medium">
                    Max Occupancy: <span className="font-bold text-slate-800">{room.maxOccupancy} Guests</span>
                  </p>
                  {room.extraGuestCharge > 0 && (
                    <p className="text-slate-500">
                      Extra guest: <span className="font-semibold text-slate-800">{formatCurrency(room.extraGuestCharge)}/day</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pricing</span>
                  <span className="text-sm font-bold text-blue-700">
                    {room.roomType === 'MONTHLY'
                      ? `${formatCurrency(room.monthlyPrice || 0)}/mo`
                      : `${formatCurrency(room.dailyPrice || room.price)}/day`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={room.status}
                    onChange={(e) =>
                      statusQuickUpdateMutation.mutate({ id: room.id, status: e.target.value })
                    }
                    className="text-[11px] p-1 border border-slate-200 rounded bg-slate-50 font-medium"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RESERVED">Reserved</option>
                  </select>

                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded"
                    title="Edit Room Rules"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete Room ${room.roomNumber}?`)) {
                        deleteMutation.mutate(room.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingRoom ? `Configure Room ${editingRoom.roomNumber}` : 'Add New Room Master'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-xs text-rose-600 p-2 bg-rose-50 rounded">{error}</p>}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">
                  Assign Lodge *
                </label>
                <select
                  required
                  value={formData.lodgeId}
                  onChange={(e) => setFormData({ ...formData, lodgeId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold"
                >
                  {lodges.map((l) => (
                    <option key={l.id} value={l.id}>
                      🏨 {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. 101"
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Floor</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {formData.roomType === 'MONTHLY' ? (
                <div>
                  <label className="block font-semibold uppercase text-blue-800 mb-1">
                    Monthly Room Rent (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border border-blue-300 bg-blue-50 rounded-md font-bold text-blue-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Daily Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, price: val, dailyPrice: val });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Air Conditioning
                    </label>
                    <select
                      value={formData.isAC ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isAC: e.target.value === 'true' })}
                      className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="true">AC Room</option>
                      <option value="false">Non-AC Room</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Max Guest Occupancy *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.maxOccupancy}
                    onChange={(e) =>
                      setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) || 2 })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Extra Guest Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.extraGuestCharge}
                    onChange={(e) =>
                      setFormData({ ...formData, extraGuestCharge: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  {ROOM_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 rounded-md font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
