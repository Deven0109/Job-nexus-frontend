import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineBriefcase,
    HiOutlineUserGroup,
    HiOutlinePhone,
    HiOutlineUserCircle,
    HiOutlineChevronDown,
    HiOutlineArrowRightOnRectangle,
    HiOutlineCog6Tooth,
    HiOutlineHome
} from 'react-icons/hi2';

const PublicLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isAuthPage = ['/login', '/register', '/forgot-password'].some((p) =>
        location.pathname.startsWith(p)
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const role = user?.role;
        await logout();
        if (role === 'employer') {
            navigate('/login-employer');
        } else if (role === 'recruiter') {
            navigate('/login-recruiter');
        } else {
            navigate('/login-candidate');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-dark-50">
            {/* ======= NAVBAR ======= */}
            {!isAuthPage && (
                <nav className="sticky top-0 z-50 glass shadow-navbar">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 transition-all duration-300 group-hover:scale-110">
                                    <HiOutlineBriefcase className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-extrabold text-[#0F172A] tracking-tight whitespace-nowrap">
                                    Job <span className="text-blue-600">Consultancy</span>
                                </span>
                            </Link>

                            {/* Navigation Links - Hide for recruiters and employers */}
                            {!['recruiter', 'employer'].includes(user?.role) && (
                                <div className="hidden md:flex items-center gap-1">
                                    <NavLink to="/" active={location.pathname === '/'}>
                                        Home
                                    </NavLink>
                                    <NavLink to="/jobs" active={location.pathname.startsWith('/jobs')}>
                                        All Jobs
                                    </NavLink>
                                    <NavLink to="/about" active={location.pathname === '/about'}>
                                        About
                                    </NavLink>
                                    <NavLink to="/terms" active={location.pathname === '/terms'}>
                                        Terms
                                    </NavLink>
                                    {isAuthenticated && user?.role === 'candidate' && (
                                        <NavLink to="/candidate-applications" active={location.pathname.startsWith('/candidate-applications')}>
                                            Applied Jobs
                                        </NavLink>
                                    )}
                                </div>
                            )}

                            {/* Auth / Profile Area */}
                            <div className="flex items-center gap-3">
                                {isAuthenticated ? (
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-100 transition-colors"
                                        >
                                            <span className="hidden sm:inline text-sm font-semibold text-dark-700">
                                                Hi, {user?.firstName} {user?.lastName}
                                            </span>
                                            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm overflow-hidden">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                                )}
                                            </div>
                                            <HiOutlineChevronDown className={`w-4 h-4 text-dark-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isProfileOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-dark-100 overflow-hidden py-1 z-50 animate-fade-in">
                                                {!['recruiter', 'employer'].includes(user?.role) && (
                                                    <Link
                                                        to="/candidate-profile-settings"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 hover:text-primary-600 transition-colors"
                                                    >
                                                        <HiOutlineCog6Tooth className="w-5 h-5 text-dark-400 group-hover:text-primary-600" />
                                                        Profile Settings
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                                                >
                                                    <HiOutlineArrowRightOnRectangle className="w-5 h-5 text-dark-400 group-hover:text-danger-600" />
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to="/login-employer"
                                            className="px-4 py-2 text-sm font-bold text-dark-700 hover:text-blue-600 transition-colors"
                                        >
                                            Employer Login
                                        </Link>
                                        <Link
                                            to="/login-recruiter"
                                            className="px-4 py-2 text-sm font-bold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                                        >
                                            Recruiter Login
                                        </Link>
                                        <Link
                                            to="/login-candidate"
                                            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                                        >
                                            Candidate Login
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* ======= MAIN CONTENT ======= */}
            <main className="flex-1">
                <div className="page-enter">
                    <Outlet />
                </div>
            </main>

            {/* ======= FOOTER ======= */}
            {!isAuthPage && (
                <footer className="bg-dark-900 text-dark-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Brand */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center">
                                        <HiOutlineBriefcase className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        Job<span className="text-primary-400">Consult</span>
                                    </span>
                                </div>
                                <p className="text-dark-400 text-sm leading-relaxed max-w-md">
                                    Connecting top talent with leading companies worldwide. Our consultancy
                                    streamlines the hiring process for both candidates and employers.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                                    Quick Links
                                </h4>
                                <ul className="space-y-2">
                                    {['Browse Jobs', 'For Employers', 'About Us', 'Contact'].map((link) => (
                                        <li key={link}>
                                            <Link
                                                to="/"
                                                className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
                                            >
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                                    Contact
                                </h4>
                                <ul className="space-y-2 text-dark-400 text-sm">
                                    <li className="flex items-center gap-2">
                                        <HiOutlinePhone className="w-4 h-4" />
                                        +1 (555) 123-4567
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <HiOutlineUserGroup className="w-4 h-4" />
                                        hr@jobconsult.com
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-dark-700 mt-10 pt-6 text-center">
                            <p className="text-dark-500 text-xs">
                                © {new Date().getFullYear()} JobConsult. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

const NavLink = ({ to, active, children }) => (
    <Link
        to={to}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
            ? 'text-primary-600 bg-primary-50'
            : 'text-dark-600 hover:text-primary-600 hover:bg-dark-100'
            }`}
    >
        {children}
    </Link>
);

export default PublicLayout;
