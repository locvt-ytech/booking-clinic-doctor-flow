import { useEffect, useRef, useState, type RefObject } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import type { Appointment } from "../types";
import { getDoctor } from "../store";
import { formatHm } from "../utils";
import { useSidebar } from "./SidebarContext";
import { CloseIcon, HospitalIcon } from "./Icons";

type Props = {
  calendarRef: RefObject<FullCalendar | null>;
  events: Appointment[];
  onSelect: (event: Appointment) => void;
};

export function CalendarView({ calendarRef, events, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCalendarSize = () => {
      calendarRef.current?.getApi()?.updateSize();
    };

    const observer = new ResizeObserver(() => {
      updateCalendarSize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [calendarRef]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    api?.updateSize();

    const t1 = window.setTimeout(() => {
      calendarRef.current?.getApi()?.updateSize();
    }, 150);

    const t2 = window.setTimeout(() => {
      calendarRef.current?.getApi()?.updateSize();
    }, 320);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isExpanded, isHovered, isMobileOpen, calendarRef]);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    extendedProps: { status: e.status, type: e.type, metadata: e },
  }));

  return (
    <div
      ref={containerRef}
      className="custom-calendar h-full min-h-0 w-full overflow-hidden rounded-2xl bg-white shadow-theme-xs"
    >
      <FullCalendar
        ref={calendarRef}
        height="100%"
        contentHeight="100%"
        expandRows
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        nowIndicator
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="19:00:00"
        slotDuration="00:30:00"
        firstDay={1}
        dayMaxEvents={3}
        events={fcEvents}
        eventClick={(info: EventClickArg) => {
          onSelect(info.event.extendedProps.metadata as Appointment);
        }}
        eventContent={renderEventContent}
        moreLinkContent={(args) => `+${args.num} more`}
      />
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  const event = eventInfo.event.extendedProps.metadata as Appointment;
  const doctor = getDoctor(event.doctorId);
  const status = event.status;
  const timeLabel = eventInfo.event.start
    ? `${formatHm(eventInfo.event.start)}${
        eventInfo.event.end ? ` - ${formatHm(eventInfo.event.end)}` : ""
      }`
    : "";

  return (
    <div className={`event-fc-color fc-event-${status}`}>
      <div className="text-[11px] font-medium text-gray-500">{timeLabel}</div>
      <div className="truncate text-xs font-semibold text-dark-main">
        {doctor?.fullname ?? event.title}
      </div>
    </div>
  );
}

export function EventDetailModal({
  event,
  onClose,
  onCancel,
}: {
  event: Appointment;
  onClose: () => void;
  onCancel: (id: string) => void;
}) {
  const doctor = getDoctor(event.doctorId);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    setConfirm(false);
  }, [event.id]);

  const statusThemeClass = `event-popup-theme-${event.status}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-theme-lg flex flex-col ${statusThemeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="event-popup-type-icon">
                <HospitalIcon className="size-4 text-white" />
              </div>
              <span className="event-popup-status-badge">
                {event.status.replace("_", " ")}
              </span>
            </div>
            <button
              type="button"
              className="rounded-full p-1.5 hover:bg-black/5 text-gray-500 cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {event.title}
            </h3>
            <p className="mt-1 text-xs font-semibold text-red-secondary-600">
              {new Date(event.start).toLocaleDateString("en-GB", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              · {formatHm(new Date(event.start))} - {formatHm(new Date(event.end))}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white px-5 py-4 border-t border-gray-100 flex flex-col gap-4 text-sm max-h-[60vh] overflow-y-auto no-scrollbar">
          {/* Patient */}
          <div className="border-b border-gray-100 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Patient
            </p>
            <p className="font-semibold text-dark-main">{event.patientName}</p>
            <p className="text-xs text-notes mt-0.5">{event.patientId}</p>
          </div>

          {/* Doctor */}
          <div className="border-b border-gray-100 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Doctor
            </p>
            <div className="flex items-center gap-3">
              {doctor?.avatar ? (
                <img
                  src={doctor.avatar}
                  alt={doctor.fullname}
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-brand-05 text-sm font-bold text-brand-7">
                  {doctor?.fullname.charAt(0) ?? "D"}
                </div>
              )}
              <div>
                <p className="font-semibold text-dark-main">{doctor?.fullname}</p>
                <p className="text-xs text-notes">
                  {doctor?.specialty} · {doctor?.clinicName}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            <div>
              <p className="text-xs font-semibold text-dark-main">Reason</p>
              <p className="text-xs text-notes mt-0.5">{event.reason || "—"}</p>
            </div>
            {event.details && (
              <div>
                <p className="text-xs font-semibold text-dark-main">Details</p>
                <p className="text-xs text-notes mt-0.5">{event.details}</p>
              </div>
            )}
            {event.symptomsOnset && (
              <div>
                <p className="text-xs font-semibold text-dark-main">Symptoms Onset</p>
                <p className="text-xs text-notes mt-0.5">{event.symptomsOnset}</p>
              </div>
            )}
            {event.symptomsSeverity && (
              <div>
                <p className="text-xs font-semibold text-dark-main">Severity</p>
                <p className="text-xs text-notes mt-0.5 capitalize">{event.symptomsSeverity}</p>
              </div>
            )}
            {event.medication && (
              <div>
                <p className="text-xs font-semibold text-dark-main">Medications</p>
                <p className="text-xs text-notes mt-0.5">{event.medication}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {event.status !== "cancelled" && event.status !== "completed" ? (
          <div className="bg-white px-5 py-3 border-t border-gray-100 flex justify-end gap-2 shrink-0">
            {confirm ? (
              <>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold text-notes hover:text-dark-main cursor-pointer"
                  onClick={() => setConfirm(false)}
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  className="rounded-full bg-red-secondary-600 px-4 py-1.5 text-xs font-semibold text-white cursor-pointer hover:bg-red-700"
                  onClick={() => {
                    onCancel(event.id);
                    onClose();
                  }}
                >
                  Confirm Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="rounded-full border border-red-secondary-600 px-4 py-1.5 text-xs font-semibold text-red-secondary-600 hover:bg-red-secondary-600/5 cursor-pointer"
                onClick={() => setConfirm(true)}
              >
                Cancel Appointment
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
