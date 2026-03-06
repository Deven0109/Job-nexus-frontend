import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineUserCircle,
    HiOutlineCalendar,
    HiOutlineVideoCamera,
    HiOutlineEllipsisVertical,
    HiOutlineSquare2Stack,
    HiOutlineClock
} from 'react-icons/hi2';
import { getJobPipeline } from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';


const EmployerPipelinePage = () => {
    const { jobId } = useParams();
    const [pipeline, setPipeline] = useState({});
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchPipeline = async () => {
            try {
                const res = await getJobPipeline(jobId);
                if (res.success) {
                    setPipeline(res.data);
                }
            } catch (error) {
                toast.error('Failed to load pipeline');
            } finally {
                setLoading(false);
            }
        };
        fetchPipeline();
    }, [jobId]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    const columns = [
        { key: 'Applied', title: 'New', color: 'bg-blue-600' },
        { key: 'Under Review', title: 'Review', color: 'bg-amber-500' },
        { key: 'Recruiter Shortlisted', title: 'Waiting Approval', color: 'bg-indigo-500' },
        { key: 'Employer Shortlisted', title: 'Shortlisted', color: 'bg-emerald-500' },
        { key: 'Interview Scheduled', title: 'Interviews', color: 'bg-violet-600' },
        { key: 'Selected Next Round', title: 'Next Rounds', color: 'bg-cyan-600' },
        { key: 'Final Selected', title: 'Hired', color: 'bg-emerald-600' },
        { key: 'Final Rejected', title: 'Closed', color: 'bg-rose-600' }
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/employer/dashboard" className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
                        <HiOutlineArrowLeft className="w-6 h-6 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Pipeline</h1>
                        <p className="text-slate-500 text-sm font-medium">Real-time interview and selection tracking</p>
                    </div>

                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
                <div className="flex gap-6 h-full min-w-max px-2">
                    {columns.map((col) => (
                        <div key={col.key} className="w-80 flex flex-col bg-slate-50 rounded-[40px] p-5 border border-slate-200/60">
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-6 px-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${col.color} shadow-sm`}></div>
                                    <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest">{col.title}</h3>
                                </div>
                                <span className="bg-white px-2.5 py-1 rounded-xl text-[10px] font-black text-slate-400 border border-slate-100">
                                    {pipeline[col.key]?.length || 0}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
                                {pipeline[col.key]?.map((app) => (
                                    <div key={app._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group border-b-4" style={{ borderBottomColor: col.color.replace('bg-', '') }}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center text-slate-300 font-black">
                                                    {app.candidate?.avatar ? (
                                                        <img
                                                            src={app.candidate.avatar.startsWith('http') ? app.candidate.avatar : `${BASE_URL}${app.candidate.avatar}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : app.candidate?.firstName?.[0]}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                                                        {app.candidate?.firstName} {app.candidate?.lastName}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">ID: {app._id.slice(-6)} • {app.candidate?.phone || 'No Phone'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interview Specific Details */}
                                        {app.interviewRounds?.length > 0 && (col.key === 'Interview Scheduled' || col.key === 'Selected Next Round') && (
                                            <div className="mb-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5 text-indigo-600">
                                                        <HiOutlineVideoCamera className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase">Round {app.interviewRounds[app.interviewRounds.length - 1].roundNumber}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                                                        <HiOutlineClock className="w-3 h-3" />
                                                        {new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[10px] font-bold text-slate-500 font-mono">{app.interviewRounds[app.interviewRounds.length - 1].meetCode}</p>
                                                    <a
                                                        href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                                        target="_blank"
                                                        className="px-3 py-1 bg-white text-indigo-600 rounded-lg text-[9px] font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Join
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <HiOutlineCalendar className="w-4 h-4" />
                                                <span className="text-[10px] font-bold">{new Date(app.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {col.key === 'Recruiter Shortlisted' ? (
                                                <Link
                                                    to={`/employer/jobs/${jobId}/review`}
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
                                                >
                                                    Approve
                                                </Link>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-slate-100"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {(!pipeline[col.key] || pipeline[col.key]?.length === 0) && (

                                    <div className="py-12 text-center opacity-30">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200">
                                            <HiOutlineSquare2Stack className="w-6 h-6 text-slate-200" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Stream</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployerPipelinePage;
