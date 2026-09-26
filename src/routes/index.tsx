import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import LandingPage from "@/features/landing/pages/LandingPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RequestAccessPage from "@/features/auth/pages/RequestAccessPage/RequestAccessPage";
import AccessSubmittedPage from "@/features/auth/pages/AccessSubmittedPage/AccessSubmittedPage";
import AccessStatusPage from "@/features/auth/pages/AccessStatusPage/AccessStatusPage";
import ActivateAccountPage from "@/features/auth/pages/ActivateAccountPage/ActivateAccountPage";
import AccessRequestsPage from "@/features/access-control/pages/AccessRequestsPage/AccessRequestsPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import CasesPage from "@/features/cases/pages/CasesPage";
import CaseDetailPage from "@/features/cases/pages/CaseDetailPage";
import EntitiesPage from "@/features/entities/pages/EntitiesPage";
import EntityDetailPage from "@/features/entities/pages/EntityDetailPage";
import NetworkAnalysisPage from "@/features/network/pages/NetworkAnalysisPage";
import NetworkDetailPage from "@/features/network/pages/NetworkDetailPage";
import TimelinePage from "@/features/timeline/pages/TimelinePage";
import LocationPage from "@/features/location/pages/LocationPage";
import FindingsPage from "@/features/findings/pages/FindingsPage";
import EvidencePage from "@/features/evidence/pages/EvidencePage";
import DatasetsPage from "@/features/datasets/pages/DatasetsPage";
import DataUploadPage from "@/features/data-upload/pages/DataUploadPage";
import DataQualityPage from "@/features/data-quality/pages/DataQualityPage";
import EntityResolutionPage from "@/features/entity-resolution/pages/EntityResolutionPage";

import NotFoundPage from "@/pages/NotFoundPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import { PERMISSIONS } from "@/features/auth/authorization";

import { routePatterns, routes } from "./routePaths";

export const router = createBrowserRouter([
  // Public routes
  {
    path: routes.home,
    element: <LandingPage />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.requestAccess,
    element: <RequestAccessPage />,
  },
  {
    path: routes.accessSubmitted,
    element: <AccessSubmittedPage />,
  },
  {
    path: routes.accessStatus,
    element: <AccessStatusPage />,
  },
  {
    path: routes.activateAccount,
    element: <ActivateAccountPage />,
  },
  {
    path: routes.forbidden,
    element: <ForbiddenPage />,
  },

  // Cyber Cell Verification (Role & Permission Guarded)
  {
    element: (
      <ProtectedRoute
        requiredRoles={["CYBER_CELL_ADMIN", "administrator"]}
        permission={PERMISSIONS.ACCESS_REVIEW}
      />
    ),
    children: [
      {
        path: routes.admin.accessRequests,
        element: <AccessRequestsPage />,
      },
    ],
  },

  // Protected application
  {
    element: <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: routes.dashboard,
            element: <DashboardPage />,
          },

          // Cases
          {
            path: routes.cases.list,
            element: <CasesPage />,
          },
          {
            path: routePatterns.caseDetail,
            element: <CaseDetailPage />,
          },
          {
            path: routePatterns.caseNetwork,
            element: <NetworkAnalysisPage />,
          },
          {
            path: routePatterns.caseTimeline,
            element: <TimelinePage />,
          },
          {
            path: routePatterns.caseLocations,
            element: <LocationPage />,
          },
          {
            path: routePatterns.caseEvidence,
            element: <EvidencePage />,
          },
          {
            path: routePatterns.caseFindings,
            element: <FindingsPage />,
          },

          // Entities
          {
            path: routes.entities.list,
            element: <EntitiesPage />,
          },
          {
            path: routePatterns.entityDetail,
            element: <EntityDetailPage />,
          },
          {
            path: routePatterns.entityTypeDetail,
            element: <EntityDetailPage />,
          },

          // Network
          {
            path: routes.network.list,
            element: <NetworkAnalysisPage />,
          },
          {
            path: routePatterns.networkDetail,
            element: <NetworkDetailPage />,
          },

          // Intelligence
          {
            path: routes.timeline.list,
            element: <TimelinePage />,
          },
          {
            path: routes.locations.list,
            element: <LocationPage />,
          },
          {
            path: routes.findings.list,
            element: <FindingsPage />,
          },
          {
            path: routes.evidence.list,
            element: <EvidencePage />,
          },

          // Data
          {
            path: routes.datasets.list,
            element: <DatasetsPage />,
          },
          {
            path: routes.dataUpload.list,
            element: <DataUploadPage />,
          },
          {
            path: routes.dataQuality.list,
            element: <DataQualityPage />,
          },
          {
            path: routes.entityResolution.list,
            element: <EntityResolutionPage />,
          },
        ],
      },
    ],
  },

  // 404 (outside AppLayout)
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
