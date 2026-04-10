import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPackages from './pages/admin/AdminPackages';
import AdminLayout from './layout/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Recruiter Pages
import RecruiterLogin from './pages/recruiter/RecruiterLogin';
import RecruiterRegister from './pages/recruiter/RecruiterRegister';
import RecruiterLayout from './layout/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterPostJob from './pages/recruiter/RecruiterPostJob';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterProfileSetup from './pages/recruiter/RecruiterProfileSetup';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import RecruiterVerifyPhone from './pages/recruiter/RecruiterVerifyPhone';
import RecruiterSettings from './pages/recruiter/RecruiterSettings';
import RecruiterMessages from './pages/recruiter/RecruiterMessages';
import RecruiterNotifications from './pages/recruiter/RecruiterNotifications';
import RecruiterPricing from './pages/recruiter/RecruiterPricing';
import RecruiterBilling from './pages/recruiter/RecruiterBilling';

// Session Hook
import useSession from './hooks/useSession';

const SessionManager = () => {
  useSession();
  return <Outlet />;
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <SessionManager />,
    children: [
      // Admin Routes
      {
        path: "admin/login",
        element: <AdminLogin />
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />
          },
          {
            path: "jobs",
            element: <AdminJobs />
          },
          {
            path: "users",
            element: <div className="p-8 text-slate-500 font-bold">Users Directory Content</div>
          },
          {
            path: "companies",
            element: <AdminCompanies />
          },
          {
            path: "suggestions/:type",
            element: <AdminSuggestions />
          },
          {
            path: "notifications",
            element: <AdminNotifications />
          },
          {
            path: "messages",
            element: <AdminMessages />
          },
          {
            path: "settings",
            element: <AdminSettings />
          },
          {
            path: "packages",
            element: <AdminPackages />
          }
        ]
      },

      // Recruiter Routes
      {
        path: "recruiter/login",
        element: <RecruiterLogin />
      },
      {
        path: "recruiter/register",
        element: <RecruiterRegister />
      },
      {
        path: "recruiter/verify-phone",
        element: <RecruiterVerifyPhone />
      },
      {
        path: "recruiter",
        element: <RecruiterLayout />,
        children: [
          {
            path: "dashboard",
            element: <RecruiterDashboard />
          },
          {
            path: "post-job",
            element: <RecruiterPostJob />
          },
          {
            path: "jobs",
            element: <RecruiterJobs />
          },
          {
            path: "profile",
            element: <RecruiterProfile />
          },
          {
            path: "setup-profile",
            element: <RecruiterProfileSetup />
          },
          {
            path: "applications",
            element: <div className="p-8 text-slate-500 font-bold">Applications Tracking Content</div>
          },
          {
            path: "talent-pool",
            element: <div className="p-8 text-slate-500 font-bold">Talent Pool / Candidate Search</div>
          },
          {
            path: "messages",
            element: <RecruiterMessages />
          },
          {
            path: "notifications",
            element: <RecruiterNotifications />
          },
          {
            path: "settings",
            element: <RecruiterSettings />
          },
          {
            path: "pricing",
            element: <RecruiterPricing />
          },
          {
            path: "billing",
            element: <RecruiterBilling />
          }
        ]
      },
      
      // Root Redirect
      {
        path: "",
        element: <Navigate to="/admin/login" />
      }
    ]
  }
]);

function App() {
  return (
    <RouterProvider router={appRouter} />
  )
}

export default App;
