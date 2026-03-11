import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getJobRequestById, createJob, listCategories } from '../../api/recruiter.api';
import toast from 'react-hot-toast';
import {
    HiOutlineBriefcase,
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineXMark,
    HiOutlinePlusCircle,
    HiOutlineDocumentText,
} from 'react-icons/hi2';

const CATEGORIES = [
    'Information Technology', 'Healthcare', 'Finance & Banking', 'Education',
    'Manufacturing', 'Marketing', 'Sales', 'Human Resources', 'Engineering',
    'Design', 'Customer Service', 'Legal', 'Accounting', 'Operations', 'Other',
];

const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive Level', 'Not Required'];
const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED'];

const AddJob = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestId = searchParams.get('requestId');

    const [loading, setLoading] = useState(!!requestId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [requirementInput, setRequirementInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        company: '',
        location: '',
        workType: 'Onsite',
        experienceLevel: 'Entry Level',
        salaryMin: '',
        salaryMax: '',
        currency: 'INR',
        description: '',
        skills: [],
        requirements: [],
        benefits: [],
        employer: '',
        jobRequestId: '',
    });

    const [recruiterCategories, setRecruiterCategories] = useState([]);

    useEffect(() => {
        const fetchMyCategories = async () => {
            try {
                const res = await listCategories();
                if (res.success) setRecruiterCategories(res.data.categories || []);
            } catch (error) {
                console.error('Failed to load restricted categories');
            }
        };
        fetchMyCategories();
    }, []);

    useEffect(() => {
        if (!requestId) return;

        const loadJobRequest = async () => {
            try {
                const res = await getJobRequestById(requestId);
                if (res.success && res.data) {
                    const req = res.data.jobRequest;
                    setFormData({
                        title: req.jobTitle || '',
                        category: req.jobCategory || '',
                        company: req.companyId ? req.companyId.companyName : '',
                        location: req.jobLocation || '',
                        workType: req.workType || 'Onsite',
                        experienceLevel: req.experienceRequired || 'Entry Level',
                        salaryMin: req.salaryMin || '',
                        salaryMax: req.salaryMax || '',
                        currency: req.currency || 'INR',
                        description: req.jobDescription || '',
                        skills: req.requiredSkills || [],
                        requirements: [],
                        benefits: [],
                        employer: req.companyId ? req.companyId._id : '',
                        jobRequestId: req._id,
                    });
                }
            } catch (error) {
                toast.error('Failed to load job request details');
            } finally {
                setLoading(false);
            }
        };

        loadJobRequest();
    }, [requestId]);

    const handleChange = (field, value) => {
        if (field === 'category') {
            setFormData(prev => ({ ...prev, [field]: value, title: '' }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleAddArrayItem = (e, inputState, setInputState, field) => {
        if ((e.key === 'Enter' || e.key === ',') && inputState.trim()) {
            e.preventDefault();
            const newItem = inputState.trim();
            if (!formData[field].includes(newItem)) {
                setFormData(prev => ({ ...prev, [field]: [...prev[field], newItem] }));
            }
            setInputState('');
        }
    };

    const handleRemoveArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.category.trim()) return toast.error('Category is required');
        if (!formData.title.trim()) return toast.error('Job title is required');
        if (!formData.company.trim()) return toast.error('Company name is required');
        if (!formData.location.trim()) return toast.error('Location is required');
        if (!formData.description.trim()) return toast.error('Description is required');

        const payload = {
            ...formData,
            requiredSkills: formData.skills,
            vacancies: formData.vacancies || 1,
            urgency: formData.urgency || 'Medium',
            companyId: formData.employer
        };
        if (payload.salaryMin && payload.salaryMax) {
            payload.salaryMin = Number(payload.salaryMin);
            payload.salaryMax = Number(payload.salaryMax);
        }

        if (!payload.employer) delete payload.employer;
        if (!payload.jobRequestId) delete payload.jobRequestId;

        setIsSubmitting(true);
        try {
            await createJob(payload);
            toast.success('Job created successfully and visible to candidates!');
            navigate('/recruiter/manage-jobs');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all";
    const labelCls = "block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 px-1";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-500 animate-pulse">Fetching details...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <HiOutlineBriefcase className="w-6 h-6 text-blue-600" />
                        {requestId ? 'Create Job from Request' : 'Add New Job'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Publish a job opportunity to the candidate portal</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <HiOutlineBriefcase className="w-5 h-5" />
                        </div>
                        <h3 className="text-[15px] font-bold text-slate-800">Job Information</h3>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Job Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                    className={`${inputCls} appearance-none cursor-pointer`}
                                    disabled={!!requestId}
                                >
                                    <option value="">Select Category</option>
                                    {Array.isArray(recruiterCategories) && recruiterCategories.map(cat => (
                                        <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Job Title *</label>
                                {requestId ? (
                                    <input type="text" value={formData.title} readOnly className={`${inputCls} bg-slate-50 opacity-70`} />
                                ) : (
                                    <select
                                        value={formData.title}
                                        onChange={e => handleChange('title', e.target.value)}
                                        className={`${inputCls} appearance-none cursor-pointer`}
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select Job Title</option>
                                        {formData.category && recruiterCategories.find(c => c.categoryName === formData.category)?.selectedJobTitles?.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className={labelCls}>Company Name *</label>
                                <input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputCls} placeholder="e.g. Meta Inc." />
                            </div>
                            <div>
                                <label className={labelCls}>Job Location *</label>
                                <input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} className={inputCls} placeholder="e.g. Surat, Gujarat" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className={labelCls}>Work Type</label>
                                <select value={formData.workType} onChange={e => handleChange('workType', e.target.value)} className={`${inputCls} appearance-none`}>
                                    {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Experience</label>
                                <select value={formData.experienceLevel} onChange={e => handleChange('experienceLevel', e.target.value)} className={`${inputCls} appearance-none`}>
                                    {EXPERIENCE_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/3">
                                    <label className={labelCls}>Currency</label>
                                    <select value={formData.currency} onChange={e => handleChange('currency', e.target.value)} className={`${inputCls} px-2 appearance-none`}>
                                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="w-2/3">
                                    <label className={labelCls}>Salary Range</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={formData.salaryMin} onChange={e => handleChange('salaryMin', e.target.value)} className={`${inputCls} px-3`} placeholder="Min" />
                                        <span className="text-slate-400">-</span>
                                        <input type="number" value={formData.salaryMax} onChange={e => handleChange('salaryMax', e.target.value)} className={`${inputCls} px-3`} placeholder="Max" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requirements & Skills */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                            <HiOutlinePlusCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-[15px] font-bold text-slate-800">Skills & Requirements</h3>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <label className={labelCls}>Required Skills *</label>
                            <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[56px] focus-within:ring-4 focus-within:ring-primary-50 focus-within:border-primary-500 transition-all">
                                {formData.skills.map((item, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-100">
                                        {item}
                                        <button type="button" onClick={() => handleRemoveArrayItem('skills', i)} className="hover:text-red-500 transition-colors">
                                            <HiOutlineXMark className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => handleAddArrayItem(e, skillInput, setSkillInput, 'skills')}
                                    className="flex-1 min-w-[200px] outline-none text-sm bg-transparent"
                                    placeholder="Type skill & press Enter"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Professional Requirements</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[56px] focus-within:ring-4 focus-within:ring-amber-50 focus-within:border-amber-500 transition-all">
                                    {formData.requirements.map((item, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg border border-amber-100">
                                            {item}
                                            <button type="button" onClick={() => handleRemoveArrayItem('requirements', i)} className="hover:text-red-500 transition-colors">
                                                <HiOutlineXMark className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={requirementInput}
                                        onChange={e => setRequirementInput(e.target.value)}
                                        onKeyDown={e => handleAddArrayItem(e, requirementInput, setRequirementInput, 'requirements')}
                                        className="flex-1 min-w-[200px] outline-none text-sm bg-transparent"
                                        placeholder="Add requirements..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Job Benefits</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[56px] focus-within:ring-4 focus-within:ring-emerald-50 focus-within:border-emerald-500 transition-all">
                                    {formData.benefits.map((item, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-100">
                                            {item}
                                            <button type="button" onClick={() => handleRemoveArrayItem('benefits', i)} className="hover:text-red-500 transition-colors">
                                                <HiOutlineXMark className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={benefitInput}
                                        onChange={e => setBenefitInput(e.target.value)}
                                        onKeyDown={e => handleAddArrayItem(e, benefitInput, setBenefitInput, 'benefits')}
                                        className="flex-1 min-w-[200px] outline-none text-sm bg-transparent"
                                        placeholder="Add benefits..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            <HiOutlineDocumentText className="w-5 h-5" />
                        </div>
                        <h3 className="text-[15px] font-bold text-slate-800">Job Description</h3>
                    </div>
                    <div className="p-6 md:p-8">
                        <label className={labelCls}>Detailed Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={e => handleChange('description', e.target.value)}
                            rows="8"
                            className={`${inputCls} resize-none focus:ring-purple-100 focus:border-purple-500`}
                            placeholder="Describe the roles, responsibilities, and qualifications..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pb-10">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border border-slate-200 font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <HiOutlineCheckCircle className="w-5 h-5" />
                                Publish Job
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddJob;
