import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth.api';
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
    Avatar,
    InputAdornment,
    alpha,
    useTheme,
    Card,
    CardContent,
    Divider,
    Tooltip,
    CircularProgress,
    FormControl,
    Select,
    MenuItem,
    Chip,
    OutlinedInput
} from '@mui/material';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    PhotoCamera as PhotoCameraIcon,
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const RecruiterProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const theme = useTheme();

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        categories: [],
    });

    const [availableCategories, setAvailableCategories] = useState([]);

    const [previewImage, setPreviewImage] = useState(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                mobileNumber: user.phone || '',
                categories: user.categories || [],
            });
            setPreviewImage(user.avatar || null);
        }
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                if (data.success) {
                    setAvailableCategories(data.data.map(c => c.name));
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewImage(objectUrl);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const { data } = await authAPI.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.mobileNumber,
                categories: profileData.categories,
                avatar: previewImage
            });
            updateUser(data.data.profile || data.data.user);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            return toast.error('Passwords do not match');
        }

        setIsUpdatingPassword(true);
        try {
            await authAPI.changePassword(passwordData);
            toast.success('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <Box sx={{
            bgcolor: '#f4f7fe',
            minHeight: '100vh',
            width: '100%',
            py: 6
        }}>
            <Container maxWidth={false} sx={{ maxWidth: '1600px' }}>
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h3" fontWeight={900} color="#1e293b" sx={{ letterSpacing: '-0.04em' }}>
                        Company Profile
                    </Typography>
                </Box>

                <Grid container spacing={4} alignItems="stretch">
                    {/* Profile Card */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '60px',
                            bgcolor: 'white',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': { boxShadow: '0 15px 50px rgba(0,0,0,0.04)' }
                        }}>
                            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 6 }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '20px',
                                    bgcolor: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748b'
                                }}>
                                    <PersonIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={900} sx={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Update Profile</Typography>
                                    <Typography variant="body2" color="#64748b" fontWeight={600}>
                                        Update your company profile details
                                    </Typography>
                                </Box>
                            </Stack>

                            <form onSubmit={handleProfileUpdate} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>First Name *</Typography>
                                        <TextField
                                            fullWidth
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                            placeholder="Enter first name"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '16px',
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { border: 'none' },
                                                    fontWeight: 700,
                                                    color: '#1e293b'
                                                }
                                            }}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>Last Name *</Typography>
                                        <TextField
                                            fullWidth
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                            placeholder="Enter last name"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '16px',
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { border: 'none' },
                                                    fontWeight: 700,
                                                    color: '#1e293b'
                                                }
                                            }}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>Email *</Typography>
                                        <TextField
                                            fullWidth
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            placeholder="Enter business email"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '16px',
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { border: 'none' },
                                                    fontWeight: 700,
                                                    color: '#1e293b'
                                                }
                                            }}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>Mobile Number</Typography>
                                        <TextField
                                            fullWidth
                                            value={profileData.mobileNumber}
                                            onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                                            placeholder="Enter mobile number"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '16px',
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { border: 'none' },
                                                    fontWeight: 700,
                                                    color: '#1e293b'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>Job Categories</Typography>
                                        <FormControl fullWidth>
                                            <Select
                                                multiple
                                                displayEmpty
                                                value={profileData.categories}
                                                onChange={(e) => setProfileData({ ...profileData, categories: e.target.value })}
                                                input={
                                                    <OutlinedInput
                                                        sx={{
                                                            borderRadius: '16px',
                                                            bgcolor: '#f8fafc',
                                                            '& fieldset': { border: 'none' },
                                                        }}
                                                    />
                                                }
                                                renderValue={(selected) => {
                                                    if (selected.length === 0) {
                                                        return <Typography color="#94a3b8" fontWeight={700}>Select Categories</Typography>;
                                                    }
                                                    return (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {selected.map((value) => (
                                                                <Chip key={value} label={value} size="small" sx={{ fontWeight: 700, bgcolor: '#2563eb', color: 'white' }} />
                                                            ))}
                                                        </Box>
                                                    );
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 224,
                                                            width: 250,
                                                        },
                                                    },
                                                }}
                                            >
                                                {availableCategories.map((name) => (
                                                    <MenuItem key={name} value={name} sx={{ fontWeight: 600 }}>
                                                        {name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>Profile Image</Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            bgcolor: '#f8fafc',
                                            p: 1,
                                            borderRadius: '16px',
                                        }}>
                                            <Button
                                                variant="contained"
                                                component="label"
                                                size="small"
                                                sx={{
                                                    borderRadius: '12px',
                                                    fontWeight: 900,
                                                    textTransform: 'none',
                                                    px: 3,
                                                    py: 1,
                                                    boxShadow: 'none',
                                                    bgcolor: '#2563eb',
                                                    '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' }
                                                }}
                                            >
                                                Choose file
                                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                            </Button>
                                            <Typography variant="caption" color="#94a3b8" fontWeight={700}>
                                                {previewImage ? 'Image selected' : 'No file chosen'}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                                            <Box sx={{
                                                p: 2,
                                                borderRadius: '24px',
                                                bgcolor: '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px solid white',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                                            }}>
                                                <Avatar
                                                    src={previewImage}
                                                    variant="rounded"
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: '14px',
                                                        bgcolor: 'white'
                                                    }}
                                                >
                                                    <PhotoCameraIcon sx={{ fontSize: 28, opacity: 0.2, color: '#1e293b' }} />
                                                </Avatar>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#1e293b', mb: 0.5 }}>Profile Preview</Typography>
                                                <Typography variant="caption" color="#64748b" fontWeight={700} display="block">This is how your logo will look</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 'auto', pt: 6, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={isUpdatingProfile}
                                        sx={{
                                            borderRadius: '18px',
                                            py: 2,
                                            px: 5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            bgcolor: '#2563eb',
                                            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                                            '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.4)' }
                                        }}
                                    >
                                        {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </Box>
                            </form>
                        </Paper>
                    </Grid>

                    {/* Password Card */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                        <Paper elevation={0} sx={{
                            p: 6,
                            borderRadius: '60px',
                            bgcolor: 'white',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': { boxShadow: '0 15px 50px rgba(0,0,0,0.04)' }
                        }}>
                            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 6 }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '20px',
                                    bgcolor: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748b'
                                }}>
                                    <LockIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={900} sx={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Security</Typography>
                                    <Typography variant="body2" color="#64748b" fontWeight={600}>
                                        Update your account password
                                    </Typography>
                                </Box>
                            </Stack>

                            <form onSubmit={handlePasswordUpdate} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Stack spacing={4} sx={{ mb: 4 }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>Current Password</Typography>
                                        <TextField
                                            fullWidth
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            placeholder="••••••••"
                                            InputProps={{
                                                sx: {
                                                    borderRadius: '16px',
                                                    fontWeight: 700,
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { border: 'none' },
                                                    color: '#1e293b'
                                                },
                                                endAdornment: (
                                                    <InputAdornment position="end" sx={{ mr: 1 }}>
                                                        <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                                                            {showPasswords.current ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            required
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>New Password</Typography>
                                        <TextField
                                            fullWidth
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            InputProps={{
                                                sx: {
                                                    borderRadius: '16px',
                                                    fontWeight: 700,
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { border: 'none' },
                                                    color: '#1e293b'
                                                },
                                                endAdornment: (
                                                    <InputAdornment position="end" sx={{ mr: 1 }}>
                                                        <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                                                            {showPasswords.new ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            required
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1, color: '#334155', ml: 1 }}>Confirm New Password</Typography>
                                        <TextField
                                            fullWidth
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwordData.confirmNewPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                            placeholder="••••••••"
                                            InputProps={{
                                                sx: {
                                                    borderRadius: '16px',
                                                    fontWeight: 700,
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { border: 'none' },
                                                    color: '#1e293b'
                                                },
                                                endAdornment: (
                                                    <InputAdornment position="end" sx={{ mr: 1 }}>
                                                        <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                                                            {showPasswords.confirm ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            required
                                        />
                                    </Box>
                                </Stack>

                                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={isUpdatingPassword}
                                        sx={{
                                            borderRadius: '18px',
                                            py: 2,
                                            px: 5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            bgcolor: '#2563eb',
                                            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                                            '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.4)' }
                                        }}
                                    >
                                        {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                                    </Button>
                                </Box>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default RecruiterProfileSettings;
