import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Stack,
    Button,
    Paper,
    Divider,
    alpha,
    useTheme,
    LinearProgress,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Work as WorkIcon,
    Description as DocumentIcon,
    CalendarMonth as CalendarIcon,
    CheckCircle as SuccessIcon,
    TrendingUp as StatsIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    CurrencyRupee as RupeeIcon,
    ArrowForward as ArrowIcon,
    NotificationsActive as ActivityIcon,
    StarRounded as StarIcon
} from '@mui/icons-material';
import { getPublicJobs } from '../../api/jobs.api';
import { getMyApplications } from '../../api/applications.api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
    const { user } = useAuth();
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [jobsRes, appsRes] = await Promise.all([
                    getPublicJobs({ limit: 4 }),
                    getMyApplications()
                ]);

                if (jobsRes.success) setRecommendedJobs(jobsRes.data.jobs || []);
                if (appsRes.success) setApplications(appsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Applications', value: applications.length, icon: DocumentIcon, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
        { label: 'Interviews', value: applications.filter(a => a.status === 'Interview Scheduled').length, icon: CalendarIcon, color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.1) },
        { label: 'Shortlisted', value: applications.filter(a => a.status.includes('Shortlisted')).length, icon: SuccessIcon, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
        { label: 'Active Jobs', value: recommendedJobs.length, icon: WorkIcon, color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Greeting */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 6,
                    mb: 5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Chip
                        label="Candidate Portal"
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            fontWeight: 800,
                            mb: 2,
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    />
                    <Typography variant="h3" fontWeight={900} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                        Welcome back, {user?.firstName || 'Candidate'}! 👋
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500, maxWidth: '600px' }}>
                        You have <Box component="span" sx={{ fontWeight: 800, textDecoration: 'underline' }}>{stats[1].value}</Box> upcoming interviews and <Box component="span" sx={{ fontWeight: 800, textDecoration: 'underline' }}>{stats[0].value}</Box> active applications.
                    </Typography>
                </Box>
                {/* Decorative Circles */}
                <Box sx={{
                    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -100, left: '20%', width: 300, height: 300,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.03)'
                }} />
            </Paper>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                {stats.map((stat) => (
                    <Grid item xs={6} sm={3} key={stat.label}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 5,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: 3, bgcolor: stat.bg, color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2
                                }}>
                                    <stat.icon />
                                </Box>
                                <Typography variant="h4" fontWeight={900} color="text.primary">{stat.value}</Typography>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {stat.label}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Job Recommendations */}
                <Grid item xs={12} lg={8}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight={800}>Recommended Jobs</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button component={Link} to="/jobs" endIcon={<ArrowIcon />} sx={{ fontWeight: 700 }}>
                            View All
                        </Button>
                    </Box>
                    <Stack spacing={2}>
                        {loading ? (
                            [1, 2, 3].map(i => <SkeletonCard key={i} />)
                        ) : recommendedJobs.length === 0 ? (
                            <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 5, border: '2px dashed', borderColor: 'divider' }}>
                                <Typography color="text.secondary">No job recommendations yet</Typography>
                            </Paper>
                        ) : (
                            recommendedJobs.map((job) => (
                                <Card
                                    key={job._id}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02), borderColor: theme.palette.primary.light }
                                    }}
                                >
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Avatar
                                            variant="rounded"
                                            sx={{ width: 64, height: 64, bgcolor: 'grey.100', color: 'primary.main', fontWeight: 900 }}
                                        >
                                            {job.companyId?.companyName?.[0]}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={800}>{job.title}</Typography>
                                            <Stack direction="row" spacing={2} color="text.secondary">
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <BusinessIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">{job.companyId?.companyName}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <LocationIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">{job.city}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <RupeeIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">{(job.salaryMin / 100000).toFixed(1)}L - {(job.salaryMax / 100000).toFixed(1)}L</Typography>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            component={Link}
                                            to={`/jobs/${job._id}`}
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                        >
                                            Apply
                                        </Button>
                                    </Stack>
                                </Card>
                            ))
                        )}
                    </Stack>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} lg={4}>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Recent Activity</Typography>
                    <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={4}>
                            {applications.slice(0, 4).map((app, i) => (
                                <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                                    <Box sx={{ mt: 1 }}>
                                        <ActivityIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                            Applied to {app.job?.title} at {app.job?.companyId?.companyName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ))}
                            {applications.length === 0 && (
                                <Typography variant="caption" color="text.secondary" textAlign="center">No recent activity</Typography>
                            )}
                            <Button
                                fullWidth
                                component={Link}
                                to="/candidate/applications"
                                sx={{ bgcolor: 'grey.50', color: 'text.secondary', fontWeight: 800, py: 1.5, borderRadius: 3, textTransform: 'none' }}
                            >
                                View My Journey
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const SkeletonCard = () => (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
        <LinearProgress sx={{ borderRadius: 1 }} />
    </Box>
);

export default CandidateDashboard;
