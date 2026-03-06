import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineBriefcase,
    HiOutlineMagnifyingGlass,
    HiOutlineMapPin,
    HiOutlineArrowRight,
} from 'react-icons/hi2';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [searchTitle, setSearchTitle] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    const handleSearch = () => {
        if (!searchTitle.trim() && !searchLocation.trim()) {
            // If both are empty, do not redirect
            return;
        }

        // Redirect to All Jobs with query parameters
        const params = new URLSearchParams();
        if (searchTitle.trim()) params.append('title', searchTitle.trim());
        if (searchLocation.trim()) params.append('location', searchLocation.trim());

        navigate(`/jobs?${params.toString()}`);
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            // For recruiters and employers, we keep the auto-redirect to their professional dashboards
            if (user.role === 'recruiter') {
                navigate('/recruiter/manage-jobs', { replace: true });
            } else if (user.role === 'employer') {
                navigate('/employer/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="flex flex-col min-h-screen">
            {/* ======= HERO SECTION (Matching Screenshot) ======= */}
            <section className="relative min-h-[650px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Dark Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`,
                    }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl lg:text-7xl font-[900] text-white mb-6 tracking-tight animate-fade-in uppercase">
                        Find the Perfect <span className="text-blue-500">Job</span>
                    </h1>

                    <p className="text-lg lg:text-xl text-slate-200 mb-12 max-w-3xl mx-auto font-medium leading-relaxed opacity-90">
                        Your next big career move starts right here — explore the best job opportunities and take the first step toward your future!
                    </p>

                    {/* Search Bar Container (Glass Style Matching Screenshot) */}
                    <div className="max-w-5xl mx-auto bg-black/30 backdrop-blur-md p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 shadow-2xl border border-white/10">
                        {/* Title Input */}
                        <div className="relative flex-1 w-full bg-white rounded-lg flex items-center px-4 shadow-sm">
                            <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Title"
                                value={searchTitle}
                                onChange={(e) => setSearchTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full py-4 text-slate-800 font-semibold focus:outline-none placeholder:text-slate-400 bg-transparent"
                            />
                        </div>

                        {/* Location Input */}
                        <div className="relative flex-1 w-full bg-white rounded-lg flex items-center px-4 shadow-sm">
                            <HiOutlineMapPin className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Location"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full py-4 text-slate-800 font-semibold focus:outline-none placeholder:text-slate-400 bg-transparent"
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-lg transition-all shadow-lg active:scale-95"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* ======= POPULAR CATEGORIES (Visible for all) ======= */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Popular Job <span className="text-blue-600">Categories</span></h2>
                        <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mb-4"></div>
                        <p className="text-slate-500 font-medium">Discover top job categories tailored to your skills and career goals.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {[
                            { name: 'Programming', jobs: '1.2k+', icon: '💻' },
                            { name: 'Data Science', jobs: '850+', icon: '🤖' },
                            { name: 'Designing', jobs: '640+', icon: '🎨' },
                            { name: 'Networking', jobs: '420+', icon: '🌐' },
                            { name: 'Management', jobs: '310+', icon: '📊' },
                            { name: 'Marketing', jobs: '950+', icon: '📈' },
                            { name: 'Cybersecurity', jobs: '1.1k+', icon: '🔒' },
                        ].map((cat) => (
                            <div
                                key={cat.name}
                                onClick={() => navigate(`/jobs?category=${cat.name}`)}
                                className="group p-8 w-56 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center hover:bg-white hover:shadow-2xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-center mb-1">{cat.name}</h4>
                                <p className="text-sm font-semibold text-slate-500">{cat.jobs} Open Vacancies</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======= QUICK ACCESS MODULES ======= */}
            {isAuthenticated && user?.role === 'candidate' && (
                <section className="py-12 bg-slate-50 border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Your Modules</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'Applied Jobs', to: '/candidate-applications', icon: HiOutlineBriefcase, color: 'blue' },
                                { title: 'Search Jobs', to: '/jobs', icon: HiOutlineMagnifyingGlass, color: 'blue' },
                                { title: 'Profile Settings', to: '/candidate-profile-settings', icon: HiOutlineArrowRight, color: 'blue' },
                            ].map((module) => (
                                <Link
                                    key={module.title}
                                    to={module.to}
                                    className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <module.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium">Click to manage this module</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ======= EXPLORE OTHER SECTIONS ======= */}
            <section className="py-24 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Why Choose Job Consultancy?</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto mb-16 text-lg font-medium leading-relaxed">
                        We connect dedicated talent with the world's most innovative companies.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Direct Hiring',
                                desc: 'Communicate directly with recruiters and founders without the middleman.',
                                icon: HiOutlineBriefcase,
                            },
                            {
                                title: 'Salary Transparency',
                                desc: 'We only show job postings that have clear salary ranges and benefits listed.',
                                icon: HiOutlineMagnifyingGlass,
                            },
                            {
                                title: 'Verified Companies',
                                desc: 'Every employer on our platform is hand-verified to ensure safe applications.',
                                icon: HiOutlineShieldCheck,
                            }
                        ].map((item) => (
                            <div key={item.title} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

// Internal icon proxy if needed
const HiOutlineShieldCheck = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.038A12.006 12.006 0 003 12c0 5.033 4.07 9.172 9.145 9.857a11.968 11.968 0 006.473-1.448C21.758 16.912 24 12.721 24 8a12.006 12.006 0 00-2.382-7.016z" />
    </svg>
);

export default HomePage;
