import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { useStore } from "../store";

function LayoutContent() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { toast, setToast } = useStore();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-brand-05 xl:flex">
      <div className="shrink-0">
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex h-dvh min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[340px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="mx-auto flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden xl:max-w-(--breakpoint-2xl)">
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4">
            <Outlet />
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-brand-11 bg-white px-4 py-3 text-sm shadow-theme-md transition-all">
          <div className="flex items-start gap-3">
            <p className="font-medium text-dark-main">{toast}</p>
            <button
              className="text-notes hover:text-dark-main cursor-pointer"
              onClick={() => setToast(null)}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
