import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Avatar,
    Button,
    Chip,
    Grid,
    IconButton,
    Divider,
    Paper,
    Stack,
    Tooltip,
    alpha,
    useTheme,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    FileDownload as DownloadIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Star as StarIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Info as InfoIcon,
    AutoGraph as RecommendIcon
} from '@mui/icons-material';

import { getEmployerShortlisted, updateEmployerStatus } from '../../api/applications.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

const EmployerReviewPage = () => {
    const { jobId } = useParams();
    const theme = useTheme();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShortlisted = async () => {
        setLoading(true);
        try {
            const res = await getEmployerShortlisted(jobId);
            if (res.success) {
                setApplications(res.data);
            }
        } catch (error) {
            toast.error('Failed to load shortlisted candidates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShortlisted();
    }, [jobId]);

    const handleAction = async (id, action) => {
        try {
            await updateEmployerStatus(id, action);
            toast.success(`Candidate ${action === 'approve' ? 'approved' : 'rejected'}`);
            fetchShortlisted();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={40} thickness={5} />
        </Box>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            {/* ======= HERO HEADER ======= */}
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconButton
                    component={RouterLink}
                    to="/employer/dashboard"
                    sx={{
                        bgcolor: 'common.white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        '&:hover': { bgcolor: 'grey.50', transform: 'translateX(-4px)' },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
                        Expert Recommendations
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <RecommendIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            Premium talent curated and verified by our recruitment specialists
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {applications.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{
                            p: 12,
                            borderRadius: 10,
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            border: '2px dashed',
                            borderColor: 'grey.200',
                            boxShadow: 'none'
                        }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.100', mx: 'auto', mb: 3 }}>
                                <InfoIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                            </Avatar>
                            <Typography variant="h5" fontWeight={800} gutterBottom>No Pending Reviews</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto' }}>
                                You're all caught up! When our recruiters find new candidates matching your criteria, they will appear here.
                            </Typography>
                        </Paper>
                    </Grid>
                ) : (
                    applications.map((app) => (
                        <Grid item xs={12} lg={6} key={app._id}>
                            <Card sx={{
                                borderRadius: 8,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                '&:hover': { boxShadow: '0 20px 40px rgba(0,0,0,0.08)', transform: 'translateY(-4px)' },
                                transition: 'all 0.4s',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardContent sx={{ p: 5, flexGrow: 1 }}>
                                    {/* Profile Top */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Avatar
                                                src={app.candidate?.avatar?.startsWith('http') ? app.candidate.avatar : `${BASE_URL}${app.candidate?.avatar}`}
                                                sx={{
                                                    width: 84,
                                                    height: 84,
                                                    borderRadius: 5,
                                                    fontWeight: 900,
                                                    fontSize: '1.5rem',
                                                    bgcolor: 'primary.main',
                                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {app.candidate?.firstName?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                    {app.candidate?.firstName} {app.candidate?.lastName}
                                                </Typography>
                                                <Stack direction="column" spacing={0.5} sx={{ mt: 1 }}>
                                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600 }}>
                                                        <EmailIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                                                        {app.candidate?.email}
                                                    </Box>
                                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600 }}>
                                                        <PhoneIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                                                        {app.candidate?.phone || 'Private Number'}
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        <Chip
                                            icon={<StarIcon sx={{ color: 'white !important', fontSize: '14px !important' }} />}
                                            label="Elite Tier"
                                            color="primary"
                                            sx={{
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                                px: 1,
                                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 3 }} />

                                    {/* Professional Bio */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900, letterSpacing: 1.5 }}>
                                            Candidate Profile Summary
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            mt: 1.5,
                                            p: 3,
                                            bgcolor: '#f8fafc',
                                            borderRadius: 4,
                                            lineHeight: 1.8,
                                            color: 'slate.700',
                                            fontStyle: 'italic',
                                            border: '1px solid',
                                            borderColor: 'slate.100'
                                        }}>
                                            "{app.candidateProfile?.summary || 'Standard professional summary not provided. Candidate has been vetted by our team for technical competence and cultural fit.'}"
                                        </Typography>
                                    </Box>

                                    {/* Skills Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900, letterSpacing: 1.5 }}>
                                            Key Skills & Competencies
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                                            {(app.candidateProfile?.skills?.slice(0, 10) || ['Expert Analysis', 'Communication', 'Technical Leadership', 'Innovation']).map((skill, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={skill}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 3,
                                                        fontWeight: 700,
                                                        background: 'white',
                                                        borderColor: 'grey.300',
                                                        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'primary.50' }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    {/* Resume Button */}
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        href={app.candidateProfile?.resumeUrl?.startsWith('http') ? app.candidateProfile.resumeUrl : `${BASE_URL}${app.candidateProfile?.resumeUrl || app.resumeUrl}`}
                                        target="_blank"
                                        sx={{
                                            py: 2,
                                            borderRadius: 4,
                                            borderColor: 'slate.200',
                                            color: 'slate.700',
                                            fontWeight: 800,
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: 'slate.50', borderColor: 'slate.300' },
                                            mb: 2
                                        }}
                                    >
                                        Download Professional Resume
                                    </Button>
                                </CardContent>

                                <CardActions sx={{ px: 5, py: 4, bgcolor: '#f1f5f9', borderTop: '1px solid', borderColor: 'slate.200' }}>
                                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleAction(app._id, 'approve')}
                                            startIcon={<CheckCircleIcon />}
                                            sx={{
                                                py: 2,
                                                borderRadius: 3,
                                                fontWeight: 900,
                                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                bgcolor: '#22c55e',
                                                '&:hover': { bgcolor: '#16a34a' }
                                            }}
                                        >
                                            Approve for Interview
                                        </Button>
                                        <Tooltip title="Reject Application">
                                            <Button
                                                variant="contained"
                                                onClick={() => handleAction(app._id, 'reject')}
                                                sx={{
                                                    borderRadius: 3,
                                                    minWidth: '64px',
                                                    bgcolor: '#ffffff',
                                                    color: '#94a3b8',
                                                    boxShadow: 'none',
                                                    border: '1px solid #e2e8f0',
                                                    '&:hover': { color: '#ef4444', bgcolor: '#fef2f2', borderColor: '#fee2e2', boxShadow: 'none' }
                                                }}
                                            >
                                                <CancelIcon />
                                            </Button>
                                        </Tooltip>
                                    </Stack>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
};

export default EmployerReviewPage;
