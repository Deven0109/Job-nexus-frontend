import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth.api';
import {
    HiOutlineShieldCheck,
    HiOutlineKey,
    HiOutlineArrowLeft,
    HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const LoginOtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken, isAuthenticated } = useAuth();

    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get('role') || 'candidate';
    const loginPath = `/login-${role}`;

    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [apiError, setApiError] = useState('');

    const email = sessionStorage.getItem('jobnexus_login_otp_email');

    useEffect(() => {
        if (!email && !isAuthenticated) {
            navigate(loginPath, { replace: true });
        }
    }, [email, isAuthenticated, navigate, loginPath]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 4) {
            setApiError('Please enter the 4-digit OTP.');
            return;
        }

        setIsVerifying(true);
        setApiError('');

        try {
            const { data } = await authAPI.verifyLoginOtp({ email, otpCode: otp });
            const { accessToken, user } = data.data;

            sessionStorage.removeItem('jobnexus_login_otp_email');

            const userData = loginWithToken(accessToken, user);

            toast.success('Login verified successfully!');

            let dashboardPath = `/${userData.role}/dashboard`;
            if (userData.role === 'candidate') {
                dashboardPath = '/';
            }

            navigate(dashboardPath, { replace: true });
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'OTP verification failed. Please try again.';
            setApiError(message);
            toast.error(message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;

        setIsResending(true);
        setApiError('');

        try {
            const { data } = await authAPI.resendLoginOtp({ email });
            toast.success(data.message || 'A new OTP has been sent to your email.');
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Failed to resend OTP. Please try again.';
            setApiError(message);
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="card p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                            <HiOutlineShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-1">
                            Verify Your Login
                        </h1>
                        <p className="text-dark-500 text-sm">
                            Enter the 4-digit OTP sent to{' '}
                            <span className="font-semibold text-dark-700">{email}</span>
                        </p>
                    </div>

                    {apiError && (
                        <div className="mb-4 p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                            <HiOutlineExclamationTriangle className="w-5 h-5 text-danger-500 flex-shrink-0" />
                            <p className="text-sm text-danger-700 font-medium">{apiError}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleVerify}>
                        <div>
                            <label className="block text-sm font-semibold text-dark-700 mb-1.5">
                                OTP Code <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                                <HiOutlineKey className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 4-digit OTP"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 border-dark-200 focus:border-primary-500 tracking-[0.4em] text-center"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className={`w-full py-3 gradient-primary text-white font-semibold rounded-lg text-sm shadow-md transition-all ${isVerifying
                                ? 'opacity-70 cursor-not-allowed'
                                : 'hover:opacity-90 hover:shadow-lg active:scale-[0.98]'
                                }`}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-primary-600 hover:text-primary-700 font-semibold disabled:opacity-60"
                        >
                            {isResending ? 'Resending OTP...' : 'Resend OTP'}
                        </button>

                        <Link
                            to={loginPath}
                            className="inline-flex items-center gap-1.5 text-dark-500 hover:text-dark-700 transition-colors"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginOtpVerificationPage;

