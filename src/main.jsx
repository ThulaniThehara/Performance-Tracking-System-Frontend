import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Language support (English / Sinhala / Tamil) — must load before any component renders.
import "./i18n";

import Test from "./Pages/Test.jsx";
import LoginPage from "./Pages/LoginPage/LoginPage.jsx";
import SetPassword from "./Pages/Auth/SetPassword";
import ProtectedRoute from "./Components/ProtectedRoute";
// Admin
import AdminHome from "./Pages/Admin/AdminHome.jsx";
import AdminDashboard from "./Pages/Admin/AdminDashboard.jsx";
import AdminProjects from "./Pages/Admin/AdminProjects.jsx";
import AdminCommittees from "./Pages/Admin/AdminCommitees.jsx";
import AdminAddProject from "./Pages/Admin/AdminAddProject.jsx";
import AdminAddMember from "./Pages/Admin/AdminAddMember.jsx";
import AdminViewAccount from "./Pages/Admin/AdminViewAccount.jsx";

// Projects module (society project management)
import ProjectsHome from "./Pages/Projects/ProjectsHome.jsx";
import ProjectDetails from "./Pages/Projects/ProjectDetails.jsx";

// Chairperson
import ChairDashboard from "./Pages/Chair/ChairDashboard.jsx";
import ManageCommitees from "./Pages/Chair/ManageCommitees.jsx";
import ManageTask from "./Pages/Chair/ManageTask.jsx";
import MyProject from "./Pages/Chair/MyProject.jsx";

// Member
import MemberDashboard from "./Pages/Member/MemberDashboard.jsx";

// Common
import Settings from "./Pages/Settings.jsx";
import Reports from "./Pages/Reports.jsx";

import RouteErrorBoundary from "./Components/RouteErrorBoundary";

// ✅ TEMP: If you don’t have a separate page yet, use ChairDashboard as placeholder
// Later you can create: ./Pages/CommitteeHead/CommitteeHeadDashboard.jsx
const CommitteeHeadDashboard = ChairDashboard;

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // ✅ password setup link page
  {
    path: "/set-password",
    element: <SetPassword />,
    errorElement: <RouteErrorBoundary />,
  },

  // ✅ NEW role-based dashboard routes (used by Login redirect)
  // Admin lands here straight after login: counters + society calendar.
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminHome />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/home",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminHome />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // Projects module — any signed-in role; the page itself shows "Projects You
  // Lead" only to chairpersons, and the API enforces the same split.
  {
    path: "/projects",
    element: (
      <ProtectedRoute>
        <ProjectsHome />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/projects/:projectId/*",
    element: (
      <ProtectedRoute>
        <ProjectDetails />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/projects/:projectId",
    element: (
      <ProtectedRoute>
        <ProjectDetails />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },

  {
    path: "/chairperson/dashboard",
    element: <ChairDashboard />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/committee-head/dashboard",
    element: <CommitteeHeadDashboard />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/member/dashboard",
    element: <MemberDashboard />,
    errorElement: <RouteErrorBoundary />,
  },

  // ✅ KEEP your old routes (so nothing breaks)
  { path: "/ChairDashboard", element: <ChairDashboard />, errorElement: <RouteErrorBoundary /> },
  { path: "/MyProject", element: <MyProject />, errorElement: <RouteErrorBoundary /> },
  { path: "/ManageCommittees", element: <ManageCommitees />, errorElement: <RouteErrorBoundary /> },
  { path: "/ManageTasks", element: <ManageTask />, errorElement: <RouteErrorBoundary /> },

  { path: "/AdminHome", element: <AdminHome />, errorElement: <RouteErrorBoundary /> },
  { path: "/AdminDashboard", element: <AdminDashboard />, errorElement: <RouteErrorBoundary /> },
  // Where projects are actually created and assigned a chairperson.
  {
    path: "/AdminProjects",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminProjects />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  { path: "/AdminAddProjects", element: <AdminAddProject />, errorElement: <RouteErrorBoundary /> },
  { path: "/AdminAddMember", element: <AdminAddMember />, errorElement: <RouteErrorBoundary /> },
  { path: "/AdminCommittees", element: <AdminCommittees />, errorElement: <RouteErrorBoundary /> },
  { path: "/AdminViewAccount", element: <AdminViewAccount />, errorElement: <RouteErrorBoundary /> },

  { path: "/MemberDashboard", element: <MemberDashboard />, errorElement: <RouteErrorBoundary /> },

  { path: "/Settings", element: <Settings />, errorElement: <RouteErrorBoundary /> },
  { path: "/Reports", element: <Reports />, errorElement: <RouteErrorBoundary /> },

  // Optional test route
  { path: "/test", element: <Test />, errorElement: <RouteErrorBoundary /> },
  { path: "*", element: <RouteErrorBoundary /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
