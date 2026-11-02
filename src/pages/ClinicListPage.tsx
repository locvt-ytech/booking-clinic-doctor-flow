import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CLINICS } from "../dummyData";
import type { Clinic } from "../types";
import { formatVnd } from "../utils";
import {
  CalendarIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FilterAdjustIcon,
  InfoIcon,
  SearchIcon,
  StarIcon,
} from "../components/Icons";

export function ClinicListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"online" | "clinic">("clinic");
  const [search, setSearch] = useState("");
  const [selectedSort, setSelectedSort] = useState("Most Relevant");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const tabs = [
    { value: "online", label: "Online" },
    { value: "clinic", label: "At Clinic / Hospital" },
  ] as const;

  const filteredClinics = useMemo(() => {
    return CLINICS.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [search]);

  const handleSelectClinic = (clinic: Clinic) => {
    navigate("/booking/doctors", {
      state: {
        clinicId: clinic.id,
        clinicName: clinic.name,
        mode: "offline",
      },
    });
  };

  const handleTabChange = (tab: "online" | "clinic") => {
    setActiveTab(tab);
    if (tab === "online") {
      navigate("/booking/doctors", { state: { mode: "online" } });
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* Mode Tabs */}
      <div className="flex h-11 shrink-0 items-start gap-6 border-b border-brand-11">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`flex h-11 flex-col items-center justify-between pt-4 cursor-pointer transition-colors ${
                isActive ? "text-brand-7 font-bold" : "text-dark-main font-semibold hover:text-brand-7"
              }`}
            >
              <span className="text-sm capitalize">{tab.label}</span>
              <span
                className={`h-0.5 w-full rounded-full transition-all ${
                  isActive ? "bg-brand-7" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white p-5 sm:p-6 shadow-sm">
        {/* Title */}
        <p className="text-sm font-bold text-dark-main">Our Specialists</p>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* Filter Pills Left */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Most Relevant */}
            <div className="relative">
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-full border border-brand-11 bg-[#fafafa] px-3.5 text-xs font-medium text-dark-main hover:border-brand-7 cursor-pointer"
              >
                <span>{selectedSort}</span>
                <ChevronDownIcon className="size-3.5 text-notes" />
              </button>
            </div>

            {/* Clinic / Hospital */}
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-full border border-brand-11 bg-[#fafafa] px-3.5 text-xs font-medium text-dark-main hover:border-brand-7 cursor-pointer"
            >
              <span>Clinic/Hospital</span>
              <ChevronDownIcon className="size-3.5 text-notes" />
            </button>

            {/* Condition */}
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-full border border-brand-11 bg-[#fafafa] px-3.5 text-xs font-medium text-dark-main hover:border-brand-7 cursor-pointer"
            >
              <span>Condition</span>
              <ChevronDownIcon className="size-3.5 text-notes" />
            </button>

            {/* Profile badge */}
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-full border border-brand-11 bg-[#fafafa] px-3.5 text-xs font-medium text-dark-main hover:border-brand-7 cursor-pointer"
            >
              <span>Profile badge</span>
              <ChevronDownIcon className="size-3.5 text-notes" />
            </button>

            {/* Clear All Filter */}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedSort("Most Relevant");
                setSelectedCondition("");
              }}
              className="px-2 text-xs font-semibold text-notes hover:text-dark-main cursor-pointer"
            >
              Clear All Filter
            </button>
          </div>

          {/* Right: Search & All Filters */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-[180px] sm:w-[220px] items-center gap-2 rounded-full border border-brand-11 bg-[#fafafa] px-3 text-xs">
              <SearchIcon className="size-3.5 shrink-0 text-notes" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clinic or city..."
                className="w-full bg-transparent outline-none placeholder:text-neutral-400 font-medium text-dark-main"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-brand-11 bg-[#fafafa] px-3.5 text-xs font-medium text-dark-main hover:border-brand-7 cursor-pointer"
            >
              <FilterAdjustIcon className="size-3.5 text-notes" />
              <span>All Filters</span>
            </button>
          </div>
        </div>

        {/* Clinics Grid */}
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto no-scrollbar">
          {filteredClinics.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">
              No hospitals or clinics found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 pb-4">
              {filteredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  onClick={() => handleSelectClinic(clinic)}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-11 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-7 hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Top Section */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3.5">
                      {/* Logo / Badge */}
                      <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-brand-11 bg-brand-05">
                        {clinic.logo ? (
                          <img
                            src={clinic.logo}
                            alt={clinic.name}
                            className="size-full object-contain p-1.5"
                          />
                        ) : (
                          <div
                            className="flex size-full items-center justify-center font-bold text-sm tracking-wider"
                            style={{
                              backgroundColor: clinic.badgeBg || "#e0f2fe",
                              color: clinic.badgeText || "#0369a1",
                            }}
                          >
                            {clinic.shortName || clinic.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info Details */}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h2 className="truncate text-sm sm:text-base font-bold text-dark-main group-hover:text-brand-7 transition-colors">
                          {clinic.name}
                        </h2>

                        <p className="text-xs font-medium text-neutral-400">
                          {clinic.operatingHours}
                        </p>

                        <p className="truncate text-xs font-medium text-neutral-400">
                          {clinic.city} · {clinic.distance}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs">
                          <StarIcon className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          <span className="font-bold text-neutral-700">
                            {clinic.rating.toFixed(1)}
                          </span>
                          <span className="text-neutral-400">({clinic.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Calendar CTA Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectClinic(clinic);
                      }}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-7 text-white hover:bg-brand-8 transition-colors cursor-pointer shadow-xs"
                      title="Book appointment at this clinic"
                    >
                      <CalendarIcon className="size-5" />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="my-3.5 border-t border-[#f0f0f0]" />

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-dark-main">
                      <span>{formatVnd(clinic.cost)} / visit</span>
                      <InfoIcon className="size-3.5 text-neutral-400 shrink-0" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Address: ${clinic.address}`);
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-dark-main hover:text-brand-7 transition-colors cursor-pointer"
                    >
                      <span>Go To Map</span>
                      <ChevronRightIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="shrink-0 py-1 text-center text-xs text-neutral-400">
        © 2025 YSalus All rights reserved.
      </footer>

      {/* Floating Chat Bubble */}
      <button
        type="button"
        onClick={() => alert("Customer support chat")}
        className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-[#0D6171] text-white shadow-lg hover:bg-[#094854] transition-colors cursor-pointer"
        aria-label="Support chat"
      >
        <ChatBubbleIcon className="size-6" />
      </button>
    </div>
  );
}
