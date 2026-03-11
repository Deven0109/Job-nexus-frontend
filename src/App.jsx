import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import JobListingPage from './pages/public/JobListingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import LoginOtpVerificationPage from './pages/public/LoginOtpVerificationPage';
import TermsPage from './pages/public/TermsPage';
import AboutPage from './pages/public/AboutPage';
import JobDetailPage from './pages/public/JobDetailPage';


// Dashboard Pages
import CandidateProfileSettings from './pages/candidate/CandidateProfileSettings';
import AppliedJobsPage from './pages/candidate/AppliedJobsPage';
import RecruiterDashboardMain from './pages/recruiter/RecruiterDashboardMain';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfileSettings from './pages/recruiter/RecruiterProfileSettings';
import RecruiterJobRequests from './pages/recruiter/RecruiterJobRequests';
import RecruiterEditJobRequest from './pages/recruiter/RecruiterEditJobRequest';
import AddJob from './pages/recruiter/AddJob';
import ManageCategories from './pages/recruiter/ManageCategories';
import RecruiterApplicationsPage from './pages/recruiter/RecruiterApplicationsPage';
import RecruiterPipelinePage from './pages/recruiter/RecruiterPipelinePage';

import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerProfileSettings from './pages/employer/EmployerProfileSettings';
import EmployerAllJobsApplications from './pages/employer/EmployerAllJobsApplications';
import CompanyProfile from './pages/employer/CompanyProfile';
import EmployerJobRequests from './pages/employer/EmployerJobRequests';
import CreateJobRequest from './pages/employer/CreateJobRequest';
import ViewJobRequest from './pages/employer/ViewJobRequest';
import EmployerReviewPage from './pages/employer/EmployerReviewPage';
import EmployerPipelinePage from './pages/employer/EmployerPipelinePage';



// Shared Pages
import PlaceholderPage from './pages/shared/PlaceholderPage';
import NotFoundPage from './pages/shared/NotFoundPage';
import UnauthorizedPage from './pages/shared/UnauthorizedPage';

// React Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <Router>
                        <Routes>
                            {/* ==================== PUBLIC & CANDIDATE ROUTES ==================== */}
                            <Route element={<PublicLayout />}>
                                <Route index element={<HomePage />} />
                                <Route path="jobs" element={<JobListingPage />} />
                                <Route path="jobs/:id" element={<JobDetailPage />} />

                                <Route path="login" element={<Navigate to="/login-candidate" replace />} />
                                <Route path="login-candidate" element={<LoginPage />} />
                                <Route path="login-recruiter" element={<LoginPage />} />
                                <Route path="login-employer" element={<LoginPage />} />
                                <Route path="register" element={<Navigate to="/register-candidate" replace />} />
                                <Route path="register-candidate" element={<RegisterPage />} />
                                <Route path="register-recruiter" element={<RegisterPage />} />
                                <Route path="register-recruiter" element={<RegisterPage />} />
                                <Route path="register-employer" element={<RegisterPage />} />
                                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="verify-login-otp" element={<LoginOtpVerificationPage />} />
                                <Route path="reset-password/:token" element={<LoginPage />} />
                                <Route path="unauthorized" element={<UnauthorizedPage />} />
                                <Route path="terms" element={<TermsPage />} />
                                <Route path="about" element={<AboutPage />} />

                                {/* Moved Candidate Routes to PublicLayout (Top Nav) */}
                                <Route
                                    element={
                                        <ProtectedRoute roles={['candidate']}>
                                            <OutletWrapper />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="candidate/applications" element={<AppliedJobsPage />} />
                                    <Route path="candidate/profile-settings" element={<CandidateProfileSettings />} />
                                </Route>
                            </Route>

                            {/* ==================== RECRUITER ROUTES ==================== */}
                            <Route
                                element={
                                    <ProtectedRoute roles={['recruiter']}>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="recruiter/dashboard" element={<RecruiterDashboardMain />} />
                                <Route path="recruiter/manage-jobs" element={<RecruiterDashboard />} />
                                <Route path="recruiter/categories" element={<ManageCategories />} />
                                <Route path="recruiter/job-requests" element={<RecruiterJobRequests />} />
                                <Route path="recruiter/add-job" element={<AddJob />} />
                                <Route path="recruiter/job-requests/:id" element={<RecruiterEditJobRequest />} />
                                <Route path="recruiter/job/:jobId/applications" element={<RecruiterApplicationsPage />} />
                                <Route path="recruiter/job/:jobId/pipeline" element={<RecruiterPipelinePage />} />

                                <Route path="recruiter/profile-settings" element={<RecruiterProfileSettings />} />
                            </Route>

                            {/* ==================== EMPLOYER ROUTES ==================== */}
                            <Route
                                element={
                                    <ProtectedRoute roles={['employer']}>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="employer/dashboard" element={<EmployerDashboard />} />
                                <Route path="employer/pipelines" element={<EmployerAllJobsApplications />} />
                                <Route path="employer/job-requests" element={<EmployerJobRequests />} />

                                <Route path="employer/job-requests/new" element={<CreateJobRequest />} />
                                <Route path="employer/job-requests/:id" element={<ViewJobRequest />} />
                                <Route path="employer/jobs/:jobId/review" element={<EmployerReviewPage />} />
                                <Route path="employer/jobs/:jobId/pipeline" element={<EmployerPipelinePage />} />


                                <Route path="employer/profile" element={<CompanyProfile />} />
                                <Route path="employer/reports" element={<PlaceholderPage title="Activity Reports" />} />
                                <Route path="employer/profile-settings" element={<EmployerProfileSettings />} />
                            </Route>

                            {/* Catch All */}
                            <Route path="*" element={<PublicLayout />}>
                                <Route path="*" element={<NotFoundPage />} />
                            </Route>
                        </Routes>
                    </Router>

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                borderRadius: '10px',
                                background: '#1E293B',
                                color: '#F1F5F9',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '12px 16px',
                            },
                        }}
                    />
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

// Add Outlet import since I'm using it as a wrapper for protected routes inside a layout
import { Outlet } from 'react-router-dom';
const OutletWrapper = () => <Outlet />;

export default App;
