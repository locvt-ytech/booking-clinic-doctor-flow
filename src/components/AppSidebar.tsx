import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "./SidebarContext";
import {
  MenuCalendarFilledIcon,
  MenuCalendarIcon,
  MenuDashboardFilledIcon,
  MenuDashboardIcon,
  MenuDrugInteractionFilledIcon,
  MenuDrugInteractionIcon,
  MenuEmrFilledIcon,
  MenuEmrIcon,
  MenuMonitoringFilledIcon,
  MenuMonitoringIcon,
} from "./Icons";

type NavItem = {
  name: string;
  path?: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <MenuDashboardIcon />,
    activeIcon: <MenuDashboardFilledIcon />,
    disabled: true,
  },
  {
    name: "My Calendar",
    path: "/",
    icon: <MenuCalendarIcon />,
    activeIcon: <MenuCalendarFilledIcon />,
  },
  {
    name: "Monitoring",
    path: "/monitoring",
    icon: <MenuMonitoringIcon />,
    activeIcon: <MenuMonitoringFilledIcon />,
    disabled: true,
  },
  {
    name: "Medical Report",
    path: "/medical-report",
    icon: <MenuEmrIcon />,
    activeIcon: <MenuEmrFilledIcon />,
    disabled: true,
  },
  {
    name: "Medicine",
    path: "/medicine",
    icon: <MenuDrugInteractionIcon />,
    activeIcon: <MenuDrugInteractionFilledIcon />,
    disabled: true,
  },
];

export function AppSidebar() {
  const { isExpanded, isMobileOpen, toggleMobileSidebar, isHovered, setIsHovered } =
    useSidebar();
  const location = useLocation();

  const isItemActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const showExpanded = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed bottom-0 left-0 z-[60] h-[calc(100vh-64px)] bg-brand-05 pl-4 pt-4 pb-4 text-gray-900 transition-all duration-300 ease-in-out lg:top-0 lg:h-screen
        ${
          showExpanded
            ? "w-[340px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex flex-col gap-4 h-full bg-white shadow-slider-navigation rounded-2xl ${
          showExpanded ? "p-4" : "p-2 items-center"
        }`}
      >
        <div className="flex justify-center py-2">
          <Link to="/" className="justify-items-center flex items-center justify-center">
            {showExpanded ? (
              <img
                src="/logos/ysalus_full.png"
                alt="YSalus"
                className="w-2/5 md:w-3/5 object-contain max-h-10"
                onError={(e) => {
                  // Fallback text if image missing
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <img
                src="/logos/ysalus_logo.png"
                alt="YSalus"
                width={32}
                height={32}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )}
          </Link>
        </div>

        <div
          className={`flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto duration-300 ease-linear no-scrollbar ${
            isMobileOpen ? "w-full px-2" : ""
          }`}
        >
          <nav id="app-sidebar-nav" className="min-h-0 flex-1">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isItemActive(item.path);

                if (item.disabled) {
                  return (
                    <li key={item.name} className="pointer-events-none opacity-40 cursor-not-allowed">
                      <div
                        className={`menu-item menu-item-inactive ${
                          !showExpanded ? "lg:justify-center" : "lg:justify-start"
                        }`}
                      >
                        <span className="menu-item-icon-size menu-item-icon-inactive">
                          {item.icon}
                        </span>
                        {showExpanded && (
                          <span className="menu-item-text text-left inline whitespace-nowrap">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <Link
                      to={item.path ?? "#"}
                      className={`menu-item group ${
                        active ? "menu-item-active" : "menu-item-inactive"
                      } ${!showExpanded ? "lg:justify-center" : "lg:justify-start"}`}
                      onClick={() => {
                        if (isMobileOpen) {
                          toggleMobileSidebar();
                        }
                      }}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          active ? "menu-item-icon-active" : "menu-item-icon-inactive"
                        }`}
                      >
                        {active ? item.activeIcon : item.icon}
                      </span>
                      {showExpanded && (
                        <span className="menu-item-text text-left inline">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {showExpanded && (
          <div className="mt-auto flex flex-col items-center gap-2 border-t border-brand-1 pt-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <img
                src="/cert/footer/hipaa.svg"
                alt="HIPAA"
                className="h-7 w-auto max-h-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <img
                src="/cert/footer/gdpr.svg"
                alt="GDPR"
                className="h-7 w-auto max-h-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <img
                src="/cert/2aOboR2RKRaoJ22wGWs3PGJZvW5yD70mvrDloSKu.png"
                alt="ISO/IEC 27001:2022"
                className="h-7 w-auto max-h-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
