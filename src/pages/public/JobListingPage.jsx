import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Country, State } from 'country-state-city';
import {
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineClock,
    HiOutlineCurrencyRupee,
    HiOutlineUser,
    HiOutlineBanknotes
} from 'react-icons/hi2';

const CURRENCY_SYMBOLS = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'AED '
};
import { getPublicJobs, getAvailableCategories } from '../../api/jobs.api';
import { applyToJob } from '../../api/applications.api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
const SKILLS_LIST = ['Node.js', 'React.js', 'Python', 'Java', 'SQL', 'C++', 'AWS'];
const STATES_LIST = ['Alberta', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'California', 'Gujarat', 'Maharashtra', 'New York', 'Texas'];
const EXPERIENCES_LIST = ['Fresher', '0-2 Years', '2-4 Years', '5+ Years'];

const JobListingPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [applyingId, setApplyingId] = useState(null);
    const [categoriesList, setCategoriesList] = useState([]);


    const [filters, setFilters] = useState({
        title: searchParams.get('title') || '',
        location: searchParams.get('location') || '',
        categories: searchParams.get('category') ? [searchParams.get('category')] : [],
        skills: [],
        country: searchParams.get('country') || '',
        state: searchParams.get('state') || '',
        experience: [],
        salaryMin: '',
        salaryMax: ''
    });

    const [statesList, setStatesList] = useState([]);

    useEffect(() => {
        // Find country code for initial load
        const allCountries = Country.getAllCountries();
        const countryObj = allCountries.find(c => c.name === filters.country);
        if (countryObj) {
            setStatesList(State.getStatesOfCountry(countryObj.isoCode));
        } else {
            setStatesList([]);
        }
    }, [filters.country]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getAvailableCategories();
                if (res.success && res.data) {
                    setCategoriesList(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch available categories", error);
            }
        };
        fetchCategories();
    }, []);

    const [skillSearch, setSkillSearch] = useState('');

    // Sync from URL params when changed
    useEffect(() => {
        const paramCategory = searchParams.get('category');
        if (paramCategory) {
            setFilters(prev => {
                if (!prev.categories.includes(paramCategory)) {
                    return { ...prev, categories: [paramCategory] };
                }
                return prev;
            });
        }
    }, [searchParams]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: 10,
                title: filters.title,
                location: filters.location,
                country: filters.country,
                state: filters.state,
                salaryMin: filters.salaryMin,
                salaryMax: filters.salaryMax
            };
            if (filters.categories.length === 1) {
                params.category = filters.categories[0];
            } else if (filters.categories.length > 1) {
                params.categories = filters.categories.join(',');
            }
            if (filters.skills.length > 0) params.skills = filters.skills.join(',');
            if (filters.experience.length > 0) params.experience = filters.experience.join(',');

            // Clean empty params
            Object.keys(params).forEach(key => !params[key] && delete params[key]);

            const res = await getPublicJobs(params);
            if (res.success && res.data) {
                setJobs(res.data.jobs || []);
                setPagination({
                    total: res.data.pagination?.total || 0,
                    page: res.data.pagination?.page || 1,
                    totalPages: res.data.pagination?.totalPages || 1
                });
            }
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchJobs();
        }, 300);
        return () => clearTimeout(debounce);
    }, [filters, pagination.page]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleCheckboxChange = (field, value) => {
        setFilters(prev => {
            const arr = prev[field];
            const newArr = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];

            // Sync URL parameters for categories
            if (field === 'categories') {
                const params = new URLSearchParams(searchParams);
                if (newArr.length > 0) {
                    params.set('category', newArr[0]); // Simply take the first or join. Sticking to single selected for the header logic.
                } else {
                    params.delete('category');
                }
                setSearchParams(params, { replace: true });
            }

            return { ...prev, [field]: newArr };
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatSalary = (min, max, currency = 'INR') => {
        if (!min && !max) return 'Not disclosed';
        const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.INR;
        const fmt = (n) => n?.toLocaleString('en-IN') || 0;
        return `${symbol}${fmt(min)} - ${symbol}${fmt(max)}`;
    };

    const handleApply = async (jobId) => {
        if (!isAuthenticated) {
            toast.error('Login required to apply');
            navigate('/login-candidate');
            return;
        }

        if (user.role !== 'candidate') {
            toast.error('Only candidates can apply for jobs');
            return;
        }

        setApplyingId(jobId);
        try {
            await applyToJob(jobId);
            toast.success('Application submitted successfully!');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to apply';
            toast.error(message);

            // Redirect to profile if resume is missing
            if (message.includes('resume')) {
                setTimeout(() => {
                    navigate('/candidate-profile-settings');
                }, 1500);
            }
        } finally {
            setApplyingId(null);
        }

    };


    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `Posted ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200 pt-12 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                                Find Your <span className="text-primary-600">Dream Job</span>
                            </h1>
                            <p className="text-lg text-slate-500 max-w-2xl">
                                Explore thousands of job opportunities from top companies around the globe. Filter by your skills, preference, and location.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-primary-50 p-4 rounded-2xl border border-primary-100">
                            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                                <HiOutlineBriefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{pagination.total}</p>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Jobs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="card sticky top-24 overflow-hidden border-none shadow-sm ring-1 ring-slate-200 bg-white rounded-2xl">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Filters</h3>
                                <button
                                    onClick={() => setFilters({
                                        title: '', location: '', categories: [], skills: [], country: '', states: [], experience: [], salaryMin: '', salaryMax: ''
                                    })}
                                    className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    Reset All
                                </button>
                            </div>

                            <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                                {/* Job Search */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Keywords</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Job title, company..."
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                                value={filters.title}
                                                onChange={(e) => handleFilterChange('title', e.target.value)}
                                            />
                                            <HiOutlineBriefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Location</label>
                                        <div className="space-y-3">
                                            <select
                                                value={filters.country}
                                                onChange={(e) => {
                                                    handleFilterChange('country', e.target.value);
                                                    handleFilterChange('state', ''); // Reset state
                                                }}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none appearance-none"
                                            >
                                                <option value="">All Countries</option>
                                                {Country.getAllCountries().map(c => (
                                                    <option key={c.isoCode} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={filters.state}
                                                onChange={(e) => handleFilterChange('state', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none appearance-none"
                                                disabled={!filters.country}
                                            >
                                                <option value="">All States</option>
                                                {statesList.map(s => (
                                                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Categories */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Category</label>
                                    <div className="space-y-2.5">
                                        {categoriesList.map(c => (
                                            <label key={c} className="flex items-center gap-3 group cursor-pointer">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer"
                                                        checked={filters.categories.includes(c)}
                                                        onChange={() => handleCheckboxChange('categories', c)}
                                                    />
                                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-primary-600 transition-colors">{c}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Skills</label>
                                    <input
                                        type="text"
                                        placeholder="Search skills..."
                                        className="w-full px-4 py-2 mb-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary-500 transition-colors"
                                        value={skillSearch}
                                        onChange={(e) => setSkillSearch(e.target.value)}
                                    />
                                    <div className="space-y-2.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(s => (
                                            <label key={s} className="flex items-center gap-3 group cursor-pointer">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer"
                                                        checked={filters.skills.includes(s)}
                                                        onChange={() => handleCheckboxChange('skills', s)}
                                                    />
                                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-primary-600 transition-colors">{s}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Experience</label>
                                    <div className="space-y-2.5">
                                        {EXPERIENCES_LIST.map(e => (
                                            <label key={e} className="flex items-center gap-3 group cursor-pointer">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer"
                                                        checked={filters.experience.includes(e)}
                                                        onChange={() => handleCheckboxChange('experience', e)}
                                                    />
                                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-primary-600 transition-colors">{e}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Salary Range */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Salary Range</label>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">MIN</span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary-500 transition-colors"
                                                    value={filters.salaryMin}
                                                    onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">MAX</span>
                                                <input
                                                    type="number"
                                                    placeholder="50L+"
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary-500 transition-colors"
                                                    value={filters.salaryMax}
                                                    onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-6">
                        {/* Active Filter Chips */}
                        {(filters.title || filters.location || filters.categories.length > 0 || filters.skills.length > 0 || filters.experience.length > 0 || filters.salaryMin || filters.salaryMax) && (
                            <div className="flex flex-wrap items-center gap-2 pb-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Filtered by:</span>
                                {filters.title && (
                                    <div className="badge badge-primary gap-1 py-1 px-3">
                                        Title: {filters.title}
                                        <button onClick={() => setFilters(p => ({ ...p, title: '' }))} className="hover:text-primary-900 ml-1">×</button>
                                    </div>
                                )}
                                {filters.country && (
                                    <div className="badge badge-primary gap-1 py-1 px-3">
                                        Country: {filters.country}
                                        <button onClick={() => setFilters(p => ({ ...p, country: '', state: '' }))} className="hover:text-primary-900 ml-1">×</button>
                                    </div>
                                )}
                                {filters.state && (
                                    <div className="badge badge-primary gap-1 py-1 px-3">
                                        State: {filters.state}
                                        <button onClick={() => setFilters(p => ({ ...p, state: '' }))} className="hover:text-primary-900 ml-1">×</button>
                                    </div>
                                )}
                                {filters.categories.map(c => (
                                    <div key={c} className="badge badge-primary gap-1 py-1 px-3">
                                        {c}
                                        <button onClick={() => {
                                            handleCheckboxChange('categories', c);
                                            // Handle removing it from URL if it was the last category
                                        }} className="hover:text-primary-900 ml-1">×</button>
                                    </div>
                                ))}
                                {filters.skills.map(s => (
                                    <div key={s} className="badge badge-primary gap-1 py-1 px-3">
                                        {s}
                                        <button onClick={() => handleCheckboxChange('skills', s)} className="hover:text-primary-900 ml-1">×</button>
                                    </div>
                                ))}
                                {filters.experience.map(e => (
                                    <div key={e} className="badge badge-primary gap-1 py-1 px-3">
                                        {e}
                                        <button onClick={() => handleCheckboxChange('experience', e)} className="hover:text-primary-900 ml-1">×</button>
                                    </div>
                                ))}
                                {(filters.salaryMin || filters.salaryMax) && (
                                    <div className="badge badge-primary gap-1 py-1 px-3">
                                        Salary: {filters.salaryMin || 0}k - {filters.salaryMax || '50L'}
                                        <button onClick={() => setFilters(p => ({ ...p, salaryMin: '', salaryMax: '' }))} className="hover:text-primary-900 ml-1">×</button>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setFilters({
                                            title: '', location: '', categories: [], skills: [], country: '', state: '', experience: [], salaryMin: '', salaryMax: ''
                                        });
                                        setSearchParams(new URLSearchParams(), { replace: true });
                                    }}
                                    className="text-[11px] font-bold text-slate-500 hover:text-danger-600 underline underline-offset-4 ml-2 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}

                        {/* Sort & View Options */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-4 mb-2">
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#1f2937] mb-1">
                                    {filters.categories.length === 1 ? `Jobs In ${filters.categories[0]}` : 'All Jobs'} ({pagination.total} Jobs)
                                </h2>
                                <p className="text-[15px] font-medium text-slate-500">
                                    Get your desired job from top companies
                                </p>
                            </div>
                        </div>

                        {/* Job Cards */}
                        <div className="space-y-5">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white p-7 rounded-3xl border border-slate-100 space-y-6">
                                            <div className="flex gap-5">
                                                <div className="w-16 h-16 skeleton rounded-2xl flex-shrink-0"></div>
                                                <div className="flex-1 space-y-4 pt-2">
                                                    <div className="h-5 skeleton rounded-full w-2/5"></div>
                                                    <div className="h-3 skeleton rounded-full w-1/4"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 skeleton rounded-full w-full opacity-60"></div>
                                                <div className="h-3 skeleton rounded-full w-4/5 opacity-60"></div>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 pt-4">
                                                <div className="flex gap-2">
                                                    <div className="h-8 skeleton rounded-xl w-24"></div>
                                                    <div className="h-8 skeleton rounded-xl w-24"></div>
                                                </div>
                                                <div className="h-10 skeleton rounded-xl w-32"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <HiOutlineBriefcase className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs matched</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">
                                        We couldn't find any jobs matching your current filters. Try adjusting your preferences or reset filters.
                                    </p>
                                    <button
                                        onClick={() => setFilters({
                                            title: '', location: '', categories: [], skills: [], country: '', state: '', experience: [], salaryMin: '', salaryMax: ''
                                        })}
                                        className="mt-6 font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {jobs.map(job => (
                                        <div key={job._id} className="group relative bg-white rounded-2xl transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md">
                                            <div className="p-6">
                                                <div className="flex flex-col sm:flex-row gap-5">
                                                    {/* Company Logo */}
                                                    <div className="flex-shrink-0">
                                                        <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                                                            {job.companyId?.logo ? (
                                                                <img src={job.companyId.logo} alt="Logo" className="w-full h-full object-contain" />
                                                            ) : (
                                                                <span className="text-2xl font-black text-slate-300 uppercase">
                                                                    {job.companyId?.companyName?.[0] || 'C'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        {/* Line 1: Title & Button */}
                                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                                                            <Link to={`/jobs/${job._id}`} className="text-[20px] font-bold text-[#1f2937] group-hover:text-blue-600 transition-colors">
                                                                {job.title}
                                                            </Link>
                                                            <div className="sm:block hidden">
                                                                <button
                                                                    onClick={() => handleApply(job._id)}
                                                                    disabled={applyingId === job._id}
                                                                    className={`px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold text-sm ${applyingId === job._id ? 'bg-slate-200 text-slate-500' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        }`}
                                                                >
                                                                    <HiOutlineBriefcase className="w-4 h-4" />
                                                                    {applyingId === job._id ? 'Applying...' : 'Apply Now'}
                                                                </button>
                                                            </div>

                                                        </div>

                                                        {/* Line 2: Company, Level, Location, Posted */}
                                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4 text-[#4b5563] text-sm font-medium">
                                                            <div className="flex items-center gap-1.5">
                                                                <HiOutlineBriefcase className="w-5 h-5 text-[#6b7280]" />
                                                                {job.companyId?.companyName}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <HiOutlineUser className="w-5 h-5 text-[#6b7280]" />
                                                                {job.experience}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
                                                                <HiOutlineMapPin className="w-5 h-5 text-[#6b7280]" />
                                                                {job.location || [job.city, job.state, job.country].filter(Boolean).join(', ') || 'No location'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <HiOutlineClock className="w-5 h-5 text-[#6b7280]" />
                                                                {formatDate(job.createdAt)}
                                                            </div>
                                                        </div>

                                                        {/* Line 3: CTC */}
                                                        <div className="flex items-center gap-1.5 text-[#4b5563] text-sm font-medium mb-4">
                                                            <HiOutlineBanknotes className="w-5 h-5 text-[#6b7280]" />
                                                            CTC: {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                                                        </div>

                                                        {/* Line 4: Skills */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-medium text-[#4b5563] mr-1">Skills:</span>
                                                            {job.requiredSkills?.map((skill, i) => (
                                                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 font-semibold text-[13px] rounded-full">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {/* Mobile Apply Button */}
                                                        <div className="sm:hidden mt-4 pt-4 border-t border-slate-100">
                                                            <button
                                                                onClick={() => handleApply(job._id)}
                                                                disabled={applyingId === job._id}
                                                                className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold text-sm ${applyingId === job._id ? 'bg-slate-200 text-slate-500' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                    }`}
                                                            >
                                                                <HiOutlineBriefcase className="w-4 h-4" />
                                                                {applyingId === job._id ? 'Applying...' : 'Apply Now'}
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <button
                                        disabled={pagination.page === 1}
                                        onClick={() => {
                                            setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-600 hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                    </button>

                                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => {
                                                        setPagination(prev => ({ ...prev, page: pageNum }));
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${pagination.page === pageNum ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        {pagination.totalPages > 5 && <span className="px-2 text-slate-400">...</span>}
                                    </div>

                                    <button
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => {
                                            setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-600 hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default JobListingPage;

