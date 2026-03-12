import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineChevronRight,
    HiOutlineXMark,
    HiOutlineUserGroup,
    HiOutlineArrowPath,
    HiOutlineBriefcase,
    HiOutlineChevronDoubleRight
} from 'react-icons/hi2';
import { getJobPipeline, updateApplicationStatus } from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

const COLUMN_CONFIG = [
    { key: 'Applied', title: 'Applied', color: 'bg-blue-500 shadow-blue-100', text: 'text-blue-600', bg: 'bg-blue-50', action: 'review' },
    {
        key: 'Under Review',
        title: 'Review',
        color: 'bg-amber-500 shadow-amber-100',
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        action: 'shortlist',
        include: ['Under Review', 'Recruiter Shortlisted']
    },
    { key: 'Employer Shortlisted', title: 'Shortlisted', color: 'bg-indigo-500 shadow-indigo-100', text: 'text-indigo-600', bg: 'bg-indigo-50', action: 'interview' },
    {
        key: 'Interview Scheduled',
        title: 'Interview',
        color: 'bg-purple-500 shadow-purple-100',
        text: 'text-purple-600',
        bg: 'bg-purple-50',
        action: 'next-round',
        include: ['Interview Scheduled', 'Selected Next Round']
    },
    { key: 'Final Selected', title: 'Hired', color: 'bg-emerald-500 shadow-emerald-100', text: 'text-emerald-600', bg: 'bg-emerald-50', action: 'hire' },
    {
        key: 'Final Rejected',
        title: 'Rejected',
        color: 'bg-red-500 shadow-red-100',
        text: 'text-red-600',
        bg: 'bg-red-50',
        action: null,
        include: ['Final Rejected', 'Recruiter Rejected', 'Employer Rejected']
    }
];

const RecruiterPipelinePage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [pipeline, setPipeline] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchPipeline = async () => {
        if (Object.keys(pipeline).length === 0) setLoading(true);
        try {
            const res = await getJobPipeline(jobId);
            if (res && (res.success || res.data)) {
                setPipeline(res.data || res || {});
            }
        } catch (error) {
            console.error('Pipeline error:', error);
            toast.error('Failed to load hiring pipeline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipeline();
    }, [jobId]);

    const handleAction = async (id, action) => {
        try {
            const loadToast = toast.loading('Moving candidate...');
            await updateApplicationStatus(id, action);
            toast.dismiss(loadToast);
            toast.success('Candidate moved forward');
            fetchPipeline();
        } catch (error) {
            toast.error('Failed to move candidate');
        }
    };

    const getCandidatesForColumn = (col) => {
        if (col.include) {
            return col.include.reduce((acc, status) => {
                const list = pipeline?.[status] || [];
                return [...acc, ...(Array.isArray(list) ? list : [])];
            }, []);
        }
        const list = pipeline?.[col.key] || [];
        return Array.isArray(list) ? list : [];
    };

    const totalCandidates = COLUMN_CONFIG.reduce((sum, col) => {
        return sum + getCandidatesForColumn(col).length;
    }, 0);

    if (loading) {
        return (
            <div className="h-screen bg-slate-50 flex flex-col p-6 animate-pulse">
                <div className="h-12 bg-white rounded-2xl w-full mb-6 border border-slate-100"></div>
                <div className="flex gap-4 overflow-hidden h-full">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="min-w-[320px] bg-slate-100/50 rounded-3xl h-full border border-slate-100"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 px-6 py-4 bg-white border-b border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/recruiter/manage-jobs')}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-dark-900 tracking-tight leading-none">
                            Hiring Pipeline
                        </h1>
                        <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                            <span className="text-primary-600">{totalCandidates}</span> Active Candidates
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchPipeline}
                        className="p-2 text-slate-400 hover:text-dark-900 transition-colors"
                        title="Refresh Board"
                    >
                        <HiOutlineArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to={`/recruiter/job/${jobId}/applications`}
                        className="px-5 py-2.5 bg-dark-900 text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-dark-100"
                    >
                        All Applications
                    </Link>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-4 p-6 overflow-x-auto overflow-y-hidden select-none scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {COLUMN_CONFIG.map((col) => {
                    const candidates = getCandidatesForColumn(col);
                    return (
                        <div
                            key={col.key}
                            className="w-[320px] min-w-[320px] max-w-[320px] flex flex-col bg-slate-100/30 rounded-[32px] border border-slate-200/50 p-3"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-3 py-3 mb-3 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-sm`} />
                                    <h3 className="text-xs font-black text-dark-900 uppercase tracking-widest">
                                        {col.title}
                                    </h3>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight ${col.bg} ${col.text}`}>
                                    {candidates.length}
                                </span>
                            </div>

                            {/* Cards List */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                                {candidates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 opacity-20 grayscale scale-90">
                                        <HiOutlineUserGroup className="w-12 h-12 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-tighter">Empty</p>
                                    </div>
                                ) : (
                                    candidates.map((app) => (
                                        <div
                                            key={app._id}
                                            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgb(0,0,0,0.02)] transition-all hover:shadow-xl hover:border-slate-300 group"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                    {app.candidate?.avatar && (
                                                        <img
                                                            src={
                                                                app.candidate.avatar.startsWith('http') ||
                                                                app.candidate.avatar.startsWith('data:')
                                                                    ? app.candidate.avatar
                                                                    : `${BASE_URL}${app.candidate.avatar}`
                                                            }
                                                            alt="Avatar"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.onerror = null;
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    {!app.candidate?.avatar && (
                                                        <span className={`text-sm font-black uppercase ${col.text}`}>
                                                            {app.candidate?.firstName?.[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-black text-dark-900 truncate">
                                                        {app.candidate?.firstName} {app.candidate?.lastName}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate">
                                                        {app.candidate?.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Info Pills */}
                                            {app.candidateProfile && (
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-md border border-slate-100">
                                                        <HiOutlineBriefcase className="w-3 h-3 text-slate-400" />
                                                        {app.candidateProfile.experience?.[0]?.companyName ? "Experienced" : "Fresher"}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/recruiter/job/${jobId}/applications`}
                                                    className="flex-1 text-center py-2 bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
                                                >
                                                    Profile
                                                </Link>
                                                {col.action && (
                                                    <button
                                                        onClick={() => handleAction(app._id, col.action)}
                                                        className={`p-2 rounded-lg ${col.bg} ${col.text} hover:scale-110 active:scale-90 transition-all shadow-sm`}
                                                        title="Move to Next Stage"
                                                    >
                                                        <HiOutlineChevronDoubleRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {col.key !== 'Final Rejected' && (
                                                    <button
                                                        onClick={() => handleAction(app._id, 'reject')}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 active:scale-90 transition-all shadow-sm"
                                                        title="Reject Candidate"
                                                    >
                                                        <HiOutlineXMark className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecruiterPipelinePage;
