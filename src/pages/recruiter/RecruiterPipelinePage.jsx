import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Typography,
    Box,
    Paper,
    Stack,
    IconButton,
    Avatar,
    Chip,
    alpha,
    useTheme,
    Skeleton,
    Button
} from '@mui/material';
import {
    ArrowBack as ArrowLeftIcon,
    VideoCameraFront as VideoCameraIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { getJobPipeline, updateApplicationStatus } from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import {
    Stars as SkillsIcon,
    History as ExperienceIcon,
    ChevronRight as MoveIcon,
    Block as RejectIcon,
    MoreVert as MoreIcon
} from '@mui/icons-material';

const RecruiterPipelinePage = () => {
    const { jobId } = useParams();
    const theme = useTheme();
    const [pipeline, setPipeline] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPipeline = async () => {
            try {
                const res = await getJobPipeline(jobId);
                if (res && (res.success || res.data)) {
                    setPipeline(res.data || res || {});
                }
            } catch (error) {
                console.error('Pipeline error:', error);
                toast.error('Failed to load hiring pipeline');
            } finally {
                setLoading(false);
            }
        };
        fetchPipeline();
    }, [jobId]);

    const columns = [
        { key: 'Applied', title: 'Applied', color: '#3b82f6', action: 'review' },
        {
            key: 'Under Review',
            title: 'Review',
            color: '#f59e0b',
            action: 'shortlist',
            include: ['Under Review', 'Recruiter Shortlisted'] // Group these
        },
        { key: 'Employer Shortlisted', title: 'Shortlisted', color: '#10b981', action: 'interview' },
        {
            key: 'Interview Scheduled',
            title: 'Interview',
            color: '#8b5cf6',
            action: 'next-round',
            include: ['Interview Scheduled', 'Selected Next Round'] // Group these
        },
        { key: 'Final Selected', title: 'Selected', color: '#059669', action: 'hire' },
        {
            key: 'Final Rejected',
            title: 'Rejected',
            color: '#ef4444',
            action: null,
            include: ['Final Rejected', 'Recruiter Rejected', 'Employer Rejected'] // Group all rejections
        }
    ];

    const handleAction = async (id, action) => {
        try {
            await updateApplicationStatus(id, action);
            toast.success('Candidate moved successfully');
            const res = await getJobPipeline(jobId);
            if (res.success) setPipeline(res.data);
        } catch (error) {
            toast.error('Failed to move candidate');
        }
    };

    if (loading) return (
        <Box sx={{ p: 4, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fb' }}>
            <Skeleton variant="text" width={250} height={40} sx={{ mb: 2 }} />
            <Stack direction="row" spacing={3} sx={{ flex: 1, overflow: 'hidden' }}>
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rectangular" width={280} height="100%" sx={{ borderRadius: 4, flexShrink: 0 }} />
                ))}
            </Stack>
        </Box>
    );

    const getCandidatesForColumn = (col) => {
        if (col.include) {
            return col.include.reduce((acc, status) => {
                const list = pipeline?.[status] || [];
                return [...acc, ...(Array.isArray(list) ? list : [])];
            }, []);
        }
        const list = pipeline?.[col.key] || [];
        return Array.isArray(list) ? list : [];
    };

    const totalCandidates = columns.reduce((sum, col) => {
        return sum + getCandidatesForColumn(col).length;
    }, 0);

    return (
        <Box sx={{
            height: 'calc(100vh - 64px - 32px)', // Adjust for header (64) + main padding (32)
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f8f9fb',
            overflow: 'hidden',
            borderRadius: 4
        }}>
            {/* 1. Page Header - Fixed */}
            <Box sx={{
                p: { xs: 1.5, sm: 2 },
                flexShrink: 0,
                bgcolor: 'white',
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1)
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton
                        component={Link}
                        to="/recruiter/manage-jobs"
                        size="small"
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                        <ArrowLeftIcon fontSize="small" />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }} noWrap>
                            Hiring Pipeline
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>{totalCandidates}</Box> candidates active in the process
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* 2. Pipeline Board Container */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                gap: 2,
                p: { xs: 1, sm: 1.5 },
                overflowX: 'auto',
                overflowY: 'hidden', // Contain vertical overflow
                pb: 1,
                '&::-webkit-scrollbar': { height: 8 },
                '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.divider, 0.4), borderRadius: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
            }}>
                {columns.map((col) => {
                    const candidates = getCandidatesForColumn(col);
                    return (
                        <Box
                            key={col.key}
                            sx={{
                                width: 310,
                                minWidth: 310,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                bgcolor: alpha(theme.palette.divider, 0.05),
                                borderRadius: 4,
                                p: 1,
                                flexShrink: 0
                            }}
                        >
                            {/* 3. Column Header - Effectively Sticky */}
                            <Paper elevation={0} sx={{
                                px: 2, py: 1.5,
                                mb: 1,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                bgcolor: 'white',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color, boxShadow: `0 0 8px ${alpha(col.color, 0.4)}` }} />
                                    <Typography variant="caption" fontWeight={900} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.primary' }}>
                                        {col.title}
                                    </Typography>
                                </Stack>
                                <Chip
                                    label={candidates.length}
                                    size="small"
                                    sx={{ fontWeight: 900, height: 22, bgcolor: alpha(col.color, 0.1), color: col.color, border: 'none', px: 0.5 }}
                                />
                            </Paper>

                            {/* Cards list with scroll */}
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                pr: 0.5,
                                '&::-webkit-scrollbar': { width: 4 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.divider, 0.3), borderRadius: 4 }
                            }}>
                                <Stack spacing={1.5}>
                                    {candidates.map((app) => (
                                        <Paper
                                            key={app?._id}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: 'white',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: col.color,
                                                    boxShadow: `0 4px 12px ${alpha(col.color, 0.1)}`,
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                                <Avatar
                                                    src={app?.candidate?.avatar?.startsWith('http') ? app.candidate.avatar : (app?.candidate?.avatar ? `${BASE_URL}${app.candidate.avatar}` : undefined)}
                                                    sx={{
                                                        width: 42, height: 42,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(col.color, 0.1),
                                                        color: col.color,
                                                        fontWeight: 900,
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {app?.candidate?.firstName?.[0]}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" fontWeight={900} noWrap sx={{ color: 'text.primary', mb: 0.2 }}>
                                                        {app?.candidate?.firstName} {app?.candidate?.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={700} noWrap display="block">
                                                        {app?.candidate?.email}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {/* Action Bar */}
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    component={Link}
                                                    to={`/recruiter/job/${jobId}/applications`}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 2,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        flex: 1,
                                                        textTransform: 'none',
                                                        py: 0.5,
                                                        color: 'primary.main',
                                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                                                    }}
                                                >
                                                    Manage
                                                </Button>
                                                {col.action && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAction(app._id, col.action)}
                                                        sx={{ bgcolor: alpha(col.color, 0.1), color: col.color, borderRadius: 2, '&:hover': { bgcolor: alpha(col.color, 0.2) } }}
                                                    >
                                                        <MoveIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                {col.key !== 'Final Rejected' && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAction(app._id, 'reject')}
                                                        sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', borderRadius: 2, '&:hover': { bgcolor: alpha('#ef4444', 0.2) } }}
                                                    >
                                                        <RejectIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </Paper>
                                    ))}

                                    {candidates.length === 0 && (
                                        <Box sx={{
                                            py: 8,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.2
                                        }}>
                                            <GroupIcon sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="caption" fontWeight={900}>
                                                EMPTY
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default RecruiterPipelinePage;
