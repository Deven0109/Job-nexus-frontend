import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Stack,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Chip,
    alpha,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    CircularProgress,
    Divider,
    Pagination
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as PlusIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as EyeIcon,
    VisibilityOff as EyeOffIcon,
    Tag as TagIcon
} from '@mui/icons-material';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/recruiter.api';
import toast from 'react-hot-toast';

const ManageCategories = () => {
    const theme = useTheme();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        isVisible: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const limit = 6;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await listCategories();
            if (res.success) {
                setCategories(res.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                isVisible: category.isVisible
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                isVisible: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return toast.error('Category name is required');
        }

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, formData);
                toast.success('Category updated successfully');
            } else {
                await createCategory(formData);
                toast.success('Category created successfully');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteCategory(id);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    const toggleVisibility = async (category) => {
        try {
            await updateCategory(category._id, {
                ...category,
                isVisible: !category.isVisible
            });
            toast.success(`Category is now ${!category.isVisible ? 'visible' : 'hidden'}`);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const paginatedCategories = filteredCategories.slice((page - 1) * limit, page * limit);

    return (
        <Container maxWidth="xl" sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
            {/* Simple Header */}
            <Box sx={{ py: 3, mb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <TagIcon sx={{ color: 'primary.main' }} />
                        Manage Categories
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Control the list of industries and job categories available for postings
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PlusIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 3 }}
                >
                    Add Category
                </Button>
            </Box>

            {/* Simple Filter Bar */}
            <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                    placeholder="Search by category name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ maxWidth: 400, flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="disabled" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                />
            </Box>

            {/* Simple List Layout */}
            <Stack spacing={1.5}>
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <Paper key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={20} />
                        </Paper>
                    ))
                ) : paginatedCategories.length === 0 ? (
                    <Paper sx={{ py: 8, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <Typography color="text.disabled" fontWeight={700}>No categories found</Typography>
                    </Paper>
                ) : (
                    paginatedCategories.map((cat, idx) => (
                        <Paper key={cat._id} elevation={0} sx={{
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.01),
                                borderColor: 'primary.main'
                            }
                        }}>
                            <Typography variant="body2" fontWeight={800} color="text.secondary" sx={{ width: 30 }}>
                                #{(page - 1) * limit + idx + 1}
                            </Typography>

                            <Typography variant="body1" fontWeight={800} sx={{ flex: 1 }}>
                                {cat.name}
                            </Typography>

                            <Chip
                                label={cat.isVisible ? 'Visible' : 'Hidden'}
                                size="small"
                                onClick={() => toggleVisibility(cat)}
                                icon={cat.isVisible ? <EyeIcon style={{ fontSize: 14 }} /> : <EyeOffIcon style={{ fontSize: 14 }} />}
                                color={cat.isVisible ? 'success' : 'default'}
                                sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', height: 24 }}
                            />

                            <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />

                            <Stack direction="row" spacing={1}>
                                <IconButton size="small" onClick={() => handleOpenModal(cat)} sx={{ color: 'primary.main', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete(cat._id)} sx={{ color: 'error.main', border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.1) }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Paper>
                    ))
                )}
            </Stack>

            {filteredCategories.length > limit && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={Math.ceil(filteredCategories.length / limit)}
                        page={page}
                        onChange={(e, value) => {
                            setPage(value);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontWeight: 800
                            }
                        }}
                    />
                </Box>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={showModal}
                onClose={() => !isSubmitting && setShowModal(false)}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pt: 3 }}>
                    {editingCategory ? 'Update Category' : 'Create New Category'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 1 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                    Category Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. Health Care"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    size="small"
                                    autoFocus
                                    InputProps={{ sx: { borderRadius: 2, fontWeight: 700 } }}
                                />
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isVisible}
                                        onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                        color="primary"
                                    />
                                }
                                label={<Typography variant="body2" fontWeight={700}>Visible to employers and candidates</Typography>}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button onClick={() => setShowModal(false)} disabled={isSubmitting} sx={{ fontWeight: 900, color: 'text.secondary' }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{ borderRadius: 2, fontWeight: 900, px: 4, minWidth: 120 }}
                        >
                            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default ManageCategories;
