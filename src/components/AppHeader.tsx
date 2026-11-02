import { useLocation } from "react-router-dom";
import { useSidebar } from "./SidebarContext";
import { BellIcon, CloseIcon, MenuIcon, SearchIcon, SidebarIcon } from "./Icons";
import { CURRENT_USER } from "../dummyData";

export function AppHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/") return "My Calendar";
    if (p.startsWith("/booking/doctor/")) return "Doctor's Profile";
    if (p.startsWith("/booking/new-appointment/")) return "Set A New Appointment";
    if (p.startsWith("/booking/confirm-appointment")) return "Confirm Appointment";
    if (p.startsWith("/booking")) return "Booking Appointment";
    return "My Calendar";
  };

  return (
    <header className="sticky top-0 z-50 flex w-full max-w-full overflow-x-clip overflow-y-visible bg-brand-05">
      <div className="flex min-w-0 flex-1 flex-col items-center justify-between lg:flex-row">
        <div className="flex w-full min-w-0 items-center justify-between gap-2 px-4 pt-4 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              className="group items-center justify-center text-gray-500 z-99999 lg:flex hover:bg-gray-200 hover:text-gray-800 p-2 rounded-full cursor-pointer"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                <CloseIcon className="size-5" />
              ) : (
                <SidebarIcon className="size-4.5" />
              )}
            </button>
            <h2 className="truncate text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-[220px] items-center gap-2 rounded-full border border-brand-1 bg-white px-4 text-xs text-gray-700 shadow-theme-xs transition-all focus-within:w-[280px]">
              <SearchIcon className="size-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-theme-xs hover:bg-gray-100"
              aria-label="Notifications"
            >
              <BellIcon className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-secondary-600" />
            </button>

            <div className="flex items-center gap-2.5 rounded-full bg-white px-3 py-1.5 shadow-theme-xs">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.fullname}
                className="size-8 rounded-full object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold leading-tight text-dark-main">
                  {CURRENT_USER.fullname}
                </p>
                <p className="text-[11px] text-notes leading-tight">
                  {CURRENT_USER.publicId} · Patient
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
