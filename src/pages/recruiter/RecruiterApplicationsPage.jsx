import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Stack,
    IconButton,
    Avatar,
    Chip,
    alpha,
    useTheme,
    Tooltip,
    Skeleton,
    Divider,
    Button,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Pagination,
    InputAdornment,
    MenuItem
} from '@mui/material';
import {
    ArrowBack as ArrowLeftIcon,
    FileDownload as DownloadIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    VideoCameraFront as VideoCameraIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Person as PersonIcon,
    Send as SendIcon,
    CalendarMonth as CalendarIcon,
    Work as WorkIcon,
    Assignment as AssignmentIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Stars as SkillsIcon,
    History as ExperienceIcon
} from '@mui/icons-material';
import {
    getJobApplications,
    updateApplicationStatus,
    scheduleInterview
} from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    'Applied': { color: 'primary', label: 'Applied', icon: <AssignmentIcon fontSize="small" /> },
    'Under Review': { color: 'warning', label: 'Reviewing', icon: <AssignmentIcon fontSize="small" /> },
    'Recruiter Shortlisted': { color: 'info', label: 'Recruiter SL', icon: <CheckCircleIcon fontSize="small" /> },
    'Employer Shortlisted': { color: 'success', label: 'Employer Approved', icon: <CheckCircleIcon fontSize="small" /> },
    'Interview Scheduled': { color: 'secondary', label: 'Interviewing', icon: <VideoCameraIcon fontSize="small" /> },
    'Selected Next Round': { color: 'info', label: 'Next Round', icon: <CheckCircleIcon fontSize="small" /> },
    'Final Selected': { color: 'success', label: 'Hired', icon: <CheckCircleIcon fontSize="small" /> },
    'Final Rejected': { color: 'error', label: 'Rejected', icon: <CancelIcon fontSize="small" /> },
    'Recruiter Rejected': { color: 'error', label: 'Rejected', icon: <CancelIcon fontSize="small" /> },
    'Employer Rejected': { color: 'error', label: 'Rejected', icon: <CancelIcon fontSize="small" /> }
};

const RecruiterApplicationsPage = () => {
    const { jobId } = useParams();
    const theme = useTheme();
    const [applications, setApplications] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isScheduling, setIsScheduling] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination & Filter States
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const limit = 10;

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

    const processedApps = applications
        .filter(app => {
            const name = `${app.candidate?.firstName} ${app.candidate?.lastName}`.toLowerCase();
            const matchesSearch = name.includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

    const totalFiltered = processedApps.length;
    const paginatedApps = processedApps.slice((page - 1) * limit, page * limit);
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, totalFiltered);

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
        setIsSubmitting(true);
        try {
            await scheduleInterview(isScheduling, interviewData);
            toast.success('Interview scheduled successfully');
            setIsScheduling(null);
            fetchApplications();
        } catch (error) {
            toast.error('Failed to schedule interview');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <Container maxWidth="xl" sx={{ p: { xs: 0.5, sm: 1 }, pt: 0 }}>
            <Skeleton variant="text" width="300px" height={60} sx={{ mb: 4 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 6, mb: 4 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 6, mb: 4 }} />
        </Container>
    );

    return (
        <Container maxWidth="xl" sx={{ p: { xs: 0.5, sm: 1 }, pt: 0 }}>
            {/* Header Section */}
            <Box sx={{
                p: { xs: 1, sm: 1.5 },
                mb: 1,
                bgcolor: 'white',
                borderRadius: 2,
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton
                        component={Link}
                        to="/recruiter/manage-jobs"
                        size="small"
                        sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                        <ArrowLeftIcon fontSize="small" />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.01em', mb: 0.2 }}>
                            Applications
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>{jobDetails?.title || 'Job ID: ' + jobId}</Box>
                            </Typography>
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                                <LocationIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                    {jobDetails?.location || (jobDetails?.city ? `${jobDetails.city}, ${jobDetails.state}` : 'N/A')}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
                <Button
                    component={Link}
                    to={`/recruiter/job/${jobId}/pipeline`}
                    variant="contained"
                    startIcon={<CalendarIcon />}
                    sx={{ borderRadius: 2, fontWeight: 900, px: 3, py: 1, fontSize: '0.875rem' }}
                >
                    View Pipeline
                </Button>
            </Box>

            {/* Filters Section */}
            <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search candidate by name..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), fontWeight: 600 }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FilterIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 0.5 }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), fontWeight: 800, fontSize: '0.85rem' }
                            }}
                        >
                            <MenuItem value="all">All Applications</MenuItem>
                            <MenuItem value="Applied">Applied</MenuItem>
                            <MenuItem value="Under Review">Under Review</MenuItem>
                            <MenuItem value="Employer Shortlisted">Shortlisted</MenuItem>
                            <MenuItem value="Interview Scheduled">Interview Scheduled</MenuItem>
                            <MenuItem value="Final Selected">Selected</MenuItem>
                            <MenuItem value="Final Rejected">Rejected</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper >

            {/* Total Results Count */}
            {
                !loading && totalFiltered > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={700}>
                            Showing <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>{startIndex}–{endIndex}</Box> of {totalFiltered} applications
                        </Typography>
                    </Box>
                )
            }

            {/* List */}
            <Stack spacing={2}>
                {paginatedApps.length === 0 ? (
                    <Paper elevation={0} sx={{ py: 12, textAlign: 'center', borderRadius: 8, border: '1px dashed', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(theme.palette.divider, 0.5), color: 'text.disabled', mx: 'auto', mb: 3 }}>
                            <PersonIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight={900}>No applications found</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{searchQuery || statusFilter !== 'all' ? "Try adjusting your filters or search terms." : "Candidates who apply will appear here for your review."}</Typography>
                    </Paper>
                ) : (
                    paginatedApps.map((app) => (
                        <Card
                            key={app._id}
                            elevation={0}
                            sx={{
                                borderRadius: 6,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: 'primary.main', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}` }
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                                    {/* Candidate Info */}
                                    <Box sx={{ minWidth: 320 }}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Avatar
                                                src={app.candidate?.avatar?.startsWith('http') ? app.candidate.avatar : (app.candidate?.avatar ? `${BASE_URL}${app.candidate.avatar}` : undefined)}
                                                sx={{ width: 60, height: 60, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800, fontSize: '1.2rem' }}
                                            >
                                                {app.candidate?.firstName?.[0]}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" fontWeight={900} noWrap>{app.candidate?.firstName} {app.candidate?.lastName}</Typography>
                                                <Chip
                                                    label={STATUS_CONFIG[app.status]?.label || app.status}
                                                    size="small"
                                                    color={STATUS_CONFIG[app.status]?.color || 'default'}
                                                    sx={{ fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em', height: 22 }}
                                                />
                                            </Box>
                                        </Stack>

                                        <Stack spacing={1} sx={{ mb: 3, pl: 0.5 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <EmailIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                <Typography variant="body2" color="text.primary" fontWeight={700} sx={{ wordBreak: 'break-all' }}>
                                                    {app.candidate?.email || app.candidateProfile?.email || 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <PhoneIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                                <Typography variant="body2" color="text.primary" fontWeight={700}>
                                                    {app.candidate?.phone || app.candidateProfile?.phone || app.candidateProfile?.mobileNumber || 'N/A'}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            component="a"
                                            href={(app.resumeUrl || app.candidateProfile?.resumeUrl)?.startsWith('http') ? (app.resumeUrl || app.candidateProfile?.resumeUrl) : `${BASE_URL}${app.resumeUrl || app.candidateProfile?.resumeUrl}`}
                                            target="_blank"
                                            startIcon={<DownloadIcon />}
                                            sx={{
                                                borderRadius: 3,
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                py: 1.5,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'primary.dark' },
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                            }}
                                        >
                                            View Resume
                                        </Button>
                                    </Box>

                                    {/* Divider Line */}
                                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' } }} />
                                    <Divider sx={{ display: { xs: 'block', lg: 'none' } }} />

                                    {/* Actions */}
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            {/* Step 1: Screening */}
                                            {app.status === 'Applied' && (
                                                <Stack direction="row" spacing={2}>
                                                    <Button
                                                        variant="contained"
                                                        color="warning"
                                                        fullWidth
                                                        onClick={() => handleStatusUpdate(app._id, 'review')}
                                                        sx={{ borderRadius: 3, py: 2, fontWeight: 900 }}
                                                    >
                                                        Move to Review
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="inherit"
                                                        fullWidth
                                                        onClick={() => handleStatusUpdate(app._id, 'reject')}
                                                        sx={{ borderRadius: 3, py: 2, fontWeight: 900, bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'black' } }}
                                                    >
                                                        Reject Candidate
                                                    </Button>
                                                </Stack>
                                            )}

                                            {/* Step 2: Under Review */}
                                            {app.status === 'Under Review' && (
                                                <Box>
                                                    <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.1) }}>
                                                        <Typography variant="caption" fontWeight={900} color="info.main" display="block" sx={{ textTransform: 'uppercase', mb: 0.5 }}>Recruiter Shortlist</Typography>
                                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Send this candidate to the employer for approval to unlock interviewing.</Typography>
                                                    </Paper>
                                                    <Stack direction="row" spacing={2}>
                                                        <Button
                                                            variant="contained"
                                                            color="info"
                                                            fullWidth
                                                            startIcon={<SendIcon />}
                                                            onClick={() => handleStatusUpdate(app._id, 'shortlist')}
                                                            sx={{ borderRadius: 3, py: 2, fontWeight: 900 }}
                                                        >
                                                            Send to Employer
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleStatusUpdate(app._id, 'reject')}
                                                            sx={{ borderRadius: 3, py: 2, px: 4, fontWeight: 900 }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            )}

                                            {/* Step 3: Wait for Employer */}
                                            {app.status === 'Recruiter Shortlisted' && (
                                                <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', borderRadius: 6, border: '1px dashed', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.3) }}>
                                                    <CircularProgress size={32} sx={{ mb: 2 }} />
                                                    <Typography variant="h6" fontWeight={900}>Waiting for Employer Approval</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>The employer has been notified and needs to approve for the interview phase.</Typography>
                                                </Paper>
                                            )}

                                            {/* Step 4: Employer Approved -> Schedule */}
                                            {(app.status === 'Employer Shortlisted' || app.status === 'Selected Next Round') && (
                                                <Paper elevation={0} sx={{ p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.success.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1), display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={900} color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <CheckCircleIcon /> Employer Approved
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Ready for interview. Coordinate the schedule with the candidate.</Typography>
                                                    </Box>
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        startIcon={<VideoCameraIcon />}
                                                        onClick={() => setIsScheduling(app._id)}
                                                        sx={{ borderRadius: 3, py: 2, px: 4, fontWeight: 900, whiteSpace: 'nowrap' }}
                                                    >
                                                        Schedule Interview
                                                    </Button>
                                                </Paper>
                                            )}

                                            {/* Step 5: Decision after Interview */}
                                            {app.status === 'Interview Scheduled' && (
                                                <Stack spacing={4}>
                                                    {/* Interview Info */}
                                                    {app.interviewRounds?.length > 0 && (
                                                        <Paper elevation={0} sx={{ p: 4, borderRadius: 6, bgcolor: 'secondary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                                            <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                                                                <VideoCameraIcon sx={{ fontSize: 160 }} />
                                                            </Box>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3, position: 'relative' }}>
                                                                <Box>
                                                                    <Typography variant="caption" fontWeight={900} color="rgba(255,255,255,0.7)" sx={{ textTransform: 'uppercase' }}>Active Interview</Typography>
                                                                    <Typography variant="h5" fontWeight={900}>Round {app.interviewRounds[app.interviewRounds.length - 1].roundNumber}</Typography>
                                                                </Box>
                                                                <Box sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="caption" fontWeight={900} color="rgba(255,255,255,0.7)" sx={{ textTransform: 'uppercase' }}>Date & Time</Typography>
                                                                    <Typography variant="body1" fontWeight={900}>{new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleString()}</Typography>
                                                                </Box>
                                                            </Stack>
                                                            <Stack direction="row" spacing={2} sx={{ mb: 3, position: 'relative' }}>
                                                                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', flex: 1 }}>
                                                                    <Typography variant="caption" fontWeight={900} display="block" color="rgba(255,255,255,0.6)">CODE</Typography>
                                                                    <Typography variant="body1" fontWeight={900}>{app.interviewRounds[app.interviewRounds.length - 1].meetCode}</Typography>
                                                                </Paper>
                                                                <Button
                                                                    component="a"
                                                                    href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                                                    target="_blank"
                                                                    variant="contained"
                                                                    disableElevation
                                                                    sx={{ bgcolor: 'white', color: 'secondary.main', borderRadius: 3, fontWeight: 900, px: 4, '&:hover': { bgcolor: alpha('#fff', 0.9) } }}
                                                                >
                                                                    Join Meet
                                                                </Button>
                                                            </Stack>
                                                            <Chip
                                                                label="Candidate Notified"
                                                                size="small"
                                                                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}
                                                            />
                                                        </Paper>
                                                    )}

                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={900} sx={{ textTransform: 'uppercase', mb: 2, color: 'text.secondary', letterSpacing: '0.05em' }}>Post-Interview Decision</Typography>
                                                        <Grid container spacing={2}>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="success"
                                                                    fullWidth
                                                                    startIcon={<CheckCircleIcon />}
                                                                    onClick={() => handleStatusUpdate(app._id, 'next-round')}
                                                                    sx={{ borderRadius: 3, py: 2, fontWeight: 900 }}
                                                                >
                                                                    Next Round
                                                                </Button>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    fullWidth
                                                                    onClick={() => handleStatusUpdate(app._id, 'final-select')}
                                                                    sx={{ borderRadius: 3, py: 2, fontWeight: 900 }}
                                                                >
                                                                    Final Select (Hire)
                                                                </Button>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    fullWidth
                                                                    startIcon={<CancelIcon />}
                                                                    onClick={() => handleStatusUpdate(app._id, 'reject-after-interview')}
                                                                    sx={{ borderRadius: 3, py: 2, fontWeight: 900 }}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="inherit"
                                                                    fullWidth
                                                                    startIcon={<VideoCameraIcon />}
                                                                    onClick={() => setIsScheduling(app._id)}
                                                                    sx={{ borderRadius: 3, py: 2, fontWeight: 900, bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'black' } }}
                                                                >
                                                                    Reschedule
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </Stack>
                                            )}

                                            {/* Final Results */}
                                            {app.status === 'Final Selected' && (
                                                <Paper elevation={0} sx={{ p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.success.main, 0.1), border: '1px solid', borderColor: 'success.main', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <Avatar sx={{ bgcolor: 'success.main', color: 'white' }}>
                                                        <CheckCircleIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={900} color="success.dark">Process Complete</Typography>
                                                        <Typography variant="body2" fontWeight={700} color="success.main">Candidate has been officially Hired!</Typography>
                                                    </Box>
                                                </Paper>
                                            )}

                                            {(app.status === 'Recruiter Rejected' || app.status === 'Employer Rejected' || app.status === 'Final Rejected') && (
                                                <Paper elevation={0} sx={{ p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.error.main, 0.05), border: '1px dashed', borderColor: 'error.main', textAlign: 'center' }}>
                                                    <Typography variant="h6" fontWeight={900} color="error.main" sx={{ mb: 1, textTransform: 'uppercase' }}>Application Terminated</Typography>
                                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                        {app.status === 'Recruiter Rejected' && 'You declined this application.'}
                                                        {app.status === 'Employer Rejected' && 'The employer declined this candidate.'}
                                                        {app.status === 'Final Rejected' && 'Rejected after final evaluation.'}
                                                    </Typography>
                                                </Paper>
                                            )}
                                        </Box>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Stack >

            {/* Pagination Control */}
            {
                !loading && totalFiltered > limit && (
                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={Math.ceil(totalFiltered / limit)}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': { fontWeight: 800, borderRadius: 2 },
                                '& .Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', border: '1px solid' }
                            }}
                        />
                    </Box>
                )
            }

            {/* Schedule Interview Dialog */}
            <Dialog
                open={Boolean(isScheduling)}
                onClose={() => !isSubmitting && setIsScheduling(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
                    Schedule Interview
                    <IconButton onClick={() => setIsScheduling(null)} size="small" sx={{ position: 'absolute', top: 12, right: 12, color: 'text.disabled' }}>
                        <CancelIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleScheduleSubmit}>
                    <DialogContent sx={{ pt: 1 }}>
                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth size="small"
                                label="Round Number"
                                type="number"
                                required
                                value={interviewData.roundNumber}
                                onChange={(e) => setInterviewData({ ...interviewData, roundNumber: e.target.value })}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                fullWidth size="small"
                                label="Google Meet URL"
                                type="url"
                                required
                                placeholder="https://meet.google.com/..."
                                value={interviewData.meetLink}
                                onChange={(e) => setInterviewData({ ...interviewData, meetLink: e.target.value })}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth size="small"
                                    label="Meet Code"
                                    required
                                    placeholder="xyz-abc-def"
                                    value={interviewData.meetCode}
                                    onChange={(e) => setInterviewData({ ...interviewData, meetCode: e.target.value })}
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                                <TextField
                                    fullWidth size="small"
                                    label="Date & Time"
                                    type="datetime-local"
                                    required
                                    value={interviewData.scheduledAt}
                                    onChange={(e) => setInterviewData({ ...interviewData, scheduledAt: e.target.value })}
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Stack>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button
                            onClick={() => setIsScheduling(null)}
                            sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <VideoCameraIcon />}
                            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 3 }}
                        >
                            {isSubmitting ? 'Scheduling...' : 'Confirm & Notify'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container >
    );
};

export default RecruiterApplicationsPage;
