import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMyJobRequestById, updateJobRequest } from '../../api/employer.api';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineCurrencyRupee,
    HiOutlineUsers,
    HiOutlineClock,
    HiOutlineBolt,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlinePencilSquare,
    HiOutlineXMark,
    HiOutlineDocumentText,
    HiOutlineArrowPath,
    HiOutlineBanknotes
} from 'react-icons/hi2';

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED'];
const CURRENCY_SYMBOLS = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'AED '
};

const STATUS_COLORS = {
    pending: 'bg-warning-100 text-warning-800',
    approved: 'bg-success-100 text-success-800',
    rejected: 'bg-danger-100 text-danger-800',
    active: 'bg-primary-100 text-primary-800',
};

const URGENCY_COLORS = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
};

const CATEGORIES = [
    'Information Technology', 'Healthcare', 'Finance & Banking', 'Education',
    'Manufacturing', 'Marketing', 'Sales', 'Human Resources', 'Engineering',
    'Design', 'Customer Service', 'Legal', 'Accounting', 'Operations', 'Other',
];
const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High'];

const ViewJobRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editMode = searchParams.get('edit') === 'true';

    const [jobRequest, setJobRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState({});
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getMyJobRequestById(id);
                if (res.success && res.data) {
                    setJobRequest(res.data.jobRequest);
                    if (editMode && res.data.jobRequest.status === 'pending') {
                        setIsEditing(true);
                        setEditData({ ...res.data.jobRequest });
                    }
                }
            } catch (error) {
                toast.error('Failed to load job request');
                navigate('/employer/job-requests');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, editMode]);

    const handleEdit = () => {
        setEditData({ ...jobRequest });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditData({});
        setIsEditing(false);
        setSkillInput('');
    };

    const handleChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSkill = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
            e.preventDefault();
            if (!editData.requiredSkills?.includes(skillInput.trim())) {
                setEditData(prev => ({ ...prev, requiredSkills: [...(prev.requiredSkills || []), skillInput.trim()] }));
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (index) => {
        setEditData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!editData.jobTitle?.trim()) return toast.error('Job title is required');
        if (!editData.jobCategory) return toast.error('Category is required');
        if (!editData.country) return toast.error('Country is required');
        if (!editData.state) return toast.error('State is required');
        if (!editData.city) return toast.error('City is required');
        if (!editData.requiredSkills || editData.requiredSkills.length === 0) return toast.error('At least one skill is required');

        setIsSaving(true);
        try {
            const res = await updateJobRequest(id, {
                jobTitle: editData.jobTitle,
                jobCategory: editData.jobCategory,
                numberOfVacancies: Number(editData.numberOfVacancies),
                experienceRequired: editData.experienceRequired,
                salaryMin: Number(editData.salaryMin),
                salaryMax: Number(editData.salaryMax),
                currency: editData.currency,
                workType: editData.workType,
                country: editData.country,
                state: editData.state,
                city: editData.city,
                pincode: editData.pincode,
                requiredSkills: editData.requiredSkills,
                jobDescription: editData.jobDescription,
                urgency: editData.urgency,
            });
            if (res.success) {
                setJobRequest(res.data.jobRequest);
                setIsEditing(false);
                toast.success('Job request updated');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setIsSaving(false);
        }
    };

    const formatSalary = (n, currency = 'INR') => {
        if (n === null || n === undefined || isNaN(Number(n))) return '—';
        const num = Number(n);
        const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.INR;

        if (currency === 'INR') {
            if (num >= 100000) return `${symbol}${(num / 100000).toFixed(1)}L`;
            if (num >= 1000) return `${symbol}${(num / 1000).toFixed(0)}K`;
        } else {
            if (num >= 1000000) return `${symbol}${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${symbol}${(num / 1000).toFixed(1)}K`;
        }
        return `${symbol}${num}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none";

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="card p-8 animate-pulse">
                    <div className="h-8 w-64 bg-dark-200 rounded-xl mb-6"></div>
                    <div className="space-y-4">
                        {Array(6).fill().map((_, i) => (
                            <div key={i} className="h-12 bg-dark-100 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!jobRequest) return null;

    const data = isEditing ? editData : jobRequest;

    return (
        <div className="space-y-6">

            {/* Header / Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90" />

                <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <button
                        onClick={() => navigate('/employer/job-requests')}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all border border-white/10 z-10"
                    >
                        <HiOutlineXMark className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => navigate('/employer/job-requests')}
                            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10"
                        >
                            <HiOutlineArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[jobRequest.status]} ring-1 ring-white/20`}>
                                    {jobRequest.status}
                                </span>
                                {jobRequest.companyId?.companyName && (
                                    <span className="text-xs font-bold text-white/80">
                                        by {jobRequest.companyId.companyName}
                                    </span>
                                )}
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${URGENCY_COLORS[jobRequest.urgency]}`}>
                                    {jobRequest.urgency} Priority
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">{jobRequest.jobTitle}</h2>
                            <p className="text-blue-100 font-medium flex items-center gap-2">
                                <HiOutlineBriefcase className="w-4 h-4" />
                                {jobRequest.jobCategory}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {jobRequest.status === 'pending' && !isEditing && (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-dark-900 text-sm font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                <HiOutlinePencilSquare className="w-4 h-4" />
                                Edit Request
                            </button>
                        )}
                        {isEditing && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-6 py-3 bg-white/10 text-white text-sm font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {jobRequest.status === 'approved' && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                    Request approved! The recruiter is preparing your job posting.
                </div>
            )}
            {jobRequest.status === 'rejected' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2">
                    <p className="text-red-700 font-bold text-sm flex items-center gap-3">
                        <HiOutlineXCircle className="w-5 h-5" />
                        Request rejected
                    </p>
                    {jobRequest.rejectionReason && (
                        <p className="text-xs text-red-600 ml-8 bg-white/50 p-2 rounded-lg italic">
                            Reason: {jobRequest.rejectionReason}
                        </p>
                    )}
                </div>
            )}
            {jobRequest.status === 'active' && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-700 font-bold text-sm">
                    <HiOutlineBolt className="w-5 h-5 animate-pulse" />
                    This job is now LIVE on the portal!
                </div>
            )}

            {/* Details Card */}
            <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Category Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        {isEditing ? (
                            <select value={data.jobCategory} onChange={e => handleChange('jobCategory', e.target.value)} className={`${inputCls} appearance-none cursor-pointer border-none bg-white`}>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.jobCategory}</p>
                        )}
                    </div>

                    {/* Vacancies Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vacancies</label>
                        {isEditing ? (
                            <input type="number" min="1" value={data.numberOfVacancies} onChange={e => handleChange('numberOfVacancies', e.target.value)} className={`${inputCls} border-none bg-white`} />
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.numberOfVacancies} positions</p>
                        )}
                    </div>

                    {/* Experience Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Experience</label>
                        {isEditing ? (
                            <input type="text" value={data.experienceRequired} onChange={e => handleChange('experienceRequired', e.target.value)} className={`${inputCls} border-none bg-white`} />
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.experienceRequired}</p>
                        )}
                    </div>

                    {/* Salary Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range & Currency</label>
                        {isEditing ? (
                            <div className="flex flex-col gap-3">
                                <select value={data.currency} onChange={e => handleChange('currency', e.target.value)} className={`${inputCls} border-none bg-white appearance-none cursor-pointer`}>
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="flex gap-3">
                                    <input type="number" value={data.salaryMin} onChange={e => handleChange('salaryMin', e.target.value)} className={`${inputCls} border-none bg-white flex-1`} placeholder="Min" />
                                    <input type="number" value={data.salaryMax} onChange={e => handleChange('salaryMax', e.target.value)} className={`${inputCls} border-none bg-white flex-1`} placeholder="Max" />
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-black text-slate-900">{formatSalary(data.salaryMin, data.currency)} – {formatSalary(data.salaryMax, data.currency)}</p>
                        )}
                    </div>

                    {/* Work Type Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Type</label>
                        {isEditing ? (
                            <select value={data.workType} onChange={e => handleChange('workType', e.target.value)} className={`${inputCls} appearance-none cursor-pointer border-none bg-white`}>
                                {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.workType}</p>
                        )}
                    </div>

                    {/* Location Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={data.country} onChange={e => handleChange('country', e.target.value)} className={`${inputCls} border-none bg-white p-2`} placeholder="Country" />
                                <input type="text" value={data.state} onChange={e => handleChange('state', e.target.value)} className={`${inputCls} border-none bg-white p-2`} placeholder="State" />
                                <input type="text" value={data.city} onChange={e => handleChange('city', e.target.value)} className={`${inputCls} border-none bg-white p-2`} placeholder="City" />
                                <input type="text" value={data.pincode || ''} onChange={e => handleChange('pincode', e.target.value)} className={`${inputCls} border-none bg-white p-2`} placeholder="Pincode" />
                            </div>
                        ) : (
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {[data.city, data.state, data.country].filter(Boolean).join(', ')}
                                {data.pincode ? ` - ${data.pincode}` : ''}
                            </p>
                        )}
                    </div>

                    {/* Urgency Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgency</label>
                        {isEditing ? (
                            <select value={data.urgency} onChange={e => handleChange('urgency', e.target.value)} className={`${inputCls} appearance-none cursor-pointer border-none bg-white`}>
                                {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        ) : (
                            <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black md:text-[10px] uppercase tracking-wider ${URGENCY_COLORS[data.urgency]}`}>
                                {data.urgency}
                            </span>
                        )}
                    </div>

                    {/* Submitted Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Submitted</label>
                        <p className="text-sm font-black text-slate-900 uppercase">{formatDate(jobRequest.createdAt)}</p>
                    </div>

                    {/* Skills */}
                    <div className="md:col-span-2 pt-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Required Skills</label>
                        {isEditing ? (
                            <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                                <div className="flex flex-wrap gap-2 min-h-[56px] items-center">
                                    {data.requiredSkills?.map((skill, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-primary-700 font-bold text-xs rounded-xl border border-slate-200">
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill(i)} className="hover:text-red-500">
                                                <HiOutlineXMark className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1 font-bold placeholder:text-slate-300"
                                        placeholder="Add skill..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {data.requiredSkills?.map((skill, i) => (
                                    <span key={i} className="px-5 py-2.5 bg-indigo-50/30 border border-indigo-100/50 text-indigo-600 font-black text-xs rounded-2xl shadow-sm tracking-tight transition-all hover:bg-indigo-50">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 pt-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Job Description</label>
                        {isEditing ? (
                            <textarea
                                value={data.jobDescription}
                                onChange={e => handleChange('jobDescription', e.target.value)}
                                rows="5"
                                maxLength={5000}
                                className={`${inputCls} resize-none leading-relaxed bg-white border border-slate-200 p-5 rounded-[24px]`}
                                placeholder="Enter full job details..."
                            />
                        ) : (
                            <div className="p-8 bg-slate-50/30 rounded-3xl border border-slate-100/50 min-h-[160px]">
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-bold">{data.jobDescription}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-10 bg-white border-t border-slate-50 flex items-center justify-center">
                    <button
                        onClick={() => navigate('/employer/job-requests')}
                        className="w-full max-w-md px-10 py-4 border-2 border-slate-100 text-slate-900 text-sm font-black rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 shadow-sm"
                    >
                        Close
                    </button>
                </div>

                {/* Date Created/Updated */}
                <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black text-slate-400">
                    <div className="flex items-center gap-8">
                        <span className="flex items-center gap-2">
                            <HiOutlineClock className="w-3.5 h-3.5 mb-0.5" />
                            SUBMITTED: {formatDate(jobRequest.createdAt).toUpperCase()}
                        </span>
                        {jobRequest.updatedAt && jobRequest.updatedAt !== jobRequest.createdAt && (
                            <span className="flex items-center gap-2">
                                <HiOutlineArrowPath className="w-3.5 h-3.5 mb-0.5" />
                                LAST UPDATED: {formatDate(jobRequest.updatedAt).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {jobRequest.status === 'approved' && jobRequest.approvedAt && (
                        <div className="flex items-center gap-2 text-emerald-500">
                            <HiOutlineCheckCircle className="w-4 h-4" />
                            <span className="uppercase">Approved by Recruiter on {formatDate(jobRequest.approvedAt)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewJobRequest;
