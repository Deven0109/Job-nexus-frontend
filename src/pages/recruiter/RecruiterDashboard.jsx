import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Stack,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Chip,
    alpha,
    useTheme,
    Card,
    CardContent,
    Divider,
    Tooltip,
    Avatar,
    Skeleton,
    MenuItem
} from '@mui/material';
import {
    Search as SearchIcon,
    Work as WorkIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    People as PeopleIcon,
    Delete as DeleteIcon,
    Bolt as BoltIcon,
    Edit as EditIcon,
    BusinessCenter as BusinessCenterIcon
} from '@mui/icons-material';
import { getMyJobs, deleteJob, toggleJobStatus } from '../../api/recruiter.api';
import toast from 'react-hot-toast';
import { Pagination } from '@mui/material';
import { FilterList as FilterIcon, Sort as SortIcon } from '@mui/icons-material';

// Helper: Get currency symbol from currency code stored in job
const getCurrencySymbol = (currencyCode) => {
    const symbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'AED': 'AED ',
        'CAD': 'C$',
        'AUD': 'A$',
        'SGD': 'S$',
        'SAR': 'SAR ',
        'QAR': 'QAR ',
    };
    return symbols[currencyCode] || '₹'; // Default to ₹ for old jobs without currency field
};

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, total: 0 });

    // Pagination & Filter States
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const limit = 6;

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await getMyJobs();
            if (res.success) {
                setJobs(res.data.jobs || []);
                const activeCount = res.data.jobs.filter(j => j.status === 'active').length;
                setStats({ active: activeCount, total: res.data.jobs.length });
            }
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await deleteJob(id);
            toast.success('Job deleted successfully');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to delete job');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleJobStatus(id);
            toast.success('Job status updated');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to update job status');
        }
    };

    const processedJobs = jobs
        .filter(job => {
            const matchesSearch = (job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.city?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            return 0;
        });

    const totalFiltered = processedJobs.length;
    const paginatedJobs = processedJobs.slice((page - 1) * limit, page * limit);
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, totalFiltered);

    return (
        <Container maxWidth="xl" sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
            {/* Simple Header */}
            <Box sx={{ py: 3, mb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary' }}>
                        Manage Job Postings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Overall <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{stats.active}</Box> active jobs out of {stats.total} postings
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<BusinessCenterIcon />}
                    component={Link}
                    to="/recruiter/add-job"
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 3 }}
                >
                    Post New Job
                </Button>
            </Box>

            {/* Filter/Search Bar */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by title or location..."
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
                    <Grid item xs={6} md={3}>
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
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SortIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 0.5 }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), fontWeight: 800, fontSize: '0.85rem' }
                            }}
                        >
                            <MenuItem value="latest">Latest First</MenuItem>
                            <MenuItem value="oldest">Oldest First</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {/* Result Info */}
            {!loading && totalFiltered > 0 && (
                <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                        Showing <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>{startIndex}–{endIndex}</Box> of {totalFiltered} jobs
                    </Typography>
                </Box>
            )}

            {/* Jobs List */}
            <Grid container spacing={2}>
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Grid item xs={12} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Skeleton variant="text" width="40%" height={40} />
                                    <Skeleton variant="text" width="20%" height={24} sx={{ mb: 2 }} />
                                    <Stack direction="row" spacing={2}>
                                        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
                                        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : paginatedJobs.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{
                            p: { xs: 2, sm: 4 },
                            borderRadius: 6,
                            border: '1px dashed',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.background.default, 0.5)
                        }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 3 }}>
                                <WorkIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography variant="h5" fontWeight={900} gutterBottom>
                                No jobs found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                                {searchQuery ? "We couldn't find any jobs matching your search." : "Start by adding your first job posting to see it appear here."}
                            </Typography>
                        </Paper>
                    </Grid>
                ) : (
                    paginatedJobs.map((job) => (
                        <Grid item xs={12} key={job._id}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: '40px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    height: 180, // Fixed exact height for "same to same" size
                                    width: '100%', // Fixed the width shrinking issue
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflow: 'hidden', // Prevent any growth
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.08)}`,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4, width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {/* Left Side: Job Info (Flexible) */}
                                        <Box sx={{ flex: 1, minWidth: 0, pr: 4 }}>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                                                <Chip
                                                    label={job.status}
                                                    size="small"
                                                    color={job.status === 'active' ? 'success' : 'default'}
                                                    sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em', borderRadius: 2 }}
                                                />
                                                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: '0.05em' }}>
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="h4" fontWeight={900} sx={{
                                                mb: 1,
                                                color: 'text.primary',
                                                fontSize: '1.6rem',
                                                letterSpacing: '-0.02em',
                                                textTransform: 'lowercase',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {job.title}
                                            </Typography>
                                            <Stack
                                                direction={{ xs: 'column', md: 'row' }}
                                                spacing={{ xs: 1, md: 3 }}
                                                sx={{ color: 'text.secondary', flexWrap: 'wrap', rowGap: 1 }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.7 }} />
                                                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                                        {job.location || job.city || 'N/A'}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexShrink: 0 }}>
                                                    <Typography variant="caption" fontWeight={900} sx={{ color: 'text.secondary', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        CTC :-
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight={800} sx={{ whiteSpace: 'nowrap', color: 'text.primary' }}>
                                                        {getCurrencySymbol(job.currency)}{job.salaryMin ? job.salaryMin.toLocaleString() : '0'} – {job.salaryMax ? job.salaryMax.toLocaleString() : '0'}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                                    <PeopleIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.7 }} />
                                                    <Typography variant="caption" fontWeight={800} sx={{ whiteSpace: 'nowrap' }}>
                                                        {job.vacancies || 0} Open
                                                    </Typography>
                                                </Stack>

                                            </Stack>
                                        </Box>

                                        {/* Right Side: Actions (Fixed Width for exact alignment) */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                                            <Button
                                                component={Link}
                                                to={`/recruiter/job/${job._id}/pipeline`}
                                                variant="contained"
                                                startIcon={<BoltIcon />}
                                                sx={{
                                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                                    color: 'success.main',
                                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                                    borderRadius: '24px',
                                                    px: 3,
                                                    height: 44,
                                                    fontWeight: 900,
                                                    boxShadow: 'none',
                                                    textTransform: 'capitalize',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Pipeline
                                            </Button>
                                            <Button
                                                component={Link}
                                                to={`/recruiter/job/${job._id}/applications`}
                                                variant="contained"
                                                startIcon={<PeopleIcon />}
                                                sx={{
                                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    color: 'primary.main',
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                                                    borderRadius: '24px',
                                                    px: 3,
                                                    height: 44,
                                                    fontWeight: 900,
                                                    boxShadow: 'none',
                                                    textTransform: 'capitalize',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Applications
                                            </Button>

                                            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, my: 'auto' }} />

                                            <Stack direction="row" spacing={1.5}>
                                                <Tooltip title="View/Edit Details">
                                                    <IconButton
                                                        onClick={() => navigate(`/recruiter/job-requests/${job.jobRequestId || job._id}?edit=true`)}
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            color: 'white',
                                                            bgcolor: '#3b82f6',
                                                            '&:hover': { bgcolor: '#2563eb' }
                                                        }}
                                                    >
                                                        <EditIcon sx={{ fontSize: 20 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Job">
                                                    <IconButton
                                                        onClick={() => handleDelete(job._id)}
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            color: 'white',
                                                            bgcolor: '#ef4444',
                                                            '&:hover': { bgcolor: '#dc2626' }
                                                        }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 20 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                    )
                )}
            </Grid>

            {/* Pagination Control */}
            {!loading && totalFiltered > limit && (
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
            )}
        </Container>
    );
};

export default RecruiterDashboard;
