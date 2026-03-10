import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Paper,
    Grid,
    Stack,
    Avatar,
    Skeleton,
    alpha,
    ButtonGroup,
    Button
} from '@mui/material';
import {
    Work as WorkIcon,
    PlayCircleOutline as ActiveIcon,
    Description as ApplicationIcon,
    StarRounded as ShortlistIcon,
    AccessTime as TimeIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '../../api/recruiter.api';
import toast from 'react-hot-toast';

// ─── Chart Tooltip ───────────────────────────────
const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: '#1E293B',
                borderRadius: 2,
                px: 1.5,
                py: 1,
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            }}>
                <Typography sx={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, mb: 0.3 }}>
                    {label}
                </Typography>
                {payload.map((entry, i) => (
                    <Stack key={i} direction="row" spacing={0.8} alignItems="center">
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: entry.color }} />
                        <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>
                            {entry.name}: <b>{entry.value}</b>
                        </Typography>
                    </Stack>
                ))}
            </Box>
        );
    }
    return null;
};

// ─── Time Ago Helper ─────────────────────────────
const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
};

// ─── Chart Data Builder (Week / Month / Year) ────
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getWeekLabel(date) {
    const d = new Date(date);
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const weekStart = day - d.getDay();
    const startDay = Math.max(1, weekStart);
    return `${month} ${startDay}-${startDay + 6}`;
}

function getMonthLabel(date) {
    const d = new Date(date);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function getYearLabel(date) {
    return `${new Date(date).getFullYear()}`;
}

function buildChartData(jobDates, applicationDates, period) {
    const map = {};
    let labelFn, slots;
    const now = new Date();

    if (period === 'week') {
        labelFn = getWeekLabel;
        slots = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i * 7);
            slots.push(getWeekLabel(d));
        }
    } else if (period === 'month') {
        labelFn = getMonthLabel;
        slots = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            slots.push(getMonthLabel(d));
        }
    } else {
        labelFn = getYearLabel;
        slots = [];
        for (let i = 3; i >= 0; i--) {
            slots.push(`${now.getFullYear() - i}`);
        }
    }

    slots.forEach(s => {
        map[s] = { name: s, Jobs: 0, Applications: 0 };
    });

    (jobDates || []).forEach(dt => {
        const key = labelFn(dt);
        if (map[key]) map[key].Jobs += 1;
    });

    (applicationDates || []).forEach(dt => {
        const key = labelFn(dt);
        if (map[key]) map[key].Applications += 1;
    });

    return Object.values(map);
}

// ─── Component ───────────────────────────────────
const RecruiterDashboardMain = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('month');
    const [chartType, setChartType] = useState('both');
    const [activityQueue, setActivityQueue] = useState([]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await getDashboardStats();
            if (res.success) {
                setStats(res.data.stats);
                setActivityQueue(res.data.stats.recentActivity || []);
            }
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleActivityClick = (activity) => {
        // Remove clicked activity from queue
        setActivityQueue(prev => prev.filter(a => a.id !== activity.id));
        // Navigate
        navigate(`/recruiter/job/${activity.jobId}/applications`);
    };

    useEffect(() => { fetchDashboard(); }, []);

    const chartData = useMemo(() => {
        if (!stats) return [];
        return buildChartData(stats.jobDates, stats.applicationDates, chartPeriod);
    }, [stats, chartPeriod]);

    const summaryCards = [
        { label: 'Total Jobs', value: stats?.totalJobs ?? 0, icon: WorkIcon, color: '#6366F1', bg: '#EEF2FF' },
        { label: 'Total Active Jobs', value: stats?.activeJobs ?? 0, icon: ActiveIcon, color: '#22C55E', bg: '#F0FDF4' },
        { label: 'Total Applications', value: stats?.totalApplications ?? 0, icon: ApplicationIcon, color: '#3B82F6', bg: '#EFF6FF' },
        { label: 'Shortlisted Students', value: stats?.shortlistedCount ?? 0, icon: ShortlistIcon, color: '#F59E0B', bg: '#FFFBEB' }
    ];

    const periodButtons = ['Week', 'Month', 'Year'];

    return (
        <Box sx={{ px: { xs: 0.5, sm: 1 }, py: 0 }}>
            {/* ─── Header ─── */}
            <Box sx={{
                py: 1.5,
                mb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ fontSize: '1.15rem' }}>
                    Dashboard Overview
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Welcome back! Here's your recruitment snapshot.
                </Typography>
            </Box>

            {/* ─── Summary Cards ─── */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                {summaryCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={idx}>
                            {loading ? (
                                <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2.5, height: 90 }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
                                        <Box>
                                            <Skeleton variant="text" width={40} height={32} />
                                            <Skeleton variant="text" width={100} height={14} />
                                        </Box>
                                    </Stack>
                                </Paper>
                            ) : (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        p: 2.5,
                                        height: 90,
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: alpha('#6366F1', 0.3),
                                            boxShadow: `0 4px 20px ${alpha('#6366F1', 0.08)}`
                                        },
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '40%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, transparent 0%, rgba(99,102,241,0.04) 100%)',
                                            borderRadius: '0 16px 16px 0',
                                            pointerEvents: 'none'
                                        }
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                bgcolor: '#6366F1',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Icon sx={{ fontSize: 24, color: '#fff' }} />
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight={900} sx={{ color: 'text.primary', fontSize: '1.5rem', lineHeight: 1 }}>
                                                {card.value}
                                            </Typography>
                                            <Typography sx={{
                                                color: '#64748B',
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                mt: 0.3
                                            }}>
                                                {card.label}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            )}
                        </Grid>
                    );
                })}
            </Grid>

            {/* ─── Activity Overview (Full Width) ─── */}
            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                p: 2,
                mb: 1.5
            }}>
                {/* Header Row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                        <Typography fontWeight={800} color="text.primary" sx={{ fontSize: '1.1rem' }}>
                            Activity Overview
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem', fontWeight: 500 }}>
                            Track updates across statistics for jobs and applications
                        </Typography>
                    </Box>

                    {/* Right side: Period + Filter toggles stacked */}
                    <Stack spacing={1} alignItems="flex-end">
                        {/* Period Toggle (Week / Month / Year) */}
                        <ButtonGroup size="small" sx={{
                            bgcolor: '#F1F5F9',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: 'none',
                            '& .MuiButtonGroup-grouped': { border: 'none !important', minWidth: 64 }
                        }}>
                            {periodButtons.map(p => (
                                <Button
                                    key={p}
                                    onClick={() => setChartPeriod(p.toLowerCase())}
                                    sx={{
                                        px: 2.5,
                                        py: 0.7,
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        textTransform: 'none',
                                        borderRadius: '8px !important',
                                        color: chartPeriod === p.toLowerCase() ? '#fff' : '#64748B',
                                        bgcolor: chartPeriod === p.toLowerCase() ? '#1E293B' : 'transparent',
                                        '&:hover': {
                                            bgcolor: chartPeriod === p.toLowerCase() ? '#334155' : alpha('#64748B', 0.08),
                                        }
                                    }}
                                >
                                    {p}
                                </Button>
                            ))}
                        </ButtonGroup>

                        {/* Chart Type Filter (All / Jobs / Applications) */}
                        <Stack direction="row" spacing={1}>
                            {[
                                { key: 'both', label: 'All', color: '#64748B' },
                                { key: 'jobs', label: 'Jobs', color: '#F59E0B' },
                                { key: 'applications', label: 'Applications', color: '#A855F7' },
                            ].map(opt => (
                                <Box
                                    key={opt.key}
                                    onClick={() => setChartType(opt.key)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.8,
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: chartType === opt.key ? alpha(opt.color, 0.4) : 'transparent',
                                        bgcolor: chartType === opt.key ? alpha(opt.color, 0.07) : 'transparent',
                                        transition: 'all 0.15s ease',
                                        '&:hover': { bgcolor: alpha(opt.color, 0.07) }
                                    }}
                                >
                                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: opt.color }} />
                                    <Typography sx={{ fontWeight: 700, color: chartType === opt.key ? opt.color : '#94A3B8', fontSize: '0.78rem' }}>
                                        {opt.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 280, px: 1 }}>
                        {Array(6).fill(0).map((_, i) => (
                            <Box key={i} sx={{ flex: 1, display: 'flex', gap: 0.5, alignItems: 'flex-end' }}>
                                <Skeleton variant="rectangular" width="100%" height={60 + Math.random() * 120} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width="100%" height={40 + Math.random() * 80} sx={{ borderRadius: 1 }} />
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                            barGap={3}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                axisLine={{ stroke: '#E2E8F0' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: alpha('#6366F1', 0.03) }} />
                            {(chartType === 'both' || chartType === 'jobs') && (
                                <Bar dataKey="Jobs" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            )}
                            {(chartType === 'both' || chartType === 'applications') && (
                                <Bar dataKey="Applications" fill="#A855F7" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Paper>

            {/* ─── Recent Activity (Full Width, Below Chart) ─── */}
            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                p: 2
            }}>
                <Box sx={{ mb: 1.5 }}>
                    <Typography fontWeight={800} color="text.primary" sx={{ fontSize: '1rem' }}>
                        Recent Activity
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 500 }}>
                        Latest candidate applications
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                                <Skeleton variant="circular" width={44} height={44} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="60%" height={24} />
                                    <Skeleton variant="text" width="30%" height={16} />
                                </Box>
                            </Box>
                        ))
                    ) : activityQueue.length === 0 ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 5
                        }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: '#F1F5F9', color: '#94A3B8', mb: 1.5 }}>
                                <ApplicationIcon sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Typography variant="body1" fontWeight={700} color="text.secondary">
                                No recent activity
                            </Typography>
                            <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                                New applications will appear here
                            </Typography>
                        </Box>
                    ) : (
                        activityQueue.slice(0, 5).map((activity, idx) => (
                            <Box
                                key={activity.id || idx}
                                onClick={() => handleActivityClick(activity)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: 'transparent',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: alpha('#6366F1', 0.05),
                                        borderColor: alpha('#6366F1', 0.12),
                                        transform: 'translateX(4px)',
                                        '& .act-arrow': { opacity: 1, transform: 'translateX(0)' }
                                    }
                                }}
                            >
                                <Avatar
                                    src={activity.avatar}
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        bgcolor: alpha('#6366F1', 0.1),
                                        color: '#6366F1',
                                        fontWeight: 800,
                                        fontSize: 16,
                                        boxShadow: `0 0 0 4px ${alpha('#6366F1', 0.03)}`
                                    }}
                                >
                                    {activity.candidateName?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        lineHeight: 1.4,
                                        fontSize: '0.9rem',
                                        mb: 0.2
                                    }}>
                                        <Box component="span" sx={{ color: '#6366F1', fontWeight: 800 }}>
                                            {activity.candidateName}
                                        </Box>
                                        {' '}applied for{' '}
                                        <Box component="span" fontWeight={800} color="text.primary">
                                            {activity.jobTitle}
                                        </Box>
                                    </Typography>
                                    <Stack direction="row" spacing={0.6} alignItems="center">
                                        <TimeIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                                        <Typography sx={{ color: '#94A3B8', fontSize: '0.72rem', fontWeight: 600 }}>
                                            {timeAgo(activity.time)}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <ArrowForwardIcon
                                    className="act-arrow"
                                    sx={{
                                        fontSize: 18,
                                        color: '#6366F1',
                                        opacity: 0,
                                        transform: 'translateX(-8px)',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            </Box>
                        ))
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default RecruiterDashboardMain;
