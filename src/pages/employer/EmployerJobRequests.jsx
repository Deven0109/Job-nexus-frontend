import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyJobRequests, cancelJobRequest } from '../../api/employer.api';
import toast from 'react-hot-toast';
import {
    HiOutlinePlusCircle,
    HiOutlineMagnifyingGlass,
    HiOutlineClipboardDocumentList,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineArrowPath,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineEye,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineMapPin,
    HiOutlineBriefcase,
    HiOutlineCurrencyRupee,
    HiOutlineBoltSlash,
    HiOutlineBolt,
    HiOutlineXMark,
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineArrowTrendingUp,
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

const EmployerJobRequests = () => {
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

    // View Modal State
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchJobRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: filters.page, limit: filters.limit };
            if (filters.search) params.search = filters.search;
            if (filters.status) params.status = filters.status;

            const res = await getMyJobRequests(params);
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

    const handleView = (req) => {
        setSelectedRequest(req);
        setShowViewModal(true);
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this job request?')) return;
        try {
            await cancelJobRequest(id);
            toast.success('Job request cancelled');
            fetchJobRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel request');
        }
    };

    const formatSalary = (min, max) => {
        const fmt = (n) => {
            if (n === null || n === undefined || isNaN(Number(n))) return '—';
            const num = Number(n);
            if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
            if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
            return `₹${num}`;
        };
        if (!min && !max) return 'Not specified';
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
    const rejectedCount = jobRequests.filter(r => r.status === 'rejected').length;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                        <HiOutlineClipboardDocumentList className="w-6 h-6 text-primary-500" />
                        Job Requests
                    </h2>
                    <p className="text-sm text-dark-500 mt-0.5">Submit and track your hiring requests</p>
                </div>
                <button
                    onClick={() => navigate('/employer/job-requests/new')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95"
                >
                    <HiOutlinePlusCircle className="w-5 h-5" />
                    New Job Request
                </button>
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
                        <p className="text-xl font-bold text-dark-900">{jobRequests.filter(r => r.status === 'active').length}</p>
                        <p className="text-xs text-dark-500 font-medium tracking-tight">Converted</p>
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
                            <tr className="bg-dark-50 border-b border-dark-100 uppercase">
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider">Job Title</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider">Employer</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider">Experience</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider">Salary</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider">Work Type</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider">Urgency</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider">Status</th>
                                <th className="text-center px-5 py-3.5 text-xs font-bold text-dark-500 tracking-wider transition-all">Actions</th>
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
                                        <p className="text-dark-400 text-xs mt-1">Submit your first job request to start hiring</p>
                                    </td>
                                </tr>
                            ) : (
                                jobRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-dark-25 transition-colors">
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="font-bold text-dark-900 leading-tight">{req.jobTitle}</p>
                                                <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5 font-medium">
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
                                                    <p className="text-xs font-bold text-dark-700 truncate capitalize">
                                                        {req.companyId?.companyName || 'My Company'}
                                                    </p>
                                                    <p className="text-[10px] text-dark-400 truncate">{req.companyId?.companyEmail || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-dark-600">{req.experienceRequired}</td>
                                        <td className="px-5 py-4 text-xs font-bold text-dark-600 whitespace-nowrap">{formatSalary(req.salaryMin, req.salaryMax)}</td>
                                        <td className="px-5 py-4 text-xs font-bold text-dark-600 whitespace-nowrap capitalize">{req.workType}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-tight ${URGENCY_COLORS[req.urgency]}`}>
                                                {req.urgency}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold lowercase ${STATUS_COLORS[req.status]}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleView(req)}
                                                    className="p-2 rounded-lg text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-all hover:scale-110"
                                                    title="View Details"
                                                >
                                                    <HiOutlineEye className="w-4 h-4" />
                                                </button>
                                                {['pending', 'rejected'].includes(req.status) && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/employer/job-requests/${req._id}?edit=true`)}
                                                            className="p-2 rounded-lg text-dark-400 hover:text-warning-600 hover:bg-warning-50 transition-all hover:scale-110"
                                                            title="Edit"
                                                        >
                                                            <HiOutlinePencilSquare className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(req._id)}
                                                            className="p-2 rounded-lg text-dark-400 hover:text-danger-600 hover:bg-danger-50 transition-all hover:scale-110"
                                                            title="Cancel"
                                                        >
                                                            <HiOutlineTrash className="w-4 h-4" />
                                                        </button>
                                                    </>
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

            {/* ==================== VIEW MODAL ==================== */}
            {showViewModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
                    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

                        {/* Banner / Header */}
                        <div className="relative shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-10 py-8 overflow-hidden">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all border border-white/10 z-10"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">{selectedRequest.jobTitle}</h3>
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
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">

                            {/* Status Alerts */}
                            {selectedRequest.status === 'rejected' && (
                                <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4">
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
                                <div className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                        <HiOutlineBolt className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Job is Live</p>
                                        <p className="text-xs font-bold text-emerald-700 mt-1">This request is now open for candidate applications.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Category Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <p className="text-sm font-black text-slate-800">{selectedRequest.jobCategory}</p>
                                </div>

                                {/* Vacancies Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vacancies</label>
                                    <p className="text-sm font-black text-slate-800">{selectedRequest.numberOfVacancies} positions</p>
                                </div>

                                {/* Experience Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Experience</label>
                                    <p className="text-sm font-black text-slate-900">{selectedRequest.experienceRequired}</p>
                                </div>

                                {/* Salary Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range</label>
                                    <p className="text-sm font-black text-slate-900">{formatSalary(selectedRequest.salaryMin, selectedRequest.salaryMax)}</p>
                                </div>

                                {/* Work Type Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Type</label>
                                    <p className="text-sm font-black text-slate-900">{selectedRequest.workType}</p>
                                </div>

                                {/* Location Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                        {[selectedRequest.city, selectedRequest.state, selectedRequest.country].filter(Boolean).join(', ')}
                                        {selectedRequest.pincode ? ` - ${selectedRequest.pincode}` : ''}
                                    </p>
                                </div>

                                {/* Urgency Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgency</label>
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${URGENCY_COLORS[selectedRequest.urgency]}`}>
                                        {selectedRequest.urgency}
                                    </span>
                                </div>

                                {/* Submitted Box */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Submitted</label>
                                    <p className="text-sm font-black text-slate-800">{formatDate(selectedRequest.createdAt)}</p>
                                </div>

                                {/* Skills */}
                                <div className="md:col-span-2 pt-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Required Skills</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {selectedRequest.requiredSkills?.map((skill, i) => (
                                            <span key={i} className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs rounded-xl shadow-sm tracking-tight transition-all hover:bg-indigo-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2 pt-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Job Description</label>
                                    <div className="p-8 bg-slate-50/30 rounded-3xl border border-slate-100/50">
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{selectedRequest.jobDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-10 bg-white border-t border-slate-50 flex items-center justify-center">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="w-full max-w-md px-10 py-4 border-2 border-slate-100 text-slate-900 text-sm font-black rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerJobRequests;
