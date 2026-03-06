import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../api/auth.api';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineShieldCheck,
    HiOutlineKey,
    HiOutlineEye,
    HiOutlineEyeSlash,
} from 'react-icons/hi2';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get('role') || 'candidate';
    const loginPath = `/login-${role}`;

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false,
    });

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email.trim()) return toast.error('Please enter your email');

        setIsLoading(true);
        try {
            const { data } = await authAPI.forgotPassword(email.trim().toLowerCase());
            toast.success(data.message || 'OTP sent to your email!');

            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Please enter 6-digit OTP');

        setIsLoading(true);
        try {
            await authAPI.verifyOTP({ email: email.trim().toLowerCase(), otp });
            toast.success('OTP verified!');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
        if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');

        setIsLoading(true);
        try {
            await authAPI.resetPassword({
                email: email.trim().toLowerCase(),
                otp,
                password: passwords.newPassword
            });
            toast.success('Password updated successfully!');
            navigate(loginPath);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
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
                            <HiOutlineKey className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-1">
                            {step === 1 && 'Forgot Password?'}
                            {step === 2 && 'Verify OTP'}
                            {step === 3 && 'New Password'}
                        </h1>
                        <p className="text-dark-500 text-sm">
                            {step === 1 && "No worries, we'll send you reset instructions."}
                            {step === 2 && `We've sent a 6-digit code to ${email}`}
                            {step === 3 && 'Enter your new password below.'}
                        </p>
                    </div>

                    {step === 1 && (
                        <form className="space-y-5" onSubmit={handleSendOTP}>
                            <div>
                                <label className="block text-sm font-semibold text-dark-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 gradient-primary text-white font-semibold rounded-lg text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-70"
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form className="space-y-5" onSubmit={handleVerifyOTP}>
                            <div>
                                <label className="block text-sm font-semibold text-dark-700 mb-1.5">6-Digit OTP</label>
                                <div className="relative">
                                    <HiOutlineShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-800 placeholder-dark-400 text-center tracking-[0.5em] font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 gradient-primary text-white font-semibold rounded-lg text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-70"
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-xs text-dark-500 hover:text-primary-600 transition-colors"
                            >
                                Wait, I entered the wrong email
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form className="space-y-5" onSubmit={handleResetPassword}>
                            <div>
                                <label className="block text-sm font-semibold text-dark-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        required
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        placeholder="At least 8 characters"
                                        className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                                    >
                                        {showPasswords.new ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        required
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                        className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                                    >
                                        {showPasswords.confirm ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 gradient-primary text-white font-semibold rounded-lg text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-70"
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-6">
                        <Link
                            to={loginPath}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-dark-500 hover:text-primary-600 transition-colors"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Back to log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
