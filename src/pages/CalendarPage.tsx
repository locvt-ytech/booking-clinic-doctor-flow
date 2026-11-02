import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type FullCalendar from "@fullcalendar/react";
import { Button } from "../components/Button";
import { CalendarView, EventDetailModal } from "../components/CalendarView";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../components/Icons";
import { useStore } from "../store";
import type { Appointment, AppointmentStatus } from "../types";
import { formatDateRange } from "../utils";

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "pending", label: "Pending" },
  { value: "awaiting_report", label: "Awaiting report" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const VIEW_OPTIONS = [
  { value: "timeGridDay", label: "Day" },
  { value: "timeGridWeek", label: "Week" },
  { value: "dayGridMonth", label: "Month" },
];

export function CalendarPage() {
  const navigate = useNavigate();
  const { appointments, cancelAppointment } = useStore();
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState("dayGridMonth");
  const [title, setTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus[]>([
    "upcoming",
    "pending",
    "awaiting_report",
  ]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (statusFilter.length === 0) return appointments;
    return appointments.filter((a) => statusFilter.includes(a.status));
  }, [appointments, statusFilter]);

  const refreshTitle = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const start = api.view.currentStart;
    const end = new Date(api.view.currentEnd.getTime() - 1);
    setView(api.view.type);
    setTitle(formatDateRange(start, end, api.view.type));
  };

  useEffect(() => {
    refreshTitle();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-2xl">
      {/* Calendar Header matching FE gốc */}
      <div className="mb-3 flex w-full min-w-0 flex-col gap-3 sm:mb-4 lg:flex-row lg:items-center lg:justify-between shrink-0">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            className="shrink-0 px-3 text-sm sm:px-4"
            onClick={() => {
              calendarRef.current?.getApi().today();
              refreshTitle();
            }}
          >
            Today
          </Button>

          <div
            className="shrink-0 cursor-pointer rounded-full p-1.5 hover:bg-gray-200 sm:p-2"
            onClick={() => {
              calendarRef.current?.getApi().prev();
              refreshTitle();
            }}
          >
            <ChevronLeftIcon className="size-4 text-brand-7" />
          </div>

          <span className="min-w-0 flex-1 truncate text-sm font-semibold sm:flex-none sm:text-base text-gray-800">
            {title || "My Calendar"}
          </span>

          <div
            className="shrink-0 cursor-pointer rounded-full p-1.5 hover:bg-gray-200 sm:p-2"
            onClick={() => {
              calendarRef.current?.getApi().next();
              refreshTitle();
            }}
          >
            <ChevronRightIcon className="size-4 text-brand-7" />
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:justify-end lg:w-auto">
          {/* Status Filter */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded-full border border-brand-7 bg-white px-4 text-sm font-medium text-brand-7 hover:bg-brand-05 cursor-pointer"
              onClick={() => setFilterOpen((v) => !v)}
            >
              <span>Status ({statusFilter.length})</span>
              <ChevronDownIcon
                className={`size-4 transition-transform ${filterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {filterOpen && (
              <div className="absolute right-0 z-30 mt-1 w-56 rounded-2xl border border-brand-11 bg-white p-3 shadow-theme-md">
                <div className="mb-2 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-dark-main">Filter by status</span>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-brand-7 hover:underline cursor-pointer"
                    onClick={() => setStatusFilter(["upcoming", "pending", "awaiting_report"])}
                  >
                    Reset
                  </button>
                </div>
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2.5 py-1.5 px-1 text-xs font-medium text-dark-main hover:bg-brand-05 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(opt.value)}
                      onChange={() =>
                        setStatusFilter((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((s) => s !== opt.value)
                            : [...prev, opt.value]
                        )
                      }
                      className="size-4 accent-brand-7 rounded cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Select */}
          <select
            className="h-10 rounded-full border border-brand-7 bg-white px-4 text-sm font-medium text-brand-7 outline-none cursor-pointer"
            value={view}
            onChange={(e) => {
              calendarRef.current?.getApi().changeView(e.target.value);
              setView(e.target.value);
              refreshTitle();
            }}
          >
            {VIEW_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Book Appointment CTA */}
          <Button
            variant="primary"
            className="h-10 w-full shrink-0 px-4 text-sm font-medium sm:w-auto"
            endIcon={<CalendarDaysIcon className="size-4 shrink-0" />}
            onClick={() => navigate("/booking")}
          >
            <span className="truncate">Book Appointment</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="min-h-0 min-w-0 w-full flex-1">
        <CalendarView calendarRef={calendarRef} events={filtered} onSelect={setSelected} />
      </div>

      {/* Event Details Popup */}
      {selected && (
        <EventDetailModal
          event={selected}
          onClose={() => setSelected(null)}
          onCancel={cancelAppointment}
        />
      )}
    </div>
  );
}
