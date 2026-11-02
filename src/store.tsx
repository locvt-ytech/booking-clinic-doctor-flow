import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DOCTORS, FAMILY, seedAppointments } from "./dummyData";
import type { Appointment, BookingDraft } from "./types";

const STORAGE_KEY = "calendar-booking-demo.appointments";

function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Appointment[];
  } catch {
    /* ignore */
  }
  return seedAppointments();
}

type Store = {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
  bookingDraft: BookingDraft | null;
  setBookingDraft: (draft: BookingDraft | null) => void;
  toast: string | null;
  setToast: (message: string | null) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const value = useMemo<Store>(
    () => ({
      appointments,
      addAppointment: (appointment) => {
        setAppointments((prev) => {
          const next = [appointment, ...prev];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
      cancelAppointment: (id) => {
        setAppointments((prev) => {
          const next = prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
      bookingDraft,
      setBookingDraft,
      toast,
      setToast,
    }),
    [appointments, bookingDraft, toast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function getDoctor(id: string) {
  return DOCTORS.find((d) => d.id === id) ?? null;
}

export function getFamilyMember(id: string) {
  return FAMILY.find((m) => m.id === id) ?? FAMILY[0];
}
