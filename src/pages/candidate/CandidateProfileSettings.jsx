import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { parseResumeFile, updateCandidateProfile, getCandidateProfile } from '../../api/candidate.api';
import { BASE_URL } from '../../api/axios';

import toast from 'react-hot-toast';


// MUI Imports
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    InputAdornment,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Container
} from '@mui/material';

// MUI Icons
import {
    PersonOutline as PersonOutlineIcon,
    LockOutlined as LockOutlinedIcon,
    DescriptionOutlined as DescriptionOutlinedIcon,
    PhotoCamera as PhotoCameraIcon,
    EmailOutlined as EmailOutlinedIcon,
    PhoneIphoneOutlined as PhoneIphoneOutlinedIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    ShieldOutlined as ShieldOutlinedIcon,
    AutoAwesomeOutlined as AutoAwesomeOutlinedIcon
} from '@mui/icons-material';

const CandidateProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('candidateActiveTab') || 'profile');

    useEffect(() => {
        localStorage.setItem('candidateActiveTab', activeTab);
    }, [activeTab]);

    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const fileInputRef = useRef(null);
    const avatarInputRef = useRef(null);
    const [isParsing, setIsParsing] = useState(false);
    const [hasResumeData, setHasResumeData] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(null);
    const [resumeData, setResumeData] = useState({
        summary: '',
        skills: [],
        experience: [],
        education: [],
        projects: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getCandidateProfile();
                const details = res.data?.details;
                if (details) {
                    setResumeUrl(details.resumeUrl || null);
                    setResumeData({
                        summary: details.summary || '',
                        skills: details.skills || [],
                        experience: details.experience || [],
                        education: details.education || [],
                        projects: details.projects || []
                    });
                    if (details.resumeUrl || details.summary || details.skills?.length > 0 || details.experience?.length > 0 || details.education?.length > 0 || details.isProfileComplete) {
                        setHasResumeData(true);
                    }
                }
            } catch (err) {
                console.error("Failed to load candidate profile", err);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataExt = new FormData();
        formDataExt.append('resume', file);

        setIsParsing(true);
        try {
            toast.loading('Extracting data from resume & auto-saving...', { id: 'parse-toast' });

            const response = await parseResumeFile(formDataExt);
            const parsed = response.data.parsedProfile;

            setResumeUrl(response.data.resumeUrl);
            setResumeData(prev => ({
                ...prev,
                summary: parsed.summary || '',
                skills: parsed.skills || [],
                experience: parsed.experience || [],
                education: parsed.education || [],
                projects: parsed.projects || []
            }));

            setHasResumeData(true);
            toast.success('Resume uploaded and saved automatically!', { id: 'parse-toast' });

        } catch (error) {
            console.error('Parsing error:', error);
            toast.error(error?.response?.data?.message || 'Failed to parse resume', { id: 'parse-toast' });
        } finally {
            setIsParsing(false);
            e.target.value = '';
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            // Immediate UI update
            setFormData(prev => ({ ...prev, avatar: base64Image }));

            try {
                // Save to database immediately for "instant replacement" feel
                const res = await updateCandidateProfile({ avatar: base64Image });
                if (updateUser && res.data?.user) {
                    updateUser(res.data.user);
                }
                toast.success('Profile picture updated!');
            } catch (err) {
                console.error("Failed to upload avatar", err);
                toast.error('Failed to save profile picture');
            }
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    };

    const handleSaveResumeProfile = async () => {
        setIsLoading(true);
        try {
            if (updateUser) {
                await updateUser(formData);
            }
            await updateCandidateProfile(resumeData);
            toast.success('Resume profile updated and saved to database!');
        } catch (error) {
            console.error('Save error', error);
            toast.error('Failed to save resume profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Call API to save to database
            const res = await updateCandidateProfile(formData);

            // Update local Auth context with response from server
            if (updateUser && res.data?.user) {
                updateUser(res.data.user);
            }

            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            const msg = error.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setIsLoading(true);
        try {
            // Mock password update
            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const sidebarItems = [
        { id: 'profile', label: 'Profile Information', icon: <PersonOutlineIcon /> },
        { id: 'security', label: 'Security Settings', icon: <LockOutlinedIcon /> },
        { id: 'resume', label: 'Resume', icon: <DescriptionOutlinedIcon /> },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', gap: 4 }}>
                {/* ======= SIDEBAR ======= */}
                <Box sx={{ width: { xs: '100%', md: '280px', lg: '300px' }, flexShrink: 0 }}>
                    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                            <Typography variant="h6" fontWeight={800} color="text.primary">
                                Settings Menu
                            </Typography>
                        </Box>
                        <List sx={{ p: 2 }}>
                            {sidebarItems.map((item) => (
                                <ListItem disablePadding key={item.id} sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => setActiveTab(item.id)}
                                        selected={activeTab === item.id}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.5,
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: 'white',
                                                },
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'white' : 'text.secondary' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontWeight: activeTab === item.id ? 700 : 500
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Box>

                {/* ======= MAIN CONTENT ======= */}
                <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <Box>
                                <Box sx={{ height: 100, bgcolor: 'primary.main' }} />
                                <Box sx={{ px: { xs: 3, sm: 5 }, pb: 6 }}>
                                    {/* Profile Header */}
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 3, mb: 5 }}>
                                        <Box sx={{ position: 'relative', mt: -7, ml: { sm: 1 } }}>
                                            <Avatar
                                                src={formData.avatar?.startsWith('data:') ? formData.avatar : (formData.avatar?.startsWith('http') ? formData.avatar : `${BASE_URL}${formData.avatar}`)}
                                                alt="Profile"

                                                sx={{
                                                    width: 112,
                                                    height: 112,
                                                    border: '6px solid white',
                                                    boxShadow: 3,
                                                    bgcolor: 'grey.100',
                                                    color: 'primary.main',
                                                    fontSize: '2.5rem',
                                                    fontWeight: 800
                                                }}
                                            >
                                                {!(formData.avatar || user?.avatar) && `${user?.firstName?.[0]?.toUpperCase() || ''}${user?.lastName?.[0]?.toUpperCase() || ''}`}
                                            </Avatar>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={avatarInputRef}
                                                style={{ display: 'none' }}
                                                onChange={handleAvatarChange}
                                            />

                                            <IconButton
                                                size="small"
                                                onClick={() => avatarInputRef.current?.click()}
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 4,
                                                    right: 4,
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    border: '3px solid white',
                                                    '&:hover': { bgcolor: 'primary.dark' }
                                                }}
                                            >
                                                <PhotoCameraIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, mt: { xs: 0, sm: 2 } }}>
                                            <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ lineHeight: 1.2 }}>
                                                {user?.firstName} {user?.lastName}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600} color="text.secondary" sx={{ mt: 0.5 }}>
                                                {user?.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Profile Form */}
                                    <form onSubmit={handleSubmit}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="First Name"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PersonOutlineIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Last Name"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PersonOutlineIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Email Address"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <EmailOutlinedIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Mobile Number"
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PhoneIphoneOutlinedIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 5, pt: 3, borderTop: '1px solid #f0f0f0' }}>
                                            <Button variant="outlined" color="inherit" sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={isLoading}
                                                sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, boxShadow: 4 }}
                                            >
                                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save changes'}
                                            </Button>
                                        </Box>
                                    </form>
                                </Box>
                            </Box>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <Box>
                                <Box sx={{ p: 4, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                        <LockOutlinedIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight={800}>Security Settings</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Update your account password</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: { xs: 3, sm: 5 } }}>
                                    <form onSubmit={handlePasswordSubmit}>
                                        <Grid container spacing={4} sx={{ maxWidth: 600 }}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Current Password"
                                                    name="currentPassword"
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <ShieldOutlinedIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                                                                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="New Password"
                                                    name="newPassword"
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LockOutlinedIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                                                                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Confirm New Password"
                                                    name="confirmPassword"
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LockOutlinedIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                                                                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    disabled={isLoading}
                                                    startIcon={<ShieldOutlinedIcon />}
                                                    sx={{ py: 2, borderRadius: 2, fontWeight: 800, fontSize: '1rem', mt: 2 }}
                                                >
                                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </Box>
                            </Box>
                        )}

                        {/* RESUME TAB */}
                        {activeTab === 'resume' && (
                            <Box>
                                <Box sx={{ p: 4, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                        <DescriptionOutlinedIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight={800}>Manage Resume</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Upload or update your resume for job applications</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: { xs: 3, sm: 5 } }}>
                                    {!hasResumeData && !resumeUrl ? (
                                        <Card variant="outlined" sx={{ borderStyle: 'dashed', borderWidth: 2, borderColor: 'primary.light', bgcolor: 'primary.50', py: 8, textAlign: 'center', borderRadius: 4 }}>
                                            <CardContent>
                                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.100', color: 'primary.main', mx: 'auto', mb: 3 }}>
                                                    <AutoAwesomeOutlinedIcon fontSize="large" />
                                                </Avatar>
                                                <Typography variant="h5" fontWeight={900} color="text.primary" gutterBottom>
                                                    Upload Your Resume
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                                                    Upload your resume to autocomplete your profile. Supports PDF and DOCX formats.
                                                </Typography>

                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    style={{ display: 'none' }}
                                                    accept=".pdf,.doc,.docx"
                                                />
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="large"
                                                    onClick={() => fileInputRef.current.click()}
                                                    disabled={isParsing}
                                                    startIcon={isParsing ? <CircularProgress size={20} color="inherit" /> : <DescriptionOutlinedIcon />}
                                                    sx={{ px: 5, py: 1.5, borderRadius: 3, fontWeight: 800 }}
                                                >
                                                    {isParsing ? 'Uploading...' : 'Upload Resume'}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Box>
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 2 }}>
                                                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DescriptionOutlinedIcon color="primary" />
                                                    Your Uploaded Resume
                                                </Typography>

                                                {resumeUrl && (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        href={resumeUrl?.startsWith('http') ? resumeUrl : `${BASE_URL}${resumeUrl}`}

                                                        target="_blank"
                                                        startIcon={<VisibilityIcon />}
                                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                                    >
                                                        View Resume
                                                    </Button>
                                                )}
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
                                                We have successfully saved your resume. You can securely access it using the View Resume button, or upload an updated one below.
                                            </Typography>

                                            <Card variant="outlined" sx={{ bgcolor: 'grey.50', borderRadius: 3, p: 4 }}>
                                                <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <AutoAwesomeOutlinedIcon color="primary" />
                                                    Upload New Resume
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                    Upload an updated resume. Warning: This will overwrite your previously uploaded file data.
                                                </Typography>

                                                <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileUpload}
                                                        style={{ display: 'none' }}
                                                        accept=".pdf,.doc,.docx"
                                                    />
                                                    <Button
                                                        variant="text"
                                                        onClick={() => fileInputRef.current.click()}
                                                        disabled={isParsing}
                                                        startIcon={isParsing ? <CircularProgress size={20} color="inherit" /> : <DescriptionOutlinedIcon />}
                                                        sx={{ fontWeight: 700 }}
                                                    >
                                                        {isParsing ? 'Uploading...' : 'Upload New Resume'}
                                                    </Button>
                                                </Box>
                                            </Card>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}

                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default CandidateProfileSettings;
