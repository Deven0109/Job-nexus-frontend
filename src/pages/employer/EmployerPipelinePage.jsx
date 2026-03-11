import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { Skeleton, Box, Stack } from '@mui/material';


const EmployerPipelinePage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
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
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={44} height={44} sx={{ borderRadius: '16px' }} />
                <Box>
                    <Skeleton variant="text" width={180} height={32} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width={250} height={20} sx={{ borderRadius: 1, mt: 0.5 }} />
                </Box>
            </div>

            <div className="flex-1 overflow-x-auto pb-4 flex gap-4">
                {[1, 2, 3, 4].map(col => (
                    <div key={col} className="w-[320px] bg-slate-50/80 rounded-[24px] border border-slate-200 p-4 space-y-4">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                            <Skeleton variant="text" width={100} height={20} />
                            <Skeleton variant="rounded" width={30} height={20} />
                        </Box>
                        {[1, 2].map(card => (
                            <div key={card} className="bg-white p-5 rounded-[20px] border border-slate-200 space-y-3">
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width="80%" height={20} />
                                        <Skeleton variant="text" width="60%" height={14} />
                                    </Box>
                                </Box>
                                <Skeleton variant="rounded" width="100%" height={16} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    const columns = [
        { key: 'Applied', title: 'Applied', dot: 'bg-blue-500' },
        { key: 'Under Review', title: 'Review', dot: 'bg-amber-500' },
        { key: 'Recruiter Shortlisted', title: 'Waiting Approval', dot: 'bg-indigo-500' },
        { key: 'Employer Shortlisted', title: 'Shortlisted', dot: 'bg-emerald-500' },
        { key: 'Interview Scheduled', title: 'Interviews', dot: 'bg-violet-500' },
        { key: 'Selected Next Round', title: 'Next Rounds', dot: 'bg-cyan-500' },
        { key: 'Final Selected', title: 'Hired', dot: 'bg-teal-500' },
        { key: 'Final Rejected', title: 'Rejected', dot: 'bg-rose-500' }
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
                        <HiOutlineArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Pipeline</h1>
                        <p className="text-slate-500 text-sm font-medium">Real-time interview and selection tracking</p>
                    </div>

                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-4 h-full min-w-max">
                    {columns.map((col) => (
                        <div key={col.key} className="w-[320px] flex flex-col bg-slate-50/80 rounded-[24px] border border-slate-200 p-4">
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-sm`}></div>
                                    <h3 className="font-bold text-slate-800 text-sm tracking-wide">{col.title}</h3>
                                </div>
                                <span className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                                    {pipeline[col.key]?.length || 0}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                                {pipeline[col.key]?.map((app) => (
                                    <div key={app._id} className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${col.dot}`}></div>
                                        <div className="flex items-start gap-4 mb-3 pl-2">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                                                {app.candidate?.avatar ? (
                                                    <img
                                                        src={app.candidate.avatar.startsWith('http') ? app.candidate.avatar : `${BASE_URL}${app.candidate.avatar}`}
                                                        className="w-full h-full object-cover"
                                                        alt="avatar"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-black text-slate-400 uppercase">{app.candidate?.firstName?.[0]}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-[15px] font-bold text-slate-900 truncate">
                                                    {app.candidate?.firstName} {app.candidate?.lastName}
                                                </p>
                                                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                                                    {app.candidate?.phone || 'Private Number'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Interview Specific Details */}
                                        {app.interviewRounds?.length > 0 && (col.key === 'Interview Scheduled' || col.key === 'Selected Next Round') && (
                                            <div className="mb-3 ml-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-1.5 text-indigo-600">
                                                        <HiOutlineVideoCamera className="w-4 h-4" />
                                                        <span className="text-xs font-bold">Round {app.interviewRounds[app.interviewRounds.length - 1].roundNumber}</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        {new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-bold text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-100">
                                                        {app.interviewRounds[app.interviewRounds.length - 1].meetCode}
                                                    </p>
                                                    <a
                                                        href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                    >
                                                        Join
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-auto ml-2 pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <HiOutlineCalendar className="w-4 h-4" />
                                                <span className="text-xs font-semibold">{new Date(app.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {col.key === 'Recruiter Shortlisted' && (
                                                <Link
                                                    to={`/employer/jobs/${jobId}/review`}
                                                    className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-600 hover:text-white transition-all border border-primary-100"
                                                >
                                                    Review
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {(!pipeline[col.key] || pipeline[col.key]?.length === 0) && (
                                    <div className="py-10 flex flex-col items-center justify-center opacity-40">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-200">
                                            <div className={`w-3 h-3 rounded-full ${col.dot} opacity-50`}></div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500">Empty List</p>
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
