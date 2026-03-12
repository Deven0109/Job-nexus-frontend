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
    Skeleton,
    Divider,
    Pagination,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as PlusIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as EyeIcon,
    VisibilityOff as EyeOffIcon,
    Tag as TagIcon,
    WorkOutline as WorkIcon
} from '@mui/icons-material';
import { listCategories, createCategory, updateCategory, deleteCategory, getMasterCategories } from '../../api/recruiter.api';
import toast from 'react-hot-toast';

const ManageCategories = () => {
    const theme = useTheme();
    const [categories, setCategories] = useState([]);
    const [masterCategories, setMasterCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        categoryName: '',
        selectedJobTitles: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const limit = 6;

    useEffect(() => {
        fetchMasterCategories();
        fetchCategories();
    }, []);

    const fetchMasterCategories = async () => {
        try {
            const res = await getMasterCategories();
            if (res.success) {
                setMasterCategories(res.data);
            }
        } catch (error) {
            toast.error('Failed to load master categories');
        }
    };

    const fetchCategories = async () => {
        if (categories.length === 0) setLoading(true);
        try {
            const res = await listCategories();
            if (res.success) {
                // Backend returns { categories: [...] } inside res.data
                const data = res.data?.categories || res.data;
                setCategories(Array.isArray(data) ? data : []);
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
                categoryName: category.categoryName,
                selectedJobTitles: category.selectedJobTitles || []
            });
        } else {
            setEditingCategory(null);
            setFormData({
                categoryName: '',
                selectedJobTitles: []
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.categoryName) {
            return toast.error('Category is required');
        }
        if (formData.selectedJobTitles.length === 0) {
            return toast.error('Please select at least one job title');
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
        // Now categories are not globally "visible" per individual flag, but we keep this stub or handle
        toast.error('Visibility flag removed. Categories map directly to jobs.');
    };

    const filteredCategories = categories.filter(cat =>
        cat.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.selectedJobTitles?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    sx={{ borderRadius: 0.5, fontWeight: 900, textTransform: 'none', px: 3 }}
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
                    sx={{ 
                        maxWidth: 400, 
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                                borderColor: '#000000',
                                borderWidth: '1.5px'
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="disabled" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 0.5, bgcolor: 'transparent' }
                    }}
                />
            </Box>

            {/* Simple List Layout */}
            <Stack spacing={1.5}>
                {loading ? (
                    Array(limit).fill(0).map((_, i) => (
                        <Paper key={i} elevation={0} sx={{
                            px: 3,
                            py: 2.5,
                            borderRadius: 0.5,
                            bgcolor: 'transparent',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Skeleton variant="circular" width={24} height={24} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="35%" height={24} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="text" width="65%" height={16} sx={{ borderRadius: 1, mt: 0.5 }} />
                            </Box>
                            <Stack direction="row" spacing={1.5}>
                                <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1.5 }} />
                                <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1.5 }} />
                            </Stack>
                        </Paper>
                    ))
                ) : paginatedCategories.length === 0 ? (
                    <Paper sx={{ py: 8, textAlign: 'center', borderRadius: 0.5, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                        <Typography color="text.disabled" fontWeight={700}>No categories found</Typography>
                    </Paper>
                ) : (
                    paginatedCategories.map((cat, idx) => (
                        <Paper key={cat._id} elevation={0} sx={{
                            px: 3,
                            py: 1.5,
                            borderRadius: 0.5,
                            bgcolor: 'transparent',
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

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" fontWeight={800} noWrap>
                                    {cat.categoryName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                                    {cat.selectedJobTitles?.length} Job Title(s): {cat.selectedJobTitles?.join(', ')}
                                </Typography>
                            </Box>

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
                PaperProps={{ sx: { borderRadius: 1.5, width: '100%', maxWidth: 450 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pt: 3 }}>
                    {editingCategory ? 'Update Category' : 'Create New Category'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 1 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                    Category
                                </Typography>
                                <Select
                                    fullWidth
                                    value={formData.categoryName}
                                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value, selectedJobTitles: [] })}
                                    size="small"
                                    disabled={!!editingCategory} // Cannot edit category name once created
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select a mapped category</MenuItem>
                                    {Object.keys(masterCategories).map((masterCat) => (
                                        <MenuItem key={masterCat} value={masterCat}>{masterCat}</MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            {formData.categoryName && masterCategories[formData.categoryName] && (
                                <Box>
                                    <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                        Selected Job Titles
                                    </Typography>
                                    <Select
                                        fullWidth
                                        multiple
                                        value={formData.selectedJobTitles}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            setFormData({ ...formData, selectedJobTitles: typeof value === 'string' ? value.split(',') : value });
                                        }}
                                        input={<OutlinedInput size="small" sx={{ borderRadius: 2, fontWeight: 700 }} />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {masterCategories[formData.categoryName].map((title) => (
                                            <MenuItem key={title} value={title}>
                                                <Checkbox checked={formData.selectedJobTitles.indexOf(title) > -1} />
                                                <ListItemText primary={title} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Box>
                            )}
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
