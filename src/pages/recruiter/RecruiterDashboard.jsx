import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineChevronDown,
    HiOutlineBriefcase,
    HiOutlineAdjustmentsHorizontal,
    HiOutlineUsers,
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineMapPin,
    HiOutlineCurrencyRupee,
    HiOutlineBolt
} from 'react-icons/hi2';
import { getMyJobs, deleteJob, toggleJobStatus } from '../../api/recruiter.api';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ active: 0, total: 0 });

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await getMyJobs();
            if (res.success) {
                setJobs(res.data.jobs || []);
                const activeCount = res.data.jobs.filter(j => j.status === 'active').length;
                setStats({ active: activeCount, total: res.data.jobs.length });
            }
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await deleteJob(id);
            toast.success('Job deleted successfully');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to delete job');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleJobStatus(id);
            toast.success('Job status updated');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to update job status');
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ======= HEADER ======= */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight mb-1">
                        Manage Jobs
                    </h1>
                    <p className="text-slate-500 font-medium">
                        You have {stats.active} active job postings out of {stats.total} total
                    </p>
                </div>
                <Link
                    to="/recruiter/add-job"
                    className="bg-primary-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                >
                    <HiOutlineBriefcase className="w-5 h-5" />
                    Post New Job
                </Link>
            </div>

            {/* ======= FILTERS ======= */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by job title, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center justify-between gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 min-w-[160px] hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        All Status
                        <HiOutlineChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm">
                        <HiOutlineAdjustmentsHorizontal className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* ======= JOBS GRID ======= */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 animate-pulse">
                            <div className="h-6 w-1/3 bg-slate-100 rounded-full mb-4"></div>
                            <div className="h-4 w-1/4 bg-slate-50 rounded-full"></div>
                        </div>
                    ))
                ) : filteredJobs.length === 0 ? (
                    <div className="bg-white border border-slate-200 border-dashed rounded-[32px] p-24 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                            <HiOutlineBriefcase className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="max-w-xs text-center">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs found.</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Start by adding your first job posting to see it appear here in your management dashboard.
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div key={job._id} className="group bg-white rounded-[32px] p-1 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="p-7">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${job.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {job.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                                            {job.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[#64748b] text-sm font-bold uppercase tracking-tight">
                                            <div className="flex items-center gap-2">
                                                <HiOutlineMapPin className="w-5 h-5 text-slate-400" />
                                                {job.location || job.city}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HiOutlineCurrencyRupee className="w-5 h-5 text-slate-400" />
                                                ₹{job.salaryMin?.toLocaleString()} - ₹{job.salaryMax?.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HiOutlineUsers className="w-5 h-5 text-slate-400" />
                                                {job.vacancies} Openings
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Link
                                            to={`/recruiter/job/${job._id}/pipeline`}
                                            className="bg-indigo-50 text-indigo-600 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 transition-all active:scale-95"
                                        >
                                            <HiOutlineBolt className="w-5 h-5" />
                                            Pipeline
                                        </Link>
                                        <Link
                                            to={`/recruiter/job/${job._id}/applications`}
                                            className="bg-primary-50 text-primary-600 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-primary-100 transition-all active:scale-95"
                                        >
                                            <HiOutlineUsers className="w-5 h-5" />
                                            View Applications
                                        </Link>
                                        <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl gap-1">
                                            <button
                                                onClick={() => navigate(`/recruiter/job-requests/${job.jobRequestId || job._id}?edit=true`)}
                                                className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                                title="Edit Job"
                                            >
                                                <HiOutlineEye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                                title="Delete Job"
                                            >
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;
