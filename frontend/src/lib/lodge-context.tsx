'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from './api';
import { useAuth } from './auth-context';

export interface Lodge {
  id: string;
  name: string;
  address: string | null;
}

interface LodgeContextType {
  lodges: Lodge[];
  selectedLodgeId: string;
  selectedLodge: Lodge | null;
  setSelectedLodgeId: (id: string) => void;
  isLoading: boolean;
}

const LodgeContext = createContext<LodgeContextType | undefined>(undefined);

export function LodgeProvider({ children }: { children: React.ReactNode }) {
  const { admin } = useAuth(); // Only fetch lodges when authenticated
  const [selectedLodgeId, setSelectedLodgeIdState] = useState<string>('ALL');

  const { data: lodges = [], isLoading } = useQuery({
    queryKey: ['lodges'],
    queryFn: async () => {
      const res = await api.get('/lodges');
      return res.data.data as Lodge[];
    },
    enabled: !!admin, // Only run when admin is authenticated
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedLodgeId');
      if (saved) {
        setSelectedLodgeIdState(saved);
      }
    }
  }, []);

  const setSelectedLodgeId = (id: string) => {
    setSelectedLodgeIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLodgeId', id);
    }
  };

  const selectedLodge = lodges.find((l) => l.id === selectedLodgeId) || null;

  return (
    <LodgeContext.Provider
      value={{
        lodges,
        selectedLodgeId,
        selectedLodge,
        setSelectedLodgeId,
        isLoading,
      }}
    >
      {children}
    </LodgeContext.Provider>
  );
}

export function useLodge() {
  const context = useContext(LodgeContext);
  if (!context) {
    throw new Error('useLodge must be used within a LodgeProvider');
  }
  return context;
}
