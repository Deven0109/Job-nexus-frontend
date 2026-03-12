
import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Button,
    CircularProgress,
    Stack,
    Paper,
    Pagination,
    Tooltip
} from '@mui/material';
import {
    HiOutlineLocationMarker,
    HiOutlineCurrencyRupee,
    HiOutlineOfficeBuilding,
    HiOutlineVideoCamera,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock
} from 'react-icons/hi';
import { getMyApplications } from '../../api/applications.api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CURRENCY_SYMBOLS = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    CAD: 'C$',
    AUD: 'A$',
    SGD: 'S$',
    SAR: 'SR ',
    QAR: 'QR '
};

const STATUS_CONFIG = {
    'Applied': { label: 'Applied', color: '#1A73E8', bg: '#E8F0FE' },
    'Under Review': { label: 'In Review', color: '#F9AB00', bg: '#FEF7E0' },
    'Recruiter Shortlisted': { label: 'Shortlisted', color: '#1A73E8', bg: '#E8F0FE' },
    'Recruiter Rejected': { label: 'Rejected', color: '#D93025', bg: '#FCE8E6' },
    'Employer Shortlisted': { label: 'Reviewing', color: '#1A73E8', bg: '#E8F0FE' },
    'Employer Rejected': { label: 'Rejected', color: '#D93025', bg: '#FCE8E6' },
    'Interview Scheduled': { label: 'Interviewing', color: '#9333EA', bg: '#F3E8FF' },
    'Interview Completed': { label: 'Interviewed', color: '#5F6368', bg: '#F1F3F4' },
    'Selected Next Round': { label: 'Next Round', color: '#12B5CB', bg: '#E0F7FA' },
    'Final Selected': { label: 'Selected', color: '#1E8E3E', bg: '#E6F4EA' },
    'Final Rejected': { label: 'Rejected', color: '#D93025', bg: '#FCE8E6' }
};

const WORKFLOW_STEPS = [
    { label: 'Applied' },
    { label: 'Review' },
    { label: 'Shortlist' },
    { label: 'Interview' },
    { label: 'Selected' }
];

const getStepStatus = (status, index) => {
    const statusMap = {
        'Applied': 0,
        'Under Review': 1,
        'Recruiter Shortlisted': 2,
        'Employer Shortlisted': 2,
        'Interview Scheduled': 3,
        'Interview Completed': 3,
        'Selected Next Round': 3,
        'Final Selected': 4
    };

    const currentStep = statusMap[status] ?? 0;
    const isRejected = status.includes('Rejected');

    if (index < currentStep) return 'completed';
    if (index === currentStep) return isRejected ? 'rejected' : 'active';
    return 'pending';
};

const getStatusMessage = (status) => {
    const messages = {
        'Applied': 'Your application has been successfully received by our hiring team.',
        'Under Review': 'The recruitment team is currently screening your skills and experience.',
        'Recruiter Shortlisted': 'Congratulations! You have been shortlisted for the next interview round.',
        'Employer Shortlisted': 'Congratulations! You have been shortlisted for the next interview round.',
        'Interview Scheduled': 'Your interview has been scheduled; please check the date and join link below.',
        'Interview Completed': 'Your interview is over; our team is now evaluating your results.',
        'Selected Next Round': 'Success! You have advanced to the next stage of screening.',
        'Final Selected': 'Please check your registered email for the official offer letter.',
        'Recruiter Rejected': 'The hiring team has decided not to move forward this time.',
        'Employer Rejected': 'The hiring team has decided not to move forward this time.',
        'Final Rejected': 'The hiring team has decided not to move forward this time.'
    };
    return messages[status] || 'The hiring process for this position is currently in progress.';
};

const AppliedJobsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;

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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <CircularProgress size={24} thickness={6} sx={{ color: '#000' }} />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#000', mb: 0.5, letterSpacing: '-0.02em' }}>
                    MY APPLICATIONS
                </Typography>
                <Typography variant="body2" sx={{ color: '#5F6368', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Track your journey with <span style={{ color: '#000' }}>{applications.length} active roles</span>
                </Typography>
            </Box>

            {applications.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 0, border: '1px solid #DADCE0', bgcolor: '#F8F9FA' }}>
                    <HiOutlineOfficeBuilding size={48} color="#9AA0A6" />
                    <Typography variant="h6" fontWeight={800} sx={{ mt: 2, mb: 1 }}>No applications found</Typography>
                    <Button component={Link} to="/jobs" size="large" variant="contained" sx={{ bgcolor: '#1A73E8', color: '#fff', px: 5, py: 1.5, borderRadius: 0, fontWeight: 900, textTransform: 'none' }}>
                        Browse Open Jobs
                    </Button>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {applications.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((app) => (
                        <Box key={app._id} sx={{
                            bgcolor: '#FFF',
                            border: '1px solid #E0E4E8',
                            borderRadius: '8px',
                            p: 3,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                                borderColor: '#1A73E8'
                            }
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', md: 'row' }, 
                                alignItems: 'center', 
                                gap: 3,
                                width: '100%'
                            }}>
                                {/* Section 1: Role Info */}
                                <Box sx={{ width: { xs: '100%', md: '220px' }, flexShrink: 0 }}>
                                    <Stack spacing={1}>
                                        <div style={{
                                            display: 'inline-flex',
                                            padding: '4px 10px',
                                            fontSize: '11px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            backgroundColor: STATUS_CONFIG[app.status]?.bg || '#F1F3F4',
                                            color: STATUS_CONFIG[app.status]?.color || '#5F6368',
                                            width: 'fit-content',
                                            borderRadius: '4px'
                                        }}>
                                            {STATUS_CONFIG[app.status]?.label || app.status}
                                        </div>
                                        <Typography variant="h6" fontWeight={1000} sx={{ color: '#202124', lineHeight: 1.2, fontSize: '1.25rem' }}>
                                            {app.job?.title}
                                        </Typography>
                                        <Typography variant="body1" fontWeight={800} sx={{ color: '#5F6368', fontSize: '15px' }}>
                                            {app.job?.companyId?.companyName}
                                        </Typography>
                                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                            <Tooltip title={app.job?.location} arrow placement="bottom-start">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#70757A', maxWidth: '180px', cursor: 'pointer' }}>
                                                    <HiOutlineLocationMarker size={16} style={{ flexShrink: 0 }} />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {app.job?.location}
                                                    </span>
                                                </div>
                                            </Tooltip>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#70757A', minWidth: 'fit-content' }}>
                                                <span style={{ fontSize: '16px' }}>{CURRENCY_SYMBOLS[app.job?.currency] || '₹'}</span>
                                                <span>
                                                    {app.job?.currency === 'INR' || !app.job?.currency
                                                        ? `${(app.job?.salaryMin / 100000).toFixed(1)}L - ${(app.job?.salaryMax / 100000).toFixed(1)}L`
                                                        : `${app.job?.salaryMin?.toLocaleString()} - ${app.job?.salaryMax?.toLocaleString()}`
                                                    }
                                                </span>
                                            </div>
                                        </Stack>
                                    </Stack>
                                </Box>

                                {/* Section 2: Hiring Pipeline (5 Steps) */}
                                <Box sx={{ flex: 1, maxWidth: '350px' }}>
                                    <Box sx={{ position: 'relative', py: 1, px: 2 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                            {WORKFLOW_STEPS.map((step, idx) => {
                                                const stepStatus = getStepStatus(app.status, idx);
                                                return (
                                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '65px' }}>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: stepStatus === 'completed' ? '#1E8E3E' : (stepStatus === 'active' && app.status === 'Final Selected') ? '#1E8E3E' : stepStatus === 'active' ? '#1A73E8' : stepStatus === 'rejected' ? '#D93025' : '#FFF',
                                                            color: stepStatus === 'pending' ? '#DADCE0' : '#FFF',
                                                            border: stepStatus === 'pending' ? '2px solid #DADCE0' : 'none',
                                                            boxShadow: stepStatus === 'active' ? '0 0 0 4px #E8F0FE' : 'none',
                                                            zIndex: 2,
                                                            marginBottom: '8px'
                                                        }}>
                                                            {(stepStatus === 'completed' || (stepStatus === 'active' && app.status === 'Final Selected')) ? <HiOutlineCheckCircle size={18} /> :
                                                                stepStatus === 'rejected' ? <HiOutlineXCircle size={18} /> :
                                                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>{idx + 1}</span>}
                                                        </div>
                                                        <Typography variant="caption" sx={{
                                                            fontWeight: 900,
                                                            textTransform: 'uppercase',
                                                            fontSize: '9px',
                                                            color: stepStatus === 'pending' ? '#70757A' : '#202124',
                                                            letterSpacing: '0.02em',
                                                            textAlign: 'center',
                                                            lineHeight: 1.1
                                                        }}>
                                                            {step.label}
                                                        </Typography>
                                                    </div>
                                                );
                                            })}
                                            {/* Line */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '14px',
                                                left: '10%',
                                                right: '10%',
                                                height: '2px',
                                                backgroundColor: '#DADCE0',
                                                zIndex: 0
                                            }} />
                                        </div>
                                    </Box>
                                </Box>

                                {/* Section 3: Status & Action */}
                                <Box sx={{ flex: 2, minWidth: 0 }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: '8px',
                                        bgcolor: '#F8F9FA',
                                        border: '1px solid #E0E4E8',
                                        height: '90px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxSizing: 'border-box',
                                        width: '100%',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                                            {app.status === 'Interview Scheduled' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9333EA', minWidth: 0 }}>
                                                    <HiOutlineVideoCamera size={20} style={{ flexShrink: 0 }} />
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                                                        <span style={{ fontSize: '11px', fontWeight: 1000, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Interview</span>
                                                        <span style={{ color: '#9333EA', opacity: 0.5 }}>|</span>
                                                        <Tooltip title={`Round ${app.interviewRounds.length} Interview: ${new Date(app.interviewRounds?.[app.interviewRounds.length - 1]?.scheduledAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`} arrow placement="top">
                                                            <Typography variant="body2" fontWeight={800} sx={{ color: '#202124', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'help' }}>
                                                                R{app.interviewRounds.length} • {new Date(app.interviewRounds?.[app.interviewRounds.length - 1]?.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                            </Typography>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                    <div style={{ flexShrink: 0, color: app.status.includes('Rejected') ? '#D93025' : '#1E8E3E' }}>
                                                        {app.status.includes('Rejected') ? <HiOutlineXCircle size={20} /> :
                                                         app.status === 'Final Selected' ? <HiOutlineCheckCircle size={20} /> :
                                                         <HiOutlineClock size={20} color="#5F6368" />}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: 1000,
                                                            textTransform: 'uppercase',
                                                            whiteSpace: 'nowrap',
                                                            color: app.status.includes('Rejected') ? '#D93025' : app.status === 'Final Selected' ? '#1E8E3E' : '#202124'
                                                        }}>
                                                            {STATUS_CONFIG[app.status]?.label || 'Applied'}
                                                        </span>
                                                        <span style={{ color: '#DADCE0' }}>|</span>
                                                        <Tooltip title={getStatusMessage(app.status)} arrow placement="top">
                                                            <Typography variant="caption" fontWeight={800} sx={{ color: '#5F6368', fontSize: '10.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'help' }}>
                                                                {getStatusMessage(app.status)}
                                                            </Typography>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            )}
                                        </Box>

                                        <Stack direction="row" spacing={1.5} sx={{ ml: 3 }}>
                                            {app.status === 'Interview Scheduled' && (
                                                <Button
                                                    href={app.interviewRounds?.[app.interviewRounds.length - 1]?.meetLink}
                                                    target="_blank"
                                                    variant="contained"
                                                    size="medium"
                                                    sx={{ bgcolor: '#1A73E8', borderRadius: '6px', fontWeight: 1000, textTransform: 'none', fontSize: '13px', px: 4, py: 1 }}
                                                >
                                                    Join Meet
                                                </Button>
                                            )}
                                            <Button
                                                component={Link}
                                                to={`/jobs/${app.job?._id}`}
                                                variant="outlined"
                                                size="medium"
                                                sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 900, fontSize: '13px', color: '#202124', borderColor: '#DADCE0', px: 3, py: 1, '&:hover': { bgcolor: '#FFF', borderColor: '#202124' } }}
                                            >
                                                Details
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            )}

            {applications.length > itemsPerPage && (
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={Math.ceil(applications.length / itemsPerPage)}
                        page={page}
                        onChange={(e, v) => {
                            setPage(v);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontWeight: 800,
                                borderRadius: '4px',
                                border: '1px solid #E0E4E8',
                                '&.Mui-selected': {
                                    bgcolor: '#000',
                                    color: '#FFF',
                                    borderColor: '#000',
                                    '&:hover': { bgcolor: '#222' }
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Container>
    );
};

export default AppliedJobsPage;
