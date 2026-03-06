import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineBriefcase,
    HiOutlineUsers,
    HiOutlineSquare2Stack,
    HiOutlineArrowRight,
    HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import { getEmployerActiveJobs } from '../../api/employer.api';
import toast from 'react-hot-toast';

const EmployerAllJobsApplications = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await getEmployerActiveJobs();
                if (res.success) {
                    setJobs(res.data.jobs || []);
                }
            } catch (error) {
                toast.error('Failed to load active jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) return (
        <div className="animate-pulse space-y-6">
            <div className="h-20 bg-slate-100 rounded-[32px]"></div>
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[32px]"></div>)}
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight mb-1">
                        View Applications
                    </h1>
                    <p className="text-slate-500 font-medium">Manage and review candidates for all your active job postings.</p>
                </div>
            </div>

            {/* Active Jobs Grid */}
            <div className="grid grid-cols-1 gap-6">
                {jobs.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
                        <HiOutlineBuildingOffice2 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active job postings</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            Once your job requests are approved by recruiters, they will appear here for you to manage applications.
                        </p>
                        <Link to="/employer/job-requests/new" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-100">
                            Create Job Request
                            <HiOutlineArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job._id} className="bg-white rounded-[40px] p-1 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                            <div className="p-7 sm:p-9 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">Live & Active</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            Posted on {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-bold text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            {job.location || job.city}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            {job.vacancies} Openings
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <Link
                                        to={`/employer/jobs/${job._id}/pipeline`}
                                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95"
                                    >
                                        <HiOutlineSquare2Stack className="w-5 h-5" />
                                        Hire Pipeline
                                    </Link>
                                    <Link
                                        to={`/employer/jobs/${job._id}/review`}
                                        className="bg-primary-50 text-primary-600 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary-100 transition-all border border-primary-100 active:scale-95"
                                    >
                                        <HiOutlineUsers className="w-5 h-5" />
                                        Review Candidates
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployerAllJobsApplications;
