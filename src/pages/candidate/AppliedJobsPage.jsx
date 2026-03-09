import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    Grid,
    Chip,
    Button,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Stack,
    Paper,
    Divider,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    CurrencyRupee as RupeeIcon,
    Visibility as ViewIcon,
    CheckCircle as SuccessIcon,
    Cancel as ErrorIcon,
    VideoCall as VideoIcon,
    Business as BusinessIcon,
    AccessTime as TimeIcon,
    EventAvailable as DateIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';
import { getMyApplications } from '../../api/applications.api';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundColor: theme.palette.success.main,
        },
    },
    [`&.${stepConnectorClasses.disabled}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundColor: '#e0e0e0',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 4,
        border: 0,
        backgroundColor: '#e0e0e0',
        borderRadius: 1,
        transition: 'background-color 0.3s'
    },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: '#fff',
    zIndex: 1,
    color: '#ccc',
    width: 32,
    height: 32,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px solid #ccc',
    fontWeight: 800,
    fontSize: '0.8rem',
    ...(ownerState.active && {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    }),
    ...(ownerState.completed && {
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.main,
        color: '#fff',
    }),
    ...(ownerState.error && {
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        color: '#fff',
    }),
}));

function ColorlibStepIcon(props) {
    const { active, completed, error, icon } = props;

    return (
        <ColorlibStepIconRoot ownerState={{ active, completed, error }}>
            {error ? <CloseIcon sx={{ fontSize: 18 }} /> : (completed ? <SuccessIcon sx={{ fontSize: 18 }} /> : icon)}
        </ColorlibStepIconRoot>
    );
}
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const STATUS_CHIP_MAPPING = {
    'Applied': { label: 'Applied', color: 'info' },
    'Under Review': { label: 'Under Review', color: 'warning' },
    'Recruiter Shortlisted': { label: 'Reviewing', color: 'info' },
    'Recruiter Rejected': { label: 'Rejected', color: 'error' },
    'Employer Shortlisted': { label: 'Shortlisted', color: 'success' },
    'Employer Rejected': { label: 'Rejected', color: 'error' },
    'Interview Scheduled': { label: 'Interview Scheduled', color: 'secondary' },
    'Interview Completed': { label: 'Interview Completed', color: 'default' },
    'Selected Next Round': { label: 'Next Round', color: 'info' },
    'Final Selected': { label: 'Selected', color: 'success' },
    'Final Rejected': { label: 'Rejected', color: 'error' }
};

const STEPS = ['Applied', 'Review', 'Interview', 'Selected'];

const getActiveStep = (status) => {
    switch (status) {
        case 'Applied': return 0;
        case 'Under Review':
        case 'Recruiter Shortlisted':
        case 'Employer Shortlisted': return 1;
        case 'Interview Scheduled':
        case 'Interview Completed':
        case 'Selected Next Round': return 2;
        case 'Final Selected': return 3;
        default: return 0;
    }
};

const isRejectedStatus = (status) => {
    return status.includes('Rejected');
};

const formatCTC = (min, max) => {
    if (!min) return 'Not Disclosed';
    const formatLakh = (val) => (val / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    return `${formatLakh(min)} - ${formatLakh(max)}`;
};

const AppliedJobsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
            <CircularProgress color="primary" />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header Section */}
            <Box sx={{ mb: 5, textAlign: 'left', position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: -40,
                        left: -20,
                        width: 120,
                        height: 120,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderRadius: '50%',
                        zIndex: -1
                    }}
                />
                <Typography
                    variant="h3"
                    fontWeight={950}
                    color="text.primary"
                    sx={{
                        letterSpacing: '-0.04em',
                        mb: 1.5,
                        textTransform: 'tight',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    Application <span style={{ color: theme.palette.primary.main }}>Pipeline</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', fontWeight: 500, opacity: 0.8 }}>
                    You have <span style={{ fontWeight: 800, color: theme.palette.text.primary }}>{applications.length} active applications</span> in your pipeline.
                </Typography>
            </Box>

            {applications.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 10,
                        textAlign: 'center',
                        borderRadius: 6,
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Box sx={{ width: 80, height: 80, bgcolor: 'primary.50', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                        <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom>Ready to find your dream job?</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 450 }}>
                        Your application list is empty. Start exploring thousands of opportunities tailored just for you.
                    </Typography>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/jobs"
                        size="large"
                        sx={{
                            borderRadius: 3,
                            px: 5,
                            py: 1.8,
                            fontWeight: 800,
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 10px 25px -5px ' + alpha(theme.palette.primary.main, 0.4)
                        }}
                    >
                        Browse All Jobs
                    </Button>
                </Paper>
            ) : (
                <Stack spacing={3.5}>
                    {applications.map((app) => (
                        <Card
                            key={app._id}
                            elevation={0}
                            sx={{
                                borderRadius: 6,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.8),
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: '0 20px 40px -12px ' + alpha(theme.palette.primary.main, 0.1),
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <Box sx={{ p: 4 }}>
                                <Grid container spacing={4} alignItems="center">
                                    {/* Column 1: Job Branding & Details */}
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={2.5}>
                                            <Box>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                    <Chip
                                                        label={STATUS_CHIP_MAPPING[app.status]?.label || app.status}
                                                        color={STATUS_CHIP_MAPPING[app.status]?.color || 'default'}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 900,
                                                            fontSize: '0.65rem',
                                                            textTransform: 'uppercase',
                                                            borderRadius: '6px',
                                                            px: 0.5,
                                                            height: 22
                                                        }}
                                                    />
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                        Applied {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </Typography>
                                                </Stack>

                                                <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 0.5, color: 'text.primary', lineHeight: 1.2 }}>
                                                    {app.job?.title}
                                                </Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {app.job?.companyId?.companyName}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 3, border: '1px solid #f0f0f0' }}>
                                                    <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                                        Location
                                                    </Typography>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <LocationIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                                        <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {app.job?.city}, {app.job?.state || 'India'}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 3, border: '1px solid #f0f0f0' }}>
                                                    <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                                        CTC Range
                                                    </Typography>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <RupeeIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                                        <Typography variant="caption" fontWeight={800} color="text.primary">
                                                            {formatCTC(app.job?.salaryMin, app.job?.salaryMax)}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Grid>

                                    {/* Column 2: Live Progress Tracker */}
                                    <Grid item xs={12} md={4.5}>
                                        <Box sx={{ px: { md: 2 } }}>
                                            <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ display: 'block', mb: 3, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center' }}>
                                                Hiring Workflow
                                            </Typography>
                                            <Stepper
                                                activeStep={getActiveStep(app.status)}
                                                alternativeLabel
                                                connector={<ColorlibConnector />}
                                                sx={{
                                                    '& .MuiStepLabel-label': {
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase',
                                                        mt: 1.5,
                                                        color: 'text.disabled'
                                                    },
                                                    '& .MuiStepLabel-active .MuiStepLabel-label': { color: 'primary.main' },
                                                    '& .MuiStepLabel-completed .MuiStepLabel-label': { color: 'success.main' }
                                                }}
                                            >
                                                {STEPS.map((label, index) => {
                                                    const currentActive = getActiveStep(app.status);
                                                    const isRejected = isRejectedStatus(app.status) && currentActive === index;
                                                    const isCompleted = currentActive > index;
                                                    const isActive = currentActive === index && !isRejected;

                                                    return (
                                                        <Step key={label} completed={isCompleted}>
                                                            <StepLabel
                                                                error={isRejected}
                                                                StepIconComponent={(props) => (
                                                                    <ColorlibStepIcon {...props} error={isRejected} icon={index + 1} />
                                                                )}
                                                            >
                                                                {label}
                                                            </StepLabel>
                                                        </Step>
                                                    );
                                                })}
                                            </Stepper>
                                        </Box>
                                    </Grid>

                                    {/* Column 3: Contextual Actions */}
                                    <Grid item xs={12} md={3.5}>
                                        <Stack spacing={1.5} sx={{ alignItems: 'stretch' }}>
                                            {app.status === 'Interview Scheduled' && app.interviewRounds?.length > 0 ? (
                                                <Box sx={{ width: '100%' }}>
                                                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), border: '1px solid', borderColor: 'secondary.light', borderRadius: 4 }}>
                                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                                                            <Avatar sx={{ bgcolor: 'secondary.main', width: 30, height: 30 }}>
                                                                <VideoIcon sx={{ fontSize: 16 }} />
                                                            </Avatar>
                                                            <Typography variant="caption" fontWeight={800} color="secondary.main" sx={{ textTransform: 'uppercase' }}>Interview Scheduled</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
                                                            {new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </Typography>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            color="secondary"
                                                            href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                                            target="_blank"
                                                            sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: 'none', py: 1 }}
                                                        >
                                                            Join Interview
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box sx={{ width: '100%' }}>
                                                    {isRejectedStatus(app.status) ? (
                                                        <Box lg={{ width: '100%' }} sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.04), borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.1), minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <Typography variant="subtitle2" fontWeight={900} color="error.main" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>Application Rejected</Typography>
                                                            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.3 }}>
                                                                We regret to inform you that your application was not selected.
                                                            </Typography>
                                                        </Box>
                                                    ) : app.status === 'Final Selected' ? (
                                                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.04), borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1), minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <Typography variant="subtitle2" fontWeight={800} color="success.main" sx={{ display: 'block' }}>Congratulations!</Typography>
                                                            <Typography variant="caption" fontWeight={700} color="text.primary">Offer documents sent to email.</Typography>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 5, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                                                            <Typography variant="caption" fontWeight={950} color="primary.main" sx={{ display: 'block', textTransform: 'uppercase', mb: 1, letterSpacing: 1 }}>Current Status</Typography>
                                                            <Typography variant="body2" fontWeight={800} color="text.primary">Awaiting screening results</Typography>
                                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mt: 0.5 }}>The hiring team is reviewing your profile</Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Stack>
                                        <Box sx={{ mt: 1.5 }}>
                                            <Button
                                                component={Link}
                                                to={`/jobs/${app.job?._id}`}
                                                variant="outlined"
                                                fullWidth
                                                sx={{
                                                    borderRadius: 2.5,
                                                    fontWeight: 800,
                                                    textTransform: 'none',
                                                    py: 1,
                                                    borderColor: 'divider',
                                                    color: 'text.primary',
                                                    '&:hover': {
                                                        bgcolor: 'grey.50',
                                                        borderColor: 'text.primary'
                                                    }
                                                }}
                                            >
                                                Full Job Details
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Bottom texture removed */}
                        </Card>
                    ))}
                </Stack>
            )}

            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 2 }}>
                    Your Privacy Matters. Your data is secured with industry standards.
                </Typography>
            </Box>
        </Container>
    );
};

export default AppliedJobsPage;
