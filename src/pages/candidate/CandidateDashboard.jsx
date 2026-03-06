import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { getPublicJobs } from '../../api/jobs.api';
import toast from 'react-hot-toast';

const CandidateDashboard = () => {
    const { user } = useAuth();
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const res = await getPublicJobs({ limit: 4 });
                if (res.success) {
                    setRecommendedJobs(res.data.jobs || []);
                }
            } catch (err) {
                console.error('Failed to fetch recommended jobs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommended();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Greeting Header */}
            <div className="relative overflow-hidden gradient-hero rounded-3xl p-8 md:p-10 text-white shadow-2xl shadow-primary-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10">
                        Candidate Portal
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                        Welcome back, {user?.firstName || 'Candidate'}! <span className="animate-pulse">👋</span>
                    </h2>
                    <p className="text-primary-100/80 text-lg max-w-xl font-medium leading-relaxed">
                        Your career journey is looking bright. You have <span className="text-white font-bold underline decoration-accent-400 underline-offset-4 cursor-default">3 pending</span> notifications from your recent applications.
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total Applications', value: '12', icon: HiOutlineDocumentText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Upcoming Interviews', value: '2', icon: HiOutlineCalendarDays, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Job Offers', value: '1', icon: HiOutlineCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Saved Positions', value: '24', icon: HiOutlineBriefcase, color: 'text-rose-500', bg: 'bg-rose-50' },
                ].map((stat) => (
                    <div key={stat.label} className="group card p-6 border-none ring-1 ring-slate-200/60 hover:ring-primary-300 transition-all duration-300">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">Recommended Jobs</h3>
                        <a href="/jobs" className="text-sm font-bold text-primary-600 hover:underline">View all jobs</a>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            Array(2).fill().map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse ring-1 ring-slate-200"></div>
                            ))
                        ) : recommendedJobs.length === 0 ? (
                            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                No job recommendations yet
                            </div>
                        ) : (
                            recommendedJobs.map((job) => (
                                <div key={job._id} className="group flex items-center gap-5 p-5 bg-white rounded-2xl ring-1 ring-slate-200 hover:ring-primary-200 transition-all hover:shadow-xl hover:shadow-primary-50">
                                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 font-bold text-slate-400 group-hover:text-primary-500 transition-colors overflow-hidden">
                                        {job.companyId?.logo ? (
                                            <img src={job.companyId.logo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            job.companyId?.companyName?.[0] || 'C'
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {job.companyId?.companyName} • ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex gap-2">
                                        {job.requiredSkills?.slice(0, 2).map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 uppercase">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar area */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                    <div className="card p-6 space-y-6">
                        {[
                            { text: 'Applied to Senior UX Designer', time: '2h ago', status: 'success' },
                            { text: 'Interview scheduled with MS', time: 'Yesterday', status: 'info' }
                        ].map((activity, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-2 h-2 mt-2 rounded-full bg-${activity.status}-500 shrink-0`}></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 leading-tight">{activity.text}</p>
                                    <p className="text-xs text-slate-400 font-medium">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors uppercase tracking-widest">
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;
