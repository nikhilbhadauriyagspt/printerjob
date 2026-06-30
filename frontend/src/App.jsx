import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import CandidateHome from './pages/candidate/CandidateHome';
import CandidateLogin from './pages/candidate/CandidateLogin';
import CandidateRegister from './pages/candidate/CandidateRegister';
import CandidateProfileSetup from './pages/candidate/CandidateProfileSetup';
import CandidateProfile from './pages/candidate/CandidateProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPackages from './pages/admin/AdminPackages';
import AdminApplications from './pages/admin/AdminApplications';
import AdminLayout from './layout/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateJobs from './pages/candidate/CandidateJobs';
import CandidateJobDescription from './pages/candidate/CandidateJobDescription';
import CandidateCompanies from './pages/candidate/CandidateCompanies';
import CandidateSalaries from './pages/candidate/CandidateSalaries';
import ProjectGuide from './pages/ProjectGuide';
import CareerGuide from './pages/candidate/CareerGuide';

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
import RecruiterApplicants from './pages/recruiter/RecruiterApplicants';
import RecruiterCandidateView from './pages/recruiter/RecruiterCandidateView';
import RecruiterTalentSearch from './pages/recruiter/RecruiterTalentSearch';
import RecruiterBuyCredits from './pages/recruiter/RecruiterBuyCredits';
import RecruiterUnlockedTalent from './pages/recruiter/RecruiterUnlockedTalent';

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
      {
        path: "job/description/:id",
        element: <CandidateJobDescription />
      },
      {
        index: true,
        element: <CandidateHome />
      },
      {
        path: "login",
        element: <CandidateLogin />
      },
      {
        path: "register",
        element: <CandidateRegister />
      },
      {
        path: "setup-profile",
        element: <CandidateProfileSetup />
      },
      {
        path: "profile",
        element: <CandidateProfile />
      },
      {
        path: "jobs",
        element: <CandidateJobs />
      },
      {
        path: "dashboard",
        element: <CandidateDashboard />
      },
      {
        path: "companies",
        element: <CandidateCompanies />
      },
      {
        path: "salaries",
        element: <CandidateSalaries />
      },
      {
        path: "guide",
        element: <ProjectGuide />
      },
      {
        path: "career-guide",
        element: <CareerGuide />
      },
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
            path: "applications",
            element: <AdminApplications />
          },
          {
            path: "users",
            element: <AdminUsers />
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
            path: "applicants/:id",
            element: <RecruiterApplicants />
          },
          {
            path: "candidate/:id",
            element: <RecruiterCandidateView />
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
            element: <RecruiterTalentSearch />
          },
          {
            path: "buy-credits",
            element: <RecruiterBuyCredits />
          },
          {
            path: "unlocked-talent",
            element: <RecruiterUnlockedTalent />
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
      }
    ]
  }
], {
  basename: window.location.pathname.startsWith('/job_portal') ? '/job_portal' : '/'
});

function App() {
  return (
    <RouterProvider router={appRouter} />
  )
}

export default App;
