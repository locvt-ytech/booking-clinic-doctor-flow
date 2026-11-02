import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DoctorInfoView } from "../components/DoctorInfoView";
import { ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon } from "../components/Icons";
import { getDoctor, useStore } from "../store";
import type { AppointmentMode } from "../types";

export function DoctorDetailPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setBookingDraft, appointments } = useStore();
  const mode = ((location.state as { mode?: AppointmentMode } | null)?.mode ?? "offline") as AppointmentMode;
  const doctor = doctorId ? getDoctor(doctorId) : null;
  const [tab, setTab] = useState<"details" | "appointments">("details");

  const [expandConditions, setExpandConditions] = useState(true);
  const [expandExperience, setExpandExperience] = useState(true);
  const [expandAwards, setExpandAwards] = useState(true);
  const [expandLanguages, setExpandLanguages] = useState(true);
  const [expandLocation, setExpandLocation] = useState(true);

  if (!doctor) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-white p-8 text-sm text-neutral-400">
        Doctor not found.
      </div>
    );
  }

  const handleBookAppointment = () => {
    setBookingDraft({ doctorId: doctor.id, mode, selectedSlot: null });
    navigate(`/booking/new-appointment/${doctor.id}`, {
      state: { doctorId: doctor.id, mode, selectedSlot: null },
    });
  };

  const doctorAppointments = appointments.filter((a) => a.doctorId === doctor.id);

  const tagClass =
    "rounded-[20px] border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase text-notes";

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* Back button */}
      <div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-medium text-notes hover:text-brand-7 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon className="size-4" /> Back to specialists
        </button>
      </div>

      {/* Tabs and Actions bar */}
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-2 shrink-0 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          {(
            [
              { key: "details", label: "Details" },
              { key: "appointments", label: "Appointments" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                tab === item.key
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center xl:w-auto xl:shrink-0 xl:justify-end">
          <button
            type="button"
            className="w-full border border-teal-600 text-teal-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors sm:w-auto"
          >
            Buy Proactive M.
          </button>
          <button
            type="button"
            onClick={handleBookAppointment}
            className="flex w-full items-center justify-center gap-1 rounded-xl bg-brand-7 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 cursor-pointer sm:w-auto"
          >
            Booking Appointment
          </button>
        </div>
      </div>

      {/* Main Grid: Content + Sidebar */}
      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[1fr_300px]">
        {/* Main section */}
        <div className="min-h-0 overflow-y-auto no-scrollbar pr-0 xl:pr-2">
          {tab === "details" ? (
            <div className="flex flex-col gap-4 pb-4">
              {/* Treatment of conditions */}
              <section className="section-card border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandConditions((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-semibold text-sm text-gray-800">Specialist consultation</p>
                  {expandConditions ? (
                    <ChevronUpIcon className="size-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="size-4 text-gray-500" />
                  )}
                </button>
                {expandConditions && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {doctor.conditions.map((c) => (
                        <span key={c} className={tagClass}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Experience and certificates */}
              <section className="section-card border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandExperience((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-semibold text-sm text-gray-800">Experience and certificates</p>
                  {expandExperience ? (
                    <ChevronUpIcon className="size-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="size-4 text-gray-500" />
                  )}
                </button>
                {expandExperience && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    {doctor.experiences.map((exp) => (
                      <div key={exp.facility} className="text-sm">
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>{exp.position}</span>
                          <span>
                            {exp.fromYear} - {exp.toYear ?? "now"}
                          </span>
                        </div>
                        <p className="font-semibold text-dark-main mt-0.5">{exp.facility}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Awards and Recognitions */}
              <section className="section-card border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandAwards((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-semibold text-sm text-gray-800">Awards and Recognitions</p>
                  {expandAwards ? (
                    <ChevronUpIcon className="size-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="size-4 text-gray-500" />
                  )}
                </button>
                {expandAwards && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 text-sm text-notes">
                    <p>• Excellent Physician of the Year 2023</p>
                    <p className="mt-1">• Recognized Member of Vietnam Cardiovascular Association</p>
                  </div>
                )}
              </section>

              {/* Languages */}
              <section className="section-card border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandLanguages((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-semibold text-sm text-gray-800">Languages</p>
                  {expandLanguages ? (
                    <ChevronUpIcon className="size-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="size-4 text-gray-500" />
                  )}
                </button>
                {expandLanguages && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((l) => (
                        <span key={l} className={tagClass}>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Location */}
              <section className="section-card border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandLocation((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-semibold text-sm text-gray-800">Location</p>
                  {expandLocation ? (
                    <ChevronUpIcon className="size-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="size-4 text-gray-500" />
                  )}
                </button>
                {expandLocation && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 text-sm text-notes">
                    <p className="font-semibold text-dark-main">{doctor.clinicName}</p>
                    <p className="mt-0.5">{doctor.province}, Vietnam</p>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-dark-main mb-4">
                Appointment History with {doctor.fullname}
              </p>
              {doctorAppointments.length === 0 ? (
                <p className="text-sm text-neutral-400">No previous appointments found.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {doctorAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-dark-main">{apt.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {new Date(apt.start).toLocaleString("en-GB")} · {apt.type}
                        </p>
                      </div>
                      <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded-full bg-brand-05 text-brand-7">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Info Sidebar */}
        <DoctorInfoView doctor={doctor} mode={mode} />
      </div>
    </div>
  );
}
