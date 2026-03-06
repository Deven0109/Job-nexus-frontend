import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-dark-500 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (location.pathname.startsWith('/employer')) {
            return <Navigate to="/login-employer" state={{ from: location }} replace />;
        } else if (location.pathname.startsWith('/recruiter')) {
            return <Navigate to="/login-recruiter" state={{ from: location }} replace />;
        } else {
            // Default to candidate login for candidate paths or shared pages
            return <Navigate to="/login-candidate" state={{ from: location }} replace />;
        }
    }

    // When we are authenticated but user data is not yet available in context,
    // wait instead of redirecting. This avoids blank/redirect flashes right after login.
    if (isAuthenticated && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-dark-500 text-sm font-medium">Preparing your dashboard...</p>
                </div>
            </div>
        );
    }

    if (roles.length > 0 && user && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
