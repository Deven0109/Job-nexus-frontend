import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineCalendarDays,
    HiOutlineUserCircle,
    HiOutlineBell,
    HiOutlineArrowRightOnRectangle,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineMagnifyingGlass,
    HiOutlineUsers,
    HiOutlineShieldCheck,
    HiOutlineClipboardDocumentList,
    HiOutlineBuildingOffice2,
    HiOutlineChartBar,
    HiOutlinePlusCircle,
    HiOutlineSquare2Stack,
    HiOutlineCog6Tooth,
    HiOutlineChevronDown
} from 'react-icons/hi2';

const getSidebarItems = (role) => {
    const items = {
        recruiter: [
            { label: 'Manage Jobs', to: '/recruiter/manage-jobs', icon: HiOutlineBriefcase },
            { label: 'Manage Categories', to: '/recruiter/categories', icon: HiOutlineBars3 },
            { label: 'Add Job', to: '/recruiter/add-job', icon: HiOutlinePlusCircle },
            { label: 'Profile Settings', to: '/recruiter/profile-settings', icon: HiOutlineCog6Tooth },
        ],
        employer: [
            { label: 'Dashboard', to: '/employer/dashboard', icon: HiOutlineHome },
            { label: 'Job Requests', to: '/employer/job-requests', icon: HiOutlineClipboardDocumentList },
            { label: 'View Applications', to: '/employer/pipelines', icon: HiOutlineSquare2Stack },

            { label: 'Company Profile', to: '/employer/profile', icon: HiOutlineBuildingOffice2 },
            { label: 'Profile Settings', to: '/employer/profile-settings', icon: HiOutlineCog6Tooth },
        ],
    };
    return items[role] || [];
};


const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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

    const sidebarItems = getSidebarItems(user?.role);

    const getProfileSettingsPath = () => {
        if (user?.role === 'recruiter') return '/recruiter/profile-settings';
        if (user?.role === 'candidate') return '/candidate-profile-settings';
        if (user?.role === 'employer') return '/employer/profile-settings';
        return '/';
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            {/* ======= SIDEBAR ======= */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-[100] transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center justify-between px-4 py-5">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <HiOutlineBriefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-extrabold text-[#0F172A] tracking-tight whitespace-nowrap">
                                Job <span className="text-blue-600">Consultancy</span>
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                        >
                            <HiOutlineXMark className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
                        <div className="space-y-1.5 font-medium">
                            {sidebarItems.map((item) => {
                                const isActive = location.pathname === item.to ||
                                    (item.to !== '/' && location.pathname.startsWith(item.to));
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 group ${isActive
                                            ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${isActive ? 'bg-white shadow-sm text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Bottom - Logout */}
                    <div className="p-3 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-slate-600 hover:text-red-600 bg-slate-50/50 hover:bg-red-50 rounded-xl transition-all duration-200 group border border-slate-100"
                        >
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shadow-sm text-slate-400 group-hover:text-red-500 border border-slate-100">
                                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                            </div>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* ======= MAIN AREA ======= */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
                {/* Topbar */}
                <header className="sticky top-0 z-[90] bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 h-16">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all"
                        >
                            <HiOutlineBars3 className="w-6 h-6 text-slate-600" />
                        </button>

                        {/* Dynamic Page Title */}
                        <div className="hidden md:flex items-center">
                            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {sidebarItems.find(i => location.pathname === i.to || (i.to !== '/' && location.pathname.startsWith(i.to)))?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group"
                            >
                                <div className="hidden sm:flex flex-col items-end text-right mr-1">
                                    <span className="text-sm font-bold text-slate-900 leading-none mb-1">
                                        {user?.role === 'recruiter' || user?.role === 'employer' ? user?.firstName : `${user?.firstName} ${user?.lastName}`}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium leading-none">
                                        {user?.email}
                                    </span>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100 overflow-hidden border-2 border-white">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-bold text-sm">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </span>
                                    )}
                                </div>
                                <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-5 py-4 border-b border-slate-50 mb-2">
                                            <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to={getProfileSettingsPath()}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                                        >
                                            <HiOutlineCog6Tooth className="w-5 h-5" />
                                            Profile Settings
                                        </Link>

                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-2 sm:p-4 bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
