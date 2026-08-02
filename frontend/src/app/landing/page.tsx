'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/logo';
import {
  Building2,
  Wind,
  Thermometer,
  Wifi,
  ShieldCheck,
  Zap,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
  Star,
  ChevronRight,
  Lock,
  Car,
  Utensils,
  Search,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const [selectedLodge, setSelectedLodge] = useState('ALL');
  const [roomType, setRoomType] = useState('ALL');
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedLodgeName, setSelectedLodgeName] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    lodge: 'Lodge 1',
    roomCategory: 'AC Double Room',
    checkInDate: new Date().toISOString().slice(0, 10),
    guests: '2 Guests',
    notes: '',
  });

  const handleOpenInquiry = (lodgeName: string) => {
    setSelectedLodgeName(lodgeName);
    setInquiryForm((prev) => ({ ...prev, lodge: lodgeName }));
    setInquirySuccess(false);
    setInquiryModalOpen(true);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquiryModalOpen(false);
      setInquirySuccess(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* ─── 1. TOP ANNOUNCEMENT BAR ─────────────────────────── */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>Welcome to SMK Rooms — 3 Independent Lodges with Premium AC & Non-AC Rooms Available Today!</span>
        <span className="hidden md:inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
          Instant Check-in
        </span>
      </div>

      {/* ─── 2. HEADER / NAVIGATION ─────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/landing" className="hover:opacity-95 transition-opacity">
            <Logo size="md" variant="dark" subtitleText="Premium Lodges & Stays" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#lodges" className="hover:text-orange-400 transition-colors">
              Our Lodges
            </a>
            <a href="#rooms" className="hover:text-orange-400 transition-colors">
              Rooms & Tariff
            </a>
            <a href="#amenities" className="hover:text-orange-400 transition-colors">
              Amenities
            </a>
            <a href="#location" className="hover:text-orange-400 transition-colors">
              Location
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+918098997440"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 8098997440</span>
            </a>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 3. HERO SECTION ─────────────────────────────────── */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest shadow-inner">
            <Building2 className="w-4 h-4" />
            <span>3 Premium Lodges • 43 Luxury Rooms</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Experience Exceptional Comfort & Peaceful Stay at{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-md">
              SMK Rooms
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Whether you need an AC Deluxe room for a business trip or an economical stay for your family, SMK Rooms provides immaculate hygiene, 24/7 reception, and fast digital check-in across 3 independent lodges.
          </p>

          {/* Quick Search & Availability Widget */}
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-orange-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 text-left mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Instant Room Availability & Booking Inquiry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-left">
              <div>
                <label className="block font-semibold text-slate-400 uppercase mb-1">Select Lodge</label>
                <select
                  value={selectedLodge}
                  onChange={(e) => setSelectedLodge(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold focus:border-orange-500 focus:outline-none"
                >
                  <option value="ALL">🏨 All 3 Lodges</option>
                  <option value="Lodge 1">🏨 Lodge 1 (Business & Comfort)</option>
                  <option value="Lodge 2">🏨 Lodge 2 (Executive & Family)</option>
                  <option value="Lodge 3">🏨 Lodge 3 (Executive & Comfort)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase mb-1">Room Category</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold focus:border-orange-500 focus:outline-none"
                >
                  <option value="ALL">❄️ All Room Types</option>
                  <option value="AC">💨 AC Rooms (₹1,600/day)</option>
                  <option value="NON_AC">🌡 Non-AC Rooms (₹1,000/day)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase mb-1">Check-in Date</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleOpenInquiry(selectedLodge === 'ALL' ? 'Lodge 1' : selectedLodge)}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Inquire Room</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. LODGES SHOWCASE ──────────────────────────────── */}
      <section id="lodges" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
              3 Independent Locations
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-100">
              Choose From Our 3 Lodges
            </p>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              Each lodge is managed independently with dedicated staff, 24/7 reception, and clean rooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lodge 1 Card */}
            <div className="bg-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-6 space-y-6 shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-xl group-hover:scale-110 transition-transform">
                  1
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  15 Rooms Available
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                  🏨 Lodge 1 — Business & Comfort
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Ideal for business travelers, corporate guests, and couples seeking quiet Executive AC & Non-AC Double rooms.
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-orange-400" />
                  <span>AC Rooms: ₹1,600/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span>Non-AC Rooms: ₹1,000/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-orange-400" />
                  <span>High-Speed Gigabit Wi-Fi</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Room Tariff</span>
                  <span className="text-sm font-black text-orange-400">₹1,000 <span className="text-xs font-normal text-slate-400">(Non-AC)</span> / ₹1,600 <span className="text-xs font-normal text-slate-400">(AC)</span></span>
                </div>
                <button
                  onClick={() => handleOpenInquiry('Lodge 1')}
                  className="px-4 py-2 bg-slate-800 hover:bg-orange-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-lg transition-all"
                >
                  Book Lodge 1
                </button>
              </div>
            </div>

            {/* Lodge 2 Card */}
            <div className="bg-slate-950 border border-orange-500/40 rounded-2xl p-6 space-y-6 shadow-2xl relative transition-all duration-300 group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                MOST POPULAR CHOICE
              </div>

              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 font-black text-xl group-hover:scale-110 transition-transform">
                  2
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  17 Rooms Available
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                  🏨 Lodge 2 — Executive & Family
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Spacious family rooms and executive double rooms with extra guest capacity, perfect for family stays.
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-orange-400" />
                  <span>AC Rooms: ₹1,600/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span>Non-AC Rooms: ₹1,000/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-400" />
                  <span>Dedicated Vehicle Parking</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Room Tariff</span>
                  <span className="text-sm font-black text-orange-400">₹1,000 <span className="text-xs font-normal text-slate-400">(Non-AC)</span> / ₹1,600 <span className="text-xs font-normal text-slate-400">(AC)</span></span>
                </div>
                <button
                  onClick={() => handleOpenInquiry('Lodge 2')}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-extrabold text-xs rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
                >
                  Book Lodge 2
                </button>
              </div>
            </div>

            {/* Lodge 3 Card */}
            <div className="bg-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-6 space-y-6 shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-xl group-hover:scale-110 transition-transform">
                  3
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  11 Rooms Available
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                  🏨 Lodge 3 — Executive & Comfort
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Spotless AC & Non-AC double rooms offering high comfort, peaceful ambience, and 24/7 reception service.
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-orange-400" />
                  <span>AC Rooms: ₹1,600/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span>Non-AC Rooms: ₹1,000/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span>24/7 Power Backup & Wi-Fi</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Room Tariff</span>
                  <span className="text-sm font-black text-orange-400">₹1,000 <span className="text-xs font-normal text-slate-400">(Non-AC)</span> / ₹1,600 <span className="text-xs font-normal text-slate-400">(AC)</span></span>
                </div>
                <button
                  onClick={() => handleOpenInquiry('Lodge 3')}
                  className="px-4 py-2 bg-slate-800 hover:bg-orange-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-lg transition-all"
                >
                  Book Lodge 3
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. ROOM TYPES & TARIFF ──────────────────────────── */}
      <section id="rooms" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
              Clear & Transparent Pricing
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-100">
              Room Categories & Tariffs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                <Wind className="w-3.5 h-3.5" />
                Standard AC Room
              </div>
              <p className="text-2xl font-black text-white">₹1,600 <span className="text-xs font-normal text-slate-400">/ day</span></p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Air Conditioning</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Double Bed Accommodation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Max 2 Guests (+ Extra Guest option)</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold">
                <Thermometer className="w-3.5 h-3.5" />
                Standard Non-AC Room
              </div>
              <p className="text-2xl font-black text-white">₹1,000 <span className="text-xs font-normal text-slate-400">/ day</span></p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Well Ventilated Fan Room</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Double Bed Accommodation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Clean Linen & Towels</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Executive AC Room
              </div>
              <p className="text-2xl font-black text-white">₹1,600 <span className="text-xs font-normal text-slate-400">/ day</span></p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Executive AC Setup</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Work Desk & High-Speed Wi-Fi</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Max 2 Guests</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5" />
                Executive Non-AC Room
              </div>
              <p className="text-2xl font-black text-white">₹1,000 <span className="text-xs font-normal text-slate-400">/ day</span></p>
              <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Spacious Ventilated Room</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Housekeeping Included</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Premium Linen & Cleanliness</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. AMENITIES ───────────────────────────────────── */}
      <section id="amenities" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
              Why Guests Choose Us
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-100">
              Amenities & Facilities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col items-center">
              <Zap className="w-8 h-8 text-orange-400" />
              <h4 className="text-xs font-bold text-white">24/7 Power Backup</h4>
            </div>
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col items-center">
              <Wifi className="w-8 h-8 text-orange-400" />
              <h4 className="text-xs font-bold text-white">Gigabit Fiber Wi-Fi</h4>
            </div>
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 text-orange-400" />
              <h4 className="text-xs font-bold text-white">24/7 CCTV Security</h4>
            </div>
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col items-center">
              <Car className="w-8 h-8 text-orange-400" />
              <h4 className="text-xs font-bold text-white">Vehicle Parking</h4>
            </div>
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col items-center">
              <Clock className="w-8 h-8 text-orange-400" />
              <h4 className="text-xs font-bold text-white">24-Hour Reception</h4>
            </div>
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-orange-400" />
              <h4 className="text-xs font-bold text-white">Sanitized Linen</h4>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. CONTACT & LOCATION ──────────────────────────── */}
      <section id="location" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-400">
                Contact Front Desk
              </h2>
              <p className="text-3xl font-black text-white">
                Visit Or Contact Any Of Our 3 Lodges
              </p>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <Phone className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-sm">Phone Reception</span>
                    <span>+91 8098997440 • Available 24/7</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <Mail className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-sm">Email Inquiries</span>
                    <span>admin@smkrooms.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 text-center">
              <Building2 className="w-12 h-12 text-orange-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Need Staff & Admin Access?</h3>
              <p className="text-xs text-slate-400">
                Authorized receptionists and managers can sign in to the digital register workspace.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform"
              >
                <Lock className="w-4 h-4" />
                <span>Go to Staff Sign-In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. FOOTER ──────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="md" variant="dark" subtitleText="Digital Register & Stays" />

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SMK Rooms. All rights reserved. • Powered by SMK Rooms Digital Register
          </p>

          <Link href="/login" className="text-xs text-orange-400 hover:underline font-semibold">
            Admin Login →
          </Link>
        </div>
      </footer>

      {/* ─── INQUIRY MODAL ───────────────────────────────────── */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative text-slate-100">
            <button
              onClick={() => setInquiryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-2">
              Inquire Room at {inquiryForm.lodge}
            </h3>

            {inquirySuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center space-y-2 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold text-sm">Inquiry Received!</p>
                <p>Front desk will contact you at {inquiryForm.phone} shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    placeholder="Mobile Number"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Lodge</label>
                    <input
                      type="text"
                      disabled
                      value={inquiryForm.lodge}
                      className="w-full p-3 bg-slate-800/50 border border-slate-800 rounded-xl text-orange-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Room Category</label>
                    <select
                      value={inquiryForm.roomCategory}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, roomCategory: e.target.value })}
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="AC Room (₹1,600/day)">AC Room (₹1,600/day)</option>
                      <option value="Non-AC Room (₹1,000/day)">Non-AC Room (₹1,000/day)</option>
                      <option value="Executive AC Room (₹1,600/day)">Executive AC Room (₹1,600/day)</option>
                      <option value="Executive Non-AC Room (₹1,000/day)">Executive Non-AC Room (₹1,000/day)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase text-xs rounded-xl shadow-lg shadow-orange-500/20"
                >
                  Send Booking Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
