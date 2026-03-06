import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlineDocumentArrowDown,
    HiOutlineMapPin,
    HiOutlinePhone,
    HiOutlineEnvelope,
    HiOutlineVideoCamera,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineUserCircle,
    HiOutlinePaperAirplane,
    HiOutlineCalendarDays
} from 'react-icons/hi2';
import {
    getJobApplications,
    updateApplicationStatus,
    scheduleInterview
} from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';


const STATUS_COLORS = {
    'Applied': 'bg-blue-100 text-blue-600',
    'Under Review': 'bg-amber-100 text-amber-600',
    'Recruiter Shortlisted': 'bg-indigo-100 text-indigo-600',
    'Employer Shortlisted': 'bg-emerald-100 text-emerald-600',
    'Interview Scheduled': 'bg-violet-600 text-white',
    'Selected Next Round': 'bg-cyan-100 text-cyan-600',
    'Final Selected': 'bg-emerald-600 text-white',
    'Final Rejected': 'bg-rose-100 text-rose-600',
    'Recruiter Rejected': 'bg-rose-100 text-rose-600',
    'Employer Rejected': 'bg-rose-100 text-rose-600'
};

const RecruiterApplicationsPage = () => {
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isScheduling, setIsScheduling] = useState(null);
    const [interviewData, setInterviewData] = useState({
        roundNumber: 1,
        meetLink: '',
        meetCode: '',
        scheduledAt: ''
    });

    const fetchApplications = async () => {
        try {
            const res = await getJobApplications(jobId);
            if (res.success) {
                setApplications(res.data);
                if (res.data.length > 0) setJobDetails(res.data[0].job);
            }
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateApplicationStatus(id, status);
            toast.success(`Candidate status updated to ${status.replace('-', ' ')}`);
            fetchApplications();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            await scheduleInterview(isScheduling, interviewData);
            toast.success('Interview scheduled successfully');
            setIsScheduling(null);
            fetchApplications();
        } catch (error) {
            toast.error('Failed to schedule interview');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link to="/recruiter/manage-jobs" className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
                        <HiOutlineArrowLeft className="w-6 h-6 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Applications Review</h1>
                        <p className="text-slate-500 font-medium">Position: <span className="text-primary-600 font-black">{jobDetails?.title || 'Job ID: ' + jobId}</span></p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-bold italic uppercase tracking-wider">
                            <HiOutlineMapPin className="w-3.5 h-3.5" />
                            {jobDetails?.location || (jobDetails?.city ? `${jobDetails.city}, ${jobDetails.state}, ${jobDetails.country}` : 'Loading location...')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link to={`/recruiter/job/${jobId}/pipeline`} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-black transition-all">
                        <HiOutlineCalendarDays className="w-5 h-5" />
                        View Kanban Board
                    </Link>
                </div>
            </div>

            {/* Application List */}
            <div className="space-y-6">
                {applications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <HiOutlineUserCircle className="w-20 h-20 text-slate-100 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No applications found</h3>
                        <p className="text-slate-500 mt-2">New applications will appear here once candidates apply.</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app._id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row gap-10">
                                    {/* Candidate Profile Info */}
                                    <div className="lg:w-1/3 border-r border-slate-50 pr-6">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-16 h-16 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center justify-center text-slate-300 font-black text-xl overflow-hidden">
                                                {app.candidate?.avatar ? (
                                                    <img
                                                        src={app.candidate.avatar.startsWith('http') ? app.candidate.avatar : `${BASE_URL}${app.candidate.avatar}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : app.candidate?.firstName?.[0]}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight">
                                                    {app.candidate?.firstName} {app.candidate?.lastName}
                                                </h3>
                                                <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[app.status]}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                                <HiOutlineEnvelope className="w-5 h-5 text-slate-300" />
                                                {app.candidate?.email}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                                <HiOutlinePhone className="w-5 h-5 text-slate-300" />
                                                {app.candidate?.phone || 'N/A'}
                                            </div>
                                        </div>


                                        <a
                                            href={(app.resumeUrl || app.candidateProfile?.resumeUrl)?.startsWith('http') ? (app.resumeUrl || app.candidateProfile?.resumeUrl) : `${BASE_URL}${app.resumeUrl || app.candidateProfile?.resumeUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3.5 bg-primary-50 text-primary-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-primary-100 transition-all border border-primary-100 border-dashed"
                                        >
                                            <HiOutlineDocumentArrowDown className="w-5 h-5" />
                                            View Candidate Resume
                                        </a>
                                    </div>

                                    {/* Actions & Decision */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                            {/* Step 1: Screening */}
                                            {app.status === 'Applied' && (
                                                <div className="col-span-full flex gap-3">
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, 'review')}
                                                        className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black text-sm hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Move to Review
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, 'reject')}
                                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <HiOutlineXCircle className="w-5 h-5" />
                                                        Initial Reject
                                                    </button>
                                                </div>
                                            )}

                                            {/* Step 2: Recruiter Shortlist (Send to Employer) */}
                                            {app.status === 'Under Review' && (
                                                <div className="col-span-full flex flex-col gap-4">
                                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                                        <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-1">Recruiter recommendation</p>
                                                        <p className="text-xs text-indigo-600 font-medium italic">Moving to shortlist will notify the employer for their approval.</p>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleStatusUpdate(app._id, 'shortlist')}
                                                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                                                        >
                                                            <HiOutlinePaperAirplane className="w-5 h-5" />
                                                            Send to Employer
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app._id, 'reject')}
                                                            className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Wait for Employer Approval */}
                                            {app.status === 'Recruiter Shortlisted' && (
                                                <div className="col-span-full bg-slate-50 p-10 rounded-[32px] text-center border border-slate-200 border-dashed">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                                                    </div>
                                                    <h4 className="font-black text-slate-900">Waiting for Employer Review</h4>
                                                    <p className="text-xs text-slate-500 mt-2 font-medium">Interview tools will unlock once the employer approves this candidate.</p>
                                                </div>
                                            )}

                                            {/* Step 4: Employer Approved -> Recruiter Schedules Interview */}
                                            {(app.status === 'Employer Shortlisted' || app.status === 'Selected Next Round') && (
                                                <div className="col-span-full bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                    <div>
                                                        <h4 className="font-black text-emerald-900 flex items-center gap-2">
                                                            <HiOutlineCheckCircle className="w-5 h-5" />
                                                            Ready for Interview
                                                        </h4>
                                                        <p className="text-xs text-emerald-700 font-medium">Employer approved. Coordinate the next interview round below.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsScheduling(app._id)}
                                                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 whitespace-nowrap"
                                                    >
                                                        <HiOutlineVideoCamera className="w-5 h-5" />
                                                        Schedule Interview Round
                                                    </button>
                                                </div>
                                            )}

                                            {/* Step 5: Post-Interview Decision (Selected or Rejected) */}
                                            {app.status === 'Interview Scheduled' && (
                                                <div className="col-span-full space-y-4">
                                                    {/* Interview Info Card */}
                                                    {app.interviewRounds?.length > 0 && (
                                                        <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
                                                            <div className="flex items-center justify-between mb-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                                                        <HiOutlineVideoCamera className="w-6 h-6" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Active Interview</p>
                                                                        <p className="text-xl font-black">Round {app.interviewRounds[app.interviewRounds.length - 1].roundNumber}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Scheduled At</p>
                                                                    <p className="text-sm font-black">{new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleString()}</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                                                    <p className="text-[10px] font-black uppercase mb-1 opacity-60">Code</p>
                                                                    <p className="font-black tracking-widest">{app.interviewRounds[app.interviewRounds.length - 1].meetCode}</p>
                                                                </div>
                                                                <a
                                                                    href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                                                    target="_blank"
                                                                    className="bg-white text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm hover:bg-indigo-50 transition-all"
                                                                >
                                                                    Join Interview
                                                                </a>
                                                            </div>

                                                            <div className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full w-fit mx-auto border border-white/5">
                                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Candidate Notified</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="bg-white border border-slate-200 rounded-[32px] p-8">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Post-Interview Decision</h4>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4">
                                                            <button
                                                                onClick={() => handleStatusUpdate(app._id, 'next-round')}
                                                                className="flex-1 bg-white text-emerald-600 border-2 border-emerald-100 hover:border-emerald-500 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <HiOutlineCheckCircle className="w-5 h-5" />
                                                                Selected for Next Round
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app._id, 'final-select')}
                                                                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                                            >
                                                                Final Selection (Hire)
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app._id, 'reject-after-interview')}
                                                                className="flex-1 bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <HiOutlineXCircle className="w-5 h-5" />
                                                                Reject Candidate
                                                            </button>
                                                            <button
                                                                onClick={() => setIsScheduling(app._id)}
                                                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <HiOutlineVideoCamera className="w-5 h-5" />
                                                                Reschedule / Next Round Interview
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}


                                            {/* Results: Final States */}
                                            {app.status === 'Final Selected' && (
                                                <div className="col-span-full bg-emerald-600 p-6 rounded-2xl text-white flex items-center gap-4">
                                                    <HiOutlineCheckCircle className="w-8 h-8" />
                                                    <div>
                                                        <p className="font-black text-lg">Hiring Process Complete</p>
                                                        <p className="text-xs font-bold text-emerald-100 uppercase">This candidate has been officially selected for the position.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {(app.status === 'Recruiter Rejected' || app.status === 'Employer Rejected' || app.status === 'Final Rejected') && (
                                                <div className="col-span-full bg-rose-50 p-8 rounded-[38px] border border-rose-100 text-center">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
                                                        <HiOutlineXCircle className="w-8 h-8 text-rose-500" />
                                                    </div>
                                                    <h4 className="font-black text-rose-900 text-lg uppercase tracking-tight">Application Terminated</h4>
                                                    <p className="text-xs text-rose-600 font-bold mt-2 max-w-xs mx-auto">
                                                        {app.status === 'Recruiter Rejected' && 'You decided not to move forward with this candidate.'}
                                                        {app.status === 'Employer Rejected' && 'The employer declined to move forward with this candidate.'}
                                                        {app.status === 'Final Rejected' && 'The candidate was rejected after the final evaluation.'}
                                                    </p>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Schedule Interview Modal */}
            {isScheduling && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleScheduleSubmit} className="p-8 sm:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Setup Interview</h2>
                                <button type="button" onClick={() => setIsScheduling(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <HiOutlineXCircle className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Interview Round No.</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none"
                                        value={interviewData.roundNumber}
                                        onChange={(e) => setInterviewData({ ...interviewData, roundNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Google Meet URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://meet.google.com/..."
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none"
                                        value={interviewData.meetLink}
                                        onChange={(e) => setInterviewData({ ...interviewData, meetLink: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meet Code</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="xyz-abc-def"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none"
                                            value={interviewData.meetCode}
                                            onChange={(e) => setInterviewData({ ...interviewData, meetCode: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none"
                                            value={interviewData.scheduledAt}
                                            onChange={(e) => setInterviewData({ ...interviewData, scheduledAt: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3">
                                <HiOutlineVideoCamera className="w-6 h-6" />
                                Confirm & Notify Candidate
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterApplicationsPage;
