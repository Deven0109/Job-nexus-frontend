import { useState, useEffect } from 'react';
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineMagnifyingGlass,
    HiOutlineTag
} from 'react-icons/hi2';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/recruiter.api';
import toast from 'react-hot-toast';

const ManageCategories = () => {
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
                        <HiOutlineTag className="text-primary-600" />
                        Manage Categories
                    </h2>
                    <p className="text-dark-500 text-sm mt-1">View and manage your job categories</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            <div className="card overflow-hidden">
                <div className="p-4 border-b border-dark-100 bg-white">
                    <div className="relative max-w-sm">
                        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search by category type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2 rounded-xl border border-dark-200 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-dark-50 border-b border-dark-100 text-dark-500 font-bold">
                                <th className="text-left px-6 py-4 uppercase tracking-wider w-16">#</th>
                                <th className="text-left px-6 py-4 uppercase tracking-wider">Category Type</th>
                                <th className="text-left px-6 py-4 uppercase tracking-wider">Visibility</th>
                                <th className="text-center px-6 py-4 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-50">
                            {loading ? (
                                Array(5).fill().map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-4 bg-dark-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-dark-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-dark-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-20 bg-dark-200 rounded mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((cat, idx) => (
                                    <tr key={cat._id} className="hover:bg-dark-25 transition-colors">
                                        <td className="px-6 py-4 text-dark-500 font-medium">{idx + 1}</td>
                                        <td className="px-6 py-4 font-bold text-dark-800">{cat.name}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleVisibility(cat)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${cat.isVisible
                                                        ? 'bg-success-50 text-success-700 hover:bg-success-100'
                                                        : 'bg-dark-100 text-dark-500 hover:bg-dark-200'
                                                    }`}
                                            >
                                                {cat.isVisible ? <HiOutlineEye className="w-4 h-4" /> : <HiOutlineEyeSlash className="w-4 h-4" />}
                                                {cat.isVisible ? 'Visible' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <HiOutlinePencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat._id)}
                                                    className="p-2 text-dark-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <HiOutlineTrash className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-dark-400">
                                        No categories found. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-dark-900">
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-dark-400 hover:text-dark-600 p-1"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-dark-700 mb-2">Category Type <span className="text-danger-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-dark-200 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                    placeholder="e.g., Programming"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-dark-700 mb-3">Visible <span className="text-danger-500">*</span></label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVisible}
                                            onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-dark-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-100 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </div>
                                    <span className="text-sm font-medium text-dark-600 group-hover:text-dark-800 transition-colors">Visible in job postings</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 border border-dark-200 text-dark-600 font-bold rounded-xl hover:bg-dark-50 transition-all text-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all text-sm disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : null}
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
