import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineClock,
    HiOutlineCurrencyRupee,
    HiOutlineUser,
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineBanknotes
} from 'react-icons/hi2';

const CURRENCY_SYMBOLS = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'AED '
};
import { getPublicJobs } from '../../api/jobs.api';
import { applyToJob } from '../../api/applications.api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const JobDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                // Assuming getPublicJobs can take a slug or we search for it
                const res = await getPublicJobs({ slug });
                if (res.success && res.data.jobs?.length > 0) {
                    setJob(res.data.jobs[0]);
                } else {
                    toast.error('Job not found');
                    navigate('/jobs');
                }
            } catch (error) {
                toast.error('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [slug, navigate]);

    const handleApply = async () => {
        if (!isAuthenticated) {
            toast.error('Login required to apply');
            navigate('/login-candidate');
            return;
        }

        if (user.role !== 'candidate') {
            toast.error('Only candidates can apply for jobs');
            return;
        }

        setApplying(true);
        try {
            await applyToJob(job._id);
            toast.success('Application submitted successfully!');
            // Optional: refresh or show applied status
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
            setApplying(false);
        }

    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!job) return null;

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-slate-200 py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors mb-4"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                        Back to jobs
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-5">
                            <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden p-2 shadow-sm">
                                {job.companyId?.logo ? (
                                    <img src={job.companyId.logo} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-3xl font-black text-slate-300 uppercase">
                                        {job.companyId?.companyName?.[0] || 'C'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineBriefcase className="w-5 h-5" />
                                        {job.companyId?.companyName}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineMapPin className="w-5 h-5" />
                                        {job.location || [job.city, job.state, job.country].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleApply}
                            disabled={applying}
                            className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${applying ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-200 active:scale-95'
                                }`}
                        >
                            {applying ? 'Applying...' : 'Apply Now'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Job Description</h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                {job.description || 'No description provided.'}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Required Skills</h2>
                            <div className="flex flex-wrap gap-3">
                                {job.requiredSkills?.map((skill, i) => (
                                    <span key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-2xl">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Job Overview</h2>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <HiOutlineClock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted on</p>
                                        <p className="text-sm font-bold text-slate-700">{new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <HiOutlineUser className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                                        <p className="text-sm font-bold text-slate-700">{job.experience}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <HiOutlineBanknotes className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offered Salary</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {CURRENCY_SYMBOLS[job.currency] || CURRENCY_SYMBOLS.INR}{job.salaryMin?.toLocaleString()} - {CURRENCY_SYMBOLS[job.currency] || CURRENCY_SYMBOLS.INR}{job.salaryMax?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <HiOutlineBriefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employment Type</p>
                                        <p className="text-sm font-bold text-slate-700 capitalize">{job.workType || 'Full Time'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleApply}
                                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all"
                                >
                                    Quick Apply
                                </button>
                            </div>
                        </div>

                        {/* Share or Info */}
                        <div className="bg-primary-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-100">
                            <h3 className="text-lg font-bold mb-3">Why join us?</h3>
                            <p className="text-primary-100 text-sm leading-relaxed mb-6">
                                We offer competitive salaries, flexible work hours, and a vibrant work culture that fosters growth and innovation.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm font-medium">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-primary-200" />
                                    Health Insurance
                                </li>
                                <li className="flex items-center gap-2 text-sm font-medium">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-primary-200" />
                                    Performance Bonus
                                </li>
                                <li className="flex items-center gap-2 text-sm font-medium">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-primary-200" />
                                    Remote Friendly
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;
