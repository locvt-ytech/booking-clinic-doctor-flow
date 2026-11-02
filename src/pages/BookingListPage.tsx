import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DoctorCard } from "../components/DoctorCard";
import { SlotsModal } from "../components/SlotsModal";
import { CloseIcon, SearchIcon } from "../components/Icons";
import { DOCTORS } from "../dummyData";
import { useStore } from "../store";
import type { AppointmentMode, BookingSelectedSlot, Doctor } from "../types";
import { DAY_NAMES } from "../utils";

export function BookingListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const clinicId = location.state?.clinicId as string | undefined;
  const clinicName = location.state?.clinicName as string | undefined;
  const initialMode = (location.state?.mode as AppointmentMode) || (clinicId ? "offline" : "online");

  const { appointments, setBookingDraft } = useStore();
  const [mode, setMode] = useState<AppointmentMode>(initialMode);
  const [search, setSearch] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(clinicId || null);
  const [selectedClinicName, setSelectedClinicName] = useState<string | null>(clinicName || null);
  const [selected, setSelected] = useState<{ doctorId: string; slot: BookingSelectedSlot } | null>(
    null
  );
  const [slotsDoctor, setSlotsDoctor] = useState<Doctor | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DOCTORS.filter((d) => {
      if (selectedClinicId && d.clinicId && d.clinicId !== selectedClinicId) {
        return false;
      }
      return (
        !q ||
        d.fullname.toLowerCase().includes(q) ||
        d.publicId.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.clinicName.toLowerCase().includes(q)
      );
    });
  }, [search, selectedClinicId]);

  const startBooking = (doctor: Doctor, slot: BookingSelectedSlot | null) => {
    setBookingDraft({
      doctorId: doctor.id,
      mode,
      selectedSlot: slot,
    });
    navigate(`/booking/new-appointment/${doctor.id}`, {
      state: { doctorId: doctor.id, mode, selectedSlot: slot },
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* Mode Tabs */}
      <div className="flex h-11 shrink-0 items-start gap-5 border-b border-brand-11">
        {(
          [
            { value: "online", label: "Online" },
            { value: "offline", label: "At Clinic / Hospital" },
          ] as const
        ).map((tab) => {
          const isActive = mode === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setMode(tab.value);
                setSelected(null);
              }}
              className={`flex h-11 flex-col items-center justify-between pt-4 cursor-pointer ${
                isActive ? "text-brand-7" : "text-dark-main hover:text-brand-7"
              }`}
            >
              <span className="text-sm font-semibold capitalize">{tab.label}</span>
              <span
                className={`h-0.5 w-full rounded-full transition-all ${
                  isActive ? "bg-brand-7" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Main List Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="px-2.5 text-sm font-semibold text-dark-main">Our specialists</p>
            {selectedClinicName && (
              <div className="flex items-center gap-1.5 rounded-full border border-brand-7 bg-brand-05 px-3 py-1 text-xs font-medium text-brand-7">
                <span>Clinic: {selectedClinicName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClinicId(null);
                    setSelectedClinicName(null);
                  }}
                  className="hover:text-dark-main cursor-pointer"
                  title="Clear clinic filter"
                >
                  <CloseIcon className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex h-11 w-full max-w-[300px] items-center gap-2 rounded-full border-[1.5px] border-[#ededed] bg-[#fafafa] px-[18px]">
            <SearchIcon className="size-[18px] shrink-0 text-notes" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-dark-main outline-none placeholder:text-neutral-400"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-3 pb-2">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-400">
                No specialists match your search.
              </div>
            ) : (
              filtered.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  mode={mode}
                  selectedSlot={selected?.doctorId === doctor.id ? selected.slot : null}
                  bookedAppointments={appointments.filter((a) => a.doctorId === doctor.id)}
                  onViewProfile={() =>
                    navigate(`/booking/doctor/${doctor.id}`, { state: { mode } })
                  }
                  onSelectSlot={(doc, slot) => setSelected({ doctorId: doc.id, slot })}
                  onBook={(doc, slot) => startBooking(doc, slot)}
                  onSeeAll={(doc) => setSlotsDoctor(doc)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slots Modal */}
      {slotsDoctor ? (
        <SlotsModal
          doctor={slotsDoctor}
          mode={mode}
          bookedAppointments={appointments.filter((a) => a.doctorId === slotsDoctor.id)}
          onClose={() => setSlotsDoctor(null)}
          onPick={(date, slot) => {
            const picked: BookingSelectedSlot = {
              day: DAY_NAMES[date.getDay()],
              slot,
              date: date.toISOString(),
            };
            startBooking(slotsDoctor, picked);
            setSlotsDoctor(null);
          }}
        />
      ) : null}
    </div>
  );
}
