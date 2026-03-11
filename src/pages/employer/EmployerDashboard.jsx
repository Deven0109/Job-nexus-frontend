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
        <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl"></div>)}
            </div>
            <div className="h-64 bg-white border border-slate-200 rounded-2xl"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-[26px] font-bold text-slate-900 tracking-tight mb-1">
                    Welcome back, {user?.firstName}!
                </h1>
                <p className="text-sm text-slate-500 font-medium">Here's what's happening with your recruitment process today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 border border-${stat.color}-100 flex items-center justify-center shrink-0`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Recent Activity
                    </h2>
                    <Link to="/employer/pipelines" className="text-[14px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
                        View All
                        <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {activities.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <HiOutlineBuildingOffice2 className="w-6 h-6 text-slate-300" />
                            </div>
                            <h3 className="text-[15px] font-bold text-slate-900">No recent activity</h3>
                            <p className="text-[13px] text-slate-500 mt-1 max-w-sm mx-auto">
                                When candidates apply or status changes occur, you'll see them here.
                            </p>
                        </div>
                    ) : (
                        activities.slice(0, 5).map((activity) => (
                            <Link
                                key={activity._id}
                                to={activity.status === 'Recruiter Shortlisted'
                                    ? `/employer/jobs/${activity.job?._id}/review`
                                    : `/employer/jobs/${activity.job?._id}/pipeline`}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[15px] font-bold text-slate-900">
                                            {activity.candidate?.firstName} {activity.candidate?.lastName}
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
                                            {activity.job?.title}
                                        </span>
                                    </div>
                                    <p className="text-[14px] text-slate-600 mt-1">
                                        Status updated to <span className="font-semibold text-primary-600">{activity.status}</span>
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[11px] font-semibold text-slate-400 mb-1">
                                        {new Date(activity.updatedAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex justify-end">
                                        <HiOutlineArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
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
