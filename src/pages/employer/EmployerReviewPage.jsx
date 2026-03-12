import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineDocumentArrowDown,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineInformationCircle
} from 'react-icons/hi2';

import { getEmployerShortlisted, updateEmployerStatus } from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import { Skeleton, Box, Stack } from '@mui/material';

const EmployerReviewPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchShortlisted = async () => {
        setLoading(true);
        try {
            const res = await getEmployerShortlisted(jobId, { page, limit: 6 });
            if (res.success) {
                // Backward compatibility if API isn't returning wrapped structure yet
                if (res.data.applications && res.data.pagination) {
                    setApplications(res.data.applications);
                    setPagination(res.data.pagination);
                } else {
                    setApplications(res.data);
                }
            }
        } catch (error) {
            toast.error('Failed to load shortlisted candidates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShortlisted();
    }, [jobId, page]);

    const handleAction = async (id, action) => {
        try {
            await updateEmployerStatus(id, action);
            toast.success(`Candidate ${action === 'approve' ? 'approved' : 'rejected'}`);
            fetchShortlisted();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={48} height={48} sx={{ borderRadius: '16px' }} />
                <Box>
                    <Skeleton variant="text" width={200} height={32} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width={300} height={20} sx={{ borderRadius: 1, mt: 0.5 }} />
                </Box>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-[20px] p-5 border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                        <Skeleton variant="circular" width={64} height={64} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="40%" height={28} sx={{ borderRadius: 1 }} />
                            <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                <Skeleton variant="text" width={150} height={16} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="text" width={120} height={16} sx={{ borderRadius: 1 }} />
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                            </Stack>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Skeleton variant="rounded" width={120} height={44} sx={{ borderRadius: '14px' }} />
                            <Skeleton variant="rounded" width={100} height={44} sx={{ borderRadius: '14px' }} />
                            <Skeleton variant="rounded" width={120} height={44} sx={{ borderRadius: '14px' }} />
                        </Stack>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                >
                    <HiOutlineArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review Candidates</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Evaluate verified talent shortlisted by your dedicated recruiter
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {applications.length === 0 ? (
                    <div className="col-span-full">
                        <div className="bg-white rounded-[24px] p-16 text-center border border-slate-200 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <HiOutlineInformationCircle className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">No Candidates to Review</h3>
                            <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
                                When our recruiters find and shortlist the perfect candidates for this role, they will appear here.
                            </p>
                        </div>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app._id} className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Candidate Info */}
                            <div className="flex items-start md:items-center gap-5 flex-1 w-full">
                                <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0 overflow-hidden text-primary-600 shadow-sm">
                                    {app.candidate?.avatar && (
                                        <img
                                            src={
                                                app.candidate.avatar.startsWith('http') ||
                                                app.candidate.avatar.startsWith('data:')
                                                    ? app.candidate.avatar
                                                    : `${BASE_URL}${app.candidate.avatar}`
                                            }
                                            className="w-full h-full object-cover"
                                            alt="avatar"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    {!app.candidate?.avatar && (
                                        <span className="text-xl font-bold uppercase">
                                            {app.candidate?.firstName?.[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                            {app.candidate?.firstName} {app.candidate?.lastName}
                                        </h3>
                                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-200 uppercase tracking-widest shrink-0">
                                            Elite Match
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-1.5">
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <HiOutlineEnvelope className="w-4 h-4 text-slate-400" />
                                            <span className="truncate">{app.candidate?.email}</span>
                                        </p>
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                                            {app.candidate?.phone || 'Private Number'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {(app.candidateProfile?.skills?.slice(0, 4) || ['Verified Competence', 'Communication']).map((skill, idx) => (
                                            <span key={idx} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end md:justify-start pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <a
                                    href={app.candidateProfile?.resumeUrl?.startsWith('http') ? app.candidateProfile.resumeUrl : `${BASE_URL}${app.candidateProfile?.resumeUrl || app.resumeUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-[14px] font-bold text-sm hover:bg-slate-50 hover:text-primary-600 transition-all shadow-sm"
                                    title="View Resume"
                                >
                                    <HiOutlineDocumentArrowDown className="w-5 h-5" />
                                    View Resume
                                </a>
                                <button
                                    onClick={() => handleAction(app._id, 'reject')}
                                    className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-[14px] font-bold text-sm transition-all shadow-sm"
                                    title="Reject Candidate"
                                >
                                    <HiOutlineXCircle className="w-5 h-5" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(app._id, 'approve')}
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-[14px] font-bold text-sm transition-all shadow-sm active:scale-95"
                                >
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-[20px] shadow-sm">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-700">
                                Showing <span className="font-bold">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                                <span className="font-bold">{pagination.total}</span> candidates
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrevPage}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <HiOutlineArrowLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {/* Display specific pages can be complex, so we just show the numbers */}
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${pagination.page === i + 1
                                            ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                            : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={!pagination.hasNextPage}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <HiOutlineArrowLeft className="h-5 w-5 rotate-180" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerReviewPage;
