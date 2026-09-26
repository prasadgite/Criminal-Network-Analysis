import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { routes } from "@/routes/routePaths";

import "./AppLayout.css";

const MODULE_ROUTES = [
  {
    name: "Dashboard",
    match: (path: string) => path === routes.dashboard,
    path: routes.dashboard,
  },
  {
    name: "Cases",
    match: (path: string) => path.startsWith("/cases"),
    path: routes.cases.list,
  },
  {
    name: "Entities",
    match: (path: string) => path.startsWith("/entities"),
    path: routes.entities.list,
  },
  {
    name: "Network Analysis",
    match: (path: string) => path.startsWith("/network"),
    path: routes.network.list,
  },
  {
    name: "Timeline",
    match: (path: string) => path.startsWith("/timeline"),
    path: routes.timeline.list,
  },
  {
    name: "Location Intelligence",
    match: (path: string) => path.startsWith("/locations"),
    path: routes.locations.list,
  },
  {
    name: "Findings",
    match: (path: string) => path.startsWith("/findings"),
    path: routes.findings.list,
  },
  {
    name: "Evidence",
    match: (path: string) => path.startsWith("/evidence"),
    path: routes.evidence.list,
  },
  {
    name: "Datasets",
    match: (path: string) => path.startsWith("/datasets"),
    path: routes.datasets.list,
  },
  {
    name: "Data Upload",
    match: (path: string) => path.startsWith("/data-upload"),
    path: routes.dataUpload.list,
  },
  {
    name: "Data Quality",
    match: (path: string) => path.startsWith("/data-quality"),
    path: routes.dataQuality.list,
  },
  {
    name: "Entity Resolution",
    match: (path: string) => path.startsWith("/entity-resolution"),
    path: routes.entityResolution.list,
  },
] as const;

function getActiveModule(pathname: string): string {
  const matchedModule = MODULE_ROUTES.find((module) =>
    module.match(pathname),
  );

  return matchedModule?.name ?? "Dashboard";
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const activeModule = getActiveModule(location.pathname);

  const handleNavSelect = (itemName: string) => {
    const selectedModule = MODULE_ROUTES.find(
      (module) => module.name === itemName,
    );

    if (!selectedModule) {
      return;
    }

    navigate(selectedModule.path);

    // Important for mobile/tablet navigation.
    setSidebarOpen(false);
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Topbar onMenu={handleOpenSidebar} />

      <Sidebar
        open={sidebarOpen}
        active={activeModule}
        onClose={handleCloseSidebar}
        onSelect={handleNavSelect}
      />

      <main className="app-layout__main">
        <div className="app-layout__content">
          <div className="app-layout__content-inner">
            <Outlet />
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
