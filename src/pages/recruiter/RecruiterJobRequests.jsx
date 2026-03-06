
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listJobRequests, approveJobRequest, rejectJobRequest, activateJobRequest, toggleJobRequestStatus } from '../../api/recruiter.api';
import toast from 'react-hot-toast';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineClipboardDocumentList,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineArrowPath,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineEye,
    HiOutlineMapPin,
    HiOutlineBriefcase,
    HiOutlineCurrencyRupee,
    HiOutlineBolt,
    HiOutlineXMark,
    HiOutlineUsers,
    HiOutlineArrowTrendingUp,
    HiOutlineBuildingOffice2,
    HiOutlinePencilSquare,
} from 'react-icons/hi2';

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

const RecruiterJobRequests = () => {
    const navigate = useNavigate();
    const [jobRequests, setJobRequests] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 10,
    });

    // Reject modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // View modal
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

    const formatSalary = (min, max) => {
        const fmt = (n) => {
            if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
            if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
            return `₹${n}`;
        };
        return `${fmt(min)} – ${fmt(max)}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // Stats
    const totalCount = pagination?.total || 0;
    const pendingCount = jobRequests.filter(r => r.status === 'pending').length;
    const approvedCount = jobRequests.filter(r => r.status === 'approved').length;
    const convertedCount = jobRequests.filter(r => r.status === 'active').length;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                    <HiOutlineClipboardDocumentList className="w-6 h-6 text-primary-500" />
                    Add Job (Pending Company Requests)
                </h2>
                <p className="text-sm text-dark-500 mt-0.5">Review and auto-publish pending job requests from verified employers</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <HiOutlineClipboardDocumentList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">{totalCount}</p>
                        <p className="text-xs text-dark-500">Total</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center">
                        <HiOutlineClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">{pendingCount}</p>
                        <p className="text-xs text-dark-500">Pending</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center">
                        <HiOutlineCheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">{approvedCount}</p>
                        <p className="text-xs text-dark-500">Approved</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                        <HiOutlineArrowTrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">{convertedCount}</p>
                        <p className="text-xs text-dark-500">Converted</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by job title..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-800 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="px-4 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 appearance-none bg-white cursor-pointer min-w-[140px]"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved by Recruiter</option>
                        <option value="rejected">Rejected</option>
                        <option value="active">Activated / Live Jobs</option>
                    </select>
                    <button
                        onClick={() => { setSearchInput(''); setFilters({ search: '', status: '', page: 1, limit: 10 }); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-dark-200 text-sm font-medium text-dark-600 hover:bg-dark-50 transition-colors"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Job Requests Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-dark-50 border-b border-dark-100">
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Job Title</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Employer</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Experience</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Salary</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Work Type</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Urgency</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Status</th>
                                <th className="text-center px-5 py-3.5 text-xs font-bold text-dark-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-50">
                            {loading ? (
                                Array(5).fill().map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-4 w-32 bg-dark-200 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-dark-200 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-16 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-20 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-16 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-12 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-16 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-dark-100 rounded mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : jobRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-16 text-center">
                                        <HiOutlineClipboardDocumentList className="w-12 h-12 mx-auto text-dark-300 mb-3" />
                                        <p className="text-dark-500 font-semibold">No job requests found</p>
                                        <p className="text-dark-400 text-xs mt-1">Job requests from verified employers will appear here</p>
                                    </td>
                                </tr>
                            ) : (
                                jobRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-dark-25 transition-colors">
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="font-bold text-dark-900">{req.jobTitle || req.title || 'Untitled Job'}</p>
                                                <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                                                    <HiOutlineMapPin className="w-3 h-3" />
                                                    {req.location || [req.city, req.state, req.country].filter(Boolean).join(', ') || 'Location not specified'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {req.companyId?.logo ? (
                                                        <img src={req.companyId.logo} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-dark-700 truncate">
                                                        {req.companyId?.companyName || 'Unknown Company'}
                                                    </p>
                                                    <p className="text-xs text-dark-400 truncate">{req.companyId?.companyEmail || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-dark-600">{req.experienceRequired || req.experience || 'Not specified'}</td>
                                        <td className="px-5 py-4 text-dark-600 whitespace-nowrap">{formatSalary(req.salaryMin, req.salaryMax)}</td>
                                        <td className="px-5 py-4 text-dark-600 whitespace-nowrap">{req.workType}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${URGENCY_COLORS[req.urgency]}`}>
                                                {req.urgency === 'High' && <HiOutlineBolt className="w-3 h-3 mr-0.5" />}
                                                {req.urgency}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {(req.status === 'active' || req.status === 'inactive') ? (
                                                <button
                                                    onClick={() => handleToggleStatus(req._id, req.status)}
                                                    disabled={actionLoading}
                                                    title={req.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${STATUS_COLORS[req.status]}`}
                                                >
                                                    {req.status}
                                                </button>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${STATUS_COLORS[req.status]}`}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleView(req)}
                                                    className="p-2 rounded-lg text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                    title="View"
                                                >
                                                    <HiOutlineEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(req._id)}
                                                    className="p-2 rounded-lg text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <HiOutlinePencilSquare className="w-4 h-4" />
                                                </button>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(req._id)}
                                                            disabled={actionLoading}
                                                            className="p-2 rounded-lg text-success-500 hover:text-success-700 hover:bg-success-50 transition-colors disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            <HiOutlineCheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(req._id)}
                                                            disabled={actionLoading}
                                                            className="p-2 rounded-lg text-danger-500 hover:text-danger-700 hover:bg-danger-50 transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <HiOutlineXCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleActivate(req._id)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                                                        title="Activate Job"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-dark-500">
                        Page <span className="font-semibold text-dark-700">{pagination.page}</span>{' '}
                        of <span className="font-semibold text-dark-700">{pagination.totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={!pagination.hasPrevPage}
                            className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={!pagination.hasNextPage}
                            className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== VIEW MODAL ==================== */}
            {showViewModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">

                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                            <h3 className="text-xl font-bold text-white">{selectedRequest.jobTitle}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/20 text-white`}>
                                    {selectedRequest.status}
                                </span>
                                <span className="text-blue-100 text-sm">
                                    by {selectedRequest.companyId?.companyName}
                                </span>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Category</p>
                                    <p className="text-sm font-bold text-dark-900">{selectedRequest.jobCategory}</p>
                                </div>
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Vacancies</p>
                                    <p className="text-sm font-bold text-dark-900">{selectedRequest.numberOfVacancies} positions</p>
                                </div>
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Experience</p>
                                    <p className="text-sm font-bold text-dark-900">{selectedRequest.experienceRequired}</p>
                                </div>
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Salary Range</p>
                                    <p className="text-sm font-bold text-dark-900">{formatSalary(selectedRequest.salaryMin, selectedRequest.salaryMax)}</p>
                                </div>
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Work Type</p>
                                    <p className="text-sm font-bold text-dark-900">{selectedRequest.workType}</p>
                                </div>
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Location</p>
                                    <p className="text-sm font-bold text-dark-900">
                                        {[selectedRequest.city, selectedRequest.state, selectedRequest.country].filter(Boolean).join(', ')}
                                        {selectedRequest.pincode ? ` - ${selectedRequest.pincode}` : ''}
                                    </p>
                                </div>
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Urgency</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${URGENCY_COLORS[selectedRequest.urgency]}`}>
                                        {selectedRequest.urgency}
                                    </span>
                                </div>
                                <div className="p-4 bg-dark-50 rounded-xl">
                                    <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Submitted</p>
                                    <p className="text-sm font-bold text-dark-900">{formatDate(selectedRequest.createdAt)}</p>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-2">Required Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRequest.requiredSkills?.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 font-semibold text-xs rounded-lg">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-2">Description</p>
                                <p className="text-sm text-dark-700 leading-relaxed whitespace-pre-wrap bg-dark-50 p-4 rounded-xl">{selectedRequest.jobDescription}</p>
                            </div>

                            {/* Employer Info */}
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Employer</p>
                                <p className="text-sm font-bold text-blue-900">{selectedRequest.companyId?.companyName}</p>
                                <p className="text-xs text-blue-600">{selectedRequest.companyId?.companyEmail}</p>
                            </div>
                        </div>

                        {/* Footer with actions */}
                        <div className="sticky bottom-0 bg-white px-8 py-4 border-t border-dark-100 rounded-b-2xl">
                            {selectedRequest.status === 'pending' ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => { setShowViewModal(false); handleApprove(selectedRequest._id); }}
                                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-success-600 hover:bg-success-700 text-white text-sm font-bold rounded-xl transition-colors"
                                    >
                                        <HiOutlineCheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => { setShowViewModal(false); openRejectModal(selectedRequest._id); }}
                                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-danger-600 hover:bg-danger-700 text-white text-sm font-bold rounded-xl transition-colors"
                                    >
                                        <HiOutlineXCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            ) : selectedRequest.status === 'approved' ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => { setShowViewModal(false); handleActivate(selectedRequest._id); }}
                                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors"
                                    >
                                        Activate Job
                                    </button>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="w-full flex-1 py-3 rounded-xl border border-dark-200 text-sm font-bold text-dark-600 hover:bg-dark-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="w-full py-3 rounded-xl border border-dark-200 text-sm font-bold text-dark-600 hover:bg-dark-50 transition-colors"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== REJECT MODAL ==================== */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h3 className="text-lg font-bold text-dark-900 mb-2 flex items-center gap-2">
                            <HiOutlineXCircle className="w-6 h-6 text-danger-500" />
                            Reject Job Request
                        </h3>
                        <p className="text-sm text-dark-500 mb-6">Please provide a reason for rejecting this request.</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 border border-dark-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all outline-none resize-none"
                            placeholder="Enter rejection reason..."
                            autoFocus
                        />
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-3 rounded-xl border border-dark-200 text-sm font-bold text-dark-600 hover:bg-dark-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || !rejectReason.trim()}
                                className="flex-1 py-3 rounded-xl bg-danger-600 hover:bg-danger-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Rejecting...' : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterJobRequests;
