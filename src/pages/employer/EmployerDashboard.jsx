import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineBriefcase,
    HiOutlineUsers,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineBuildingOffice2,
    HiOutlineArrowRight,
    HiOutlineBolt,
    HiOutlineSquare2Stack
} from 'react-icons/hi2';

import { getEmployerActiveJobs, getEmployerRecentActivity } from '../../api/employer.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';


const EmployerDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [jobsRes, activityRes] = await Promise.all([
                    getEmployerActiveJobs(),
                    getEmployerRecentActivity()
                ]);

                if (jobsRes.success) setJobs(jobsRes.data.jobs || []);
                if (activityRes.success) setActivities(activityRes.data || []);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);


    const stats = [
        { label: 'Active Jobs', value: jobs.length, icon: HiOutlineBriefcase, color: 'blue' },
        { label: 'Pending Requests', value: '0', icon: HiOutlineArrowRight, color: 'amber' }, // Placeholder
        { label: 'Interviews', value: '0', icon: HiOutlineCalendarDays, color: 'indigo' },
        { label: 'Total Hires', value: '0', icon: HiOutlineCheckCircle, color: 'emerald' },
    ];

    if (loading) return (
        <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[32px]"></div>)}
            </div>
            <div className="h-96 bg-slate-50 rounded-[40px]"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-[28px] font-black text-slate-900 tracking-tight mb-2">
                    Welcome back, {user?.firstName}!
                </h1>
                <p className="text-slate-500 font-medium">Here's what's happening with your recruitment process today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                    <Link to="/employer/pipelines" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
                        View All Applications
                        <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                            <HiOutlineBuildingOffice2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No recent activity</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                                When candidates apply or status changes occur, you'll see them here.
                            </p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <Link
                                key={activity._id}
                                to={activity.status === 'Recruiter Shortlisted'
                                    ? `/employer/jobs/${activity.job?._id}/review`
                                    : `/employer/jobs/${activity.job?._id}/pipeline`}
                                className="block bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                                        {activity.candidate?.avatar ? (
                                            <img
                                                src={activity.candidate.avatar.startsWith('http') ? activity.candidate.avatar : `${BASE_URL}${activity.candidate.avatar}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-black text-slate-300">{activity.candidate?.firstName?.[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-black text-slate-900">
                                                {activity.candidate?.firstName} {activity.candidate?.lastName}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-xs font-bold text-slate-500 truncate">
                                                {activity.job?.title}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-500">
                                            Status updated to <span className="font-black text-primary-600">{activity.status}</span>
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            {new Date(activity.updatedAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex justify-end">
                                            <div className="bg-slate-50 p-1.5 rounded-lg group-hover:bg-primary-50 transition-colors">
                                                <HiOutlineArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default EmployerDashboard;
