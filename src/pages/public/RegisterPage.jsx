import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineExclamationTriangle,
    HiOutlineCheckCircle,
    HiOutlineUserPlus,
    HiOutlineMagnifyingGlass,
    HiOutlineBuildingOffice2,
    HiOutlineDocumentText,
} from 'react-icons/hi2';

const ROLE_CONFIG = {
    candidate: {
        label: 'Candidate',
        description: 'Find your dream job',
        icon: HiOutlineDocumentText,
        color: 'from-info-500 to-info-600',
        borderActive: 'border-info-500 bg-info-50 shadow-info-100',
        text: 'text-info-700',
    },
    recruiter: {
        label: 'Recruiter',
        description: 'Source top talent',
        icon: HiOutlineMagnifyingGlass,
        color: 'from-primary-500 to-primary-600',
        borderActive: 'border-primary-500 bg-primary-50 shadow-primary-100',
        text: 'text-primary-700',
    },
    employer: {
        label: 'Employer',
        description: 'Hire for your company',
        icon: HiOutlineBuildingOffice2,
        color: 'from-warning-500 to-warning-600',
        borderActive: 'border-warning-500 bg-warning-50 shadow-warning-100',
        text: 'text-warning-700',
    },
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, isAuthenticated, user } = useAuth();

    // Redirect if already logged in
    if (isAuthenticated && user) {
        let dashboardPath = `/${user.role}/dashboard`;
        if (user.role === 'recruiter') dashboardPath = '/recruiter/dashboard';
        if (user.role === 'candidate') dashboardPath = '/';
        navigate(dashboardPath, { replace: true });
        return null;
    }

    const getInitialRole = () => {
        if (location.pathname.includes('-employer')) return 'employer';
        if (location.pathname.includes('-recruiter')) return 'recruiter';
        return 'candidate';
    };

    const selectedRole = getInitialRole();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (apiError) setApiError('');
    };

    const handlePhoneChange = (value) => {
        // If value is empty, don't prefix with '+'
        const formattedPhone = value ? '+' + value : '';
        setFormData((prev) => ({ ...prev, phone: formattedPhone }));
        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
        if (apiError) setApiError('');
    };

    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;

        if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-danger-500' };
        if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-warning-500' };
        if (score <= 4) return { level: 3, label: 'Good', color: 'bg-info-500' };
        return { level: 4, label: 'Strong', color: 'bg-success-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone || formData.phone.length <= 1) { // checking length <= 1 to handle just '+'
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Phone number must be at least 10 digits';
        } else if (formData.phone.replace(/\D/g, '').length > 15) {
            newErrors.phone = 'Phone number is too long';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the Terms and Conditions';
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
            await register({
                ...formData,
                role: selectedRole,
            });

            toast.success('Account created successfully! Please sign in.');
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Registration error response:', error.response?.data);
            const message = error.response?.data?.message || 'Registration failed.';

            // Map backend validation errors to fields
            if (error.response?.data?.errors) {
                const backendErrors = {};
                error.response.data.errors.forEach(err => {
                    backendErrors[err.field] = err.msg || err.message;
                });
                setErrors(prev => ({ ...prev, ...backendErrors }));
            }

            setApiError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full pl-11 pr-4 py-2.5 rounded-lg border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 ${errors[field]
            ? 'border-danger-400 focus:border-danger-500'
            : 'border-dark-200 focus:border-primary-500'
        }`;

    return (
        <div className="min-h-screen flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-lg">
                <div className="card p-8 shadow-xl">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                            <HiOutlineUserPlus className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-dark-900 mb-1">Create Account</h1>
                        <p className="text-dark-500 text-sm">Choose your role and get started</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-dark-700 mb-3 text-center">I am a...</label>
                        <div className="flex justify-center gap-3">
                            {Object.entries(ROLE_CONFIG)
                                .filter(([role]) => role === selectedRole)
                                .map(([role, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <div
                                            key={role}
                                            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 w-32 ${config.borderActive} shadow-md`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.color}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-center">
                                                <p className={`text-xs font-bold ${config.text}`}>
                                                    {config.label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                            <HiOutlineExclamationTriangle className="w-5 h-5 text-danger-500 flex-shrink-0" />
                            <p className="text-sm text-danger-700 font-medium">{apiError}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-dark-700 mb-1.5">First Name</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. John" className={inputClass('firstName')} />
                                </div>
                                {errors.firstName && <p className="mt-1 text-xs text-danger-600">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark-700 mb-1.5">Last Name</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Doe" className={inputClass('lastName')} />
                                </div>
                                {errors.lastName && <p className="mt-1 text-xs text-danger-600">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-dark-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" className={inputClass('email')} />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-danger-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-dark-700 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <PhoneInput
                                    country={'in'}
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    inputClass={inputClass('phone')}
                                    containerStyle={{ width: '100%' }}
                                    inputStyle={{ width: '100%', height: '42px', paddingTop: '10px', paddingBottom: '10px' }}
                                    buttonStyle={{ borderColor: errors.phone ? '#f87171' : '#e2e8f0', backgroundColor: 'transparent' }}
                                />
                            </div>
                            {errors.phone && <p className="mt-1 text-xs text-danger-600">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-dark-700 mb-1.5">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass('password')} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 p-1"
                                >
                                    {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-danger-600">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-dark-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass('confirmPassword')} />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 p-1"
                                >
                                    {showConfirmPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-xs text-danger-600">{errors.confirmPassword}</p>}
                        </div>

                        <div className="flex flex-col mt-2">
                            <label className="flex items-center gap-2 cursor-pointer leading-none">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className={`w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer ${errors.agreeTerms ? 'border-danger-500 ring-1 ring-danger-500' : 'border-dark-300'}`}
                                />
                                <span className="text-sm text-dark-600 mt-0.5">
                                    I agree to the{' '}
                                    <Link to="/terms" target="_blank" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                        Terms and Conditions
                                    </Link>{' '}
                                    <span className="text-danger-500">*</span>
                                </span>
                            </label>
                            {errors.agreeTerms && <p className="text-xs text-danger-600 mt-1">{errors.agreeTerms}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 gradient-primary text-white font-semibold rounded-lg text-sm shadow-md transition-all ${isLoading ? 'opacity-70' : 'hover:opacity-90'}`}
                        >
                            {isLoading ? 'Creating account...' : `Register as ${ROLE_CONFIG[selectedRole].label}`}
                        </button>
                    </form>

                    <p className="text-center text-sm text-dark-500 mt-6">
                        Already have an account? <Link to={`/login-${selectedRole}`} className="font-semibold text-primary-600">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
