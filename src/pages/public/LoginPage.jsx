import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineExclamationTriangle,
    HiOutlineBriefcase,
} from 'react-icons/hi2';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Check URL parameters for initial role
    const getRoleFromPath = () => {
        if (location.pathname.includes('-employer')) return 'employer';
        if (location.pathname.includes('-recruiter')) return 'recruiter';
        return 'candidate';
    };
    const selectedRole = getRoleFromPath();

    if (isAuthenticated && user) {
        let dashboardPath = `/${user.role}/dashboard`;
        if (user.role === 'candidate') dashboardPath = '/'; // Candidate dashboard is root
        return <Navigate to={dashboardPath} replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (apiError) setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: selectedRole,
            });
            // First-time login OTP flow
            if (result?.requiresOtp) {
                toast.success('OTP sent to your email. Please verify to continue.');
                navigate(`/verify-login-otp?role=${selectedRole}`, { replace: true });
                return;
            }

            const userData = result;

            toast.success(`Welcome back, ${userData.firstName}!`);

            const from = location.state?.from?.pathname;
            let dashboardPath = `/${userData.role}/dashboard`;

            if (userData.role === 'candidate') {
                dashboardPath = '/';
            }

            navigate(dashboardPath, { replace: true });
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Login failed. Please try again.';
            setApiError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="card p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                            <HiOutlineBriefcase className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-1">
                            Welcome to Job <span className="text-blue-600">Consultancy</span>
                        </h1>
                        <p className="text-dark-500 text-sm">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold border text-blue-600 border-blue-600 bg-white shadow-sm ring-2 ring-blue-100 scale-105">
                            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login
                        </span>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-dark-700 mb-1.5">
                                Email <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    autoComplete="email"
                                    className={`w-full pl-11 pr-4 py-2.5 rounded-lg border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 ${errors.email
                                        ? 'border-danger-400 focus:border-danger-500'
                                        : 'border-dark-200 focus:border-primary-500'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-danger-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="login-password" className="block text-sm font-semibold text-dark-700">
                                    Password <span className="text-danger-500">*</span>
                                </label>
                                <Link
                                    to={`/forgot-password?role=${selectedRole}`}
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className={`w-full pl-11 pr-11 py-2.5 rounded-lg border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 ${errors.password
                                        ? 'border-danger-400 focus:border-danger-500'
                                        : 'border-dark-200 focus:border-primary-500'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <HiOutlineEyeSlash className="w-4.5 h-4.5" />
                                    ) : (
                                        <HiOutlineEye className="w-4.5 h-4.5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-danger-600 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500 cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 text-sm text-dark-600 cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 gradient-primary text-white font-semibold rounded-lg text-sm shadow-md transition-all ${isLoading
                                ? 'opacity-70 cursor-not-allowed'
                                : 'hover:opacity-90 hover:shadow-lg active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-dark-500 mt-6">
                        Don't have an account?{' '}
                        <Link to={`/register-${selectedRole}`} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>

                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-dark-700 transition-colors"
                    >
                        <HiOutlineArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
