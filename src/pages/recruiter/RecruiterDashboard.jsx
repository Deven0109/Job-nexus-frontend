import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyJobs, deleteJob, toggleJobStatus, getDashboardStats } from '../../api/recruiter.api';
import toast from 'react-hot-toast';
import { Skeleton, Box, Stack, Paper, Button, IconButton, Typography, Divider } from '@mui/material';
import {
    HiOutlineBriefcase,
    HiOutlineMagnifyingGlass,
    HiOutlineArrowPath,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineEye,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineBolt,
    HiOutlineUsers,
    HiOutlineMapPin,
    HiOutlineCurrencyRupee,
    HiOutlineFunnel,
    HiOutlineBars3BottomLeft
} from 'react-icons/hi2';

const CURRENCY_SYMBOLS = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'AED '
};

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, total: 0 });

    // Pagination & Filter States
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const limit = 5; // Updated to 5 as per recent preference

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { 
                page, 
                limit, 
                status: statusFilter === 'all' ? '' : statusFilter,
                search: searchQuery,
                sortBy: sortBy
            };
            const res = await getMyJobs(params);
            if (res.success) {
                setJobs(res.data.jobs || []);
                // If backend provides stats, use them, otherwise calculate from result
                // Ideally backend should provide these in dashboard endpoint
                // but we'll use a local summary for now or fetch from dashboard stats
            }
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchQuery, sortBy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchJobs();
        }, searchQuery ? 400 : 0);
        return () => clearTimeout(timer);
    }, [fetchJobs]);

    // Fetch stats separately if needed, or get from a dedicated call
    const fetchStats = async () => {
        try {
            const res = await getDashboardStats();
            if (res.success) {
                setStats({ 
                    active: res.data.stats.activeJobs, 
                    total: res.data.stats.totalJobs 
                });
            }
        } catch (e) {}
    };

    useEffect(() => {
        fetchStats();
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

    const getCurrencySymbol = (code) => CURRENCY_SYMBOLS[code] || '₹';

    const totalFiltered = jobs.length; // Actually provided by backend pagination in real case
    const paginatedJobs = jobs; // Server already paginated
    const totalPages = Math.ceil(stats.total / limit); // Fallback estimate

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-dark-900 flex items-center gap-2 tracking-tight">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                        <HiOutlineBriefcase className="w-6 h-6" />
                    </div>
                    Manage Job Postings
                </h2>
                <p className="text-sm font-medium text-dark-500 mt-1 pl-12">
                    Track and manage all your active and closed job listings
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <HiOutlineBriefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Total Postings</p>
                        <p className="text-2xl font-black text-dark-900 leading-none">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <HiOutlineBolt className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Active Jobs</p>
                        <p className="text-2xl font-black text-dark-900 leading-none">{stats.active}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        placeholder="Search by title, city or location..."
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-dark-900 focus:ring-1 focus:ring-dark-900 bg-slate-50 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="pl-9 pr-8 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:border-dark-900 focus:ring-1 focus:ring-dark-900 outline-none appearance-none cursor-pointer min-w-[140px] transition-all"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="relative">
                        <HiOutlineBars3BottomLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="pl-9 pr-8 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:border-dark-900 focus:ring-1 focus:ring-dark-900 outline-none appearance-none cursor-pointer min-w-[140px] transition-all"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Job List Area */}
            <Stack spacing={1.5}>
                {loading ? (
                    Array(limit).fill(0).map((_, i) => (
                        <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="30%" height={24} />
                                <Skeleton variant="text" width="20%" height={16} sx={{ mt: 0.5 }} />
                            </Box>
                        </Paper>
                    ))
                ) : paginatedJobs.length === 0 ? (
                    <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'slate.50/50' }}>
                        <HiOutlineBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <Typography variant="body1" fontWeight={800} color="text.secondary">No jobs found</Typography>
                    </Paper>
                ) : (
                    paginatedJobs.map((job) => (
                        <Paper
                            key={job._id}
                            elevation={0}
                            sx={{
                                p: { xs: 2.5, sm: 3 },
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: { xs: 2, sm: 4 },
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'slate.50/30',
                                    borderColor: 'primary.200',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                }
                            }}
                        >
                            {/* Job Info */}
                            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 240 } }}>
                                <Typography variant="h6" fontWeight={900} sx={{ color: 'text.primary', mb: 0.8, tracking: '-0.02em' }}>
                                    {job.title}
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 800, color: 'text.secondary' }}>
                                        <HiOutlineMapPin className="w-3.5 h-3.5" />
                                        {job.location || job.city || 'Remote'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 800, color: 'primary.main', bgcolor: 'primary.50', px: 1, py: 0.2, borderRadius: 1, whiteSpace: 'nowrap' }}>
                                        {getCurrencySymbol(job.currency)}{job.salaryMin?.toLocaleString()} - {getCurrencySymbol(job.currency)}{job.salaryMax?.toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>•</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Stats */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: { sm: 3 }, borderLeft: { sm: '1px solid' }, borderRight: { sm: '1px solid' }, borderColor: 'divider' }}>
                                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                    <Typography variant="h6" fontWeight={900} color="primary.main" sx={{ fontSize: '16px' }}>{job.vacancies || 0}</Typography>
                                    <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ textTransform: 'uppercase', tracking: '0.05em', fontSize: '10px' }}>Positions</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                    <Box
                                        sx={{
                                            px: 1,
                                            py: 0.2,
                                            borderRadius: 0.5,
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            mb: 0.4,
                                            display: 'inline-block',
                                            bgcolor: (job.urgency?.toUpperCase() === 'HIGH') ? '#FEF2F2' : (job.urgency?.toUpperCase() === 'MEDIUM') ? '#FFFBEB' : '#F3F4F6',
                                            color: (job.urgency?.toUpperCase() === 'HIGH') ? '#DC2626' : (job.urgency?.toUpperCase() === 'MEDIUM') ? '#D97706' : '#4B5563',
                                            border: '1px solid',
                                            borderColor: (job.urgency?.toUpperCase() === 'HIGH') ? '#FEE2E2' : (job.urgency?.toUpperCase() === 'MEDIUM') ? '#FEF3C7' : '#E5E7EB'
                                        }}
                                    >
                                        {job.urgency || 'Normal'}
                                    </Box>
                                    <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ textTransform: 'uppercase', tracking: '0.05em', fontSize: '10px', display: 'block' }}>Priority</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', minWidth: 70 }}>
                                    <Box
                                        onClick={() => handleToggleStatus(job._id)}
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            cursor: 'pointer',
                                            bgcolor: job.status === 'active' ? 'emerald.50' : 'slate.100',
                                            color: job.status === 'active' ? 'emerald.700' : 'slate.600',
                                            border: '1px solid',
                                            borderColor: job.status === 'active' ? 'emerald.100' : 'slate.200'
                                        }}
                                    >
                                        {job.status}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Actions */}
                            <Stack direction="row" spacing={1.5} sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
                                <Button
                                    component={Link}
                                    to={`/recruiter/job/${job._id}/pipeline`}
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<HiOutlineBolt />}
                                    sx={{ borderRadius: 1.5, fontWeight: 900, textTransform: 'none', px: 2 }}
                                >
                                    Pipeline
                                </Button>
                                <Button
                                    component={Link}
                                    to={`/recruiter/job/${job._id}/applications`}
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<HiOutlineUsers />}
                                    sx={{ borderRadius: 1.5, fontWeight: 900, textTransform: 'none', px: 2 }}
                                >
                                    Applicants
                                </Button>
                                <Stack direction="row" spacing={0.5}>
                                    <IconButton
                                        size="small"
                                        onClick={() => navigate(`/recruiter/job-requests/${job.jobRequestId || job._id}?edit=true`)}
                                        sx={{ color: 'amber.600', bgcolor: 'amber.50', '&:hover': { bgcolor: 'amber.100' } }}
                                    >
                                        <HiOutlinePencilSquare className="w-4 h-4" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(job._id)}
                                        sx={{ color: 'error.main', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))
                )}
            </Stack>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-dark-700 bg-white border border-dark-200 rounded-lg hover:bg-dark-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                    >
                        <HiOutlineChevronLeft className="w-4 h-4" />
                        Prev
                    </button>
                    <span className="text-sm font-bold text-dark-500">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-dark-700 bg-white border border-dark-200 rounded-lg hover:bg-dark-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                    >
                        Next
                        <HiOutlineChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecruiterDashboard;
