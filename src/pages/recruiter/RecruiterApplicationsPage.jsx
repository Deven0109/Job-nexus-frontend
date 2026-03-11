import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineDocumentText,
    HiOutlineCalendar,
    HiOutlineMagnifyingGlass,
    HiOutlineUser,
    HiOutlinePaperAirplane,
    HiOutlineCheckCircle,
    HiOutlineXMark,
    HiOutlineVideoCamera,
    HiOutlineClock,
    HiOutlineAcademicCap,
    HiOutlineBriefcase,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineChevronDown
} from 'react-icons/hi2';
import { Skeleton, Box, Stack } from '@mui/material';
import {
    getJobApplications,
    updateApplicationStatus,
    scheduleInterview
} from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_THEMES = {
    'Applied': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'New Applied' },
    'Under Review': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Reviewing' },
    'Recruiter Shortlisted': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', label: 'Recruiter SL' },
    'Employer Shortlisted': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Employer Approved' },
    'Interview Scheduled': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', label: 'Interviewing' },
    'Selected Next Round': { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', label: 'Next Round' },
    'Final Selected': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'Hired' },
    'Final Rejected': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Rejected' },
    'Recruiter Rejected': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', label: 'Rejected' },
    'Employer Rejected': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: 'Rejected' }
};

const RecruiterApplicationsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isScheduling, setIsScheduling] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination & Filter States
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const limit = 8;

    const [interviewData, setInterviewData] = useState({
        roundNumber: 1,
        meetLink: '',
        meetCode: '',
        scheduledAt: ''
    });

    const fetchApplications = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const res = await getJobApplications(jobId);
            if (res.success) {
                setApplications(res.data);
                if (res.data.length > 0) setJobDetails(res.data[0].job);
            }
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const processedApps = applications
        .filter(app => {
            const name = `${app.candidate?.firstName} ${app.candidate?.lastName}`.toLowerCase();
            const matchesSearch = name.includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

    const totalFiltered = processedApps.length;
    const totalPages = Math.ceil(totalFiltered / limit);
    const paginatedApps = processedApps.slice((page - 1) * limit, page * limit);
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, totalFiltered);

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const handleStatusUpdate = async (id, status) => {
        const loadingToast = toast.loading('Syncing...');
        try {
            await updateApplicationStatus(id, status);
            toast.dismiss(loadingToast);
            toast.success(`Updated`);
            fetchApplications(true);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed');
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await scheduleInterview(isScheduling, interviewData);
            toast.success('Scheduled');
            setIsScheduling(null);
            fetchApplications(true);
        } catch (error) {
            toast.error('Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} sx={{ borderRadius: '12px' }} />
                <Box>
                    <Skeleton variant="text" width={180} height={32} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width={120} height={16} sx={{ borderRadius: 1, mt: 0.5 }} />
                </Box>
            </div>

            <Box sx={{ bgcolor: 'white', p: 1, borderRadius: '24px', border: '1px solid', borderColor: 'divider', mb: 2 }}>
                <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: '16px' }} />
            </Box>

            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white rounded-[24px] border border-slate-200 p-4 flex items-center gap-6">
                        <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: '16px' }} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="40%" height={24} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="text" width="25%" height={20} sx={{ borderRadius: 1, mt: 1 }} />
                        </Box>
                        <Box sx={{ display: { xs: 'none', lg: 'block' }, width: 220 }}>
                            <Skeleton variant="text" width="80%" height={16} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="text" width="60%" height={16} sx={{ borderRadius: 1, mt: 1 }} />
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Skeleton variant="rounded" width={120} height={40} sx={{ borderRadius: '12px' }} />
                            <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: '12px' }} />
                        </Stack>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 min-h-screen bg-slate-50/20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/recruiter/manage-jobs')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-dark-900 tracking-tight leading-none">Applications</h1>
                        <p className="text-primary-600 font-bold text-xs uppercase tracking-widest mt-1.5">
                            {jobDetails?.title || 'Job ID: ' + jobId}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isRefreshing && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Syncing...</span>
                        </div>
                    )}
                    <Link
                        to={`/recruiter/job/${jobId}/pipeline`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all active:scale-95"
                    >
                        <HiOutlineCalendar className="w-4 h-4" />
                        Pipeline
                    </Link>
                </div>
            </div>

            {/* Combined Filter/Search Bar */}
            <div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2 mb-4">
                <div className="flex-1 relative">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        placeholder="Search by candidate name..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-slate-50 focus:bg-white text-xs font-bold transition-all outline-none"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border-none text-[10px] font-black text-slate-600 appearance-none cursor-pointer outline-none w-full sm:w-44"
                    >
                        <option value="all">ALL STAGES</option>
                        <option value="Applied">NEW APPLIED</option>
                        <option value="Under Review">UNDER REVIEW</option>
                        <option value="Employer Shortlisted">SHORTLISTED</option>
                        <option value="Interview Scheduled">INTERVIEWING</option>
                        <option value="Final Selected">HIRED</option>
                        <option value="Final Rejected">REJECTED</option>
                    </select>
                    <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* List View */}
            <div className="space-y-3">
                {paginatedApps.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-[32px] p-16 text-center">
                        <HiOutlineUser className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-black text-dark-900">No data found</h3>
                    </div>
                ) : (
                    paginatedApps.map((app) => (
                        <div
                            key={app._id}
                            className="bg-white rounded-[24px] border border-slate-200 p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center gap-6 hover:border-primary-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                        >
                            {/* Profile Section */}
                            <div className="flex items-center gap-4 min-w-[260px]">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border-2 border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                                    {app.candidate?.avatar ? (
                                        <img
                                            src={app.candidate.avatar.startsWith('http') ? app.candidate.avatar : `${BASE_URL}${app.candidate.avatar}`}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-primary-600 font-black text-xl">{app.candidate?.firstName?.[0]}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-black text-dark-900 truncate tracking-tight">
                                        {app.candidate?.firstName} {app.candidate?.lastName}
                                    </h3>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase border mt-1.5 tracking-wider ${STATUS_THEMES[app.status]?.bg} ${STATUS_THEMES[app.status]?.text} ${STATUS_THEMES[app.status]?.border}`}>
                                        {STATUS_THEMES[app.status]?.label || app.status}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="flex flex-col gap-1.5 text-xs font-bold text-dark-600 min-w-[200px]">
                                <div className="flex items-center gap-2 truncate">
                                    <HiOutlineEnvelope className="w-4 h-4 text-slate-400" />
                                    <span>{app.candidate?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                                    <span>{app.candidate?.phone || app.candidateProfile?.mobileNumber || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Live Interview Meeting Box */}
                            <div className="flex-1 lg:max-w-[380px]">
                                {app.status === 'Interview Scheduled' && app.interviewRounds?.length > 0 && (
                                    <div className="bg-purple-600/5 rounded-[22px] p-2.5 pr-4 border border-purple-100 flex items-center gap-4 group/box transition-all duration-300 hover:bg-purple-600/10">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 shrink-0 group-hover/box:scale-110 transition-transform">
                                            <HiOutlineVideoCamera className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">
                                                Round {app.interviewRounds[app.interviewRounds.length - 1].roundNumber}
                                            </p>
                                            <p className="text-[15px] font-black text-dark-800 tracking-tight leading-none">
                                                {new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <a
                                            href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-5 py-2.5 bg-purple-600 text-white text-[11px] font-black uppercase rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-200 active:scale-95 whitespace-nowrap"
                                        >
                                            Join Now
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Workflow Actions */}
                            <div className="flex flex-wrap items-center gap-3 lg:ml-auto pr-2">
                                <a
                                    href={(app.resumeUrl || app.candidateProfile?.resumeUrl)?.startsWith('http') ? (app.resumeUrl || app.candidateProfile?.resumeUrl) : `${BASE_URL}${app.resumeUrl || app.candidateProfile?.resumeUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-3 bg-blue-600 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                >
                                    View Resume
                                </a>

                                {app.status === 'Applied' && (
                                    <button
                                        onClick={() => handleStatusUpdate(app._id, 'review')}
                                        className="px-5 py-3 bg-amber-500 text-white text-xs font-black uppercase rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all active:scale-95"
                                    >
                                        Review
                                    </button>
                                )}

                                {app.status === 'Under Review' && (
                                    <button
                                        onClick={() => handleStatusUpdate(app._id, 'shortlist')}
                                        className="px-5 py-3 bg-indigo-600 text-white text-xs font-black uppercase rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        Shortlist
                                    </button>
                                )}

                                {(app.status === 'Employer Shortlisted' || app.status === 'Selected Next Round') && (
                                    <button
                                        onClick={() => setIsScheduling(app._id)}
                                        className="px-5 py-3 bg-teal-600 text-white text-xs font-black uppercase rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95"
                                    >
                                        Schedule
                                    </button>
                                )}

                                {app.status === 'Interview Scheduled' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'final-select')}
                                            className="px-5 py-3 bg-green-600 text-white text-xs font-black uppercase rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                                        >
                                            Hire
                                        </button>
                                        <button
                                            onClick={() => setIsScheduling(app._id)}
                                            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all shadow-sm border border-slate-200"
                                            title="Reschedule"
                                        >
                                            <HiOutlineCalendar className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {['Applied', 'Under Review', 'Interview Scheduled'].includes(app.status) && (
                                    <button
                                        onClick={() => handleStatusUpdate(app._id, 'reject')}
                                        className="px-5 py-3 bg-red-50 text-red-600 text-xs font-black uppercase rounded-xl hover:bg-red-100 border border-red-100 shadow-sm transition-all active:scale-95"
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-1.5">
                    <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 text-slate-400 hover:text-primary-600 disabled:opacity-30"><HiOutlineChevronLeft className="w-4 h-4" /></button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} className={`w-7 h-7 rounded-lg text-[10px] font-black ${page === i + 1 ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-2 text-slate-400 hover:text-primary-600 disabled:opacity-30"><HiOutlineChevronRight className="w-4 h-4" /></button>
                </div>
            )}

            {/* True Full-Screen Interview Modal */}
            {isScheduling && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-black text-dark-900 uppercase tracking-widest">Schedule Setup</h2>
                            <button onClick={() => setIsScheduling(null)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                                <HiOutlineXMark className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleScheduleSubmit} className="p-10 space-y-8">
                            <div className="flex gap-6">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Round Number</label>
                                    <input type="number" required value={interviewData.roundNumber} onChange={(e) => setInterviewData({ ...interviewData, roundNumber: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-500/10 font-bold text-sm transition-all" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Room Code</label>
                                    <input type="text" required placeholder="abc-def" value={interviewData.meetCode} onChange={(e) => setInterviewData({ ...interviewData, meetCode: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-500/10 font-bold text-sm transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Meeting URL</label>
                                <input type="url" required placeholder="https://meet.google.com/..." value={interviewData.meetLink} onChange={(e) => setInterviewData({ ...interviewData, meetLink: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-500/10 font-bold text-sm transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Date & Time</label>
                                <input type="datetime-local" required value={interviewData.scheduledAt} onChange={(e) => setInterviewData({ ...interviewData, scheduledAt: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-primary-500/10 font-bold text-sm transition-all" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsScheduling(null)} className="flex-1 py-4 text-sm font-black text-slate-500 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-primary-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all active:scale-95 disabled:opacity-50">
                                    {isSubmitting ? 'Wait...' : 'Confirm Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterApplicationsPage;
