'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import type { TimeSlot } from '@/lib/google-calendar';

interface RexCalendarPickerProps {
  locale?: string;
  onBookingSuccess?: (booking: {
    name: string;
    dateDisplay: string;
    timeDisplay: string;
    calendarLink?: string;
  }) => void;
}

export function RexCalendarPicker({
  locale = 'es',
  onBookingSuccess,
}: RexCalendarPickerProps) {
  // Generate the next 5 business days
  const [candidateDates] = useState(() => {
    const dates: { dateStr: string; label: string }[] = [];
    const now = new Date();
    let current = new Date(now);

    while (dates.length < 5) {
      current.setDate(current.getDate() + 1);
      const dayOfWeek = current.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        const label = current.toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'es-CO', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        dates.push({ dateStr, label });
      }
    }
    return dates;
  });

  const [selectedDate, setSelectedDate] = useState<string>(candidateDates[0]?.dateStr || '');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    let isCancelled = false;

    async function loadSlots() {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      setErrorMsg('');

      try {
        const res = await fetch(`/api/calendar?action=slots&date=${selectedDate}`);
        const data = await res.json();
        if (!isCancelled) {
          if (data.ok && Array.isArray(data.slots)) {
            setSlots(data.slots);
          } else {
            setSlots([]);
          }
        }
      } catch {
        if (!isCancelled) setSlots([]);
      } finally {
        if (!isCancelled) setIsLoadingSlots(false);
      }
    }

    loadSlots();
    return () => {
      isCancelled = true;
    };
  }, [selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !selectedSlot) {
      setErrorMsg('Por favor completa tu nombre, correo y selecciona una hora.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'book',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          notes: 'Agendado mediante Rex Calendar Widget',
        }),
      });

      const data = await res.json();
      if (data.ok && data.booking) {
        setBookingSuccess(data.booking);
        if (onBookingSuccess) {
          onBookingSuccess({
            name,
            dateDisplay: candidateDates.find((d) => d.dateStr === selectedDate)?.label || selectedDate,
            timeDisplay: selectedSlot.display,
            calendarLink: data.booking.calendarLink,
          });
        }
      } else {
        setErrorMsg(data.error || 'Hubo un error al agendar la cita. Inténtalo de nuevo.');
      }
    } catch {
      setErrorMsg('Error de conexión al agendar. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="rounded-2xl p-4 bg-emerald-950/60 border border-emerald-500/40 text-white space-y-2.5 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Cita confirmada en Google Calendar! 🎉</span>
        </div>
        <p className="text-[11px] text-[#F8F5F4]/80 leading-relaxed">
          Te enviamos la invitación a <strong>{email}</strong> con los detalles y el acceso a la reunión.
        </p>
        {bookingSuccess.calendarLink && (
          <a
            href={bookingSuccess.calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-emerald-300 font-medium transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            Ver en Google Calendar
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-3.5 bg-white border border-[#1E1810]/10 text-[#1E1810] shadow-xs space-y-3 text-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#1E1810]/8">
        <div className="flex items-center gap-1.5 font-bold text-[#f96e03]">
          <Calendar className="w-3.5 h-3.5" />
          <span>Agendar Sesión Técnica (30 min)</span>
        </div>
        <span className="text-[10px] text-[#575250] font-medium">Google Calendar</span>
      </div>

      {/* Date selector tabs */}
      <div>
        <p className="text-[10px] text-[#575250] mb-1.5 font-medium">Elige el día:</p>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {candidateDates.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => setSelectedDate(item.dateStr)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#f96e03] text-[#1E1810] shadow-xs'
                    : 'bg-[#F8F5F4] hover:bg-[#f96e03]/10 text-[#1E1810]/80 border border-[#1E1810]/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots picker */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-[#575250] font-medium">Horarios disponibles (Bogotá UTC-5):</p>
          {isLoadingSlots && <Loader2 className="w-3 h-3 animate-spin text-[#f96e03]" />}
        </div>

        {isLoadingSlots ? (
          <div className="py-4 text-center text-[#575250]/60 text-[11px]">
            Consultando Google Calendar en tiempo real...
          </div>
        ) : slots.length === 0 ? (
          <div className="py-3 text-center text-[#575250]/60 text-[11px]">
            No hay horarios libres para este día. Elige otra fecha.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {slots.map((slot, idx) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-[#f96e03] text-white shadow-xs'
                      : 'bg-[#F8F5F4] hover:bg-[#1E1810]/8 text-[#1E1810] border border-[#1E1810]/8'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5 opacity-70" />
                  {slot.display}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Form if slot selected */}
      {selectedSlot && (
        <form onSubmit={handleBook} className="pt-2 border-t border-[#1E1810]/8 space-y-2 animate-in fade-in duration-200">
          <div className="text-[11px] text-[#f96e03] font-bold">
            Seleccionado: {selectedSlot.display}
          </div>

          <input
            type="text"
            required
            placeholder="Tu nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#F8F5F4] border border-[#1E1810]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#1E1810] placeholder-[#575250]/60 focus:border-[#f96e03] focus:outline-none"
          />

          <input
            type="email"
            required
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#F8F5F4] border border-[#1E1810]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#1E1810] placeholder-[#575250]/60 focus:border-[#f96e03] focus:outline-none"
          />

          <input
            type="tel"
            placeholder="WhatsApp (opcional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#F8F5F4] border border-[#1E1810]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#1E1810] placeholder-[#575250]/60 focus:border-[#f96e03] focus:outline-none"
          />

          {errorMsg && <p className="text-[10px] text-rose-600 font-medium">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] disabled:bg-[#f96e03]/30 text-[#1E1810] font-bold text-xs shadow-md shadow-[#f96e03]/25 transition-all flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Agendando en Google Calendar...
              </>
            ) : (
              'Confirmar Cita en Google Calendar'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
