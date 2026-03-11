import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineSquare2Stack,
    HiOutlineArrowRight,
    HiOutlineBuildingOffice2,
    HiOutlineUsers,
    HiOutlineMapPin,
    HiOutlineBriefcase
} from 'react-icons/hi2';
import { getEmployerActiveJobs } from '../../api/employer.api';
import toast from 'react-hot-toast';
import { Skeleton, Box, Stack } from '@mui/material';

const EmployerAllJobsApplications = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await getEmployerActiveJobs({ page, limit: 5 });
                if (res.success) {
                    setJobs(res.data.jobs || []);
                    setPagination(res.data.pagination);
                }
            } catch (error) {
                toast.error('Failed to load active jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [page]);

    if (loading) return (
        <div className="space-y-6">
            <Box>
                <Skeleton variant="text" width={250} height={40} sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" width={400} height={20} sx={{ borderRadius: 1, mt: 1 }} />
            </Box>

            <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map(i => (
                    <Box key={i} sx={{ bgcolor: 'white', p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="text" width={100} height={20} />
                            </Stack>
                            <Skeleton variant="text" width="60%" height={32} sx={{ borderRadius: 1 }} />
                            <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
                                <Skeleton variant="text" width={150} height={20} />
                                <Skeleton variant="text" width={100} height={20} />
                            </Stack>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Skeleton variant="rounded" width={120} height={48} sx={{ borderRadius: '14px' }} />
                            <Skeleton variant="rounded" width={160} height={48} sx={{ borderRadius: '14px' }} />
                        </Stack>
                    </Box>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-[28px] font-black text-slate-900 tracking-tight">
                    View Applications
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Manage candidates and review talent for all your active jobs.
                </p>
            </div>

            {/* Active Jobs Grid */}
            <div className="grid grid-cols-1 gap-4">
                {jobs.length === 0 ? (
                    <div className="bg-white rounded-[24px] p-16 text-center border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlineBuildingOffice2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No active job postings</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                            Once your job requests are approved by recruiters, they will appear here.
                        </p>
                        <Link to="/employer/job-requests/new" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-sm">
                            Create Job Request
                            <HiOutlineArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job._id} className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Live & Active</span>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                                    {job.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <HiOutlineMapPin className="w-4 h-4 text-slate-400" />
                                        {job.location || job.city || "Location not specified"}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <HiOutlineBriefcase className="w-4 h-4 text-slate-400" />
                                        {job.vacancies} Openings
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Link
                                    to={`/employer/jobs/${job._id}/pipeline`}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-[14px] font-bold text-sm hover:bg-slate-800 transition-all shadow-sm"
                                >
                                    <HiOutlineSquare2Stack className="w-4 h-4" />
                                    Pipeline
                                </Link>
                                <Link
                                    to={`/employer/jobs/${job._id}/review`}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-50 text-primary-600 rounded-[14px] font-bold text-sm hover:bg-primary-100 transition-all border border-primary-100 focus:ring-4 focus:ring-primary-50"
                                >
                                    <HiOutlineUsers className="w-4 h-4" />
                                    Review Candidates
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 p-4 bg-white border border-slate-200 rounded-[20px] shadow-sm">
                    <button
                        onClick={() => setPage(prev => prev - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition-all border border-slate-200 active:scale-95"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-bold text-slate-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition-all border border-slate-200 active:scale-95"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmployerAllJobsApplications;
