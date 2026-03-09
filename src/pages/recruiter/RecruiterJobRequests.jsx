import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    listJobRequests,
    approveJobRequest,
    rejectJobRequest,
    activateJobRequest,
    toggleJobRequestStatus
} from '../../api/recruiter.api';
import toast from 'react-hot-toast';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Stack,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Chip,
    alpha,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Pagination,
    CircularProgress
} from '@mui/material';
import {
    HiOutlineXMark,
    HiOutlineBolt,
} from 'react-icons/hi2';
import {
    Search as SearchIcon,
    Assignment as AssignmentIcon,
    AccessTime as ClockIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    CurrencyRupee as RupeeIcon,
    Bolt as BoltIcon,
    Close as CloseIcon,
    TrendingUp as TrendingUpIcon,
    Edit as EditIcon,
    FilterList as FilterIcon,
    Payments as PaymentsIcon
} from '@mui/icons-material';

const CURRENCY_SYMBOLS = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'AED '
};

const STATUS_COLORS = {
    pending: 'bg-warning-50 text-warning-700',
    approved: 'bg-success-50 text-success-700',
    rejected: 'bg-danger-50 text-danger-700',
    active: 'bg-primary-50 text-primary-700',
    inactive: 'bg-slate-100 text-slate-600',
};

const URGENCY_COLORS = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
};

const STATUS_CONFIG = {
    pending: { color: 'warning', label: 'Pending' },
    approved: { color: 'success', label: 'Approved' },
    rejected: { color: 'error', label: 'Rejected' },
    active: { color: 'primary', label: 'Active' },
    inactive: { color: 'default', label: 'Inactive' },
};

const URGENCY_CONFIG = {
    Low: { color: 'default' },
    Medium: { color: 'warning' },
    High: { color: 'error' },
};

const RecruiterJobRequests = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [jobRequests, setJobRequests] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 6,
    });

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchJobRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: filters.page, limit: filters.limit };
            if (filters.search) params.search = filters.search;
            if (filters.status) params.status = filters.status;

            const res = await listJobRequests(params);
            if (res.success && res.data) {
                setJobRequests(res.data.jobRequests || []);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load job requests');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchJobRequests();
    }, [fetchJobRequests]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this job request? It will be ready for activation.')) return;
        setActionLoading(true);
        try {
            await approveJobRequest(id);
            toast.success('Job request approved!');
            fetchJobRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(false);
        }
    };

    const handleActivate = async (id) => {
        if (!window.confirm('Activate this job to make it live for candidates?')) return;
        setActionLoading(true);
        try {
            await activateJobRequest(id);
            toast.success('Job activated successfully!');
            fetchJobRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to activate job');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus === 'active' ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this job?`)) return;

        setActionLoading(true);
        try {
            await toggleJobRequestStatus(id);
            toast.success(`Job ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully!`);
            fetchJobRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${action} job`);
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectModal = (id) => {
        setRejectingId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error('Rejection reason is required');
        setActionLoading(true);
        try {
            await rejectJobRequest(rejectingId, rejectReason);
            toast.success('Job request rejected');
            setShowRejectModal(false);
            fetchJobRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const handleView = (req) => {
        setSelectedRequest(req);
        setShowViewModal(true);
    };

    const handleEdit = (reqId) => {
        navigate(`/recruiter/job-requests/${reqId}?edit=true`);
    };

    const formatSalary = (min, max, currency = 'INR') => {
        const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.INR;
        const fmt = (n) => {
            if (currency === 'INR') {
                if (n >= 100000) return `${symbol}${(n / 100000).toFixed(1)}L`;
                if (n >= 1000) return `${symbol}${(n / 1000).toFixed(0)}K`;
            } else {
                if (n >= 1000000) return `${symbol}${(n / 1000000).toFixed(1)}M`;
                if (n >= 1000) return `${symbol}${(n / 1000).toFixed(1)}K`;
            }
            return `${symbol}${n}`;
        };
        return `${fmt(min)} – ${fmt(max)}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // Stats calculation
    const totalCount = pagination?.total || 0;
    const pendingCount = jobRequests.filter(r => r.status === 'pending').length;
    const approvedCount = jobRequests.filter(r => r.status === 'approved').length;
    const convertedCount = jobRequests.filter(r => r.status === 'active').length;

    return (
        <Container maxWidth="xl" sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
            {/* Simple Header */}
            <Box sx={{ py: 3, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary' }}>
                    Job Approval Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review and verify job postings submitted by employers
                </Typography>
            </Box>

            {/* Simple Stats Section */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Requests', value: totalCount, color: 'primary' },
                    { label: 'Pending Approval', value: pendingCount, color: 'warning' },
                    { label: 'Recently Approved', value: approvedCount, color: 'success' },
                    { label: 'Active Live Jobs', value: convertedCount, color: 'info' }
                ].map((stat, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Paper elevation={0} sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette[stat.color].main, 0.02)
                        }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                {stat.label}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color={`${stat.color}.main`}>
                                {stat.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Simple Filter Bar */}
            <Box sx={{
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
            }}>
                <TextField
                    placeholder="Search by job title or employer..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: 250 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="disabled" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                />

                <FormControl size="small" sx={{ width: 180 }}>
                    <Select
                        value={filters.status}
                        displayEmpty
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="active">Live Jobs</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="text"
                    startIcon={<RefreshIcon />}
                    onClick={() => { setSearchInput(''); setFilters({ search: '', status: '', page: 1, limit: 10 }); }}
                    sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
                >
                    Reset
                </Button>
            </Box>

            {/* Simple List Layout */}
            <Stack spacing={2}>
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <Paper key={i} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                        </Paper>
                    ))
                ) : jobRequests.length === 0 ? (
                    <Paper sx={{ py: 10, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                        <Typography color="text.disabled" fontWeight={700}>No job requests found</Typography>
                    </Paper>
                ) : (
                    jobRequests.map((req) => (
                        <Paper key={req._id} elevation={0} sx={{
                            height: 130, // Fixed exact height for "same to same" size
                            p: 3,
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden', // Prevent any growth
                            gap: 3,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.01),
                                borderColor: 'primary.main'
                            }
                        }}>
                            {/* Employer Avatar */}
                            <Avatar
                                src={req.companyId?.logo}
                                variant="rounded"
                                sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }}
                            >
                                <BusinessIcon fontSize="medium" />
                            </Avatar>

                            {/* Job & Company Info */}
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{req.jobTitle || 'Untitled Job'}</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">{req.companyId?.companyName || 'Unknown Employer'}</Typography>
                                    <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                    <Stack direction="row" spacing={0.5} alignItems="center" color="text.disabled">
                                        <LocationIcon sx={{ fontSize: 16 }} />
                                        <Typography variant="caption" fontWeight={700}>
                                            {req.location || [req.city, req.state].filter(Boolean).join(', ') || 'N/A'}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Box>

                            {/* Details & Urgency */}
                            <Box sx={{ textAlign: 'right', minWidth: 150 }}>
                                <Typography variant="body2" fontWeight={800} color="primary.main">{formatSalary(req.salaryMin, req.salaryMax, req.currency)}</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mt: 0.5 }}>
                                    {req.experienceRequired} • {req.urgency}
                                </Typography>
                            </Box>

                            <Divider orientation="vertical" flexItem />

                            {/* Status & Actions */}
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 250, justifyContent: 'flex-end' }}>
                                <Chip
                                    label={STATUS_CONFIG[req.status]?.label}
                                    size="small"
                                    color={STATUS_CONFIG[req.status]?.color}
                                    sx={{ fontWeight: 800, textTransform: 'uppercase', height: 24, fontSize: '0.65rem' }}
                                />

                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="View Details">
                                        <IconButton size="small" onClick={() => handleView(req)} sx={{ color: 'primary.main', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => handleEdit(req._id)} sx={{ color: 'info.main', border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.2) }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {req.status === 'pending' && (
                                        <>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleApprove(req._id)}
                                                disabled={actionLoading}
                                                sx={{ px: 2, height: 32, borderRadius: 2, fontWeight: 900, textTransform: 'none' }}
                                            >
                                                Approve
                                            </Button>
                                            <IconButton
                                                size="small"
                                                onClick={() => openRejectModal(req._id)}
                                                disabled={actionLoading}
                                                sx={{ color: 'error.main', border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}
                                            >
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    )}
                                    {req.status === 'approved' && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleActivate(req._id)}
                                            disabled={actionLoading}
                                            sx={{ px: 2, height: 32, borderRadius: 2, fontWeight: 900, textTransform: 'none' }}
                                        >
                                            Activate
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        </Paper>
                    ))
                )}
            </Stack>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={pagination.totalPages}
                        page={filters.page}
                        onChange={(_, page) => setFilters(prev => ({ ...prev, page }))}
                        color="primary"
                        sx={{ '& .MuiPaginationItem-root': { fontWeight: 900 } }}
                    />
                </Box>
            )}

            {/* View Modal */}
            {showViewModal && selectedRequest && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="absolute inset-0 bg-dark-900/40 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
                    <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                        {/* Banner / Header */}
                        <div className="relative shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-600 px-6 py-6 md:px-8 md:py-8 overflow-hidden">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all border border-white/10 z-10"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>

                            <div className="space-y-2 pr-12">
                                <h3 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase truncate">
                                    {selectedRequest.jobTitle}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black lowercase tracking-wider bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm`}>
                                        {selectedRequest.status}
                                    </span>
                                    {selectedRequest.companyId?.companyName && (
                                        <span className="text-xs font-bold text-white/90">
                                            by {selectedRequest.companyId.companyName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">

                            {/* Status Alerts */}
                            {selectedRequest.status === 'rejected' && (
                                <div className="mb-6 md:mb-8 p-4 md:p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <HiOutlineXMark className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-red-900 uppercase tracking-tight">Request Rejected</p>
                                        <div className="mt-2 p-4 bg-white/50 rounded-2xl border border-red-50/50">
                                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Admin Feedback</p>
                                            <p className="text-sm font-medium text-red-800 leading-relaxed">
                                                {selectedRequest.rejectionReason || 'No detailed feedback provided. Please contact support or revise your request.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedRequest.status === 'active' && (
                                <div className="mb-6 md:mb-8 p-4 md:p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <HiOutlineBolt className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Job is Live</p>
                                        <p className="text-xs font-bold text-emerald-700 mt-1">This request is now open for candidate applications.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

                                {/* Category Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{selectedRequest.jobCategory}</p>
                                </div>

                                {/* Vacancies Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Vacancies</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{selectedRequest.numberOfVacancies} positions</p>
                                </div>

                                {/* Experience Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Experience</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{selectedRequest.experienceRequired}</p>
                                </div>

                                {/* Salary Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">
                                        {formatSalary(selectedRequest.salaryMin, selectedRequest.salaryMax, selectedRequest.currency)}
                                    </p>
                                </div>

                                {/* Work Type Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Type</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900 capitalize">{selectedRequest.workType}</p>
                                </div>

                                {/* Location Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                                        {[selectedRequest.city, selectedRequest.state, selectedRequest.country].filter(Boolean).join(', ')}
                                        {selectedRequest.pincode ? ` - ${selectedRequest.pincode}` : ''}
                                    </p>
                                </div>

                                {/* Urgency Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-center items-start">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgency</label>
                                    <span className={`inline-flex px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${URGENCY_COLORS[selectedRequest.urgency]}`}>
                                        {selectedRequest.urgency}
                                    </span>
                                </div>

                                {/* Submitted Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Submitted</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{formatDate(selectedRequest.createdAt)}</p>
                                </div>

                                {/* Skills */}
                                <div className="col-span-1 sm:col-span-2 pt-4">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Required Skills</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.requiredSkills?.map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl shadow-sm transition-all hover:bg-indigo-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="col-span-1 sm:col-span-2 pt-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Job Description</label>
                                    <div className="p-6 md:p-8 bg-slate-50/50 rounded-[24px] border border-slate-100">
                                        <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{selectedRequest.jobDescription}</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            {selectedRequest.status === 'pending' ? (
                                <>
                                    <button
                                        onClick={() => { setShowViewModal(false); openRejectModal(selectedRequest._id); }}
                                        className="px-8 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => { setShowViewModal(false); handleApprove(selectedRequest._id); }}
                                        className="px-8 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 border border-transparent"
                                    >
                                        Approve Request
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-8 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            <Dialog
                open={showRejectModal}
                onClose={() => !actionLoading && setShowRejectModal(false)}
                PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>Reject Job Request</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 600 }}>
                        Please provide a clear reason for rejecting this employer's job request.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="e.g., Incomplete job description, invalid salary range..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        InputProps={{ sx: { borderRadius: 3, p: 2 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setShowRejectModal(false)} disabled={actionLoading} sx={{ fontWeight: 900 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={actionLoading || !rejectReason.trim()}
                        onClick={handleReject}
                        sx={{ borderRadius: 3, fontWeight: 900, px: 4 }}
                    >
                        {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Reject Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RecruiterJobRequests;
