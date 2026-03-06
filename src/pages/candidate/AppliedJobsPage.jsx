import { useState, useEffect } from 'react';
import {
    HiOutlineDocumentText,
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineVideoCamera,
    HiOutlineCalendar,
    HiOutlineEye,
    HiOutlineChevronRight,
    HiOutlineInformationCircle,
    HiOutlineCurrencyRupee
} from 'react-icons/hi2';
import { getMyApplications } from '../../api/applications.api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const STATUS_MAPPING = {
    'Applied': { display: 'Applied', color: 'bg-blue-100 text-blue-600', step: 1 },
    'Under Review': { display: 'Under Review', color: 'bg-amber-100 text-amber-600', step: 2 },
    'Recruiter Shortlisted': { display: 'Reviewing', color: 'bg-amber-500 text-white', step: 2 },
    'Recruiter Rejected': { display: 'Rejected', color: 'bg-rose-100 text-rose-600', step: 2, isRejected: true },
    'Employer Shortlisted': { display: 'Shortlisted', color: 'bg-emerald-100 text-emerald-600', step: 3 },
    'Employer Rejected': { display: 'Rejected', color: 'bg-rose-100 text-rose-600', step: 2, isRejected: true },
    'Interview Scheduled': { display: 'Interview Scheduled', color: 'bg-indigo-600 text-white', step: 4 },
    'Interview Completed': { display: 'Interview Completed', color: 'bg-slate-100 text-slate-600', step: 5 },
    'Selected Next Round': { display: 'Selected for Next Round', color: 'bg-cyan-100 text-cyan-600', step: 5 },
    'Final Selected': { display: 'Selected', color: 'bg-emerald-600 text-white', step: 6 },
    'Final Rejected': { display: 'Rejected', color: 'bg-rose-100 text-rose-600', step: 4, isRejected: true }
};



const AppliedJobsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await getMyApplications();
                if (res.success) {
                    setApplications(res.data);
                }
            } catch (error) {
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Job Pipeline</h1>
                    <p className="text-slate-500 mt-1 font-medium">Track your journey from application to selection</p>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-20 text-center">
                    <HiOutlineDocumentText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
                    <p className="text-slate-500 mb-8">Start your career journey by applying to active jobs.</p>
                    <Link to="/jobs" className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-100">
                        Explore Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                            <div className="p-8 sm:p-10">
                                <div className="flex flex-col lg:flex-row gap-10">
                                    {/* Left: Job Details */}
                                    <div className="lg:w-1/3">
                                        <div className="mb-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_MAPPING[app.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                                                {STATUS_MAPPING[app.status]?.display || app.status}
                                            </span>
                                            <h2 className="text-2xl font-black text-slate-900 mt-3 mb-1">{app.job?.title}</h2>
                                            <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                                                <HiOutlineBriefcase className="w-4 h-4" />
                                                {app.job?.companyId?.companyName}
                                            </p>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                                    <p className="text-xs font-black text-slate-700 truncate flex items-center gap-1">
                                                        <HiOutlineMapPin className="w-3 h-3 text-slate-400" />
                                                        {app.job?.location || [app.job?.city, app.job?.state, app.job?.country].filter(Boolean).join(', ') || 'Not Specified'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Salary</p>
                                                    <p className="text-xs font-black text-slate-700 truncate flex items-center gap-1">
                                                        <HiOutlineCurrencyRupee className="w-3 h-3 text-slate-400" />
                                                        {app.job?.salaryMin ? `₹${app.job.salaryMin.toLocaleString()} - ₹${app.job.salaryMax?.toLocaleString()}` : 'Not Disclosed'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Work Type</p>
                                                    <p className="text-xs font-black text-slate-700 truncate capitalize flex items-center gap-1">
                                                        <HiOutlineBriefcase className="w-3 h-3 text-slate-400" />
                                                        {app.job?.workType || 'Full Time'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                                                    <p className="text-xs font-black text-slate-700 truncate flex items-center gap-1">
                                                        <HiOutlineInformationCircle className="w-3 h-3 text-slate-400" />
                                                        {app.job?.experience || 'Freshers'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold px-1">
                                                <HiOutlineClock className="w-4 h-4 text-slate-300" />
                                                Applied on {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <Link
                                            to={`/jobs/${app.job?._id}`}
                                            className="w-full py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all border border-slate-200"
                                        >
                                            <HiOutlineEye className="w-5 h-5" />
                                            View Full Job Details
                                        </Link>
                                    </div>

                                    {/* Middle: Pipeline View */}
                                    <div className="flex-1">
                                        <div className="bg-slate-50 rounded-[32px] p-8">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4">Application Progress</h3>

                                            <div className="relative flex justify-between">
                                                {/* Background Line */}
                                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0">
                                                    {/* Progress Line */}
                                                    {(() => {
                                                        const stepsArr = [1, 2, 4, 6];
                                                        const currentStatus = STATUS_MAPPING[app.status];
                                                        const currentStep = currentStatus?.step || 1;
                                                        const activeIdx = stepsArr.indexOf(stepsArr.find(s => s >= currentStep) || 6);
                                                        const isRejected = currentStatus?.isRejected;
                                                        const progress = (activeIdx / (stepsArr.length - 1)) * 100;

                                                        return (
                                                            <div
                                                                className={`h-full transition-all duration-700 ${isRejected ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        );
                                                    })()}
                                                </div>

                                                {[
                                                    { id: 1, label: 'Applied' },
                                                    { id: 2, label: 'Review' },
                                                    { id: 4, label: 'Interview' },
                                                    { id: 6, label: 'Selected' }
                                                ].map((step) => {
                                                    const currentStatus = STATUS_MAPPING[app.status];
                                                    const currentStep = currentStatus?.step || 1;
                                                    const isRejected = currentStatus?.isRejected;
                                                    const isCompleted = currentStep > step.id || (currentStep === step.id && !isRejected);
                                                    const isCurrentRejected = isRejected && currentStep === step.id;

                                                    return (
                                                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm transition-all duration-500 ${isCompleted
                                                                ? 'bg-emerald-500 text-white'
                                                                : isCurrentRejected ? 'bg-rose-500 text-white animate-bounce-subtle' : 'bg-white text-slate-300'
                                                                }`}>
                                                                {isCompleted ? (
                                                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                                                ) : isCurrentRejected ? (
                                                                    <HiOutlineXCircle className="w-5 h-5" />
                                                                ) : (
                                                                    <span className="text-xs font-bold">{step.id}</span>
                                                                )}
                                                            </div>

                                                            <span className={`text-[10px] font-black uppercase mt-3 tracking-widest ${isCompleted
                                                                ? 'text-emerald-600'
                                                                : isCurrentRejected ? 'text-rose-600' : 'text-slate-400'
                                                                }`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Specialized Feedback based on Status */}
                                            <div className="mt-10">
                                                {app.status === 'Interview Scheduled' && app.interviewRounds?.length > 0 && (
                                                    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-pulse-slow">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                                                <HiOutlineVideoCamera className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-indigo-600 uppercase">Interview Confirmation</p>
                                                                <p className="text-sm font-bold text-slate-900">Round {app.interviewRounds[app.interviewRounds.length - 1].roundNumber} is Scheduled</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div className="bg-slate-50 p-3 rounded-xl text-center">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date & Time</p>
                                                                <p className="text-xs font-black text-slate-700">{new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleString()}</p>
                                                            </div>
                                                            <div className="bg-slate-50 p-3 rounded-xl text-center">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Meet Code</p>
                                                                <p className="text-xs font-black text-slate-700 font-mono tracking-tighter">{app.interviewRounds[app.interviewRounds.length - 1].meetCode}</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                                        >
                                                            <HiOutlineVideoCamera className="w-5 h-5" />
                                                            Launch Google Meet Session
                                                        </a>
                                                    </div>
                                                )}

                                                {app.status === 'Final Selected' && (
                                                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                                                            <HiOutlineCheckCircle className="w-7 h-7 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-emerald-900">Job Offer Pending!</h4>
                                                            <p className="text-sm text-emerald-700 font-medium">Congratulations! You've been selected for this position. The HR team will contact you shortly.</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {(app.status === 'Final Rejected' || app.status === 'Employer Rejected' || app.status === 'Recruiter Rejected') && (
                                                    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-100">
                                                            <HiOutlineXCircle className="w-7 h-7 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-rose-900">Application Closed</h4>
                                                            <p className="text-sm text-rose-700 font-medium">Thank you for your interest. We've decided to move forward with other candidates at this time.</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {app.status === 'Applied' && (
                                                    <div className="flex items-center gap-3 text-slate-400 bg-white p-5 rounded-2xl border border-slate-100">
                                                        <HiOutlineInformationCircle className="w-5 h-5" />
                                                        <p className="text-xs font-bold italic tracking-tight">Your application is currently at the top of the recruiter's queue for screening.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppliedJobsPage;
