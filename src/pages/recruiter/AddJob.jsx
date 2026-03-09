import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getJobRequestById, createJob } from '../../api/recruiter.api';
import toast from 'react-hot-toast';
import {
    HiOutlineBriefcase,
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineXMark,
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

    useEffect(() => {
        if (!requestId) return;

        const loadJobRequest = async () => {
            try {
                const res = await getJobRequestById(requestId);
                if (res.success && res.data) {
                    const req = res.data.jobRequest;
                    setFormData({
                        title: req.jobTitle || '',
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
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none";
    const labelCls = "block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2";

    if (loading) {
        return <div className="p-8 text-center text-dark-500">Loading details...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-dark-200 text-dark-500 hover:bg-dark-50 transition-colors"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                        <HiOutlineBriefcase className="w-6 h-6 text-primary-500" />
                        {requestId ? 'Create Job from Request' : 'Add New Job'}
                    </h2>
                    <p className="text-sm text-dark-500 mt-0.5">Publish a job opportunity to the candidate portal</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="card p-6 md:p-8">
                    <h3 className="text-base font-bold text-dark-800 mb-6">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelCls}>Job Title *</label>
                            <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputCls} placeholder="e.g. Senior Frontend Developer" />
                        </div>
                        <div>
                            <label className={labelCls}>Company Name *</label>
                            <input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputCls} placeholder="e.g. Meta Inc." />
                        </div>
                        <div>
                            <label className={labelCls}>Location *</label>
                            <input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} className={inputCls} placeholder="e.g. Global Remote" />
                        </div>
                        <div>
                            <label className={labelCls}>Work Type</label>
                            <select value={formData.workType} onChange={e => handleChange('workType', e.target.value)} className={`${inputCls} appearance-none`}>
                                {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Experience Level</label>
                            <select value={formData.experienceLevel} onChange={e => handleChange('experienceLevel', e.target.value)} className={`${inputCls} appearance-none`}>
                                {EXPERIENCE_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Currency</label>
                            <select value={formData.currency} onChange={e => handleChange('currency', e.target.value)} className={`${inputCls} appearance-none`}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Min Salary</label>
                            <input type="number" value={formData.salaryMin} onChange={e => handleChange('salaryMin', e.target.value)} className={inputCls} placeholder="e.g. 50000" />
                        </div>
                        <div>
                            <label className={labelCls}>Max Salary</label>
                            <input type="number" value={formData.salaryMax} onChange={e => handleChange('salaryMax', e.target.value)} className={inputCls} placeholder="e.g. 90000" />
                        </div>
                    </div>
                </div>

                {/* Arrays: Skills, Req, Benefits */}
                <div className="card p-6 md:p-8 space-y-6">
                    <div>
                        <label className={labelCls}>Skills *</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[56px]">
                            {formData.skills.map((item, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 font-semibold text-xs rounded-lg border border-primary-100">
                                    {item}
                                    <button type="button" onClick={() => handleRemoveArrayItem('skills', i)}><HiOutlineXMark /></button>
                                </span>
                            ))}
                            <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => handleAddArrayItem(e, skillInput, setSkillInput, 'skills')} className="flex-1 min-w-[120px] outline-none text-sm" placeholder="Type & press Enter" />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Requirements</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[56px]">
                            {formData.requirements.map((item, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-lg border border-amber-100">
                                    {item}
                                    <button type="button" onClick={() => handleRemoveArrayItem('requirements', i)}><HiOutlineXMark /></button>
                                </span>
                            ))}
                            <input type="text" value={requirementInput} onChange={e => setRequirementInput(e.target.value)} onKeyDown={e => handleAddArrayItem(e, requirementInput, setRequirementInput, 'requirements')} className="flex-1 min-w-[120px] outline-none text-sm" placeholder="Type & press Enter" />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Benefits</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[56px]">
                            {formData.benefits.map((item, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-success-50 text-success-700 font-semibold text-xs rounded-lg border border-success-100">
                                    {item}
                                    <button type="button" onClick={() => handleRemoveArrayItem('benefits', i)}><HiOutlineXMark /></button>
                                </span>
                            ))}
                            <input type="text" value={benefitInput} onChange={e => setBenefitInput(e.target.value)} onKeyDown={e => handleAddArrayItem(e, benefitInput, setBenefitInput, 'benefits')} className="flex-1 min-w-[120px] outline-none text-sm" placeholder="Type & press Enter" />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="card p-6 md:p-8">
                    <label className={labelCls}>Full Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={e => handleChange('description', e.target.value)}
                        rows="8"
                        className={`${inputCls} resize-none`}
                        placeholder="Write the full job description here..."
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-dark-200 font-bold text-dark-600 rounded-xl hover:bg-dark-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 transition-all disabled:opacity-50">
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        {isSubmitting ? 'Publishing...' : 'Publish Job'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddJob;
