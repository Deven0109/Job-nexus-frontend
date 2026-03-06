import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineUserCircle,
    HiOutlineCalendar,
    HiOutlineVideoCamera,
    HiOutlineEllipsisVertical
} from 'react-icons/hi2';
import { getJobPipeline } from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';


const RecruiterPipelinePage = () => {
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
        { key: 'Applied', title: 'New Apps', color: 'bg-blue-600' },
        { key: 'Under Review', title: 'Reviewing', color: 'bg-amber-500' },
        { key: 'Recruiter Shortlisted', title: 'Recruiter SL', color: 'bg-indigo-500' },
        { key: 'Employer Shortlisted', title: 'Shortlisted', color: 'bg-emerald-500' },
        { key: 'Interview Scheduled', title: 'Interviews', color: 'bg-violet-600' },
        { key: 'Selected Next Round', title: 'Selected Next', color: 'bg-cyan-600' },
        { key: 'Final Selected', title: 'Selected', color: 'bg-emerald-600' },
        { key: 'Final Rejected', title: 'Rejected', color: 'bg-rose-600' }
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/recruiter/manage-jobs" className="p-2 hover:bg-white rounded-xl transition-all">
                        <HiOutlineArrowLeft className="w-6 h-6 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hirirng Pipeline</h1>
                        <p className="text-slate-500 text-sm font-medium">Kanban board for candidate stages</p>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-6 h-full min-w-max px-2">
                    {columns.map((col) => (
                        <div key={col.key} className="w-80 flex flex-col bg-slate-100/50 rounded-[32px] p-4 border border-slate-200/60">
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                                    <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">{col.title}</h3>
                                </div>
                                <span className="bg-white px-2.5 py-1 rounded-lg text-xs font-black text-slate-400 border border-slate-200">
                                    {pipeline[col.key]?.length || 0}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                {pipeline[col.key]?.map((app) => (
                                    <div key={app._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center text-slate-300 font-black">
                                                    {app.candidate?.avatar ? (
                                                        <img
                                                            src={app.candidate.avatar.startsWith('http') ? app.candidate.avatar : `${BASE_URL}${app.candidate.avatar}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : app.candidate?.firstName?.[0]}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate">
                                                        {app.candidate?.firstName} {app.candidate?.lastName}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{app.candidate?.email}</p>

                                                </div>
                                            </div>
                                            <button className="text-slate-300 hover:text-slate-600 transition-colors">
                                                <HiOutlineEllipsisVertical className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {app.interviewRounds?.length > 0 && col.key === 'Interview Scheduled' && (
                                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-indigo-600">
                                                    <HiOutlineVideoCamera className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase">Live Round</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {/* Placeholder for tags or multiple rounds */}
                                                <div className="w-6 h-6 rounded-full bg-slate-50 border border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                    {col.key === 'Applied' ? 'New' : '...'}
                                                </div>
                                            </div>
                                            <Link
                                                to={`/recruiter/job/${jobId}/applications`}
                                                className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                                            >
                                                Manage
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                                {(!pipeline[col.key] || pipeline[col.key]?.length === 0) && (

                                    <div className="py-8 text-center">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Empty</p>
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

export default RecruiterPipelinePage;
