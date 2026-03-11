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
    CircularProgress,
    Skeleton
} from '@mui/material';
import {
    HiOutlineClipboardDocumentList,
    HiOutlineBriefcase,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineBolt,
    HiOutlineMagnifyingGlass,
    HiOutlineArrowPath,
    HiOutlineEye,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineXMark,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineQueueList,
    HiOutlineBuildingOffice2
} from 'react-icons/hi2';

import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    LocationOn as LocationIcon,
    Edit as EditIcon,
    Close as CloseIcon
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
        limit: 5,
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
            setFilters(prev => {
                if (prev.search === searchInput) return prev;
                return { ...prev, search: searchInput, page: 1 };
            });
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-dark-900 flex items-center gap-2 tracking-tight">
                        <div className="p-2 bg-primary-50 rounded-md text-primary-600">
                            <HiOutlineClipboardDocumentList className="w-6 h-6" />
                        </div>
                        Job Approval
                    </h2>
                    <p className="text-sm font-medium text-dark-500 mt-1 pl-12">Review and verify job postings submitted by employers</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <HiOutlineBriefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Total Requests</p>
                        <p className="text-2xl font-black text-dark-900 leading-none">{totalCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-warning-50 border border-warning-100 flex items-center justify-center shrink-0">
                        <HiOutlineClock className="w-6 h-6 text-warning-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Pending</p>
                        <p className="text-2xl font-black text-dark-900 leading-none">{pendingCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-success-50 border border-success-100 flex items-center justify-center shrink-0">
                        <HiOutlineCheckCircle className="w-6 h-6 text-success-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Approved</p>
                        <p className="text-2xl font-black text-dark-900 leading-none">{approvedCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <HiOutlineBolt className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Live Jobs</p>
                        <p className="text-2xl font-black text-dark-900 leading-none">{convertedCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by job title or employer..."
                        className="w-full pl-11 pr-4 py-3 rounded-md border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-dark-900 focus:ring-1 focus:ring-dark-900 bg-slate-50 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="px-4 py-3 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:border-dark-900 focus:ring-1 focus:ring-dark-900 outline-none appearance-none cursor-pointer min-w-[160px] transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="active">Live Jobs</option>
                    </select>
                    <button
                        onClick={() => { setSearchInput(''); setFilters({ search: '', status: '', page: 1, limit: 5 }); }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-slate-200 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {/* Simple List Layout for Requests */}
                <Stack spacing={1.5}>
                    {loading ? (
                        Array(filters.limit).fill(0).map((_, i) => (
                            <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Skeleton variant="circular" width={40} height={40} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="40%" height={24} />
                                    <Skeleton variant="text" width="20%" height={16} sx={{ mt: 0.5 }} />
                                </Box>
                            </Paper>
                        ))
                    ) : jobRequests.length === 0 ? (
                        <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'slate.50/50' }}>
                            <HiOutlineQueueList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <Typography variant="body1" fontWeight={800} color="text.secondary">No job requests found</Typography>
                        </Paper>
                    ) : (
                        jobRequests.map((req) => (
                            <Paper
                                key={req._id}
                                elevation={0}
                                sx={{
                                    p: { xs: 2.5, sm: 3 },
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    gap: { xs: 2, sm: 4 },
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: 'slate.50/30',
                                        borderColor: 'primary.200'
                                    }
                                }}
                            >
                                {/* Request Info */}
                                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 240 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        borderRadius: 1, 
                                        bgcolor: 'slate.50', 
                                        border: '1px solid',
                                        borderColor: 'slate.200',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'slate.400',
                                        shrink: 0
                                    }}>
                                        <HiOutlineBuildingOffice2 className="w-6 h-6" />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={900} sx={{ color: 'text.primary', mb: 0.5, tracking: '-0.02em', fontSize: '16px' }}>
                                            {req.jobTitle || req.position}
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 800, color: 'text.secondary' }}>
                                                {req.employer?.companyName || req.companyId?.companyName || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>•</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Box>

                                {/* Job Quick Details */}
                                <Box sx={{ 
                                    display: { xs: 'none', md: 'flex' }, 
                                    gap: { md: 3, lg: 5 }, 
                                    flex: 1, 
                                    justifyContent: 'center',
                                    px: 2
                                }}>
                                    <Box sx={{ minWidth: 60 }}>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.2, fontSize: '9px' }}>Positions</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '13px' }}>{req.numberOfVacancies || 1}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 80 }}>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.2, fontSize: '9px' }}>Experience</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '13px' }}>{req.experienceRequired || '—'}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 110 }}>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.2, fontSize: '9px' }}>Salary Range</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '13px' }}>
                                            {formatSalary(req.salaryMin, req.salaryMax, req.currency)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Status Chip */}
                                <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            display: 'inline-block',
                                            bgcolor: req.status === 'approved' ? 'emerald.50' : req.status === 'pending' ? 'amber.50' : 'rose.50',
                                            color: req.status === 'approved' ? 'emerald.700' : req.status === 'pending' ? 'amber.700' : 'rose.700',
                                            border: '1px solid',
                                            borderColor: req.status === 'approved' ? 'emerald.100' : req.status === 'pending' ? 'amber.100' : 'rose.100'
                                        }}
                                    >
                                        {req.status}
                                    </Box>
                                </Box>

                                {/* Actions */}
                                <Stack direction="row" spacing={1} sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleView(req)}
                                        sx={{ color: 'primary.main', bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
                                    >
                                        <HiOutlineEye className="w-5 h-5" />
                                    </IconButton>
                                    {req.status === 'pending' && (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/recruiter/job-requests/${req._id}?edit=true`)}
                                                sx={{ color: 'amber.600', bgcolor: 'amber.50', '&:hover': { bgcolor: 'amber.100' } }}
                                            >
                                                <HiOutlinePencilSquare className="w-5 h-5" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => openRejectModal(req._id)}
                                                sx={{ color: 'error.main', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                                            >
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </IconButton>
                                        </>
                                    )}
                                    {req.status === 'approved' && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleActivate(req._id)}
                                            sx={{ borderRadius: 1, fontWeight: 900, textTransform: 'none' }}
                                        >
                                            Activate
                                        </Button>
                                    )}
                                </Stack>
                            </Paper>
                        ))
                    )}
                </Stack>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={!pagination.hasPrevPage}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-dark-700 bg-white border border-dark-200 rounded-md hover:bg-dark-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                    >
                        <HiOutlineChevronLeft className="w-4 h-4" />
                        Prev
                    </button>
                    <span className="text-sm font-bold text-dark-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={!pagination.hasNextPage}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-dark-700 bg-white border border-dark-200 rounded-md hover:bg-dark-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                    >
                        Next
                        <HiOutlineChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedRequest && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="absolute inset-0 bg-dark-900/40 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
                    <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

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
                                    {selectedRequest.jobTitle || selectedRequest.position}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black lowercase tracking-wider bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm`}>
                                        {selectedRequest.status}
                                    </span>
                                        <span className="text-xs font-bold text-white/90">
                                            by {selectedRequest.employer?.companyName || selectedRequest.companyId?.companyName || 'N/A'}
                                        </span>

                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">

                            {/* Status Alerts */}
                            {selectedRequest.status === 'rejected' && (
                                <div className="mb-6 md:mb-8 p-4 md:p-5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <HiOutlineXMark className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-red-900 uppercase tracking-tight">Request Rejected</p>
                                        <div className="mt-2 p-4 bg-white/50 rounded-lg border border-red-50/50">
                                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Admin Feedback</p>
                                            <p className="text-sm font-medium text-red-800 leading-relaxed">
                                                {selectedRequest.rejectionReason || 'No detailed feedback provided. Please contact support or revise your request.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedRequest.status === 'active' && (
                                <div className="mb-6 md:mb-8 p-4 md:p-5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
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
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{selectedRequest.jobCategory}</p>
                                </div>

                                {/* Vacancies Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Vacancies</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{selectedRequest.numberOfVacancies} positions</p>
                                </div>

                                {/* Experience Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Experience</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{selectedRequest.experienceRequired}</p>
                                </div>

                                {/* Salary Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">
                                        {formatSalary(selectedRequest.salaryMin, selectedRequest.salaryMax, selectedRequest.currency)}
                                    </p>
                                </div>

                                {/* Work Type Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Type</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900 capitalize">{selectedRequest.workType}</p>
                                </div>

                                {/* Location Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                                        {[selectedRequest.city, selectedRequest.state, selectedRequest.country].filter(Boolean).join(', ')}
                                        {selectedRequest.pincode ? ` - ${selectedRequest.pincode}` : ''}
                                    </p>
                                </div>

                                {/* Urgency Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-center items-start">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgency</label>
                                    <span className={`inline-flex px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wider ${URGENCY_COLORS[selectedRequest.urgency]}`}>
                                        {selectedRequest.urgency}
                                    </span>
                                </div>

                                {/* Submitted Box */}
                                <div className="p-6 md:p-8 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-lg transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Submitted</label>
                                    <p className="text-lg md:text-xl font-black text-slate-900">{formatDate(selectedRequest.createdAt)}</p>
                                </div>

                                {/* Skills */}
                                <div className="col-span-1 sm:col-span-2 pt-4">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Required Skills</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.requiredSkills?.map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg shadow-sm transition-all hover:bg-indigo-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="col-span-1 sm:col-span-2 pt-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Job Description</label>
                                    <div className="p-6 md:p-8 bg-slate-50/50 rounded-lg border border-slate-100">
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
                                        className="px-8 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-bold rounded-md transition-all shadow-sm active:scale-95"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => { setShowViewModal(false); handleApprove(selectedRequest._id); }}
                                        className="px-8 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold rounded-md transition-all shadow-md active:scale-95 border border-transparent"
                                    >
                                        Approve Request
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-8 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95"
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
                PaperProps={{ sx: { borderRadius: 1.5, p: 2 } }}
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
                        InputProps={{ sx: { borderRadius: 1, p: 2 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setShowRejectModal(false)} disabled={actionLoading} sx={{ fontWeight: 900 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={actionLoading || !rejectReason.trim()}
                        onClick={handleReject}
                        sx={{ borderRadius: 1, fontWeight: 900, px: 4 }}
                    >
                        {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Reject Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RecruiterJobRequests;
