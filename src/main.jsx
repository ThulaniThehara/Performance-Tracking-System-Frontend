import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Test from "./Pages/Test.jsx";
import LoginPage from "./Pages/LoginPage/LoginPage.jsx";
import SetPassword from "./Pages/Auth/SetPassword";
import ProtectedRoute from "./Components/ProtectedRoute";
// Admin
import AdminDashboard from "./Pages/Admin/AdminDashboard.jsx";
import AdminProjects from "./Pages/Admin/AdminProjects.jsx";
import AdminCommittees from "./Pages/Admin/AdminCommitees.jsx";
import AdminAddProject from "./Pages/Admin/AdminAddProject.jsx";
import AdminAddMember from "./Pages/Admin/AdminAddMember.jsx";
import AdminViewAccount from "./Pages/Admin/AdminViewAccount.jsx";

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

// ✅ TEMP: If you don’t have a separate page yet, use ChairDashboard as placeholder
// Later you can create: ./Pages/CommitteeHead/CommitteeHeadDashboard.jsx
const CommitteeHeadDashboard = ChairDashboard;

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
    errorElement: <div>Page Not Found</div>,
  },

  // ✅ password setup link page
  {
    path: "/set-password",
    element: <SetPassword />,
    errorElement: <div>Page Not Found</div>,
  },

  // ✅ NEW role-based dashboard routes (used by Login redirect)
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/chairperson/dashboard",
    element: <ChairDashboard />,
    errorElement: <div>Page Not Found</div>,
  },
  {
    path: "/committee-head/dashboard",
    element: <CommitteeHeadDashboard />,
    errorElement: <div>Page Not Found</div>,
  },
  {
    path: "/member/dashboard",
    element: <MemberDashboard />,
    errorElement: <div>Page Not Found</div>,
  },

  // ✅ KEEP your old routes (so nothing breaks)
  { path: "/ChairDashboard", element: <ChairDashboard />, errorElement: <div>Page Not Found</div> },
  { path: "/MyProject", element: <MyProject />, errorElement: <div>Page Not Found</div> },
  { path: "/ManageCommittees", element: <ManageCommitees />, errorElement: <div>Page Not Found</div> },
  { path: "/ManageTasks", element: <ManageTask />, errorElement: <div>Page Not Found</div> },

  { path: "/AdminDashboard", element: <AdminDashboard />, errorElement: <div>Page Not Found</div> },
  { path: "/AdminProjects", element: <AdminProjects />, errorElement: <div>Page Not Found</div> },
  { path: "/AdminAddProjects", element: <AdminAddProject />, errorElement: <div>Page Not Found</div> },
  { path: "/AdminAddMember", element: <AdminAddMember />, errorElement: <div>Page Not Found</div> },
  { path: "/AdminCommittees", element: <AdminCommittees />, errorElement: <div>Page Not Found</div> },
  { path: "/AdminViewAccount", element: <AdminViewAccount />, errorElement: <div>Page Not Found</div> },

  { path: "/MemberDashboard", element: <MemberDashboard />, errorElement: <div>Page Not Found</div> },

  { path: "/Settings", element: <Settings />, errorElement: <div>Page Not Found</div> },
  { path: "/Reports", element: <Reports />, errorElement: <div>Page Not Found</div> },

  // Optional test route
  { path: "/test", element: <Test />, errorElement: <div>Page Not Found</div> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
